// ============================================
// AstroVeda – Site Settings Applier (v3 — Complete)
// Single source of truth for all dashboard → frontend sync
// ============================================
(function applySiteSettings() {
  'use strict';

  var S = {};
  try { S = JSON.parse(localStorage.getItem('astroveda_site_settings') || '{}'); } catch(e) {}

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {

    // ── MAINTENANCE MODE ──────────────────────────────────────────────────────
    if (S.maintenance === true || S.maintenance === 'true') {
      var isMod = false;
      try { var u = JSON.parse(localStorage.getItem('astroveda_current_user') || 'null'); isMod = u && u.role === 'moderator'; } catch (e) {}
      if (!isMod && !window.location.pathname.includes('dashboard')) {
        document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#02020a;flex-direction:column;gap:1.5rem;text-align:center;padding:2rem;"><div style="font-size:4rem;">🔧</div><div style="font-family:serif;font-size:2rem;color:#c9a84c;">AstroVeda</div><div style="font-family:sans-serif;font-size:1.1rem;color:rgba(168,164,200,.8);">We are currently under maintenance.<br>Please check back soon. 🙏</div></div>';
        return;
      }
    }

    // ── HERO ──────────────────────────────────────────────────────────────────
    if (S.heroTitle)    { var ht = document.querySelector('.hero-title'); if (ht && !ht.querySelector('*')) ht.textContent = S.heroTitle; else if (ht) { var sp = ht.querySelector('span'); if (sp) sp.textContent = S.heroTitle; } }
    if (S.heroSubtitle) { var hs = document.querySelector('.hero-subtitle'); if (hs) hs.textContent = S.heroSubtitle; }
    if (S.heroDesc)     { var hd = document.querySelector('.hero-desc'); if (hd) hd.textContent = S.heroDesc; }
    if (S.heroCTA)      { var hc = document.querySelector('.hero-btns .btn-primary span'); if (hc) hc.textContent = S.heroCTA; }

    // ── FOUNDER ───────────────────────────────────────────────────────────────
    if (S.founderName) {
      document.querySelectorAll('.founder-name').forEach(function (el) { el.textContent = S.founderName; });
      document.querySelectorAll('.dash-admin-info strong').forEach(function (el) { el.textContent = S.founderName; });
    }
    if (S.founderTitle) { document.querySelectorAll('.founder-title').forEach(function (el) { el.textContent = S.founderTitle; }); }
    if (S.founderDesc)  { var fd = document.querySelector('.founder-desc'); if (fd) fd.textContent = S.founderDesc; }
    if (S.founderPhoto) {
      var ph = document.querySelector('.founder-image-placeholder');
      if (ph) ph.innerHTML = '<img src="' + S.founderPhoto + '" alt="Dr. Shastrijee" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"/>';
      document.querySelectorAll('.founder-img').forEach(function (img) { img.src = S.founderPhoto; });
    }

    // ── FIX 7: PHONE NUMBER — single source, updates everywhere ──────────────
    var phone = (S.whatsapp || S.contactPhone || '8863038229').toString().replace(/\D/g, '').replace(/^91/, '');
    var phoneDisplay = '+91 ' + phone;
    var waUrl = 'https://wa.me/91' + phone;

    // Update all tel: links
    document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
      el.href = 'tel:+91' + phone;
      var span = el.querySelector('span'); if (span) span.textContent = phoneDisplay;
    });
    // Update all wa.me links
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (el) {
      el.href = waUrl; el.target = '_blank';
    });
    // Update plain text phone in rows/footer
    document.querySelectorAll('.appt-info-row, .footer-contact p, .contact-row span').forEach(function (el) {
      if (el.innerHTML.indexOf('fa-phone') > -1 || el.innerHTML.indexOf('fa-whatsapp') > -1) {
        el.innerHTML = el.innerHTML.replace(/\+91[\s\d\-]{8,13}/g, phoneDisplay);
        el.innerHTML = el.innerHTML.replace(/88630382[2-9]\d/g, phone);
      }
    });
    // Update payment modal WhatsApp number
    document.querySelectorAll('.payment-whatsapp-box strong, .booking-whatsapp-reminder strong').forEach(function (el) {
      el.textContent = phoneDisplay;
    });
    // Social / contact IDs
    var waEl = document.getElementById('socialWhatsapp'); if (waEl) waEl.href = waUrl;
    var waFt = document.getElementById('footerWhatsapp'); if (waFt) waFt.href = waUrl;

    // ── EMAIL ─────────────────────────────────────────────────────────────────
    if (S.contactEmail) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
        el.href = 'mailto:' + S.contactEmail;
        var span = el.querySelector('span'); if (span) span.textContent = S.contactEmail;
      });
      document.querySelectorAll('.appt-info-row, .footer-contact p, .contact-row span').forEach(function (el) {
        if (el.innerHTML.indexOf('fa-envelope') > -1) {
          el.innerHTML = el.innerHTML.replace(/[\w.\-]+@[\w.\-]+\.\w+/g, S.contactEmail);
        }
      });
      var ceEl = document.getElementById('contactEmail'); if (ceEl) ceEl.textContent = S.contactEmail;
    }

    // ── STATS ─────────────────────────────────────────────────────────────────
    var statDefaultMap = { statClients: '15000', statYears: '25', statConsults: '50000', statAwards: '120' };
    Object.keys(statDefaultMap).forEach(function (key) {
      if (S[key]) {
        var el = document.querySelector('.stat-number[data-target="' + statDefaultMap[key] + '"]');
        if (el) el.setAttribute('data-target', S[key]);
      }
    });

    // ── FIX 6: PRICING — fully dynamic, no hardcoded values ──────────────────
    var priceJyotish = parseInt(S.priceJyotish) || 2500;
    var priceKundli  = parseInt(S.priceKundli)  || 1500;

    // Update service card display prices
    var svc1 = document.getElementById('svc1');
    if (svc1) {
      var pr1 = svc1.querySelector('.appt-service-price');
      if (pr1) pr1.textContent = '₹' + priceJyotish.toLocaleString('en-IN');
      // Also update onclick handler data
      svc1.setAttribute('onclick', 'selectService(this,\'Detailed Jyotish Vishleshan\',' + priceJyotish + ')');
    }
    var svc2 = document.getElementById('svc2');
    if (svc2) {
      var pr2 = svc2.querySelector('.appt-service-price');
      if (pr2) pr2.textContent = '₹' + priceKundli.toLocaleString('en-IN');
      svc2.setAttribute('onclick', 'selectService(this,\'Kundli Nirman (Birth Chart)\',' + priceKundli + ')');
    }

    // Update service dropdown options
    var sel = document.getElementById('apptService');
    if (sel) {
      Array.from(sel.options).forEach(function (opt) {
        if (opt.value && opt.value.indexOf('Jyotish') > -1) {
          opt.value = 'Detailed Jyotish Vishleshan||' + priceJyotish;
          opt.text = '🔮 Detailed Jyotish Vishleshan — ₹' + priceJyotish.toLocaleString('en-IN');
        }
        if (opt.value && opt.value.indexOf('Kundli') > -1) {
          opt.value = 'Kundli Nirman (Birth Chart)||' + priceKundli;
          opt.text = '📜 Kundli Nirman — ₹' + priceKundli.toLocaleString('en-IN');
        }
      });
    }

    // ── FIX 8: QR CODE — update payment modal immediately ────────────────────
    if (S.qrCode) {
      // Replace QR placeholder with actual image everywhere
      document.querySelectorAll('.qr-placeholder, .qr-inner').forEach(function (el) {
        el.innerHTML = '<img src="' + S.qrCode + '" alt="Payment QR Code" style="width:100%;max-width:260px;height:auto;object-fit:contain;border-radius:12px;display:block;margin:0 auto;"/>';
        el.style.background = 'none';
        el.style.border = 'none';
      });
    }

    // ── SOCIAL LINKS ──────────────────────────────────────────────────────────
    if (S.socialInstagram) {
      var ig1 = document.getElementById('socialInstagram'); if (ig1) { ig1.href = S.socialInstagram; ig1.target = '_blank'; }
      var ig2 = document.getElementById('footerInstagram'); if (ig2) { ig2.href = S.socialInstagram; ig2.target = '_blank'; }
    }
    if (S.socialYoutube) {
      var yt = document.getElementById('socialYoutube'); if (yt) { yt.href = S.socialYoutube; yt.target = '_blank'; }
    }
    if (S.socialFacebook) {
      var fb1 = document.getElementById('socialFacebook'); if (fb1) { fb1.href = S.socialFacebook; fb1.target = '_blank'; }
      var fb2 = document.getElementById('footerFacebook'); if (fb2) { fb2.href = S.socialFacebook; fb2.target = '_blank'; }
    }

    // ── BOOKINGS GATE ─────────────────────────────────────────────────────────
    if (S.acceptBookings === false || S.acceptBookings === 'false') {
      var btn = document.querySelector('.appt-submit-btn, #apptSubmitBtn');
      if (btn) { btn.disabled = true; btn.style.background = 'rgba(255,107,107,.25)'; btn.style.cursor = 'not-allowed'; btn.innerHTML = '<i class="fas fa-ban"></i><span>Bookings Temporarily Closed</span>'; }
    }

    // ── REVIEWS GATE ──────────────────────────────────────────────────────────
    if (S.showReviews === false || S.showReviews === 'false') {
      var ts = document.querySelector('.testimonials-section'); if (ts) ts.style.display = 'none';
    }

  });
})();
