
(()=>{'use strict';
const root=document.documentElement;root.classList.remove('no-js');root.classList.add('js-enabled');
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const menu=$('#menu-dialog'),lightbox=$('#image-dialog');
function openDialog(d){if(!d)return;if(typeof d.showModal==='function'){d.showModal();document.body.style.overflow='hidden';}}
function closeDialog(d){if(d?.open)d.close();document.body.style.overflow='';}
$('.menu-button')?.addEventListener('click',()=>openDialog(menu));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(document.getElementById(b.dataset.close))));
[menu,lightbox].forEach(d=>{d?.addEventListener('close',()=>{document.body.style.overflow='';});d?.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);}})});
$$('.menu-list a').forEach(a=>a.addEventListener('click',()=>closeDialog(menu)));
$('.size-button')?.addEventListener('click',e=>{const b=e.currentTarget,on=!document.body.classList.contains('large');document.body.classList.toggle('large',on);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'文字を標準サイズに戻す':'文字を大きくする');});
$$('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{const original=$('img',b),target=$('#lightbox-image');target.src=original.currentSrc||original.src;target.alt=original.alt;openDialog(lightbox);}));
function setCase(id,focus=false){$$('.tab').forEach(b=>{const on=b.dataset.select===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();});$$('.scenario-panel').forEach(p=>{const on=p.id==='panel-'+id;p.classList.toggle('active',on);p.hidden=!on;});$$('.curve').forEach(p=>p.classList.toggle('inactive',p.dataset.case!==id));$$('.chart-marker').forEach(p=>p.style.opacity=p.dataset.case===id?'1':'.75');}
$$('.tab').forEach(b=>{b.addEventListener('click',()=>setCase(b.dataset.select));b.addEventListener('keydown',e=>{const tabs=$$('.tab'),i=tabs.indexOf(b);let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();setCase(tabs[n].dataset.select,true);});});
setCase('target');
let scheduled=false;const sections=$$('main section[data-chapter]');
function update(){scheduled=false;const total=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.width=(total>0?Math.max(0,Math.min(100,scrollY/total*100)):0)+'%';let chapter='product';for(const s of sections){if(s.getBoundingClientRect().top<innerHeight*.38)chapter=s.dataset.chapter;}$$('.dock a').forEach(a=>{const active=a.dataset.nav===chapter;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}}, {passive:true});addEventListener('resize',update);update();
addEventListener('beforeprint',()=>{$$('.scenario-panel').forEach(p=>p.hidden=false);});addEventListener('afterprint',()=>setCase($('.tab[aria-selected=true]')?.dataset.select||'target'));
})();
