// Patch script — add to head of all pages that still have old inline nav
// This is auto-included by nav.js which replaces the nav element content

// about.js feedback fix — also expose submitFeedback globally for onclick
window.addEventListener('DOMContentLoaded', () => {
  // Load FAQs from localStorage (moderator can edit via dashboard), fallback to defaults
  function getFaqs() {
    try {
      const stored = JSON.parse(localStorage.getItem('astroveda_faqs')||'null');
      if (stored && stored.length) return stored;
    } catch(e) {}
    return [
      { q:'What is Vedic astrology?', a:'Vedic astrology (Jyotish) is the ancient Indian system based on the sidereal zodiac. It uses the actual positions of stars and planets at your birth to create a Kundali for precise life predictions.' },
      { q:'How accurate are the predictions?', a:'When exact birth date, time and place are provided, predictions can be remarkably precise. Dr. Shastrijee has a verified accuracy rate of over 90% across thousands of consultations over 25+ years.' },
      { q:'Can I consult online from outside India?', a:'Absolutely. Dr. Shastrijee offers consultations via video call, WhatsApp, and phone to clients in 40+ countries across all time zones.' },
      { q:'How do I book a consultation?', a:'Visit the Book Appointment page, select your service, fill in your birth details accurately, and submit. For paid services, complete the payment and send the screenshot on WhatsApp.' },
      { q:'Are the products authentic?', a:'Yes. All gemstones and Rudraksha are lab-certified. Yantras are crafted from authentic metals and personally energized by Dr. Shastrijee with the appropriate mantras and rituals.' },
      { q:'What information is needed for a birth chart?', a:'Your exact date of birth, birth time (as precise as possible — even minutes matter), and exact place of birth. The birth time is crucial — even a 2-minute difference can change planetary positions.' },
      { q:'What remedies are prescribed?', a:'Gemstones, Rudraksha, Yantras, mantra chanting, Vastu corrections, charity (dana), fasting. All remedies are personalized, practical, and completely safe.' },
    ];
  }

  // Apply page content from dashboard
  const pc = (() => { try { return JSON.parse(localStorage.getItem('astroveda_page_content')||'{}'); } catch(e) { return {}; } })();
  if (pc.aboutIntro) {
    const introEls = document.querySelectorAll('.about-text-col p');
    if (introEls[0]) introEls[0].textContent = pc.aboutIntro;
  }
  if (pc.mission) {
    const missionCard = document.querySelector('.vm-card:nth-child(2) p');
    if (missionCard) missionCard.textContent = pc.mission;
  }
  if (pc.vision) {
    const visionCard = document.querySelector('.vm-card:nth-child(1) p');
    if (visionCard) visionCard.textContent = pc.vision;
  }
  if (pc.philosophy) {
    const philCard = document.querySelector('.vm-card:nth-child(3) p');
    if (philCard) philCard.textContent = pc.philosophy;
  }

  const faqs = getFaqs();

  const faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.innerHTML = faqs.map((f,i) => `
      <div class="faq-item reveal" id="faq-${i}">
        <div class="faq-question" data-idx="${i}">
          <span>${f.q}</span><i class="fas fa-chevron-down"></i>
        </div>
        <div class="faq-answer"><p>${f.a}</p></div>
      </div>`).join('');

    faqList.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = document.getElementById(`faq-${q.dataset.idx}`);
        const open = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
        if (!open) item.classList.add('open');
      });
    });
    setTimeout(() => faqList.querySelectorAll('.faq-item.reveal').forEach(el => el.classList.add('visible')), 100);
  }
});

// Global function for onclick in about.html
window.submitFeedback = function() {
  const name = (document.getElementById('fbName')?.value||'').trim();
  const message  = (document.getElementById('fbMsg')?.value||'').trim();
  if (!name || !message) { showToast('Incomplete','Please fill in name and message.','⚠️'); return; }

  // Save to MongoDB via API
  fetch('http://localhost:5000/api/feedback', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({name, message})
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      document.getElementById('fbName').value = '';
      document.getElementById('fbMsg').value  = '';
      showToast('Feedback Sent! 🙏','Thank you! Dr. Shastrijee will read your message.','✅');
    } else {
      showToast('Error',data.message||'Could not send feedback.','⚠️');
    }
  })
  .catch(() => {
    // Fallback: save locally
    const feedbacks = JSON.parse(localStorage.getItem('astroveda_feedbacks')||'[]');
    feedbacks.push({ name, msg: message, time: new Date().toISOString() });
    localStorage.setItem('astroveda_feedbacks', JSON.stringify(feedbacks));
    document.getElementById('fbName').value = '';
    document.getElementById('fbMsg').value  = '';
    showToast('Feedback Sent! 🙏','Thank you! Dr. Shastrijee will read your message.','✅');
  });
};
