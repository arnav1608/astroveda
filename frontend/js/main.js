// ============================================
// page-init.js — included on ALL pages
// Handles: loader hide, scroll reveals, counters, toast, modal helpers
// nav.js runs separately (before this)
// ============================================

window.addEventListener('DOMContentLoaded', () => {
  // Loader
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 1800);

  // Custom cursor
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  let mx=0,my=0,tx=0,ty=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    if (cursor) { cursor.style.left=mx+'px'; cursor.style.top=my+'px'; }
  });
  (function tick(){ tx+=(mx-tx)*0.15; ty+=(my-ty)*0.15; if(trail){trail.style.left=tx+'px';trail.style.top=ty+'px';} requestAnimationFrame(tick); })();

  // Scroll reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e,i) => { if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('visible'),i*60); obs.unobserve(e.target); } });
  }, { threshold:0.08 });
  document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

  // Stats counter
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ animCounter(e.target); cObs.unobserve(e.target); } });
  }, { threshold:0.5 });
  document.querySelectorAll('.stat-number').forEach(c => cObs.observe(c));
  function animCounter(el) {
    const target=parseInt(el.dataset.target)||0, step=target/(2000/16); let cur=0;
    const t=setInterval(()=>{ cur+=step; if(cur>=target){cur=target;clearInterval(t);} el.textContent=Math.floor(cur).toLocaleString('en-IN'); },16);
  }

  // Toast
  window.showToast = (title, msg, icon='✨') => {
    let t = document.getElementById('_toast');
    if (!t) {
      t=document.createElement('div'); t.id='_toast'; t.className='toast';
      t.innerHTML=`<div class="toast-icon"></div><div class="toast-text"><strong></strong><span></span></div>`;
      document.body.appendChild(t);
    }
    t.querySelector('.toast-icon').textContent=icon;
    t.querySelector('strong').textContent=title;
    t.querySelector('span').textContent=msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t=setTimeout(()=>t.classList.remove('show'),4000);
  };

  // Modal helpers
  window.openModal  = id => { document.getElementById(id)?.classList.add('open'); document.body.style.overflow='hidden'; };
  window.closeModal = id => { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow=''; };
  document.querySelectorAll('.modal-overlay').forEach(o =>
    o.addEventListener('click', e => { if(e.target===o) closeModal(o.id); })
  );
  document.querySelectorAll('.modal-close').forEach(btn =>
    btn.addEventListener('click', () => { btn.closest('.modal-overlay') && closeModal(btn.closest('.modal-overlay').id); })
  );
});
