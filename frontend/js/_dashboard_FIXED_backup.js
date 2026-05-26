// PASTE THIS ENTIRE FILE INTO D:\Projects\Astrology\frontend\js\dashboard.js
// ============================================
// AstroVeda – Dashboard JS (Fixed)
// ============================================

const API = window.location.port === '5000' ? '/api' : 'http://localhost:5000/api';
function getToken() { return localStorage.getItem('astroveda_token') || ''; }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

// ── Check access on load ──────────────────────────────────────────────────────
(function checkAccess() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('astroveda_current_user')||'null'); } catch(e){ return null; } })();
  const isMod = user && user.role === 'moderator';
  if (isMod) {
    document.getElementById('modLoginGate')?.classList.add('hidden');
    document.getElementById('dashboardWrap')?.classList.remove('hidden');
    initDashboard();
  } else {
    document.getElementById('modLoginGate')?.classList.remove('hidden');
    document.getElementById('dashboardWrap')?.classList.add('hidden');
  }
})();

// ── Password toggle ───────────────────────────────────────────────────────────
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  const icon = btn.querySelector('i');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  if (icon) icon.className = inp.type === 'text' ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// ── Moderator Login ── LOCAL CHECK (no backend needed) ───────────────────────
function modLogin() {
  const u     = (document.getElementById('modUsername')?.value || '').trim();
  const p     =  document.getElementById('modPassword')?.value || '';
  const errEl =  document.getElementById('modLoginError');

  if (!u || !p) {
    if (errEl) { errEl.textContent = 'Please enter username and password.'; errEl.classList.remove('hidden'); }
    return;
  }

  // ✅ LOCAL CHECK — works from file://, localhost:5500, anywhere, no backend needed
  if (u === 'admin' && p === 'astroveda2024') {
    const modUser = {
      id: 'mod_1',
      name: 'Dr. Rajesh R Shastrijee',
      username: 'admin',
      mobile: '8863038229',
      role: 'moderator',
      joined: new Date().toISOString()
    };
    localStorage.setItem('astroveda_current_user', JSON.stringify(modUser));
    errEl?.classList.add('hidden');
    document.getElementById('modLoginGate')?.classList.add('hidden');
    document.getElementById('dashboardWrap')?.classList.remove('hidden');
    initDashboard();

    // Try to sync with backend in background (non-blocking, optional)
    fetch(API + '/auth/mod-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    }).then(r => r.json()).then(data => {
      if (data.success && data.token) {
        localStorage.setItem('astroveda_token', data.token);
        if (data.user) localStorage.setItem('astroveda_current_user', JSON.stringify(data.user));
      }
    }).catch(() => {}); // backend may not be running — that's fine
    return;
  }

  // ❌ Wrong credentials
  if (errEl) {
    errEl.textContent = 'Invalid credentials. Use: admin / astroveda2024';
    errEl.classList.remove('hidden');
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
function modLogout() {
  localStorage.removeItem('astroveda_current_user');
  localStorage.removeItem('astroveda_token');
  window.location.href = '../index.html';
}

// ── Sidebar toggle ────────────────────────────────────────────────────────────
function toggleSidebar() { document.getElementById('dashSidebar')?.classList.toggle('open'); }

// ── Panel switch ──────────────────────────────────────────────────────────────
function switchDash(name, btn) {
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.dash-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name)?.classList.add('active');
  btn.classList.add('active');
  const title = document.getElementById('dashTitle');
  if (title) title.textContent = btn.textContent.trim();
}

// ── Clock ─────────────────────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('dashDateTime');
  if (el) el.textContent = new Date().toLocaleString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// ── Init ──────────────────────────────────────────────────────────────────────
function initDashboard() {
  updateClock();
  setInterval(updateClock, 30000);
  loadUsersFromAPI();
  renderBookingsTable();
  renderProductsTable();
  renderPostsTable();
  renderFeedbackList();
}

// ── Load users (API with localStorage fallback) ───────────────────────────────
function loadUsersFromAPI() {
  fetch(API + '/users', { headers: authHeaders() })
  .then(r => r.json())
  .then(data => {
    if (data.success && data.users) localStorage.setItem('astroveda_users', JSON.stringify(data.users));
    renderOverview(); renderUsersTable();
  })
  .catch(() => { renderOverview(); renderUsersTable(); });
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o =>
  o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); })
);

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function renderOverview() {
  const users    = JSON.parse(localStorage.getItem('astroveda_users')        || '[]');
  const bookings = JSON.parse(localStorage.getItem('astroveda_bookings')     || '[]');
  const posts    = JSON.parse(localStorage.getItem('astroveda_posts')        || '[]');
  const reviews  = JSON.parse(localStorage.getItem('astroveda_testimonials') || '[]');
  const feedbacks= JSON.parse(localStorage.getItem('astroveda_feedbacks')    || '[]');
  const pending  = reviews.filter(r => r.status === 'pending').length;

  const grid = document.getElementById('dashStatsGrid');
  if (grid) grid.innerHTML = [
    { icon:'👥', label:'Total Users',     val:users.length,    color:'#c9a84c' },
    { icon:'📅', label:'Total Bookings',  val:bookings.length, color:'#48cae4' },
    { icon:'📢', label:'Total Posts',     val:posts.length,    color:'#c77dff' },
    { icon:'⭐', label:'Pending Reviews', val:pending,         color:'#ff6b6b' },
    { icon:'💬', label:'Feedbacks',       val:feedbacks.length,color:'#25d366' },
    { icon:'💰', label:'Revenue (₹)',     val:'₹'+bookings.reduce((s,b)=>s+(b.price||0),0).toLocaleString('en-IN'), color:'#feca57' },
  ].map(s => `
    <div class="dash-stat-card" style="border-top:3px solid ${s.color};">
      <div class="dash-stat-icon">${s.icon}</div>
      <div class="dash-stat-val" style="color:${s.color};">${s.val}</div>
      <div class="dash-stat-label">${s.label}</div>
    </div>`).join('');

  const rb = document.getElementById('recentBookings');
  if (rb) rb.innerHTML = [...bookings].reverse().slice(0,6).map(b => `
    <div class="dash-recent-row">
      <span>${b.name}</span>
      <span class="tag tag-gold" style="font-size:0.72rem;">${b.service}</span>
      <span style="font-family:var(--font-ui);font-size:0.75rem;color:${b.status==='Confirmed'?'#25d366':b.status==='Completed'?'#48cae4':b.status==='Cancelled'?'#ff6b6b':'#feca57'}">${b.status}</span>
    </div>`).join('') || '<p style="color:var(--silver);font-size:0.85rem;">No bookings yet.</p>';

  const rs = document.getElementById('recentSignups');
  if (rs) rs.innerHTML = [...users].reverse().slice(0,6).map(u => `
    <div class="dash-recent-row">
      <span>${u.name}</span>
      <span style="font-family:var(--font-ui);font-size:0.78rem;color:var(--silver);">@${u.username}</span>
      <span style="font-family:var(--font-ui);font-size:0.78rem;color:var(--silver);">${u.mobile}</span>
    </div>`).join('') || '<p style="color:var(--silver);font-size:0.85rem;">No users yet.</p>';
}

// ── USERS ─────────────────────────────────────────────────────────────────────
function renderUsersTable() {
  const q = (document.getElementById('userSearch')?.value||'').toLowerCase();
  const users = JSON.parse(localStorage.getItem('astroveda_users')||'[]')
    .filter(u=>!q||u.name?.toLowerCase().includes(q)||u.mobile?.includes(q)||u.username?.toLowerCase().includes(q));
  const cnt = document.getElementById('userCount');
  if (cnt) cnt.textContent = users.length+' Users';
  const body = document.getElementById('usersTableBody');
  if (!body) return;
  body.innerHTML = users.length ? users.map(u=>`
    <tr>
      <td><button class="dash-link-btn" onclick="viewUser('${u._id||u.id}')">${u.name}</button></td>
      <td style="color:var(--silver);">@${u.username}</td>
      <td>${u.mobile}</td>
      <td>${u.createdAt||u.joined?new Date(u.createdAt||u.joined).toLocaleDateString('en-IN'):'-'}</td>
      <td><span style="font-family:var(--font-ui);font-size:0.75rem;padding:0.2rem 0.7rem;border-radius:20px;background:${u.suspended?'rgba(255,107,107,0.1)':'rgba(37,211,102,0.1)'};color:${u.suspended?'#ff6b6b':'#25d366'};border:1px solid ${u.suspended?'rgba(255,107,107,0.3)':'rgba(37,211,102,0.3)'};">${u.suspended?'Suspended':'Active'}</span></td>
      <td class="dash-actions">
        <button class="dash-action-btn edit" onclick="viewUser('${u._id||u.id}')"><i class="fas fa-eye"></i></button>
        <button class="dash-action-btn edit" onclick="toggleSuspend('${u._id||u.id}')"><i class="fas fa-${u.suspended?'unlock':'ban'}"></i></button>
        <button class="dash-action-btn delete" onclick="deleteUser('${u._id||u.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('')
  : '<tr><td colspan="6" style="text-align:center;color:var(--silver);padding:2rem;">No users yet.</td></tr>';
}

function viewUser(id) {
  const users = JSON.parse(localStorage.getItem('astroveda_users')||'[]');
  const bookings = JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
  const u = users.find(x=>(x._id||x.id)==id);
  if (!u) return;
  document.getElementById('userDetailContent').innerHTML = `
    <div style="text-align:center;margin-bottom:1.5rem;">
      <div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-light));display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:var(--black);margin:0 auto 0.8rem;">${u.name.charAt(0)}</div>
      <h3 style="font-family:var(--font-display);color:var(--gold);">${u.name}</h3>
      <p style="font-family:var(--font-ui);color:var(--silver);">@${u.username}</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.5rem;font-family:var(--font-ui);font-size:0.85rem;color:var(--silver);">
      <div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">📱 ${u.mobile}</div>
      <div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">📍 ${u.location||'Not set'}</div>
      <div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">📅 Joined: ${u.createdAt||u.joined?new Date(u.createdAt||u.joined).toLocaleDateString('en-IN'):'-'}</div>
      <div style="padding:.5rem 0;">📋 Bookings: ${bookings.filter(b=>b.mobile===u.mobile).length}</div>
    </div>`;
  openModal('userDetailModal');
}

function toggleSuspend(id) {
  const users = JSON.parse(localStorage.getItem('astroveda_users')||'[]');
  const u = users.find(x=>(x._id||x.id)==id);
  if (!u) return;
  u.suspended = !u.suspended;
  localStorage.setItem('astroveda_users', JSON.stringify(users));
  fetch(API+'/users/'+id+'/suspend',{method:'PUT',headers:authHeaders(),body:JSON.stringify({suspended:u.suspended})}).catch(()=>{});
  renderUsersTable(); renderOverview();
}

function deleteUser(id) {
  if (!confirm('Delete this user permanently?')) return;
  localStorage.setItem('astroveda_users', JSON.stringify(JSON.parse(localStorage.getItem('astroveda_users')||'[]').filter(u=>(u._id||u.id)!=id)));
  fetch(API+'/users/'+id,{method:'DELETE',headers:authHeaders()}).catch(()=>{});
  renderUsersTable(); renderOverview();
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
function renderBookingsTable() {
  const q = (document.getElementById('bookingSearch')?.value||'').toLowerCase();
  const bookings = JSON.parse(localStorage.getItem('astroveda_bookings')||'[]')
    .filter(b=>!q||b.name?.toLowerCase().includes(q)||b.service?.toLowerCase().includes(q)||b.id?.toLowerCase().includes(q));
  const cnt = document.getElementById('bookingCount');
  if (cnt) cnt.textContent = bookings.length+' Bookings';
  const body = document.getElementById('bookingsTableBody');
  if (!body) return;
  body.innerHTML = bookings.length ? [...bookings].reverse().map(b=>`
    <tr>
      <td style="font-family:var(--font-ui);font-size:.75rem;color:var(--gold);">${b.id}</td>
      <td>${b.name}</td><td>${b.mobile}</td><td>${b.service}</td>
      <td style="font-size:.82rem;">${b.dob||'-'}</td>
      <td>${b.price===0?'<span style="color:#25d366;font-weight:700;">FREE</span>':'₹'+(b.price||0).toLocaleString('en-IN')}</td>
      <td><select class="dash-status-select" onchange="updateBookingStatus('${b.id}',this.value)">
        ${['Pending','Confirmed','Completed','Cancelled'].map(s=>`<option${b.status===s?' selected':''}>${s}</option>`).join('')}
      </select></td>
      <td><button class="dash-action-btn delete" onclick="deleteBooking('${b.id}')"><i class="fas fa-trash"></i></button></td>
    </tr>`).join('')
  : '<tr><td colspan="8" style="text-align:center;color:var(--silver);padding:2rem;">No bookings yet.</td></tr>';
}
function updateBookingStatus(id,status) {
  const bookings=JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
  const b=bookings.find(x=>x.id===id);
  if(b){b.status=status;localStorage.setItem('astroveda_bookings',JSON.stringify(bookings));}
}
function deleteBooking(id) {
  if(!confirm('Delete this booking?'))return;
  localStorage.setItem('astroveda_bookings',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_bookings')||'[]').filter(b=>b.id!==id)));
  renderBookingsTable(); renderOverview();
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
function getProds(){try{return JSON.parse(localStorage.getItem('astroveda_products')||'null')||[];}catch(e){return[];}}
function saveProds(p){localStorage.setItem('astroveda_products',JSON.stringify(p));}
function renderProductsTable(){
  const products=getProds();
  const cnt=document.getElementById('productCount');if(cnt)cnt.textContent=products.length+' Products';
  const body=document.getElementById('productsTableBody');if(!body)return;
  body.innerHTML=products.length?products.map(p=>`
    <tr>
      <td style="font-size:1.5rem;">${p.emoji||'✨'}</td>
      <td>${p.name}</td>
      <td><span class="tag tag-gold">${p.category}</span></td>
      <td>₹${(p.price||0).toLocaleString('en-IN')}</td>
      <td class="dash-actions">
        <button class="dash-action-btn edit" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
        <button class="dash-action-btn delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('')
  :'<tr><td colspan="5" style="text-align:center;color:var(--silver);padding:2rem;">No products yet.</td></tr>';
}
function openAddProduct(){
  document.getElementById('productModalTitle').textContent='Add Product';
  ['pName','pEmoji','pDesc','pDetail'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const pp=document.getElementById('pPrice');if(pp)pp.value='';
  document.getElementById('editProductId').value='';openModal('addProductModal');
}
function editProduct(id){
  const p=getProds().find(x=>x.id==id);if(!p)return;
  document.getElementById('productModalTitle').textContent='Edit Product';
  document.getElementById('editProductId').value=id;
  document.getElementById('pName').value=p.name||'';
  document.getElementById('pEmoji').value=p.emoji||'';
  document.getElementById('pCategory').value=p.category||'gemstones';
  document.getElementById('pPrice').value=p.price||0;
  document.getElementById('pDesc').value=p.desc||'';
  document.getElementById('pDetail').value=p.detail||'';
  openModal('addProductModal');
}
function saveProduct(){
  const name=(document.getElementById('pName')?.value||'').trim();
  const price=parseInt(document.getElementById('pPrice')?.value)||0;
  if(!name){alert('Product name required.');return;}
  const editId=document.getElementById('editProductId')?.value;
  let products=getProds();
  if(editId){
    const idx=products.findIndex(p=>p.id==editId);
    if(idx>-1)products[idx]={...products[idx],name,emoji:document.getElementById('pEmoji').value,category:document.getElementById('pCategory').value,price,desc:document.getElementById('pDesc').value,detail:document.getElementById('pDetail').value};
  }else{
    products.push({id:Date.now(),name,emoji:document.getElementById('pEmoji').value||'✨',category:document.getElementById('pCategory').value||'gemstones',price,desc:document.getElementById('pDesc').value,detail:document.getElementById('pDetail').value,planet:'',benefits:''});
  }
  saveProds(products);closeModal('addProductModal');renderProductsTable();
}
function deleteProduct(id){
  if(!confirm('Delete?'))return;
  saveProds(getProds().filter(p=>p.id!=id));renderProductsTable();
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
function renderPostsTable(){
  const posts=JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
  const cnt=document.getElementById('postCount');if(cnt)cnt.textContent=posts.length+' Posts';
  const body=document.getElementById('postsTableBody');if(!body)return;
  body.innerHTML=posts.length?[...posts].reverse().map(p=>`
    <tr>
      <td><span class="tag tag-gold">${p.emoji} ${p.type}</span></td>
      <td style="max-width:220px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--silver);font-size:.85rem;">${p.text.substring(0,55)}...</td>
      <td>${p.likes||0}</td><td>${(p.comments||[]).length}</td>
      <td><button class="dash-action-btn delete" onclick="deletePost(${p.id})"><i class="fas fa-trash"></i></button></td>
    </tr>`).join('')
  :'<tr><td colspan="5" style="text-align:center;color:var(--silver);padding:2rem;">No posts yet.</td></tr>';
}
function openAddPost(){openModal('addPostModal');}
function savePost(){
  const text=(document.getElementById('postText')?.value||'').trim();
  const type=document.getElementById('postType')?.value||'announcement';
  const link=(document.getElementById('postLink')?.value||'').trim();
  if(!text){alert('Post text required.');return;}
  const emojis={announcement:'📢',event:'🌙',wisdom:'✨',offer:'🎁'};
  const posts=JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
  posts.unshift({id:Date.now(),type,emoji:emojis[type]||'📢',author:'Dr. Rajesh R Shastrijee',avatar:'R',time:'Just now',text,link:link||null,media:null,poll:null,likes:0,hearts:0,shares:0,comments:[]});
  localStorage.setItem('astroveda_posts',JSON.stringify(posts));
  closeModal('addPostModal');
  document.getElementById('postText').value='';document.getElementById('postLink').value='';
  renderPostsTable();renderOverview();
}
function deletePost(id){
  if(!confirm('Delete post?'))return;
  localStorage.setItem('astroveda_posts',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_posts')||'[]').filter(p=>p.id!=id)));
  renderPostsTable();renderOverview();
}

// ── FEEDBACK / REVIEWS ────────────────────────────────────────────────────────
function renderFeedbackList(){
  const reviews=JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]');
  const feedbacks=JSON.parse(localStorage.getItem('astroveda_feedbacks')||'[]');
  const list=document.getElementById('feedbackList');if(!list)return;
  const pending=reviews.filter(r=>r.status==='pending');
  list.innerHTML=`
    <h4 class="dash-card-title" style="margin-bottom:1rem;">⭐ Pending Reviews (${pending.length})</h4>
    ${pending.length?pending.map(r=>`
      <div class="feedback-dash-item">
        <div class="feedback-dash-header"><strong>${r.name}</strong><span>${r.location}</span><span style="color:var(--gold);">${'★'.repeat(r.rating)}</span></div>
        <p>"${r.text}"</p>
        <div class="feedback-dash-actions">
          <button class="dash-action-btn edit" onclick="approveReview('${r.id}')"><i class="fas fa-check"></i> Approve</button>
          <button class="dash-action-btn delete" onclick="rejectReview('${r.id}')"><i class="fas fa-times"></i> Reject</button>
        </div>
      </div>`).join(''):'<p style="color:var(--silver);margin-bottom:1.5rem;">No pending reviews.</p>'}
    <hr style="border:none;border-top:1px solid var(--glass-border);margin:1.5rem 0;"/>
    <h4 class="dash-card-title" style="margin-bottom:1rem;">💬 Feedback Messages (${feedbacks.length})</h4>
    ${feedbacks.length?[...feedbacks].reverse().map(f=>`
      <div class="feedback-dash-item">
        <div class="feedback-dash-header"><strong>${f.name}</strong><span>${new Date(f.time).toLocaleDateString('en-IN')}</span></div>
        <p>${f.msg}</p>
      </div>`).join(''):'<p style="color:var(--silver);">No feedback yet.</p>'}`;
}
function approveReview(id){
  const reviews=JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]');
  const r=reviews.find(x=>x.id===id);
  if(r){r.status='approved';localStorage.setItem('astroveda_testimonials',JSON.stringify(reviews));renderFeedbackList();renderOverview();}
}
function rejectReview(id){
  if(!confirm('Reject this review?'))return;
  localStorage.setItem('astroveda_testimonials',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]').filter(r=>r.id!==id)));
  renderFeedbackList();renderOverview();
}
