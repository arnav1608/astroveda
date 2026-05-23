// ============================================
// AstroVeda – Site Settings Applier (v2)
// Reads moderator changes from localStorage and applies live to every page
// Include this on EVERY page: <script src="js/site-settings.js"></script>
// ============================================
(function applySiteSettings() {
  'use strict';

  var S = {};
  try { S = JSON.parse(localStorage.getItem('astroveda_site_settings') || '{}'); } catch(e) {}

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function() {

    // ── MAINTENANCE MODE ──────────────────────────────────────────────────────
    if (S.maintenance === true || S.maintenance === 'true') {
      var isMod = false;
      try { var u = JSON.parse(localStorage.getItem('astroveda_current_user')||'null'); isMod = u && u.role === 'moderator'; } catch(e){}
      if (!isMod && !window.location.pathname.includes('dashboard')) {
        document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#02020a;flex-direction:column;gap:1.5rem;text-align:center;padding:2rem;"><div style="font-size:4rem;">🔧</div><div style="font-family:serif;font-size:2rem;color:#c9a84c;">AstroVeda</div><div style="font-family:sans-serif;font-size:1.1rem;color:rgba(168,164,200,.8);">We are currently under maintenance.<br>Please check back soon. 🙏</div></div>';
        return;
      }
    }

    // ── HERO ──────────────────────────────────────────────────────────────────
    if (S.heroTitle)    { var e = document.querySelector('.hero-title');    if(e && !e.querySelector('*')) e.textContent = S.heroTitle; else if(e){ var sp=e.querySelector('span');if(sp)sp.textContent=S.heroTitle; } }
    if (S.heroSubtitle) { var e2=document.querySelector('.hero-subtitle'); if(e2)e2.textContent=S.heroSubtitle; }
    if (S.heroDesc)     { var e3=document.querySelector('.hero-desc');      if(e3)e3.textContent=S.heroDesc; }
    if (S.heroCTA)      { var e4=document.querySelector('.hero-btns .btn-primary span'); if(e4)e4.textContent=S.heroCTA; }

    // ── FOUNDER ───────────────────────────────────────────────────────────────
    if (S.founderName) {
      document.querySelectorAll('.founder-name').forEach(function(el){ el.textContent=S.founderName; });
      document.querySelectorAll('.dash-admin-info strong').forEach(function(el){ el.textContent=S.founderName; });
    }
    if (S.founderTitle) {
      document.querySelectorAll('.founder-title').forEach(function(el){ el.textContent=S.founderTitle; });
    }
    if (S.founderDesc) {
      var fd=document.querySelector('.founder-desc'); if(fd)fd.textContent=S.founderDesc;
    }
    if (S.founderPhoto) {
      // Replace placeholder image
      var placeholder=document.querySelector('.founder-image-placeholder');
      if(placeholder){ placeholder.innerHTML='<img src="'+S.founderPhoto+'" alt="Dr. Shastrijee" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"/>'; }
      // Also update any existing founder img
      document.querySelectorAll('.founder-img').forEach(function(img){ img.src=S.founderPhoto; });
    }

    // ── CONTACT ───────────────────────────────────────────────────────────────
    if (S.contactPhone) {
      var clean = S.contactPhone.replace(/\s/g,'');
      document.querySelectorAll('a[href^="tel:"]').forEach(function(el){
        el.href='tel:'+clean;
        var span=el.querySelector('span'); if(span)span.textContent=S.contactPhone;
      });
      // Plain text phone in footer
      document.querySelectorAll('.footer-contact p, .appt-info-row').forEach(function(el){
        if(el.innerHTML.indexOf('fa-phone')>-1){
          el.innerHTML=el.innerHTML.replace(/\+91[\d\s\-]+/g, S.contactPhone);
        }
      });
    }
    if (S.contactEmail) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function(el){
        el.href='mailto:'+S.contactEmail;
        var span=el.querySelector('span'); if(span)span.textContent=S.contactEmail;
      });
      document.querySelectorAll('.footer-contact p, .appt-info-row').forEach(function(el){
        if(el.innerHTML.indexOf('fa-envelope')>-1){
          el.innerHTML=el.innerHTML.replace(/astrorrshastri@gmail\.com/g, S.contactEmail);
        }
      });
    }
    if (S.whatsapp) {
      var wa = S.whatsapp.replace(/\D/g,'').replace(/^91/,'');
      document.querySelectorAll('a[href*="wa.me"]').forEach(function(el){
        el.href='https://wa.me/91'+wa;
      });
    }

    // ── STATS ─────────────────────────────────────────────────────────────────
    var statMap = {statClients:'15000', statYears:'25', statConsults:'50000', statAwards:'120'};
    Object.keys(statMap).forEach(function(key){
      if(S[key]){
        var el=document.querySelector('.stat-number[data-target="'+statMap[key]+'"]');
        if(el)el.setAttribute('data-target', S[key]);
      }
    });

    // ── PRICING ───────────────────────────────────────────────────────────────
    if (S.priceJyotish) {
      // Service card price display
      var svc1=document.getElementById('svc1');
      if(svc1){ var pr=svc1.querySelector('.appt-service-price'); if(pr)pr.textContent='₹'+parseInt(S.priceJyotish).toLocaleString('en-IN'); }
      // Appointment dropdown
      var sel=document.getElementById('apptService');
      if(sel){ Array.from(sel.options).forEach(function(opt){ if(opt.value&&opt.value.indexOf('Jyotish')>-1){ opt.value='Detailed Jyotish Vishleshan||'+S.priceJyotish; opt.text='🔮 Detailed Jyotish Vishleshan — ₹'+parseInt(S.priceJyotish).toLocaleString('en-IN'); } }); }
    }
    if (S.priceKundli) {
      var svc2=document.getElementById('svc2');
      if(svc2){ var pr2=svc2.querySelector('.appt-service-price'); if(pr2)pr2.textContent='₹'+parseInt(S.priceKundli).toLocaleString('en-IN'); }
      var sel2=document.getElementById('apptService');
      if(sel2){ Array.from(sel2.options).forEach(function(opt){ if(opt.value&&opt.value.indexOf('Kundli')>-1){ opt.value='Kundli Nirman (Birth Chart)||'+S.priceKundli; opt.text='📜 Kundli Nirman — ₹'+parseInt(S.priceKundli).toLocaleString('en-IN'); } }); }
    }

    // ── BOOKINGS GATE ─────────────────────────────────────────────────────────
    if (S.acceptBookings === false || S.acceptBookings === 'false') {
      var btn=document.querySelector('.appt-submit-btn,#apptSubmitBtn');
      if(btn){ btn.disabled=true; btn.style.background='rgba(255,107,107,.25)'; btn.style.cursor='not-allowed'; btn.innerHTML='<i class="fas fa-ban"></i><span>Bookings Temporarily Closed</span>'; }
    }

    // ── REVIEWS GATE ─────────────────────────────────────────────────────────
    if (S.showReviews === false || S.showReviews === 'false') {
      var ts=document.querySelector('.testimonials-section');
      if(ts)ts.style.display='none';
    }

  });
})();
