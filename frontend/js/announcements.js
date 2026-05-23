// ============================================
// AstroVeda – Announcements JS
// ============================================

const cosmicTips = [
  "Mercury retrograde ends soon — excellent time for new communications.",
  "Jupiter in Taurus brings abundance. Focus on gratitude today.",
  "Full moon energy peaks tonight — ideal for releasing what no longer serves you.",
  "Saturn's transit favors discipline. Set clear intentions this week.",
  "Venus aspects your chart positively — relationships flourish today.",
  "Rahu-Ketu axis shifts: transformation is your theme this month.",
  "Wear yellow today to attract Jupiter's blessings and wisdom.",
  "Chant 'Om Namah Shivaya' 108 times today for clarity and peace.",
];

document.getElementById('dailyTip').textContent = cosmicTips[new Date().getDay() % cosmicTips.length];

const defaultPosts = [
  {
    id: 1, type: 'announcement', emoji: '📢',
    author: 'Dr. Rajesh R Shastrijee', avatar: 'R', time: '2 hours ago',
    text: '🌟 Special Diwali Discount! Get 30% off on all consultations booked this week. Limited slots available. Mercury is in a favorable position — perfect time for new beginnings and clarity in life decisions. Book your session now!',
    link: null, media: null, poll: null,
    likes: 124, hearts: 89, shares: 45, comments: []
  },
  {
    id: 2, type: 'event', emoji: '🌙',
    author: 'Dr. Rajesh R Shastrijee', avatar: 'R', time: '1 day ago',
    text: '🔴 LIVE Webinar Alert! Join me this Saturday for a FREE 1-hour session on "Understanding Your Moon Sign and Its Impact on Daily Life." Register via the link below. Only 100 seats!',
    link: 'https://astroveda.com/webinar', media: null, poll: null,
    likes: 256, hearts: 178, shares: 92, comments: []
  },
  {
    id: 3, type: 'poll', emoji: '📊',
    author: 'Dr. Rajesh R Shastrijee', avatar: 'R', time: '3 days ago',
    text: '🪐 Which area of life do you want cosmic guidance on the most? Vote below!',
    link: null, media: null,
    poll: {
      options: ['Career & Finance', 'Love & Relationships', 'Health & Wellness', 'Spiritual Growth'],
      votes: [145, 203, 89, 167]
    },
    likes: 89, hearts: 56, shares: 23, comments: []
  },
  {
    id: 4, type: 'wisdom', emoji: '✨',
    author: 'Dr. Rajesh R Shastrijee', avatar: 'R', time: '5 days ago',
    text: '🌠 Cosmic Wisdom: "The planet Jupiter (Guru) represents divine grace and expansion. When Jupiter transits your 11th house, it opens doors to unexpected gains, new friendships, and fulfillment of long-held desires. This is the time to dream big and take action aligned with dharma." \n\n– From the Brihat Parashara Hora Shastra',
    link: null, media: null, poll: null,
    likes: 432, hearts: 387, shares: 156, comments: []
  },
  {
    id: 5, type: 'offer', emoji: '🎁',
    author: 'Dr. Rajesh R Shastrijee', avatar: 'R', time: '1 week ago',
    text: '🛍️ New Product Alert! We have just added authentic Gauri Shankar Rudraksha and Ceylon Blue Sapphire to our product store. These have been personally verified and energized by me. Extremely limited stock available. Visit the Products page to order or WhatsApp for inquiries.',
    link: null, media: null, poll: null,
    likes: 198, hearts: 145, shares: 67, comments: []
  }
];

function getPosts() {
  const stored = localStorage.getItem('astroveda_posts');
  return stored ? JSON.parse(stored) : defaultPosts;
}

function savePosts(posts) {
  localStorage.setItem('astroveda_posts', JSON.stringify(posts));
}

let activePostId = null;
const currentUser = JSON.parse(localStorage.getItem('astroveda_current_user') || '{"name":"Guest","username":"guest"}');

let currentSort = 'newest';

function renderFeed() {
  const feed = document.getElementById('annFeed');
  let posts = getPosts();

  // Apply sort
  if (currentSort === 'newest') {
    // default order (already newest first)
  } else if (currentSort === 'popular') {
    posts = [...posts].sort((a,b) => (b.likes+b.hearts) - (a.likes+a.hearts));
  } else if (currentSort === 'featured') {
    posts = [...posts].filter(p => p.type === 'wisdom' || p.type === 'announcement');
  } else if (currentSort === 'events') {
    posts = [...posts].filter(p => p.type === 'event');
  } else if (currentSort === 'offers') {
    posts = [...posts].filter(p => p.type === 'offer');
  }

  if (!posts.length) {
    feed.innerHTML = '<div style="text-align:center;padding:4rem 2rem;color:var(--silver);"><div style="font-size:3rem;margin-bottom:1rem;">🔍</div><p>No posts in this category.</p></div>';
    return;
  }
  feed.innerHTML = posts.map(post => renderPost(post)).join('');
}

window.setSortFilter = function(sort, btn) {
  currentSort = sort;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFeed();
};

function renderPost(p) {
  const typeColors = { announcement:'tag-gold', event:'tag-purple', poll:'tag-cyan', wisdom:'tag-gold', offer:'tag-purple' };
  const likedClass = isReacted(p.id,'like') ? 'liked' : '';
  const heartedClass = isReacted(p.id,'heart') ? 'hearted' : '';

  let mediaHtml = '';
  if (p.media) mediaHtml = `<div class="post-media"><div class="post-img">${p.mediaEmoji || '🖼️'}</div></div>`;

  let pollHtml = '';
  if (p.poll) {
    const total = p.poll.votes.reduce((a,b)=>a+b,0);
    pollHtml = `<div class="post-poll">${p.poll.options.map((opt,i)=>{
      const pct = total ? Math.round((p.poll.votes[i]/total)*100) : 0;
      return `<div class="poll-option" onclick="votePoll(${p.id},${i})">
        <div class="poll-bar-wrap">
          <div class="poll-bar" style="width:${pct}%"></div>
          <div class="poll-bar-label"><span>${opt}</span><span class="poll-pct">${pct}%</span></div>
        </div>
      </div>`;
    }).join('')}
    <small style="font-family:var(--font-ui);font-size:0.78rem;color:var(--silver);margin-top:0.5rem;display:block;">${total} votes</small>
    </div>`;
  }

  const linkHtml = p.link ? `<a href="${p.link}" target="_blank" class="post-link"><i class="fas fa-external-link-alt"></i> ${p.link}</a>` : '';
  const commentCount = (p.comments||[]).length;

  return `<div class="post-card reveal visible" id="post-${p.id}">
    <div class="post-header">
      <div class="post-avatar">${p.avatar}</div>
      <div class="post-meta">
        <strong>${p.author}</strong>
        <span>${p.time}</span>
      </div>
      <div class="post-type-badge">
        <span class="tag ${typeColors[p.type]||'tag-gold'}">${p.emoji} ${p.type.charAt(0).toUpperCase()+p.type.slice(1)}</span>
      </div>
    </div>
    <div class="post-text">${p.text.replace(/\n/g,'<br>')}</div>
    ${linkHtml}${mediaHtml}${pollHtml}
    <div class="post-actions">
      <button class="action-btn ${likedClass}" onclick="reactPost(${p.id},'like')">
        <i class="fas fa-thumbs-up"></i><span class="count">${p.likes}</span>
      </button>
      <button class="action-btn ${heartedClass}" onclick="reactPost(${p.id},'heart')">
        <i class="fas fa-heart"></i><span class="count">${p.hearts}</span>
      </button>
      <button class="action-btn" onclick="openComments(${p.id})">
        <i class="fas fa-comment"></i><span class="count">${commentCount} Comments</span>
      </button>
      <div class="share-options" style="margin-left:auto;">
        <button class="share-opt-btn" title="Share on WhatsApp" onclick="sharePost(${p.id},'whatsapp')"><i class="fab fa-whatsapp"></i></button>
        <button class="share-opt-btn" title="Copy Link" onclick="sharePost(${p.id},'copy')"><i class="fas fa-link"></i></button>
      </div>
    </div>
  </div>`;
}

function isReacted(postId, type) {
  const reactions = JSON.parse(localStorage.getItem('astroveda_reactions') || '{}');
  return reactions[`${postId}_${type}`] || false;
}
function setReacted(postId, type, val) {
  const reactions = JSON.parse(localStorage.getItem('astroveda_reactions') || '{}');
  reactions[`${postId}_${type}`] = val;
  localStorage.setItem('astroveda_reactions', JSON.stringify(reactions));
}

function reactPost(postId, type) {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  const wasReacted = isReacted(postId, type);
  if (type === 'like') post.likes += wasReacted ? -1 : 1;
  if (type === 'heart') post.hearts += wasReacted ? -1 : 1;
  setReacted(postId, type, !wasReacted);
  savePosts(posts);
  const card = document.getElementById(`post-${postId}`);
  if (card) card.outerHTML = renderPost(post);
}

function votePoll(postId, optionIndex) {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post || !post.poll) return;
  const key = `poll_${postId}`;
  const reactions = JSON.parse(localStorage.getItem('astroveda_reactions') || '{}');
  if (reactions[key] !== undefined) { showToast('Already Voted', 'You have already voted on this poll.', '🗳️'); return; }
  post.poll.votes[optionIndex]++;
  reactions[key] = optionIndex;
  localStorage.setItem('astroveda_reactions', JSON.stringify(reactions));
  savePosts(posts);
  const card = document.getElementById(`post-${postId}`);
  if (card) card.outerHTML = renderPost(post);
  showToast('Vote Cast!', 'Thanks for participating!', '✅');
}

function openComments(postId) {
  activePostId = postId;
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  renderComments(post.comments || []);
  const av = document.getElementById('commentAvatar');
  if (av) av.textContent = currentUser.name.charAt(0).toUpperCase();
  openModal('commentModal');
}

function renderComments(comments) {
  const list = document.getElementById('commentsList');
  if (!comments.length) { list.innerHTML = '<p style="color:var(--silver);text-align:center;padding:2rem 0;">No comments yet. Be the first!</p>'; return; }
  list.innerHTML = comments.map((c, ci) => `
    <div class="comment-item">
      <div class="avatar-placeholder" style="width:36px;height:36px;font-size:0.85rem;">${c.author.charAt(0)}</div>
      <div class="comment-body">
        <div class="comment-author">${c.author}</div>
        <div class="comment-text">${c.text}</div>
        <div class="comment-time">${c.time}</div>
        <div class="comment-actions">
          <button class="comment-like-btn ${c.liked?'liked':''}" onclick="likeComment(${ci})">
            <i class="fas fa-heart"></i> ${c.likes||0}
          </button>
          <button class="reply-toggle-btn" onclick="toggleReply(${ci})">Reply</button>
        </div>
        ${(c.replies||[]).length ? `
        <div class="replies-list">
          ${c.replies.map(r=>`<div class="reply-item"><div class="reply-author">${r.author}</div>${r.text}</div>`).join('')}
        </div>` : ''}
        <div class="reply-input-wrap" id="replyWrap-${ci}" style="display:none;margin-top:0.5rem;">
          <input type="text" class="form-input" placeholder="Write a reply..." style="font-size:0.85rem;padding:0.5rem 1rem;border-radius:20px;" id="replyInput-${ci}"/>
          <button class="btn-primary" style="padding:0.4rem 1rem;margin-top:0.4rem;font-size:0.8rem;" onclick="submitReply(${ci})">Reply</button>
        </div>
      </div>
    </div>
  `).join('');
}

function submitComment() {
  const input = document.getElementById('commentInput');
  const text = input?.value.trim();
  if (!text) return;
  const posts = getPosts();
  const post = posts.find(p => p.id === activePostId);
  if (!post) return;
  if (!post.comments) post.comments = [];
  post.comments.push({
    author: currentUser.name || 'Guest',
    text, likes: 0, liked: false, replies: [],
    time: 'Just now'
  });
  savePosts(posts);
  input.value = '';
  renderComments(post.comments);
  // Update count in feed
  const card = document.getElementById(`post-${activePostId}`);
  if (card) card.outerHTML = renderPost(post);
}

function likeComment(ci) {
  const posts = getPosts();
  const post = posts.find(p => p.id === activePostId);
  if (!post || !post.comments[ci]) return;
  const c = post.comments[ci];
  c.liked = !c.liked;
  c.likes = (c.likes || 0) + (c.liked ? 1 : -1);
  savePosts(posts);
  renderComments(post.comments);
}

function toggleReply(ci) {
  const wrap = document.getElementById(`replyWrap-${ci}`);
  if (wrap) wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
}

function submitReply(ci) {
  const input = document.getElementById(`replyInput-${ci}`);
  const text = input?.value.trim();
  if (!text) return;
  const posts = getPosts();
  const post = posts.find(p => p.id === activePostId);
  if (!post || !post.comments[ci]) return;
  if (!post.comments[ci].replies) post.comments[ci].replies = [];
  post.comments[ci].replies.push({ author: currentUser.name || 'Guest', text });
  savePosts(posts);
  if (input) input.value = '';
  renderComments(post.comments);
}

function sharePost(postId, method) {
  const url = window.location.href + '#post-' + postId;
  if (method === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent('Check this out from AstroVeda: ' + url)}`, '_blank');
  else { navigator.clipboard?.writeText(url); showToast('Link Copied!', 'Post link copied to clipboard.', '🔗'); }
}

function openModal(id) { document.getElementById(id)?.classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow=''; }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) closeModal(o.id); }));

renderFeed();
