/* ===== Κεντρικό μενού: hamburger, focus trap, Esc, κλείδωμα scroll ===== */
(function(){
  var h=document.getElementById('sn'); if(!h) return;
  var btn=h.querySelector('.sn__burger'), menu=document.getElementById('sn-menu'), scrim=h.querySelector('.sn__scrim');
  if(!btn||!menu) return;
  var mq=window.matchMedia('(max-width:1080px)'), root=document.documentElement;
  function isOpen(){ return h.classList.contains('is-open'); }
  function focusables(){ return [btn].concat([].slice.call(menu.querySelectorAll('a[href],button:not([disabled])'))); }
  function open(){
    h.classList.add('is-open'); btn.setAttribute('aria-expanded','true'); btn.setAttribute('aria-label','Κλείσιμο μενού');
    root.classList.add('sn-lock');
    var first=menu.querySelector('a[href]'); if(first) setTimeout(function(){ first.focus(); },30);
  }
  function close(refocus){
    if(!isOpen()) return;
    h.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-label','Άνοιγμα μενού');
    root.classList.remove('sn-lock');
    if(refocus) btn.focus();
  }
  btn.addEventListener('click',function(){ isOpen()?close(true):open(); });
  if(scrim) scrim.addEventListener('click',function(){ close(false); });
  menu.addEventListener('click',function(e){ if(e.target.closest('a')) close(false); });
  document.addEventListener('keydown',function(e){
    if(!isOpen()) return;
    if(e.key==='Escape'||e.key==='Esc'){ e.preventDefault(); close(true); return; }
    if(e.key==='Tab'){
      var f=focusables(), i=f.indexOf(document.activeElement);
      if(e.shiftKey && (i<=0)){ e.preventDefault(); f[f.length-1].focus(); }
      else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus(); }
      else if(i<0){ e.preventDefault(); f[0].focus(); }
    }
  });
  var onMq=function(){ if(!mq.matches) close(false); };
  if(mq.addEventListener) mq.addEventListener('change',onMq); else if(mq.addListener) mq.addListener(onMq);
})();
