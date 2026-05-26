// Appointment JS — API connected
window.addEventListener('DOMContentLoaded', () => {

const API = window.ASTROVEDA_API || (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api');
function getToken() { return localStorage.getItem('astroveda_token') || ''; }
function authHdr()  { return { 'Content-Type':'application/json', 'Authorization':'Bearer '+getToken() }; }
function v(id)      { return (document.getElementById(id)?.value||'').trim(); }

// ── Current user ──────────────────────────────────────────────────────────────
const currentUser = (() => {
  try { return JSON.parse(localStorage.getItem('astroveda_current_user')||'null'); } catch(e){ return null; }
})();

// ── Auth gate ─────────────────────────────────────────────────────────────────
if (!currentUser) {
  document.getElementById('apptLoginGate').style.display = 'flex';
  document.getElementById('apptContent').style.display   = 'none';
} else {
  document.getElementById('apptLoginGate').style.display = 'none';
  document.getElementById('apptContent').style.display   = 'block';
  const n = document.getElementById('apptName');
  const m = document.getElementById('apptMobile');
  if (n) n.value = currentUser.name   || '';
  if (m) m.value = currentUser.mobile || '';
}

// ── Service selection ─────────────────────────────────────────────────────────
const serviceDesc = {
  'Free Consultation':           { icon:'🎁', desc:'Complimentary intro session. No payment needed.', price:0 },
  'Detailed Jyotish Vishleshan': { icon:'🔮', desc:'In-depth analysis of all 12 houses, Dasha/Antardasha, 5-year predictions and written remedies.', price:2500 },
  'Kundli Nirman (Birth Chart)': { icon:'📜', desc:'Complete Janam Kundli with Rashi, Navamsa and Divisional charts + written interpretation.', price:1500 },
};

let selectedService = '', selectedPrice = 0;

// ── Dropdown service selector ─────────────────────────────────────────────────
window.selectServiceFromDropdown = function(sel) {
  const val = sel.value;
  if (!val) { selectedService=''; selectedPrice=0; return; }
  const parts = val.split('||');
  selectedService = parts[0];
  selectedPrice   = parseInt(parts[1]) || 0;
  clearErr('apptService','apptServiceErr');

  // Sync service cards highlight
  document.querySelectorAll('.appt-service-card').forEach(c => c.classList.remove('selected'));
  if (selectedService === 'Free Consultation')           document.getElementById('svc0')?.classList.add('selected');
  if (selectedService === 'Detailed Jyotish Vishleshan') document.getElementById('svc1')?.classList.add('selected');
  if (selectedService === 'Kundli Nirman (Birth Chart)') document.getElementById('svc2')?.classList.add('selected');

  // Show service detail card
  const icons = { 'Free Consultation':'🎁', 'Detailed Jyotish Vishleshan':'🔮', 'Kundli Nirman (Birth Chart)':'📜', 'Marriage Compatibility':'💑', 'Career & Finance':'💼', 'Vastu & Remedies':'🧿' };
  const descs = {
    'Free Consultation':'Complimentary introductory session — no payment needed.',
    'Detailed Jyotish Vishleshan':'In-depth analysis of all 12 houses, Dasha periods, 5-year predictions and written remedies.',
    'Kundli Nirman (Birth Chart)':'Complete Janam Kundli with Rashi, Navamsa and Divisional charts + written interpretation.',
    'Marriage Compatibility':'Kundali matching with Ashtakoota analysis for a harmonious and blessed union.',
    'Career & Finance':'Planetary guidance for career path, business decisions, and financial prosperity.',
    'Vastu & Remedies':'Gemstone recommendations, mantra remedies, and Vastu corrections for home and office.',
  };
  document.getElementById('serviceDetailCard').style.display = 'block';
  document.getElementById('serviceDetailIcon').textContent   = icons[selectedService] || '✨';
  document.getElementById('serviceDetailName').textContent   = selectedService;
  document.getElementById('serviceDetailDesc').textContent   = descs[selectedService] || '';
  document.getElementById('servicePriceDisplay').innerHTML   = selectedPrice === 0
    ? '<span style="font-family:var(--font-display);font-size:1.2rem;color:#25d366;">✓ FREE</span>'
    : `<span style="font-family:var(--font-display);font-size:1.2rem;color:var(--gold);">₹${selectedPrice.toLocaleString('en-IN')}</span>`;
};

window.selectService = function(el, name, price) {
  document.querySelectorAll('.appt-service-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedService = name; selectedPrice = price;
  const inp = document.getElementById('apptService');
  if (inp) inp.value = name;
  clearErr('apptService','apptServiceErr');
  const detail = serviceDesc[name];
  if (detail) {
    document.getElementById('serviceDetailCard').style.display = 'block';
    document.getElementById('serviceDetailIcon').textContent   = detail.icon;
    document.getElementById('serviceDetailName').textContent   = name;
    document.getElementById('serviceDetailDesc').textContent   = detail.desc;
    document.getElementById('servicePriceDisplay').innerHTML   = price === 0
      ? '<span style="font-family:var(--font-display);font-size:1.2rem;color:#25d366;">✓ FREE</span>'
      : `<span style="font-family:var(--font-display);font-size:1.2rem;color:var(--gold);">₹${price.toLocaleString('en-IN')}</span>`;
  }
};

// ── Validation ────────────────────────────────────────────────────────────────
function clearErr(id, errId) {
  document.getElementById(id)?.classList.remove('invalid');
  document.getElementById(errId)?.classList.remove('show');
}
function showErr(id, errId) {
  document.getElementById(id)?.classList.add('invalid');
  document.getElementById(errId)?.classList.add('show');
}

// ── Submit button ─────────────────────────────────────────────────────────────
document.getElementById('apptSubmitBtn')?.addEventListener('click', () => {
  ['apptName','apptMobile','apptService','apptDOB','apptBirthTime','apptBirthCity','apptBirthDistrict']
    .forEach(id => clearErr(id, id+'Err'));

  let ok = true;
  if (!v('apptName'))                    { showErr('apptName','apptNameErr');               ok=false; }
  if (!/^\d{10}$/.test(v('apptMobile')))  { showErr('apptMobile','apptMobileErr');         ok=false; }
  if (!selectedService)                  { showErr('apptService','apptServiceErr');          ok=false; }
  if (!v('apptDOB'))                     { showErr('apptDOB','apptDOBErr');                 ok=false; }
  if (!v('apptBirthTime'))               { showErr('apptBirthTime','apptBirthTimeErr');     ok=false; }
  if (!v('apptBirthCity'))               { showErr('apptBirthCity','apptBirthCityErr');     ok=false; }
  if (!v('apptBirthDistrict'))           { showErr('apptBirthDistrict','apptBirthDistrictErr'); ok=false; }
  if (!ok) return;

  if (selectedPrice === 0) {
    doConfirmBooking(true);
  } else {
    document.getElementById('paymentAmount').textContent = `Amount: ₹${selectedPrice.toLocaleString('en-IN')}`;
    openModal('paymentModal');
  }
});

// Confirm payment screenshot sent
document.getElementById('confirmPayBtn')?.addEventListener('click', () => {
  closeModal('paymentModal');
  doConfirmBooking(false);
});

// ── Book — calls POST /api/appointments → saves to MongoDB ───────────────────
function doConfirmBooking(isFree) {
  const btn = document.getElementById('apptSubmitBtn');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Booking...'; }

  const payload = {
    name:          v('apptName'),
    mobile:        v('apptMobile'),
    email:         v('apptEmail'),
    service:       selectedService,
    dob:           v('apptDOB'),
    birthTime:     v('apptBirthTime'),
    birthCity:     v('apptBirthCity'),
    birthDistrict: v('apptBirthDistrict'),
    birthState:    v('apptBirthState'),
    message:       v('apptMessage'),
  };

  fetch(API + '/appointments', {
    method: 'POST',
    headers: authHdr(),
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    if (btn) { btn.disabled=false; btn.innerHTML='<span>Book Appointment</span><i class="fas fa-calendar-check"></i>'; }
    if (data.success) {
      // Show booking ID from server
      const el = document.getElementById('bookingId');
      if (el) el.textContent = data.appointment.bookingId;

      // Also cache locally for profile page
      const bookings = JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
      bookings.push({
        id: data.appointment.bookingId,
        name: payload.name, mobile: payload.mobile,
        service: selectedService, price: selectedPrice, isFree,
        dob: payload.dob, status: 'Pending',
        booked: new Date().toISOString()
      });
      localStorage.setItem('astroveda_bookings', JSON.stringify(bookings));

      openModal('successModal');
    } else {
      // Fallback: still show success with local ID if API error
      const localId = 'AV' + Date.now().toString().slice(-6).toUpperCase();
      const el = document.getElementById('bookingId');
      if (el) el.textContent = localId;
      openModal('successModal');
      console.warn('API booking error:', data.message);
    }
  })
  .catch(err => {
    if (btn) { btn.disabled=false; btn.innerHTML='<span>Book Appointment</span><i class="fas fa-calendar-check"></i>'; }
    // Offline fallback — still show success with local booking ID
    const localId = 'AV' + Date.now().toString().slice(-6).toUpperCase();
    const el = document.getElementById('bookingId');
    if (el) el.textContent = localId;

    const bookings = JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
    bookings.push({
      id: localId, name: payload.name, mobile: payload.mobile,
      service: selectedService, price: selectedPrice, isFree,
      dob: payload.dob, status: 'Pending', booked: new Date().toISOString()
    });
    localStorage.setItem('astroveda_bookings', JSON.stringify(bookings));
    openModal('successModal');
    console.warn('Backend offline, booking saved locally:', err);
  });
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow=''; }

// FIX 3: Enlarge QR code — fullscreen lightbox
window.enlargeQR = function(el) {
  // Find the img inside
  var img = el.querySelector('img');
  if (!img) {
    // Try from site settings
    var s = {};
    try { s = JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}'); } catch(e) {}
    if (!s.qrCode) { showToast && showToast('No QR', 'QR code not uploaded yet.', '📷'); return; }
    img = { src: s.qrCode };
  }
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:1rem;cursor:zoom-out;';
  overlay.innerHTML = '<img src="'+img.src+'" style="max-width:min(90vw,500px);max-height:85vh;object-fit:contain;border-radius:16px;box-shadow:0 0 50px rgba(201,168,76,.4);"/>'
    + '<p style="font-family:Rajdhani,sans-serif;color:rgba(255,255,255,.7);font-size:.9rem;text-align:center;">Payment QR — Tap to close</p>';
  overlay.onclick = function(){ document.body.removeChild(overlay); };
  document.body.appendChild(overlay);
};

document.querySelectorAll('.modal-overlay').forEach(o =>
  o.addEventListener('click', e => { if (e.target===o) closeModal(o.id); })
);
document.querySelectorAll('.modal-close').forEach(btn =>
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal-overlay');
    if (modal) closeModal(modal.id);
  })
);

}); // end DOMContentLoaded
