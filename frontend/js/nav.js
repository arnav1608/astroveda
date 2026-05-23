// ============================================
// AstroVeda – Nav Injector + Full Hindi Translation
// ============================================
(function buildNav() {
  const isRoot = !window.location.pathname.includes('/pages/');
  const base   = isRoot ? '' : '../';
  const cur    = window.location.pathname.split('/').pop() || 'index.html';

  let user = null;
  try { user = JSON.parse(localStorage.getItem('astroveda_current_user') || 'null'); } catch(e) {}
  const isMod = user && user.role === 'moderator';

  const links = [
    { href: base + 'index.html',               label: 'Home' },
    { href: base + 'pages/appointment.html',   label: 'Book Appointment' },
    { href: base + 'pages/products.html',      label: 'Products' },
    { href: base + 'pages/announcements.html', label: 'Announcements' },
    { href: base + 'pages/achievements.html',  label: 'Achievements' },
    { href: base + 'pages/profile.html',       label: 'Profile' },
    { href: base + 'pages/about.html',         label: 'About' },
    ...(isMod ? [{ href: base + 'pages/dashboard.html', label: '⚙️ Dashboard' }] : []),
  ];

  // Direct <a> tags — NO <li> wrapper — matches main.css exactly
  const linksHtml = links.map(l => {
    const isActive = l.href.endsWith(cur) || (cur === '' && l.href.endsWith('index.html'));
    return `<a href="${l.href}"${isActive ? ' class="active"' : ''}>${l.label}</a>`;
  }).join('');

  const isHindi = localStorage.getItem('astroveda_lang') === 'hi';

  // Hindi button as plain element
  const hindiHtml = `<button type="button" class="nav-hindi-btn" id="navHindiBtn">${isHindi ? '🇬🇧 English' : '🇮🇳 हिंदी'}</button>`;

  // Auth — user badge or login button
  let authHtml;
  if (user) {
    const ini   = (user.name || 'U').charAt(0).toUpperCase();
    const fname = (user.name || 'User').split(' ')[0];
    authHtml = `<div class="nav-user-badge">
      <div class="nav-avatar">${ini}</div>
      <span class="nav-user-name">${fname}</span>
      <button type="button" class="nav-logout-btn" id="navLogoutBtn">Logout</button>
    </div>`;
  } else {
    authHtml = `<a href="${base}pages/auth.html" class="nav-btn">Login / Signup</a>`;
  }

  function injectNav() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    nav.innerHTML = `
      <a class="nav-logo" href="${base}index.html">
        <span class="logo-symbol">✦</span>
        <span class="logo-text">AstroVeda</span>
      </a>
      <button type="button" class="nav-toggle" id="navToggle" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-links" id="navLinks">
        ${linksHtml}
        ${hindiHtml}
        ${authHtml}
      </div>`;

    document.getElementById('navLogoutBtn')?.addEventListener('click', () => {
      localStorage.removeItem('astroveda_current_user');
      localStorage.removeItem('astroveda_token');
      window.location.href = base + 'pages/auth.html';
    });

    const toggle   = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    toggle?.addEventListener('click', e => {
      e.stopPropagation();
      navLinks?.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) navLinks?.classList.remove('open');
    });

    document.getElementById('navHindiBtn')?.addEventListener('click', toggleHindi);
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));

    if (isHindi) applyHindi();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectNav);
  else injectNav();

  // ── Hindi dictionary ─────────────────────────────────────────────────────
  const T = {
    'Home':'होम','Book Appointment':'अपॉइंटमेंट बुक करें','Products':'उत्पाद',
    'Announcements':'घोषणाएं','Achievements':'उपलब्धियां','Profile':'प्रोफाइल',
    'About':'हमारे बारे में','Login / Signup':'लॉगिन / साइनअप','Logout':'लॉगआउट',
    'AstroVeda':'एस्ट्रोवेदा',
    'Journey Through the Cosmos. Unlock Your Destiny.':'ब्रह्मांड की यात्रा करें। अपनी नियति खोलें।',
    'Book Consultation':'परामर्श बुक करें','Meet Dr. Shastrijee':'डॉ. शास्त्रीजी से मिलें',
    'Scroll to Explore':'नीचे स्क्रॉल करें',
    'Happy Clients':'संतुष्ट ग्राहक','Years Experience':'वर्षों का अनुभव',
    'Consultations':'परामर्श','Awards Won':'पुरस्कार जीते',
    'Meet the Founder':'संस्थापक से मिलें',
    'Renowned Vedic Astrologer & Spiritual Guide':'प्रसिद्ध वैदिक ज्योतिषी और आध्यात्मिक गुरु',
    'WhatsApp Now':'अभी WhatsApp करें',
    'Education':'शिक्षा','Awards':'पुरस्कार','Expertise':'विशेषज्ञता','Global Reach':'वैश्विक पहुंच',
    'Book with Dr. Shastrijee':'डॉ. शास्त्रीजी के साथ बुक करें',
    'Our Services':'हमारी सेवाएं','Free Consultation':'निःशुल्क परामर्श',
    'Detailed Jyotish Vishleshan':'विस्तृत ज्योतिष विश्लेषण',
    'Book Now →':'अभी बुक करें →','Book Free →':'निःशुल्क बुक करें →',
    'Kundli Nirman':'कुंडली निर्माण','Marriage Compatibility':'विवाह अनुकूलता',
    'Career & Finance':'करियर और वित्त','Vastu & Remedies':'वास्तु और उपाय',
    'Your Vedic Rashi':'आपकी वैदिक राशि',
    'Testimonials':'प्रशंसापत्र','Voices of the Stars':'सितारों की आवाज़',
    'Share Your Experience':'अपना अनुभव साझा करें','Write a Review':'समीक्षा लिखें',
    'Submit':'सबमिट करें','Rating:':'रेटिंग:','Your Name':'आपका नाम',
    'City / Country':'शहर / देश','Your Experience':'आपका अनुभव',
    'Quick Links':'त्वरित लिंक','Services':'सेवाएं','Contact':'संपर्क',
    'Privacy Policy':'गोपनीयता नीति','Terms of Service':'सेवा की शर्तें',
    'Book Your Appointment':'अपॉइंटमेंट बुक करें',
    'Your Details':'आपकी जानकारी','Full Name':'पूरा नाम','Mobile Number':'मोबाइल नंबर',
    'Email (Optional)':'ईमेल (वैकल्पिक)','Service Selected':'चुनी गई सेवा',
    'Date of Birth':'जन्म तिथि','Time of Birth':'जन्म समय',
    'Birth City / Village':'जन्म शहर / गांव','Birth District':'जन्म जिला',
    'Birth State / Country':'जन्म राज्य / देश','Birth Details':'जन्म विवरण',
    'Your Question / Message':'आपका प्रश्न / संदेश',
    'Online Only (Video / WhatsApp / Phone)':'केवल ऑनलाइन (वीडियो / WhatsApp / फोन)',
    'Astrology Products':'ज्योतिष उत्पाद',
    'All':'सभी','Gemstones':'रत्न','Rudraksha':'रुद्राक्ष','Yantras':'यंत्र',
    'Spiritual Items':'आध्यात्मिक वस्तुएं','View Details':'विवरण देखें',
    'Order on WhatsApp':'WhatsApp पर ऑर्डर करें','Login to Buy':'खरीदने के लिए लॉगिन करें',
    'Ruling Planet':'शासक ग्रह','Benefits':'लाभ',
    'Newest':'नवीनतम','Most Popular':'सबसे लोकप्रिय','Featured':'विशेष',
    'Events':'कार्यक्रम','Offers':'ऑफर',
    'About AstroVeda':'एस्ट्रोवेदा के बारे में',
    'Vision & Mission':'दृष्टि और मिशन','Send Feedback':'प्रतिक्रिया भेजें',
    'Frequently Asked Questions':'अक्सर पूछे जाने वाले प्रश्न',
    'Achievements & Honours':'उपलब्धियां और सम्मान',
    'Certificates':'प्रमाणपत्र','Medals':'पदक','Photos':'फ़ोटो',
    'Welcome Back':'वापसी पर स्वागत है','Begin Your Journey':'अपनी यात्रा शुरू करें',
    'Create My Account':'मेरा खाता बनाएं','Login to AstroVeda':'एस्ट्रोवेदा में लॉगिन करें',
    'Password':'पासवर्ड','Confirm Password':'पासवर्ड की पुष्टि करें',
    'Forgot Password?':'पासवर्ड भूल गए?','Remember me':'मुझे याद रखें',
    'Mobile Number or Username':'मोबाइल नंबर या यूज़रनेम',
    'Appointment History':'अपॉइंटमेंट इतिहास','Saved Products':'सहेजे गए उत्पाद',
    'Edit Profile':'प्रोफाइल संपादित करें','Save Changes':'परिवर्तन सहेजें',
    'Personal Information':'व्यक्तिगत जानकारी','Astrology Interests':'ज्योतिष रुचियां',
  };

  function toggleHindi() {
    const active = localStorage.getItem('astroveda_lang') === 'hi';
    localStorage.setItem('astroveda_lang', active ? 'en' : 'hi');
    location.reload();
  }
  window.toggleHindi = toggleHindi;

  function applyHindi() {
    const btn = document.getElementById('navHindiBtn');
    if (btn) btn.textContent = '🇬🇧 English';
    translateNode(document.body);
    document.querySelectorAll('[placeholder]').forEach(el => {
      const orig = el.getAttribute('data-orig-ph') || el.placeholder;
      el.setAttribute('data-orig-ph', orig);
      el.placeholder = T[orig] || orig;
    });
  }

  function translateNode(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text.length > 1 && T[text]) {
        node.textContent = node.textContent.replace(text, T[text]);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const skip = ['SCRIPT','STYLE','CANVAS','INPUT','TEXTAREA','SELECT','CODE','PRE','NOSCRIPT'];
      if (!skip.includes(node.tagName)) {
        Array.from(node.childNodes).forEach(c => translateNode(c));
      }
    }
  }
})();
