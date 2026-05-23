// ============================================
// AstroVeda - Dashboard JS (Complete)
// ============================================

const API = window.ASTROVEDA_API || (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api');
function getToken() { return localStorage.getItem('astroveda_token') || ''; }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

// Check access
(function checkAccess() {
  const user = (() => { try { return JSON.parse(localStorage.getItem('astroveda_current_user')||'null'); } catch(e){ return null; } })();
  const isMod = user && user.role === 'moderator';
  if (isMod) {
    document.getElementById('modLoginGate').style.display = 'none';
    document.getElementById('dashboardWrap').style.display = 'flex';
    initDashboard();
  } else {
    document.getElementById('modLoginGate').style.display = 'flex';
    document.getElementById('dashboardWrap').style.display = 'none';
  }
})();

function togglePw(id, btn) {
  const inp = document.getElementById(id); if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) icon.className = inp.type === 'text' ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// Mod Login
function modLogin() {
  const u = (document.getElementById('modUsername')?.value||'').trim();
  const p =  document.getElementById('modPassword')?.value||'';
  const errEl = document.getElementById('modLoginError');
  if (!u||!p) { showErr(errEl,'Enter username and password.'); return; }
  if (u==='admin' && p==='astroveda2024') {
    const modUser = {id:'mod_1',name:'Dr. Rajesh R Shastrijee',username:'admin',mobile:'8863038229',role:'moderator',joined:new Date().toISOString()};
    localStorage.setItem('astroveda_current_user', JSON.stringify(modUser));
    document.getElementById('modLoginGate').style.display = 'none';
    document.getElementById('dashboardWrap').style.display = 'flex';
    if (errEl) errEl.style.display = 'none';
    initDashboard();
    fetch(API+'/auth/mod-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})})
      .then(r=>r.json()).then(d=>{if(d.success&&d.token){localStorage.setItem('astroveda_token',d.token);if(d.user)localStorage.setItem('astroveda_current_user',JSON.stringify(d.user));}}).catch(()=>{});
    return;
  }
  showErr(errEl,'Invalid credentials. Use: admin / astroveda2024');
}
function showErr(el,msg){if(!el)return;el.textContent=msg;el.style.display='block';}
function modLogout(){localStorage.removeItem('astroveda_current_user');localStorage.removeItem('astroveda_token');window.location.href='../index.html';}
function toggleSidebar(){document.getElementById('dashSidebar')?.classList.toggle('open');}

function updateClock(){const el=document.getElementById('dashDateTime');if(el)el.textContent=new Date().toLocaleString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}

function initDashboard(){
  updateClock();setInterval(updateClock,30000);
  loadUsersFromAPI();renderBookingsTable();renderProductsTable();renderPostsTable();renderFeedbackList();
}

function openModal(id){document.getElementById(id)?.classList.add('open');}
function closeModal(id){document.getElementById(id)?.classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)closeModal(o.id);}));

// OVERVIEW
function renderOverview(){
  const users    =JSON.parse(localStorage.getItem('astroveda_users')||'[]');
  const bookings =JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
  const posts    =JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
  const reviews  =JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]');
  const feedbacks=JSON.parse(localStorage.getItem('astroveda_feedbacks')||'[]');
  const pending  =reviews.filter(r=>r.status==='pending').length;
  const grid=document.getElementById('dashStatsGrid');
  if(grid)grid.innerHTML=[
    {icon:'👥',label:'Total Users',    val:users.length,    color:'#c9a84c'},
    {icon:'📅',label:'Total Bookings', val:bookings.length, color:'#48cae4'},
    {icon:'📢',label:'Total Posts',    val:posts.length,    color:'#c77dff'},
    {icon:'⭐',label:'Pending Reviews',val:pending,         color:'#ff6b6b'},
    {icon:'💬',label:'Feedbacks',      val:feedbacks.length,color:'#25d366'},
    {icon:'💰',label:'Revenue',        val:'Rs.'+bookings.reduce((s,b)=>s+(b.price||0),0).toLocaleString('en-IN'),color:'#feca57'},
  ].map(s=>`<div class="dash-stat-card" style="border-top:3px solid ${s.color};"><div class="dash-stat-icon">${s.icon}</div><div class="dash-stat-val" style="color:${s.color};">${s.val}</div><div class="dash-stat-label">${s.label}</div></div>`).join('');
  const rb=document.getElementById('recentBookings');
  if(rb)rb.innerHTML=[...bookings].reverse().slice(0,5).map(b=>`<div class="dash-recent-row"><span>${b.name}</span><span class="tag tag-gold" style="font-size:.72rem;">${b.service}</span><span style="font-family:var(--font-ui);font-size:.75rem;color:${b.status==='Confirmed'?'#25d366':b.status==='Completed'?'#48cae4':b.status==='Cancelled'?'#ff6b6b':'#feca57'}">${b.status}</span></div>`).join('')||'<p style="color:var(--silver);font-size:.85rem;">No bookings yet.</p>';
  const rs=document.getElementById('recentSignups');
  if(rs)rs.innerHTML=[...users].reverse().slice(0,5).map(u=>`<div class="dash-recent-row"><span>${u.name}</span><span style="font-family:var(--font-ui);font-size:.78rem;color:var(--silver);">@${u.username}</span><span style="font-family:var(--font-ui);font-size:.78rem;color:var(--silver);">${u.mobile}</span></div>`).join('')||'<p style="color:var(--silver);font-size:.85rem;">No users yet.</p>';
}

// USERS
function loadUsersFromAPI(){
  fetch(API+'/users',{headers:authHeaders()}).then(r=>r.json()).then(d=>{if(d.success&&d.users)localStorage.setItem('astroveda_users',JSON.stringify(d.users));renderOverview();renderUsersTable();}).catch(()=>{renderOverview();renderUsersTable();});
}
function renderUsersTable(){
  const q=(document.getElementById('userSearch')?.value||'').toLowerCase();
  const users=JSON.parse(localStorage.getItem('astroveda_users')||'[]').filter(u=>!q||u.name?.toLowerCase().includes(q)||u.mobile?.includes(q)||u.username?.toLowerCase().includes(q));
  const cnt=document.getElementById('userCount');if(cnt)cnt.textContent=users.length+' Users';
  const body=document.getElementById('usersTableBody');if(!body)return;
  body.innerHTML=users.length?users.map(u=>`<tr>
    <td><button class="dash-link-btn" onclick="viewUser('${u._id||u.id}')">${u.name}</button></td>
    <td style="color:var(--silver);">@${u.username}</td><td>${u.mobile}</td>
    <td>${u.createdAt||u.joined?new Date(u.createdAt||u.joined).toLocaleDateString('en-IN'):'-'}</td>
    <td><span style="font-family:var(--font-ui);font-size:.75rem;padding:.2rem .7rem;border-radius:20px;background:${u.suspended?'rgba(255,107,107,.1)':'rgba(37,211,102,.1)'};color:${u.suspended?'#ff6b6b':'#25d366'};border:1px solid ${u.suspended?'rgba(255,107,107,.3)':'rgba(37,211,102,.3)'};">${u.suspended?'Suspended':'Active'}</span></td>
    <td class="dash-actions">
      <button class="dash-action-btn edit" onclick="viewUser('${u._id||u.id}')"><i class="fas fa-eye"></i></button>
      <button class="dash-action-btn edit" onclick="toggleSuspend('${u._id||u.id}')"><i class="fas fa-${u.suspended?'unlock':'ban'}"></i></button>
      <button class="dash-action-btn delete" onclick="deleteUser('${u._id||u.id}')"><i class="fas fa-trash"></i></button>
    </td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:var(--silver);padding:2rem;">No users yet.</td></tr>';
}
function viewUser(id){
  const users=JSON.parse(localStorage.getItem('astroveda_users')||'[]');
  const bookings=JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
  const u=users.find(x=>(x._id||x.id)==id);if(!u)return;
  document.getElementById('userDetailContent').innerHTML=`<div style="text-align:center;margin-bottom:1.5rem;"><div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-light));display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:var(--black);margin:0 auto .8rem;">${u.name.charAt(0)}</div><h3 style="font-family:var(--font-display);color:var(--gold);">${u.name}</h3><p style="font-family:var(--font-ui);color:var(--silver);">@${u.username}</p></div><div style="display:flex;flex-direction:column;gap:.5rem;font-family:var(--font-ui);font-size:.85rem;color:var(--silver);"><div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">Mobile: ${u.mobile}</div><div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">Location: ${u.location||'Not set'}</div><div style="padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.08);">Joined: ${u.createdAt||u.joined?new Date(u.createdAt||u.joined).toLocaleDateString('en-IN'):'-'}</div><div style="padding:.5rem 0;">Bookings: ${bookings.filter(b=>b.mobile===u.mobile).length}</div></div>`;
  openModal('userDetailModal');
}
function toggleSuspend(id){
  const users=JSON.parse(localStorage.getItem('astroveda_users')||'[]');
  const u=users.find(x=>(x._id||x.id)==id);if(!u)return;
  u.suspended=!u.suspended;localStorage.setItem('astroveda_users',JSON.stringify(users));
  fetch(API+'/users/'+id+'/suspend',{method:'PUT',headers:authHeaders(),body:JSON.stringify({suspended:u.suspended})}).catch(()=>{});
  renderUsersTable();renderOverview();
}
function deleteUser(id){
  if(!confirm('Delete this user permanently?'))return;
  localStorage.setItem('astroveda_users',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_users')||'[]').filter(u=>(u._id||u.id)!=id)));
  fetch(API+'/users/'+id,{method:'DELETE',headers:authHeaders()}).catch(()=>{});
  renderUsersTable();renderOverview();
}

// BOOKINGS — FIX 11: status change saves to localStorage so profile reflects it
function renderBookingsTable(){
  const q=(document.getElementById('bookingSearch')?.value||'').toLowerCase();
  const bookings=JSON.parse(localStorage.getItem('astroveda_bookings')||'[]').filter(b=>!q||b.name?.toLowerCase().includes(q)||b.service?.toLowerCase().includes(q)||b.id?.toLowerCase().includes(q));
  const cnt=document.getElementById('bookingCount');if(cnt)cnt.textContent=bookings.length+' Bookings';
  const body=document.getElementById('bookingsTableBody');if(!body)return;
  body.innerHTML=bookings.length?[...bookings].reverse().map(b=>`<tr>
    <td style="font-family:var(--font-ui);font-size:.75rem;color:var(--gold);">${b.id}</td>
    <td>${b.name}</td><td>${b.mobile}</td><td>${b.service}</td>
    <td style="font-size:.82rem;">${b.dob||'-'}</td>
    <td>${b.price===0?'<span style="color:#25d366;font-weight:700;">FREE</span>':'Rs.'+(b.price||0).toLocaleString('en-IN')}</td>
    <td><select class="dash-status-select" onchange="updateBookingStatus('${b.id}',this.value)">${['Pending','Confirmed','Completed','Cancelled'].map(s=>`<option${b.status===s?' selected':''}>${s}</option>`).join('')}</select></td>
    <td><button class="dash-action-btn delete" onclick="deleteBooking('${b.id}')"><i class="fas fa-trash"></i></button></td>
    </tr>`).join(''):'<tr><td colspan="8" style="text-align:center;color:var(--silver);padding:2rem;">No bookings yet.</td></tr>';
}
// FIX 11: updateBookingStatus saves to localStorage — profile.js reads from there
function updateBookingStatus(id,status){
  const bookings=JSON.parse(localStorage.getItem('astroveda_bookings')||'[]');
  const b=bookings.find(x=>String(x.id)===String(id));
  if(b){
    b.status=status;
    localStorage.setItem('astroveda_bookings',JSON.stringify(bookings));
    fetch(API+'/appointments/'+id+'/status',{method:'PATCH',headers:authHeaders(),body:JSON.stringify({status})}).catch(()=>{});
  }
}
function deleteBooking(id){if(!confirm('Delete?'))return;localStorage.setItem('astroveda_bookings',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_bookings')||'[]').filter(b=>b.id!==id)));renderBookingsTable();renderOverview();}

// PRODUCTS — FIX 5: init from defaults so all existing products are editable
function initProductsFromDefaults(){
  // If no products in localStorage, seed from DEFAULT_PRODUCTS in products.js
  // We keep a reference here for dashboard editing
  if (!localStorage.getItem('astroveda_products')) {
    // products.js will handle defaults — dashboard just shows what's stored
  }
}

let productImgData='';
function previewProductImg(input){
  if(!input.files||!input.files[0])return;
  const reader=new FileReader();
  reader.onload=function(e){productImgData=e.target.result;document.getElementById('productImgPreview').innerHTML=`<div class="img-preview-item"><img src="${productImgData}"/><button class="del-img" onclick="productImgData='';this.parentElement.remove()"><i class="fas fa-times"></i></button></div>`;};
  reader.readAsDataURL(input.files[0]);
}
function getProds(){try{return JSON.parse(localStorage.getItem('astroveda_products')||'null')||[];}catch(e){return[];}}
function saveProds(p){localStorage.setItem('astroveda_products',JSON.stringify(p));}
function loadDefaultProducts(){
  if(!confirm('Load all 38 default products into the list?'))return;
  var ex=getProds();var exIds=ex.map(function(p){return p.id;});
  var defs=[{id:1,name:'One Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:5000,planet:'Sun (Surya)',planetHi:'सूर्य',benefits:'Supreme consciousness.',desc:'Rarest Rudraksha representing Lord Shiva.',detail:'Nepal origin, certified.'},{id:2,name:'Two Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:800,planet:'Moon (Chandra)',planetHi:'चंद्र',benefits:'Emotional balance.',desc:'Represents Shiva-Parvati union.',detail:'Nepal, certified.'},{id:3,name:'Three Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:600,planet:'Mars (Mangal)',planetHi:'मंगल',benefits:'Removes fear.',desc:'Represents Agni.',detail:'Nepal, silver cap.'},{id:4,name:'Four Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:550,planet:'Mercury (Budh)',planetHi:'बुध',benefits:'Intelligence, memory.',desc:'Represents Lord Brahma.',detail:'Nepal, certified.'},{id:5,name:'Five Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:400,planet:'Jupiter (Guru)',planetHi:'गुरु',benefits:'Overall health, peace.',desc:'Kalagni Rudra.',detail:'Nepal, red thread.'},{id:6,name:'Six Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:700,planet:'Venus (Shukra)',planetHi:'शुक्र',benefits:'Love, creativity.',desc:'Represents Kartikeya.',detail:'Nepal, certified.'},{id:7,name:'Seven Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:900,planet:'Saturn (Shani)',planetHi:'शनि',benefits:'Wealth, health.',desc:'Represents Mahalakshmi.',detail:'Nepal, certified.'},{id:8,name:'Eight Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:1200,planet:'Rahu',planetHi:'राहु',benefits:'Removes Rahu doshas.',desc:'Represents Ganesha.',detail:'Nepal, silver capped.'},{id:9,name:'Nine Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:1800,planet:'Ketu',planetHi:'केतु',benefits:'Removes Ketu doshas.',desc:'Represents Goddess Durga.',detail:'Nepal, certified.'},{id:10,name:'Ten Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:2500,planet:'All Planets',planetHi:'सभी ग्रह',benefits:'Neutralizes all doshas.',desc:'Represents Vishnu.',detail:'Nepal, certified.'},{id:11,name:'Eleven Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:3500,planet:'All Planets',planetHi:'सभी ग्रह',benefits:'Wisdom, meditation.',desc:'Represents 11 Rudras.',detail:'Nepal, certified.'},{id:12,name:'Twelve Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:5000,planet:'Sun (Surya)',planetHi:'सूर्य',benefits:'Radiance, leadership.',desc:'Represents Surya.',detail:'Nepal, gold capped.'},{id:13,name:'Thirteen Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:8000,planet:'Venus (Shukra)',planetHi:'शुक्र',benefits:'Fulfills desires.',desc:'Represents Indra.',detail:'Nepal, gold capped.'},{id:14,name:'Fourteen Mukhi Rudraksha',category:'rudraksha',emoji:'📿',price:12000,planet:'Saturn (Shani)',planetHi:'शनि',benefits:'Supreme protection.',desc:'Deva Mani.',detail:'Nepal, gold capped.'},{id:101,name:'Manik (Ruby)',category:'gemstones',emoji:'💎',price:12000,planet:'Sun (Surya)',planetHi:'सूर्य',benefits:'Confidence, leadership.',desc:'Wear to strengthen Sun.',detail:'Burmese Ruby, 3-4 ct.'},{id:102,name:'Moti (Pearl)',category:'gemstones',emoji:'💎',price:3000,planet:'Moon (Chandra)',planetHi:'चंद्र',benefits:'Emotional peace.',desc:'Wear to strengthen Moon.',detail:'Sea pearl, 5-7 ct.'},{id:103,name:'Moonga (Red Coral)',category:'gemstones',emoji:'💎',price:4000,planet:'Mars (Mangal)',planetHi:'मंगल',benefits:'Courage, strength.',desc:'Wear to strengthen Mars.',detail:'Italian Red Coral.'},{id:104,name:'Panna (Emerald)',category:'gemstones',emoji:'💎',price:10000,planet:'Mercury (Budh)',planetHi:'बुध',benefits:'Intelligence, business.',desc:'Wear to strengthen Mercury.',detail:'Zambian Emerald.'},{id:105,name:'Pukhraj (Yellow Sapphire)',category:'gemstones',emoji:'💎',price:8000,planet:'Jupiter (Guru)',planetHi:'गुरु',benefits:'Wisdom, wealth.',desc:'Wear to strengthen Jupiter.',detail:'Ceylon Yellow Sapphire.'},{id:106,name:'Heera (Diamond)',category:'gemstones',emoji:'💎',price:50000,planet:'Venus (Shukra)',planetHi:'शुक्र',benefits:'Love, luxury.',desc:'Wear to strengthen Venus.',detail:'White diamond, 0.5ct.'},{id:107,name:'Neelam (Blue Sapphire)',category:'gemstones',emoji:'💎',price:15000,planet:'Saturn (Shani)',planetHi:'शनि',benefits:'Career, discipline.',desc:'Consult before wearing.',detail:'Ceylon Blue Sapphire.'},{id:108,name:'Gomedh (Hessonite)',category:'gemstones',emoji:'💎',price:4500,planet:'Rahu',planetHi:'राहु',benefits:'Removes Rahu doshas.',desc:'Wear to pacify Rahu.',detail:'Ceylon Hessonite.'},{id:109,name:"Lehsunia (Cat's Eye)",category:'gemstones',emoji:'💎',price:6000,planet:'Ketu',planetHi:'केतु',benefits:'Removes Ketu doshas.',desc:'Wear for Ketu.',detail:'Ceylon Chrysoberyl.'},{id:110,name:'Opal',category:'gemstones',emoji:'💎',price:3500,planet:'Venus (Shukra)',planetHi:'शुक्र',benefits:'Creativity, love.',desc:'Alternative to Heera.',detail:'Australian Opal.'},{id:111,name:'Turquoise (Firoza)',category:'gemstones',emoji:'💎',price:2500,planet:'Jupiter (Guru)',planetHi:'गुरु',benefits:'Luck, protection.',desc:'Alternative to Pukhraj.',detail:'Persian Turquoise.'},{id:112,name:'Amethyst',category:'gemstones',emoji:'💎',price:1500,planet:'Saturn (Shani)',planetHi:'शनि',benefits:'Peace, clarity.',desc:'For Saturn.',detail:'Natural Amethyst.'},{id:113,name:'Sphatik (Crystal Quartz)',category:'gemstones',emoji:'💎',price:800,planet:'Universal',planetHi:'सार्वभौमिक',benefits:'Universal healing.',desc:'Sacred crystal.',detail:'Natural clear quartz.'},{id:114,name:'Moonstone',category:'gemstones',emoji:'💎',price:2200,planet:'Moon (Chandra)',planetHi:'चंद्र',benefits:'Emotional healing.',desc:'Alternative to Pearl.',detail:'Ceylon Moonstone.'},{id:201,name:'Shree Yantra (Silver)',category:'yantras',emoji:'🔯',price:3500,planet:'Lakshmi/Venus',planetHi:'लक्ष्मी/शुक्र',benefits:'Wealth, prosperity.',desc:'Most powerful Yantra.',detail:'925 pure silver.'},{id:202,name:'Kuber Yantra',category:'yantras',emoji:'🔯',price:1500,planet:'Jupiter/Kuber',planetHi:'गुरु/कुबेर',benefits:'Financial abundance.',desc:'Yantra of Lord Kuber.',detail:'Gold-plated copper.'},{id:203,name:'Vastu Yantra',category:'yantras',emoji:'🔯',price:2000,planet:'All Planets',planetHi:'सभी ग्रह',benefits:'Corrects Vastu doshas.',desc:'Neutralizes Vastu defects.',detail:'Copper.'},{id:204,name:'Surya Yantra',category:'yantras',emoji:'🔯',price:1200,planet:'Sun (Surya)',planetHi:'सूर्य',benefits:'Government favor.',desc:'Yantra of Lord Surya.',detail:'Copper.'},{id:205,name:'Mahamrityunjaya Yantra',category:'yantras',emoji:'🔯',price:2500,planet:'Shiva/Saturn',planetHi:'शिव/शनि',benefits:'Protection.',desc:'Powerful protective Yantra.',detail:'Silver-coated copper.'},{id:206,name:'Navgraha Yantra',category:'yantras',emoji:'🔯',price:3000,planet:'All 9 Planets',planetHi:'नवग्रह',benefits:'Balances 9 planets.',desc:'All 9 Yantras in one.',detail:'Gold-plated copper.'},{id:301,name:'Sacred Dhoop Sticks Set',category:'spiritual',emoji:'🕯️',price:350,planet:'All Planets',planetHi:'सभी ग्रह',benefits:'Purifies home.',desc:'Premium dhoop.',detail:'6 fragrances.'},{id:302,name:'Crystal Singing Bowl',category:'spiritual',emoji:'🔔',price:2200,planet:'All Planets',planetHi:'सभी ग्रह',benefits:'Chakra balancing.',desc:'Himalayan crystal bowl.',detail:'8-inch, 432 Hz.'},{id:303,name:'Tulsi Mala (108 beads)',category:'spiritual',emoji:'📿',price:400,planet:'Jupiter',planetHi:'गुरु',benefits:'Japa meditation.',desc:'Sacred Tulsi mala.',detail:'108+1 beads.'},{id:304,name:'Gomti Chakra (Set of 11)',category:'spiritual',emoji:'🌀',price:299,planet:'Moon',planetHi:'चंद्र',benefits:'Vastu remedy.',desc:'Natural Gomti Chakras.',detail:'Set of 11.'}];
  var merged=ex.concat(defs.filter(function(d){return exIds.indexOf(d.id)===-1;}));
  saveProds(merged);renderProductsTable();
  alert('All 38 products loaded! Click Edit on any row to modify.');
}
function renderProductsTable(){
  const products=getProds();
  const cnt=document.getElementById('productCount');if(cnt)cnt.textContent=products.length+' Products';
  const body=document.getElementById('productsTableBody');if(!body)return;
  body.innerHTML=products.length?products.map(p=>`<tr>
    <td style="width:60px;">${p.imageUrl||p.imageData?`<img src="${p.imageData||p.imageUrl}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" onerror="this.style.display='none';this.nextSibling.style.display='block'"/><span style="font-size:1.5rem;display:none;">${p.emoji||'✨'}</span>`:`<span style="font-size:1.5rem;">${p.emoji||'✨'}</span>`}</td>
    <td>${p.name}</td><td><span class="tag tag-gold">${p.category}</span></td>
    <td style="font-size:.78rem;color:var(--silver);">${p.planet||'-'}</td>
    <td>Rs.${(p.price||0).toLocaleString('en-IN')}</td>
    <td class="dash-actions">
      <button class="dash-action-btn edit" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
      <button class="dash-action-btn delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
    </td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:var(--silver);padding:2rem;">No custom products. Use "Add Product" to create one, or visit Products page first to load defaults.</td></tr>';
}
function openAddProduct(){
  document.getElementById('productModalTitle').textContent='Add Product';
  document.getElementById('editProductId').value='';
  ['pName','pEmoji','pImageUrl','pPlanet','pPlanetHi','pBenefits','pDesc','pDetail'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const pp=document.getElementById('pPrice');if(pp)pp.value='';
  document.getElementById('pCategory').value='gemstones';
  document.getElementById('productImgPreview').innerHTML='';
  productImgData='';openModal('addProductModal');
}
function editProduct(id){
  const p=getProds().find(x=>x.id==id);if(!p)return;
  document.getElementById('productModalTitle').textContent='Edit Product';
  document.getElementById('editProductId').value=id;
  document.getElementById('pName').value=p.name||'';document.getElementById('pEmoji').value=p.emoji||'';
  document.getElementById('pCategory').value=p.category||'gemstones';document.getElementById('pPrice').value=p.price||0;
  document.getElementById('pPlanet').value=p.planet||'';
  if(document.getElementById('pPlanetHi'))document.getElementById('pPlanetHi').value=p.planetHi||'';
  if(document.getElementById('pBenefits'))document.getElementById('pBenefits').value=p.benefits||'';
  document.getElementById('pDesc').value=p.desc||'';document.getElementById('pDetail').value=p.detail||'';
  document.getElementById('pImageUrl').value=p.imageUrl||'';
  productImgData=p.imageData||'';
  document.getElementById('productImgPreview').innerHTML=productImgData?`<div class="img-preview-item"><img src="${productImgData}"/><button class="del-img" onclick="productImgData='';this.parentElement.remove()"><i class="fas fa-times"></i></button></div>`:'';
  openModal('addProductModal');
}
function saveProduct(){
  const name=(document.getElementById('pName')?.value||'').trim();
  const price=parseInt(document.getElementById('pPrice')?.value)||0;
  if(!name){alert('Product name required.');return;}
  const editId=document.getElementById('editProductId')?.value;
  const imgUrl=(document.getElementById('pImageUrl')?.value||'').trim();
  let products=getProds();
  const prod={name,emoji:document.getElementById('pEmoji')?.value||'✨',category:document.getElementById('pCategory')?.value||'gemstones',price,planet:document.getElementById('pPlanet')?.value||'',planetHi:document.getElementById('pPlanetHi')?.value||'',benefits:document.getElementById('pBenefits')?.value||'',desc:document.getElementById('pDesc')?.value||'',detail:document.getElementById('pDetail')?.value||'',imageData:productImgData||'',imageUrl:imgUrl};
  if(editId){const idx=products.findIndex(p=>p.id==editId);if(idx>-1)products[idx]={...products[idx],...prod};}
  else{products.push({id:Date.now(),...prod});}
  saveProds(products);closeModal('addProductModal');renderProductsTable();productImgData='';
}
function deleteProduct(id){if(!confirm('Delete this product?'))return;saveProds(getProds().filter(p=>p.id!=id));renderProductsTable();}

// ANNOUNCEMENTS
let postImagesList=[],currentPostType='announcement';
function setPostType(type,btn){currentPostType=type;document.querySelectorAll('.ptype-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.getElementById('postType').value=type;}
function previewPostImages(input){if(!input.files)return;Array.from(input.files).slice(0,4-postImagesList.length).forEach(file=>{const reader=new FileReader();reader.onload=function(e){postImagesList.push({type:'data',val:e.target.result});renderPostImgPreviews();};reader.readAsDataURL(file);});}
function addPostImageUrl(){const url=(document.getElementById('postImgUrl')?.value||'').trim();if(!url)return;postImagesList.push({type:'url',val:url});document.getElementById('postImgUrl').value='';renderPostImgPreviews();}
function renderPostImgPreviews(){document.getElementById('postImgPreview').innerHTML=postImagesList.map((img,i)=>`<div class="img-preview-item"><img src="${img.val}" onerror="this.style.display='none'"/><button class="del-img" onclick="removePostImg(${i})"><i class="fas fa-times"></i></button></div>`).join('');}
function removePostImg(idx){postImagesList.splice(idx,1);renderPostImgPreviews();}
function addPollOption(){const div=document.createElement('div');div.className='poll-option-row';div.innerHTML=`<input type="text" class="form-input" placeholder="Option"/><button class="poll-del-btn" onclick="removePollOption(this)"><i class="fas fa-times"></i></button>`;document.getElementById('pollOptions').appendChild(div);}
function removePollOption(btn){btn.parentElement.remove();}
function renderPostsTable(){
  const posts=JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
  const cnt=document.getElementById('postCount');if(cnt)cnt.textContent=posts.length+' Posts';
  const body=document.getElementById('postsTableBody');if(!body)return;
  body.innerHTML=posts.length?[...posts].reverse().map(p=>`<tr>
    <td><span class="tag tag-gold">${p.emoji} ${p.type}</span></td>
    <td style="max-width:220px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--silver);font-size:.85rem;">${(p.text||'').substring(0,55)}...</td>
    <td>${p.likes||0}</td><td>${(p.comments||[]).length}</td>
    <td class="dash-actions"><button class="dash-action-btn delete" onclick="deletePost(${p.id})"><i class="fas fa-trash"></i></button></td>
    </tr>`).join(''):'<tr><td colspan="5" style="text-align:center;color:var(--silver);padding:2rem;">No posts yet.</td></tr>';
}
function openAddPost(){
  postImagesList=[];
  ['postText','postLink','postLinkText','postVideo','pollQuestion','postEventDate','postEventLocation','postImgUrl'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('postImgPreview').innerHTML='';
  openModal('addPostModal');
}
function savePost(){
  const text=(document.getElementById('postText')?.value||'').trim();if(!text){alert('Message required.');return;}
  const type=currentPostType;const emojis={announcement:'📢',event:'🌙',wisdom:'✨',offer:'🎁'};
  const pollQ=(document.getElementById('pollQuestion')?.value||'').trim();
  let poll=null;
  if(pollQ){const opts=Array.from(document.querySelectorAll('#pollOptions input[type=text]')).map(i=>i.value.trim()).filter(Boolean);if(opts.length>=2)poll={question:pollQ,options:opts.map(o=>({label:o,votes:0}))};}
  const images=postImagesList.map(img=>img.val);
  const video=(document.getElementById('postVideo')?.value||'').trim();
  const link=(document.getElementById('postLink')?.value||'').trim();
  const linkText=(document.getElementById('postLinkText')?.value||'').trim();
  const eventDate=document.getElementById('postEventDate')?.value||'';
  const eventLoc=(document.getElementById('postEventLocation')?.value||'').trim();
  const posts=JSON.parse(localStorage.getItem('astroveda_posts')||'[]');
  posts.unshift({id:Date.now(),type,emoji:emojis[type]||'📢',author:'Dr. Rajesh R Shastrijee',avatar:'R',time:'Just now',text,images:images.length?images:null,video:video||null,link:link||null,linkText:linkText||'Read More',poll,eventDate:eventDate||null,eventLocation:eventLoc||null,likes:0,hearts:0,shares:0,comments:[]});
  localStorage.setItem('astroveda_posts',JSON.stringify(posts));
  closeModal('addPostModal');renderPostsTable();renderOverview();postImagesList=[];currentPostType='announcement';
}
function deletePost(id){if(!confirm('Delete post?'))return;localStorage.setItem('astroveda_posts',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_posts')||'[]').filter(p=>p.id!=id)));renderPostsTable();renderOverview();}

// REVIEWS — FIX 10: reads from localStorage where home.js saves pending reviews
function renderReviewsPanel(){
  const reviews=JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]');
  const pending=reviews.filter(r=>r.status==='pending');
  const approved=reviews.filter(r=>r.status==='approved');
  const pendEl=document.getElementById('pendingReviewsList');
  if(pendEl)pendEl.innerHTML=pending.length?pending.map(r=>`<div class="review-dash-card"><div class="review-dash-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><div class="review-dash-text">"${r.text}"</div><div class="review-dash-meta">— ${r.name||'Anonymous'}, ${r.location||'India'}</div><div class="dash-actions" style="margin-top:.6rem;"><button class="dash-action-btn edit" onclick="approveReview('${r.id}')"><i class="fas fa-check"></i> Approve</button><button class="dash-action-btn delete" onclick="rejectReview('${r.id}')"><i class="fas fa-times"></i> Reject</button></div></div>`).join(''):'<p style="color:var(--silver);font-size:.85rem;padding:1rem 0;">No pending reviews. Users submit reviews from the home page.</p>';
  const appEl=document.getElementById('approvedReviewsList');
  if(appEl)appEl.innerHTML=approved.length?approved.map(r=>`<div class="review-dash-card"><div class="review-dash-stars">${'★'.repeat(r.rating)}</div><div class="review-dash-text">"${r.text}"</div><div class="review-dash-meta">— ${r.name||'Anonymous'}, ${r.location||'India'}</div><div class="dash-actions" style="margin-top:.6rem;"><button class="dash-action-btn delete" onclick="rejectReview('${r.id}')"><i class="fas fa-trash"></i> Remove</button></div></div>`).join(''):'<p style="color:var(--silver);font-size:.85rem;">No approved reviews yet.</p>';
}
function approveReview(id){
  const reviews=JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]');
  const r=reviews.find(x=>x.id===id);
  if(r){r.status='approved';localStorage.setItem('astroveda_testimonials',JSON.stringify(reviews));renderReviewsPanel();renderOverview();}
}
function rejectReview(id){
  if(!confirm('Remove this review?'))return;
  localStorage.setItem('astroveda_testimonials',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_testimonials')||'[]').filter(r=>r.id!==id)));
  renderReviewsPanel();renderOverview();
}

// RASHI GUIDANCE
const RASHIS=['Mesh','Vrishabh','Mithun','Kark','Simha','Kanya','Tula','Vrishchik','Dhanu','Makar','Kumbh','Meen'];
const RASHI_HINDI=['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
const RASHI_ANIMALS=['🐏','🐂','👫','🦀','🦁','👧','⚖️','🦂','🏹','🐊','🏺','🐟'];
function renderRashiEditor(){
  const grid=document.getElementById('rashiEditorGrid');if(!grid)return;
  grid.innerHTML=RASHIS.map((r,i)=>`<div class="rashi-editor-card" onclick="openRashiEdit('${r}','${RASHI_HINDI[i]}')"><h5>${RASHI_ANIMALS[i]} ${r}</h5><p>${RASHI_HINDI[i]} · Click to edit monthly guidance</p></div>`).join('');
}
function openRashiEdit(sign,hindi){
  const data=(()=>{try{return JSON.parse(localStorage.getItem('astroveda_rashi_guidance')||'null');}catch(e){return null;}})();
  const s=data?.signs?.[sign]||{};
  document.getElementById('rashiEditTitle').textContent=`Edit: ${sign} (${hindi})`;
  document.getElementById('rashiEditKey').value=sign;
  document.getElementById('rashiCareer').value=s.career||'';document.getElementById('rashiLove').value=s.love||'';
  document.getElementById('rashiHealth').value=s.health||'';document.getElementById('rashiRemedy').value=s.remedy||'';
  openModal('rashiEditModal');
}
function saveRashiGuidance(){
  const sign=document.getElementById('rashiEditKey').value;
  let data=(()=>{try{return JSON.parse(localStorage.getItem('astroveda_rashi_guidance')||'null')||{month:'',signs:{}};}catch(e){return{month:'',signs:{}};}})();
  data.month=new Date().toLocaleString('en-IN',{month:'long',year:'numeric'});
  data.signs[sign]={career:document.getElementById('rashiCareer').value,love:document.getElementById('rashiLove').value,health:document.getElementById('rashiHealth').value,remedy:document.getElementById('rashiRemedy').value};
  localStorage.setItem('astroveda_rashi_guidance',JSON.stringify(data));
  closeModal('rashiEditModal');alert('Saved '+sign+' guidance!');
}

// ACHIEVEMENTS
function renderAchievementsPanel(){
  const all=JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]');
  function renderSection(type,containerId){
    const items=all.filter(a=>a.type===type);
    const el=document.getElementById(containerId);if(!el)return;
    if(!items.length){el.innerHTML=`<p style="color:var(--silver);font-size:.83rem;padding:.5rem 0;">No ${type}s added yet.</p>`;return;}
    if(type==='photo'){
      el.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;">${items.map(p=>`<div class="ach-item" style="padding:.6rem;">${p.imageData||p.imageUrl?`<img src="${p.imageData||p.imageUrl}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:.4rem;" onerror="this.style.display='none'"/>`:'<div style="height:80px;background:rgba(201,168,76,.06);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:.4rem;font-size:1.5rem;">📸</div>'}<p style="font-size:.78rem;color:var(--white);margin-bottom:.4rem;">${p.title||'Photo'}</p><div style="display:flex;gap:.3rem;"><button class="ctrl-btn edit" onclick="editAchievement(${p.id})" style="flex:1;font-size:.68rem;"><i class="fas fa-edit"></i></button><button class="ctrl-btn del" onclick="deleteAchievement(${p.id})" style="flex:1;font-size:.68rem;"><i class="fas fa-trash"></i></button></div></div>`).join('')}</div>`;
    }else{
      el.innerHTML=items.map(a=>`<div class="ach-item" style="margin-bottom:.8rem;">${a.imageData||a.imageUrl?`<img src="${a.imageData||a.imageUrl}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:.6rem;" onerror="this.style.display='none'"/>`:''}<h5 style="color:var(--gold);margin-bottom:.2rem;font-size:.88rem;">${a.title}</h5>${a.org?`<p style="font-size:.75rem;color:rgba(168,164,200,.7);margin-bottom:.15rem;">${a.org}</p>`:''} ${a.desc?`<p style="font-size:.75rem;color:var(--silver);">${a.desc}</p>`:''}<div class="ach-actions" style="margin-top:.6rem;"><button class="ctrl-btn edit" onclick="editAchievement(${a.id})" style="flex:1;"><i class="fas fa-edit"></i> Edit</button><button class="ctrl-btn del" onclick="deleteAchievement(${a.id})" style="flex:1;"><i class="fas fa-trash"></i> Delete</button></div></div>`).join('');
    }
  }
  renderSection('award','awardsManager');renderSection('certificate','certificatesManager');renderSection('medal','medalsManager');renderSection('photo','photosManager');
}

let achImgData='';
function previewAchImg(input){if(!input.files||!input.files[0])return;const reader=new FileReader();reader.onload=function(e){achImgData=e.target.result;document.getElementById('achImgPreview').innerHTML=`<img src="${achImgData}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;"/>`;};reader.readAsDataURL(input.files[0]);}

function openAddAchievement(type){
  const labels={award:'Add Award',certificate:'Add Certificate',medal:'Add Medal',photo:'Add Photo'};
  document.getElementById('addAchTitle').textContent=labels[type]||'Add Item';
  document.getElementById('achType').value=type;
  ['achTitle','achOrg','achDesc','achImgUrl'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('achImgPreview').innerHTML='';
  document.getElementById('editAchId').value='';
  achImgData='';openModal('addAchModal');
}
function editAchievement(id){
  const all=JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]');
  const a=all.find(x=>x.id==id);if(!a)return;
  const labels={award:'Edit Award',certificate:'Edit Certificate',medal:'Edit Medal',photo:'Edit Photo'};
  document.getElementById('addAchTitle').textContent=labels[a.type]||'Edit Item';
  document.getElementById('achType').value=a.type;
  document.getElementById('achTitle').value=a.title||'';document.getElementById('achOrg').value=a.org||'';
  document.getElementById('achDesc').value=a.desc||'';document.getElementById('achImgUrl').value=a.imageUrl||'';
  document.getElementById('editAchId').value=id;
  achImgData=a.imageData||'';
  document.getElementById('achImgPreview').innerHTML=achImgData?`<img src="${achImgData}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;"/>`:'';
  openModal('addAchModal');
}
function saveAchievement(){
  const type=document.getElementById('achType').value;
  const title=(document.getElementById('achTitle')?.value||'').trim();
  if(!title&&type!=='photo'){alert('Title required.');return;}
  const editId=document.getElementById('editAchId')?.value;
  let achievements=JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]');
  const item={type,title,org:document.getElementById('achOrg')?.value||'',desc:document.getElementById('achDesc')?.value||'',imageData:achImgData||'',imageUrl:document.getElementById('achImgUrl')?.value||''};
  if(editId){const idx=achievements.findIndex(a=>a.id==editId);if(idx>-1)achievements[idx]={...achievements[idx],...item};}
  else{achievements.push({id:Date.now(),...item});}
  localStorage.setItem('astroveda_custom_achievements',JSON.stringify(achievements));
  closeModal('addAchModal');renderAchievementsPanel();achImgData='';
}
function deleteAchievement(id){if(!confirm('Delete?'))return;localStorage.setItem('astroveda_custom_achievements',JSON.stringify(JSON.parse(localStorage.getItem('astroveda_custom_achievements')||'[]').filter(a=>a.id!=id)));renderAchievementsPanel();}

// WEBSITE CONTROL
function loadSiteSettings(){
  const s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');
  const maint=document.getElementById('maintenanceToggle');const books=document.getElementById('bookingsToggle');const revs=document.getElementById('reviewsToggle');
  if(maint)maint.checked=!!s.maintenance;if(books)books.checked=s.acceptBookings!==false;if(revs)revs.checked=s.showReviews!==false;
}
function toggleSetting(key,val){const s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');s[key]=val;localStorage.setItem('astroveda_site_settings',JSON.stringify(s));}
function editSiteSetting(key,currentVal){
  document.getElementById('siteSettingTitle').textContent='Edit: '+key.replace(/([A-Z])/g,' $1').trim();
  document.getElementById('siteSettingKey').value=key;
  const stored=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');
  document.getElementById('siteSettingVal').value=stored[key]!==undefined?stored[key]:currentVal;
  openModal('siteSettingModal');
}
function saveSiteSettingModal(){
  const key=document.getElementById('siteSettingKey').value;const val=document.getElementById('siteSettingVal').value;
  const s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');s[key]=val;
  localStorage.setItem('astroveda_site_settings',JSON.stringify(s));closeModal('siteSettingModal');alert('Setting saved! Refresh the website to see changes.');
}
function editSiteImage(key){
  const input=document.createElement('input');input.type='file';input.accept='image/*';
  input.onchange=function(){if(!this.files[0])return;const reader=new FileReader();reader.onload=function(e){const s=JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}');s[key]=e.target.result;localStorage.setItem('astroveda_site_settings',JSON.stringify(s));alert('Image uploaded! Refresh the website to see changes.');};reader.readAsDataURL(this.files[0]);};
  input.click();
}

// FEEDBACK
function renderFeedbackList(){
  const feedbacks=JSON.parse(localStorage.getItem('astroveda_feedbacks')||'[]');
  const list=document.getElementById('feedbackList');if(!list)return;
  list.innerHTML=feedbacks.length?[...feedbacks].reverse().map(f=>`<div class="feedback-dash-item"><div class="feedback-dash-header"><strong>${f.name}</strong><span>${new Date(f.time).toLocaleDateString('en-IN')}</span></div><p>${f.msg}</p></div>`).join(''):'<p style="color:var(--silver);">No feedback yet.</p>';
}

// PAGE EDITOR — About, FAQ, Cosmic Tips
function switchDash(name,btn){
  document.querySelectorAll('.dash-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.dash-nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('panel-'+name)?.classList.add('active');
  if(btn){btn.classList.add('active');const title=document.getElementById('dashTitle');if(title)title.textContent=btn.textContent.trim();}
  if(name==='reviews')      renderReviewsPanel();
  if(name==='rashi')        renderRashiEditor();
  if(name==='achievements') renderAchievementsPanel();
  if(name==='sitecontrol')  loadSiteSettings();
  if(name==='pageeditor')   loadPageEditor();
}

function loadPageEditor(){
  const pc=JSON.parse(localStorage.getItem('astroveda_page_content')||'{}');
  if(document.getElementById('pgMission'))   document.getElementById('pgMission').value   = pc.mission   ||'To provide authentic, compassionate, and transformative astrological guidance that empowers individuals to navigate life with clarity, confidence, and cosmic alignment.';
  if(document.getElementById('pgVision'))    document.getElementById('pgVision').value    = pc.vision    ||'To become the world\'s most trusted Vedic astrology platform — bridging ancient Jyotish wisdom with modern seekers across every culture and corner of the globe.';
  if(document.getElementById('pgPhilosophy'))document.getElementById('pgPhilosophy').value= pc.philosophy||'We honor the sacred science of Jyotish as a tool for self-awareness — not fatalism. The stars guide; the soul decides.';
  if(document.getElementById('pgAboutIntro'))document.getElementById('pgAboutIntro').value= pc.aboutIntro||'AstroVeda is a premium Vedic astrology platform founded by Dr. Rajesh R Shastrijee with a singular mission — to make the profound wisdom of Jyotish accessible, trustworthy, and transformative for people across the world.';
  if(document.getElementById('pgDailyTip'))  document.getElementById('pgDailyTip').value  = pc.dailyTip  ||'';
  if(document.getElementById('pgWeeklyMantra'))document.getElementById('pgWeeklyMantra').value= pc.weeklyMantra||'';
  if(document.getElementById('pgAuspiciousDays'))document.getElementById('pgAuspiciousDays').value= pc.auspiciousDays||'';
  renderFaqManager();
}

function savePageContent(type){
  const pc=JSON.parse(localStorage.getItem('astroveda_page_content')||'{}');
  if(type==='about'){
    pc.mission    = document.getElementById('pgMission')?.value||'';
    pc.vision     = document.getElementById('pgVision')?.value||'';
    pc.philosophy = document.getElementById('pgPhilosophy')?.value||'';
    pc.aboutIntro = document.getElementById('pgAboutIntro')?.value||'';
  }
  if(type==='tips'){
    pc.dailyTip      = document.getElementById('pgDailyTip')?.value||'';
    pc.weeklyMantra  = document.getElementById('pgWeeklyMantra')?.value||'';
    pc.auspiciousDays= document.getElementById('pgAuspiciousDays')?.value||'';
  }
  localStorage.setItem('astroveda_page_content',JSON.stringify(pc));
  alert('Saved! Changes will appear on the website pages.');
}

// FAQ Manager
function getFaqs(){try{return JSON.parse(localStorage.getItem('astroveda_faqs')||'null')||getDefaultFaqs();}catch(e){return getDefaultFaqs();}}
function saveFaqs(f){localStorage.setItem('astroveda_faqs',JSON.stringify(f));}
function getDefaultFaqs(){return[
  {id:1,q:'What is Vedic astrology?',a:'Vedic astrology (Jyotish) is the ancient Indian science of light — a system that uses the position of planets and stars at the time of your birth to provide guidance on your life path, relationships, career, and spiritual journey.'},
  {id:2,q:'How accurate are Dr. Shastrijee\'s predictions?',a:'Dr. Shastrijee has a documented accuracy rate of over 90% for major life events including marriage, career changes, health, and financial shifts. This is validated by thousands of clients over 25+ years.'},
  {id:3,q:'How do I book a consultation?',a:'Click the "Book Appointment" button, select your service, fill in your birth details (date, time, and place of birth), and submit. Dr. Shastrijee will confirm your appointment via WhatsApp.'},
  {id:4,q:'What information do I need for a reading?',a:'You will need your exact date of birth, time of birth (as precise as possible), and place of birth. The more accurate your birth time, the more precise the reading.'},
  {id:5,q:'Are consultations available outside India?',a:'Yes! Consultations are available worldwide via video call, WhatsApp, and phone. Dr. Shastrijee has served clients across 40+ countries.'},
  {id:6,q:'What is the difference between services?',a:'Free Consultation is a 15-minute introductory session. Detailed Jyotish Vishleshan is a comprehensive 2-hour analysis with written report. Kundli Nirman creates your birth chart with full interpretation.'},
];}

function renderFaqManager(){
  const faqs=getFaqs();
  const el=document.getElementById('faqManager');if(!el)return;
  el.innerHTML=faqs.map(f=>`
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--glass-border);border-radius:10px;padding:.9rem;margin-bottom:.6rem;">
      <div style="font-family:var(--font-ui);font-size:.88rem;color:var(--white);font-weight:600;margin-bottom:.3rem;">${f.q}</div>
      <div style="font-size:.8rem;color:var(--silver);margin-bottom:.6rem;">${f.a.substring(0,80)}...</div>
      <div style="display:flex;gap:.4rem;">
        <button class="ctrl-btn edit" onclick="editFaq(${f.id})" style="flex:1;"><i class="fas fa-edit"></i> Edit</button>
        <button class="ctrl-btn del" onclick="deleteFaq(${f.id})" style="flex:1;"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('')||'<p style="color:var(--silver);">No FAQs yet.</p>';
}

function openAddFaq(){
  document.getElementById('faqModalTitle').textContent='Add FAQ';
  document.getElementById('editFaqId').value='';
  document.getElementById('faqQuestion').value='';
  document.getElementById('faqAnswer').value='';
  openModal('addFaqModal');
}
function editFaq(id){
  const f=getFaqs().find(x=>x.id==id);if(!f)return;
  document.getElementById('faqModalTitle').textContent='Edit FAQ';
  document.getElementById('editFaqId').value=id;
  document.getElementById('faqQuestion').value=f.q;
  document.getElementById('faqAnswer').value=f.a;
  openModal('addFaqModal');
}
function saveFaq(){
  const q=(document.getElementById('faqQuestion')?.value||'').trim();
  const a=(document.getElementById('faqAnswer')?.value||'').trim();
  if(!q||!a){alert('Question and answer required.');return;}
  const editId=document.getElementById('editFaqId')?.value;
  let faqs=getFaqs();
  if(editId){const idx=faqs.findIndex(f=>f.id==editId);if(idx>-1)faqs[idx]={...faqs[idx],q,a};}
  else{faqs.push({id:Date.now(),q,a});}
  saveFaqs(faqs);closeModal('addFaqModal');renderFaqManager();
}
function deleteFaq(id){
  if(!confirm('Delete this FAQ?'))return;
  saveFaqs(getFaqs().filter(f=>f.id!=id));renderFaqManager();
}
