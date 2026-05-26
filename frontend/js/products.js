// ============================================
// AstroVeda - Products JS (Fixed)
// ============================================
window.addEventListener('DOMContentLoaded', () => {

const WHATSAPP = '8863038229';

const PRODUCT_IMAGES = {
  1:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  2:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  3:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  4:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  5:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  6:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  7:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  8:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  9:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  10:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  11:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  12:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  13:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  14:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  101:'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&q=80',
  102:'https://images.unsplash.com/photo-1519181245277-cffeb31da948?w=400&q=80',
  103:'https://images.unsplash.com/photo-1509745491608-2e9b92d57c6e?w=400&q=80',
  104:'https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?w=400&q=80',
  105:'https://images.unsplash.com/photo-1583870894471-d819a5e8fb08?w=400&q=80',
  106:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
  107:'https://images.unsplash.com/photo-1611171711912-e3f5b50d3d69?w=400&q=80',
  108:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80',
  109:'https://images.unsplash.com/photo-1567468705888-68e2a4699e42?w=400&q=80',
  110:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80',
  111:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  112:'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80',
  113:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
  114:'https://images.unsplash.com/photo-1519181245277-cffeb31da948?w=400&q=80',
  201:'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80',
  202:'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80',
  203:'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80',
  204:'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80',
  205:'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80',
  206:'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80',
  301:'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&q=80',
  302:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80',
  303:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
  304:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
};

const DEFAULT_PRODUCTS = [
  {id:1,  name:'One Mukhi Rudraksha',       category:'rudraksha',emoji:'📿',price:5000, planet:'Sun (Surya)',    planetHi:'सूर्य',         benefits:'Supreme consciousness, moksha, removes all sins.',            desc:'Rarest Rudraksha — represents Lord Shiva. Grants divine grace and liberation.',        detail:'Nepal origin, certified. Silver capped, energized by Dr. Shastrijee.'},
  {id:2,  name:'Two Mukhi Rudraksha',       category:'rudraksha',emoji:'📿',price:800,  planet:'Moon (Chandra)',planetHi:'चंद्र',          benefits:'Emotional balance, harmony, mental peace.',                   desc:'Represents Shiva-Parvati union. Ideal for marriage harmony.',                         detail:'Nepal origin, lab certified, energized.'},
  {id:3,  name:'Three Mukhi Rudraksha',     category:'rudraksha',emoji:'📿',price:600,  planet:'Mars (Mangal)', planetHi:'मंगल',          benefits:'Removes fear, past karma, depression. Boosts courage.',       desc:'Represents Agni. Excellent for overcoming fear and trauma.',                          detail:'Nepal origin, silver cap, certified.'},
  {id:4,  name:'Four Mukhi Rudraksha',      category:'rudraksha',emoji:'📿',price:550,  planet:'Mercury (Budh)',planetHi:'बुध',           benefits:'Intelligence, memory, speech, communication.',               desc:'Represents Lord Brahma. Ideal for students and writers.',                             detail:'Nepal origin, certified.'},
  {id:5,  name:'Five Mukhi Rudraksha',      category:'rudraksha',emoji:'📿',price:400,  planet:'Jupiter (Guru)',planetHi:'गुरु',           benefits:'Overall health, peace, balances five elements.',             desc:'Kalagni Rudra — ideal for everyone. Most powerful and common.',                       detail:'Nepal origin, red thread, silver cap.'},
  {id:6,  name:'Six Mukhi Rudraksha',       category:'rudraksha',emoji:'📿',price:700,  planet:'Venus (Shukra)',planetHi:'शुक्र',          benefits:'Love, beauty, creativity, willpower.',                       desc:'Represents Kartikeya. Enhances willpower and focus.',                                 detail:'Nepal origin, certified.'},
  {id:7,  name:'Seven Mukhi Rudraksha',     category:'rudraksha',emoji:'📿',price:900,  planet:'Saturn (Shani)',planetHi:'शनि',           benefits:'Wealth, health, luck, removes poverty.',                     desc:'Represents Mahalakshmi. Attracts financial prosperity.',                              detail:'Nepal origin, certified.'},
  {id:8,  name:'Eight Mukhi Rudraksha',     category:'rudraksha',emoji:'📿',price:1200, planet:'Rahu',          planetHi:'राहु',           benefits:'Removes Rahu doshas, obstacles. Gives success.',             desc:'Represents Ganesha. Removes obstacles in career and life.',                           detail:'Nepal origin, silver capped.'},
  {id:9,  name:'Nine Mukhi Rudraksha',      category:'rudraksha',emoji:'📿',price:1800, planet:'Ketu',          planetHi:'केतु',           benefits:'Removes Ketu doshas, fear, spiritual awakening.',            desc:'Represents Goddess Durga. Bestows energy and fearlessness.',                         detail:'Nepal origin, certified.'},
  {id:10, name:'Ten Mukhi Rudraksha',       category:'rudraksha',emoji:'📿',price:2500, planet:'All Planets',   planetHi:'सभी ग्रह',       benefits:'Neutralizes all planetary doshas. Protection from evil.',    desc:'Represents Vishnu. Balances all 9 planets.',                                         detail:'Nepal origin, certified.'},
  {id:11, name:'Eleven Mukhi Rudraksha',    category:'rudraksha',emoji:'📿',price:3500, planet:'All Planets',   planetHi:'सभी ग्रह',       benefits:'Wisdom, meditation power, protects from accidents.',         desc:'Represents 11 Rudras. Blessed by Hanuman.',                                          detail:'Nepal origin, certified.'},
  {id:12, name:'Twelve Mukhi Rudraksha',    category:'rudraksha',emoji:'📿',price:5000, planet:'Sun (Surya)',   planetHi:'सूर्य',          benefits:'Radiance, leadership, authority.',                           desc:'Represents Surya. Grants brilliance and authority.',                                 detail:'Nepal origin, gold capped.'},
  {id:13, name:'Thirteen Mukhi Rudraksha',  category:'rudraksha',emoji:'📿',price:8000, planet:'Venus (Shukra)',planetHi:'शुक्र',          benefits:'Fulfills all desires, success in love.',                     desc:'Represents Indra. Fulfills worldly desires.',                                        detail:'Nepal origin, gold capped.'},
  {id:14, name:'Fourteen Mukhi Rudraksha',  category:'rudraksha',emoji:'📿',price:12000,planet:'Saturn (Shani)',planetHi:'शनि',           benefits:'Supreme protection, removes Shani doshas, third eye.',       desc:'Deva Mani — extremely rare and powerful.',                                            detail:'Nepal origin, gold capped, extremely rare.'},
  {id:101,name:'Manik (Ruby)',              category:'gemstones',emoji:'💎',price:12000,planet:'Sun (Surya)',   planetHi:'सूर्य',          benefits:'Confidence, leadership, vitality, eye health.',              desc:'Wear to strengthen Sun. Best for Simha Rashi.',                                      detail:'Natural Burmese Ruby, 3-4 carats. Lab certified.'},
  {id:102,name:'Moti (Pearl)',              category:'gemstones',emoji:'💎',price:3000, planet:'Moon (Chandra)',planetHi:'चंद्र',          benefits:'Emotional peace, intuition, fertility, clarity.',            desc:'Wear to strengthen Moon. Best for Kark Rashi.',                                      detail:'Natural sea pearl, 5-7 carats. Certified.'},
  {id:103,name:'Moonga (Red Coral)',        category:'gemstones',emoji:'💎',price:4000, planet:'Mars (Mangal)', planetHi:'मंगल',          benefits:'Courage, strength, removes Mangal dosha.',                   desc:'Wear to strengthen Mars. Best for Mesh Rashi.',                                      detail:'Italian Red Coral, 6-7 carats, certified.'},
  {id:104,name:'Panna (Emerald)',           category:'gemstones',emoji:'💎',price:10000,planet:'Mercury (Budh)',planetHi:'बुध',           benefits:'Intelligence, business success, communication.',             desc:'Wear to strengthen Mercury. Best for Mithun.',                                       detail:'Zambian Emerald, 2-3 carats. Certified.'},
  {id:105,name:'Pukhraj (Yellow Sapphire)', category:'gemstones',emoji:'💎',price:8000, planet:'Jupiter (Guru)',planetHi:'गुरु',           benefits:'Wisdom, wealth, marriage, children, education.',             desc:'Wear to strengthen Jupiter. Best for Dhanu.',                                        detail:'Ceylon Yellow Sapphire, 4-5 carats. Certified.'},
  {id:106,name:'Heera (Diamond)',           category:'gemstones',emoji:'💎',price:50000,planet:'Venus (Shukra)',planetHi:'शुक्र',          benefits:'Love, beauty, luxury, marital bliss.',                       desc:'Wear to strengthen Venus. Best for Tula Rashi.',                                     detail:'Natural white diamond, 0.5 carat. IGI certified.'},
  {id:107,name:'Neelam (Blue Sapphire)',    category:'gemstones',emoji:'💎',price:15000,planet:'Saturn (Shani)',planetHi:'शनि',           benefits:'Career, discipline, wealth (when suited).',                  desc:'Consult before wearing. Best for Makar Rashi.',                                      detail:'Ceylon Blue Sapphire, 3-4 carats. GIA certified.'},
  {id:108,name:'Gomedh (Hessonite)',        category:'gemstones',emoji:'💎',price:4500, planet:'Rahu',          planetHi:'राहु',           benefits:'Removes Rahu doshas, confusion, career growth.',             desc:'Wear to pacify Rahu. Best for tech/foreign fields.',                                 detail:'Ceylon Hessonite, 5-6 carats. Certified.'},
  {id:109,name:"Lehsunia (Cat's Eye)",      category:'gemstones',emoji:'💎',price:6000, planet:'Ketu',          planetHi:'केतु',           benefits:'Removes Ketu doshas, psychic attacks, spiritual.',           desc:'Wear for Ketu. Excellent for spiritual awakening.',                                  detail:'Ceylon Chrysoberyl, 4-5 carats. Certified.'},
  {id:110,name:'Opal',                      category:'gemstones',emoji:'💎',price:3500, planet:'Venus (Shukra)',planetHi:'शुक्र',          benefits:'Creativity, love, artistic success.',                        desc:'Alternative to Heera for Venus.',                                                    detail:'Australian Opal, 3-4 carats. Certified.'},
  {id:111,name:'Turquoise (Firoza)',         category:'gemstones',emoji:'💎',price:2500, planet:'Jupiter (Guru)',planetHi:'गुरु',           benefits:'Luck, protection, spiritual growth.',                        desc:'Alternative to Pukhraj. Protects from evil eye.',                                   detail:'Persian Turquoise, 6-7 carats. Certified.'},
  {id:112,name:'Amethyst',                  category:'gemstones',emoji:'💎',price:1500, planet:'Saturn (Shani)',planetHi:'शनि',           benefits:'Peace, clarity, meditation, overcomes addictions.',          desc:'Semi-precious stone for Saturn.',                                                    detail:'Natural Amethyst, 7-8 carats. Certified.'},
  {id:113,name:'Sphatik (Crystal Quartz)',   category:'gemstones',emoji:'💎',price:800,  planet:'Universal',    planetHi:'सार्वभौमिक',     benefits:'Universal healing, clarity, positive energy.',               desc:'Sacred crystal for worship and meditation.',                                          detail:'Natural clear quartz, 10+ carats.'},
  {id:114,name:'Moonstone',                 category:'gemstones',emoji:'💎',price:2200, planet:'Moon (Chandra)',planetHi:'चंद्र',          benefits:'Emotional healing, fertility, intuition.',                   desc:'Alternative to Pearl for Moon energy.',                                              detail:'Ceylon Moonstone, 5-6 carats. Certified.'},
  {id:201,name:'Shree Yantra (Silver)',      category:'yantras',  emoji:'🔯',price:3500, planet:'Lakshmi/Venus',planetHi:'लक्ष्मी/शुक्र', benefits:'Wealth, prosperity, abundance, spiritual progress.',         desc:'Most powerful Yantra. Energized with Lakshmi mantras.',                              detail:'925 pure silver, 3"x3". Energized with 1008 mantras.'},
  {id:202,name:'Kuber Yantra (Gold Plated)', category:'yantras',  emoji:'🔯',price:1500, planet:'Jupiter/Kuber',planetHi:'गुरु/कुबेर',    benefits:'Financial abundance, wealth attraction, removes debt.',       desc:'Yantra of Lord Kuber — god of wealth.',                                              detail:'Gold-plated copper, 4"x4". Energized.'},
  {id:203,name:'Vastu Yantra',               category:'yantras',  emoji:'🔯',price:2000, planet:'All Planets',  planetHi:'सभी ग्रह',       benefits:'Corrects Vastu doshas, harmony, removes negativity.',        desc:'Neutralizes Vastu defects.',                                                         detail:'Copper, 5"x5". Energized.'},
  {id:204,name:'Surya Yantra',               category:'yantras',  emoji:'🔯',price:1200, planet:'Sun (Surya)',  planetHi:'सूर्य',           benefits:'Government favor, authority, health, confidence.',           desc:'Yantra of Lord Surya. Place facing East.',                                           detail:'Copper, 3"x3". Energized.'},
  {id:205,name:'Mahamrityunjaya Yantra',      category:'yantras',  emoji:'🔯',price:2500, planet:'Shiva/Saturn', planetHi:'शिव/शनि',        benefits:'Protection from death, accidents, illness.',                 desc:'Extremely powerful protective Yantra.',                                               detail:'Silver-coated copper, 4"x4". Energized 11,000 times.'},
  {id:206,name:'Navgraha Yantra',             category:'yantras',  emoji:'🔯',price:3000, planet:'All 9 Planets',planetHi:'नवग्रह',         benefits:'Balances all 9 planets, removes all doshas.',               desc:'All 9 planetary Yantras in one.',                                                    detail:'Gold-plated copper, 6"x6".'},
  {id:301,name:'Sacred Dhoop Sticks Set',     category:'spiritual',emoji:'🕯️',price:350,  planet:'All Planets',  planetHi:'सभी ग्रह',      benefits:'Purifies home, removes negativity, enhances meditation.',   desc:'Premium dhoop from rare herbs for daily puja.',                                      detail:'6 fragrances: Sandalwood, Rose, Jasmine, Camphor, Nag Champa, Guggul.'},
  {id:302,name:'Crystal Singing Bowl',        category:'spiritual',emoji:'🔔',price:2200, planet:'All Planets',  planetHi:'सभी ग्रह',      benefits:'Chakra balancing, sound healing, deep meditation.',          desc:'Himalayan crystal bowl for sound therapy.',                                          detail:'8-inch pure quartz, mallet included. 432 Hz.'},
  {id:303,name:'Tulsi Mala (108 beads)',       category:'spiritual',emoji:'📿',price:400,  planet:'Jupiter',      planetHi:'गुरु',           benefits:'Japa meditation, purifies mind, Vishnu blessings.',          desc:'Sacred Tulsi mala for chanting and meditation.',                                     detail:'108+1 beads, hand-knotted in red thread.'},
  {id:304,name:'Gomti Chakra (Set of 11)',     category:'spiritual',emoji:'🌀',price:299,  planet:'Moon',         planetHi:'चंद्र',          benefits:'Vastu remedy, protection from evil eye, attracts luck.',     desc:'Natural Gomti Chakras from the Gomti river.',                                        detail:'Set of 11 in red cloth pouch. Energized.'},
];

const CAT_LABELS = { gemstones:'Gemstone', rudraksha:'Rudraksha', yantras:'Yantra', spiritual:'Spiritual' };
const CAT_EMOJIS = { gemstones:'💎', rudraksha:'📿', yantras:'🔯', spiritual:'🕯️' };
const PLANET_COLORS = {
  'Sun (Surya)':'#ff9f43','Moon (Chandra)':'#c8d6e5','Mars (Mangal)':'#ff6b6b',
  'Mercury (Budh)':'#54a0ff','Jupiter (Guru)':'#feca57','Venus (Shukra)':'#ff9ff3',
  'Saturn (Shani)':'#576574','Rahu':'#8395a7','Ketu':'#5f27cd',
  'All Planets':'#c9a84c','All 9 Planets':'#c9a84c','Universal':'#c9a84c',
  'Lakshmi/Venus':'#ff9ff3','Jupiter/Kuber':'#feca57','Shiva/Saturn':'#576574','Jupiter':'#feca57','Moon':'#c8d6e5',
};

let filter = 'all', search = '';

function getUser(){ try{return JSON.parse(localStorage.getItem('astroveda_current_user')||'null');}catch(e){return null;} }

function getProds() {
  try {
    const s = localStorage.getItem('astroveda_products');
    if (s) {
      const stored = JSON.parse(s);
      return stored.map(p => {
        const def = DEFAULT_PRODUCTS.find(d => d.id === p.id);
        return def ? {...def, ...p} : p;
      });
    }
    return DEFAULT_PRODUCTS;
  } catch(e) { return DEFAULT_PRODUCTS; }
}

function getSaved() {
  const user = getUser(); if(!user) return [];
  try { return JSON.parse(localStorage.getItem('astroveda_saved_products')||'[]').filter(s=>s.userId===user.id||s.userId===(user._id||user.id)); }
  catch(e){ return []; }
}

function isSaved(id) { return !!getSaved().find(s => s.productId === id); }

function toggleSave(id) {
  const user = getUser();
  if (!user) { window.location.href = window.location.pathname.includes('/pages/') ? 'auth.html' : 'pages/auth.html'; return; }
  const saved = JSON.parse(localStorage.getItem('astroveda_saved_products')||'[]');
  const uid = user.id || user._id;
  const exists = saved.findIndex(s => (s.userId===uid||s.userId===user.id) && s.productId===id);
  if (exists > -1) {
    saved.splice(exists, 1);
    localStorage.setItem('astroveda_saved_products', JSON.stringify(saved));
    if (typeof showToast === 'function') showToast('Removed','Product removed from saved.','🗑️');
  } else {
    saved.push({userId: uid, productId: id, savedAt: new Date().toISOString()});
    localStorage.setItem('astroveda_saved_products', JSON.stringify(saved));
    if (typeof showToast === 'function') showToast('Saved!','Product saved to your profile.','❤️');
  }
  // Update save button in modal if open
  const btn = document.getElementById('modalSaveBtn');
  if (btn) { const saved2 = isSaved(id); btn.innerHTML = saved2 ? '<i class="fas fa-heart" style="color:#ff6b6b;"></i> Saved' : '<i class="far fa-heart"></i> Save'; }
}

function getImg(p) {
  // Priority: dashboard-uploaded image > dashboard URL > default Unsplash
  if (p.imageData) return p.imageData;
  if (p.imageUrl)  return p.imageUrl;
  return PRODUCT_IMAGES[p.id] || null;
}

function renderProducts() {
  const grid  = document.getElementById('productsGrid');
  const empty = document.getElementById('productsEmpty');
  if (!grid) return;

  const filtered = getProds().filter(p => {
    const cat = filter === 'all' || p.category === filter;
    const src = !search || p.name.toLowerCase().includes(search) || (p.desc||'').toLowerCase().includes(search) || (p.planet||'').toLowerCase().includes(search);
    return cat && src;
  });

  if (!filtered.length) { grid.innerHTML=''; empty?.classList.remove('hidden'); return; }
  empty?.classList.add('hidden');

  grid.innerHTML = filtered.map(p => {
    const img = getImg(p);  // FIX 5: use p object so imageData/imageUrl take priority
    const catEmoji = CAT_EMOJIS[p.category] || '✨';
    const catLabel = CAT_LABELS[p.category] || p.category;
    const imgHtml = img
      ? `<img src="${img}" alt="${p.name}" style="width:100%;height:160px;object-fit:cover;border-radius:12px 12px 0 0;" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div style="display:none;height:160px;align-items:center;justify-content:center;font-size:3.5rem;background:rgba(201,168,76,0.06);border-radius:12px 12px 0 0;">${p.emoji}</div>`
      : `<div style="height:160px;display:flex;align-items:center;justify-content:center;font-size:3.5rem;background:rgba(201,168,76,0.06);border-radius:12px 12px 0 0;">${p.emoji}</div>`;
    const col = PLANET_COLORS[p.planet] || '#c9a84c';
    const savedClass = isSaved(p.id) ? 'style="color:#ff6b6b;"' : '';
    return `
    <div class="product-card" style="cursor:pointer;position:relative;">
      <div onclick="openProductModal(${p.id})">
        <div style="position:relative;overflow:hidden;border-radius:12px 12px 0 0;">${imgHtml}
          <div style="position:absolute;top:8px;left:8px;"><span style="background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);color:#c9a84c;font-family:'Rajdhani',sans-serif;font-size:0.68rem;font-weight:700;padding:3px 8px;border-radius:20px;">${catEmoji} ${catLabel}</span></div>
        </div>
        <div style="padding:12px 14px 6px;">
          <div style="font-size:0.95rem;font-weight:700;margin-bottom:4px;color:var(--white);">${p.name}</div>
          <div style="background:${col}22;border:1px solid ${col}44;border-radius:6px;padding:3px 8px;display:inline-flex;align-items:center;gap:4px;margin-top:4px;"><span style="font-size:0.72rem;font-weight:700;color:${col};font-family:'Rajdhani',sans-serif;">Planet: ${p.planet}</span></div>
          <div style="font-size:0.82rem;color:var(--silver);margin-top:6px;line-height:1.5;">${p.desc}</div>
        </div>
      </div>
      <div style="padding:8px 14px 14px;display:flex;align-items:center;justify-content:space-between;gap:.5rem;">
        <div style="font-size:1.1rem;font-weight:700;color:var(--gold);">Rs.${p.price.toLocaleString('en-IN')}</div>
        <div style="display:flex;gap:.4rem;">
          <button onclick="toggleSave(${p.id})" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:6px 10px;cursor:pointer;font-size:.8rem;color:var(--silver);" title="Save"><i class="far fa-heart" ${savedClass}></i></button>
          <button onclick="openProductModal(${p.id})" style="background:linear-gradient(135deg,#c9a84c,#f0d060);color:#02020a;border:none;padding:7px 14px;border-radius:20px;font-family:'Rajdhani',sans-serif;font-size:0.82rem;font-weight:700;cursor:pointer;">View</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Product Modal ─────────────────────────────────────────────────────────────
window.openProductModal = function(id) {
  const p = getProds().find(x => x.id === id);
  if (!p) return;
  const content = document.getElementById('productModalContent');
  if (!content) return;

  const user = getUser();
  const img  = getImg(p);  // use imageData/imageUrl first
  const col  = PLANET_COLORS[p.planet] || '#c9a84c';
  const saved = isSaved(id);

  const saveBtn = `<button id="modalSaveBtn" onclick="toggleSave(${id})" style="flex:1;padding:.7rem;border-radius:25px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:var(--silver);font-family:'Rajdhani',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem;">
    ${saved ? '<i class="fas fa-heart" style="color:#ff6b6b;"></i> Saved' : '<i class="far fa-heart"></i> Save'}
  </button>`;

  const buyBtn = user
    ? `<button onclick="doBuy(${id})" style="flex:2;padding:.85rem;border-radius:50px;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;font-family:'Rajdhani',sans-serif;font-size:.95rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.6rem;box-shadow:0 5px 20px rgba(37,211,102,.4);">
        <i class="fab fa-whatsapp" style="font-size:1.1rem;"></i> Order on WhatsApp
      </button>`
    : `<a href="${window.location.pathname.includes('/pages/') ? 'auth.html' : 'pages/auth.html'}" style="flex:2;padding:.85rem;border-radius:50px;background:linear-gradient(135deg,#c9a84c,#f0d060);color:#02020a;font-family:'Rajdhani',sans-serif;font-size:.95rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.6rem;text-decoration:none;">
        <i class="fas fa-sign-in-alt"></i> Login to Buy
      </a>`;

  content.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1.1rem;">
      ${img ? `<img src="${img}" alt="${p.name}" style="width:100%;max-height:220px;object-fit:cover;border-radius:16px;" onerror="this.style.display='none'"/>` : `<div style="font-size:5rem;text-align:center;padding:1.5rem;background:rgba(201,168,76,.06);border-radius:16px;">${p.emoji}</div>`}
      <div>
        <span style="background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.25);color:#c9a84c;font-family:'Rajdhani',sans-serif;font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:20px;">${CAT_EMOJIS[p.category]} ${CAT_LABELS[p.category]}</span>
        <div style="font-family:'Cinzel Decorative',serif;font-size:1.25rem;color:var(--white);margin-top:.6rem;margin-bottom:.3rem;">${p.name}</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:1.35rem;font-weight:700;color:var(--gold);">Rs.${p.price.toLocaleString('en-IN')}</div>
      </div>
      <div style="background:${col}18;border:1.5px solid ${col}44;border-radius:14px;padding:.9rem 1.1rem;display:flex;align-items:center;gap:.9rem;">
        <div style="font-size:1.8rem;">🪐</div>
        <div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:${col};opacity:.7;">Ruling Planet</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:1.05rem;font-weight:700;color:${col};">${p.planet}</div>
          ${p.planetHi ? `<div style="font-size:.82rem;color:${col};opacity:.8;">${p.planetHi}</div>` : ''}
        </div>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.12);border-radius:12px;padding:.8rem 1rem;">
        <div style="font-family:'Rajdhani',sans-serif;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:.4rem;">Benefits</div>
        <div style="color:var(--white-soft);font-size:.9rem;line-height:1.7;">${p.benefits}</div>
      </div>
      <div style="color:var(--silver);font-size:.88rem;line-height:1.7;">${p.detail||p.desc}</div>
      <div style="background:rgba(37,211,102,.06);border:1px solid rgba(37,211,102,.2);border-radius:12px;padding:.75rem 1rem;display:flex;align-items:center;gap:.7rem;">
        <i class="fab fa-whatsapp" style="color:#25d366;font-size:1.3rem;"></i>
        <div>
          <div style="font-family:'Rajdhani',sans-serif;font-weight:700;color:#25d366;">+91 ${WHATSAPP}</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:.75rem;color:var(--silver);">Send payment screenshot after ordering</div>
        </div>
      </div>
      <div style="display:flex;gap:.6rem;">${saveBtn}${buyBtn}</div>
    </div>`;

  document.getElementById('productModal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
};

// ── FIX 4: WhatsApp message — clean text, no broken emojis ───────────────────
function doBuy(id) {
  const user = getUser();
  if (!user) { window.location.href = window.location.pathname.includes('/pages/') ? 'auth.html' : 'pages/auth.html'; return; }
  const p = getProds().find(x => x.id === id);
  if (!p) return;

  const catLabel = CAT_LABELS[p.category] || p.category;

  // Use only safe, common emojis that display correctly on all WhatsApp platforms
  const lines = [
    'Namaste Dr. Shastrijee! 🙏',
    '',
    'I would like to order:',
    '',
    '*' + p.name + '*',
    'Category: ' + catLabel,
    'Planet: ' + p.planet,
    'Price: Rs.' + p.price.toLocaleString('en-IN'),
    '',
    'My Details:',
    'Name: ' + user.name,
    'Mobile: ' + user.mobile,
    '',
    'Please confirm availability and payment details.',
    '',
    'Thank you! 🙏'
  ];

  const msg = encodeURIComponent(lines.join('\n'));
  window.open('https://wa.me/91' + WHATSAPP + '?text=' + msg, '_blank');
}

// Make functions global so onclick in dynamically rendered HTML works
window.doBuy = doBuy;
window.toggleSave = toggleSave;

window.filterProducts = function(cat, btn) {
  filter = cat;
  document.querySelectorAll('#categoryTabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts();
};
window.searchProducts = function() {
  search = document.getElementById('productSearch')?.value.toLowerCase() || '';
  renderProducts();
};

document.querySelectorAll('.modal-overlay').forEach(o =>
  o.addEventListener('click', e => { if (e.target===o) { o.classList.remove('open'); document.body.style.overflow=''; } })
);
document.querySelectorAll('.modal-close').forEach(btn =>
  btn.addEventListener('click', () => { btn.closest('.modal-overlay')?.classList.remove('open'); document.body.style.overflow=''; })
);

renderProducts();

}); // end DOMContentLoaded
