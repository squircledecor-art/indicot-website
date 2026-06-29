/* ============================================================
   INDIACOT — Tasteful 3D mouse-tilt
   Add data-tilt to any card; optional data-tilt-max (deg).
   Also drives the radial --mx/--my glow on .tile elements.
   ============================================================ */
(function(){
  if(!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  var els = [].slice.call(document.querySelectorAll('[data-tilt]'));
  els.forEach(function(el){
    var max = parseFloat(el.getAttribute('data-tilt-max')) || 8;
    var inner = el.querySelector('[data-tilt-inner]') || el;
    var raf = false, rx = 0, ry = 0;

    function onMove(e){
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;   // 0..1
      var py = (e.clientY - r.top) / r.height;   // 0..1
      ry = (px - 0.5) * 2 * max;                 // rotateY
      rx = (0.5 - py) * 2 * max;                 // rotateX
      // glow position for .tile
      el.style.setProperty('--mx', (px*100).toFixed(1) + '%');
      el.style.setProperty('--my', (py*100).toFixed(1) + '%');
      if(!raf){ raf = true; requestAnimationFrame(apply); }
    }
    function apply(){
      raf = false;
      inner.style.transform = 'perspective(1100px) rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg)';
    }
    function onLeave(){
      inner.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
      inner.style.transform = 'perspective(1100px) rotateX(0) rotateY(0)';
      setTimeout(function(){ inner.style.transition = ''; }, 520);
    }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
})();
