/* Indiacot — catalogue lead-gate with verification:
   strict validation → confirm step → slide-to-verify → WhatsApp routing + auto-download.
   NOTE: real OTP (proving the visitor owns the number) needs a small backend + SMS/WhatsApp API.
   This gate stops junk numbers, fake emails, bots and spam — a deliberate, verified handoff. */
(function(){
  var WA = '919624186098';
  var STORE = 'indiacot_lead';
  var LOG = 'indiacot_dl_log';
  var MAX_PER_DAY = 6;

  var current = { cat:'', machine:'', name:'', phone:'', email:'', dial:'91', openedAt:0 };
  var verified = false;

  var dlIcon = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 11l5 4 5-4"/><path d="M5 21h14"/></svg>';

  var DIALS = [
    ['IN','91'],['AE','971'],['US','1'],['GB','44'],['SA','966'],['BD','880'],
    ['LK','94'],['NP','977'],['PK','92'],['NG','234'],['KE','254'],['ZA','27'],
    ['AU','61'],['SG','65'],['MY','60'],['ID','62'],['DE','49'],['FR','33']
  ];
  var dialOpts = DIALS.map(function(d){
    return '<option value="'+d[1]+'"'+(d[1]==='91'?' selected':'')+'>'+d[0]+' +'+d[1]+'</option>';
  }).join('');

  var DISPOSABLE = ['mailinator.com','tempmail','temp-mail','10minutemail','guerrillamail','yopmail',
    'trashmail','getnada','dispostable','sharklasers','fakeinbox','throwawaymail','maildrop','mailnesia',
    'mintemail','spam4.me','grr.la','guerrillamailblock'];

  var ov = document.createElement('div');
  ov.className = 'cat-ov';
  ov.innerHTML =
    '<div class="cat-modal" role="dialog" aria-modal="true" aria-label="Download catalogue">'+
      '<span class="grid"></span>'+
      '<button class="cat-x" type="button" aria-label="Close">&#10005;</button>'+
      '<div class="cat-body">'+

        /* STEP 1 — details */
        '<div class="cat-form">'+
          '<div class="cat-ico"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/></svg></div>'+
          '<div class="cat-steps"><i></i><i></i></div>'+
          '<span class="cat-eyebrow"><span class="dot"></span><span class="cat-ey">Catalogue · PDF</span></span>'+
          '<h3 class="cat-title cat-h">Download the catalogue</h3>'+
          '<p class="cat-sub">Tell us where to reach you. We verify your details, send them to our team on WhatsApp, and your PDF downloads instantly.</p>'+
          '<form class="cat-fields" novalidate autocomplete="on">'+
            '<div class="cat-field" data-k="name"><label>Your name</label>'+
              '<input name="name" type="text" placeholder="Full name" autocomplete="name">'+
              '<span class="cat-err">Please enter your full name.</span></div>'+
            '<div class="cat-field" data-k="phone"><label>Phone / WhatsApp</label>'+
              '<div class="cat-row2"><select class="cat-dial" name="dial" aria-label="Country code">'+dialOpts+'</select>'+
              '<input name="phone" type="tel" inputmode="numeric" placeholder="00000 00000" autocomplete="tel"></div>'+
              '<span class="cat-err">Enter a valid mobile number for that country.</span></div>'+
            '<div class="cat-field" data-k="email"><label>Email</label>'+
              '<input name="email" type="email" placeholder="you@company.com" autocomplete="email">'+
              '<span class="cat-err">Enter a valid, non-temporary email.</span></div>'+
            '<input class="cat-hp" name="company_url" tabindex="-1" autocomplete="off" aria-hidden="true">'+
            '<button class="cat-submit" type="submit"><span>Continue</span>'+
              '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></button>'+
            '<p class="cat-note">No spam — used only to follow up on your enquiry.</p>'+
          '</form>'+
        '</div>'+

        /* STEP 2 — confirm + verify */
        '<div class="cat-confirm">'+
          '<div class="cat-steps"><i></i><i></i></div>'+
          '<span class="cat-eyebrow"><span class="dot"></span><span>Step 2 · Confirm</span></span>'+
          '<h3 class="cat-title">Are these correct?</h3>'+
          '<p class="cat-sub">We send your catalogue and any follow-up here, so please double-check.</p>'+
          '<div class="cat-rev">'+
            '<div class="r"><span class="k">Name</span><span class="v rv-name"></span></div>'+
            '<div class="r"><span class="k">Phone</span><span class="v phone rv-phone"></span></div>'+
            '<div class="r"><span class="k">Email</span><span class="v rv-email"></span></div>'+
          '</div>'+
          '<div class="cat-slide"><div class="fill"></div><span class="lbl">Slide to verify &amp; download</span>'+
            '<div class="cat-knob"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></div></div>'+
          '<div class="cat-actions">'+
            '<button class="cat-edit" type="button">Edit</button>'+
            '<button class="cat-confirm-btn" type="button" disabled>'+dlIcon+'<span>Confirm &amp; Download</span></button>'+
          '</div>'+
          '<div class="cat-warn"></div>'+
        '</div>'+

        /* STEP 3 — done */
        '<div class="cat-done">'+
          '<div class="cat-check"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>'+
          '<h3 class="cat-title">Verified — your catalogue is downloading.</h3>'+
          '<p class="cat-sub">We\u2019ve opened WhatsApp with your details so our team can follow up. Didn\u2019t start? <a class="cat-redl">Download again</a></p>'+
        '</div>'+

      '</div>'+
    '</div>';
  document.body.appendChild(ov);

  // refs
  var form  = ov.querySelector('.cat-fields');
  var hEl   = ov.querySelector('.cat-h');
  var eyEl  = ov.querySelector('.cat-ey');
  var fNodes= { name:ov.querySelector('[data-k=name]'), phone:ov.querySelector('[data-k=phone]'), email:ov.querySelector('[data-k=email]') };
  var revName = ov.querySelector('.rv-name'), revPhone = ov.querySelector('.rv-phone'), revEmail = ov.querySelector('.rv-email');
  var slide = ov.querySelector('.cat-slide'), knob = ov.querySelector('.cat-knob'), fill = ov.querySelector('.fill');
  var confirmBtn = ov.querySelector('.cat-confirm-btn'), warn = ov.querySelector('.cat-warn');

  /* ---------- validators ---------- */
  function digits(s){ return (s||'').replace(/[^0-9]/g,''); }
  function isJunkNumber(d){
    if(/^(\d)\1+$/.test(d)) return true;                 // all same digit
    if('01234567890123456789'.indexOf(d)>=0 && d.length>=6) return true; // ascending run
    if('98765432109876543210'.indexOf(d)>=0 && d.length>=6) return true; // descending run
    return false;
  }
  function validName(s){ s=(s||'').trim(); return s.length>=2 && /[a-z]/i.test(s) && !/^\d+$/.test(s); }
  function validPhone(dial, raw){
    var d = digits(raw);
    if(isJunkNumber(d)) return false;
    if(dial==='91') return /^[6-9]\d{9}$/.test(d);       // India: 10 digits, 6-9 start
    if(dial==='971') return d.length>=8 && d.length<=9;  // UAE
    if(dial==='1') return d.length===10;                 // US/CA
    return d.length>=6 && d.length<=13;                  // generic intl
  }
  function validEmail(s){
    s=(s||'').trim().toLowerCase();
    if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(s)) return false;
    var dom = s.split('@')[1]||'';
    for(var i=0;i<DISPOSABLE.length;i++){ if(dom.indexOf(DISPOSABLE[i])>=0) return false; }
    return true;
  }
  function fmtPhone(dial, raw){
    var d = digits(raw);
    if(dial==='91' && d.length===10) return '+91 '+d.slice(0,5)+' '+d.slice(5);
    return '+'+dial+' '+d;
  }

  /* ---------- open / close ---------- */
  function open(cat, machine){
    current.cat = cat; current.machine = machine || 'machine'; current.openedAt = Date.now();
    hEl.textContent = 'Get the ' + current.machine + ' catalogue';
    eyEl.textContent = current.machine + ' · PDF';
    ov.classList.remove('is-done'); ov.removeAttribute('data-step');
    resetSlide();
    try{ var s = JSON.parse(localStorage.getItem(STORE)||'{}');
      if(s.name) form.name.value=s.name; if(s.phone) form.phone.value=s.phone;
      if(s.email) form.email.value=s.email; if(s.dial) form.dial.value=s.dial;
    }catch(e){}
    Object.keys(fNodes).forEach(function(k){ fNodes[k].classList.remove('err'); });
    ov.classList.add('open'); document.body.classList.add('cat-open'); document.body.style.overflow='hidden';
    setTimeout(function(){ if(!form.name.value) form.name.focus(); }, 350);
  }
  function close(){
    ov.classList.remove('open'); document.body.classList.remove('cat-open'); document.body.style.overflow='';
    setTimeout(function(){ ov.classList.remove('is-done'); ov.removeAttribute('data-step'); }, 320);
  }

  /* ---------- step 1 → 2 ---------- */
  form.addEventListener('submit', function(e){
    e.preventDefault();
    // bot honeypot — silently refuse
    if(form.company_url && form.company_url.value){ return; }

    current.name = form.name.value.trim();
    current.dial = form.dial.value;
    current.phone = form.phone.value.trim();
    current.email = form.email.value.trim();

    var ok = true;
    function mark(k, good){ fNodes[k].classList.toggle('err', !good); if(!good) ok=false; }
    mark('name', validName(current.name));
    mark('phone', validPhone(current.dial, current.phone));
    mark('email', validEmail(current.email));
    if(!ok){ return; }

    try{ localStorage.setItem(STORE, JSON.stringify({name:current.name,phone:current.phone,email:current.email,dial:current.dial})); }catch(err){}

    revName.textContent = current.name;
    revPhone.textContent = fmtPhone(current.dial, current.phone);
    revEmail.textContent = current.email;
    resetSlide();
    ov.setAttribute('data-step','2');
  });

  ov.querySelector('.cat-edit').addEventListener('click', function(){ ov.removeAttribute('data-step'); });

  /* ---------- slide to verify ---------- */
  function resetSlide(){ verified=false; slide.classList.remove('done'); knob.style.left='4px'; fill.style.width='56px'; confirmBtn.disabled=true; }
  var dragging=false, startX=0, maxX=0;
  function knobDown(e){ if(verified) return; dragging=true; startX=(e.touches?e.touches[0].clientX:e.clientX); maxX=slide.clientWidth-knob.offsetWidth-8; e.preventDefault(); }
  function knobMove(e){
    if(!dragging) return;
    var x=(e.touches?e.touches[0].clientX:e.clientX)-startX;
    x=Math.max(0,Math.min(maxX,x));
    knob.style.left=(4+x)+'px'; fill.style.width=(56+x)+'px';
    if(x>=maxX-2){ completeSlide(); }
  }
  function knobUp(){ if(!dragging) return; dragging=false; if(!verified){ knob.style.left='4px'; fill.style.width='56px'; } }
  function completeSlide(){
    dragging=false; verified=true; slide.classList.add('done');
    knob.style.left=''; fill.style.width='100%'; confirmBtn.disabled=false;
  }
  knob.addEventListener('mousedown', knobDown); knob.addEventListener('touchstart', knobDown, {passive:false});
  document.addEventListener('mousemove', knobMove); document.addEventListener('touchmove', knobMove, {passive:false});
  document.addEventListener('mouseup', knobUp); document.addEventListener('touchend', knobUp);

  /* ---------- confirm → download + WhatsApp ---------- */
  function withinRateLimit(){
    var now=Date.now(), day=86400000, arr=[];
    try{ arr=JSON.parse(localStorage.getItem(LOG)||'[]'); }catch(e){}
    arr=arr.filter(function(t){ return now-t < day; });
    if(arr.length>=MAX_PER_DAY) return false;
    arr.push(now); try{ localStorage.setItem(LOG, JSON.stringify(arr)); }catch(e){}
    return true;
  }
  function triggerDownload(){
    var a=document.createElement('a'); a.href=current.cat;
    a.download=current.machine.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')+'-catalogue.pdf'; a.rel='noopener';
    document.body.appendChild(a); a.click(); a.remove();
  }
  function sendWhatsApp(){
    var d=digits(current.phone);
    var msg='*New catalogue request*%0A%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%0A'+
      '*Machine:* '+encodeURIComponent(current.machine)+'%0A'+
      '*Name:* '+encodeURIComponent(current.name)+'%0A'+
      '*Phone:* '+encodeURIComponent('+'+current.dial+' '+d)+'%0A'+
      '*Email:* '+encodeURIComponent(current.email)+'%0A%0A'+
      'I have just downloaded the '+encodeURIComponent(current.machine)+' catalogue from your website.';
    window.open('https://wa.me/'+WA+'?text='+msg,'_blank','noopener');
  }
  confirmBtn.addEventListener('click', function(){
    if(!verified) return;
    if(!withinRateLimit()){
      warn.innerHTML='You\u2019ve reached today\u2019s download limit on this device. Please <a href="https://wa.me/'+WA+'" target="_blank" rel="noopener">message us on WhatsApp</a> and we\u2019ll send it across.';
      warn.classList.add('show'); return;
    }
    triggerDownload(); sendWhatsApp(); ov.classList.add('is-done');
  });

  /* ---------- global wiring ---------- */
  document.addEventListener('click', function(e){
    var b=e.target.closest('[data-catalogue]');
    if(b){ e.preventDefault(); open(b.getAttribute('data-catalogue'), b.getAttribute('data-machine')); return; }
    if(e.target===ov || e.target.closest('.cat-x')){ close(); }
    if(e.target.closest('.cat-redl')){ triggerDownload(); }
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && ov.classList.contains('open')) close(); });

  // clear field error as the user corrects it
  form.addEventListener('input', function(e){
    var fld=e.target.closest('.cat-field'); if(fld) fld.classList.remove('err');
  });
})();
