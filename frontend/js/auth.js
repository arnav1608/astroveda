// ============================================
// AstroVeda – Auth JS (Bulletproof Final Version)
// ============================================

// Run immediately — no DOMContentLoaded wrapper needed
// because this script is at bottom of body

// ── Utility ──────────────────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function v(id) { return ($( id)?.value || '').trim(); }

function setErr(inputId, errId, msg) {
  const inp = $(inputId), err = $(errId);
  if (inp) inp.classList.add('invalid');
  if (err) { if (msg) err.textContent = msg; err.classList.add('show'); }
}
function clearAllErr() {
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('invalid'));
  document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
}

// ── Username generator ────────────────────────────────────────────────────────
function makeUsername(name) {
  const base = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') || 'user';
  return base + Math.floor(1000 + Math.random() * 9000);
}

// ── Tab switch ────────────────────────────────────────────────────────────────
function switchTab(tab) {
  const lf = $('loginForm'), sf = $('signupForm');
  const lt = $('loginToggle'), st = $('signupToggle');
  const sl = $('authSlider');
  clearAllErr();
  if (tab === 'login') {
    lf && lf.classList.remove('hidden');
    sf && sf.classList.add('hidden');
    lt && lt.classList.add('active');
    st && st.classList.remove('active');
    sl && sl.classList.remove('right');
  } else {
    sf && sf.classList.remove('hidden');
    lf && lf.classList.add('hidden');
    st && st.classList.add('active');
    lt && lt.classList.remove('active');
    sl && sl.classList.add('right');
  }
}
// Expose globally for onclick=""
window.switchTab = switchTab;

// ── Password toggle ───────────────────────────────────────────────────────────
function bindPwToggle(btnId, inputId) {
  const btn = $(btnId);
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    e.preventDefault(); e.stopPropagation();
    const inp = $(inputId);
    if (!inp) return;
    const isHidden = inp.type === 'password';
    inp.type = isHidden ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
  });
}

// ── Username preview ──────────────────────────────────────────────────────────
const nameInp = $('signupName');
if (nameInp) {
  nameInp.addEventListener('input', function() {
    const pv = $('usernamePreview'), pvv = $('usernamePreviewVal');
    if (this.value.trim().length >= 2 && pv && pvv) {
      pvv.textContent = makeUsername(this.value);
      pv.style.display = 'flex';
    } else if (pv) {
      pv.style.display = 'none';
    }
  });
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function doLogin() {
  clearAllErr();
  const identifier = v('loginIdentifier');
  const password   = $('loginPassword')?.value || '';
  let ok = true;

  if (!identifier) { setErr('loginIdentifier','loginIdentifierErr','Enter your mobile number or username.'); ok=false; }
  if (!password)   { setErr('loginPassword','loginPasswordErr','Enter your password.'); ok=false; }
  if (!ok) return;

  let users = [];
  try { users = JSON.parse(localStorage.getItem('astroveda_users') || '[]'); } catch(e) { users = []; }

  const user = users.find(u => u.mobile === identifier || u.username === identifier);
  if (!user) { setErr('loginIdentifier','loginIdentifierErr','No account found. Please sign up first.'); return; }
  if (user.password !== password) { setErr('loginPassword','loginPasswordErr','Wrong password. Please try again.'); return; }
  if (user.suspended) { setErr('loginIdentifier','loginIdentifierErr','Account suspended. Contact support.'); return; }

  localStorage.setItem('astroveda_current_user', JSON.stringify(user));
  showSuccess('Welcome Back! 🌟', 'Great to see you again, ' + user.name.split(' ')[0] + '!', false, '');
}

// ── SIGNUP ────────────────────────────────────────────────────────────────────
function doSignup() {
  clearAllErr();
  const name     = v('signupName');
  const mobile   = v('signupMobile');
  const password = $('signupPassword')?.value || '';
  const confirm  = $('signupConfirm')?.value  || '';
  let ok = true;

  if (name.length < 2)           { setErr('signupName','signupNameErr','Enter your full name (at least 2 chars).'); ok=false; }
  if (!/^\d{10}$/.test(mobile))  { setErr('signupMobile','signupMobileErr','Enter a valid 10-digit mobile number.'); ok=false; }
  if (password.length < 6)       { setErr('signupPassword','signupPasswordErr','Password must be at least 6 characters.'); ok=false; }
  if (password !== confirm)      { setErr('signupConfirm','signupConfirmErr','Passwords do not match.'); ok=false; }
  if (!ok) return;

  let users = [];
  try { users = JSON.parse(localStorage.getItem('astroveda_users') || '[]'); } catch(e) { users = []; }

  if (users.find(u => u.mobile === mobile)) {
    setErr('signupMobile','signupMobileErr','This mobile number is already registered. Please login.');
    return;
  }

  // Generate unique username
  let username = makeUsername(name);
  let attempts = 0;
  while (users.find(u => u.username === username) && attempts < 20) {
    username = makeUsername(name);
    attempts++;
  }

  const newUser = {
    id:        Date.now(),
    name:      name,
    mobile:    mobile,
    username:  username,
    password:  password,
    role:      'user',
    joined:    new Date().toISOString(),
    bio:       '',
    location:  '',
    age:       '',
    interests: [],
    avatar:    '',
    suspended: false
  };

  users.push(newUser);
  localStorage.setItem('astroveda_users', JSON.stringify(users));
  localStorage.setItem('astroveda_current_user', JSON.stringify(newUser));
  showSuccess('Account Created! ✨', 'Welcome to AstroVeda, ' + name.split(' ')[0] + '!', true, username);
}

// ── Show success screen ───────────────────────────────────────────────────────
function showSuccess(title, msg, showUname, username) {
  $('loginForm')     && $('loginForm').classList.add('hidden');
  $('signupForm')    && $('signupForm').classList.add('hidden');
  $('authToggleWrap')&& $('authToggleWrap').classList.add('hidden');

  const s = $('authSuccess');
  if (s) s.classList.remove('hidden');

  const t = $('successTitle'), m = $('successMsg');
  if (t) t.textContent = title;
  if (m) m.textContent = msg;

  const uBox = $('successUsernameBox'), uVal = $('successUsername');
  if (showUname && uBox && uVal) {
    uBox.classList.remove('hidden');
    uVal.textContent = username;
  }
}

// ── Bind all buttons ──────────────────────────────────────────────────────────
// Use both addEventListener AND expose globally as onclick fallback
$('loginBtn') ?.addEventListener('click', doLogin);
$('signupBtn')?.addEventListener('click', doSignup);
window.doLogin  = doLogin;
window.doSignup = doSignup;

// Enter key support
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  const lf = $('loginForm'), sf = $('signupForm');
  if (lf && !lf.classList.contains('hidden'))  doLogin();
  else if (sf && !sf.classList.contains('hidden')) doSignup();
});

// Bind pw toggles (after DOM is fully parsed since script is at bottom)
bindPwToggle('toggleLoginPw',  'loginPassword');
bindPwToggle('toggleSignupPw', 'signupPassword');
bindPwToggle('toggleConfirmPw','signupConfirm');

// ── Zodiac Wheel on auth page ─────────────────────────────────────────────────
const authCanvas = $('authZodiacWheel');
if (authCanvas) {
  const ctx = authCanvas.getContext('2d');
  const rashiNames = ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
  let rot = 0;
  (function draw() {
    const W=authCanvas.width, H=authCanvas.height, cx=W/2, cy=H/2;
    const outerR=cx-8, textR=cx-28;
    ctx.clearRect(0,0,W,H);
    for (let i=0; i<12; i++) {
      const s=(i*30-90+rot)*Math.PI/180, e=((i+1)*30-90+rot)*Math.PI/180, m=(s+e)/2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,outerR,s,e); ctx.closePath();
      ctx.fillStyle='rgba(201,168,76,0.06)'; ctx.fill();
      ctx.strokeStyle='rgba(201,168,76,0.2)'; ctx.lineWidth=1; ctx.stroke();
      ctx.save(); ctx.translate(cx+textR*Math.cos(m), cy+textR*Math.sin(m));
      ctx.font='10px sans-serif'; ctx.fillStyle='rgba(201,168,76,0.7)';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(rashiNames[i], 0, 0);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(cx,cy,outerR,0,Math.PI*2);
    ctx.strokeStyle='rgba(201,168,76,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,36,0,Math.PI*2);
    ctx.fillStyle='rgba(2,2,10,0.88)'; ctx.fill();
    ctx.font='bold 22px serif'; ctx.fillStyle='#c9a84c';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor='rgba(201,168,76,0.8)'; ctx.shadowBlur=12;
    ctx.fillText('ॐ',cx,cy); ctx.shadowBlur=0;
    rot+=0.1; requestAnimationFrame(draw);
  })();
}
