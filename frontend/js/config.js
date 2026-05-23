// ============================================
// AstroVeda — API Configuration
// ONE place to change for production deployment
// ============================================
(function() {
  // Auto-detect: if running on localhost/file, use localhost backend
  // If running on Vercel (production), use Render backend URL
  var isLocalhost = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:'
  );

  if (isLocalhost) {
    // Local development
    window.ASTROVEDA_API = window.location.port === '5000'
      ? '/api'
      : 'http://localhost:5000/api';
  } else {
    // Production — UPDATE THIS with your actual Render URL after deploying
    window.ASTROVEDA_API = 'https://astroveda-backend.onrender.com/api';
  }

  // Expose helper
  window.getAPIUrl = function(path) {
    return window.ASTROVEDA_API + (path || '');
  };
})();
