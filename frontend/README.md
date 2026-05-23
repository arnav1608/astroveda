# AstroVeda – Website Structure

## Folder Structure
```
frontend/
├── index.html                  ← Home page
├── css/
│   ├── main.css               ← Global styles, navbar, hero, footer
│   ├── animations.css         ← All animations & keyframes
│   ├── components.css         ← Reusable UI components
│   ├── home-patch.css         ← Home page specific additions
│   ├── appointment.css        ← Appointment page
│   ├── products.css           ← Products page
│   ├── announcements.css      ← Announcements/feed page
│   ├── profile.css            ← User profile page
│   ├── about.css              ← About page
│   ├── auth.css               ← Login/Signup page
│   ├── achievements.css       ← Achievements page
│   └── dashboard.css          ← Moderator dashboard
├── js/
│   ├── cosmic.js              ← Canvas stars, shooting stars, particles
│   ├── main.js                ← Navbar, cursor, scroll, counter, carousel
│   ├── home.js                ← Zodiac wheel, rashi guidance, reviews
│   ├── appointment.js         ← Booking form, payment modal
│   ├── products.js            ← Products grid, buy via WhatsApp
│   ├── announcements.js       ← Feed, likes, polls, comments
│   ├── profile.js             ← User profile management
│   ├── about.js               ← FAQ, feedback form
│   ├── auth.js                ← Login, signup, auto-username
│   └── dashboard.js           ← Moderator panel — all controls
├── pages/
│   ├── appointment.html
│   ├── products.html
│   ├── announcements.html
│   ├── profile.html
│   ├── about.html
│   ├── achievements.html      ← NEW: Awards, Certs, Medals, Photos
│   ├── dashboard.html         ← Moderator only
│   └── auth.html
└── assets/
    └── images/                ← Add product/founder photos here

backend/
├── routes/
├── models/
├── controllers/
└── middleware/
```

## Key Features Implemented

### All 9 Changes Applied:
1. ✅ Phone: +91 8863038229 | Email: astrorrshastri@gmail.com
2. ✅ Appointment: Free / Detailed Jyotish Vishleshan / Kundli Nirman; DOB, Birth Time, Birth Place with District
3. ✅ Products: 14 Rudraksha (1-14 mukhi), 16 Gemstones, 6 Yantras, 4 Spiritual items — all with planet & benefits
4. ✅ Home: User review form (login required) → moderator approves/rejects → shows in Voices of Stars
5. ✅ Zodiac: Indian names (Mesh, Vrishabh...) with animal images; click → monthly guidance by Dr. Shastrijee
6. ✅ Achievements: New navbar item with Awards / Certificates / Medals / Photos sections
7. ✅ Login required: Booking, Buying, Writing Reviews
8. ✅ Home layout: Founder section ABOVE Services section
9. ✅ Awards: IAF Brand Ambassador | USA Astrological Fellowship Award | Maharsi Gyan Ratna Award

## Moderator Dashboard Access
- URL: pages/dashboard.html
- Username: admin
- Password: astroveda2024

## Rashi Monthly Guidance
Admin can update monthly forecasts by editing `astroveda_rashi_guidance` in localStorage
OR directly edit the `rashiMonthlyData` object in `js/home.js`

## WhatsApp Number: +91 8863038229
## Email: astrorrshastri@gmail.com
