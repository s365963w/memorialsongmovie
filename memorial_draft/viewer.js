(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const status = byId('status');
  const pages = byId('pages');
  const select = byId('page-select');
  const previous = byId('previous');
  const next = byId('next');
  let current = 1;
  let zoom = 1;
  let figures = [];
  let scheduled = false;
  let navigating = false;

  function measure() {
    document.documentElement.style.setProperty('--fit-width', `${Math.min(document.documentElement.clientWidth - 32, 1100)}px`);
    document.documentElement.style.setProperty('--header-height', `${byId('reader-header').offsetHeight}px`);
  }
  function updatePage(number) {
    current = number;
    select.value = String(number);
    previous.disabled = number === 1;
    next.disabled = number === figures.length;
  }
  function goTo(number) {
    if (number < 1 || number > figures.length) return;
    navigating = true;
    updatePage(number);
    const top = figures[number - 1].getBoundingClientRect().top + window.scrollY - byId('reader-header').offsetHeight - 14;
    window.scrollTo({top: Math.max(0, top), behavior: 'auto'});
    requestAnimationFrame(() => { updatePage(number); navigating = false; });
  }
  function changeZoom(value) {
    const page = current;
    zoom = Math.round(Math.max(0.75, Math.min(2.5, value)) * 100) / 100;
    document.documentElement.style.setProperty('--zoom', zoom);
    byId('zoom-value').value = `${Math.round(zoom * 100)}%`;
    byId('zoom-out').disabled = zoom <= 0.75;
    byId('zoom-in').disabled = zoom >= 2.5;
    requestAnimationFrame(() => goTo(page));
  }
  function trackScroll() {
    if (scheduled || navigating || !figures.length) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const top = byId('reader-header').getBoundingClientRect().bottom + 50;
      let number = 1;
      for (let i = 0; i < figures.length; i++) {
        if (figures[i].getBoundingClientRect().top <= top) number = i + 1;
        else break;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) number = figures.length;
      updatePage(number);
      scheduled = false;
    });
  }
  async function start() {
    try {
      const response = await fetch('documents.json?v=20261113-1');
      if (!response.ok) throw new Error('manifest');
      const documents = await response.json();
      const slug = new URLSearchParams(location.search).get('doc');
      if (!slug || !Object.prototype.hasOwnProperty.call(documents, slug)) {
        byId('document-title').textContent = '資料が見つかりません';
        status.textContent = '資料一覧に戻り、読みたい資料を選んでください。';
        return;
      }
      const doc = documents[slug];
      document.title = `${doc.title}｜TOWAUTA memorial`;
      byId('document-title').textContent = doc.title;
      byId('page-total').textContent = `/ ${doc.pages.length}`;
      doc.pages.forEach((page, index) => {
        const number = index + 1;
        const figure = document.createElement('figure');
        figure.className = 'sheet';
        figure.id = `page-${number}`;
        const image = document.createElement('img');
        image.src = page.image;
        image.width = page.width;
        image.height = page.height;
        image.alt = `${doc.title} ${number}ページ目`;
        image.loading = index === 0 ? 'eager' : 'lazy';
        image.decoding = 'async';
        if (index === 0) image.fetchPriority = 'high';
        image.addEventListener('error', () => {
          const error = document.createElement('p');
          error.className = 'image-error';
          error.textContent = 'このページを読み込めませんでした。通信状況を確認して再読み込みしてください。';
          image.replaceWith(error);
        });
        const caption = document.createElement('figcaption');
        caption.textContent = `${number} / ${doc.pages.length}`;
        figure.append(image, caption);
        if (page.text) {
          const transcript = document.createElement('div');
          transcript.className = 'sr-only';
          transcript.textContent = page.text;
          figure.append(transcript);
        }
        pages.append(figure);
        figures.push(figure);
        const option = document.createElement('option');
        option.value = number;
        option.textContent = number;
        select.append(option);
      });
      byId('toolbar').hidden = false;
      byId('reader-hint').hidden = false;
      byId('reader').hidden = false;
      status.hidden = true;
      measure();
      updatePage(1);
      previous.addEventListener('click', () => goTo(current - 1));
      next.addEventListener('click', () => goTo(current + 1));
      select.addEventListener('change', () => goTo(Number(select.value)));
      byId('zoom-in').addEventListener('click', () => changeZoom(zoom + 0.25));
      byId('zoom-out').addEventListener('click', () => changeZoom(zoom - 0.25));
      byId('fit').addEventListener('click', () => changeZoom(1));
      window.addEventListener('resize', measure);
      window.addEventListener('scroll', trackScroll, {passive: true});
    } catch (error) {
      byId('document-title').textContent = '資料を読み込めませんでした';
      status.textContent = '通信状況を確認して再読み込みしてください。資料一覧から開き直すこともできます。';
    }
  }
  start();
})();
