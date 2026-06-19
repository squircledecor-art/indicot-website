/* ============================================================
   INDIACOT — Cinematic interactions
   ============================================================ */
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- INTRO LOADER ---------- */
  var intro = document.getElementById('intro');
  if(intro){
    document.body.classList.add('intro-lock');
    var fill = intro.querySelector('.intro-bar i');
    var countEl = intro.querySelector('.intro-count');
    var enter = intro.querySelector('.intro-enter');
    var pct = 0, ready = false;

    var tick = setInterval(function(){
      // ease toward 100, slowing near the top until assets are ready
      var cap = ready ? 100 : 92;
      pct += Math.max(1, (cap - pct) * 0.08);
      if(pct >= cap){ pct = cap; }
      if(fill) fill.style.width = pct + '%';
      if(countEl) countEl.textContent = String(Math.floor(pct)).padStart(3,'0');
      if(pct >= 100){
        clearInterval(tick);
        if(enter) enter.classList.add('show');
      }
    }, 32);

    window.addEventListener('load', function(){ ready = true; });
    // safety: mark ready after 2.4s even if load is slow
    setTimeout(function(){ ready = true; }, 2400);

    var dismiss = function(){
      if(intro.classList.contains('gone')) return;
      // only allow enter once counter is full
      if(pct < 100){ ready = true; return; }
      intro.classList.add('gone');
      document.body.classList.remove('intro-lock');
      kick();
    };
    intro.addEventListener('click', dismiss);
    // auto-enter shortly after fully loaded for users who don't click
    var autoTimer = setInterval(function(){
      if(pct >= 100){ clearInterval(autoTimer); setTimeout(dismiss, 1100); }
    }, 200);
  } else {
    kick();
  }

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
  if(!reduce){
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
})();
