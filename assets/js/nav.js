/* ===== Κεντρικό μενού: συρτάρι κινητού (focus trap, Esc, κλείδωμα scroll) + λίγο μικρότερη μπάρα στο scroll ===== */
(function(){
  var h=document.getElementById('sn'); if(!h) return;
  var root=document.documentElement;
  var ticking=false;
  function onScroll(){ if(ticking) return; ticking=true; requestAnimationFrame(function(){ ticking=false; h.classList.toggle('is-scrolled',(window.scrollY||window.pageYOffset)>12); }); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  var btn=h.querySelector('.sn__burger'), panel=document.getElementById('sn-menu'), overlay=h.querySelector('.sn__overlay'), closeBtn=h.querySelector('.sn__close');
  if(!btn||!panel) return;
  var mq=window.matchMedia('(max-width:959px)');
  var lockY=0;
  function isOpen(){ return h.classList.contains('is-open'); }
  function focusables(){ return [].slice.call(panel.querySelectorAll('a[href],button:not([disabled])')); }
  function open(){
    h.classList.add('is-open'); btn.setAttribute('aria-expanded','true');
    lockY=window.scrollY||window.pageYOffset||0;
    panel.removeAttribute('aria-hidden'); root.classList.add('sn-lock');
    var bs=document.body.style; bs.position='fixed'; bs.top=(-lockY)+'px'; bs.left='0'; bs.right='0'; bs.width='100%'; /* κλείδωμα scroll και σε iOS */
    panel.scrollTop=0;
    setTimeout(function(){ (closeBtn||focusables()[0]).focus({preventScroll:true}); },40);
  }
  function close(refocus){
    if(!isOpen()) return;
    h.classList.remove('is-open'); btn.setAttribute('aria-expanded','false');
    panel.setAttribute('aria-hidden','true'); root.classList.remove('sn-lock');
    var bs=document.body.style; bs.position=bs.top=bs.left=bs.right=bs.width='';
    try{ window.scrollTo({top:lockY,left:0,behavior:'instant'}); }catch(_){ window.scrollTo(0,lockY); } /* επιστροφή στην ίδια θέση */
    if(refocus) btn.focus({preventScroll:true});
  }
  btn.addEventListener('click',function(){ isOpen()?close(true):open(); });
  if(closeBtn) closeBtn.addEventListener('click',function(){ close(true); });
  if(overlay) overlay.addEventListener('click',function(){ close(true); });
  panel.addEventListener('click',function(e){ if(e.target.closest('a[href]')) close(false); });
  document.addEventListener('keydown',function(e){
    if(!isOpen()) return;
    if(e.key==='Escape'||e.key==='Esc'){ e.preventDefault(); close(true); return; }
    if(e.key==='Tab'){
      var f=focusables(); if(!f.length) return;
      var i=f.indexOf(document.activeElement);
      if(e.shiftKey && i<=0){ e.preventDefault(); f[f.length-1].focus({preventScroll:true}); }
      else if(!e.shiftKey && (i===f.length-1||i<0)){ e.preventDefault(); f[0].focus({preventScroll:true}); }
    }
  });
  var onMq=function(){ if(!mq.matches) close(false); };
  if(mq.addEventListener) mq.addEventListener('change',onMq); else if(mq.addListener) mq.addListener(onMq);
})();
