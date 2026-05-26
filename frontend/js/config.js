// ============================================
// AstroVeda — API Configuration
// ONE place to change for production deployment
// ============================================
(function() {
  var isLocalhost = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:'
  );

  if (isLocalhost) {
    // Local development — backend runs on port 5000
    window.ASTROVEDA_API = window.location.port === '5000'
      ? '/api'
      : 'http://localhost:5000/api';
  } else {
    // ⚠️ PRODUCTION — Replace with your actual Render backend URL after deploying
    // Example: 'https://astroveda-api.onrender.com/api'
    window.ASTROVEDA_API = 'https://astroveda-fey6.onrender.com/api';
  }

  window.getAPIUrl = function(path) {
    return window.ASTROVEDA_API + (path || '');
  };
})();
