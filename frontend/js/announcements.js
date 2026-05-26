// ============================================
// AstroVeda – Announcements JS (Clean — no fake data)
// ============================================

const API = window.ASTROVEDA_API || (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api');
const WHATSAPP = '8863038229'; // FIX 1: correct number

// Daily cosmic tip from dashboard or defaults
const defaultTips = [
  "Chant 'Om Namah Shivaya' 108 times today for clarity and peace.",
  "Jupiter's blessings are strong — focus on gratitude and new beginnings.",
  "Wear yellow today to attract Jupiter's wisdom and blessings.",
  "Full moon energy is ideal for releasing what no longer serves you.",
  "Saturn favors discipline today — set clear intentions for the week.",
  "Venus aspects are positive — relationships and creativity flourish.",
  "Rahu-Ketu axis: transformation is your theme this month.",
  "Mercury is favorable — excellent time for new communications.",
];

(function initTip() {
  // Check dashboard-saved tip first
  const pc = (() => { try { return JSON.parse(localStorage.getItem('astroveda_page_content') || '{}'); } catch(e){ return {}; } })();
  const tipEl = document.getElementById('dailyTip');
  if (tipEl) tipEl.textContent = pc.dailyTip || defaultTips[new Date().getDay() % defaultTips.length];
})();

// FIX 2: NO fake/default posts — start clean, load from API only
function getPosts() {
  try { return JSON.parse(localStorage.getItem('astroveda_posts') || '[]'); }
  catch(e) { return []; }
}
function savePosts(posts) {
  localStorage.setItem('astroveda_posts', JSON.stringify(posts));
}

let activePostId = null;
let currentSort = 'newest';
const currentUser = (() => { try { return JSON.parse(localStorage.getItem('astroveda_current_user') || 'null'); } catch(e){ return null; } })();

// Load posts from API, fall back to localStorage
(async function loadPosts() {
  try {
    const res = await fetch(API + '/announcements?limit=50');
    const data = await res.json();
    if (data.success && data.posts && data.posts.length) {
      // Map API posts to frontend format
      const mapped = data.posts.map(p => ({
        id: p._id,
        type: p.type,
        emoji: p.emoji || '📢',
        author: p.author || 'Dr. Rajesh R Shastrijee',
        avatar: 'R',
        time: formatTime(p.createdAt),
        text: p.text,
        link: p.link || null,
        images: p.images || [],
        poll: p.poll ? {
          options: p.poll.options.map(o => o.text),
          votes: p.poll.options.map(o => o.votes.length)
        } : null,
        likes: p.likes.length,   // FIX 2: real count from DB
        hearts: p.hearts.length, // FIX 2: real count from DB
        shares: 0,
        comments: (p.comments || []).map(c => ({
          author: c.author,
          text: c.text,
          likes: c.likes.length,
          liked: false,
          replies: (c.replies || []).map(r => ({ author: r.author, text: r.text })),
          time: formatTime(c.createdAt)
        }))
      }));
      savePosts(mapped);
    }
  } catch(e) {
    // Backend offline — use whatever is in localStorage (could be empty)
    console.warn('Announcements API offline, using local cache');
  }
  renderFeed();
})();

function formatTime(iso) {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff/60) + ' minutes ago';
  if (diff < 86400) return Math.floor(diff/3600) + ' hours ago';
  if (diff < 604800) return Math.floor(diff/86400) + ' days ago';
  return d.toLocaleDateString('en-IN');
}

window.setSortFilter = function(sort, btn) {
  currentSort = sort;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFeed();
};

// Load upcoming events into sidebar
(function loadSidebarEvents() {
  var list = document.getElementById('sidebarEventList');
  if (!list) return;
  var posts = getPosts();
  var events = posts.filter(function(p){ return p.type === 'event' && p.eventDate; })
    .sort(function(a,b){ return new Date(a.eventDate) - new Date(b.eventDate); })
    .slice(0, 4);
  if (!events.length) return; // keep default message
  list.innerHTML = events.map(function(e){
    var d = e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '';
    return '<div class="event-item"><span class="event-dot"></span><div><strong>'+(e.text||e.title||'Event').substring(0,40)+'</strong><small>'+d+(e.eventLocation?' · '+e.eventLocation:'')+'</small></div></div>';
  }).join('');
})();

function renderFeed() {
  const feed = document.getElementById('annFeed');
  if (!feed) return;
  let posts = getPosts();

  if (!posts.length) {
    feed.innerHTML = '<div style="text-align:center;padding:4rem 2rem;color:var(--silver);"><div style="font-size:3rem;margin-bottom:1rem;">📢</div><p>No announcements yet. Check back soon!</p></div>';
    return;
  }

  if (currentSort === 'popular') posts = [...posts].sort((a,b) => (b.likes+b.hearts) - (a.likes+a.hearts));
  else if (currentSort === 'featured') posts = posts.filter(p => p.type==='wisdom'||p.type==='announcement');
  else if (currentSort === 'events') posts = posts.filter(p => p.type==='event');
  else if (currentSort === 'offers') posts = posts.filter(p => p.type==='offer');

  if (!posts.length) {
    feed.innerHTML = '<div style="text-align:center;padding:4rem 2rem;color:var(--silver);"><div style="font-size:3rem;margin-bottom:1rem;">🔍</div><p>No posts in this category.</p></div>';
    return;
  }
  feed.innerHTML = posts.map(post => renderPost(post)).join('');
}

function renderPost(p) {
  const typeColors = { announcement:'tag-gold', event:'tag-purple', poll:'tag-cyan', wisdom:'tag-gold', offer:'tag-purple' };
  const likedClass   = isReacted(p.id,'like')  ? 'liked'   : '';
  const heartedClass = isReacted(p.id,'heart') ? 'hearted' : '';

  // Images — dynamic size, no fixed height, natural aspect ratio
  let imagesHtml = '';
  if (p.images && p.images.length) {
    const base = API.replace('/api','');
    if (p.images.length === 1) {
      // Single image: full width, natural height
      imagesHtml = `<div class="post-images" style="margin:.8rem 0;border-radius:14px;overflow:hidden;">
        <img src="${p.images[0].startsWith('http') ? p.images[0] : base+p.images[0]}" style="width:100%;height:auto;display:block;border-radius:14px;cursor:zoom-in;" loading="lazy" onclick="openPostImage(this.src)"/>
      </div>`;
    } else if (p.images.length === 2) {
      // Two images: side by side
      imagesHtml = `<div class="post-images" style="margin:.8rem 0;display:grid;grid-template-columns:1fr 1fr;gap:.4rem;border-radius:14px;overflow:hidden;">
        ${p.images.map(img => `<img src="${img.startsWith('http')?img:base+img}" style="width:100%;height:220px;object-fit:cover;cursor:zoom-in;" loading="lazy" onclick="openPostImage(this.src)"/>`).join('')}
      </div>`;
    } else if (p.images.length === 3) {
      // Three images: 1 big left + 2 stacked right
      imagesHtml = `<div class="post-images" style="margin:.8rem 0;display:grid;grid-template-columns:2fr 1fr;gap:.4rem;border-radius:14px;overflow:hidden;">
        <img src="${p.images[0].startsWith('http')?p.images[0]:base+p.images[0]}" style="width:100%;height:280px;object-fit:cover;cursor:zoom-in;" loading="lazy" onclick="openPostImage(this.src)"/>
        <div style="display:flex;flex-direction:column;gap:.4rem;">
          ${p.images.slice(1).map(img=>`<img src="${img.startsWith('http')?img:base+img}" style="width:100%;height:138px;object-fit:cover;cursor:zoom-in;" loading="lazy" onclick="openPostImage(this.src)"/>`).join('')}
        </div>
      </div>`;
    } else {
      // 4+ images: 2x2 grid
      imagesHtml = `<div class="post-images" style="margin:.8rem 0;display:grid;grid-template-columns:1fr 1fr;gap:.4rem;border-radius:14px;overflow:hidden;">
        ${p.images.slice(0,4).map((img,i) => {
          const extra = i===3 && p.images.length>4 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;font-weight:700;">+${p.images.length-4}</div>` : '';
          return `<div style="position:relative;"><img src="${img.startsWith('http')?img:base+img}" style="width:100%;height:180px;object-fit:cover;cursor:zoom-in;display:block;" loading="lazy" onclick="openPostImage(this.src)"/>${extra}</div>`;
        }).join('')}
      </div>`;
    }
  }

  let pollHtml = '';
  if (p.poll && p.poll.options) {
    const total = (p.poll.votes || []).reduce((a,b)=>a+b,0);
    pollHtml = `<div class="post-poll">${p.poll.options.map((opt,i)=>{
      const pct = total ? Math.round(((p.poll.votes[i]||0)/total)*100) : 0;
      return `<div class="poll-option" onclick="votePoll('${p.id}',${i})">
        <div class="poll-bar-wrap">
          <div class="poll-bar" style="width:${pct}%"></div>
          <div class="poll-bar-label"><span>${opt}</span><span class="poll-pct">${pct}%</span></div>
        </div>
      </div>`;
    }).join('')}
    <small style="font-family:var(--font-ui);font-size:0.78rem;color:var(--silver);margin-top:0.5rem;display:block;">${total} votes</small></div>`;
  }

  const linkHtml = p.link ? `<a href="${p.link}" target="_blank" class="post-link"><i class="fas fa-external-link-alt"></i> ${p.link}</a>` : '';
  const commentCount = (p.comments||[]).length;

  return `<div class="post-card reveal visible" id="post-${p.id}">
    <div class="post-header">
      <div class="post-avatar">${p.avatar||'R'}</div>
      <div class="post-meta"><strong>${p.author||'Dr. Rajesh R Shastrijee'}</strong><span>${p.time||''}</span></div>
      <div class="post-type-badge"><span class="tag ${typeColors[p.type]||'tag-gold'}">${p.emoji||'📢'} ${(p.type||'').charAt(0).toUpperCase()+(p.type||'').slice(1)}</span></div>
    </div>
    <div class="post-text">${(p.text||'').replace(/\n/g,'<br>')}</div>
    ${linkHtml}${imagesHtml}${pollHtml}
    <div class="post-actions">
      <button class="action-btn ${likedClass}" onclick="reactPost('${p.id}','like')">
        <i class="fas fa-thumbs-up"></i><span class="count">${p.likes||0}</span>
      </button>
      <button class="action-btn ${heartedClass}" onclick="reactPost('${p.id}','heart')">
        <i class="fas fa-heart"></i><span class="count">${p.hearts||0}</span>
      </button>
      <button class="action-btn" onclick="openComments('${p.id}')">
        <i class="fas fa-comment"></i><span class="count">${commentCount} Comments</span>
      </button>
      <div class="share-options" style="margin-left:auto;">
        <button class="share-opt-btn" title="Share on WhatsApp" onclick="sharePost('${p.id}','whatsapp')"><i class="fab fa-whatsapp"></i></button>
        <button class="share-opt-btn" title="Copy Link" onclick="sharePost('${p.id}','copy')"><i class="fas fa-link"></i></button>
      </div>
    </div>
  </div>`;
}

function isReacted(postId, type) {
  try { const r = JSON.parse(localStorage.getItem('astroveda_reactions')||'{}'); return r[`${postId}_${type}`]||false; } catch(e){ return false; }
}
function setReacted(postId, type, val) {
  try { const r = JSON.parse(localStorage.getItem('astroveda_reactions')||'{}'); r[`${postId}_${type}`]=val; localStorage.setItem('astroveda_reactions',JSON.stringify(r)); } catch(e){}
}

function reactPost(postId, type) {
  if (!currentUser) { window.location.href='auth.html'; return; }
  const posts = getPosts();
  const post = posts.find(p => String(p.id) === String(postId));
  if (!post) return;
  const wasReacted = isReacted(postId, type);
  if (type==='like')  post.likes  = Math.max(0,(post.likes||0) + (wasReacted?-1:1));
  if (type==='heart') post.hearts = Math.max(0,(post.hearts||0) + (wasReacted?-1:1));
  setReacted(postId, type, !wasReacted);
  savePosts(posts);
  // API call
  fetch(API+'/announcements/'+postId+'/react',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('astroveda_token')},body:JSON.stringify({type})}).catch(()=>{});
  const card = document.getElementById(`post-${postId}`);
  if (card) card.outerHTML = renderPost(post);
}

function votePoll(postId, optionIndex) {
  if (!currentUser) { window.location.href='auth.html'; return; }
  const posts = getPosts();
  const post = posts.find(p => String(p.id) === String(postId));
  if (!post || !post.poll) return;
  const key = `poll_${postId}`;
  const reactions = (() => { try{ return JSON.parse(localStorage.getItem('astroveda_reactions')||'{}'); }catch(e){return {};} })();
  if (reactions[key] !== undefined) { if(typeof showToast==='function') showToast('Already Voted','You have already voted on this poll.','🗳️'); return; }
  if (!post.poll.votes) post.poll.votes = post.poll.options.map(()=>0);
  post.poll.votes[optionIndex] = (post.poll.votes[optionIndex]||0) + 1;
  reactions[key] = optionIndex;
  localStorage.setItem('astroveda_reactions', JSON.stringify(reactions));
  savePosts(posts);
  fetch(API+'/announcements/'+postId+'/vote',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('astroveda_token')},body:JSON.stringify({optionIndex})}).catch(()=>{});
  const card = document.getElementById(`post-${postId}`);
  if (card) card.outerHTML = renderPost(post);
  if(typeof showToast==='function') showToast('Vote Cast!','Thanks for participating!','✅');
}

function openComments(postId) {
  if (!currentUser) { window.location.href='auth.html'; return; }
  activePostId = postId;
  const posts = getPosts();
  const post = posts.find(p => String(p.id) === String(postId));
  if (!post) return;
  renderComments(post.comments || []);
  const av = document.getElementById('commentAvatar');
  if (av) av.textContent = (currentUser.name||'U').charAt(0).toUpperCase();
  openModal('commentModal');
}

function renderComments(comments) {
  const list = document.getElementById('commentsList');
  if (!list) return;
  if (!comments.length) { list.innerHTML='<p style="color:var(--silver);text-align:center;padding:2rem 0;">No comments yet. Be the first!</p>'; return; }
  list.innerHTML = comments.map((c,ci) => `
    <div class="comment-item">
      <div class="avatar-placeholder" style="width:36px;height:36px;font-size:.85rem;">${(c.author||'U').charAt(0)}</div>
      <div class="comment-body">
        <div class="comment-author">${c.author||'User'}</div>
        <div class="comment-text">${c.text||''}</div>
        <div class="comment-time">${c.time||''}</div>
        <div class="comment-actions">
          <button class="comment-like-btn ${c.liked?'liked':''}" onclick="likeComment(${ci})"><i class="fas fa-heart"></i> ${c.likes||0}</button>
          <button class="reply-toggle-btn" onclick="toggleReply(${ci})">Reply</button>
        </div>
        ${(c.replies||[]).length?`<div class="replies-list">${c.replies.map(r=>`<div class="reply-item"><div class="reply-author">${r.author||'User'}</div>${r.text||''}</div>`).join('')}</div>`:''}
        <div class="reply-input-wrap" id="replyWrap-${ci}" style="display:none;margin-top:0.5rem;">
          <input type="text" class="form-input" placeholder="Write a reply..." style="font-size:.85rem;padding:.5rem 1rem;border-radius:20px;" id="replyInput-${ci}"/>
          <button class="btn-primary" style="padding:.4rem 1rem;margin-top:.4rem;font-size:.8rem;" onclick="submitReply(${ci})">Reply</button>
        </div>
      </div>
    </div>`).join('');
}

function submitComment() {
  const input = document.getElementById('commentInput');
  const text = (input?.value||'').trim();
  if (!text) return;
  const posts = getPosts();
  const post = posts.find(p => String(p.id) === String(activePostId));
  if (!post) return;
  if (!post.comments) post.comments = [];
  const newComment = { author: currentUser.name||'User', text, likes:0, liked:false, replies:[], time:'Just now' };
  post.comments.push(newComment);
  savePosts(posts);
  if (input) input.value = '';
  renderComments(post.comments);
  // Update count in feed
  const card = document.getElementById(`post-${activePostId}`);
  if (card) card.outerHTML = renderPost(post);
  // API
  fetch(API+'/announcements/'+activePostId+'/comment',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('astroveda_token')},body:JSON.stringify({text})}).catch(()=>{});
}

function likeComment(ci) {
  const posts = getPosts();
  const post = posts.find(p => String(p.id) === String(activePostId));
  if (!post||!post.comments[ci]) return;
  const c = post.comments[ci];
  c.liked = !c.liked;
  c.likes = Math.max(0,(c.likes||0)+(c.liked?1:-1));
  savePosts(posts);
  renderComments(post.comments);
}

function toggleReply(ci) {
  const wrap = document.getElementById(`replyWrap-${ci}`);
  if (wrap) wrap.style.display = wrap.style.display==='none'?'block':'none';
}

function submitReply(ci) {
  const input = document.getElementById(`replyInput-${ci}`);
  const text = (input?.value||'').trim();
  if (!text) return;
  const posts = getPosts();
  const post = posts.find(p => String(p.id) === String(activePostId));
  if (!post||!post.comments[ci]) return;
  if (!post.comments[ci].replies) post.comments[ci].replies = [];
  post.comments[ci].replies.push({ author: currentUser.name||'User', text });
  savePosts(posts);
  if (input) input.value = '';
  renderComments(post.comments);
}

function sharePost(postId, method) {
  const url = window.location.href + '#post-' + postId;
  if (method==='whatsapp') window.open(`https://wa.me/91${WHATSAPP}?text=${encodeURIComponent('Check this out from AstroVeda: '+url)}`,'_blank');
  else { navigator.clipboard?.writeText(url); if(typeof showToast==='function') showToast('Link Copied!','Post link copied to clipboard.','🔗'); }
}

// Fullscreen image lightbox for post images
function openPostImage(src) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;padding:1rem;cursor:zoom-out;';
  overlay.innerHTML = '<img src="'+src+'" style="max-width:92vw;max-height:88vh;object-fit:contain;border-radius:12px;box-shadow:0 0 50px rgba(201,168,76,.3);cursor:default;"/>'
    + '<button style="position:fixed;top:1rem;right:1rem;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:1.4rem;cursor:pointer;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;" onclick="this.parentElement.remove();document.body.style.overflow=\'\'">✕</button>';
  overlay.onclick = function(e){ if(e.target===overlay){ overlay.remove(); document.body.style.overflow=''; } };
  document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){ overlay.remove(); document.body.style.overflow=''; document.removeEventListener('keydown',esc); } });
  document.body.style.overflow = 'hidden';
  document.body.appendChild(overlay);
}

function openModal(id) { document.getElementById(id)?.classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow=''; }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) closeModal(o.id); }));
