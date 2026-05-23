// ============================================
// AstroVeda – Cosmic Canvas & Particle Engine
// ============================================

const canvas = document.getElementById('cosmicCanvas');
const ctx = canvas.getContext('2d');
let W, H, stars = [], nebulae = [], floatingZodiacs = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => { resize(); initStars(); });
resize();

// Stars
function initStars() {
  stars = [];
  for (let i = 0; i < 300; i++) {
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.0005 + 0.0002,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.9 ? '#c9a84c' : Math.random() > 0.8 ? '#c77dff' : '#ffffff'
    });
  }
  nebulae = [];
  for (let i = 0; i < 4; i++) {
    nebulae.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 300 + 150,
      color: Math.random() > 0.5 ? 'rgba(74,29,150,' : 'rgba(61,90,241,',
      phase: Math.random() * Math.PI * 2
    });
  }
}
initStars();

// Floating Zodiac symbols
const zodiacSymbols = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
function initZodiacs() {
  floatingZodiacs = [];
  for (let i = 0; i < 8; i++) {
    floatingZodiacs.push({
      x: Math.random() * W, y: Math.random() * H,
      symbol: zodiacSymbols[Math.floor(Math.random() * 12)],
      opacity: Math.random() * 0.08 + 0.02,
      size: Math.random() * 30 + 20,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2
    });
  }
}
initZodiacs();

let animFrame;
function draw(ts) {
  ctx.clearRect(0, 0, W, H);

  // Nebulae
  nebulae.forEach(n => {
    const opacity = 0.04 + 0.02 * Math.sin(ts * 0.0005 + n.phase);
    const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
    grad.addColorStop(0, n.color + opacity + ')');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Stars
  stars.forEach(s => {
    const tw = ts * s.speed;
    const op = s.opacity * (0.5 + 0.5 * Math.sin(tw + s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.color.replace(')', `,${op})`).replace('rgb', 'rgba');
    if (s.color === '#ffffff') ctx.fillStyle = `rgba(255,255,255,${op})`;
    else if (s.color === '#c9a84c') ctx.fillStyle = `rgba(201,168,76,${op})`;
    else ctx.fillStyle = `rgba(199,125,255,${op})`;
    ctx.fill();
    // Glow for bright stars
    if (s.r > 1.2) {
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      grd.addColorStop(0, `rgba(255,255,255,${op * 0.3})`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Floating Zodiacs
  floatingZodiacs.forEach(z => {
    z.x += z.speedX;
    z.y += z.speedY;
    if (z.x < -50) z.x = W + 50;
    if (z.x > W + 50) z.x = -50;
    if (z.y < -50) z.y = H + 50;
    if (z.y > H + 50) z.y = -50;
    const op = z.opacity * (0.6 + 0.4 * Math.sin(ts * 0.001 + z.phase));
    ctx.save();
    ctx.globalAlpha = op;
    ctx.font = `${z.size}px serif`;
    ctx.fillStyle = '#c9a84c';
    ctx.fillText(z.symbol, z.x, z.y);
    ctx.restore();
  });

  animFrame = requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// Shooting Stars
function createShootingStar() {
  const container = document.getElementById('shootingStars');
  if (!container) return;
  const star = document.createElement('div');
  star.className = 'shooting-star';
  star.style.cssText = `
    top: ${Math.random() * 50}%;
    left: ${Math.random() * 100}%;
    animation-duration: ${Math.random() * 1.5 + 0.5}s;
    animation-delay: ${Math.random() * 2}s;
  `;
  container.appendChild(star);
  star.addEventListener('animationend', () => star.remove());
}
setInterval(createShootingStar, 2500);

// Hero Particles
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(201,168,76,${Math.random() * 0.6 + 0.1});
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 15 + 10}s ${Math.random() * 10}s linear infinite;
      box-shadow: 0 0 ${size * 3}px rgba(201,168,76,0.4);
    `;
    container.appendChild(p);
  }
}
initHeroParticles();

// Footer Stars
function initFooterStars() {
  const container = document.getElementById('footerStars');
  if (!container) return;
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    const size = Math.random() * 2 + 0.5;
    s.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(255,255,255,${Math.random() * 0.6 + 0.2});
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: blinkStar ${Math.random() * 4 + 2}s ${Math.random() * 4}s ease-in-out infinite;
    `;
    container.appendChild(s);
  }
}
initFooterStars();
