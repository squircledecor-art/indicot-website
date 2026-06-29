/* Shared behaviour for Indiacot product pages (light premium) */
(function(){
  var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();

  /* floating quote pill */
  var fab=document.getElementById('qfab');
  var target=document.getElementById('contact')||document.getElementById('enquire');
  if(fab){
    function onScroll(){
      var past=window.scrollY>window.innerHeight*0.7;
      var atForm=target?target.getBoundingClientRect().top<window.innerHeight*0.65:false;
      fab.classList.toggle('show',past&&!atForm);
    }
    fab.addEventListener('click',function(){ if(target) target.scrollIntoView({behavior:'smooth',block:'start'}); });
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll); onScroll();
  }

  /* custom cursor — soft ring + gold bead */
  if(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches){
    var cur=document.getElementById('cur'), core=document.getElementById('curCore');
    if(cur&&core){
      var mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,started=false;
      window.addEventListener('mousemove',function(e){
        mx=e.clientX;my=e.clientY;
        core.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
        if(!started){rx=mx;ry=my;started=true;}
      });
      (function loop(){ rx+=(mx-rx)*0.2; ry+=(my-ry)*0.2;
        cur.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
      var hov='a,button,input,select,textarea,label,.mcard,.tile,.rel,.g,.pt,[role=button]';
      document.addEventListener('mouseover',function(e){ if(e.target.closest&&e.target.closest(hov)){cur.classList.add('hover');core.classList.add('hover');} });
      document.addEventListener('mouseout',function(e){ var t=e.relatedTarget; if(e.target.closest&&e.target.closest(hov)&&!(t&&t.closest&&t.closest(hov))){cur.classList.remove('hover');core.classList.remove('hover');} });
      document.addEventListener('mousedown',function(){cur.classList.add('down');});
      document.addEventListener('mouseup',function(){cur.classList.remove('down');});
      document.addEventListener('mouseleave',function(){cur.style.opacity=0;core.style.opacity=0;});
      document.addEventListener('mouseenter',function(){cur.style.opacity=1;core.style.opacity=1;});
    }
  }

  /* PERF: async image decode + pause offscreen video for a smoother frame rate */
  [].slice.call(document.querySelectorAll('img')).forEach(function(img){
    if(!img.getAttribute('decoding')) img.setAttribute('decoding','async');
  });
  (function(){
    var vids=[].slice.call(document.querySelectorAll('video'));
    if(!vids.length || !('IntersectionObserver' in window)) return;
    var vio=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var v=en.target;
        if(en.isIntersecting){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
        else { try{ v.pause(); }catch(e){} }
      });
    },{threshold:0.05});
    vids.forEach(function(v){ vio.observe(v); });
  })();
})();
