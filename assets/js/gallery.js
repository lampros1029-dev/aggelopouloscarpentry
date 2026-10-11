/* Κοινή gallery + lightbox. Ρυθμίσεις ανά σελίδα: AGGLO_IMG_BASE, AGGLO_IMG_EXT, AGGLO_IMG_NAMER,
   AGGLO_EXTRA [{u,cap}] (σήμα «ΝΕΟ»), AGGLO_ORDER [{n,cap}] (σταθερή σειρά, λεζάντα = alt). */
/* ===== DYNAMIC GALLERY + VIEWER (desktop arrows, mobile κύλιση, cross‑fade, freeze body) ===== */
(function(){
  var grid=document.getElementById('g-grid'); if(!grid) return;

  var EXT=(window.AGGLO_IMG_EXT||'webp').replace('.','');
  var BASE=(window.AGGLO_IMG_BASE||'').replace(/\/$/,'');
  var NAMER=window.AGGLO_IMG_NAMER || function(i,ext){ return 'item_'+i+'.'+ext; };
  var MIN = Number(window.AGGLO_IMG_MIN_INDEX||1);
  var MAX = Number(window.AGGLO_IMG_MAX_INDEX||0);

  var images=[];

  var caps=[];
  function addCard(idx,url,isNew,capT){
    var li=document.createElement('div');
    li.className='g-item loaded'+(isNew===true?' is-new':''); li.setAttribute('role','button'); li.setAttribute('tabindex','0');
    li.dataset.idx=images.length;
    capT=capT||((window.AGGLO_CAP_FALLBACK||'Φωτογραφία έργου')+' #'+idx);
    var img=document.createElement('div'); img.className='img'; img.style.backgroundImage='url("'+url+'")';
    img.setAttribute('role','img'); img.setAttribute('aria-label',capT); li.setAttribute('aria-label','Μεγέθυνση: '+capT);
    var cap=document.createElement('div'); cap.className='cap'; cap.setAttribute('aria-hidden','true'); cap.textContent=capT;
    li.appendChild(img); li.appendChild(cap);
    if(isNew===true){ var b=document.createElement('span'); b.className='new'; b.textContent='ΝΕΟ'; li.appendChild(b); }
    grid.appendChild(li);
    images.push(url); caps.push(capT);
  }

  var pending=0;
  function tryLoad(i){
    var url = BASE + '/' + NAMER(i, EXT);
    pending++;
    var im=new Image();
    im.onload=function(){ addCard(i,url); checkDone(); };
    im.onerror=function(){ checkDone(); };
    im.src=url;
  }
  function checkDone(){ if(--pending<=0 && images.length===0){ grid.innerHTML='<p style="grid-column:1/-1;text-align:center;color:#6b6b6b">Δεν βρέθηκαν εικόνες.</p>'; } }

  var LIST=window.AGGLO_ORDER;
  (window.AGGLO_EXTRA||[]).forEach(function(o,k){ addCard(k+1,o.u,true,o.cap); });
  if(LIST&&LIST.length){ LIST.forEach(function(o){ addCard(o.n, BASE+'/'+NAMER(o.n,EXT), false, o.cap); }); }
  else { for(var i=MIN;i<=MAX;i++){ tryLoad(i); } }  /* fallback: παλιά συμπεριφορά */

  // ===== Lightbox =====
  var v=null, cur=0, scrollY=0;

  function open(pos){
    cur=pos;
    if(!v){
      v=document.createElement('div');
      v.className='viewer';
      v.innerHTML='<div class="stage"><div class="full" id="vfull" role="img"></div><div class="vbox" id="vbox"><p class="vcap" id="vcap"></p></div><button class="nav prev" aria-label="Προηγούμενη">‹</button><button class="nav next" aria-label="Επόμενη">›</button></div><div class="controls"><button class="btn" id="vclose">Κλείσιμο</button><span class="hint">Κύλιση ← / →</span></div>';
      document.body.appendChild(v);
      v.querySelector('#vclose').onclick=close;
      v.addEventListener('click',function(e){ if(e.target===v) close(); });

      // Desktop arrows
      var p=v.querySelector('.prev'), n=v.querySelector('.next');
      if(p) p.onclick=function(){ step(-1); };
      if(n) n.onclick=function(){ step(1); };

      // Κύλιση (touch & mouse) για κινητά
      var stage=v.querySelector('.stage');
      var startX=0, dx=0, touching=false, TH=40;
      function start(e){ touching=true; startX=(e.touches?e.touches[0].clientX:e.clientX); dx=0; }
      function move(e){ if(!touching) return; var x=(e.touches?e.touches[0].clientX:e.clientX); dx=x-startX; }
      function end(){ if(!touching) return; touching=false; if(Math.abs(dx)>TH){ step(dx<0?1:-1);} }
      stage.addEventListener('touchstart',start,{passive:true});
      stage.addEventListener('touchmove',move,{passive:true});
      stage.addEventListener('touchend',function(e){ var sw=touching&&Math.abs(dx)>TH; end(); if(!sw && !e.target.closest('.nav')){ var bx=v.querySelector('#vbox'); clearTimeout(capTimer); bx.classList.toggle('is-on'); } });
      stage.addEventListener('mousedown',start);
      stage.addEventListener('mousemove',move);
      stage.addEventListener('mouseup',end);

      document.addEventListener('keydown',function(e){
        if(!v || v.hasAttribute('hidden')) return;
        if(e.key==='Escape') close();
        if(e.key==='ArrowLeft') step(-1);
        if(e.key==='ArrowRight') step(1);
      });
    }
    v.removeAttribute('hidden');
    freezeBody(true);
    render(true);
  }

  function close(){
    if(!v) return;
    v.setAttribute('hidden','');
    freezeBody(false);
  }

  // Freeze/restore body scroll & keep position
  function freezeBody(on){
    if(on){
      scrollY = window.scrollY || window.pageYOffset;
      document.body.classList.add('aggl-modal-open');
      document.body.style.top = (-scrollY)+'px';
    }else{
      document.body.classList.remove('aggl-modal-open');
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    }
  }

  function step(d){ cur=((cur+d+images.length)%images.length); render(false); }

  // Cross-fade render
  var capTimer=0, TOUCH=matchMedia('(hover:none)').matches;
  function fitBox(){
    if(!v) return; var st=v.querySelector('.stage'), bx=v.querySelector('#vbox'), im=bx._im; if(!im||!im.naturalWidth) return;
    var W=st.clientWidth, H=st.clientHeight, r=Math.min(W/im.naturalWidth, H/im.naturalHeight), w=im.naturalWidth*r, h=im.naturalHeight*r;
    bx.style.left=((W-w)/2)+'px'; bx.style.top=((H-h)/2)+'px'; bx.style.width=w+'px'; bx.style.height=h+'px';
  }
  function setCap(flash){
    var bx=v.querySelector('#vbox'); v.querySelector('#vcap').textContent=caps[cur]||''; v.querySelector('#vfull').setAttribute('aria-label',caps[cur]||'');
    var im=new Image(); bx._im=im; im.onload=function(){ if(bx._im===im) fitBox(); }; im.src=images[cur];
    if(TOUCH&&flash){ bx.classList.add('is-on'); clearTimeout(capTimer); capTimer=setTimeout(function(){ bx.classList.remove('is-on'); },2200); }
  }
  window.addEventListener('resize',fitBox);
  function render(first){
    setCap(true);
    var full=v.querySelector('#vfull');
    if(!first){
      full.style.opacity = 0;
      requestAnimationFrame(function(){
        full.style.backgroundImage='url("'+images[cur]+'")';
        requestAnimationFrame(function(){ full.style.opacity = 1; });
      });
    }else{
      full.style.opacity = 0;
      full.style.backgroundImage='url("'+images[cur]+'")';
      requestAnimationFrame(function(){ full.style.opacity = 1; });
    }
  }

  grid.addEventListener('click',function(e){
    var el=e.target.closest('.g-item'); if(!el) return; open(+el.dataset.idx);
  });
  grid.addEventListener('keydown',function(e){
    var el=e.target.closest('.g-item'); if(!el) return;
    if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(+el.dataset.idx); }
  });
})();
