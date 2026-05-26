// ============================================
// AstroVeda – Dashboard JS (Clean Final v5)
// ============================================

const API = (window.ASTROVEDA_API) || (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api');
function getToken()    { return localStorage.getItem('astroveda_token') || ''; }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

// ── Access check on load ──────────────────────────────────────────────────────
(function checkAccess() {
  var user = null;
  try { user = JSON.parse(localStorage.getItem('astroveda_current_user') || 'null'); } catch(e) {}
  if (user && user.role === 'moderator') {
    var gate = document.getElementById('modLoginGate');
    var wrap = document.getElementById('dashboardWrap');
    if (gate) gate.style.display = 'none';
    if (wrap) wrap.style.display = 'flex';
    // If no token stored yet, try to get one from backend silently
    if (!localStorage.getItem('astroveda_token')) {
      fetch(API + '/auth/mod-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'astroveda2024' })
      })
      .then(function(r){ return r.json(); })
      .then(function(d){ if(d.success && d.token) localStorage.setItem('astroveda_token', d.token); })
      .catch(function(){});
    }
    initDashboard();
  }
})();

function showErr(el, msg) { if (!el) return; el.textContent = msg; el.style.display = 'block'; }
function modLogout() { localStorage.removeItem('astroveda_current_user'); localStorage.removeItem('astroveda_token'); window.location.href = '../index.html'; }
function toggleSidebar() { document.getElementById('dashSidebar')?.classList.toggle('open'); }
function updateClock() {
  var el = document.getElementById('dashDateTime');
  if (el) el.textContent = new Date().toLocaleString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function initDashboard() {
  updateClock();
  setInterval(updateClock, 30000);
  renderOverview();
  loadUsersFromAPI();
  renderBookingsTable();
  renderProductsTable();
  renderPostsTable();
  renderFeedbackList();
  // Show QR thumb if saved
  var s = JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');
  if (s.qrCode) {
    var thumb = document.getElementById('qrPreviewThumb');
    var img   = document.getElementById('qrThumbImg');
    if (thumb && img) { img.src = s.qrCode; thumb.style.display='block'; }
  }
}

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(function(o) {
  o.addEventListener('click', function(e) { if (e.target === o) closeModal(o.id); });
});

function switchDash(name, btn) {
  document.querySelectorAll('.dash-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.dash-nav-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('panel-' + name)?.classList.add('active');
  if (btn) { btn.classList.add('active'); var t = document.getElementById('dashTitle'); if (t) t.textContent = btn.textContent.trim(); }
  // FIX: Auto-close sidebar on mobile when a nav item is clicked
  if (window.innerWidth <= 900) {
    document.getElementById('dashSidebar')?.classList.remove('open');
  }
  if (name === 'reviews')      renderReviewsPanel();
  if (name === 'rashi')        renderRashiEditor();
  if (name === 'achievements') renderAchievementsPanel();
  if (name === 'sitecontrol')  loadSiteSettings();
  if (name === 'pageeditor')   loadPageEditor();
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW — loads users + feedback from API
// ═══════════════════════════════════════════════════════════════
function loadUsersFromAPI() {
  // FIX 1: fetch fresh users from MongoDB, merge with localStorage
  fetch(API + '/users', { headers: authHeaders() })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success && d.users && d.users.length) {
        localStorage.setItem('astroveda_users', JSON.stringify(d.users));
      }
      renderOverview(); renderUsersTable();
    })
    .catch(function() { renderOverview(); renderUsersTable(); });

  // FIX 2: also fetch feedback from MongoDB
  fetch(API + '/feedback', { headers: authHeaders() })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success && d.feedbacks && d.feedbacks.length) {
        // Normalize MongoDB feedback to match localStorage format
        var normalized = d.feedbacks.map(function(f) {
          return { id: f._id, name: f.name, msg: f.message, time: f.createdAt };
        });
        localStorage.setItem('astroveda_feedbacks', JSON.stringify(normalized));
        renderFeedbackList();
      }
    })
    .catch(function() {}); // silently fail — localStorage fallback
}

function renderOverview() {
  var users     = JSON.parse(localStorage.getItem('astroveda_users')        || '[]');
  var bookings  = JSON.parse(localStorage.getItem('astroveda_bookings')     || '[]');
  var posts     = JSON.parse(localStorage.getItem('astroveda_posts')        || '[]');
  var reviews   = JSON.parse(localStorage.getItem('astroveda_testimonials') || '[]');
  var f1=[],f2=[];
  try{f1=JSON.parse(localStorage.getItem('astroveda_feedbacks')||'[]');}catch(e){}
  try{f2=JSON.parse(localStorage.getItem('astroveda_feedback')||'[]');}catch(e){}
  var feedbacks = f1.concat(f2);
  var pending   = reviews.filter(function(r) { return r.status === 'pending'; }).length;

  var grid = document.getElementById('dashStatsGrid');
  if (grid) {
    var stats = [
      { icon:'👥', label:'Total Users',     val:users.length,    color:'#c9a84c' },
      { icon:'📅', label:'Total Bookings',  val:bookings.length, color:'#48cae4' },
      { icon:'📢', label:'Total Posts',     val:posts.length,    color:'#c77dff' },
      { icon:'⭐', label:'Pending Reviews', val:pending,         color:'#ff6b6b' },
      { icon:'💬', label:'Feedbacks',       val:feedbacks.length,color:'#25d366' },
      { icon:'💰', label:'Revenue (₹)',     val:'₹'+bookings.reduce(function(s,b){return s+(b.price||0);},0).toLocaleString('en-IN'), color:'#feca57' }
    ];
    grid.innerHTML = stats.map(function(s) {
      return '<div class="dash-stat-card" style="border-top:3px solid '+s.color+';">'
        + '<div class="dash-stat-icon">'+s.icon+'</div>'
        + '<div class="dash-stat-val" style="color:'+s.color+';">'+s.val+'</div>'
        + '<div class="dash-stat-label">'+s.label+'</div></div>';
    }).join('');
  }

  var rb = document.getElementById('recentBookings');
  if (rb) rb.innerHTML = ([...bookings].reverse().slice(0,5)).map(function(b) {
    var sc = b.status==='Confirmed'?'#25d366':b.status==='Completed'?'#48cae4':b.status==='Cancelled'?'#ff6b6b':'#feca57';
    return '<div class="dash-recent-row"><span>'+b.name+'</span><span class="tag tag-gold" style="font-size:.72rem;">'+b.service+'</span><span style="font-family:var(--font-ui);font-size:.75rem;color:'+sc+';">'+b.status+'</span></div>';
  }).join('') || '<p style="color:var(--silver);font-size:.85rem;">No bookings yet.</p>';

  var rs = document.getElementById('recentSignups');
  if (rs) rs.innerHTML = ([...users].reverse().slice(0,5)).map(function(u) {
    return '<div class="dash-recent-row"><span>'+u.name+'</span><span style="font-family:var(--font-ui);font-size:.78rem;color:var(--silver);">@'+u.username+'</span><span style="font-family:var(--font-ui);font-size:.78rem;color:var(--silver);">'+u.mobile+'</span></div>';
  }).join('') || '<p style="color:var(--silver);font-size:.85rem;">No users yet.</p>';
}

// ═══════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════
function renderUsersTable() {
  var q = (document.getElementById('userSearch')?.value||'').toLowerCase();
  var users = JSON.parse(localStorage.getItem('astroveda_users')||'[]')
    .filter(function(u){ return !q||u.name?.toLowerCase().includes(q)||u.mobile?.includes(q)||u.username?.toLowerCase().includes(q); });
  var cnt = document.getElementById('userCount'); if (cnt) cnt.textContent = users.length+' Users';
  var body = document.getElementById('usersTableBody'); if (!body) return;
  body.innerHTML = users.length ? users.map(function(u) {
    var bg = u.suspended ? 'rgba(255,107,107,.1)':'rgba(37,211,102,.1)';
    var cl = u.suspended ? '#ff6b6b':'#25d366';
    var bc = u.suspended ? 'rgba(255,107,107,.3)':'rgba(37,211,102,.3)';
    return '<tr><td><button class="dash-link-btn" onclick="viewUser(\''+( u._id||u.id)+'\')">'+u.name+'</button></td>'
      +'<td style="color:var(--silver);">@'+u.username+'</td><td>'+u.mobile+'</td>'
      +'<td>'+(u.createdAt||u.joined?new Date(u.createdAt||u.joined).toLocaleDateString('en-IN'):'-')+'</td>'
      +'<td><span style="font-family:var(--font-ui);font-size:.75rem;padding:.2rem .7rem;border-radius:20px;background:'+bg+';color:'+cl+';border:1px solid '+bc+';">'+(u.suspended?'Suspended':'Active')+'</span></td>'
      +'<td class="dash-actions">'
      +'<button class="dash-action-btn edit" onclick="viewUser(\''+( u._id||u.id)+'\')"><i class="fas fa-eye"></i></button>'
      +'<button class="dash-action-btn edit" onclick="toggleSuspend(\''+( u._id||u.id)+'\')"><i class="fas fa-'+(u.suspended?'unlock':'ban')+'"></i></button>'
      +'<button class="dash-action-btn delete" onclick="deleteUser(\''+( u._id||u.id)+'\')"><i class="fas fa-trash"></i></button>'
      +'</td></tr>';
  }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--silver);padding:2rem;">No users yet. Click Refresh after new signups.</td></tr>';
}

function viewUser(id) {
  var users=JSON.parse(localStorage.getItem('astroveda_users')||'[]');
  var bookings=JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
  var u=users.find(function(x){return(x._id||x.id)==id;});if(!u)return;
  document.getElementById('userDetailContent').innerHTML=
    '<div style="text-align:center;margin-bottom:1.5rem;">'
    +'<div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-light));display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:#020210;margin:0 auto .8rem;">'+u.name.charAt(0)+'</div>'
    +'<h3 style="font-family:var(--font-display);color:var(--gold);">'+u.name+'</h3>'
    +'<p style="font-family:var(--font-ui);color:var(--silver);">@'+u.username+'</p></div>'
    +'<div style="display:flex;flex-direction:column;gap:.5rem;font-family:var(--font-ui);font-size:.85rem;color:var(--silver);">'
    +'<div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">📱 '+u.mobile+'</div>'
    +'<div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">📍 '+(u.location||'Not set')+'</div>'
    +'<div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">📅 Joined: '+(u.createdAt||u.joined?new Date(u.createdAt||u.joined).toLocaleDateString('en-IN'):'-')+'</div>'
    +'<div style="padding:.5rem 0;">📋 Bookings: '+bookings.filter(function(b){return b.mobile===u.mobile;}).length+'</div></div>';
  openModal('userDetailModal');
}

function toggleSuspend(id) {
  var users=JSON.parse(localStorage.getItem('astroveda_users')||'[]');
  var u=users.find(function(x){return(x._id||x.id)==id;});if(!u)return;
  u.suspended=!u.suspended;localStorage.setItem('astroveda_users',JSON.stringify(users));
  fetch(API+'/users/'+id+'/suspend',{method:'PUT',headers:authHeaders(),body:JSON.stringify({suspended:u.suspended})}).catch(function(){});
  renderUsersTable();renderOverview();
}
function deleteUser(id) {
  if(!confirm('Delete this user permanently?'))return;
  localStorage.setItem('astroveda_users',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_users')||'[]').filter(function(u){return(u._id||u.id)!=id;})));
  fetch(API+'/users/'+id,{method:'DELETE',headers:authHeaders()}).catch(function(){});
  renderUsersTable();renderOverview();
}

// ═══════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════
function renderBookingsTable() {
  var q=(document.getElementById('bookingSearch')?.value||'').toLowerCase();
  var bookings=JSON.parse(localStorage.getItem('astroveda_bookings')||'[]')
    .filter(function(b){return!q||b.name?.toLowerCase().includes(q)||b.service?.toLowerCase().includes(q)||(b.id||'').toLowerCase().includes(q);});
  var cnt=document.getElementById('bookingCount');if(cnt)cnt.textContent=bookings.length+' Bookings';
  var body=document.getElementById('bookingsTableBody');if(!body)return;
  var sc={Confirmed:'#25d366',Completed:'#48cae4',Cancelled:'#ff6b6b',Pending:'#feca57'};
  body.innerHTML=bookings.length?[...bookings].reverse().map(function(b){
    var c=sc[b.status]||'#feca57';
    var ph=b.price===0?'<span style="color:#25d366;font-weight:700;">FREE</span>':'₹'+(b.price||0).toLocaleString('en-IN');
    var opts=['Pending','Confirmed','Completed','Cancelled'].map(function(s){return'<option'+(b.status===s?' selected':'')+'>'+s+'</option>';}).join('');
    return'<tr><td style="font-family:var(--font-ui);font-size:.75rem;color:var(--gold);">'+(b.id||'-')+'</td>'
      +'<td>'+b.name+'</td><td>'+b.mobile+'</td><td style="font-size:.82rem;">'+b.service+'</td>'
      +'<td style="font-size:.78rem;color:var(--silver);">'+(b.dob||'-')+'</td>'
      +'<td>'+ph+'</td>'
      +'<td><select class="dash-status-select" style="background:rgba(255,255,255,.06);border:1px solid var(--glass-border);border-radius:8px;color:'+c+';font-family:var(--font-ui);font-size:.78rem;padding:.3rem .5rem;cursor:pointer;" onchange="updateBookingStatus(\''+b.id+'\',this.value)">'+opts+'</select></td>'
      +'<td><button class="dash-action-btn delete" onclick="deleteBooking(\''+b.id+'\')"><i class="fas fa-trash"></i></button></td>'
      +'</tr>';
  }).join(''):'<tr><td colspan="8" style="text-align:center;color:var(--silver);padding:2rem;">No bookings yet.</td></tr>';
}
function updateBookingStatus(id,status) {
  var bookings=JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
  var b=bookings.find(function(x){return String(x.id)===String(id)||String(x.mongoId)===String(id);});
  if(b){b.status=status;localStorage.setItem('astroveda_bookings',JSON.stringify(bookings));}
  var mid=(b&&b.mongoId)||id;
  fetch(API+'/appointments/'+mid+'/status',{method:'PATCH',headers:authHeaders(),body:JSON.stringify({status:status})}).catch(function(){});
  renderBookingsTable();renderOverview();
}
function deleteBooking(id) {
  if(!confirm('Delete this booking?'))return;
  localStorage.setItem('astroveda_bookings',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_bookings')||'[]').filter(function(b){return b.id!==id;})));
  renderBookingsTable();renderOverview();
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTS — 38 defaults auto-load, no button needed
// ═══════════════════════════════════════════════════════════════
var productImgData='';
function previewProductImg(input) {
  if(!input.files||!input.files[0])return;
  var reader=new FileReader();
  reader.onload=function(e){
    productImgData=e.target.result;
    var prev=document.getElementById('productImgPreview');
    if(prev)prev.innerHTML='<div class="img-preview-item"><img src="'+productImgData+'"/><button class="del-img" onclick="productImgData=\'\';this.parentElement.remove()"><i class="fas fa-times"></i></button></div>';
  };
  reader.readAsDataURL(input.files[0]);
}
function getProds(){try{return JSON.parse(localStorage.getItem('astroveda_products')||'null')||[];}catch(e){return[];}}
function saveProds(p){localStorage.setItem('astroveda_products',JSON.stringify(p));}

function getDefaultProducts(){return[
  {id:1,name:'One Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:5000,planet:'Sun (Surya)',benefits:'Supreme consciousness.',desc:'Rarest Rudraksha, Lord Shiva.',detail:'Nepal origin, certified.'},
  {id:2,name:'Two Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:800,planet:'Moon (Chandra)',benefits:'Emotional balance.',desc:'Shiva-Parvati union.',detail:'Nepal, certified.'},
  {id:3,name:'Three Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:600,planet:'Mars (Mangal)',benefits:'Removes fear.',desc:'Represents Agni.',detail:'Nepal, silver cap.'},
  {id:4,name:'Four Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:550,planet:'Mercury (Budh)',benefits:'Intelligence, memory.',desc:'Lord Brahma.',detail:'Nepal, certified.'},
  {id:5,name:'Five Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:400,planet:'Jupiter (Guru)',benefits:'Health, peace.',desc:'Kalagni Rudra.',detail:'Nepal, red thread.'},
  {id:6,name:'Six Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:700,planet:'Venus (Shukra)',benefits:'Love, creativity.',desc:'Kartikeya.',detail:'Nepal, certified.'},
  {id:7,name:'Seven Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:900,planet:'Saturn (Shani)',benefits:'Wealth, health.',desc:'Mahalakshmi.',detail:'Nepal, certified.'},
  {id:8,name:'Eight Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:1200,planet:'Rahu',benefits:'Removes Rahu doshas.',desc:'Ganesha.',detail:'Nepal, silver capped.'},
  {id:9,name:'Nine Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:1800,planet:'Ketu',benefits:'Removes Ketu doshas.',desc:'Goddess Durga.',detail:'Nepal, certified.'},
  {id:10,name:'Ten Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:2500,planet:'All Planets',benefits:'Neutralizes all doshas.',desc:'Lord Vishnu.',detail:'Nepal, certified.'},
  {id:11,name:'Eleven Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:3500,planet:'All Planets',benefits:'Wisdom, meditation.',desc:'11 Rudras.',detail:'Nepal, certified.'},
  {id:12,name:'Twelve Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:5000,planet:'Sun (Surya)',benefits:'Radiance, leadership.',desc:'Surya dev.',detail:'Nepal, gold capped.'},
  {id:13,name:'Thirteen Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:8000,planet:'Venus (Shukra)',benefits:'Fulfills desires.',desc:'Lord Indra.',detail:'Nepal, gold capped.'},
  {id:14,name:'Fourteen Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:12000,planet:'Saturn (Shani)',benefits:'Supreme protection.',desc:'Deva Mani.',detail:'Nepal, gold capped.'},
  {id:101,name:'Manik (Ruby)',category:'gemstones',emoji:'💎',price:12000,planet:'Sun (Surya)',benefits:'Confidence, leadership.',desc:'Strengthen Sun.',detail:'Burmese Ruby, 3-4 ct.'},
  {id:102,name:'Moti (Pearl)',category:'gemstones',emoji:'💎',price:3000,planet:'Moon (Chandra)',benefits:'Emotional peace.',desc:'Strengthen Moon.',detail:'Sea pearl, 5-7 ct.'},
  {id:103,name:'Moonga (Red Coral)',category:'gemstones',emoji:'💎',price:4000,planet:'Mars (Mangal)',benefits:'Courage, strength.',desc:'Strengthen Mars.',detail:'Italian Red Coral.'},
  {id:104,name:'Panna (Emerald)',category:'gemstones',emoji:'💎',price:10000,planet:'Mercury (Budh)',benefits:'Intelligence, business.',desc:'Strengthen Mercury.',detail:'Zambian Emerald.'},
  {id:105,name:'Pukhraj (Yellow Sapphire)',category:'gemstones',emoji:'💎',price:8000,planet:'Jupiter (Guru)',benefits:'Wisdom, wealth.',desc:'Strengthen Jupiter.',detail:'Ceylon Yellow Sapphire.'},
  {id:106,name:'Heera (Diamond)',category:'gemstones',emoji:'💎',price:50000,planet:'Venus (Shukra)',benefits:'Love, luxury.',desc:'Strengthen Venus.',detail:'White diamond, 0.5ct.'},
  {id:107,name:'Neelam (Blue Sapphire)',category:'gemstones',emoji:'💎',price:15000,planet:'Saturn (Shani)',benefits:'Career, discipline.',desc:'Consult before wearing.',detail:'Ceylon Blue Sapphire.'},
  {id:108,name:'Gomedh (Hessonite)',category:'gemstones',emoji:'💎',price:4500,planet:'Rahu',benefits:'Removes Rahu doshas.',desc:'Pacify Rahu.',detail:'Ceylon Hessonite.'},
  {id:109,name:"Lehsunia (Cat's Eye)",category:'gemstones',emoji:'💎',price:6000,planet:'Ketu',benefits:'Removes Ketu doshas.',desc:'For Ketu.',detail:'Ceylon Chrysoberyl.'},
  {id:110,name:'Opal',category:'gemstones',emoji:'💎',price:3500,planet:'Venus (Shukra)',benefits:'Creativity, love.',desc:'Alt to Heera.',detail:'Australian Opal.'},
  {id:111,name:'Turquoise (Firoza)',category:'gemstones',emoji:'💎',price:2500,planet:'Jupiter (Guru)',benefits:'Luck, protection.',desc:'Alt to Pukhraj.',detail:'Persian Turquoise.'},
  {id:112,name:'Amethyst',category:'gemstones',emoji:'💎',price:1500,planet:'Saturn (Shani)',benefits:'Peace, clarity.',desc:'For Saturn.',detail:'Natural Amethyst.'},
  {id:113,name:'Sphatik (Crystal Quartz)',category:'gemstones',emoji:'💎',price:800,planet:'Universal',benefits:'Universal healing.',desc:'Sacred crystal.',detail:'Natural clear quartz.'},
  {id:114,name:'Moonstone',category:'gemstones',emoji:'💎',price:2200,planet:'Moon (Chandra)',benefits:'Emotional healing.',desc:'Alt to Pearl.',detail:'Ceylon Moonstone.'},
  {id:201,name:'Shree Yantra (Silver)',category:'yantras',emoji:'🔯',price:3500,planet:'Lakshmi/Venus',benefits:'Wealth, prosperity.',desc:'Most powerful Yantra.',detail:'925 pure silver.'},
  {id:202,name:'Kuber Yantra',category:'yantras',emoji:'🔯',price:1500,planet:'Jupiter/Kuber',benefits:'Financial abundance.',desc:'Lord Kuber Yantra.',detail:'Gold-plated copper.'},
  {id:203,name:'Vastu Yantra',category:'yantras',emoji:'🔯',price:2000,planet:'All Planets',benefits:'Corrects Vastu doshas.',desc:'Neutralizes defects.',detail:'Copper.'},
  {id:204,name:'Surya Yantra',category:'yantras',emoji:'🔯',price:1200,planet:'Sun (Surya)',benefits:'Government favor.',desc:'Lord Surya Yantra.',detail:'Copper.'},
  {id:205,name:'Mahamrityunjaya Yantra',category:'yantras',emoji:'🔯',price:2500,planet:'Shiva/Saturn',benefits:'Protection.',desc:'Powerful protection Yantra.',detail:'Silver-coated copper.'},
  {id:206,name:'Navgraha Yantra',category:'yantras',emoji:'🔯',price:3000,planet:'All 9 Planets',benefits:'Balances 9 planets.',desc:'All 9 in one.',detail:'Gold-plated copper.'},
  {id:301,name:'Sacred Dhoop Sticks Set',category:'spiritual',emoji:'🕯️',price:350,planet:'All Planets',benefits:'Purifies home.',desc:'Premium dhoop.',detail:'6 fragrances.'},
  {id:302,name:'Crystal Singing Bowl',category:'spiritual',emoji:'🔔',price:2200,planet:'All Planets',benefits:'Chakra balancing.',desc:'Himalayan crystal bowl.',detail:'8-inch, 432 Hz.'},
  {id:303,name:'Tulsi Mala (108 beads)',category:'spiritual',emoji:'📿',price:400,planet:'Jupiter',benefits:'Japa meditation.',desc:'Sacred Tulsi mala.',detail:'108+1 beads.'},
  {id:304,name:'Gomti Chakra (Set of 11)',category:'spiritual',emoji:'🌀',price:299,planet:'Moon',benefits:'Vastu remedy.',desc:'Natural Gomti Chakras.',detail:'Set of 11.'}
];}

function clearAllProducts(){if(!confirm('Delete ALL products?'))return;localStorage.removeItem('astroveda_products');renderProductsTable();alert('Cleared. 38 defaults will reload.');}

function renderProductsTable() {
  var products=getProds();
  if(!products.length){var d=getDefaultProducts();saveProds(d);products=d;}
  var cnt=document.getElementById('productCount');if(cnt)cnt.textContent=products.length+' Products';
  var body=document.getElementById('productsTableBody');if(!body)return;
  body.innerHTML=products.length?products.map(function(p){
    var ih=(p.imageData||p.imageUrl)?'<img src="'+(p.imageData||p.imageUrl)+'" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" onerror="this.style.display=\'none\'"/>'
      :'<span style="font-size:1.5rem;">'+(p.emoji||'✨')+'</span>';
    return'<tr><td style="width:60px;">'+ih+'</td><td>'+p.name+'</td>'
      +'<td><span class="tag tag-gold">'+p.category+'</span></td>'
      +'<td style="font-size:.78rem;color:var(--silver);">'+(p.planet||'-')+'</td>'
      +'<td>₹'+(p.price||0).toLocaleString('en-IN')+'</td>'
      +'<td class="dash-actions">'
      +'<button class="dash-action-btn edit" onclick="editProduct('+p.id+')"><i class="fas fa-edit"></i></button>'
      +'<button class="dash-action-btn delete" onclick="deleteProduct('+p.id+')"><i class="fas fa-trash"></i></button>'
      +'</td></tr>';
  }).join(''):'<tr><td colspan="6" style="text-align:center;color:var(--silver);padding:2rem;">No products.</td></tr>';
}
function openAddProduct(){
  document.getElementById('productModalTitle').textContent='Add Product';
  document.getElementById('editProductId').value='';
  ['pName','pEmoji','pImageUrl','pPlanet','pPlanetHi','pBenefits','pDesc','pDetail'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var pp=document.getElementById('pPrice');if(pp)pp.value='';
  document.getElementById('pCategory').value='gemstones';
  document.getElementById('productImgPreview').innerHTML='';
  productImgData='';openModal('addProductModal');
}
function editProduct(id){
  var p=getProds().find(function(x){return x.id==id;});if(!p)return;
  document.getElementById('productModalTitle').textContent='Edit Product';
  document.getElementById('editProductId').value=id;
  document.getElementById('pName').value=p.name||'';
  document.getElementById('pEmoji').value=p.emoji||'';
  document.getElementById('pCategory').value=p.category||'gemstones';
  document.getElementById('pPrice').value=p.price||0;
  document.getElementById('pPlanet').value=p.planet||'';
  var ph=document.getElementById('pPlanetHi');if(ph)ph.value=p.planetHi||'';
  var pb=document.getElementById('pBenefits');if(pb)pb.value=p.benefits||'';
  document.getElementById('pDesc').value=p.desc||'';
  document.getElementById('pDetail').value=p.detail||'';
  document.getElementById('pImageUrl').value=p.imageUrl||'';
  productImgData=p.imageData||'';
  document.getElementById('productImgPreview').innerHTML=productImgData
    ?'<div class="img-preview-item"><img src="'+productImgData+'"/><button class="del-img" onclick="productImgData=\'\';this.parentElement.remove()"><i class="fas fa-times"></i></button></div>':'';
  openModal('addProductModal');
}
function saveProduct(){
  var name=(document.getElementById('pName')?.value||'').trim();
  var price=parseInt(document.getElementById('pPrice')?.value)||0;
  if(!name){alert('Product name required.');return;}
  var editId=document.getElementById('editProductId')?.value;
  var imgUrl=(document.getElementById('pImageUrl')?.value||'').trim();
  var products=getProds();
  var prod={name:name,emoji:document.getElementById('pEmoji')?.value||'✨',category:document.getElementById('pCategory')?.value||'gemstones',price:price,
    planet:document.getElementById('pPlanet')?.value||'',planetHi:document.getElementById('pPlanetHi')?.value||'',
    benefits:document.getElementById('pBenefits')?.value||'',desc:document.getElementById('pDesc')?.value||'',
    detail:document.getElementById('pDetail')?.value||'',imageData:productImgData||'',imageUrl:imgUrl};
  if(editId){var idx=products.findIndex(function(p){return p.id==editId;});if(idx>-1)products[idx]=Object.assign(products[idx],prod);}
  else{products.push(Object.assign({id:Date.now()},prod));}
  saveProds(products);closeModal('addProductModal');renderProductsTable();productImgData='';
}
function deleteProduct(id){if(!confirm('Delete?'))return;saveProds(getProds().filter(function(p){return p.id!=id;}));renderProductsTable();}

// ═══════════════════════════════════════════════════════════════
// ANNOUNCEMENTS / POSTS
// ═══════════════════════════════════════════════════════════════
var postImagesList=[],currentPostType='announcement';
function setPostType(type,btn){currentPostType=type;document.querySelectorAll('.ptype-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');document.getElementById('postType').value=type;}
function previewPostImages(input){if(!input.files)return;Array.from(input.files).slice(0,4-postImagesList.length).forEach(function(file){var reader=new FileReader();reader.onload=function(e){postImagesList.push({type:'data',val:e.target.result});renderPostImgPreviews();};reader.readAsDataURL(file);});}
function addPostImageUrl(){var url=(document.getElementById('postImgUrl')?.value||'').trim();if(!url)return;postImagesList.push({type:'url',val:url});document.getElementById('postImgUrl').value='';renderPostImgPreviews();}
function renderPostImgPreviews(){document.getElementById('postImgPreview').innerHTML=postImagesList.map(function(img,i){return'<div class="img-preview-item"><img src="'+img.val+'" onerror="this.style.display=\'none\'"/><button class="del-img" onclick="removePostImg('+i+')"><i class="fas fa-times"></i></button></div>';}).join('');}
function removePostImg(idx){postImagesList.splice(idx,1);renderPostImgPreviews();}
function addPollOption(){var div=document.createElement('div');div.className='poll-option-row';div.innerHTML='<input type="text" class="form-input" placeholder="Option"/><button class="poll-del-btn" onclick="removePollOption(this)"><i class="fas fa-times"></i></button>';document.getElementById('pollOptions').appendChild(div);}
function removePollOption(btn){btn.parentElement.remove();}

function renderPostsTable(){
  var posts=JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
  var cnt=document.getElementById('postCount');if(cnt)cnt.textContent=posts.length+' Posts';
  var body=document.getElementById('postsTableBody');if(!body)return;
  body.innerHTML=posts.length?[...posts].reverse().map(function(p){
    var lc=Array.isArray(p.likes)?p.likes.length:(typeof p.likes==='number'?p.likes:0);
    return'<tr><td><span class="tag tag-gold">'+(p.emoji||'📢')+' '+(p.type||'post')+'</span></td>'
      +'<td style="max-width:220px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--silver);font-size:.85rem;">'+(p.text||'').substring(0,55)+'...</td>'
      +'<td style="font-family:var(--font-ui);font-size:.82rem;">'+lc+'</td>'
      +'<td style="font-family:var(--font-ui);font-size:.82rem;">'+((p.comments||[]).length)+'</td>'
      +'<td><button class="dash-action-btn delete" onclick="deletePost(\''+( p.id||p._id)+'\')"><i class="fas fa-trash"></i></button></td>'
      +'</tr>';
  }).join(''):'<tr><td colspan="5" style="text-align:center;color:var(--silver);padding:2rem;">No posts yet.</td></tr>';
}
function openAddPost(){postImagesList=[];['postText','postLink','postLinkText','postVideo','pollQuestion','postEventDate','postEventLocation','postImgUrl'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});document.getElementById('postImgPreview').innerHTML='';openModal('addPostModal');}
function savePost(){
  var text=(document.getElementById('postText')?.value||'').trim();if(!text){alert('Message required.');return;}
  var type=currentPostType,emojis={announcement:'📢',event:'🌙',wisdom:'✨',offer:'🎁'};
  var pollQ=(document.getElementById('pollQuestion')?.value||'').trim(),poll=null;
  if(pollQ){var opts=Array.from(document.querySelectorAll('#pollOptions input[type=text]')).map(function(i){return i.value.trim();}).filter(Boolean);if(opts.length>=2)poll={question:pollQ,options:opts.map(function(o){return{label:o,votes:0};})};}
  var images=postImagesList.map(function(img){return img.val;});
  var video=(document.getElementById('postVideo')?.value||'').trim(),link=(document.getElementById('postLink')?.value||'').trim(),linkText=(document.getElementById('postLinkText')?.value||'').trim();
  var eventDate=document.getElementById('postEventDate')?.value||'',eventLoc=(document.getElementById('postEventLocation')?.value||'').trim();
  var posts=JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
  posts.unshift({id:Date.now(),type:type,emoji:emojis[type]||'📢',author:'Dr. Rajesh R Shastrijee',avatar:'R',time:'Just now',text:text,images:images.length?images:null,video:video||null,link:link||null,linkText:linkText||'Read More',poll:poll,eventDate:eventDate||null,eventLocation:eventLoc||null,likes:0,hearts:0,shares:0,comments:[]});
  localStorage.setItem('astroveda_posts',JSON.stringify(posts));closeModal('addPostModal');renderPostsTable();renderOverview();postImagesList=[];currentPostType='announcement';
}
function deletePost(id){
  if(!confirm('Delete post?'))return;
  localStorage.setItem('astroveda_posts',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_posts')||'[]').filter(function(p){return String(p.id||p._id)!==String(id);})));
  fetch(API+'/announcements/'+id,{method:'DELETE',headers:authHeaders()}).catch(function(){});
  renderPostsTable();renderOverview();
}

// ═══════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════
function renderReviewsPanel(){
  var reviews=JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]');
  var pending=reviews.filter(function(r){return r.status==='pending';});
  var approved=reviews.filter(function(r){return r.status==='approved';});
  var pendEl=document.getElementById('pendingReviewsList');
  if(pendEl)pendEl.innerHTML=pending.length?pending.map(function(r){
    return'<div class="review-dash-card"><div class="review-dash-stars">'+'★'.repeat(r.rating||0)+'☆'.repeat(5-(r.rating||0))+'</div>'
      +'<div class="review-dash-text">"'+r.text+'"</div>'
      +'<div class="review-dash-meta">— '+(r.name||'Anonymous')+', '+(r.location||'India')+'</div>'
      +'<div class="dash-actions" style="margin-top:.6rem;">'
      +'<button class="dash-action-btn edit" onclick="approveReview(\''+r.id+'\')"><i class="fas fa-check"></i> Approve</button>'
      +'<button class="dash-action-btn delete" onclick="rejectReview(\''+r.id+'\')"><i class="fas fa-times"></i> Reject</button>'
      +'</div></div>';
  }).join(''):'<p style="color:var(--silver);font-size:.85rem;padding:1rem 0;">No pending reviews.</p>';
  var appEl=document.getElementById('approvedReviewsList');
  if(appEl)appEl.innerHTML=approved.length?approved.map(function(r){
    return'<div class="review-dash-card"><div class="review-dash-stars">'+'★'.repeat(r.rating||0)+'</div>'
      +'<div class="review-dash-text">"'+r.text+'"</div>'
      +'<div class="review-dash-meta">— '+(r.name||'Anonymous')+', '+(r.location||'India')+'</div>'
      +'<div class="dash-actions" style="margin-top:.6rem;">'
      +'<button class="dash-action-btn delete" onclick="rejectReview(\''+r.id+'\')"><i class="fas fa-trash"></i> Remove</button>'
      +'</div></div>';
  }).join(''):'<p style="color:var(--silver);font-size:.85rem;">No approved reviews yet.</p>';
}
function approveReview(id){var reviews=JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]');var r=reviews.find(function(x){return x.id===id;});if(r){r.status='approved';localStorage.setItem('astroveda_testimonials',JSON.stringify(reviews));renderReviewsPanel();renderOverview();}}
function rejectReview(id){if(!confirm('Remove?'))return;localStorage.setItem('astroveda_testimonials',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]').filter(function(r){return r.id!==id;})));renderReviewsPanel();renderOverview();}

// ═══════════════════════════════════════════════════════════════
// RASHI GUIDANCE
// ═══════════════════════════════════════════════════════════════
var RASHIS=['Mesh','Vrishabh','Mithun','Kark','Simha','Kanya','Tula','Vrishchik','Dhanu','Makar','Kumbh','Meen'];
var RASHI_HINDI=['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
var RASHI_ANIMALS=['🐏','🐂','👫','🦀','🦁','👧','⚖️','🦂','🏹','🐊','🏺','🐟'];
function renderRashiEditor(){var grid=document.getElementById('rashiEditorGrid');if(!grid)return;grid.innerHTML=RASHIS.map(function(r,i){return'<div class="rashi-editor-card" onclick="openRashiEdit(\''+r+'\',\''+RASHI_HINDI[i]+'\')">'+'<h5>'+RASHI_ANIMALS[i]+' '+r+'</h5><p>'+RASHI_HINDI[i]+' · Click to edit</p></div>';}).join('');}
function openRashiEdit(sign,hindi){
  var data=null;try{data=JSON.parse(localStorage.getItem('astroveda_rashi_guidance')||'null');}catch(e){}
  var s=(data&&data.signs&&data.signs[sign])||{};
  document.getElementById('rashiEditTitle').textContent='Edit: '+sign+' ('+hindi+')';
  document.getElementById('rashiEditKey').value=sign;
  document.getElementById('rashiCareer').value=s.career||'';
  document.getElementById('rashiLove').value=s.love||'';
  document.getElementById('rashiHealth').value=s.health||'';
  document.getElementById('rashiRemedy').value=s.remedy||'';
  openModal('rashiEditModal');
}
function saveRashiGuidance(){
  var sign=document.getElementById('rashiEditKey').value;
  var data=null;try{data=JSON.parse(localStorage.getItem('astroveda_rashi_guidance')||'null')||{month:'',signs:{}};}catch(e){data={month:'',signs:{}};}
  data.month=new Date().toLocaleString('en-IN',{month:'long',year:'numeric'});
  data.signs[sign]={career:document.getElementById('rashiCareer').value,love:document.getElementById('rashiLove').value,health:document.getElementById('rashiHealth').value,remedy:document.getElementById('rashiRemedy').value};
  localStorage.setItem('astroveda_rashi_guidance',JSON.stringify(data));
  closeModal('rashiEditModal');alert('Saved '+sign+' guidance!');
}

// ══ Image compression helper ═════════════════════════════════════════════════════════════
// Compresses any base64 image to max 700x700 at 65% quality (~80-150KB each)
// Prevents localStorage QuotaExceededError with multiple images
function compressImage(base64, callback) {
  var img = new Image();
  img.onload = function() {
    var MAX = 700;
    var w = img.naturalWidth, h = img.naturalHeight;
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
      else       { w = Math.round(w * MAX / h); h = MAX; }
    }
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    callback(c.toDataURL('image/jpeg', 0.65));
  };
  img.onerror = function() { callback(base64); }; // fallback to original
  img.src = base64;
}

// Safe localStorage setter — shows alert if quota exceeded
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch(e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      alert('⚠️ Storage full! Images are too large to save locally.\nTip: Use smaller images (under 500KB each) or use an image URL instead.');
    }
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ACHIEVEMENTS — multi-image (10) + crop
// ═══════════════════════════════════════════════════════════════
var achImagesList=[],achImgData='',achCropImg=null,achCropOffset={x:0,y:0},achCropDragging=false,achCropDragStart={x:0,y:0},achCropPendingIdx=0,achCropFiles=[];

function handleAchImages(input){if(!input.files||!input.files.length)return;achCropFiles=Array.from(input.files).slice(0,10);achImagesList=[];achCropPendingIdx=0;loadNextAchCrop();}
function loadNextAchCrop(){
  if(achCropPendingIdx>=achCropFiles.length){var w=document.getElementById('achCropWrap');if(w)w.style.display='none';renderAchPreviews();return;}
  var reader=new FileReader();
  reader.onload=function(e){var img=new Image();img.onload=function(){achCropImg=img;achCropOffset={x:0,y:0};var zEl=document.getElementById('achZoom');if(zEl)zEl.value=1;var wrap=document.getElementById('achCropWrap');var canvas=document.getElementById('achCropCanvas');if(!wrap||!canvas)return;wrap.style.display='block';canvas.width=(wrap.offsetWidth-32)||400;canvas.height=Math.round(canvas.width*0.6);setupAchCropDrag(canvas);drawAchCrop();};img.src=e.target.result;};
  reader.readAsDataURL(achCropFiles[achCropPendingIdx]);
}
function drawAchCrop(){
  var canvas=document.getElementById('achCropCanvas');if(!canvas||!achCropImg)return;
  var ctx=canvas.getContext('2d'),zoom=parseFloat(document.getElementById('achZoom')?.value||1);
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#111';ctx.fillRect(0,0,canvas.width,canvas.height);
  var sw=achCropImg.naturalWidth*zoom,sh=achCropImg.naturalHeight*zoom;
  ctx.drawImage(achCropImg,(canvas.width-sw)/2+achCropOffset.x,(canvas.height-sh)/2+achCropOffset.y,sw,sh);
  ctx.strokeStyle='rgba(201,168,76,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(2,2,canvas.width-4,canvas.height-4);
}
function setupAchCropDrag(canvas){
  canvas.onmousedown=function(e){achCropDragging=true;achCropDragStart={x:e.clientX-achCropOffset.x,y:e.clientY-achCropOffset.y};};
  canvas.onmousemove=function(e){if(!achCropDragging)return;achCropOffset={x:e.clientX-achCropDragStart.x,y:e.clientY-achCropDragStart.y};drawAchCrop();};
  canvas.onmouseup=canvas.onmouseleave=function(){achCropDragging=false;};
  canvas.ontouchstart=function(e){var t=e.touches[0];achCropDragging=true;achCropDragStart={x:t.clientX-achCropOffset.x,y:t.clientY-achCropOffset.y};e.preventDefault();};
  canvas.ontouchmove=function(e){if(!achCropDragging)return;var t=e.touches[0];achCropOffset={x:t.clientX-achCropDragStart.x,y:t.clientY-achCropDragStart.y};drawAchCrop();e.preventDefault();};
  canvas.ontouchend=function(){achCropDragging=false;};
}
function confirmAchCrop(){
  var canvas=document.getElementById('achCropCanvas');if(!canvas)return;
  // Compress the cropped canvas output before storing
  var rawData=canvas.toDataURL('image/jpeg',0.88);
  compressImage(rawData,function(compressed){
    achImagesList.push(compressed);
    if(achImagesList.length===1)achImgData=compressed;
    achCropPendingIdx++;loadNextAchCrop();
  });
}
function skipAchCrop(){
  if(achCropImg){
    // Compress original image before storing
    var tmp=document.createElement('canvas');
    var MAX=700,w=achCropImg.naturalWidth,h=achCropImg.naturalHeight;
    if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
    tmp.width=w;tmp.height=h;
    tmp.getContext('2d').drawImage(achCropImg,0,0,w,h);
    var compressed=tmp.toDataURL('image/jpeg',0.65);
    achImagesList.push(compressed);
    if(achImagesList.length===1)achImgData=compressed;
  }
  achCropPendingIdx++;loadNextAchCrop();
}
function renderAchPreviews(){
  var wrap=document.getElementById('achImgPreview');if(!wrap)return;
  wrap.innerHTML=achImagesList.map(function(img,i){
    var border=i===0?'rgba(201,168,76,.8)':'var(--glass-border)';
    var primary=i===0?'<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.8);font-size:.52rem;color:var(--gold);text-align:center;">PRIMARY</div>':'';
    return'<div style="position:relative;width:80px;height:80px;border-radius:10px;overflow:hidden;border:1.5px solid '+border+';">'
      +'<img src="'+img+'" style="width:100%;height:100%;object-fit:cover;"/>'+primary
      +'<button onclick="removeAchImg('+i+')" style="position:absolute;top:2px;right:2px;background:rgba(255,107,107,.9);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:.55rem;cursor:pointer;">✕</button>'
      +'</div>';
  }).join('');
}
function removeAchImg(idx){achImagesList.splice(idx,1);if(idx===0)achImgData=achImagesList[0]||'';renderAchPreviews();}
function previewAchImg(input){handleAchImages(input);}

function openAddAchievement(type){
  var labels={award:'Add Award',certificate:'Add Certificate',medal:'Add Medal',photo:'Add Photo'};
  document.getElementById('addAchTitle').textContent=labels[type]||'Add Item';
  document.getElementById('achType').value=type;
  ['achTitle','achOrg','achDesc','achImgUrl'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var prev=document.getElementById('achImgPreview');if(prev)prev.innerHTML='';
  var cw=document.getElementById('achCropWrap');if(cw)cw.style.display='none';
  var fi=document.getElementById('achImgFiles');if(fi)fi.value='';
  document.getElementById('editAchId').value='';
  achImagesList=[];achCropFiles=[];achCropPendingIdx=0;achImgData='';
  openModal('addAchModal');
}
function editAchievement(id){
  var all=JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]');
  var a=all.find(function(x){return x.id==id;});if(!a)return;
  var labels={award:'Edit Award',certificate:'Edit Certificate',medal:'Edit Medal',photo:'Edit Photo'};
  document.getElementById('addAchTitle').textContent=labels[a.type]||'Edit';
  document.getElementById('achType').value=a.type;
  document.getElementById('achTitle').value=a.title||'';
  document.getElementById('achOrg').value=a.org||'';
  document.getElementById('achDesc').value=a.desc||'';
  document.getElementById('achImgUrl').value=a.imageUrl||'';
  document.getElementById('editAchId').value=id;
  achImgData=a.imageData||'';achImagesList=[];achCropFiles=[];achCropPendingIdx=0;
  var prev=document.getElementById('achImgPreview');
  if(prev)prev.innerHTML=achImgData?'<img src="'+achImgData+'" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-top:.5rem;"/>':'';
  var cw=document.getElementById('achCropWrap');if(cw)cw.style.display='none';
  openModal('addAchModal');
}
function saveAchievement(){
  var type=document.getElementById('achType').value;
  var title=(document.getElementById('achTitle')?.value||'').trim();
  if(!title&&type!=='photo'){alert('Title required.');return;}
  var editId=document.getElementById('editAchId')?.value;
  var achievements=JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]');
  var imgUrl=(document.getElementById('achImgUrl')?.value||'').trim();

  if(achImagesList.length===0 && achCropImg) {
    var MAX=700,w=achCropImg.naturalWidth,h=achCropImg.naturalHeight;
    if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
    var tmp=document.createElement('canvas');
    tmp.width=w;tmp.height=h;
    tmp.getContext('2d').drawImage(achCropImg,0,0,w,h);
    var compressed=tmp.toDataURL('image/jpeg',0.65);
    achImagesList=[compressed]; achImgData=compressed;
  }

  var primaryImg=achImagesList.length>0?achImagesList[0]:(achImgData||'');
  var item={type:type,title:title,org:document.getElementById('achOrg')?.value||'',desc:document.getElementById('achDesc')?.value||'',imageData:primaryImg,imageUrl:imgUrl,images:achImagesList.length>1?achImagesList:undefined};

  if(editId){
    var idx=achievements.findIndex(function(a){return a.id==editId;});
    if(idx>-1)achievements[idx]=Object.assign(achievements[idx],item);
    safeSetItem('astroveda_custom_achievements',JSON.stringify(achievements));
    closeModal('addAchModal');renderAchievementsPanel();achImgData='';achImagesList=[];achCropImg=null;
  } else {
    achievements.push(Object.assign({id:Date.now()},item));
    safeSetItem('astroveda_custom_achievements',JSON.stringify(achievements));

    // Save to MongoDB — sends imageData as base64 in JSON body
    var sm={award:'awards',certificate:'certificates',medal:'medals',photo:'photos'};
    var payload={title:title,subtitle:item.org||'',desc:item.desc||'',imageData:primaryImg,imageUrl:imgUrl};
    fetch(API+'/achievements/'+(sm[type]||'awards'),{
      method:'POST',
      headers:Object.assign({'Content-Type':'application/json'},{'Authorization':'Bearer '+getToken()}),
      body:JSON.stringify(payload)
    })
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.success && d.items) {
        // Update localStorage with server-assigned IDs
        var serverItems = d.items.map(function(si){
          return {id:si._id||si.id,type:type,title:si.title||title,org:si.subtitle||item.org,desc:si.desc||item.desc,imageData:primaryImg,imageUrl:si.imageUrl||imgUrl};
        });
        safeSetItem('astroveda_custom_achievements_'+sm[type], JSON.stringify(serverItems));
      }
    })
    .catch(function(){});

    closeModal('addAchModal');renderAchievementsPanel();achImgData='';achImagesList=[];achCropImg=null;
  }
}
function deleteAchievement(id){if(!confirm('Delete?'))return;localStorage.setItem('astroveda_custom_achievements',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]').filter(function(a){return a.id!=id;})));renderAchievementsPanel();}
function clearAllAchievements(){if(!confirm('Delete ALL achievements?'))return;localStorage.removeItem('astroveda_custom_achievements');renderAchievementsPanel();alert('All achievements cleared.');}

function renderAchievementsPanel(){
  var all=JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]');

  // Also load from MongoDB so mobile dashboard shows items added from laptop
  ['awards','certificates','medals','photos'].forEach(function(section){
    var typeMap={awards:'award',certificates:'certificate',medals:'medal',photos:'photo'};
    var type=typeMap[section];
    fetch(API+'/achievements/'+section)
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.success&&d.items&&d.items.length){
          var containerId={awards:'awardsManager',certificates:'certificatesManager',medals:'medalsManager',photos:'photosManager'}[section];
          // Merge: server items take priority, keep local edits
          var serverItems=d.items.map(function(si){
            return{id:si._id||si.id,type:type,title:si.title||'',org:si.subtitle||'',desc:si.desc||'',imageData:si.image&&si.image.startsWith('data:')?si.image:'',imageUrl:si.image&&!si.image.startsWith('data:')?si.image:si.imageUrl||''};
          });
          // Save merged to localStorage
          var others=JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]').filter(function(a){return a.type!==type;});
          safeSetItem('astroveda_custom_achievements',JSON.stringify(others.concat(serverItems)));
          // Re-render just this section's table
          renderSingleTable(type,containerId);
        }
      })
      .catch(function(){});
  });

  // Check for broken items
  var brokenCount = all.filter(function(a){ return a.imageData==='' && !a.imageUrl; }).length;
  var warningEl = document.getElementById('achBrokenWarning');
  if (warningEl) {
    if (brokenCount > 0) {
      warningEl.style.display = 'block';
      warningEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <strong>'+brokenCount+' item(s)</strong> have missing images (saved before compression fix). '
        + 'Please <button onclick="clearAllAchievements()" style="background:rgba(255,107,107,.2);border:1px solid rgba(255,107,107,.4);color:#ff6b6b;border-radius:6px;padding:.15rem .5rem;cursor:pointer;font-size:.78rem;">Clear All</button> and re-add them — images will now save correctly.';
    } else {
      warningEl.style.display = 'none';
    }
  }
  function renderTable(type,containerId){ renderSingleTable(type,containerId); }
  renderTable('award','awardsManager');renderTable('certificate','certificatesManager');renderTable('medal','medalsManager');renderTable('photo','photosManager');
}

function renderSingleTable(type,containerId){
  var all=JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]');
  var items=all.filter(function(a){return a.type===type;});
  var el=document.getElementById(containerId);if(!el)return;
    if(!items.length){el.innerHTML='<p style="color:var(--silver);font-size:.83rem;padding:.5rem 0;">No '+type+'s yet. Click + Add above.</p>';return;}
    var ti={award:'🏆',certificate:'📜',medal:'🥇',photo:'📸'};
    el.innerHTML='<table style="width:100%;border-collapse:collapse;"><thead><tr style="border-bottom:1px solid rgba(201,168,76,.2);">'
      +'<th style="text-align:left;padding:.4rem;font-family:var(--font-ui);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);">#</th>'
      +'<th style="text-align:left;padding:.4rem;font-family:var(--font-ui);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);">Img</th>'
      +'<th style="text-align:left;padding:.4rem;font-family:var(--font-ui);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);">Title</th>'
      +'<th style="text-align:left;padding:.4rem;font-family:var(--font-ui);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);">Org</th>'
      +'<th style="text-align:center;padding:.4rem;font-family:var(--font-ui);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);">Act</th>'
      +'</tr></thead><tbody>'
      +items.map(function(a,idx){
        var ih=(a.imageData||a.imageUrl)?'<img src="'+(a.imageData||a.imageUrl)+'" style="width:40px;height:40px;object-fit:cover;border-radius:6px;" onerror="this.style.display=\'none\'"/>':'<div style="width:40px;height:40px;background:rgba(201,168,76,.1);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">'+(ti[type]||'✨')+'</div>';
        return'<tr style="border-bottom:1px solid rgba(255,255,255,.04);">'
          +'<td style="padding:.4rem;font-family:var(--font-ui);font-size:.75rem;color:var(--gold);font-weight:700;">'+(idx+1)+'</td>'
          +'<td style="padding:.4rem;">'+ih+'</td>'
          +'<td style="padding:.4rem;font-family:var(--font-ui);font-size:.8rem;color:var(--white);max-width:120px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+(a.title||'-')+'</td>'
          +'<td style="padding:.4rem;font-family:var(--font-ui);font-size:.72rem;color:var(--silver);max-width:90px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">'+(a.org||'-')+'</td>'
          +'<td style="padding:.4rem;"><div style="display:flex;gap:.3rem;justify-content:center;">'
          +'<button class="ctrl-btn edit" onclick="editAchievement('+a.id+')" style="padding:.2rem .5rem;font-size:.68rem;"><i class="fas fa-edit"></i></button>'
          +'<button class="ctrl-btn del" onclick="deleteAchievement('+a.id+')" style="padding:.2rem .5rem;font-size:.68rem;"><i class="fas fa-trash"></i></button>'
          +'</div></td></tr>';
      }).join('')+'</tbody></table>';
}

// ═══════════════════════════════════════════════════════════════
// DANGER ZONE
// ═══════════════════════════════════════════════════════════════
function resetAllUsers(){if(!confirm('Clear all users from localStorage? MongoDB data unaffected.\nTo fully reset backend, run seed.js.'))return;localStorage.removeItem('astroveda_users');localStorage.removeItem('astroveda_bookings');localStorage.removeItem('astroveda_saved_products');renderOverview();renderUsersTable();renderBookingsTable();alert('Local users cleared.');}
function resetFeedbacks(){if(!confirm('Clear all feedback messages?'))return;localStorage.removeItem('astroveda_feedbacks');localStorage.removeItem('astroveda_feedback');renderFeedbackList();renderOverview();alert('Feedbacks cleared.');}
function resetReviews(){if(!confirm('Clear all reviews (Voices of Stars)?'))return;localStorage.removeItem('astroveda_testimonials');renderReviewsPanel();renderOverview();alert('Reviews cleared.');}
function resetEvents(){if(!confirm('Remove all events from announcements?'))return;var posts=JSON.parse(localStorage.getItem('astroveda_posts')||'[]').filter(function(p){return p.type!=='event';});localStorage.setItem('astroveda_posts',JSON.stringify(posts));renderPostsTable();renderOverview();alert('Events removed.');}

// ═══════════════════════════════════════════════════════════════
// WEBSITE CONTROL
// ═══════════════════════════════════════════════════════════════
function loadSiteSettings(){
  var s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');
  var m=document.getElementById('maintenanceToggle');if(m)m.checked=!!s.maintenance;
  var b=document.getElementById('bookingsToggle');if(b)b.checked=s.acceptBookings!==false;
  var r=document.getElementById('reviewsToggle');if(r)r.checked=s.showReviews!==false;
  // Update pricing button labels to show current saved price
  var bj=document.getElementById('btnPriceJyotish');
  if(bj)bj.textContent=s.priceJyotish?'₹'+s.priceJyotish:'Edit';
  var bk=document.getElementById('btnPriceKundli');
  if(bk)bk.textContent=s.priceKundli?'₹'+s.priceKundli:'Edit';
}
function toggleSetting(key,val){var s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');s[key]=val;localStorage.setItem('astroveda_site_settings',JSON.stringify(s));}
function editSiteSetting(key,currentVal){document.getElementById('siteSettingTitle').textContent='Edit: '+key.replace(/([A-Z])/g,' $1').trim();document.getElementById('siteSettingKey').value=key;var stored=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');document.getElementById('siteSettingVal').value=stored[key]!==undefined?stored[key]:currentVal;openModal('siteSettingModal');}
function saveSiteSettingModal(){
  var key=document.getElementById('siteSettingKey').value;
  var val=document.getElementById('siteSettingVal').value;
  var s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');
  s[key]=val;localStorage.setItem('astroveda_site_settings',JSON.stringify(s));
  closeModal('siteSettingModal');
  // Refresh price button labels immediately after save
  var bj=document.getElementById('btnPriceJyotish');
  if(bj&&s.priceJyotish)bj.textContent='₹'+s.priceJyotish;
  var bk=document.getElementById('btnPriceKundli');
  if(bk&&s.priceKundli)bk.textContent='₹'+s.priceKundli;
  alert('Saved! Refresh website to see changes.');
}
function editSiteImage(key){
  var input=document.createElement('input');input.type='file';input.accept='image/*';
  input.onchange=function(){if(!this.files[0])return;var reader=new FileReader();reader.onload=function(e){var s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');s[key]=e.target.result;localStorage.setItem('astroveda_site_settings',JSON.stringify(s));
    if(key==='qrCode'){var thumb=document.getElementById('qrPreviewThumb');var img=document.getElementById('qrThumbImg');if(thumb&&img){img.src=e.target.result;thumb.style.display='block';}}
    alert('Image saved! Refresh website to see changes.');};reader.readAsDataURL(this.files[0]);};input.click();
}
function previewQR(){var s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');if(!s.qrCode){alert('No QR code uploaded yet. Use the Upload button first.');return;}var overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;';overlay.innerHTML='<img src="'+s.qrCode+'" style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 0 40px rgba(201,168,76,.4);"/><p style="font-family:Rajdhani,sans-serif;color:rgba(255,255,255,.7);font-size:.9rem;">Payment QR Code — tap outside to close</p>';overlay.onclick=function(){document.body.removeChild(overlay);};document.body.appendChild(overlay);}

// ═══════════════════════════════════════════════════════════════
// FEEDBACK — reads from BOTH storage keys
// ═══════════════════════════════════════════════════════════════
function renderFeedbackList(){
  var f1=[],f2=[];try{f1=JSON.parse(localStorage.getItem('astroveda_feedbacks')||'[]');}catch(e){}try{f2=JSON.parse(localStorage.getItem('astroveda_feedback')||'[]');}catch(e){}
  var seen={},feedbacks=f1.concat(f2).filter(function(f){var k=f.id||f.time||f.msg;if(seen[k])return false;seen[k]=true;return true;});
  var list=document.getElementById('feedbackList');if(!list)return;
  list.innerHTML=feedbacks.length?[...feedbacks].reverse().map(function(f){
    return'<div class="feedback-dash-item"><div class="feedback-dash-header"><strong>'+(f.name||'User')+'</strong><span>'+(f.time?new Date(f.time).toLocaleDateString('en-IN'):'-')+'</span></div>'
      +'<p>'+(f.msg||f.message||f.text||'')+'</p></div>';
  }).join(''):'<p style="color:var(--silver);">No feedback yet. Feedback submitted from the website will appear here.</p>';
}

// ═══════════════════════════════════════════════════════════════
// PAGE EDITOR
// ═══════════════════════════════════════════════════════════════
function loadPageEditor(){
  var pc=JSON.parse(localStorage.getItem('astroveda_page_content')||'{}');
  function set(id,val){var el=document.getElementById(id);if(el)el.value=val;}
  set('pgMission',pc.mission||'To provide authentic, compassionate, and transformative astrological guidance that empowers individuals to navigate life with clarity, confidence, and cosmic alignment.');
  set('pgVision',pc.vision||"To become the world's most trusted Vedic astrology platform — bridging ancient Jyotish wisdom with modern seekers across every culture and corner of the globe.");
  set('pgPhilosophy',pc.philosophy||'We honor the sacred science of Jyotish as a tool for self-awareness — not fatalism. The stars guide; the soul decides.');
  set('pgAboutIntro',pc.aboutIntro||'AstroVeda is a premium Vedic astrology platform founded by Dr. Rajesh R Shastrijee — to make the wisdom of Jyotish accessible, trustworthy, and transformative for people across the world.');
  set('pgDailyTip',pc.dailyTip||'');set('pgWeeklyMantra',pc.weeklyMantra||'');set('pgAuspiciousDays',pc.auspiciousDays||'');
  set('pgPrivacy',pc.privacy||'AstroVeda Privacy Policy\nLast Updated: January 2025\n\nAll personal information shared during consultations is kept strictly confidential and never shared with third parties.');
  set('pgTerms',pc.terms||'AstroVeda Terms of Service\nLast Updated: January 2025\n\nAstrological guidance is for informational and spiritual purposes only and does not replace professional advice.');
  renderFaqManager();
}
function savePageContent(type){
  var pc=JSON.parse(localStorage.getItem('astroveda_page_content')||'{}');
  if(type==='about'){pc.mission=document.getElementById('pgMission')?.value||'';pc.vision=document.getElementById('pgVision')?.value||'';pc.philosophy=document.getElementById('pgPhilosophy')?.value||'';pc.aboutIntro=document.getElementById('pgAboutIntro')?.value||'';}
  if(type==='tips'){pc.dailyTip=document.getElementById('pgDailyTip')?.value||'';pc.weeklyMantra=document.getElementById('pgWeeklyMantra')?.value||'';pc.auspiciousDays=document.getElementById('pgAuspiciousDays')?.value||'';}
  if(type==='legal'){pc.privacy=document.getElementById('pgPrivacy')?.value||'';pc.terms=document.getElementById('pgTerms')?.value||'';}
  localStorage.setItem('astroveda_page_content',JSON.stringify(pc));alert('Saved! Changes appear on website immediately.');
}
function getFaqs(){try{return JSON.parse(localStorage.getItem('astroveda_faqs')||'null')||getDefaultFaqs();}catch(e){return getDefaultFaqs();}}
function saveFaqs(f){localStorage.setItem('astroveda_faqs',JSON.stringify(f));}
function getDefaultFaqs(){return[{id:1,q:'What is Vedic astrology?',a:'Vedic astrology (Jyotish) is the ancient Indian science of light — using planetary positions at birth to guide your life path, relationships, career, and spiritual journey.'},{id:2,q:"How accurate are Dr. Shastrijee's predictions?",a:'Over 90% accuracy for major life events, validated by thousands of clients across 25+ years of practice.'},{id:3,q:'How do I book a consultation?',a:'Click "Book Appointment", select your service, fill in your birth details, and submit. Dr. Shastrijee will confirm via WhatsApp.'},{id:4,q:'What information do I need?',a:'Exact date of birth, time of birth, and place of birth.'},{id:5,q:'Are consultations available outside India?',a:'Yes! Worldwide via video call, WhatsApp, and phone. Clients across 40+ countries.'},{id:6,q:'What is the difference between services?',a:'Free Consultation: 15-min intro. Jyotish Vishleshan: comprehensive 2-hour analysis. Kundli Nirman: birth chart with full interpretation.'}];}
function renderFaqManager(){
  var faqs=getFaqs();var el=document.getElementById('faqManager');if(!el)return;
  el.innerHTML=faqs.map(function(f){return'<div style="background:rgba(255,255,255,.03);border:1px solid var(--glass-border);border-radius:10px;padding:.9rem;margin-bottom:.6rem;">'+'<div style="font-family:var(--font-ui);font-size:.88rem;color:var(--white);font-weight:600;margin-bottom:.3rem;">'+f.q+'</div>'+'<div style="font-size:.78rem;color:var(--silver);margin-bottom:.6rem;">'+(f.a||'').substring(0,80)+'...</div>'+'<div style="display:flex;gap:.4rem;"><button class="ctrl-btn edit" onclick="editFaq('+f.id+')" style="flex:1;"><i class="fas fa-edit"></i> Edit</button><button class="ctrl-btn del" onclick="deleteFaq('+f.id+')" style="flex:1;"><i class="fas fa-trash"></i> Delete</button></div></div>';}).join('')||'<p style="color:var(--silver);">No FAQs yet.</p>';
}
function openAddFaq(){document.getElementById('faqModalTitle').textContent='Add FAQ';document.getElementById('editFaqId').value='';document.getElementById('faqQuestion').value='';document.getElementById('faqAnswer').value='';openModal('addFaqModal');}
function editFaq(id){var f=getFaqs().find(function(x){return x.id==id;});if(!f)return;document.getElementById('faqModalTitle').textContent='Edit FAQ';document.getElementById('editFaqId').value=id;document.getElementById('faqQuestion').value=f.q;document.getElementById('faqAnswer').value=f.a;openModal('addFaqModal');}
function saveFaq(){var q=(document.getElementById('faqQuestion')?.value||'').trim();var a=(document.getElementById('faqAnswer')?.value||'').trim();if(!q||!a){alert('Question and answer required.');return;}var editId=document.getElementById('editFaqId')?.value;var faqs=getFaqs();if(editId){var idx=faqs.findIndex(function(f){return f.id==editId;});if(idx>-1)faqs[idx]=Object.assign(faqs[idx],{q:q,a:a});}else{faqs.push({id:Date.now(),q:q,a:a});}saveFaqs(faqs);closeModal('addFaqModal');renderFaqManager();}
function deleteFaq(id){if(!confirm('Delete this FAQ?'))return;saveFaqs(getFaqs().filter(function(f){return f.id!=id;}));renderFaqManager();}
