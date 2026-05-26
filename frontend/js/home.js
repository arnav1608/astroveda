// ============================================
// AstroVeda – Home JS (Fixed + Complete)
// ============================================
window.addEventListener('DOMContentLoaded', () => {

const API = window.ASTROVEDA_API || (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api');
function getToken() { return localStorage.getItem('astroveda_token') || ''; }

// ── FIX 1: Service cards "Book Now" → redirects to appointment page ──────────
document.querySelectorAll('.service-card .service-link').forEach(link => {
  link.style.cursor = 'pointer';
  if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
    link.setAttribute('href', 'pages/appointment.html');
  }
});
// Also make entire service card clickable
document.querySelectorAll('.service-card').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', function(e) {
    if (!e.target.closest('a')) {
      window.location.href = 'pages/appointment.html';
    }
  });
});

// ── Default Approved Reviews ──────────────────────────────────────────────────
const DEFAULT_REVIEWS = [
  { id:'d1', name:'Priya Sharma',   location:'Mumbai, India',    rating:5, status:'approved', text:'Dr. Shastrijee\'s reading completely changed the direction of my life. His prediction about my career shift was 100% accurate — I am now running a successful business, exactly as he foresaw two years ago. The gemstone remedy brought remarkable results within weeks. I recommend him to everyone seeking real cosmic guidance.' },
  { id:'d2', name:'Sanjay Mehta',   location:'London, UK',       rating:5, status:'approved', text:'I consulted Dr. Shastrijee from London during one of the most difficult phases of my life. His guidance was extraordinary — calm, precise, and deeply accurate. He predicted the resolution of my legal case to the exact month. AstroVeda is a true blessing for anyone seeking clarity.' },
  { id:'d3', name:'Ananya Patel',   location:'Bangalore, India', rating:5, status:'approved', text:'Best astrologer I have ever consulted. He predicted my marriage timing to the exact month. The Kundli he prepared is incredibly detailed. My entire family now consults Dr. Shastrijee for every major life decision.' },
  { id:'d4', name:'Ravi Kumar',     location:'Delhi, India',     rating:4, status:'approved', text:'Very knowledgeable and accurate. The health remedy prescribed based on my birth chart helped resolve a chronic issue that doctors couldn\'t explain. I was skeptical about astrology before — Dr. Shastrijee converted me with pure accuracy and logic. Highly recommended.' },
];

function getReviews() {
  try {
    const stored = JSON.parse(localStorage.getItem('astroveda_testimonials') || 'null');
    if (!stored) { localStorage.setItem('astroveda_testimonials', JSON.stringify(DEFAULT_REVIEWS)); return DEFAULT_REVIEWS; }
    DEFAULT_REVIEWS.forEach(d => { if (!stored.find(s => s.id === d.id)) stored.unshift(d); });
    localStorage.setItem('astroveda_testimonials', JSON.stringify(stored));
    return stored;
  } catch(e) { return DEFAULT_REVIEWS; }
}

// ── Testimonials Carousel ─────────────────────────────────────────────────────
let slide = 0, autoTimer = null;

function buildCarousel(reviews) {
  const approved = (reviews || getReviews()).filter(r => r.status === 'approved');
  const box  = document.getElementById('testimonialsCarousel');
  const dots = document.getElementById('carouselDots');
  if (!box || !approved.length) return;
  box.innerHTML = approved.map((r,i) => `
    <div class="testimonial-card${i===0?' active':''}">
      <div class="testimonial-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <p class="testimonial-text">"${r.text}"</p>
      <div class="testimonial-author">
        <div class="author-avatar">${r.name.charAt(0)}</div>
        <div><strong>${r.name}</strong><span>${r.location}</span></div>
      </div>
    </div>`).join('');
  if (dots) {
    dots.innerHTML = approved.map((_,i) => `<div class="dot${i===0?' active':''}" data-i="${i}"></div>`).join('');
    dots.querySelectorAll('.dot').forEach(d => d.addEventListener('click', () => goSlide(+d.dataset.i)));
  }
  document.getElementById('prevBtn')?.addEventListener('click', () => goSlide(slide-1));
  document.getElementById('nextBtn')?.addEventListener('click', () => goSlide(slide+1));
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(() => goSlide(slide+1), 5500);
}

function goSlide(n) {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.dot');
  if (!cards.length) return;
  cards[slide]?.classList.remove('active'); dots[slide]?.classList.remove('active');
  slide = ((n % cards.length) + cards.length) % cards.length;
  cards[slide]?.classList.add('active'); dots[slide]?.classList.add('active');
}

// Load from API, fallback to localStorage defaults
fetch(API + '/testimonials')
  .then(r => r.json())
  .then(data => {
    if (data.success && data.testimonials && data.testimonials.length) {
      const apiRevs = data.testimonials.map(t => ({
        id: t._id, name: t.name, location: t.location,
        rating: t.rating, text: t.text, status: 'approved'
      }));
      // Also update localStorage so dashboard can see them
      const all = getReviews();
      apiRevs.forEach(r => { if (!all.find(x => x.id === r.id)) all.push(r); });
      localStorage.setItem('astroveda_testimonials', JSON.stringify(all));
      buildCarousel([...DEFAULT_REVIEWS, ...apiRevs]);
    } else { buildCarousel(); }
  })
  .catch(() => buildCarousel());

// ── FIX 2: Review Form — "Submit" button text, remove approval note ───────────
const currentUser = (() => { try { return JSON.parse(localStorage.getItem('astroveda_current_user')||'null'); } catch(e){ return null; } })();
const loginNotice = document.getElementById('reviewLoginNotice');
const formFields  = document.getElementById('reviewFormFields');
const reviewNameEl= document.getElementById('reviewName');

if (!currentUser) {
  if (loginNotice) loginNotice.style.display = 'flex';
  if (formFields)  formFields.style.display  = 'none';
} else {
  if (loginNotice) loginNotice.style.display = 'none';
  if (formFields)  formFields.style.display  = 'block';
  if (reviewNameEl) reviewNameEl.value = currentUser.name || '';
}

let selectedRating = 0;
const starLabels = ['','⭐ Poor','⭐⭐ Fair','⭐⭐⭐ Good','⭐⭐⭐⭐ Great','⭐⭐⭐⭐⭐ Excellent!'];
function paintStars(n) {
  document.querySelectorAll('.star-inp').forEach((s,i) => s.classList.toggle('lit', i < n));
  const lbl = document.getElementById('starLabel');
  if (lbl) lbl.textContent = starLabels[n] || '';
}
document.querySelectorAll('.star-inp').forEach(s => {
  s.addEventListener('mouseenter', () => paintStars(+s.dataset.val));
  s.addEventListener('mouseleave', () => paintStars(selectedRating));
  s.addEventListener('click', () => { selectedRating = +s.dataset.val; paintStars(selectedRating); });
});

// FIX 10: Review saves to localStorage pending list so moderator can see it
document.getElementById('submitReviewBtn')?.addEventListener('click', () => {
  if (!currentUser) { window.location.href = 'pages/auth.html'; return; }
  if (!selectedRating) { showToast('Rating Required','Please select a star rating.','⭐'); return; }
  const text = (document.getElementById('reviewText')?.value || '').trim();
  if (text.length < 20) { showToast('Too Short','Please write at least 20 characters.','✏️'); return; }
  const loc = (document.getElementById('reviewLocation')?.value || '').trim() || 'India';

  const btn = document.getElementById('submitReviewBtn');
  if (btn) { btn.disabled=true; btn.querySelector('span').textContent='Submitting...'; }

  const newReview = {
    id: 'r_'+Date.now(),
    name: currentUser.name,
    location: loc,
    rating: selectedRating,
    text,
    status: 'pending',       // ← always pending until mod approves
    submitted: new Date().toISOString()
  };

  // ALWAYS save to localStorage so moderator pending list works (FIX 10)
  const all = JSON.parse(localStorage.getItem('astroveda_testimonials') || '[]');
  all.push(newReview);
  localStorage.setItem('astroveda_testimonials', JSON.stringify(all));

  // Also try to send to API
  fetch(API + '/testimonials', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+getToken() },
    body: JSON.stringify({ location: loc, rating: selectedRating, text })
  }).catch(() => {}); // silently fail — already saved locally

  if (btn) { btn.disabled=false; btn.querySelector('span').textContent='Submit'; }

  // Reset form
  document.getElementById('reviewText').value = '';
  document.getElementById('reviewLocation').value = '';
  selectedRating = 0; paintStars(0);

  // FIX 2: Toast says "Review Submitted" not "sent for review"
  showToast('Review Submitted!', 'Thank you for sharing your experience.', '✅');
});

// ── Zodiac Wheel ──────────────────────────────────────────────────────────────
const RASHIS = [
  { name:'Mesh',      hindi:'मेष',      animal:'🐏', color:'#ff6b6b' },
  { name:'Vrishabh',  hindi:'वृषभ',     animal:'🐂', color:'#ff9f43' },
  { name:'Mithun',    hindi:'मिथुन',    animal:'👫', color:'#feca57' },
  { name:'Kark',      hindi:'कर्क',     animal:'🦀', color:'#48dbfb' },
  { name:'Simha',     hindi:'सिंह',     animal:'🦁', color:'#ff9ff3' },
  { name:'Kanya',     hindi:'कन्या',    animal:'👧', color:'#54a0ff' },
  { name:'Tula',      hindi:'तुला',     animal:'⚖️', color:'#c8d6e5' },
  { name:'Vrishchik', hindi:'वृश्चिक',  animal:'🦂', color:'#ee5a24' },
  { name:'Dhanu',     hindi:'धनु',      animal:'🏹', color:'#8395a7' },
  { name:'Makar',     hindi:'मकर',      animal:'🐊', color:'#576574' },
  { name:'Kumbh',     hindi:'कुंभ',     animal:'🏺', color:'#00d2d3' },
  { name:'Meen',      hindi:'मीन',      animal:'🐟', color:'#5f27cd' },
];

const zCanvas = document.getElementById('zodiacWheel');
if (zCanvas) {
  const zCtx = zCanvas.getContext('2d');
  let zRot = 0;
  function drawZodiac() {
    const W=zCanvas.width,H=zCanvas.height,cx=W/2,cy=H/2;
    const outerR=cx-8,animalR=cx-32,hindiR=cx-58,nameR=cx-80,innerR=70;
    zCtx.clearRect(0,0,W,H);
    for(let i=0;i<12;i++){
      const s=(i*30-90+zRot)*Math.PI/180,e=((i+1)*30-90+zRot)*Math.PI/180,m=(s+e)/2;
      zCtx.beginPath();zCtx.moveTo(cx,cy);zCtx.arc(cx,cy,outerR,s,e);zCtx.closePath();
      zCtx.fillStyle=RASHIS[i].color+'22';zCtx.fill();
      zCtx.strokeStyle='rgba(201,168,76,0.22)';zCtx.lineWidth=1;zCtx.stroke();
      zCtx.font='13px serif';zCtx.textAlign='center';zCtx.textBaseline='middle';
      zCtx.fillStyle='rgba(255,255,255,0.9)';
      zCtx.fillText(RASHIS[i].animal,cx+animalR*Math.cos(m),cy+animalR*Math.sin(m));
      zCtx.font='bold 9px sans-serif';zCtx.fillStyle='#c9a84c';
      zCtx.fillText(RASHIS[i].hindi,cx+hindiR*Math.cos(m),cy+hindiR*Math.sin(m));
      zCtx.font='8px sans-serif';zCtx.fillStyle='rgba(200,190,230,0.7)';
      zCtx.fillText(RASHIS[i].name,cx+nameR*Math.cos(m),cy+nameR*Math.sin(m));
    }
    zCtx.beginPath();zCtx.arc(cx,cy,outerR,0,Math.PI*2);zCtx.strokeStyle='rgba(201,168,76,0.5)';zCtx.lineWidth=2;zCtx.stroke();
    for(let i=0;i<12;i++){const a=(i*30-90+zRot)*Math.PI/180;zCtx.beginPath();zCtx.moveTo(cx+innerR*Math.cos(a),cy+innerR*Math.sin(a));zCtx.lineTo(cx+outerR*Math.cos(a),cy+outerR*Math.sin(a));zCtx.strokeStyle='rgba(201,168,76,0.15)';zCtx.lineWidth=1;zCtx.stroke();}
    zCtx.beginPath();zCtx.arc(cx,cy,innerR,0,Math.PI*2);zCtx.fillStyle='rgba(2,2,10,0.9)';zCtx.fill();zCtx.strokeStyle='rgba(201,168,76,0.35)';zCtx.lineWidth=1.5;zCtx.stroke();
    zCtx.font='bold 38px serif';zCtx.fillStyle='#c9a84c';zCtx.textAlign='center';zCtx.textBaseline='middle';
    zCtx.shadowColor='rgba(201,168,76,0.9)';zCtx.shadowBlur=20;zCtx.fillText('ॐ',cx,cy-6);zCtx.shadowBlur=0;
    zCtx.font='10px sans-serif';zCtx.fillStyle='rgba(168,164,200,0.7)';zCtx.fillText('राशि चक्र',cx,cy+14);
    zRot+=0.03;requestAnimationFrame(drawZodiac);
  }
  drawZodiac();
}

// Zodiac grid
const grid = document.getElementById('zodiacSignsGrid');
if (grid) {
  grid.innerHTML = RASHIS.map((r,i) => `
    <div class="zodiac-sign-card" data-sign="${r.name}" data-id="${i}">
      <span class="sign-animal">${r.animal}</span>
      <span class="sign-name">${r.name}</span>
      <span class="sign-hindi">${r.hindi}</span>
    </div>`).join('');
  grid.querySelectorAll('.zodiac-sign-card').forEach(card => {
    card.addEventListener('click', () => openRashiModal(card.dataset.sign));
  });
}

// ── Rashi guidance ────────────────────────────────────────────────────────────
// FIX 2: Dynamic month/year — always uses current system date, never hardcoded
const CURRENT_MONTH = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

const defaultRashi = {
  month: CURRENT_MONTH,
  signs: {
    Mesh:      {career:'Shani\'s discipline brings job promotions and government exam success this month.',love:'Mangal ignites passion — but control temper in close relationships.',health:'Beware of headaches and fatigue. Rest well.',remedy:'Chant "Om Mangalaya Namah" daily. Wear red coral on Tuesday.'},
    Vrishabh:  {career:'Venus blesses finances — new income sources and business deals succeed.',love:'Romantic month. Spouse will be very supportive and loving.',health:'Throat and neck need care. Avoid cold drinks.',remedy:'Worship Goddess Lakshmi on Fridays. Wear white on Friday.'},
    Mithun:    {career:'Mercury is powerful — communication, writing and business shine brilliantly.',love:'Misunderstandings possible. Speak clearly and listen patiently.',health:'Respiratory system needs attention. Practice pranayama daily.',remedy:'Chant "Om Budhaya Namah." Donate green items on Wednesday.'},
    Kark:      {career:'Moon\'s strength brings clarity. Government sector and hospitality favored.',love:'Family harmony improves greatly. Auspicious for family functions.',health:'Stomach issues possible. Eat light and stay hydrated.',remedy:'Worship Lord Shiva on Mondays. Wear a silver ring.'},
    Simha:     {career:'Sun gives authority and recognition. Leadership roles are richly rewarded.',love:'Confidence attracts love. Singles may meet someone very special.',health:'Heart and spine need care. Avoid excessive heat.',remedy:'Chant "Om Suryaya Namah" at sunrise. Donate wheat on Sundays.'},
    Kanya:     {career:'Detail-oriented work brings recognition. Research and accounts excel.',love:'Stability in relationships. Long-term commitments are favored.',health:'Digestive system needs attention. Eat on time.',remedy:'Worship Lord Vishnu on Thursdays. Wear emerald if Budh is strong.'},
    Tula:      {career:'Venus blesses creativity. Partnerships and collaborations succeed.',love:'Romantic proposals and relationship deepening are strongly favored.',health:'Kidney and lower back — stay hydrated and stretch daily.',remedy:'Worship Goddess Durga on Fridays. Donate sugar on Fridays.'},
    Vrishchik: {career:'Mars gives intense focus. Surgery, research, and investigations succeed.',love:'Deep emotional bonds strengthen. Avoid jealousy and secrecy.',health:'Reproductive system — maintain hygiene carefully.',remedy:'Chant Hanuman Chalisa on Tuesdays. Wear red coral if advised.'},
    Dhanu:     {career:'Jupiter expands opportunities. Long distance travel and higher education favored.',love:'Optimism attracts love. Social life very active this month.',health:'Hips and thighs need care. Walk 30 minutes daily.',remedy:'Worship Lord Vishnu on Thursdays. Wear yellow sapphire if advised.'},
    Makar:     {career:'Saturn rewards hard work. Delayed projects finally move forward.',love:'Patience is key. Stability and commitment are this month\'s themes.',health:'Knees and joints — avoid cold and damp environments.',remedy:'Chant "Om Shanishcharaya Namah" on Saturdays. Donate black sesame.'},
    Kumbh:     {career:'Innovative ideas and technology work are favored. Networking brings results.',love:'Authentic connections deepen. Be open and express yourself freely.',health:'Ankle and circulation — avoid prolonged sitting.',remedy:'Worship Shani on Saturdays. Donate mustard oil on Saturday.'},
    Meen:      {career:'Spirituality, arts, and healing professions receive divine blessings.',love:'Spiritual connection deepens bonds. Compassion heals old wounds.',health:'Feet and immune system — rest well and avoid alcohol.',remedy:'Worship Lord Shiva, chant "Om Namah Shivaya." Light a lamp daily.'},
  }
};

const rashiData = (() => {
  try { const s=localStorage.getItem('astroveda_rashi_guidance'); return s?JSON.parse(s):defaultRashi; }
  catch(e){ return defaultRashi; }
})();

function openRashiModal(sign) {
  const r = RASHIS.find(x=>x.name===sign);
  const d = rashiData.signs?.[sign] || defaultRashi.signs[sign];
  if (!r || !d) return;
  const content = document.getElementById('rashiModalContent');
  if (!content) return;
  content.innerHTML = `
    <div class="rashi-modal-header">
      <div class="rashi-modal-icon">${r.animal}</div>
      <div>
        <div class="rashi-modal-name">${r.name} Rashi</div>
        <div class="rashi-modal-hindi">${r.hindi} · ${CURRENT_MONTH}</div>
      </div>
    </div>
    <div class="rashi-modal-content">
      <h4>💼 Career &amp; Finance</h4><p>${d.career}</p>
      <h4>💑 Love &amp; Relationships</h4><p>${d.love}</p>
      <h4>🏥 Health</h4><p>${d.health}</p>
      <h4>🧿 Remedy by Dr. Shastrijee</h4><p>${d.remedy}</p>
    </div>
    <div class="rashi-modal-footer">✦ Written by Dr. Rajesh R Shastrijee</div>
    <a href="pages/appointment.html" class="btn-primary" style="display:flex;justify-content:center;margin-top:1.5rem;width:100%;">
      <span>Book Personal Consultation</span><i class="fas fa-arrow-right"></i>
    </a>`;
  openModal('rashiModal');
}

document.querySelectorAll('.zodiac-sign-card').forEach(card => {
  card.addEventListener('click', () => openRashiModal(card.dataset.sign));
});
document.getElementById('rashiModalClose')?.addEventListener('click', () => closeModal('rashiModal'));

}); // end DOMContentLoaded
