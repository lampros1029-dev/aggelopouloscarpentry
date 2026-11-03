/* ===== Ντουλάπες · περιήγηση 360° από τη γωνία του παραθύρου (Photo Sphere Viewer, φορτώνεται μόνο όταν ξεκινήσει) ===== */
(function(){
  var root=document.querySelector('[data-tour]'); if(!root) return;
  var BASE=root.getAttribute('data-base'), VENDOR='/assets/vendor/psv/';
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D2R=Math.PI/180;

  /* panorama: w/h = image, fullW/fullH = the full 360x180 sphere, cx/cy = where the image sits on it */
  var META={"4096":{"w":4096,"h":2412,"fullW":9766,"fullH":4883,"cx":2835,"cy":1235},"3072":{"w":3072,"h":1809,"fullW":7324,"fullH":3662,"cx":2126,"cy":926}};
  var START=[.52,.5];

  /* each unit: real clip of the door moving (v) + photos of the open unit (p) + what is inside */
  var ITEMS={
    syrtaria:{l:'Συρτάρια & ράφια',k:'Γωνιακή ανοιγόμενη με εξωτερικά συρτάρια',t:'Στήλη με συρτάρια και ράφια',d:'Πέντε εξωτερικά συρτάρια με πόμολα μπάρα. Από πάνω, μικρό ανοιγόμενο φύλλο με ράφια.',v:'rafia-fwd',p:['134202','134133','133501'],
      c:['Πέντε εξωτερικά συρτάρια με πόμολα μπάρα','Ράφια με λευκό εσωτερικό πίσω από το πάνω φύλλο','Μεταλλικοί μεντεσέδες στην εσωτερική πλευρά του φύλλου']},
    difylli:{l:'Δίφυλλη ανοιγόμενη',k:'Γωνιακή ανοιγόμενη με εξωτερικά συρτάρια',t:'Δίφυλλη ανοιγόμενη ντουλάπα',d:'Πίσω από τα δύο ψηλά φύλλα, χώρος κρεμάσματος σε δύο επίπεδα με λευκό εσωτερικό.',v:'difylli-fwd',p:['134043','134243'],
      c:['Κρεμάστρα ψηλά, κάτω από το ταβάνι','Ράφι με δεύτερη κρεμάστρα από κάτω','Ψηλός χώρος κρεμάσματος ως το πάτωμα','Μεντεσέδες στην εσωτερική πλευρά των φύλλων']},
    aristero:{l:'Συρόμενη · αριστερά',k:'Κρεμάστρα ασανσέρ ως το ταβάνι',t:'Συρόμενη · αριστερό τμήμα',d:'Ψηλά, κρεμάστρα ασανσέρ που κατεβαίνει με τη λαβή της. Από κάτω, ράφι και δεύτερη κρεμάστρα.',v:'aristero-fwd',p:['133830','133924'],
      c:['Κρεμάστρα ασανσέρ ψηλά, με λαβές για να κατεβαίνει','Ράφι κάτω από την κρεμάστρα','Δεύτερη κρεμάστρα κάτω από το ράφι','Λευκό εσωτερικό']},
    mesaio:{l:'Πίσω από τον καθρέφτη',k:'Πίσω από τον καθρέφτη',t:'Συρόμενη · πίσω από τον καθρέφτη',d:'Κρεμάστρα ασανσέρ, ράφι και πέντε λευκά συρτάρια με μεταλλικά χερούλια.',v:'mesaio',p:['133902','133924'],
      c:['Κρεμάστρα ασανσέρ με λαβές','Ράφι κάτω από την κρεμάστρα','Ανοιχτή θέση πάνω από τα συρτάρια','Πέντε λευκά συρτάρια με μεταλλικά χερούλια']},
    dexi:{l:'Συρόμενη · δεξιά',k:'Ράφια δίπλα στο παράθυρο',t:'Συρόμενη · δίπλα στο παράθυρο',d:'Κρεμάστρα και στήλη με ράφια για διπλωμένα ρούχα.',v:'dexi-fwd',p:['134003'],
      c:['Στήλη με λευκά ράφια σε όλο το ύψος','Ψηλό ράφι και ελεύθερος χώρος από κάτω, δίπλα στη στήλη','Λευκό εσωτερικό']},
    parathyro:{l:'Ντουλάπι παραθύρου',k:'Χαμηλά έπιπλα στην ίδια απόχρωση',t:'Ντουλάπι κάτω από το παράθυρο',d:'Χαμηλό ντουλάπι στην ίδια απόχρωση, με ράφια πίσω από τα ανοιγόμενα φύλλα.',v:'parathyro-fwd',p:['134732','134639'],
      c:['Τέσσερα ανοιγόμενα φύλλα','Δύο χώροι με ράφια','Λευκό εσωτερικό','Επιφάνεια σε όλο το μήκος, κάτω από το παράθυρο']},
    vitrina:{l:'Έπιπλο με τζάμια',k:'Χαμηλά έπιπλα στην ίδια απόχρωση',t:'Χαμηλό έπιπλο με τζάμια',d:'Τρία φύλλα με τζάμι και ράφια σε όλο το πλάτος, κάτω από την τηλεόραση.',v:'vitrina-fwd',p:['134500','134413'],
      c:['Τρία φύλλα με τζάμι','Ράφια σε όλο το πλάτος','Εσωτερικό στην ίδια απόχρωση με το έπιπλο','Πόμολα μπάρα']}
  };
  /* white info points (details visible from this corner) */
  var INFO={
    asanser:{t:'Κρεμάστρα ασανσέρ',d:'Πίσω από αυτό το φύλλο, η ράβδος κατεβαίνει με τη λαβή και ανεβαίνει ξανά, ώστε να χρησιμοποιείται όλο το ύψος ως το ταβάνι. Στη φωτογραφία: η δεύτερη κρεμάστρα ασανσέρ, πίσω από τον καθρέφτη.',img:'detail-133902-1024.webp',full:'detail-133902-1600.webp'},
    kremastra2:{t:'Δεύτερη κρεμάστρα',d:'Κάτω από το ράφι, δεύτερη κρεμάστρα: δύο επίπεδα κρεμάσματος στο ίδιο τμήμα.',img:'133830-1024.webp',full:'133830-3200.webp'},
    kathreftis:{t:'Καθρέφτης σε όλο το ύψος',d:'Το μεσαίο φύλλο είναι καθρέφτης από το πάτωμα ως το ταβάνι και αντανακλά το φως από το παράθυρο.'},
    odigoi:{t:'Οδηγοί αλουμινίου',d:'Τα φύλλα κινούνται σε οδηγούς αλουμινίου πάνω και κάτω, και κλείνουν ως το ταβάνι χωρίς κενό για σκόνη.'},
    anoigomeni:{t:'Ανοιγόμενη ντουλάπα',d:'Στη γωνία δίπλα στην πόρτα, η ανοιγόμενη ντουλάπα με πόμολα μπάρα: συρτάρια και ράφια στη στήλη, κρεμάστρες σε δύο επίπεδα πίσω από τα ψηλά φύλλα.',img:'detail-134043-1024.webp',full:'detail-134043-1600.webp'}
  };
  /* [id, fx, fy, label side] — fx/fy = fraction of the panorama image; sides chosen so labels don't overlap at the start view */
  var UNITS=[['vitrina',.215,.80,'r'],['syrtaria',.367,.645,'l'],['difylli',.455,.47,'l'],['aristero',.535,.665,'b'],['mesaio',.63,.52,'r'],['dexi',.76,.40,'r'],['parathyro',.80,.80,'l']];
  var DOTS=[['anoigomeni',.395,.33,'l'],['asanser',.54,.425,'r'],['kremastra2',.54,.545,'r'],['kathreftis',.625,.37,'r'],['odigoi',.76,.232,'l']];
  var DOT_IDS=DOTS.map(function(d){return d[0];});

  var viewer=null, markers=null, started=false, SMALL=false, M=null;
  var stage=root.querySelector('[data-tour-stage]'), startBtn=root.querySelector('[data-tour-start]');
  var DOOR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3.5h9v17H4z"/><path d="M13 3.5l6 2.2v12.6l-6 2.2"/><path d="M10 11.2v1.6"/></svg>';
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  function pos(m,fx,fy){
    var rx=(fx*m.w+m.cx)/m.fullW*Math.PI*2, ry=(fy*m.h+m.cy)/m.fullH*Math.PI;
    return {yaw:rx>=Math.PI?rx-Math.PI:rx+Math.PI, pitch:Math.PI/2-ry};
  }
  function vcov(m){ return m.h/m.fullH*180; }
  function hcov(m){ return m.w/m.fullW*360; }
  function markerList(){
    var out=[];
    UNITS.forEach(function(s){ var it=ITEMS[s[0]];
      out.push({id:'u-'+s[0], position:pos(M,s[1],s[2]), size:{width:40,height:40}, anchor:'center center', className:'tour-mk tour-mk--unit is-'+s[3],
        html:'<span class="tour-mk__btn">'+DOOR+'</span><span class="tour-mk__lbl">'+esc(it.l)+'</span>', data:{item:s[0]}}); });
    DOTS.forEach(function(s){ var it=INFO[s[0]];
      out.push({id:'i-'+s[0], position:pos(M,s[1],s[2]), size:{width:30,height:30}, anchor:'center center', className:'tour-mk tour-mk--info is-'+s[3],
        html:'<span class="tour-mk__btn"></span><span class="tour-mk__lbl">'+esc(it.t)+'</span>', data:{info:s[0]}}); });
    return out;
  }

  function loadCss(href){ return new Promise(function(ok){ var l=document.createElement('link'); l.rel='stylesheet'; l.href=href; l.onload=ok; l.onerror=ok; document.head.appendChild(l); }); }
  function loadJs(src){ return new Promise(function(ok,ko){ var s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=ko; document.head.appendChild(s); }); }
  function maxTex(){ try{ var c=document.createElement('canvas'), g=c.getContext('webgl'); return g?g.getParameter(g.MAX_TEXTURE_SIZE):0; }catch(e){ return 0; } }

  /* keep the view inside the photographed area (the panorama has no image at the back / top / bottom) */
  var clamping=false, flying=false, cy0=0;
  function clampView(){
    if(!viewer||clamping||flying) return;
    var p=viewer.getPosition(), fov=viewer.renderer.camera.fov, size=viewer.getSize();
    var hf=2*Math.atan(Math.tan(fov*D2R/2)*size.width/size.height)/D2R;
    var pmax=Math.max(0,(vcov(M)-fov)/2-.5)*D2R, ymax=Math.max(0,(hcov(M)-hf)/2-1-Math.abs(p.pitch)/D2R*.12)*D2R; /* small margins: no black edge at the photo's border */
    var yaw=p.yaw>Math.PI?p.yaw-2*Math.PI:p.yaw, pitch=p.pitch, ch=false;
    var dy=yaw-cy0; if(dy>Math.PI) dy-=2*Math.PI; if(dy<-Math.PI) dy+=2*Math.PI;
    if(Math.abs(pitch)>pmax){ pitch=Math.sign(pitch)*pmax; ch=true; }
    if(Math.abs(dy)>ymax){ yaw=cy0+Math.sign(dy)*ymax; ch=true; }
    if(ch){ clamping=true; viewer.rotate({yaw:yaw,pitch:pitch}); clamping=false; }
  }

  function start(){
    if(started) return; started=true;
    root.classList.add('is-loading');
    var mt=maxTex(); SMALL=innerWidth<900||mt<4096; M=META[SMALL?'3072':'4096'];
    cy0=pos(M,.5,.5).yaw; if(cy0>Math.PI) cy0-=2*Math.PI;
    Promise.all([loadCss(VENDOR+'psv-bundle.css?v=20261017a'),loadJs(VENDOR+'psv-bundle.js?v=20261017a')]).then(function(){
      var P=window.PSV, maxF=Math.min(90,vcov(M)-2), s0=pos(M,START[0],START[1]);
      viewer=new P.Viewer({
        container:stage, navbar:false, loadingTxt:'', mousewheelCtrlKey:true, touchmoveTwoFingers:false, moveInertia:!RM,
        panorama:BASE+'pano/parathyro-'+M.w+'.jpg?v=20261017b',
        panoData:{fullWidth:M.fullW,fullHeight:M.fullH,croppedWidth:M.w,croppedHeight:M.h,croppedX:M.cx,croppedY:M.cy},
        defaultZoomLvl:0, maxFov:maxF, minFov:Math.min(30,maxF-10), defaultYaw:s0.yaw, defaultPitch:s0.pitch,
        lang:{zoom:'Ζουμ',zoomOut:'Σμίκρυνση',zoomIn:'Μεγέθυνση',moveUp:'Πάνω',moveDown:'Κάτω',moveLeft:'Αριστερά',moveRight:'Δεξιά',fullscreen:'Πλήρης οθόνη',loading:'Φόρτωση…',menu:'Μενού',close:'Κλείσιμο',twoFingers:'Χρησιμοποιήστε δύο δάχτυλα',ctrlZoom:'Ctrl + κύλιση για ζουμ',loadError:'Η φωτογραφία δεν φορτώθηκε',webglError:'Ο browser δεν υποστηρίζει την προβολή 360°'},
        plugins:[[P.MarkersPlugin,{markers:markerList()}]]
      });
      markers=viewer.getPlugin(P.MarkersPlugin);
      viewer.addEventListener('position-updated',clampView);
      viewer.addEventListener('zoom-updated',clampView);
      viewer.addEventListener('size-updated',clampView);
      viewer.addEventListener('ready',function(){ root.classList.remove('is-loading'); root.classList.add('is-on'); setTimeout(clampView,30); },{once:true});
      viewer.addEventListener('click',function(e){ if(e.data&&e.data.marker) return; if(cardId) closeCard(); else if(home) flyHome(); });
      markers.addEventListener('select-marker',function(e){ var d=e.marker.data||{}; if(d.item) zoomOpen(d.item); else if(d.info){ if(cardId===d.info) closeCard(); else openInfo(d.info); } });
      window.__tour={fzOpen:function(){return fzOpen;},viewer:viewer,markers:markers,isFlying:function(){return flying;},isZoomed:function(){return !!home;},pos:function(fx,fy){return pos(M,fx,fy);}};
    }).catch(function(){ root.classList.remove('is-loading'); started=false; });
  }
  startBtn&&startBtn.addEventListener('click',start);
  [].forEach.call(root.querySelectorAll('[data-tour-zoom]'),function(b){ b.addEventListener('click',function(){ if(!viewer) return; stopFly(); +b.getAttribute('data-tour-zoom')>0?viewer.zoomIn(10):viewer.zoomOut(10); }); });
  var fsBtn=root.querySelector('[data-tour-fs]');
  if(fsBtn){
    if(!(root.requestFullscreen||root.webkitRequestFullscreen)) fsBtn.hidden=true;
    fsBtn.addEventListener('click',function(){ var fe=document.fullscreenElement||document.webkitFullscreenElement;
      if(fe){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); } else { (root.requestFullscreen||root.webkitRequestFullscreen).call(root); } });
    document.addEventListener('fullscreenchange',function(){ root.classList.toggle('is-fs',document.fullscreenElement===root); });
  }

  /* ===== ζουμ προς το σημείο (ίδια κίνηση με το «Από κοντά»: 1.05s, cubic-bezier(.65,0,.25,1)) ===== */
  var FLY_MS=1050, FOV_UNIT=36, FOV_INFO=30, home=null, raf=0, flyCb=null;
  function bez(x1,y1,x2,y2){ function B(t,a,b){ return 3*a*t*(1-t)*(1-t)+3*b*t*t*(1-t)+t*t*t; } function dB(t,a,b){ return 3*a*(1-t)*(1-t)+6*(b-a)*t*(1-t)+3*(1-b)*t*t; }
    return function(x){ if(x<=0) return 0; if(x>=1) return 1; var t=x; for(var i=0;i<8;i++){ var e=B(t,x1,x2)-x, d=dB(t,x1,x2); if(Math.abs(e)<1e-5||!d) break; t-=e/d; } return B(Math.max(0,Math.min(1,t)),y1,y2); }; }
  var EASE=bez(.65,0,.25,1);
  function lvlFor(fov){ var mx=viewer.config.maxFov, mn=viewer.config.minFov; return Math.max(0,Math.min(100,(mx-fov)/(mx-mn)*100)); }
  function stopFly(){ if(raf){ cancelAnimationFrame(raf); raf=0; } flying=false; flyCb=null; }
  function fly(to,cb){
    stopFly(); if(!viewer){ cb&&cb(); return; }
    var p=viewer.getPosition(), y0=p.yaw, x0=p.pitch, z0=viewer.getZoomLevel(), dy=to.yaw-y0;
    while(dy>Math.PI) dy-=2*Math.PI; while(dy<-Math.PI) dy+=2*Math.PI;
    var dx=to.pitch-x0, dz=to.zoom-z0, t0=performance.now(), D=RM?0:FLY_MS; flying=true; flyCb=cb||null;
    (function step(){ var k=D?Math.min((performance.now()-t0)/D,1):1, e=EASE(k);
      viewer.rotate({yaw:y0+dy*e,pitch:x0+dx*e}); viewer.zoom(z0+dz*e);
      if(k<1){ raf=requestAnimationFrame(step); return; }
      raf=0; flying=false; clampView(); var f=flyCb; flyCb=null; f&&f(); })();
  }
  function flyTo(mkId,fov,cb,lift){
    if(!viewer||!markers){ cb&&cb(); return; }
    var mk; try{ mk=markers.getMarker(mkId); }catch(e){ mk=null; } if(!mk){ cb&&cb(); return; }
    if(!home){ var p=viewer.getPosition(); home={yaw:p.yaw,pitch:p.pitch,zoom:viewer.getZoomLevel()}; }
    root.classList.add('is-zoom'); [].forEach.call(stage.querySelectorAll('.tour-mk.is-on'),function(m){ m.classList.remove('is-on'); });
    mk.domElement&&mk.domElement.classList.add('is-on');
    var pos=mk.config.position; fly({yaw:pos.yaw,pitch:pos.pitch-(lift||0),zoom:lvlFor(fov)},cb);
  }
  function flyHome(){
    root.classList.remove('is-zoom'); [].forEach.call(stage.querySelectorAll('.tour-mk.is-on'),function(m){ m.classList.remove('is-on'); });
    if(!viewer||!home) return; var h=home; home=null; fly(h);
  }

  /* ===== λευκά σημεία: ζουμ → κάρτα με την εξήγηση (‹ › για το επόμενο σημείο) ===== */
  var card=root.querySelector('[data-tour-card]'), cardId=null, cardT=0;
  var cImg=card&&card.querySelector('[data-card-img]'), cZoom=card&&card.querySelector('[data-card-zoom]');
  function fillCard(id){ var it=INFO[id];
    card.querySelector('[data-card-t]').textContent=it.t; card.querySelector('[data-card-d]').textContent=it.d;
    var n=card.querySelector('[data-card-n]'); if(n) n.textContent=('0'+(DOT_IDS.indexOf(id)+1)).slice(-2);
    var tot=card.querySelector('[data-card-tot]'); if(tot) tot.textContent=('0'+DOT_IDS.length).slice(-2);
    if(cImg){ if(it.img){ cImg.src=BASE+it.img; cImg.alt=it.t; cZoom.hidden=false; cZoom.setAttribute('data-full',BASE+(it.full||it.img)); } else { cZoom.hidden=true; cImg.removeAttribute('src'); } } }
  function openInfo(id){
    if(!card||!INFO[id]) return; clearTimeout(cardT); cardId=id;
    card.classList.remove('is-open'); fillCard(id); card.hidden=false;
    /* narrow screens: the card covers the lower part of the view, so the point is brought to the middle of the free area above it */
    var lift=0, bx=stage.getBoundingClientRect();
    if(bx.width<641&&viewer){ var H=bx.height, U=Math.max(80,H-card.offsetHeight-16), d=H/2-U/2; lift=Math.atan(d/(H/2)*Math.tan(FOV_INFO*D2R/2)); }
    flyTo('i-'+id,FOV_INFO,null,lift);
    cardT=setTimeout(function(){ if(cardId!==id) return; card.classList.add('is-open'); },RM?0:450);
  }
  function hideCard(){ clearTimeout(cardT); if(!card) return; card.classList.remove('is-open'); setTimeout(function(){ if(!cardId) card.hidden=true; },RM?0:280); }
  function closeCard(keepZoom){ if(!cardId) return; if(fzOpen) fzClose(); cardId=null; hideCard(); if(keepZoom!==true) flyHome(); }
  function stepCard(dir){ var i=DOT_IDS.indexOf(cardId); if(i<0) return; openInfo(DOT_IDS[(i+dir+DOT_IDS.length)%DOT_IDS.length]); }

  /* ===== φωτογραφία κάρτας σε πλήρη οθόνη: ζουμ από τη μικρογραφία (FLIP, ~0.45s), η κάρτα μένει ανοιχτή από κάτω ===== */
  var fz=null, fzImg=null, fzOpen=false, fzBusy=false, FZ_MS=RM?0:450;
  function fzBuild(){
    if(fz) return; fz=document.createElement('div'); fz.className='tour-fz'; fz.hidden=true;
    fz.setAttribute('role','dialog'); fz.setAttribute('aria-modal','true'); fz.setAttribute('aria-label','Φωτογραφία σε πλήρη οθόνη');
    fz.innerHTML='<img class="tour-fz__img" alt="" decoding="async"><button type="button" class="tour-fz__x" aria-label="Κλείσιμο">×</button>';
    document.body.appendChild(fz); fzImg=fz.querySelector('img');
    fz.addEventListener('click',function(e){ if(e.target===fz||e.target===fzImg||e.target.closest('.tour-fz__x')) fzClose(); });
  }
  function fzRects(){ /* final rect = photo fitted (contain) in the viewport; start = the thumbnail as it looks (object-fit:cover) */
    var t=cImg.getBoundingClientRect(), nw=cImg.naturalWidth||4, nh=cImg.naturalHeight||3, vw=innerWidth, vh=innerHeight, pad=vw<641?0:32;
    var k=Math.min((vw-pad*2)/nw,(vh-pad*2)/nh), w=nw*k, h=nh*k, f={l:(vw-w)/2,t:(vh-h)/2,w:w,h:h};
    var sc=Math.max(t.width/w,t.height/h), ix=Math.max(0,(w-t.width/sc)/2), iy=Math.max(0,(h-t.height/sc)/2);
    var dx=(t.left+t.width/2)-(f.l+w/2), dy=(t.top+t.height/2)-(f.t+h/2);
    return {f:f,from:'translate('+dx+'px,'+dy+'px) scale('+sc+')', clip:'inset('+iy+'px '+ix+'px round '+(10/sc)+'px)'};
  }
  function fzOpenFn(){
    if(fzOpen||!cImg||!cImg.src) return; fzBuild(); fzOpen=true; fzBusy=true;
    var r=fzRects(), full=cZoom.getAttribute('data-full');
    fzImg.style.cssText='left:'+r.f.l+'px;top:'+r.f.t+'px;width:'+r.f.w+'px;height:'+r.f.h+'px;transition:none;transform:'+r.from+';clip-path:'+r.clip;
    fzImg.src=cImg.currentSrc||cImg.src; fzImg.alt=cImg.alt;
    if(full&&full!==fzImg.src){ var hi=new Image(); hi.decoding='async'; hi.onload=function(){ if(fzOpen) fzImg.src=full; }; hi.src=full; }
    fz.hidden=false; fz.classList.remove('is-open'); void fzImg.offsetWidth;
    requestAnimationFrame(function(){ fz.classList.add('is-open'); fzImg.style.transition=''; fzImg.style.transform='none'; fzImg.style.clipPath='inset(0px 0px round 0px)'; });
    setTimeout(function(){ fzBusy=false; },FZ_MS);
    fz.querySelector('.tour-fz__x').focus({preventScroll:true});
  }
  function fzClose(){
    if(!fzOpen) return; fzOpen=false; var r=fzRects();
    fz.classList.remove('is-open'); fzImg.style.transform=r.from; fzImg.style.clipPath=r.clip;
    setTimeout(function(){ if(fzOpen) return; fz.hidden=true; fzImg.removeAttribute('src'); },FZ_MS+20);
    cZoom&&cZoom.focus({preventScroll:true});
  }
  cZoom&&cZoom.addEventListener('click',fzOpenFn);
  addEventListener('resize',function(){ if(!fzOpen) return; var r=fzRects(); fzImg.style.transition='none'; fzImg.style.left=r.f.l+'px'; fzImg.style.top=r.f.t+'px'; fzImg.style.width=r.f.w+'px'; fzImg.style.height=r.f.h+'px'; });
  /* Esc: the fullscreen photo closes first (window capture runs before every document handler) */
  addEventListener('keydown',function(e){ if(e.key==='Escape'&&fzOpen){ e.preventDefault(); e.stopImmediatePropagation(); fzClose(); } },true);
  if(card){
    [].forEach.call(card.querySelectorAll('[data-card-close]'),function(b){ b.addEventListener('click',function(){ closeCard(); }); });
    [].forEach.call(card.querySelectorAll('[data-card-step]'),function(b){ b.addEventListener('click',function(){ stepCard(+b.getAttribute('data-card-step')); }); });
  }

  /* ===== «άνοιγμα»: κίνηση της πόρτας (βίντεο) → φωτογραφία του ανοιχτού τμήματος + τι υπάρχει μέσα ===== */
  var ov=root.querySelector('[data-tour-ov]'), ovVid=ov.querySelector('video'), ovImg=ov.querySelector('.tour-ov__img'),
      ovK=ov.querySelector('[data-ov-k]'), ovT=ov.querySelector('[data-ov-t]'), ovD=ov.querySelector('[data-ov-d]'), ovC=ov.querySelector('[data-ov-c]'), ovTh=ov.querySelector('[data-ov-th]'),
      ovReplay=ov.querySelector('[data-ov-replay]'), ovClose=ov.querySelector('[data-ov-close]'), lastFocus=null, curItem=null, closeT=0;
  var BIG=(innerWidth*(devicePixelRatio||1))>1700?'2400':'1600';
  function photo(k,size){ return BASE+k+'-'+(size||BIG)+'.webp'; }
  function mark(sel){ [].forEach.call(ovTh.children,function(b){ b.classList.toggle('is-on',sel(b)); }); }
  function showPhoto(k){ ovImg.src=photo(k); ov.classList.add('is-photo'); mark(function(b){ return b.getAttribute('data-k')===k; }); }
  function playClip(){
    var it=ITEMS[curItem]; if(!it) return; ov.classList.remove('is-photo'); mark(function(b){ return b.hasAttribute('data-replay'); }); ovVid.poster=BASE+'v/'+it.v+'.jpg';
    if(RM){ showPhoto(it.p[0]); return; }
    ovVid.src=BASE+'v/'+it.v+'.mp4'; ovVid.currentTime=0; var pr=ovVid.play(); if(pr&&pr.catch) pr.catch(function(){ showPhoto(it.p[0]); });
  }
  ovVid.addEventListener('ended',function(){ var it=ITEMS[curItem]; if(it){ var im=new Image(); im.onload=im.onerror=function(){ if(ITEMS[curItem]===it) showPhoto(it.p[0]); }; im.src=photo(it.p[0]); } });
  function openItem(id){
    var it=ITEMS[id]; if(!it) return; closeCard(true); clearTimeout(closeT); curItem=id; lastFocus=document.activeElement;
    if(ovK) ovK.textContent=it.k||''; ovT.textContent=it.t; ovD.textContent=it.d; ovC.innerHTML=it.c.map(function(c){return '<li>'+esc(c)+'</li>'}).join('');
    ovTh.innerHTML='<button type="button" class="tour-ov__thv" data-replay aria-label="Η κίνηση ξανά"><img src="'+BASE+'v/'+it.v+'.jpg" alt="" loading="lazy"><span class="cs-play" aria-hidden="true"></span></button>'
      +it.p.map(function(k){ return '<button type="button" data-k="'+k+'" aria-label="Φωτογραφία"><img src="'+photo(k,'640')+'" alt="" loading="lazy" decoding="async"></button>'; }).join('');
    ov.hidden=false; requestAnimationFrame(function(){ ov.classList.add('is-open'); }); playClip(); ovClose.focus({preventScroll:true});
    it.p.forEach(function(k){ var i=new Image(); i.src=photo(k); });
  }
  function zoomOpen(id){ if(!ITEMS[id]) return; closeCard(true); lastFocus=document.activeElement; var lf=lastFocus; flyTo('u-'+id,FOV_UNIT,function(){ openItem(id); lastFocus=lf; }); }
  function closeOv(){ if(ov.hidden) return; ov.classList.remove('is-open'); ovVid.pause(); curItem=null; flyHome();
    closeT=setTimeout(function(){ ov.hidden=true; ov.classList.remove('is-photo'); ovVid.removeAttribute('src'); ovVid.load(); ovImg.removeAttribute('src'); },RM?0:260);
    lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true}); }
  ovTh.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; if(b.hasAttribute('data-replay')) playClip(); else { ovVid.pause(); showPhoto(b.getAttribute('data-k')); } });
  ovReplay.addEventListener('click',playClip); ovClose.addEventListener('click',closeOv);
  ov.addEventListener('click',function(e){ if(e.target===ov) closeOv(); });
  document.addEventListener('keydown',function(e){ if(e.key!=='Escape') return; if(!ov.hidden){ e.stopPropagation(); closeOv(); } else if(cardId){ e.stopPropagation(); closeCard(); } else if(home) flyHome(); },true);
  /* the list under the viewer opens the same panels (works before/without WebGL) */
  [].forEach.call(root.querySelectorAll('[data-item]'),function(b){ b.addEventListener('click',function(){ var id=b.getAttribute('data-item'); if(viewer) zoomOpen(id); else openItem(id); }); });
})();
