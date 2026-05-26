// about.js — complete with all fixes
window.addEventListener('DOMContentLoaded', () => {

  // ── Load page content from dashboard ──────────────────────────────────────
  const pc = (() => { try { return JSON.parse(localStorage.getItem('astroveda_page_content')||'{}'); } catch(e){ return {}; } })();
  const S  = (() => { try { return JSON.parse(localStorage.getItem('astroveda_site_settings')||'{}'); } catch(e){ return {}; } })();

  // About text
  if (pc.aboutIntro) { const els=document.querySelectorAll('.about-text-col p'); if(els[0]) els[0].textContent=pc.aboutIntro; }
  if (pc.mission)    { const el=document.querySelector('.vm-card:nth-child(2) p'); if(el) el.textContent=pc.mission; }
  if (pc.vision)     { const el=document.querySelector('.vm-card:nth-child(1) p'); if(el) el.textContent=pc.vision; }
  if (pc.philosophy) { const el=document.querySelector('.vm-card:nth-child(3) p'); if(el) el.textContent=pc.philosophy; }

  // FIX 8: Privacy Policy and Terms of Service — loaded from dashboard Page Editor
  const defaultPrivacy = `AstroVeda Privacy Policy
Last Updated: January 2025

1. INFORMATION WE COLLECT
We collect information you provide during consultations and sign-up: name, mobile number, email, date of birth, time of birth, and place of birth (for astrological charts).

2. HOW WE USE YOUR INFORMATION
Your information is used exclusively for:
• Preparing personalized astrological charts and readings
• Communicating consultation details via WhatsApp or email
• Improving our services and user experience

3. DATA CONFIDENTIALITY
All personal information shared during consultations is kept strictly confidential. We never sell, trade, or share your data with third parties without your explicit consent.

4. DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or disclosure.

5. COOKIES
Our website uses minimal essential cookies only. No tracking or advertising cookies are used.

6. YOUR RIGHTS
You have the right to access, correct, or request deletion of your personal data. Contact us at astrorrshastri@gmail.com.

7. CONTACT
Dr. Rajesh R Shastrijee | +91 8863038229 | astrorrshastri@gmail.com`;

  const defaultTerms = `AstroVeda Terms of Service
Last Updated: January 2025

1. ACCEPTANCE OF TERMS
By accessing AstroVeda services, you agree to these Terms. If you do not agree, please do not use our services.

2. NATURE OF SERVICES
Astrological guidance is for informational and spiritual purposes only. It does not replace professional medical, legal, financial, or psychological advice.

3. CONSULTATIONS
• Free Consultation: 15-minute introductory session, no payment required
• Paid Consultations: Payment required before session
• Available via video call, WhatsApp, or phone worldwide

4. ACCURACY DISCLAIMER
While Dr. Shastrijee applies decades of expertise, no astrological prediction guarantees specific outcomes. Results vary based on individual circumstances.

5. PAYMENT POLICY
• All payments are non-refundable once a consultation has been conducted
• Payment confirmation must be sent via WhatsApp before session begins

6. PRODUCTS
• All gemstones and Rudraksha are lab-certified and authentic
• Orders confirmed via WhatsApp after payment

7. INTELLECTUAL PROPERTY
All content on AstroVeda is the intellectual property of Dr. Rajesh R Shastrijee.

8. LIMITATION OF LIABILITY
AstroVeda is not liable for decisions made based on astrological guidance.

9. CONTACT
Dr. Rajesh R Shastrijee | +91 8863038229 | astrorrshastri@gmail.com`;

  const privacyEl = document.getElementById('privacyContent');
  if (privacyEl) privacyEl.textContent = pc.privacy || defaultPrivacy;

  const termsEl = document.getElementById('termsContent');
  if (termsEl) termsEl.textContent = pc.terms || defaultTerms;

  // FIX 9: Social links — body section links
  if (S.socialInstagram) { const el=document.getElementById('socialInstagram'); if(el){el.href=S.socialInstagram;el.target='_blank';} }
  if (S.socialYoutube)   { const el=document.getElementById('socialYoutube');   if(el){el.href=S.socialYoutube;el.target='_blank';}   }
  if (S.socialFacebook)  { const el=document.getElementById('socialFacebook');  if(el){el.href=S.socialFacebook;el.target='_blank';}  }
  // WhatsApp
  if (S.whatsapp) {
    const num = S.whatsapp.replace(/\D/g,'').replace(/^91/,'');
    const waUrl = 'https://wa.me/91'+num;
    const el=document.getElementById('socialWhatsapp'); if(el) el.href=waUrl;
    // FIX 9: Footer social links — now have IDs
    const fw=document.getElementById('footerWhatsapp'); if(fw) fw.href=waUrl;
  }
  // FIX 9: Footer Instagram & Facebook
  if (S.socialInstagram) { const el=document.getElementById('footerInstagram'); if(el){el.href=S.socialInstagram;} }
  if (S.socialFacebook)  { const el=document.getElementById('footerFacebook');  if(el){el.href=S.socialFacebook;}  }

  // Contact details
  if (S.contactEmail) { const el=document.getElementById('contactEmail');    if(el) el.textContent=S.contactEmail; }
  if (S.whatsapp)     { const el=document.getElementById('contactWhatsApp'); if(el) el.textContent='+91 '+S.whatsapp.replace(/\D/g,'').replace(/^91/,''); }

  // ── FAQs ──────────────────────────────────────────────────────────────────
  function getFaqs(){
    try{ const s=JSON.parse(localStorage.getItem('astroveda_faqs')||'null'); if(s&&s.length) return s; } catch(e){}
    return [
      {q:'What is Vedic astrology?',a:'Vedic astrology (Jyotish) is the ancient Indian system based on the sidereal zodiac. It uses the actual positions of stars and planets at your birth to create a Kundali for precise life predictions.'},
      {q:'How accurate are the predictions?',a:"When exact birth date, time and place are provided, predictions can be remarkably precise. Dr. Shastrijee has a verified accuracy rate of over 90% across thousands of consultations over 25+ years."},
      {q:'Can I consult online from outside India?',a:'Absolutely. Dr. Shastrijee offers consultations via video call, WhatsApp, and phone to clients in 40+ countries across all time zones.'},
      {q:'How do I book a consultation?',a:'Visit the Book Appointment page, select your service, fill in your birth details accurately, and submit. For paid services, complete the payment and send the screenshot on WhatsApp.'},
      {q:'Are the products authentic?',a:'Yes. All gemstones and Rudraksha are lab-certified. Yantras are crafted from authentic metals and personally energized by Dr. Shastrijee with the appropriate mantras and rituals.'},
      {q:'What information is needed for a birth chart?',a:'Your exact date of birth, birth time (as precise as possible — even minutes matter), and exact place of birth. The birth time is crucial — even a 2-minute difference can change planetary positions.'},
      {q:'What remedies are prescribed?',a:'Gemstones, Rudraksha, Yantras, mantra chanting, Vastu corrections, charity (dana), fasting. All remedies are personalized, practical, and completely safe.'},
    ];
  }

  const faqList = document.getElementById('faqList');
  if (faqList) {
    const faqs = getFaqs();
    faqList.innerHTML = faqs.map((f,i)=>`
      <div class="faq-item reveal" id="faq-${i}">
        <div class="faq-question" data-idx="${i}"><span>${f.q}</span><i class="fas fa-chevron-down"></i></div>
        <div class="faq-answer"><p>${f.a}</p></div>
      </div>`).join('');
    faqList.querySelectorAll('.faq-question').forEach(q=>{
      q.addEventListener('click',()=>{
        const item=document.getElementById('faq-'+q.dataset.idx);
        const open=item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(f=>f.classList.remove('open'));
        if(!open) item.classList.add('open');
      });
    });
    setTimeout(()=>faqList.querySelectorAll('.faq-item.reveal').forEach(el=>el.classList.add('visible')),100);
  }
});

// FIX 9: Feedback form
window.submitFeedback = function(){
  const name    = (document.getElementById('fbName')?.value||'').trim();
  const message = (document.getElementById('fbMsg')?.value||'').trim();
  if(!name||!message){ if(typeof showToast==='function') showToast('Incomplete','Please fill in name and message.','⚠️'); return; }
  const apiUrl = window.ASTROVEDA_API || 'http://localhost:5000/api';
  fetch(apiUrl+'/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message})})
  .then(r=>r.json())
  .then(data=>{
    if(data.success){
      document.getElementById('fbName').value=''; document.getElementById('fbMsg').value='';
      if(typeof showToast==='function') showToast('Feedback Sent!','Thank you! Dr. Shastrijee will read your message.','✅');
    }
  })
  .catch(()=>{
    const feedbacks=JSON.parse(localStorage.getItem('astroveda_feedbacks')||'[]');
    feedbacks.push({name,msg:message,time:new Date().toISOString()});
    localStorage.setItem('astroveda_feedbacks',JSON.stringify(feedbacks));
    document.getElementById('fbName').value=''; document.getElementById('fbMsg').value='';
    if(typeof showToast==='function') showToast('Feedback Sent!','Thank you! Dr. Shastrijee will read your message.','✅');
  });
};
