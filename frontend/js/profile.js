// ============================================
// AstroVeda – Profile JS
// ============================================
const API = window.ASTROVEDA_API || (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api');
function getToken() { return localStorage.getItem('astroveda_token') || ''; }
function authHdr()  { return { 'Content-Type':'application/json', 'Authorization':'Bearer '+getToken() }; }

let user = (() => { try { return JSON.parse(localStorage.getItem('astroveda_current_user')||'null'); } catch(e){ return null; } })();

const guestBanner    = document.getElementById('guestBanner');
const profileSection = document.getElementById('profileSection');

if (!user) {
  if (guestBanner) guestBanner.style.display = 'flex';
} else {
  if (guestBanner)    guestBanner.style.display    = 'none';
  if (profileSection) profileSection.style.display = 'block';
  loadProfile();
  loadMyAppointments();
  loadSavedProducts();
}

// FIX 6: Always fetch live status from MongoDB — never rely on stale localStorage status
function loadMyAppointments() {
  const token = getToken();
  if (!token) { renderBookingsFromLocal(); return; }

  fetch(API + '/appointments/mine', { headers: authHdr() })
  .then(r => r.json())
  .then(data => {
    if (data.success && data.appointments) {
      // Update localStorage with fresh status from MongoDB (source of truth)
      const local = JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
      data.appointments.forEach(apt => {
        const localIdx = local.findIndex(b => b.id === apt.bookingId || b.mongoId === apt._id);
        const merged = {
          id:      apt.bookingId,
          mongoId: apt._id,
          name:    apt.name,
          mobile:  apt.mobile,
          service: apt.service,
          price:   apt.price || 0,
          status:  apt.status,  // always use server status
          dob:     apt.dob,
          booked:  apt.createdAt
        };
        if (localIdx > -1) { local[localIdx] = { ...local[localIdx], ...merged }; }
        else { local.push(merged); }
      });
      localStorage.setItem('astroveda_bookings', JSON.stringify(local));

      renderBookings(data.appointments.map(apt => ({
        id:      apt.bookingId,
        service: apt.service,
        price:   apt.price || 0,
        status:  apt.status || 'Pending',
        dob:     apt.dob,
        booked:  apt.createdAt
      })));
    } else {
      renderBookingsFromLocal();
    }
  })
  .catch(() => renderBookingsFromLocal());
}

function renderBookingsFromLocal() {
  // Read fresh from localStorage — also reflects moderator status changes
  const all = JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
  const mine = all.filter(b => b.mobile === user?.mobile || b.name === user?.name);
  renderBookings(mine);
}

function renderBookings(bookings) {
  const statEl = document.getElementById('statBookings');
  if (statEl) statEl.textContent = bookings.length;

  // Always calculate stats regardless of bookings count
  var reactions = {};
  try { reactions = JSON.parse(localStorage.getItem('astroveda_reactions')||'{}'); } catch(e) {}
  var liked = Object.keys(reactions).filter(function(k){ return k.endsWith('_like') && reactions[k]===true; }).length;
  var posts = JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
  var commented = 0;
  posts.forEach(function(p){ (p.comments||[]).forEach(function(c){ if(c.author===user.name) commented++; }); });
  var statLiked = document.getElementById('statLiked'); if(statLiked) statLiked.textContent = liked;
  var statComments = document.getElementById('statComments'); if(statComments) statComments.textContent = commented;
  const histList = document.getElementById('appointmentHistory');
  if (!histList) return;

  if (!bookings.length) {
    histList.innerHTML = '<p style="color:var(--silver);">No appointments yet. <a href="appointment.html" style="color:var(--gold);">Book your first session!</a></p>';
    return;
  }

  const statusColors = { Confirmed:'#25d366', Completed:'#48cae4', Cancelled:'#ff6b6b', Pending:'#feca57' };

  histList.innerHTML = bookings.map(b => {
    const status = b.status || 'Pending';
    const color  = statusColors[status] || '#feca57';
    const price  = b.price === 0 ? 'FREE' : 'Rs.' + (b.price||0).toLocaleString('en-IN');
    return `
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.12);border-radius:14px;padding:1rem 1.2rem;margin-bottom:.8rem;display:flex;align-items:center;gap:1rem;">
      <div style="font-size:1.8rem;flex-shrink:0;">📅</div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:'Cinzel Decorative',serif;font-size:.85rem;color:var(--gold);margin-bottom:.2rem;">${b.service || 'Consultation'}</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:.78rem;color:var(--silver);">Booking ID: <strong style="color:var(--white);">${b.id||'-'}</strong></div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:.75rem;color:var(--silver);">${price}${b.dob?' · DOB: '+b.dob:''}${b.booked?' · '+new Date(b.booked).toLocaleDateString('en-IN'):''}</div>
      </div>
      <div style="font-family:'Rajdhani',sans-serif;font-size:.78rem;font-weight:700;padding:.3rem .8rem;border-radius:20px;background:${color}22;color:${color};border:1px solid ${color}44;white-space:nowrap;">${status}</div>
    </div>`;
  }).join('');
}

// Saved products
function loadSavedProducts() {
  const savedList = document.getElementById('savedProductsList');
  if (!savedList) return;

  const saved = (() => { try { return JSON.parse(localStorage.getItem('astroveda_saved_products')||'[]'); } catch(e){ return []; } })();
  const uid = user.id || user._id;
  const mine = saved.filter(s => s.userId === uid || s.userId === user.id);

  const statEl = document.getElementById('statSaved');
  if (statEl) statEl.textContent = mine.length;

  if (!mine.length) {
    savedList.innerHTML = '<p style="color:var(--silver);">No saved products yet. Browse our <a href="products.html" style="color:var(--gold);">Products</a> and save items you love.</p>';
    return;
  }

  const allProds = (() => { try { return JSON.parse(localStorage.getItem('astroveda_products')||'null') || []; } catch(e){ return []; } })();

  savedList.innerHTML = mine.map(s => {
    const p = allProds.find(x => x.id === s.productId);
    if (!p) return '';
    return `<div style="background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.12);border-radius:14px;padding:.9rem 1.1rem;display:flex;align-items:center;gap:1rem;">
      <div style="font-size:2rem;">${p.emoji||'✨'}</div>
      <div style="flex:1;">
        <div style="font-family:'Cinzel Decorative',serif;font-size:.85rem;color:var(--white);">${p.name}</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:.8rem;color:var(--gold);">Rs.${p.price.toLocaleString('en-IN')}</div>
      </div>
      <button onclick="removeSaved(${p.id})" style="background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.2);color:#ff6b6b;border-radius:8px;padding:.3rem .7rem;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:.75rem;">Remove</button>
    </div>`;
  }).filter(Boolean).join('');
}

function removeSaved(productId) {
  const uid = user.id || user._id;
  const saved = JSON.parse(localStorage.getItem('astroveda_saved_products')||'[]').filter(s => !((s.userId===uid||s.userId===user.id) && s.productId===productId));
  localStorage.setItem('astroveda_saved_products', JSON.stringify(saved));
  loadSavedProducts();
  if (typeof showToast === 'function') showToast('Removed','Product removed from saved.','🗑️');
}

// Load profile display
function loadProfile() {
  if (!user) return;

  // Update stats immediately on load — don't wait for appointments API
  (function updateStats() {
    var reactions = {};
    try { reactions = JSON.parse(localStorage.getItem('astroveda_reactions')||'{}'); } catch(e) {}
    var liked = Object.keys(reactions).filter(function(k){ return k.endsWith('_like') && reactions[k]===true; }).length;
    var posts = JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
    var commented = 0;
    posts.forEach(function(p){ (p.comments||[]).forEach(function(c){ if(c.author===user.name) commented++; }); });
    var bookings = JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
    var myBookings = bookings.filter(function(b){ return b.mobile===user.mobile||b.name===user.name; });
    var statBookings = document.getElementById('statBookings'); if(statBookings) statBookings.textContent = myBookings.length;
    var statLiked = document.getElementById('statLiked'); if(statLiked) statLiked.textContent = liked;
    var statComments = document.getElementById('statComments'); if(statComments) statComments.textContent = commented;
  })();
  const set  = (id,val)  => { const el=document.getElementById(id); if(el) el.textContent=val; };
  const setH = (id,html) => { const el=document.getElementById(id); if(el) el.innerHTML=html; };

  set('profileName',     user.name||'Astro User');
  set('profileUsername', '@'+(user.username||'user'));
  set('profileBio',      user.bio||'No bio added yet.');
  set('infoName',        user.name||'-');
  set('infoUsername',    '@'+(user.username||'-'));
  set('infoMobile',      user.mobile||'-');
  set('infoLocation',    user.location||'Not set');
  setH('profileLocation',`<i class="fas fa-map-marker-alt"></i> ${user.location||'Not set'}`);
  setH('profileMobile',  `<i class="fas fa-phone"></i> ${user.mobile||'Hidden'}`);
  set('profileJoined', (user.createdAt||user.joined) ? new Date(user.createdAt||user.joined).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) : '-');

  // Avatar
  const avatarEl = document.getElementById('profileAvatarDisplay');
  if (avatarEl) {
    if (user.avatarUrl) avatarEl.innerHTML = `<img src="${user.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
    else avatarEl.textContent = (user.name||'U').charAt(0).toUpperCase();
  }

  // Banner
  const coverEl = document.getElementById('profileCover');
  if (coverEl && user.bannerUrl) {
    coverEl.style.backgroundImage  = `url(${user.bannerUrl})`;
    coverEl.style.backgroundSize   = 'cover';
    coverEl.style.backgroundPosition = 'center';
  }

  const wrap = document.getElementById('interestsWrap');
  if (wrap) {
    const interests = user.interests || [];
    wrap.innerHTML = interests.length
      ? interests.map(i=>`<span class="tag tag-gold">${i}</span>`).join('')
      : '<span style="color:var(--silver);font-size:.9rem;">No interests set.</span>';
  }

  // Stars in cover
  const coverStars = document.getElementById('coverStars');
  if (coverStars && !coverStars.children.length) {
    for (let i=0;i<60;i++){
      const s=document.createElement('div');
      const sz=Math.random()*2+.5;
      s.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(255,255,255,${Math.random()*.6+.2});left:${Math.random()*100}%;top:${Math.random()*100}%;`;
      coverStars.appendChild(s);
    }
  }
}

function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.profile-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name)?.classList.add('active');
  btn.classList.add('active');
  if (name === 'appointments') loadMyAppointments();  // refresh from API on tab switch
  if (name === 'saved')        loadSavedProducts();
}

function openEditModal() {
  if (!user) return;
  document.getElementById('editName').value     = user.name     || '';
  document.getElementById('editBio').value      = user.bio      || '';
  document.getElementById('editLocation').value = user.location || '';
  document.getElementById('editAge').value      = user.age      || '';
  document.querySelectorAll('.interest-opt input').forEach(cb => { cb.checked = (user.interests||[]).includes(cb.value); });
  openModal('editModal');
}

function saveProfile() {
  const name = document.getElementById('editName').value.trim();
  if (!name) { if(typeof showToast==='function') showToast('Error','Name cannot be empty.','❌'); return; }
  const interests = Array.from(document.querySelectorAll('.interest-opt input:checked')).map(cb=>cb.value);
  const updates = { name, bio:document.getElementById('editBio').value.trim(), location:document.getElementById('editLocation').value.trim(), age:document.getElementById('editAge').value, interests };

  fetch(API+'/users/profile', { method:'PUT', headers:authHdr(), body:JSON.stringify(updates) })
  .then(r=>r.json())
  .then(data => {
    const updated = { ...user, ...(data.success ? data.user : updates) };
    localStorage.setItem('astroveda_current_user', JSON.stringify(updated));
    user = updated;
    closeModal('editModal'); loadProfile();
    if(typeof showToast==='function') showToast('Profile Updated!','Changes saved successfully.','✨');
  })
  .catch(() => {
    Object.assign(user, updates);
    localStorage.setItem('astroveda_current_user', JSON.stringify(user));
    closeModal('editModal'); loadProfile();
    if(typeof showToast==='function') showToast('Profile Saved!','Saved locally.','💾');
  });
}

// Avatar upload
function changeAvatar() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = function() {
    if (!this.files||!this.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      user.avatarUrl = e.target.result;
      localStorage.setItem('astroveda_current_user', JSON.stringify(user));
      const el = document.getElementById('profileAvatarDisplay');
      if (el) el.innerHTML = `<img src="${user.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
      if(typeof showToast==='function') showToast('Avatar Updated!','Your profile photo has been changed.','📷');
    };
    reader.readAsDataURL(this.files[0]);
  };
  input.click();
}

// Banner upload
function changeCover() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = function() {
    if (!this.files||!this.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      user.bannerUrl = e.target.result;
      localStorage.setItem('astroveda_current_user', JSON.stringify(user));
      const el = document.getElementById('profileCover');
      if (el) { el.style.backgroundImage=`url(${user.bannerUrl})`;el.style.backgroundSize='cover';el.style.backgroundPosition='center'; }
      if(typeof showToast==='function') showToast('Banner Updated!','Your cover photo has been changed.','🖼️');
    };
    reader.readAsDataURL(this.files[0]);
  };
  input.click();
}

function openModal(id)  { document.getElementById(id)?.classList.add('open');    document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow=''; }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) closeModal(o.id); }));
