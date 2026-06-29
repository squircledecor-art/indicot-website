/* ============================================================
   INDIACOT — Cinematic interactions
   ============================================================ */
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- INTRO LOADER (DISABLED) ---------- */
  // Intro loader removed for smooth instant loading
  kick();

  /* ---------- SCROLL REVEALS ---------- */
  function kick(){
    // auto-tag common groups with staggered reveals (no manual markup needed)
    var groups = [
      ['.show-grid > .tile', 3],
      ['.machine-grid > .mcard', 3],
      ['.why-grid > .why-cell', 4],
      ['.proof-grid > .proof-cell', 4],
      ['.proof-tags > .pt', 6],
      ['.flag-points > .fp', 3],
      ['.enq-contacts > a', 4],
      ['.applic > .a', 6],
      ['.steps > .st', 4],
      ['.gallery-3 > .g', 3],
      ['.related > .rel', 3]
    ];
    groups.forEach(function(g){
      var nodes = [].slice.call(document.querySelectorAll(g[0]));
      nodes.forEach(function(n,i){
        if(!n.classList.contains('reveal')) n.classList.add('reveal');
        var d = (i % g[1]) + 1;
        if(d>=1 && d<=4) n.classList.add('reveal-d'+d);
      });
    });
    // section headings that weren't manually tagged
    [].slice.call(document.querySelectorAll('.sec-head')).forEach(function(h){
      [].slice.call(h.children).forEach(function(c){ if(!c.classList.contains('reveal')) c.classList.add('reveal'); });
    });

    var els = [].slice.call(document.querySelectorAll('.reveal,.clip-reveal,.mask-up'));
    if(reduce){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
    els.forEach(function(e){ io.observe(e); });
    // failsafe: if the observer ever misses an in-view element, reveal it anyway
    setTimeout(function(){
      els.forEach(function(e){
        if(e.classList.contains('in')) return;
        var r = e.getBoundingClientRect();
        if(r.top < window.innerHeight){ e.classList.add('in'); }
      });
    }, 2500);
  }

  /* ---------- PARALLAX ---------- */
  var isTouch = window.matchMedia && matchMedia('(hover:none),(pointer:coarse)').matches;
  if(!reduce && !isTouch){
    var pels = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if(pels.length){
      var raf = false;
      var run = function(){
        raf = false;
        var vh = window.innerHeight;
        pels.forEach(function(el){
          var r = el.getBoundingClientRect();
          if(r.bottom < -200 || r.top > vh + 200) return;
          var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
          var center = r.top + r.height/2 - vh/2;
          el.style.transform = 'translate3d(0,' + (center * -speed).toFixed(1) + 'px,0)';
        });
      };
      window.addEventListener('scroll', function(){ if(!raf){ raf = true; requestAnimationFrame(run); } }, {passive:true});
      window.addEventListener('resize', run);
      run();
    }
  }

  /* ---------- COUNT-UP STATS ---------- */
  (function(){
    var nodes = [].slice.call(document.querySelectorAll('.proof-cell .big'));
    if(!nodes.length) return;
    nodes.forEach(function(el){
      if(el.dataset.cuReady) return;
      el.dataset.cuReady = '1';
      var raw = el.textContent.trim();
      var m = raw.match(/^(\D*)(\d[\d,]*)(.*)$/);
      if(!m){ return; }
      el.dataset.cuPre = m[1];
      el.dataset.cuTarget = m[2].replace(/,/g,'');
      el.dataset.cuSuf = m[3];
      el.textContent = m[1] + '0' + m[3];
    });
    function animate(el){
      if(el.dataset.cuDone) return;
      el.dataset.cuDone = '1';
      if(reduce){ el.textContent = el.dataset.cuPre + el.dataset.cuTarget + el.dataset.cuSuf; return; }
      var target = parseInt(el.dataset.cuTarget,10);
      var pre = el.dataset.cuPre, suf = el.dataset.cuSuf;
      var dur = 1500, start = null;
      function ease(t){ return 1 - Math.pow(1-t, 3); }
      function step(ts){
        if(start===null) start = ts;
        var p = Math.min((ts-start)/dur, 1);
        var val = Math.round(ease(p) * target);
        el.textContent = pre + val + suf;
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if(!('IntersectionObserver' in window)){ nodes.forEach(animate); return; }
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ animate(en.target); cio.unobserve(en.target); }
      });
    }, { threshold:0.4 });
    nodes.forEach(function(n){ cio.observe(n); });
  })();

  /* ---------- MOBILE NAV TOGGLE ---------- */
  (function(){
    var btn = document.getElementById('navToggle');
    var menu = document.getElementById('navLinks');
    if(!btn || !menu) return;
    function setOpen(open){
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function(){
      setOpen(!menu.classList.contains('open'));
    });
    // close when a link is tapped
    menu.addEventListener('click', function(e){
      if(e.target.closest('a')) setOpen(false);
    });
    // close on resize back to desktop
    window.addEventListener('resize', function(){
      if(window.innerWidth > 680) setOpen(false);
    });
  })();

  /* ---------- PERFORMANCE: pause offscreen video + async image decode ---------- */
  (function(){
    // decode images off the main thread so scrolling stays smooth
    [].slice.call(document.querySelectorAll('img')).forEach(function(img){
      if(!img.getAttribute('decoding')) img.setAttribute('decoding','async');
    });
    // only play videos that are actually on screen (saves CPU/GPU → higher frame rate)
    var vids = [].slice.call(document.querySelectorAll('video'));
    if(!vids.length) return;
    if(!('IntersectionObserver' in window)) return;
    var vio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var v = en.target;
        if(en.isIntersecting){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
        else { try{ v.pause(); }catch(e){} }
      });
    }, { threshold:0.05 });
    vids.forEach(function(v){ vio.observe(v); });
  })();
})();
