/* ===== Έπιπλα κουζίνας · case study λευκής κουζίνας Gola (vanilla, no deps) ===== */
(function(){
  var cs=document.querySelector('.cs'); if(!cs) return;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var PIN=matchMedia('(min-width:1024px) and (prefers-reduced-motion: no-preference)');
  var IMG=window.CS_IMG||'', SHOTS=(window.CS_SHOTS||[]);
  if(!RM) cs.classList.add('cs--motion');
  function clamp(v,a,b){return v<a?a:v>b?b:v}
  function now(){return performance.now()}
  function typing(t){ return t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)&&t.type!=='range'); }
  var lb=document.querySelector('[data-lb-root]');
  function lbOpen(){ return lb&&!lb.hidden; }

  /* --- title split --- */
  [].forEach.call(cs.querySelectorAll('[data-split]'),function(el){
    var words=el.textContent.trim().split(/\s+/); el.setAttribute('aria-label',el.textContent.trim());
    el.innerHTML=words.map(function(w,i){return '<span class="w" aria-hidden="true"><span class="wi" style="--i:'+i+'">'+w+'</span></span>'}).join(' ');
  });

  /* --- intro --- */
  var intro=cs.querySelector('[data-cs-intro]'), media=intro&&intro.querySelector('.cs-intro__media');
  if(intro){
    if(RM||!('IntersectionObserver' in window)) intro.classList.add('is-in');
    else new IntersectionObserver(function(es,o){es.forEach(function(e){ if(e.isIntersecting){ intro.classList.add('is-in'); o.disconnect(); }})},{threshold:.35}).observe(intro);
  }

  /* ================= STORY ================= */
  var story=cs.querySelector('.cs-story'), chs=[].slice.call(cs.querySelectorAll('.cs-ch')), shots=[].slice.call(cs.querySelectorAll('.cs-shot'));
  var dots=[].slice.call(cs.querySelectorAll('.cs-dots [data-go]'));
  var num=cs.querySelector('[data-cs-num]'), fill=cs.querySelector('[data-cs-fill]'), active=0, N=chs.length;
  function setActive(i){
    if(i===active) return;
    shots.forEach(function(s,k){ s.classList.toggle('is-prev',k===active); s.classList.toggle('is-active',k===i); if(k!==active&&k!==i) s.classList.remove('is-prev'); });
    chs.forEach(function(c,k){ c.classList.toggle('is-active',k===i); });
    dots.forEach(function(d,k){ if(k===i) d.setAttribute('aria-current','step'); else d.removeAttribute('aria-current'); });
    active=i; if(num) num.textContent=('0'+(i+1)).slice(-2);
    clearTimeout(setActive.t); setActive.t=setTimeout(function(){ shots.forEach(function(s,k){ if(k!==active) s.classList.remove('is-prev'); }); },1300);
    [i-1,i+1].forEach(function(k){ var s=shots[k], im=s&&s.querySelector('img'); if(im&&im.loading==='lazy'){ im.loading='eager'; } });
  }
  // preload every stage photo before the story is reached, so no image pops in during a crossfade
  if(story&&'IntersectionObserver' in window){ new IntersectionObserver(function(es,o){ es.forEach(function(e){ if(!e.isIntersecting) return; o.disconnect();
    shots.forEach(function(s){ var im=s.querySelector('img'); if(!im) return; im.loading='eager'; if(im.decode) im.decode().catch(function(){}); }); }); },{rootMargin:'150% 0px'}).observe(story); }
  // stacked mode: reveal once + active by viewport centre
  if('IntersectionObserver' in window){
    var seen=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-seen'); seen.unobserve(e.target);} }); },{threshold:.15});
    chs.forEach(function(c){ seen.observe(c); });
    var io=new IntersectionObserver(function(es){ if(PIN.matches) return; es.forEach(function(e){ if(e.isIntersecting) setActive(+e.target.dataset.ch); }); },{rootMargin:'-45% 0px -45% 0px'});
    chs.forEach(function(c){ io.observe(c); });
  } else chs.forEach(function(c){c.classList.add('is-seen')});

  // geometry of the pinned story (desktop): chapter i is "in place" when scrollY == Y(i)
  function TOP(){ return parseFloat(getComputedStyle(cs).getPropertyValue('--cs-top'))||0; }
  function H(){ return innerHeight-TOP(); }
  function Y(i){ return story.getBoundingClientRect().top+scrollY-TOP()+i*H(); }

  var anim=null, quietUntil=0, lastWheelT=0, lastWheelAbs=0, quietTimer=0;
  function ease(t){ return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
  function go(i,fast){
    i=clamp(i,0,N-1); setActive(i);
    var y0=scrollY, y1=Math.round(Y(i)), D=(RM||fast)?0:Math.min(950,520+Math.abs(y1-y0)*.35), t0=now();
    var html=document.documentElement, prevSB=html.style.scrollBehavior; html.style.scrollBehavior='auto';
    if(anim) cancelAnimationFrame(anim.raf);
    anim={};
    (function step(){ var k=D?Math.min((now()-t0)/D,1):1; scrollTo(0,y0+(y1-y0)*ease(k));
      if(k<1) anim.raf=requestAnimationFrame(step); else { anim=null; html.style.scrollBehavior=prevSB; quietUntil=now()+180; } })();
  }
  function inStory(s){ var h=H(); return s>=Y(0)-h*.6 && s<=Y(N-1)+h*.6; }
  // returns true if the gesture was consumed (one gesture = one chapter)
  function stepDir(dir){
    var s=scrollY, y0=Y(0), yN=Y(N-1), h=H();
    if(!inStory(s)) return false;
    if(dir>0){
      if(s<y0-3){ go(0); return true; }                 // entering from above
      if(s>=yN-3) return false;                          // last chapter: release, page continues
      var c=Math.floor((s-y0)/h+.02); go(c+1); return true;
    } else {
      if(s>yN+3){ go(N-1); return true; }               // entering from below
      if(s<=y0+3) return false;                          // first chapter: release
      var c2=Math.ceil((s-y0)/h-.02); go(c2-1); return true;
    }
  }
  if(story&&N){
    addEventListener('wheel',function(e){
      if(!PIN.matches||lbOpen()||e.ctrlKey) return;
      var dy=e.deltaMode===1?e.deltaY*16:e.deltaY; if(Math.abs(dy)<1||Math.abs(e.deltaX)>Math.abs(dy)) return;
      var t=now(), abs=Math.abs(dy), gap=t-lastWheelT;
      // a new gesture = after a quiet gap, or a clear re-acceleration during trackpad inertia
      var fresh=gap>170||(abs>lastWheelAbs*1.8&&abs>24&&gap>40);
      lastWheelT=t; lastWheelAbs=abs;
      if(anim||t<quietUntil||!fresh){ if(inStory(scrollY)&&(anim||t<quietUntil+400)){ e.preventDefault(); if(!anim) quietUntil=Math.max(quietUntil,t+120); } return; }
      if(stepDir(dy>0?1:-1)) e.preventDefault();
    },{passive:false});
    addEventListener('keydown',function(e){
      if(!PIN.matches||lbOpen()||e.altKey||e.ctrlKey||e.metaKey||typing(e.target)) return;
      if(e.target.closest&&e.target.closest('.cs-hs,.cs-pair,.cs-film')) return;
      var k=e.key, dir=0;
      if(k==='ArrowDown'||k==='PageDown'||(k===' '&&!e.shiftKey)) dir=1; else if(k==='ArrowUp'||k==='PageUp'||(k===' '&&e.shiftKey)) dir=-1;
      if(!dir) return;
      if(anim){ e.preventDefault(); return; }
      if(stepDir(dir)) e.preventDefault();
    });
    dots.forEach(function(d){ d.addEventListener('click',function(){ go(+d.dataset.go); }); });
    // the scroll cue lands on chapter 1 exactly
    var cue=cs.querySelector('.cs-cue'); if(cue) cue.addEventListener('click',function(e){ if(PIN.matches){ e.preventDefault(); go(0); } });
  }

  /* --- one passive scroll loop: intro scale-only + story progress/active --- */
  var ticking=false;
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(frame);} }
  function frame(){
    ticking=false; var vh=innerHeight;
    if(media&&!RM){ var r=intro.getBoundingClientRect(); if(r.bottom>0&&r.top<vh){ media.style.setProperty('--ps',(1+clamp(-r.top/r.height,0,1)*.07).toFixed(4)); } }
    if(PIN.matches&&story){ var y0=Y(0), h=H(), p=clamp((scrollY-y0)/((N-1)*h),0,1);
      if(fill) fill.parentNode.style.setProperty('--sp',p.toFixed(4));
      if(!anim) setActive(clamp(Math.round((scrollY-y0)/h),0,N-1)); }
  }
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll); frame();

  /* ================= HOTSPOTS: zoom-to-detail ================= */
  var hs=cs.querySelector('[data-hs]');
  if(hs){
    var frameEl=hs.querySelector('[data-hs-frame]'), zoom=hs.querySelector('[data-hs-zoom]'), main=hs.querySelector('[data-hs-main]');
    var card=hs.querySelector('.cs-card'), hdots=[].slice.call(hs.querySelectorAll('.cs-dot')), cur=-1, bigReq=false, cardT=0;
    var alts={}; [].forEach.call(hs.querySelectorAll('.cs-hs__alt'),function(a){ alts[a.dataset.alt]=a; });
    function loadBig(){ if(bigReq) return; bigReq=true; var im=new Image(); im.decoding='async'; im.onload=function(){ main.sizes=Math.round(frameEl.clientWidth*3.2)+'px'; }; im.src=main.dataset.zoomSrc; }
    function loadAlt(a){ if(a.dataset.src){ a.srcset=a.dataset.srcset; a.src=a.dataset.src; delete a.dataset.src; } a.hidden=false; }
    function openHs(i,focusCard){
      i=(i+hdots.length)%hdots.length; var d=hdots[i], x=+d.dataset.x, y=+d.dataset.y, z=+d.dataset.z;
      hdots.forEach(function(b,k){ b.setAttribute('aria-expanded',k===i?'true':'false'); });
      loadBig();
      var prevAlt=cur>=0&&hdots[cur].dataset.alt; cur=i;
      Object.keys(alts).forEach(function(k){ if(k!==d.dataset.alt) alts[k].classList.remove('is-on'); });
      hs.classList.remove('is-alt');
      zoom.style.setProperty('--ox',x+'%'); zoom.style.setProperty('--oy',y+'%'); zoom.style.transform='scale('+z+')';
      frameEl.style.setProperty('--vx',x+'%'); frameEl.style.setProperty('--vy',y+'%');
      hs.classList.add('is-zoom');
      var fr=frameEl.getBoundingClientRect(), topOff=TOP()+8; if(fr.top<topOff||fr.bottom>innerHeight-8){ var want=scrollY+fr.top-Math.max(topOff,(innerHeight-fr.height)/2); if(innerWidth<=700) want=scrollY+fr.top-topOff-8; scrollTo({top:want,behavior:RM?'auto':'smooth'}); }
      if(d.dataset.alt){ var a=alts[d.dataset.alt]; loadAlt(a); a.style.setProperty('--ax',d.dataset.ax+'%'); a.style.setProperty('--ay',d.dataset.ay+'%'); a.style.setProperty('--az',d.dataset.az);
        var on=function(){ requestAnimationFrame(function(){ if(cur!==i) return; a.classList.add('is-on'); hs.classList.add('is-alt'); }); };
        if(a.complete&&a.naturalWidth) on(); else a.onload=on; }
      card.querySelector('strong').textContent=d.dataset.t; card.querySelector('.cs-card__d').textContent=d.dataset.d;
      card.querySelector('[data-hs-n]').textContent=('0'+(i+1)).slice(-2);
      card.classList.toggle('is-left',x>50); card.hidden=false; clearTimeout(cardT);
      requestAnimationFrame(function(){ card.classList.add('is-in'); });
      if(focusCard) card.querySelector('[data-hs-close]').focus({preventScroll:true});
    }
    function closeHs(){
      if(cur<0) return; var d=hdots[cur]; cur=-1;
      hdots.forEach(function(b){ b.setAttribute('aria-expanded','false'); });
      Object.keys(alts).forEach(function(k){ alts[k].classList.remove('is-on'); });
      hs.classList.remove('is-alt','is-zoom'); zoom.style.transform='scale(1)';
      card.classList.remove('is-in'); cardT=setTimeout(function(){ card.hidden=true; },RM?0:350);
      return d;
    }
    hs.addEventListener('click',function(e){
      var d=e.target.closest('.cs-dot'); if(d){ e.stopPropagation(); openHs(hdots.indexOf(d),e.detail===0); return; }
      var st=e.target.closest('[data-hs-step]'); if(st){ openHs(cur+(+st.dataset.hsStep)); return; }
      if(e.target.closest('[data-hs-close]')){ var b=closeHs(); b&&b.focus({preventScroll:true}); return; }
      if(cur>=0&&!e.target.closest('.cs-card')) closeHs();   // click on the zoomed photo = zoom out
    });
    document.addEventListener('click',function(e){ if(cur>=0&&!hs.contains(e.target)) closeHs(); });
    document.addEventListener('keydown',function(e){
      if(cur<0||lbOpen()) return;
      if(e.key==='Escape'){ var b=closeHs(); b&&b.focus({preventScroll:true}); }
      else if(e.key==='ArrowRight'){ e.preventDefault(); openHs(cur+1); } else if(e.key==='ArrowLeft'){ e.preventDefault(); openHs(cur-1); }
    });
  }

  /* --- filmstrip --- */
  var film=cs.querySelector('[data-film-track]'), dragMoved=false;
  if(film){
    [].forEach.call(cs.querySelectorAll('[data-film]'),function(b){ b.addEventListener('click',function(){ film.scrollBy({left:(+b.dataset.film)*film.clientWidth*.75,behavior:RM?'auto':'smooth'}); }); });
    var sx=0, sl=0, down=false;
    film.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'||e.button!==0) return; down=true; dragMoved=false; sx=e.clientX; sl=film.scrollLeft; });
    addEventListener('pointermove',function(e){ if(!down) return; var dx=e.clientX-sx; if(!dragMoved&&Math.abs(dx)>6){ dragMoved=true; film.classList.add('is-drag'); } if(dragMoved){ film.scrollLeft=sl-dx; e.preventDefault(); } });
    addEventListener('pointerup',function(){ if(!down) return; down=false; if(dragMoved){ var x=film.scrollLeft; film.classList.remove('is-drag'); film.scrollLeft=x; setTimeout(function(){dragMoved=false},0);} });
  }

  /* --- lightbox --- */
  var lbImg=lb.querySelector('img'), lbI=0, lastFocus=null, sx2=0;
  var BIG=(innerWidth*(devicePixelRatio||1))>1700?'2400':'1600';
  function srcOf(s){ return IMG+s.k+'-'+BIG+'.webp'; }
  function show(i,first){
    lbI=(i+SHOTS.length)%SHOTS.length; var s=SHOTS[lbI];
    function apply(){ lbImg.src=srcOf(s); lbImg.alt=s.alt; lb.querySelector('.cs-lb__count').textContent=('0'+(lbI+1)).slice(-2)+' / '+('0'+SHOTS.length).slice(-2); lb.querySelector('.cs-lb__cap').textContent=s.cap; }
    if(first||RM){ apply(); } else { lbImg.classList.add('is-swap'); setTimeout(function(){ apply(); lbImg.onload=function(){ lbImg.classList.remove('is-swap'); }; if(lbImg.complete) lbImg.classList.remove('is-swap'); },180); }
    [1,-1].forEach(function(d){ var n=new Image(); n.src=srcOf(SHOTS[(lbI+d+SHOTS.length)%SHOTS.length]); });
  }
  function open(i){
    lastFocus=document.activeElement; var sb=innerWidth-document.documentElement.clientWidth;
    document.documentElement.classList.add('cs-lock'); document.documentElement.style.paddingRight=sb?sb+'px':'';
    lb.hidden=false; show(i,true); requestAnimationFrame(function(){ lb.classList.add('is-open'); }); lb.querySelector('.cs-lb__close').focus();
  }
  function close(){ lb.classList.remove('is-open'); setTimeout(function(){ lb.hidden=true; },RM?0:300); document.documentElement.classList.remove('cs-lock'); document.documentElement.style.paddingRight=''; lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true}); }
  cs.addEventListener('click',function(e){ var t=e.target.closest('[data-lb]'); if(!t||dragMoved) return; e.preventDefault(); open(+t.dataset.lb); });
  cs.addEventListener('keydown',function(e){ var t=e.target.closest('figure[data-lb]'); if(t&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); open(+t.dataset.lb);} });
  [].forEach.call(cs.querySelectorAll('figure[data-lb]'),function(f){ f.setAttribute('tabindex','0'); f.setAttribute('role','button'); f.setAttribute('aria-label','Μεγέθυνση φωτογραφίας'); });
  lb.querySelector('.cs-lb__close').onclick=close;
  lb.querySelector('.cs-lb__prev').onclick=function(){show(lbI-1)};
  lb.querySelector('.cs-lb__next').onclick=function(){show(lbI+1)};
  lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
  document.addEventListener('keydown',function(e){
    if(lb.hidden) return;
    if(e.key==='Escape') close(); else if(e.key==='ArrowLeft') show(lbI-1); else if(e.key==='ArrowRight') show(lbI+1);
    else if(e.key==='Tab'){ var f=[].slice.call(lb.querySelectorAll('button')).filter(function(b){return b.offsetParent}); var a=f.indexOf(document.activeElement); e.preventDefault(); f[(a+(e.shiftKey?-1:1)+f.length)%f.length].focus(); }
  });
  lb.addEventListener('touchstart',function(e){ sx2=e.touches[0].clientX; },{passive:true});
  lb.addEventListener('touchend',function(e){ var dx=e.changedTouches[0].clientX-sx2; if(Math.abs(dx)>45) show(lbI+(dx<0?1:-1)); });
  var stg=cs.querySelector('[data-stage]'); if(stg){ stg.style.cursor='zoom-in'; stg.addEventListener('click',function(){ open((window.CS_CH||[])[active]||0); }); }

  /* --- CTA background: slow scale-only zoom on the hero photo, runs only while the band is on screen --- */
  var band=cs.querySelector('[data-cta-zoom]');
  if(band&&!RM&&'IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ band.classList.toggle('is-in',e.isIntersecting); }); },{threshold:0}).observe(band); }

  /* --- desktop niceties: cursor label + magnetic CTA --- */
  if(FINE&&!RM){
    var cur2=document.querySelector('.cs-cursor'), lab=cur2.querySelector('span'), tx=-200, ty=-200, cx=-200, cy=-200, on=false, raf=0;
    function loop(){ cx+=(tx-cx)*.22; cy+=(ty-cy)*.22; cur2.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0)'; if(on||Math.abs(tx-cx)>.5) raf=requestAnimationFrame(loop); else raf=0; }
    document.addEventListener('pointermove',function(e){
      if(e.pointerType!=='mouse') return; tx=e.clientX; ty=e.clientY;
      var t=e.target.closest&&e.target.closest('.cs [data-cursor], .cs [data-lb]');
      var want=!!t && lb.hidden; if(want){ lab.textContent=t.dataset.cursor||'Προβολή'; if(!on){ cx=tx; cy=ty; } }
      if(want!==on){ on=want; cur2.classList.toggle('is-on',on); }
      if(!raf) raf=requestAnimationFrame(loop);
    },{passive:true});
    // on scroll the element under the pointer changes without a pointermove: re-check so the pill never lingers
    addEventListener('scroll',function(){ if(!on) return; var el=document.elementFromPoint(tx,ty), t=el&&el.closest&&el.closest('.cs [data-cursor], .cs [data-lb]'); if(!t||!lb.hidden){ on=false; cur2.classList.remove('is-on'); } },{passive:true});
    [].forEach.call(cs.querySelectorAll('[data-magnetic]'),function(b){
      var sp=b.querySelector('span');
      b.addEventListener('pointermove',function(e){ var r=b.getBoundingClientRect(), dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
        b.style.transform='translate('+clamp(dx*.22,-10,10)+'px,'+clamp(dy*.35,-8,8)+'px)'; sp.style.transform='translate('+clamp(dx*.08,-4,4)+'px,'+clamp(dy*.12,-3,3)+'px)'; });
      b.addEventListener('pointerleave',function(){ b.style.transition='transform .5s cubic-bezier(.16,1,.3,1),background .25s,box-shadow .25s'; b.style.transform=''; sp.style.transform=''; setTimeout(function(){b.style.transition=''},500); });
    });
  }
})();
