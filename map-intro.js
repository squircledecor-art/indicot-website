/* ============================================================
   INDIACOT — Map intro sequence
   India map → zoom Gujarat → pin Rajkot → Indiacot logo.
   The screen stays a clean bone background until the map is
   ready, then the animation plays — so there is no loading bar.
   ============================================================ */
(function(){
  var stage = document.getElementById('mapIntro');
  if(!stage) return;

  // play once per browser session (a fresh tab replays it)
  try { if (sessionStorage.getItem('indiacotIntroSeen')) { stage.remove(); return; } } catch(e){}

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  document.body.classList.add('mi-lock');

  var viewport = stage.querySelector('.mi-viewport');
  var placeEl  = stage.querySelector('.mi-place');
  var eyebrowEl= stage.querySelector('.mi-eyebrow');
  var done = false;
  var timers = [];
  function at(ms, fn){ timers.push(setTimeout(fn, ms)); }

  function finish(){
    if(done) return; done = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem('indiacotIntroSeen','1'); } catch(e){}
    stage.classList.add('gone');
    document.body.classList.remove('mi-lock');
    setTimeout(function(){ if(stage && stage.parentNode) stage.parentNode.removeChild(stage); }, 950);
  }
  stage.addEventListener('click', finish);
  var skipBtn = stage.querySelector('.mi-skip');
  if(skipBtn) skipBtn.addEventListener('click', function(e){ e.stopPropagation(); finish(); });

  function setPlace(eyebrow, place){
    if(eyebrowEl) eyebrowEl.textContent = eyebrow;
    if(placeEl){
      placeEl.textContent = place;
      placeEl.classList.remove('swap'); void placeEl.offsetWidth; placeEl.classList.add('swap');
    }
  }

  // logo-only fallback (if the map can't load) — still clean, no loading bar
  function logoOnly(){
    stage.classList.add('to-logo');
    at(reduce ? 700 : 1700, finish);
  }

  function runSequence(){
    if(reduce){
      stage.classList.add('show-map');
      setPlace('Engineered in', 'India');
      at(900, function(){ stage.classList.add('zoom-gj','show-pin'); setPlace('Our home', 'Rajkot, Gujarat'); });
      at(2100, function(){ stage.classList.add('to-logo'); });
      at(3000, finish);
      return;
    }
    at(80,   function(){ stage.classList.add('show-map'); setPlace('Engineered in', 'INDIA'); });
    at(1800, function(){ stage.classList.add('zoom-gj');  setPlace('State of', 'GUJARAT'); });
    at(3450, function(){ stage.classList.add('show-pin'); setPlace('Our home', 'RAJKOT'); });
    at(5300, function(){ stage.classList.add('to-logo'); });
    at(7100, finish);
  }

  function buildMap(locations){
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 612 696');
    svg.setAttribute('class','mi-map');
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    locations.forEach(function(l){
      var p = document.createElementNS(ns,'path');
      p.setAttribute('d', l.path);
      p.setAttribute('class', l.id === 'gj' ? 'mi-state mi-gj' : 'mi-state');
      svg.appendChild(p);
    });

    var glow = document.createElement('div');
    glow.className = 'mi-glow';
    viewport.appendChild(glow);

    var world = document.createElement('div');
    world.className = 'mi-world';
    world.appendChild(svg);

    var pin = document.createElement('div');
    pin.className = 'mi-pin';
    pin.innerHTML =
      '<span class="mi-ping"></span>' +
      '<span class="mi-ping mi-ping2"></span>' +
      '<svg viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 34 12 34s12-13.2 12-22.1C24 5.3 18.6 0 12 0z" fill="#b07d12"/>' +
      '<circle cx="12" cy="12" r="4.4" fill="#fff"/></svg>';
    world.appendChild(pin);

    viewport.appendChild(world);
  }

  var started = false;
  function start(locations){
    if(started) return; started = true;
    buildMap(locations);
    requestAnimationFrame(function(){ requestAnimationFrame(runSequence); });
  }

  // if the map is slow/unavailable, fall back to a clean logo reveal
  var failTimer = setTimeout(function(){ if(!started){ started = true; logoOnly(); } }, 2600);

  import('https://unpkg.com/@svg-maps/india@2.0.0/index.js')
    .then(function(mod){
      clearTimeout(failTimer);
      var data = mod && (mod.default || mod);
      if(data && data.locations && data.locations.length){ start(data.locations); }
      else if(!started){ started = true; logoOnly(); }
    })
    .catch(function(){ clearTimeout(failTimer); if(!started){ started = true; logoOnly(); } });
})();
