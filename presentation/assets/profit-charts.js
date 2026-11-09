(() => {
  const dataEl = document.querySelector('#monthly-profit-data');
  if (!dataEl) return;
  let data;
  try { data = JSON.parse(dataEl.textContent); } catch { return; }
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
    return el;
  };
  const draw = (svg, type) => {
    if (!svg || !data.length) return;
    const W = 640, H = 210, left = 42, right = 10, top = 12, bottom = 32;
    const plotW = W - left - right, plotH = H - top - bottom;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const values = data.map(d => type === 'monthly' ? d.monthly : d.cumulative);
    const min = type === 'monthly' ? Math.min(-250, Math.floor(Math.min(...values) / 50) * 50) : Math.min(-1300, Math.floor(Math.min(...values) / 100) * 100);
    const max = type === 'monthly' ? Math.max(250, Math.ceil(Math.max(...values) / 50) * 50) : Math.max(500, Math.ceil(Math.max(...values) / 100) * 100);
    const y = v => top + (max - v) / (max - min) * plotH;
    const zeroY = y(0);
    for (const value of [max, 0, min]) {
      const yy = y(value);
      svg.append(make('line', {x1:left,y1:yy,x2:W-right,y2:yy,class:value===0?'chart-zero':'chart-grid'}));
      const label = make('text', {x:left-6,y:yy+4,'text-anchor':'end',class:'chart-axis'});
      label.textContent = Math.round(value);
      svg.append(label);
    }
    const step = plotW / data.length;
    if (type === 'monthly') {
      data.forEach((d,i) => {
        const v=d.monthly, yy=y(v), x=left+i*step+step*.18, height=Math.max(1,Math.abs(zeroY-yy));
        const rect=make('rect',{x,y:Math.min(zeroY,yy),width:step*.64,height,rx:2,class:v>=0?'chart-bar positive':'chart-bar negative'});
        const title=make('title');title.textContent=`${d.month}: ${v.toFixed(1)}万円`;rect.append(title);svg.append(rect);
      });
    } else {
      const points=data.map((d,i)=>`${left+i*step+step/2},${y(d.cumulative)}`).join(' ');
      svg.append(make('polyline',{points,fill:'none',class:'chart-line'}));
      data.forEach((d,i)=>{const circle=make('circle',{cx:left+i*step+step/2,cy:y(d.cumulative),r:3,class:'chart-dot'});const title=make('title');title.textContent=`${d.month}: ${d.cumulative.toFixed(1)}万円`;circle.append(title);svg.append(circle);});
    }
    const labelEvery = 3;
    data.forEach((d,i)=>{
      if(i % labelEvery !== 0 && i !== data.length-1) return;
      const label=make('text',{x:left+i*step+step/2,y:H-8,'text-anchor':'middle',class:'chart-month'});
      label.textContent=d.month;svg.append(label);
    });
  };
  document.querySelectorAll('.profit-monthly-chart').forEach(svg=>draw(svg,'monthly'));
  document.querySelectorAll('.profit-cumulative-chart').forEach(svg=>draw(svg,'cumulative'));
})();
