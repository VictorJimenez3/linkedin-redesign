// LinkedIn Clone SPA - app.js
'use strict';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatTime(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
  if (diff < 7200) return '1 hour ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
  if (diff < 172800) return 'Yesterday';
  if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNumber(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name) {
  const colors = ['#0a66c2','#057642','#b24020','#7c3aed','#0891b2','#be185d','#b45309','#1d4ed8','#065f46','#9d174d'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function generateAvatar(name, size, colorOverride) {
  size = size || 40;
  const initials = getInitials(name);
  const color = colorOverride || getAvatarColor(name);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
    <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="${size*0.38}" font-weight="600">${initials}</text>
  </svg>`;
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return escapeHtml(text);
  return escapeHtml(text.slice(0, maxLength)) + `<span class="truncated-rest" style="display:none">${escapeHtml(text.slice(maxLength))}</span><span class="see-more-link" onclick="this.previousElementSibling.style.display='inline';this.style.display='none';this.nextElementSibling.style.display='inline'">...see more</span><span class="see-less-link" style="display:none" onclick="this.previousElementSibling.previousElementSibling.previousElementSibling.style.display='none';this.previousElementSibling.style.display='none';this.style.display='none'"> see less</span>`;
}

function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function createToast(message, type) {
  type = type || 'success';
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:center;';
    document.body.appendChild(el);
    return el;
  })();
  const toast = document.createElement('div');
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const bgColors = { success: '#057642', error: '#b24020', info: '#0a66c2', warning: '#b45309' };
  toast.style.cssText = `background:${bgColors[type]};color:white;padding:12px 20px;border-radius:4px;font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;min-width:200px;max-width:400px;`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function openModal(content, title) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;';
  overlay.innerHTML = `<div class="modal-box" style="background:var(--white);border-radius:8px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--white);">
      <h2 style="font-size:20px;font-weight:600;margin:0;color:var(--text);">${escapeHtml(title||'')}</h2>
      <button onclick="closeModal()" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text-2);padding:4px;line-height:1;">&times;</button>
    </div>
    <div style="padding:20px;background:var(--white);color:var(--text);">${content}</div>
  </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) { overlay.remove(); document.body.style.overflow = ''; }
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(el => el.remove());
  document.querySelectorAll('.dropdown-open').forEach(el => el.classList.remove('dropdown-open'));
}

// ============================================================
// APP STATE & ROUTER
// ============================================================
const App = {
  state: {
    currentPage: 'feed',
    currentUser: null,
    searchQuery: '',
    likedPosts: new Set(),
    savedJobs: new Set(),
    connections: new Set(),
    following: new Set(),
    notifications: [],
    unreadMessages: 0,
    unreadNotifications: 0,
    darkMode: false,
    feedPosts: [],
    feedPage: 0,
    activeTab: {},
    expandedSections: new Set(),
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      publicProfile: true,
      showConnections: true,
      openToWork: false,
      twoFactor: false,
    },
    messageGuide: {}
  },

  init() {
    const data = window.LinkedInData;
    if (data) {
      this.state.currentUser = data.currentUser || data.users?.[0] || { id: 1, name: 'Alex Johnson', headline: 'Software Engineer', connections: 847, profileViews: 124, postImpressions: 2341 };
      this.state.feedPosts = [...(data.posts || [])];
      this.state.notifications = [...(data.notifications || [])];
      this.state.unreadMessages = data.conversations?.reduce((a, c) => a + (c.unreadCount || c.unread || 0), 0) || 3;
      this.state.unreadNotifications = data.notifications?.filter(n => !n.isRead && !n.read).length || 5;
    } else {
      this.state.currentUser = { id: 1, name: 'Alex Johnson', headline: 'Software Engineer at TechCorp', location: 'New York, NY', connections: 847, profileViews: 124, postImpressions: 2341, avatar: null };
      this.state.feedPosts = App._generateSamplePosts();
      this.state.unreadMessages = 3;
      this.state.unreadNotifications = 5;
    }
    // Restore dark mode preference
    try {
      if (localStorage.getItem('li-dark-mode') === '1') {
        this.state.darkMode = true;
        document.body.classList.add('dark-mode');
      }
    } catch(e) { /* ignore */ }
    this._renderNav();
    this._initStaticNav();
    this._setupRouting();
    this._setupGlobalListeners();
    window.addEventListener('hashchange', () => this._handleRoute());
    this._handleRoute();
  },

  _initStaticNav() {
    const u = this.state.currentUser;
    // Update avatar in static nav
    const avatarEl = document.getElementById('nav-avatar');
    if (avatarEl) avatarEl.innerHTML = generateAvatar(u.name, 24, u.avatarColor);
    // Update Me dropdown header
    const ddAvatar = document.getElementById('me-dd-avatar');
    if (ddAvatar) ddAvatar.innerHTML = generateAvatar(u.name, 56, u.avatarColor);
    const ddName = document.getElementById('me-dd-name');
    if (ddName) ddName.textContent = u.name;
    const ddHeadline = document.getElementById('me-dd-headline');
    if (ddHeadline) ddHeadline.textContent = (u.headline || '').split('|')[0].trim();
    // Update post modal avatar/name
    const postAvatar = document.getElementById('post-modal-avatar');
    if (postAvatar) postAvatar.innerHTML = generateAvatar(u.name, 48, u.avatarColor);
    const postName = document.getElementById('post-modal-name');
    if (postName) postName.textContent = u.name;
    // Update message badge
    const msgBadge = document.getElementById('msg-badge');
    if (msgBadge) {
      if (this.state.unreadMessages > 0) { msgBadge.textContent = this.state.unreadMessages; msgBadge.style.display = ''; }
      else { msgBadge.style.display = 'none'; }
    }
    // Update notification badge
    const notifBadge = document.getElementById('notif-badge');
    if (notifBadge) {
      if (this.state.unreadNotifications > 0) { notifBadge.textContent = this.state.unreadNotifications; notifBadge.style.display = ''; }
      else { notifBadge.style.display = 'none'; }
    }
  },

  _generateSamplePosts() {
    const now = Date.now();
    return [
      { id: 1, authorId: 2, authorName: 'Sarah Chen', authorHeadline: 'Product Manager at Google', content: 'Excited to share that I just got promoted to Senior PM! Grateful for the amazing team and mentors who supported me on this journey. 🚀', reactions: { like: 234, celebrate: 89, support: 12 }, comments: [{ id: 1, authorName: 'Mike Ross', content: 'Congratulations Sarah! Well deserved!', time: now - 3600000 }], reposts: 15, timestamp: now - 7200000, image: null },
      { id: 2, authorId: 3, authorName: 'Marcus Williams', authorHeadline: 'CTO at StartupXYZ', content: 'Hot take: The best engineers I\'ve worked with all share one trait — they obsess over the problem, not the solution. Technology is just a means to an end. Build for users, not for your portfolio.\n\nWhat traits do you value most in engineers?', reactions: { like: 1847, celebrate: 203, insightful: 412 }, comments: [], reposts: 287, timestamp: now - 86400000 },
      { id: 3, authorId: 4, authorName: 'Priya Patel', authorHeadline: 'Data Scientist | AI/ML Enthusiast', content: 'Just published my deep dive into transformer architectures. After 6 months of research, here are the 5 key insights that every ML engineer should know...', reactions: { like: 523, insightful: 198 }, comments: [], reposts: 94, timestamp: now - 172800000 },
      { id: 4, authorId: 5, authorName: 'James O\'Brien', authorHeadline: 'Recruiting Director at Meta', content: 'We\'re hiring! Looking for passionate engineers who want to shape the future of social technology. Remote-friendly, competitive comp, amazing team culture. DM me or check the link below.', reactions: { like: 89, celebrate: 34 }, comments: [], reposts: 45, timestamp: now - 259200000 },
      { id: 5, authorId: 6, authorName: 'LinkedIn News', authorHeadline: 'Official LinkedIn', content: 'The job market is shifting. Here are the top 10 skills employers are looking for in 2026:\n\n1. AI/ML literacy\n2. Data analysis\n3. Cloud architecture\n4. Cybersecurity\n5. Product thinking\n6. Communication\n7. Adaptability\n8. Leadership\n9. Python/JavaScript\n10. Systems design', reactions: { like: 4521, insightful: 987 }, comments: [], reposts: 1203, timestamp: now - 345600000 }
    ];
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  _handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'feed';
    const parts = hash.split('/');
    const page = parts[0];
    const param = parts[1] || null;
    this.state.currentPage = page;
    this._updateNavActive(page);
    this.render(page, param);
  },

  render(page, param) {
    const root = document.getElementById('app-root');
    if (!root) return;
    let html = '';
    switch(page) {
      case 'feed': html = renderFeed(); break;
      case 'profile': html = renderProfile(param); break;
      case 'network': html = renderNetwork(); break;
      case 'jobs': html = renderJobs(); break;
      case 'job': html = renderJobDetail(param); break;
      case 'messaging': html = renderMessaging(param); break;
      case 'notifications': html = renderNotifications(); break;
      case 'search': html = renderSearch(App.state.searchQuery); break;
      case 'company': html = renderCompany(param); break;
      case 'settings': html = renderSettings(param); break;
      case 'learning': html = renderLearning(); break;
      case 'events': html = renderEvents(); break;
      case 'groups': html = renderGroups(); break;
      case 'group': html = renderGroup(param); break;
      case 'premium': html = renderPremium(); break;
      default: html = renderFeed();
    }
    root.innerHTML = html;
    root.scrollTop = 0;
    if (page === 'feed') _initFeedInteractions();
    if (page === 'messaging') {
      // Auto-select first conv if no param
      const convId = param || (window.LinkedInData?.conversations?.[0]?.id) || 1;
      _initMessagingScroll(convId);
    }
  },

  _renderNav() {
    const nav = document.getElementById('global-nav');
    if (!nav) return;
    const u = this.state.currentUser;
    const msgCount = this.state.unreadMessages;
    const notifCount = this.state.unreadNotifications;
    nav.innerHTML = `
    <div class="nav-inner">
      <div class="nav-left">
        <a href="#feed" class="nav-logo" title="LinkedIn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34" fill="var(--blue)"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <div class="nav-search-wrap">
          <svg class="nav-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M14.56 12.44L11.3 9.18a5.51 5.51 0 10-2.12 2.12l3.26 3.26a1.5 1.5 0 102.12-2.12zM3 6.5a3.5 3.5 0 113.5 3.5A3.5 3.5 0 013 6.5z" fill="currentColor"/></svg>
          <input type="text" id="nav-search" placeholder="Search" autocomplete="off" value="${escapeHtml(this.state.searchQuery)}" onkeydown="App._handleSearchKey(event)" oninput="App._handleSearchInput(this.value)"/>
          <div id="search-suggestions" class="search-suggestions"></div>
        </div>
      </div>
      <nav class="nav-links">
        <a href="#feed" class="nav-link" data-page="feed" title="Home">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M23 9.01L12.56 1.22a.91.91 0 00-1.12 0L1 9.01v13.99h8v-8h6v8h8V9.01z" fill="currentColor"/></svg>
          <span>Home</span>
        </a>
        <a href="#network" class="nav-link" data-page="network" title="My Network">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/></svg>
          <span>My Network</span>
        </a>
        <a href="#jobs" class="nav-link" data-page="jobs" title="Jobs">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M17 6V5a3 3 0 00-3-3h-4a3 3 0 00-3 3v1H2v4a3 3 0 003 3h14a3 3 0 003-3V6h-5zm-8-1a1 1 0 011-1h4a1 1 0 011 1v1H9V5zm-7 9v5a3 3 0 003 3h14a3 3 0 003-3v-5a5 5 0 01-5 2H5a5 5 0 01-5-2z" fill="currentColor"/></svg>
          <span>Jobs</span>
        </a>
        <a href="#messaging" class="nav-link nav-link-badge" data-page="messaging" title="Messaging">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M16 4H8a7 7 0 000 14h4l4 4v-4a7 7 0 000-14z" fill="currentColor"/></svg>
          ${msgCount > 0 ? `<span class="nav-badge">${msgCount}</span>` : ''}
          <span>Messaging</span>
        </a>
        <a href="#notifications" class="nav-link nav-link-badge" data-page="notifications" title="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 00-5-5.91V4a1 1 0 00-2 0v1.09A6 6 0 006 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg>
          ${notifCount > 0 ? `<span class="nav-badge">${notifCount}</span>` : ''}
          <span>Notifications</span>
        </a>
        <div class="nav-link nav-me-wrap" id="nav-me-btn" onclick="App._toggleMeDropdown(event)">
          <div class="nav-avatar-sm">${generateAvatar(u.name, 24, u.avatarColor)}</div>
          <span>Me <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12"><path d="M8 11L3 6h10z" fill="currentColor"/></svg></span>
        </div>
        <div class="nav-link nav-me-wrap" id="nav-work-btn" onclick="App._toggleWorkDropdown(event)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M4 4a2 2 0 00-2 2v3h20V6a2 2 0 00-2-2H4zm18 7H2v7a2 2 0 002 2h16a2 2 0 002-2v-7z" fill="currentColor"/></svg>
          <span>For Business <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12"><path d="M8 11L3 6h10z" fill="currentColor"/></svg></span>
        </div>
        <a href="#premium" class="nav-premium-link">Try Premium</a>
      </nav>
    </div>`;
  },

  _setupRouting() {
    document.addEventListener('click', e => {
      const link = e.target.closest('[data-nav]');
      if (link) {
        e.preventDefault();
        const target = link.getAttribute('data-nav');
        window.location.hash = target;
      }
    });
  },

  _setupGlobalListeners() {
    document.addEventListener('click', e => {
      if (!e.target.closest('#nav-me-btn') && !e.target.closest('#me-dropdown') &&
          !e.target.closest('#nav-work-btn') && !e.target.closest('#work-dropdown')) {
        closeAllDropdowns();
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeModal(); closeAllDropdowns(); }
    });
    // Scroll-to-top button
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.title = 'Back to top';
    scrollBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>`;
    scrollBtn.style.cssText = 'position:fixed;bottom:72px;right:20px;background:var(--blue);color:white;border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.25);z-index:5000;transition:opacity 0.2s,transform 0.2s;';
    scrollBtn.onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); document.getElementById('app-root')?.scrollTo({ top: 0, behavior: 'smooth' }); };
    document.body.appendChild(scrollBtn);
    window.addEventListener('scroll', debounce(() => {
      if (App.state.currentPage === 'feed') _loadMorePosts();
      const show = window.scrollY > 400;
      scrollBtn.style.display = show ? 'flex' : 'none';
      scrollBtn.style.opacity = show ? '1' : '0';
    }, 150));
    document.getElementById('app-root')?.addEventListener('scroll', debounce(function() {
      const show = this.scrollTop > 400;
      scrollBtn.style.display = show ? 'flex' : 'none';
    }, 150));
  },

  _updateNavActive(page) {
    // Dynamic nav (data-page)
    document.querySelectorAll('.nav-link[data-page]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-page') === page);
    });
    // app.html static nav (id="nav-{page}", class li-nav__item)
    document.querySelectorAll('.li-nav__item').forEach(el => el.classList.remove('active'));
    const staticItem = document.getElementById('nav-' + page);
    if (staticItem) staticItem.classList.add('active');
    // mobile nav
    document.querySelectorAll('.li-mobile-nav-item').forEach((el, i) => {
      const pages = ['feed','network','','notifications','profile'];
      el.classList.toggle('active', pages[i] === page);
    });
  },

  _handleSearchKey(e) {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) { App.state.searchQuery = q; window.location.hash = 'search'; }
      document.getElementById('search-suggestions').innerHTML = '';
    }
  },

  _handleSearchInput: debounce(function(val) {
    App.state.searchQuery = val;
    const sugg = document.getElementById('search-suggestions');
    if (!sugg) return;
    if (!val.trim()) { sugg.innerHTML = ''; return; }
    const data = window.LinkedInData;
    const results = [];
    if (data?.users) data.users.filter(u => u.name.toLowerCase().includes(val.toLowerCase())).slice(0,3).forEach(u => results.push(`<div class="sugg-item" onclick="App.state.searchQuery='${escapeHtml(u.name)}';window.location.hash='search'"><span class="sugg-icon">👤</span>${escapeHtml(u.name)}</div>`));
    if (data?.jobs) data.jobs.filter(j => j.title.toLowerCase().includes(val.toLowerCase())).slice(0,2).forEach(j => results.push(`<div class="sugg-item" onclick="window.location.hash='job/${j.id}'"><span class="sugg-icon">💼</span>${escapeHtml(j.title)}</div>`));
    results.push(`<div class="sugg-item sugg-search-all" onclick="App.state.searchQuery='${escapeHtml(val)}';window.location.hash='search'"><span class="sugg-icon">🔍</span>Search for "${escapeHtml(val)}"</div>`);
    sugg.innerHTML = results.join('');
  }, 300),

  _toggleMeDropdown(e) {
    e.stopPropagation();
    const existing = document.getElementById('me-dropdown');
    if (existing) { existing.remove(); return; }
    closeAllDropdowns();
    const u = App.state.currentUser;
    const dropdown = document.createElement('div');
    dropdown.id = 'me-dropdown';
    dropdown.className = 'dropdown-menu';
    dropdown.style.cssText = 'position:fixed;top:52px;right:160px;background:var(--white);border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.2);min-width:240px;z-index:9000;border:1px solid var(--border);';
    dropdown.innerHTML = `
      <div style="padding:16px;border-bottom:1px solid var(--border);">
        <div style="display:flex;gap:12px;align-items:center;">
          <div style="overflow:hidden;border-radius:50%;">${generateAvatar(u.name, 56, u.avatarColor)}</div>
          <div>
            <div style="font-weight:700;font-size:15px;">${escapeHtml(u.name)}</div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.3;">${escapeHtml((u.headline||'').slice(0,50))}${(u.headline||'').length>50?'...':''}</div>
          </div>
        </div>
        <a href="#profile" onclick="closeAllDropdowns()" style="display:block;margin-top:12px;text-align:center;border:1px solid var(--blue);color:var(--blue);border-radius:16px;padding:6px;font-size:14px;font-weight:600;text-decoration:none;">View Profile</a>
      </div>
      <div style="padding:8px 0;">
        <div style="padding:4px 16px;font-size:12px;font-weight:600;color:var(--text-2);">Account</div>
        <a href="#settings" onclick="closeAllDropdowns()" style="display:block;padding:8px 16px;font-size:14px;color:var(--text);text-decoration:none;">Settings &amp; Privacy</a>
        <a href="#premium" onclick="closeAllDropdowns()" style="display:block;padding:8px 16px;font-size:14px;color:var(--text);text-decoration:none;">Try Premium for free</a>
      </div>
      <div style="padding:8px 0;border-top:1px solid var(--border);">
        <div style="padding:4px 16px;font-size:12px;font-weight:600;color:var(--text-2);">Manage</div>
        <a href="#groups" onclick="closeAllDropdowns()" style="display:block;padding:8px 16px;font-size:14px;color:var(--text);text-decoration:none;">Groups</a>
        <a href="#events" onclick="closeAllDropdowns()" style="display:block;padding:8px 16px;font-size:14px;color:var(--text);text-decoration:none;">Events</a>
        <a href="#learning" onclick="closeAllDropdowns()" style="display:block;padding:8px 16px;font-size:14px;color:var(--text);text-decoration:none;">Learning</a>
      </div>
      <div style="padding:8px 16px;border-top:1px solid var(--border);">
        <a href="#" onclick="createToast('Signed out!','info');closeAllDropdowns();return false;" style="display:block;font-size:14px;color:var(--text);text-decoration:none;">Sign Out</a>
      </div>`;
    document.body.appendChild(dropdown);
  },

  _toggleWorkDropdown(e) {
    e.stopPropagation();
    const existing = document.getElementById('work-dropdown');
    if (existing) { existing.remove(); return; }
    closeAllDropdowns();
    const dropdown = document.createElement('div');
    dropdown.id = 'work-dropdown';
    dropdown.className = 'dropdown-menu';
    dropdown.style.cssText = 'position:fixed;top:52px;right:80px;background:var(--white);border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.2);min-width:280px;z-index:9000;border:1px solid var(--border);padding:16px;';
    const items = [['learning','🎓','Learning'],['events','📅','Events'],['groups','👥','Groups'],['company/1','🏢','Pages'],['premium','⭐','Premium']];
    dropdown.innerHTML = `<div style="font-size:14px;font-weight:600;margin-bottom:12px;">Explore</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${items.map(([href,icon,label]) => `<a href="#${href}" onclick="closeAllDropdowns()" style="display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--border);border-radius:6px;text-decoration:none;color:var(--text);font-size:13px;"><span>${icon}</span><span>${label}</span></a>`).join('')}
      </div>`;
    document.body.appendChild(dropdown);
  },

  // ── Modal helpers for app.html static modals ─────────────────
  openModal(id) {
    const overlay = document.getElementById(id + '-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Reset apply modal to step 1 each time it's opened
    if (id === 'apply-modal') {
      this._applyCurrentStep = 1;
      document.querySelectorAll('.li-apply-step').forEach((el, i) => {
        el.classList.toggle('active', i === 0);
      });
      document.querySelectorAll('.li-apply-dot').forEach(el => el.classList.remove('done'));
      const backBtn = document.getElementById('apply-back-btn');
      const nextBtn = document.getElementById('apply-next-btn');
      if (backBtn) backBtn.style.display = 'none';
      if (nextBtn) nextBtn.textContent = 'Next';
      // Clear text inputs (not selects/checkboxes which might be intentional)
      overlay.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], textarea').forEach(el => { el.value = ''; });
    }
  },

  closeModal(id) {
    if (id) {
      const overlay = document.getElementById(id + '-overlay');
      if (overlay) overlay.style.display = 'none';
    } else {
      document.querySelectorAll('[id$="-overlay"]').forEach(el => { if (el.classList.contains('li-modal-overlay')) el.style.display = 'none'; });
    }
    document.body.style.overflow = '';
  },

  toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('open') || dropdown.style.display === 'block';
    // close others first
    document.querySelectorAll('.li-dropdown.open').forEach(d => { d.classList.remove('open'); d.style.display = ''; });
    if (!isOpen) { dropdown.classList.add('open'); dropdown.style.display = 'block'; }
  },

  closeAllDropdowns() {
    document.querySelectorAll('.li-dropdown').forEach(d => { d.classList.remove('open'); d.style.display = ''; });
    document.querySelectorAll('.dropdown-menu').forEach(el => el.remove());
  },

  showToast(msg, type) { createToast(msg, type || 'info'); },

  onSearchInput(val) {
    this.state.searchQuery = val;
  },

  updatePostCharCount() {
    const textarea = document.getElementById('post-textarea');
    const counter = document.getElementById('post-char-count');
    if (textarea && counter) counter.textContent = `${textarea.value.length} / 3000`;
  },

  submitPost() {
    const textarea = document.getElementById('post-textarea');
    if (!textarea || !textarea.value.trim()) { createToast('Please write something first!', 'warning'); return; }
    const u = this.state.currentUser;
    const newPost = {
      id: Date.now(), authorId: u.id, authorName: u.name, authorHeadline: u.headline || '',
      content: textarea.value.trim(), reactions: { like: 0 }, comments: [], reposts: 0, timestamp: Date.now()
    };
    this.state.feedPosts.unshift(newPost);
    this.closeModal('post-modal');
    createToast('Post shared successfully!', 'success');
    if (this.state.currentPage === 'feed') {
      const feedPosts = document.getElementById('feed-posts');
      if (feedPosts) feedPosts.insertAdjacentHTML('afterbegin', renderPostCard(newPost));
    }
  },

  saveProfileEdit() {
    const firstName = document.getElementById('edit-firstname')?.value?.trim();
    const lastName = document.getElementById('edit-lastname')?.value?.trim();
    const headline = document.getElementById('edit-headline')?.value?.trim();
    if (firstName) this.state.currentUser.firstName = firstName;
    if (lastName) this.state.currentUser.lastName = lastName;
    if (firstName && lastName) this.state.currentUser.name = `${firstName} ${lastName}`;
    if (headline !== undefined) this.state.currentUser.headline = headline;
    this.closeModal('edit-profile-modal');
    createToast('Profile updated!', 'success');
    this.render('profile', null);
  },

  sendConnectionRequest() {
    this.closeModal('connect-modal');
    createToast('Connection request sent!', 'success');
  },

  repostNow() {
    this.closeModal('share-modal');
    createToast('Reposted to your feed!', 'success');
  },

  repostWithThoughts() {
    this.closeModal('share-modal');
    this.openModal('post-modal');
  },

  copyLink() {
    this.closeModal('share-modal');
    createToast('Link copied to clipboard!', 'success');
  },

  _applyCurrentStep: 1,

  applyStepNext() {
    const current = this._applyCurrentStep;
    if (current < 3) {
      document.getElementById('apply-step-' + current)?.classList.remove('active');
      document.getElementById('apply-step-' + (current + 1))?.classList.add('active');
      const dots = document.querySelectorAll('.li-apply-dot');
      if (dots[current]) dots[current].classList.add('done');
      this._applyCurrentStep = current + 1;
      const backBtn = document.getElementById('apply-back-btn');
      const nextBtn = document.getElementById('apply-next-btn');
      if (backBtn) backBtn.style.display = '';
      if (nextBtn) nextBtn.textContent = current + 1 === 3 ? 'Submit' : 'Next';
    } else {
      this.closeModal('apply-modal');
      this._applyCurrentStep = 1;
      createToast('Application submitted! Good luck!', 'success');
    }
  },

  applyStepBack() {
    const current = this._applyCurrentStep;
    if (current > 1) {
      document.getElementById('apply-step-' + current)?.classList.remove('active');
      document.getElementById('apply-step-' + (current - 1))?.classList.add('active');
      const dots = document.querySelectorAll('.li-apply-dot');
      if (dots[current - 1]) dots[current - 1].classList.remove('done');
      this._applyCurrentStep = current - 1;
      const backBtn = document.getElementById('apply-back-btn');
      const nextBtn = document.getElementById('apply-next-btn');
      if (current - 1 === 1 && backBtn) backBtn.style.display = 'none';
      if (nextBtn) nextBtn.textContent = 'Next';
    }
  },

  showToast(msg, type) {
    createToast(msg, type || 'info');
  },

  // Alias used by static nav in app.html — shows suggestions in #nav-suggestions
  onSearchInput: debounce(function(val) {
    App.state.searchQuery = val;
    const sugg = document.getElementById('nav-suggestions');
    if (!sugg) return;
    if (!val.trim()) { sugg.innerHTML = ''; sugg.style.display = 'none'; return; }
    const data = window.LinkedInData;
    const results = [];
    if (data?.users) data.users.filter(u => u.name.toLowerCase().includes(val.toLowerCase())).slice(0, 3).forEach(u =>
      results.push(`<div class="sugg-item" onclick="App.state.searchQuery='${escapeHtml(u.name)}';window.location.hash='search';document.getElementById('nav-suggestions').style.display='none'"><span class="sugg-icon">👤</span>${escapeHtml(u.name)}<span style="font-size:11px;color:var(--text-3);margin-left:auto;">${escapeHtml((u.headline||'').slice(0,30))}</span></div>`)
    );
    if (data?.jobs) data.jobs.filter(j => j.title.toLowerCase().includes(val.toLowerCase())).slice(0, 2).forEach(j =>
      results.push(`<div class="sugg-item" onclick="window.location.hash='job/${j.id}';document.getElementById('nav-suggestions').style.display='none'"><span class="sugg-icon">💼</span>${escapeHtml(j.title)}</div>`)
    );
    results.push(`<div class="sugg-item sugg-search-all" onclick="App.state.searchQuery='${escapeHtml(val)}';window.location.hash='search';document.getElementById('nav-suggestions').style.display='none'"><span class="sugg-icon">🔍</span>Search for &ldquo;${escapeHtml(val)}&rdquo;</div>`);
    sugg.innerHTML = results.join('');
    sugg.style.display = 'block';
  }, 250)
};

// ============================================================
// FEED PAGE
// ============================================================
function renderFeed() {
  const u = App.state.currentUser;
  const posts = App.state.feedPosts.slice(0, 5);
  return `
  <div class="li-page-inner">
    <!-- LEFT SIDEBAR -->
    <aside class="li-sidebar-left">
      <!-- Profile card -->
      <div class="li-card" style="overflow:hidden;">
        <div class="li-profile-card__banner" style="background:${u.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};">
          <div class="li-profile-card__photo" style="background:transparent;overflow:hidden;${u.openToWork?'box-shadow:0 0 0 3px var(--green),0 0 0 6px var(--white) inset;':''} ">
            ${generateAvatar(u.name, 72, u.avatarColor)}
          </div>
        </div>
        <div class="li-profile-card__info">
          <a href="#profile" class="li-profile-card__name">${escapeHtml(u.name)}</a>
          ${u.isPremium ? `<span style="background:var(--premium-gold);color:white;font-size:9px;font-weight:700;padding:1px 5px;border-radius:2px;margin-left:4px;vertical-align:middle;">IN</span>` : ''}
          <div class="li-profile-card__headline">${escapeHtml((u.headline||'').split('|')[0].trim())}</div>
          ${u.location ? `<div style="font-size:12px;color:var(--text-2);margin-top:2px;">${escapeHtml(u.location)}</div>` : ''}
        </div>
        <div class="li-profile-card__stats">
          <div class="li-profile-card__stat" onclick="App.navigate('profile')">
            <span>Profile viewers</span>
            <span class="li-profile-card__stat-value" style="color:var(--blue);">${formatNumber(u.profileViews||0)}</span>
          </div>
          <div class="li-profile-card__stat" onclick="App.navigate('profile')">
            <span>Post impressions</span>
            <span class="li-profile-card__stat-value" style="color:var(--blue);">${formatNumber(u.postImpressions||0)}</span>
          </div>
        </div>
        <div class="li-profile-card__premium" onclick="App.navigate('premium')">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="var(--premium-gold)"><path d="M8 1L10 6H15L11 9.5L12.5 15L8 12L3.5 15L5 9.5L1 6H6L8 1Z"/></svg>
          <span>Try <b>Premium</b> for free</span>
        </div>
        <div class="li-profile-card__links">
          <div class="li-profile-card__link" onclick="createToast('Saved items','info')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            Saved items
          </div>
          <div class="li-profile-card__link" onclick="App.navigate('groups')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            Groups
          </div>
          <div class="li-profile-card__link" onclick="App.navigate('events')">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Events
          </div>
        </div>
        <div style="padding:10px 16px;border-top:1px solid var(--border);">
          <div style="font-size:11px;font-weight:600;color:var(--text-2);margin-bottom:8px;letter-spacing:.5px;">RECENT</div>
          ${_recentItems()}
          <div style="font-size:11px;font-weight:600;color:var(--text-2);margin:12px 0 8px;letter-spacing:.5px;">GROUPS</div>
          ${_groupItems()}
        </div>
        <div style="padding:8px 16px;border-top:1px solid var(--border);">
          <a href="#network" style="font-size:12px;color:var(--text-2);text-decoration:none;display:flex;align-items:center;gap:4px;font-weight:600;">Discover more <span>›</span></a>
        </div>
      </div>
    </aside>

    <!-- CENTER FEED -->
    <main class="li-main-col">
      <!-- Post Creator -->
      <div class="li-card">
        <div class="li-post-creator">
          <div class="li-post-creator__top">
            <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;flex-shrink:0;cursor:pointer;" onclick="App.navigate('profile')">${generateAvatar(u.name, 48, u.avatarColor)}</div>
            <button class="li-post-creator__trigger" onclick="openPostModal()">Start a post</button>
          </div>
          <div class="li-post-creator__actions">
            <button class="li-post-creator__action" onclick="openPostModal()">
              <svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#378fe9" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#378fe9"/><path d="M21 15l-5-5L5 21" fill="none" stroke="#378fe9" stroke-width="2"/></svg>
              <span style="color:#378fe9;">Photo</span>
            </button>
            <button class="li-post-creator__action" onclick="openPostModal()">
              <svg viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="#5f9b41" stroke-width="2"/><polygon points="10,8 16,12 10,16" fill="#5f9b41"/></svg>
              <span style="color:#5f9b41;">Video</span>
            </button>
            <button class="li-post-creator__action" onclick="App.navigate('events')">
              <svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="6" width="18" height="14" rx="2" fill="none" stroke="#e06847" stroke-width="2"/><path d="M3 10h18M8 6V4M16 6V4" stroke="#e06847" stroke-width="2"/></svg>
              <span style="color:#e06847;">Event</span>
            </button>
            <button class="li-post-creator__action" onclick="openPostModal()">
              <svg viewBox="0 0 24 24" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="none" stroke="#e06847" stroke-width="2"/><polyline points="14,2 14,8 20,8" stroke="#e06847" stroke-width="2" fill="none"/></svg>
              <span style="color:#e06847;">Write article</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sort bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 12px;background:var(--white);border-radius:8px;box-shadow:var(--shadow-sm);margin-bottom:4px;">
        <span style="font-size:13px;color:var(--text-2);font-weight:400;">Sort by:</span>
        <div style="display:flex;gap:4px;background:var(--bg);border-radius:16px;padding:3px;">
          ${['Top','Recent'].map(s => {
            const sortState = App.state.feedSort || 'Top';
            const isActive = s === sortState;
            return `<button id="sort-btn-${s}" onclick="switchFeedSort('${s}', this)" class="feed-sort-pill ${isActive?'active':''}" style="padding:4px 14px;border-radius:12px;border:none;background:${isActive?'var(--blue)':'transparent'};color:${isActive?'white':'var(--text-2)'};font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;">${s}</button>`;
          }).join('')}
        </div>
      </div>

      <div id="feed-posts">
        ${posts.map((p, i) => renderPostCard(p) + (i === 1 ? _renderSponsoredPost(0) : i === 3 ? _renderSponsoredPost(1) : '')).join('')}
      </div>
      <div id="feed-loader" style="text-align:center;padding:20px;color:var(--text-2);font-size:14px;">
        <div class="spinner"></div> Loading more posts...
      </div>
    </main>

    <!-- RIGHT SIDEBAR -->
    <aside class="li-sidebar-right">
      <!-- LinkedIn News -->
      <div class="li-card">
        <div class="li-news-card__header">
          LinkedIn News
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="cursor:pointer;" onclick="createToast('News info','info')"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div style="padding:0 0 8px;">
          <div style="font-size:12px;font-weight:600;color:var(--text-2);padding:0 16px 8px;">Top stories</div>
          ${_linkedInNews()}
        </div>
        <div class="li-news-show-more" onclick="createToast('Loading more news...','info')">
          Show more <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      <!-- People you may know -->
      <div class="li-card" style="margin-top:0;">
        <div style="padding:12px 16px 8px;font-size:16px;font-weight:700;">People you may know</div>
        ${_peopleAlsoViewed()}
        <div style="padding:8px 16px;font-size:13px;font-weight:600;color:var(--text-2);cursor:pointer;text-align:center;display:flex;align-items:center;justify-content:center;gap:4px;" onclick="App.navigate('network')">View all recommendations <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 12l4-4-4-4"/></svg></div>
      </div>

      <!-- Add to your feed -->
      <div class="li-card">
        <div style="padding:12px 16px 8px;font-size:16px;font-weight:700;">Add to your feed</div>
        ${_feedSuggestions()}
        <div style="padding:8px 16px;font-size:13px;font-weight:600;color:var(--text-2);cursor:pointer;display:flex;align-items:center;gap:4px;" onclick="createToast('Showing more suggestions','info')">View more recommendations <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 12l4-4-4-4"/></svg></div>
      </div>

      <!-- Trending hashtags -->
      <div class="li-card" style="padding:16px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
          <span style="font-size:16px;">🔥</span> Trending for you
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${['#ai','#javascript','#webdev','#career','#leadership','#opentowork','#startup','#remotework','#python','#ux'].map(tag =>
            `<button onclick="App.state.searchQuery='${tag}';App.navigate('search')" style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:4px 12px;font-size:12px;font-weight:600;color:var(--blue);cursor:pointer;transition:background 0.15s;" onmouseenter="this.style.background='var(--blue-light)'" onmouseleave="this.style.background='var(--bg)'">${tag}</button>`
          ).join('')}
        </div>
      </div>

      <!-- Footer links -->
      <div style="padding:8px 16px 20px;font-size:11px;color:var(--text-2);line-height:2.2;">
        ${['About','Accessibility','Help Center','Privacy & Terms','Ad Choices','Business Services','Get the LinkedIn app'].map(l =>
          `<a href="#" style="color:var(--text-2);text-decoration:none;margin-right:8px;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${l}</a>`
        ).join('')}
        <div style="margin-top:10px;display:flex;align-items:center;gap:6px;color:var(--text-2);">
          <svg viewBox="0 0 84 21" width="52" height="13"><path d="M0 0h21v21H0z" fill="#0A66C2"/><path d="M4.5 9h3v8h-3V9zm1.5-4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM9.5 9h2.9v1.1h.04C12.85 9.4 13.9 9 15.1 9c2.7 0 3.2 1.8 3.2 4.1V17h-3v-3.4c0-1.1-.02-2.5-1.5-2.5-1.5 0-1.7 1.2-1.7 2.4V17h-3V9z" fill="white"/></svg>
          <span>LinkedIn Corporation © 2026</span>
        </div>
      </div>
    </aside>
  </div>`;
}

function _renderSponsoredPost(idx) {
  const ads = [
    {
      company: 'Stripe',
      logo: '🟦',
      tagline: 'Build the future of payments.',
      cta: 'Learn more',
      img: 'linear-gradient(135deg,#635bff,#32325d)',
      desc: 'Join 1M+ businesses using Stripe to accept payments, send payouts, and manage revenue online.',
    },
    {
      company: 'Figma',
      logo: '🎨',
      tagline: 'Design, prototype, and collaborate—all in one place.',
      cta: 'Try for free',
      img: 'linear-gradient(135deg,#f24e1e,#ff7262)',
      desc: 'The collaborative interface design tool that teams love. Start designing faster today.',
    },
  ];
  const ad = ads[idx % ads.length];
  return `<div class="li-card li-post" style="margin-bottom:4px;">
    <div class="li-post__header" style="align-items:flex-start;">
      <div style="width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;background:var(--bg);border:1px solid var(--border);flex-shrink:0;">${ad.logo}</div>
      <div style="flex:1;min-width:0;margin-left:10px;">
        <div style="font-weight:700;font-size:14px;color:var(--text);">${ad.company}</div>
        <div style="font-size:12px;color:var(--text-2);">Sponsored</div>
      </div>
      <button onclick="createToast('Hide this ad','info')" class="li-post__options" title="Hide this ad" style="flex-shrink:0;">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    </div>
    <div style="margin:10px 0;font-size:15px;color:var(--text);line-height:1.6;">${ad.desc}</div>
    <div style="height:160px;background:${ad.img};border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;overflow:hidden;">
      <div style="text-align:center;color:white;padding:20px;">
        <div style="font-size:20px;font-weight:800;margin-bottom:4px;">${ad.tagline}</div>
        <div style="font-size:13px;opacity:.8;">${ad.company}</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border);">
      <div>
        <div style="font-size:14px;font-weight:700;color:var(--text);">${ad.company}</div>
        <div style="font-size:12px;color:var(--text-2);">${ad.tagline}</div>
      </div>
      <button onclick="createToast('Opening ${ad.company}...','info')" style="background:none;border:1.5px solid var(--text-2);color:var(--text);border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s;" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background='none'">${ad.cta}</button>
    </div>
  </div>`;
}

function _recentItems() {
  const data = window.LinkedInData;
  const raw = data?.hashtags || [{name:'javascript'},{name:'webdev'},{name:'ai'},{name:'machinelearning'}];
  return raw.slice(0,4).map(h => {
    const tag = typeof h === 'string' ? h : (h.name || '');
    const label = tag.startsWith('#') ? tag : '#' + tag;
    return `<a href="#search" onclick="App.state.searchQuery='${escapeHtml(label)}';App.navigate('search');return false;" style="font-size:14px;color:var(--text-2);text-decoration:none;display:block;padding:4px 0;">${escapeHtml(label)}</a>`;
  }).join('');
}

function _groupItems() {
  const data = window.LinkedInData;
  const groups = data?.groups || [{id:1,name:'React Developers'},{id:2,name:'AI Enthusiasts'},{id:3,name:'Product Managers'}];
  return groups.filter(g => g.isJoined !== false).slice(0,3).map(g => {
    const name = typeof g === 'string' ? g : (g.name || 'Group');
    const id = g.id || 1;
    return `<a href="#group/${id}" style="font-size:14px;color:var(--text-2);text-decoration:none;display:block;padding:4px 0;">${escapeHtml(name)}</a>`;
  }).join('');
}

function _linkedInNews() {
  const news = window.LinkedInData?.news || [
    { headline: 'Tech layoffs slow as AI demand surges', age: '2h ago', readers: '14,521 readers' },
    { headline: 'Remote work policies shifting again in 2026', age: '4h ago', readers: '8,234 readers' },
    { headline: 'Top skills employers want this year', age: '6h ago', readers: '21,100 readers' },
    { headline: 'Startup funding rebounds strongly', age: '1d ago', readers: '5,892 readers' },
    { headline: 'The rise of the AI product manager', age: '1d ago', readers: '12,304 readers' },
  ];
  return news.slice(0,5).map((n, i) => {
    const title = n.headline || n.title || '';
    const meta = [n.timeAgo || n.age || n.time || '', n.readers || (n.readCount ? formatNumber(n.readCount) + ' readers' : '')].filter(Boolean).join(' · ');
    return `<div class="li-news-item" onclick="createToast('Opening: ${escapeHtml(title.slice(0,30))}...','info')" style="${i === 0 ? 'padding-top:4px;' : ''}">
      <div class="li-news-item__bullet"></div>
      <div style="flex:1;min-width:0;">
        <div class="li-news-item__title" style="line-height:1.4;">${escapeHtml(title)}</div>
        <div class="li-news-item__meta" style="display:flex;align-items:center;gap:4px;margin-top:2px;">
          ${meta ? escapeHtml(meta) : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function _peopleAlsoViewed() {
  const data = window.LinkedInData;
  const users = data?.users?.slice(1,5) || [
    { name:'Emma Davis', headline:'UX Designer at Apple' },
    { name:'Kevin Park', headline:'Backend Engineer at Netflix' },
    { name:'Aisha Johnson', headline:'Marketing Lead at Spotify' }
  ];
  return users.map((u,i) => `<div class="li-suggest-card__item">
    <div class="li-suggest-card__icon" style="overflow:hidden;">${generateAvatar(u.name, 36, u.avatarColor)}</div>
    <div class="li-suggest-card__info">
      <a href="#profile/${u.id||i+2}" class="li-suggest-card__name" style="color:var(--text);text-decoration:none;">${escapeHtml(u.name)}</a>
      <div class="li-suggest-card__sub">${escapeHtml((u.headline||'').split('|')[0].trim())}</div>
    </div>
    <button class="li-follow-btn" onclick="this.classList.toggle('followed');this.textContent=this.classList.contains('followed')?'Following':'+ Follow';createToast('Following '+${JSON.stringify(u.name)},'success')">+ Follow</button>
  </div>`).join('');
}

function _feedSuggestions() {
  const data = window.LinkedInData;
  const companies = data?.companies?.slice(0,4) || [
    { id:1, name:'Google', industry:'Technology', logo:'🔵' },
    { id:2, name:'Meta', industry:'Social Media', logo:'🔷' },
    { id:3, name:'Apple', industry:'Consumer Electronics', logo:'⬛' },
    { id:4, name:'Microsoft', industry:'Software', logo:'🟦' },
  ];
  return companies.map(c => `<div style="display:flex;align-items:center;gap:10px;padding:8px 16px;">
    <div style="width:40px;height:40px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid var(--border);">${c.logo||getInitials(c.name)}</div>
    <div style="flex:1;min-width:0;">
      <a href="#company/${c.id}" style="font-size:14px;font-weight:600;color:var(--text);text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(c.name)}</a>
      <div style="font-size:12px;color:var(--text-2);">${escapeHtml(c.industry||'Company')}</div>
    </div>
    <button onclick="this.textContent=this.textContent==='+ Follow'?'Following':'+ Follow';createToast('Following '+${JSON.stringify(c.name)},'success')" style="flex-shrink:0;border:1px solid var(--blue);color:var(--blue);background:none;border-radius:16px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">+ Follow</button>
  </div>`).join('');
}

function _suggestedHashtags() {
  const tags = ['#javascript','#career','#leadership','#innovation','#startup','#remotework'];
  return tags.map(t => `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <span style="font-size:13px;color:var(--text);">${escapeHtml(t)}</span>
    <button onclick="this.textContent=this.textContent==='Follow'?'Following':'Follow';createToast('Following '+this.previousElementSibling.textContent,'success')" style="border:none;background:none;color:var(--blue);font-size:13px;cursor:pointer;font-weight:600;">Follow</button>
  </div>`).join('');
}

function renderPostCard(post) {
  if (!post) return '';
  // Normalise both data.js format (author object) and fallback format (flat fields)
  const author = post.author || {};
  const authorName = post.authorName || author.name || 'User';
  const authorId = post.authorId || author.id || 2;
  const authorHeadline = post.authorHeadline || author.headline || '';
  const authorColor = author.avatarColor || null;
  const isPremium = author.isPremium || false;
  // comments can be a number (data.js) or an array (fallback)
  const commentsList = Array.isArray(post.commentsList) ? post.commentsList
    : Array.isArray(post.comments) ? post.comments : [];
  const commentCount = typeof post.comments === 'number' ? post.comments : commentsList.length;
  const liked = App.state.likedPosts.has(post.id) || (post.isLiked && !App.state.likedPosts.has('unlike-' + post.id));
  const totalReactions = post.totalReactions || Object.values(post.reactions||{}).reduce((a,b)=>a+b,0);
  const reactionEmojis = { like:'👍', celebrate:'🎉', love:'❤️', support:'🤝', insightful:'💡', curious:'🤔', funny:'😄' };
  const topReactions = Object.entries(post.reactions||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k]) => reactionEmojis[k]||'👍').join('');
  const reactionLabel = liked ? (post.reactionType ? post.reactionType.charAt(0).toUpperCase() + post.reactionType.slice(1) : 'Liked') : 'Like';

  // tags
  const tagsHtml = (post.tags||[]).slice(0,3).map(t => `<a href="#" onclick="App.state.searchQuery='${escapeHtml(t)}';App.navigate('search');return false;" style="font-size:13px;color:var(--blue);text-decoration:none;">#${escapeHtml(t)}</a>`).join(' ');

  return `<div class="li-post" id="post-${post.id}">
    <!-- Header -->
    <div class="li-post__header">
      <a href="#profile/${authorId}" class="li-post__author-photo" style="background:transparent;text-decoration:none;">
        ${authorColor ? generateAvatar(authorName, 48, authorColor) : generateAvatar(authorName, 48)}
      </a>
      <div class="li-post__author-info">
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
          <a href="#profile/${authorId}" class="li-post__author-name">${escapeHtml(authorName)}</a>
          ${isPremium ? `<span style="background:var(--premium-gold);color:white;font-size:9px;font-weight:700;padding:1px 4px;border-radius:2px;">IN</span>` : ''}
          ${App.state.connections.has(String(authorId)) ? `<span style="font-size:12px;color:var(--text-2);font-weight:400;">· 1st</span>` : `<span style="font-size:12px;color:var(--text-2);font-weight:400;">· 2nd</span>`}
        </div>
        <div class="li-post__author-headline">${escapeHtml(authorHeadline)}</div>
        <div class="li-post__meta">
          <span class="li-post__timestamp">${formatTime(post.timestamp)}</span>
          <span class="li-post__privacy">·</span>
          <svg class="li-post__privacy" viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM5 7.5a3 3 0 006 0H5z"/></svg>
        </div>
        ${!App.state.connections.has(String(authorId)) && !App.state.following.has(String(authorId)) ? `<div style="font-size:11px;color:var(--text-2);margin-top:1px;">Suggested</div>` : ''}
      </div>
      <div style="display:flex;gap:4px;align-items:center;flex-shrink:0;">
        ${App.state.connections.has(String(authorId)) ? '' : `<button class="li-btn--follow" onclick="toggleFollow(${authorId}, this)" id="follow-${post.id}-${authorId}" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:5px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">+ Follow</button>`}
        <button class="li-post__options" onclick="openPostMenu(${post.id}, this)" title="More options">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="li-post__body">
      <div class="li-post__text">${truncateText(post.content||'', 280)}</div>
      ${tagsHtml ? `<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">${tagsHtml}</div>` : ''}
    </div>
    ${post.image ? `<img src="${escapeHtml(post.image)}" class="li-post__image" onclick="openImageLightbox('${escapeHtml(post.image)}')" alt="Post image"/>` : ''}

    <!-- Reactions row -->
    ${totalReactions > 0 || commentCount > 0 ? `<div class="li-post__reactions">
      <div style="display:flex;align-items:center;gap:4px;cursor:pointer;" onclick="createToast('Reactions','info')">
        ${topReactions ? `<div class="li-post__reaction-icons">${topReactions.split('').map(e => `<span class="li-post__reaction-emoji">${e}</span>`).join('')}</div>` : ''}
        ${totalReactions > 0 ? `<span class="li-post__reaction-count">${liked ? 'You' + (totalReactions > 1 ? ' and ' + formatNumber(totalReactions - 1) + ' others' : '') : formatNumber(totalReactions)}</span>` : ''}
      </div>
      <div class="li-post__meta-right">
        ${commentCount > 0 ? `<span class="li-post__comments-count" onclick="toggleComments(${post.id})">${formatNumber(commentCount)} comment${commentCount !== 1 ? 's' : ''}</span>` : ''}
        ${post.reposts > 0 ? `<span class="li-post__comments-count">${formatNumber(post.reposts)} reposts</span>` : ''}
      </div>
    </div>` : ''}

    <!-- Action buttons -->
    <div class="li-post__actions">
      <div style="position:relative;flex:1;">
        <button class="li-post__action ${liked?'liked':''}" id="like-btn-${post.id}"
          onclick="toggleLike(${post.id}, this)"
          onmouseenter="showReactionPicker(${post.id}, this)"
          onmouseleave="scheduleHideReactionPicker(${post.id})">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="${liked?'currentColor':'none'}" stroke="currentColor" stroke-width="1.5">
            <path d="M8 10V20H4V10h4zm4-7a1 1 0 011 1v6h5a2 2 0 011.98 2.22l-1 7A2 2 0 0117 21H8V10l2.95-6.55A1 1 0 0112 3z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>${reactionLabel}</span>
        </button>
        <div class="li-reaction-picker" id="reaction-picker-${post.id}" style="display:none;"
          onmouseenter="clearReactionPickerTimer(${post.id})"
          onmouseleave="hideReactionPicker(${post.id})"></div>
      </div>
      <button class="li-post__action" onclick="toggleComments(${post.id})" style="flex:1;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Comment</span>
      </button>
      <button class="li-post__action" onclick="openRepostModal(${post.id})" style="flex:1;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Repost</span>
      </button>
      <button class="li-post__action" onclick="createToast('Link copied!','success')" style="flex:1;">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Send</span>
      </button>
    </div>

    <!-- Comments section (hidden by default) -->
    <div class="li-post__comments" id="comments-${post.id}" style="display:none;">
      <div class="li-post__comment-input-row">
        <div class="li-comment__photo" style="background:transparent;">${generateAvatar(App.state.currentUser.name, 36)}</div>
        <input type="text" placeholder="Add a comment…" class="li-post__comment-input" id="comment-input-${post.id}"
          onkeydown="if(event.key==='Enter')submitComment(${post.id})"/>
      </div>
      ${commentCount > 3 ? `<button style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:13px;font-weight:600;padding:4px 0 8px;display:block;" onclick="createToast('Loading all comments...','info')">View all ${formatNumber(commentCount)} comments</button>` : ''}
      <div id="comment-list-${post.id}">
        ${commentsList.slice(0,3).map(c => {
          const cAuthorName = c.authorName || (c.author && c.author.name) || 'User';
          const cAuthorId = (c.author && c.author.id) || c.authorId || 2;
          const cHeadline = (c.author && c.author.headline) || c.authorHeadline || '';
          const cText = c.text || c.content || '';
          const cLikes = c.likes || 0;
          const cColor = (c.author && c.author.avatarColor) || null;
          return `<div class="li-comment">
            <a href="#profile/${cAuthorId}" style="flex-shrink:0;text-decoration:none;">
              <div class="li-comment__photo" style="background:transparent;">${generateAvatar(cAuthorName, 36, cColor)}</div>
            </a>
            <div style="flex:1;min-width:0;">
              <div class="li-comment__bubble">
                <a href="#profile/${cAuthorId}" class="li-comment__author" style="text-decoration:none;color:inherit;">${escapeHtml(cAuthorName)}</a>
                ${cHeadline ? `<div class="li-comment__headline">${escapeHtml(cHeadline)}</div>` : ''}
                <div class="li-comment__text">${escapeHtml(cText)}</div>
              </div>
              <div class="li-comment__actions">
                ${c.timestamp ? `<span class="li-comment__action" style="cursor:default;color:var(--text-2);">${escapeHtml(c.timestamp)}</span>` : ''}
                <button class="li-comment__action" onclick="createToast('Liked comment!','success')">Like${cLikes > 0 ? ` · <span class="li-comment__like-count">${formatNumber(cLikes)}</span>` : ''}</button>
                <button class="li-comment__action" onclick="createToast('Replying...','info')">Reply</button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

function openPostMenu(_postId, btn) {
  closeAllDropdowns();
  const rect = btn.getBoundingClientRect();
  const menu = document.createElement('div');
  menu.className = 'dropdown-menu';
  menu.style.cssText = `position:fixed;top:${rect.bottom+4}px;right:${window.innerWidth-rect.right}px;background:var(--white);border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.2);min-width:220px;z-index:9000;border:1px solid var(--border);`;
  menu.innerHTML = ['Save post','Copy link to post','Not interested','Report post','Hide all posts from user'].map(label =>
    `<button onclick="createToast('${label}','info');closeAllDropdowns()" style="display:block;width:100%;text-align:left;padding:12px 16px;background:none;border:none;cursor:pointer;font-size:14px;color:var(--text);">${label}</button>`
  ).join('');
  document.body.appendChild(menu);
}

function toggleLike(postId, btn) {
  const liked = App.state.likedPosts.has(postId);
  if (liked) { App.state.likedPosts.delete(postId); }
  else { App.state.likedPosts.add(postId); createToast('Post liked!','success'); }
  const nowLiked = !liked;
  btn.classList.toggle('liked', nowLiked);
  // CSS handles fill colour via .liked svg { fill: var(--blue) }
  const path = btn.querySelector('svg path');
  if (path) path.setAttribute('fill', nowLiked ? 'currentColor' : 'none');
  const label = btn.querySelector('span');
  if (label) label.textContent = nowLiked ? 'Liked' : 'Like';
  const post = App.state.feedPosts.find(p => p.id === postId);
  if (post) {
    post.reactions = post.reactions || {};
    post.reactions.like = Math.max(0, (post.reactions.like||0) + (nowLiked ? 1 : -1));
    const countEl = document.querySelector(`#post-${postId} .li-post__reaction-count`);
    if (countEl) {
      const total = Object.values(post.reactions).reduce((a,b)=>a+b,0);
      countEl.textContent = formatNumber(total);
    }
  }
}

const _reactionTimers = {};
function showReactionPicker(postId, _btn) {
  clearReactionPickerTimer(postId);
  const picker = document.getElementById('reaction-picker-' + postId);
  if (!picker) return;
  const reactions = [{emoji:'👍',name:'Like'},{emoji:'❤️',name:'Love'},{emoji:'🎉',name:'Celebrate'},{emoji:'💡',name:'Insightful'},{emoji:'🤔',name:'Curious'},{emoji:'😄',name:'Funny'}];
  picker.style.display = 'flex';
  picker.innerHTML = reactions.map(r =>
    `<button class="li-reaction-btn" title="${r.name}" onclick="selectReaction(${postId},'${r.name}',document.getElementById('like-btn-${postId}'))">${r.emoji}</button>`
  ).join('');
}
function scheduleHideReactionPicker(postId) {
  _reactionTimers[postId] = setTimeout(() => hideReactionPicker(postId), 400);
}
function clearReactionPickerTimer(postId) {
  if (_reactionTimers[postId]) { clearTimeout(_reactionTimers[postId]); delete _reactionTimers[postId]; }
}
function hideReactionPicker(postId) {
  const picker = document.getElementById('reaction-picker-' + postId);
  if (picker) picker.style.display = 'none';
}
function selectReaction(postId, reactionName, likeBtn) {
  App.state.likedPosts.add(postId);
  hideReactionPicker(postId);
  if (likeBtn) { likeBtn.classList.add('liked'); likeBtn.querySelector('span').textContent = reactionName; }
  createToast('Reacted with ' + reactionName + '!', 'success');
}
function toggleComments(postId) {
  const section = document.getElementById('comments-' + postId);
  if (section) {
    const isOpen = section.style.display !== 'none';
    section.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) document.getElementById('comment-input-' + postId)?.focus();
  }
}
function submitComment(postId) {
  const input = document.getElementById('comment-input-' + postId);
  if (!input || !input.value.trim()) return;
  const content = input.value.trim();
  const u = App.state.currentUser;
  const headline = (u.headline || '').split('|')[0].trim().slice(0, 60);
  const commentHtml = `<div class="li-comment">
    <a href="#profile" style="flex-shrink:0;text-decoration:none;">
      <div class="li-comment__photo" style="background:transparent;">${generateAvatar(u.name, 36, u.avatarColor)}</div>
    </a>
    <div style="flex:1;min-width:0;">
      <div class="li-comment__bubble">
        <a href="#profile" class="li-comment__author" style="text-decoration:none;color:inherit;">${escapeHtml(u.name)}</a>
        ${headline ? `<div class="li-comment__headline">${escapeHtml(headline)}</div>` : ''}
        <div class="li-comment__text">${escapeHtml(content)}</div>
      </div>
      <div class="li-comment__actions">
        <span class="li-comment__action" style="cursor:default;color:var(--text-2);">Just now</span>
        <button class="li-comment__action" onclick="createToast('Liked!','success')">Like</button>
        <button class="li-comment__action" onclick="createToast('Replying...','info')">Reply</button>
      </div>
    </div>
  </div>`;
  const list = document.getElementById('comment-list-' + postId);
  if (list) list.insertAdjacentHTML('afterbegin', commentHtml);
  input.value = '';
  createToast('Comment posted!', 'success');
}
function openRepostModal(_postId) {
  openModal(`<div style="display:flex;flex-direction:column;gap:12px;">
    <button onclick="closeModal();createToast('Reposted!','success')" style="padding:14px 20px;border:1px solid var(--border);border-radius:8px;background:none;cursor:pointer;text-align:left;font-size:15px;font-weight:600;">
      Repost instantly<br><span style="font-size:13px;color:var(--text-2);font-weight:400;">Share this post immediately</span>
    </button>
    <button onclick="closeModal();openPostModal()" style="padding:14px 20px;border:1px solid var(--border);border-radius:8px;background:none;cursor:pointer;text-align:left;font-size:15px;font-weight:600;">
      Repost with your thoughts<br><span style="font-size:13px;color:var(--text-2);font-weight:400;">Add your commentary before sharing</span>
    </button>
  </div>`, 'Repost');
}
function openPostModal() {
  const u = App.state.currentUser;
  const MAX_CHARS = 3000;
  openModal(`
  <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
    <div style="border-radius:50%;overflow:hidden;flex-shrink:0;">${generateAvatar(u.name, 48, u.avatarColor)}</div>
    <div>
      <div style="font-weight:700;font-size:15px;">${escapeHtml(u.name)}</div>
      <button onclick="createToast('Audience options','info')" style="display:flex;align-items:center;gap:4px;background:none;border:1px solid var(--border);border-radius:16px;padding:3px 10px;font-size:12px;font-weight:600;cursor:pointer;margin-top:4px;color:var(--text);">
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11z"/></svg>
        Anyone <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" style="margin-left:2px;"><path d="M3 6l5 5 5-5"/></svg>
      </button>
    </div>
  </div>
  <textarea id="post-modal-text" style="width:100%;min-height:160px;border:none;outline:none;font-size:16px;resize:none;box-sizing:border-box;font-family:inherit;line-height:1.5;color:inherit;background:transparent;" placeholder="What do you want to talk about?" oninput="updatePostCharCount(this, ${MAX_CHARS})"></textarea>
  <div id="post-char-counter" class="post-char-counter" style="text-align:right;font-size:12px;color:var(--text-3);padding:4px 0;">${MAX_CHARS} remaining</div>
  <div style="display:flex;gap:2px;margin-top:8px;padding-top:10px;border-top:1px solid var(--border);align-items:center;flex-wrap:wrap;">
    <div style="display:flex;gap:0;flex:1;flex-wrap:wrap;">
      ${[['🖼️','Photo'],['🎬','Video'],['📄','Document'],['🔗','Link'],['📊','Poll'],['😊','Emoji']].map(([icon,label]) =>
        `<button title="${label}" onclick="createToast('${label} upload coming soon','info')" style="background:none;border:none;cursor:pointer;padding:8px;border-radius:8px;color:var(--text-2);display:flex;align-items:center;gap:4px;font-size:13px;font-weight:600;transition:background 0.15s;" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background='none'"><span style="font-size:18px;">${icon}</span><span class="post-btn-label">${label}</span></button>`
      ).join('')}
    </div>
    <button onclick="submitPost()" id="post-submit-btn" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 22px;font-size:14px;font-weight:600;cursor:pointer;opacity:0.5;transition:opacity 0.15s;" disabled>Post</button>
  </div>`, 'Create a post');
  // Focus textarea after modal opens
  setTimeout(() => {
    const ta = document.getElementById('post-modal-text');
    if (ta) ta.focus();
  }, 50);
}
function updatePostCharCount(ta, max) {
  const remaining = max - ta.value.length;
  const counter = document.getElementById('post-char-counter');
  const btn = document.getElementById('post-submit-btn');
  if (counter) {
    counter.textContent = remaining >= 0 ? remaining + ' remaining' : Math.abs(remaining) + ' over limit';
    counter.style.color = remaining < 0 ? 'var(--red)' : remaining < 200 ? 'var(--orange)' : 'var(--text-3)';
  }
  if (btn) {
    const hasText = ta.value.trim().length > 0 && remaining >= 0;
    btn.disabled = !hasText;
    btn.style.opacity = hasText ? '1' : '0.5';
    btn.style.cursor = hasText ? 'pointer' : 'not-allowed';
  }
}
function submitPost() {
  const textarea = document.getElementById('post-modal-text');
  if (!textarea || !textarea.value.trim()) { createToast('Please write something first!','warning'); return; }
  const btn = document.getElementById('post-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Posting…'; btn.style.opacity = '0.7'; }
  const u = App.state.currentUser;
  const newPost = { id: Date.now(), authorId: u.id, authorName: u.name, authorHeadline: u.headline||'', content: textarea.value.trim(), reactions: { like: 0 }, comments: [], reposts: 0, timestamp: Date.now() };
  // Simulate brief network delay for realism
  setTimeout(() => {
    App.state.feedPosts.unshift(newPost);
    closeModal();
    createToast('Post shared! 🎉', 'success');
    const feedPosts = document.getElementById('feed-posts');
    if (feedPosts) feedPosts.insertAdjacentHTML('afterbegin', renderPostCard(newPost));
  }, 400);
}
function openImageLightbox(src) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10001;display:flex;align-items:center;justify-content:center;cursor:pointer;';
  overlay.innerHTML = `<img src="${escapeHtml(src)}" style="max-width:90vw;max-height:90vh;border-radius:4px;" /><button onclick="this.parentElement.remove()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:white;font-size:32px;cursor:pointer;">&times;</button>`;
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}
function toggleFollow(userId, btn) {
  const following = App.state.following.has(userId);
  if (following) { App.state.following.delete(userId); btn.textContent = '+ Follow'; btn.style.background = 'none'; btn.style.color = 'var(--blue)'; }
  else { App.state.following.add(userId); btn.textContent = 'Following'; btn.style.background = 'var(--blue)'; btn.style.color = 'white'; createToast('Following!','success'); }
}
function _initFeedInteractions() {}
let _feedLoading = false;
function _loadMorePosts() {
  if (_feedLoading) return;
  const loader = document.getElementById('feed-loader');
  if (!loader) return;
  const rect = loader.getBoundingClientRect();
  if (rect.top > window.innerHeight + 200) return;
  _feedLoading = true;
  const sampleAuthors = [
    { name: 'Diana Prince', headline: 'VP Engineering at Stripe' },
    { name: 'Robert Kim', headline: 'Founder at BuildFast' },
    { name: 'Lisa Zhang', headline: 'Senior Designer at Figma' },
  ];
  setTimeout(() => {
    const newPosts = Array.from({length:3}, (_,i) => {
      const a = sampleAuthors[i%sampleAuthors.length];
      return { id: Date.now()+i, authorId: 10+i, authorName: a.name, authorHeadline: a.headline, content: ['Networking is the foundation of career growth. Never stop connecting.','Just shipped a feature that 1 million people will use.','Three lessons from 10 years building software products...'][i], reactions:{ like: Math.floor(Math.random()*500)+10 }, comments:[], reposts: Math.floor(Math.random()*50), timestamp: Date.now()-((App.state.feedPage)*86400000+i*3600000) };
    });
    const feedEl = document.getElementById('feed-posts');
    if (feedEl) { newPosts.forEach(p => { App.state.feedPosts.push(p); feedEl.insertAdjacentHTML('beforeend', renderPostCard(p)); }); }
    App.state.feedPage++;
    _feedLoading = false;
  }, 800);
}

// ============================================================
// PROFILE PAGE
// ============================================================
function renderProfile(userId) {
  const data = window.LinkedInData;
  const currentUser = App.state.currentUser;
  let user;
  if (!userId || String(userId) === String(currentUser.id)) {
    user = currentUser;
  } else {
    user = data?.users?.find(u => String(u.id) === String(userId)) || {
      id: userId, name: 'Jane Smith', headline: 'Senior Product Manager at TechCorp', location: 'San Francisco, CA',
      about: 'Passionate about building products that users love. 10+ years of experience in product management, working across B2B and B2C spaces.',
      connections: 1240, profileViews: 892,
      experience: [{ title:'Senior Product Manager', company:'TechCorp', duration:'2020 - Present', desc:'Leading cross-functional teams to deliver impactful products.' },{ title:'Product Manager', company:'StartupXYZ', duration:'2017 - 2020', desc:'Launched 3 major product lines generating $5M ARR.' }],
      education: [{ school:'MIT', degree:'B.S. Computer Science', years:'2013 - 2017' }],
      skills: [{ name:'Product Strategy', endorsements:87 },{ name:'Data Analysis', endorsements:64 },{ name:'Agile/Scrum', endorsements:52 },{ name:'User Research', endorsements:41 }]
    };
  }
  const isOwn = !userId || String(userId) === String(currentUser.id);
  const isConnected = App.state.connections.has(String(userId));
  const exp = user.experience || [
    { title:'Software Engineer', company:'Google', duration:'Jan 2022 - Present', desc:'Building scalable backend systems.' },
    { title:'Junior Developer', company:'StartupABC', duration:'2019 - 2022', desc:'Full-stack development with React and Node.js.' }
  ];
  const edu = user.education || [{ school:'NJIT', degree:'B.S. Computer Science', years:'2015 - 2019' }];
  const skills = user.skills || [{ name:'JavaScript', endorsements:45 },{ name:'React', endorsements:38 },{ name:'Node.js', endorsements:29 },{ name:'Python', endorsements:24 },{ name:'SQL', endorsements:19 }];
  const certs = user.certifications || [{ name:'AWS Solutions Architect', issuer:'Amazon', year:'2023' },{ name:'Google Cloud Professional', issuer:'Google', year:'2022' }];

  return `<div class="li-profile-page__inner">
    <div class="li-profile-main">
      <!-- Header Card -->
      <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:8px;">
        <div style="height:200px;background:${user.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};position:relative;">
          ${isOwn ? `<button onclick="createToast('Edit cover photo','info')" style="position:absolute;bottom:12px;right:12px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">✏️</button>` : ''}
        </div>
        <div style="padding:0 24px 20px;position:relative;">
          <!-- Avatar overlapping cover -->
          <div style="position:absolute;top:-60px;left:24px;border-radius:50%;${user.openToWork ? 'box-shadow:0 0 0 4px var(--green),0 0 0 7px var(--white);' : 'border:4px solid var(--white);'}overflow:hidden;width:128px;height:128px;display:flex;align-items:center;justify-content:center;background:var(--white);">
            ${generateAvatar(user.name, 120, user.avatarColor)}
          </div>
          ${user.openToWork ? `<div style="position:absolute;top:${60}px;left:20px;background:var(--green);color:white;font-size:10px;font-weight:700;padding:3px 10px;border-radius:12px;border:2px solid var(--white);letter-spacing:.3px;">#OPEN TO WORK</div>` : ''}
          ${isOwn ? `<button onclick="createToast('Edit profile photo','info')" style="position:absolute;top:-30px;left:84px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.2);">✏️</button>` : ''}
          <!-- Action buttons top-right -->
          <div style="display:flex;justify-content:flex-end;padding-top:12px;gap:8px;flex-wrap:wrap;min-height:52px;">
            ${isOwn ? `
              <button onclick="createToast('Open to work options','info')" style="background:var(--green);color:white;border:none;border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">Open to <svg viewBox="0 0 16 16" width="14" height="14" fill="white"><path d="M4 6l4 4 4-4"/></svg></button>
              <button onclick="createToast('Add profile section','info')" style="border:1.5px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;">Add profile section</button>
              <button onclick="openEditProfileModal()" style="border:1.5px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;">Enhance profile</button>
              <button onclick="createToast('Resources','info')" style="border:1.5px solid var(--border-2);color:var(--text);background:none;border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">Resources <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M4 6l4 4 4-4"/></svg></button>
            ` : `
              <button onclick="toggleConnect('${user.id}', this)" style="background:${isConnected?'transparent':'var(--blue)'};color:${isConnected?'var(--blue)':'white'};border:1.5px solid var(--blue);border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;">${isConnected?'✓ Connected':'Connect'}</button>
              <button onclick="App.navigate('messaging')" style="border:1.5px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;">Message</button>
              <button onclick="toggleFollow('${user.id}', this)" style="border:1.5px solid var(--border-2);color:var(--text);background:none;border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;">Follow</button>
              <button onclick="createToast('More options','info')" style="border:1.5px solid var(--border-2);color:var(--text);background:none;border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">&#8943;</button>
            `}
          </div>
          <div style="margin-top:56px;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
              <h1 style="font-size:24px;font-weight:700;margin:0;">${escapeHtml(user.name)}</h1>
              ${user.isPremium ? `<span style="background:var(--premium-gold);color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:.5px;">IN</span>` : ''}
              ${user.pronouns ? `<span style="font-size:14px;color:var(--text-2);">(${escapeHtml(user.pronouns)})</span>` : ''}
            </div>
            <div style="font-size:16px;color:var(--text);margin-bottom:6px;line-height:1.4;">${escapeHtml(user.headline||'')}</div>
            <div style="font-size:14px;color:var(--text-2);margin-bottom:4px;">${escapeHtml(user.location||'')}${user.industry ? ' · ' + escapeHtml(user.industry) : ''}</div>
            <div style="display:flex;gap:16px;font-size:14px;flex-wrap:wrap;margin-top:6px;align-items:center;">
              <span style="color:var(--blue);font-weight:600;cursor:pointer;" onclick="createToast('Connections list','info')">${formatNumber(user.connections||0)} connections</span>
              ${user.followers ? `<span style="color:var(--text-2);">${formatNumber(user.followers)} followers</span>` : ''}
              ${isOwn ? `<span style="color:var(--blue);cursor:pointer;" onclick="App.navigate('notifications')">${formatNumber(user.profileViews||0)} profile viewers</span>` : ''}
            </div>
            ${user.openToWork ? `<div style="margin-top:8px;display:inline-block;background:var(--open-to-work-bg,#d4edda);color:var(--open-to-work-text,#155724);padding:4px 12px;border-radius:12px;font-size:13px;font-weight:600;border:2px solid var(--open-to-work-text,#155724);">#OpenToWork</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Open to Work banner -->
      ${user.openToWork && isOwn ? `<div class="li-card" style="padding:16px 20px;margin-bottom:8px;border-left:4px solid var(--green);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;font-size:15px;color:var(--green);">#OpenToWork</div>
            <div style="font-size:13px;color:var(--text-2);margin-top:2px;">You are open to: ${(user.openToWorkTypes||['Full-time']).join(', ')}</div>
          </div>
          <button onclick="createToast('Edit Open To Work preferences','info')" style="border:none;background:none;cursor:pointer;color:var(--blue);font-size:13px;font-weight:600;">Edit</button>
        </div>
      </div>` : ''}

      <!-- About -->
      ${user.about ? `<div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="font-size:20px;font-weight:700;margin:0;">About</h2>
          ${isOwn ? `<button onclick="openEditProfileModal()" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:20px;" title="Edit">✏️</button>` : ''}
        </div>
        <div style="font-size:15px;color:var(--text);line-height:1.7;">${truncateText(user.about, 400)}</div>
        ${user.skills?.length ? `<div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;">${(user.skills||[]).slice(0,5).map(s => `<span style="background:var(--bg);border:1px solid var(--border-2);border-radius:12px;padding:4px 12px;font-size:12px;font-weight:600;color:var(--text);">${escapeHtml(s.name||s)}</span>`).join('')}</div>` : ''}
      </div>` : ''}

      <!-- Featured -->
      ${isOwn ? `<div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <h2 style="font-size:20px;font-weight:700;margin:0;">Featured</h2>
          <div style="display:flex;gap:4px;">
            <button onclick="createToast('Add featured item','info')" style="background:none;border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;font-size:22px;color:var(--text-2);display:flex;align-items:center;justify-content:center;" title="Add">+</button>
            <button onclick="createToast('Edit featured','info')" style="background:none;border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--text-2);font-size:18px;" title="Edit">✏️</button>
          </div>
        </div>
        <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:8px;scrollbar-width:thin;">
          ${App.state.feedPosts.slice(0,3).map((p,idx) => {
            const colors = ['linear-gradient(135deg,#0a66c2,#004182)','linear-gradient(135deg,#057642,#02543a)','linear-gradient(135deg,#7c3aed,#4c1d95)'];
            const icons = ['📝','💡','🚀'];
            const preview = (p.content||'').slice(0,100);
            const reactions = p.totalReactions || Object.values(p.reactions||{}).reduce((a,b)=>a+b,0);
            return `<div style="flex-shrink:0;width:260px;border:1px solid var(--border);border-radius:8px;overflow:hidden;cursor:pointer;background:var(--white);transition:box-shadow .15s;" onclick="window.location.hash='feed'" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,.12)'" onmouseleave="this.style.boxShadow='none'">
              <div style="height:110px;background:${colors[idx%3]};display:flex;align-items:center;justify-content:center;font-size:40px;">${icons[idx%3]}</div>
              <div style="padding:12px 14px;">
                <div style="font-size:14px;font-weight:700;margin-bottom:4px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(preview)}${preview.length < (p.content||'').length ? '…' : ''}</div>
                <div style="font-size:12px;color:var(--text-2);margin-top:6px;display:flex;align-items:center;gap:8px;">
                  <span>Post</span>
                  ${reactions > 0 ? `<span>·</span><span>👍 ${formatNumber(reactions)}</span>` : ''}
                </div>
              </div>
            </div>`;
          }).join('')}
          <!-- Add item card -->
          <div onclick="createToast('Add featured item','info')" style="flex-shrink:0;width:120px;border:2px dashed var(--border-2);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;color:var(--text-2);font-size:13px;font-weight:600;padding:20px 12px;text-align:center;min-height:160px;transition:border-color .15s;" onmouseenter="this.style.borderColor='var(--blue)';this.style.color='var(--blue)'" onmouseleave="this.style.borderColor='var(--border-2)';this.style.color='var(--text-2)'">
            <span style="font-size:28px;">+</span>
            <span>Add featured</span>
          </div>
        </div>
      </div>` : ''}

      <!-- Activity -->
      <div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div>
            <h2 style="font-size:20px;font-weight:700;margin:0 0 2px;">Activity</h2>
            <div style="font-size:14px;color:var(--blue);font-weight:600;cursor:pointer;" onclick="createToast('Followers','info')">${formatNumber(user.followers || user.connections || 847)} followers</div>
          </div>
          ${isOwn ? `<button onclick="openPostModal()" style="border:1.5px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;">Create a post</button>` : `<button onclick="createToast('Follow ${escapeHtml(user.name)}','success')" style="border:1.5px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:6px 16px;font-size:14px;font-weight:600;cursor:pointer;">+ Follow</button>`}
        </div>
        <!-- Activity tabs -->
        <div style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:16px;">
          ${['Posts','Comments','Reactions','Documents'].map((t,i) => `<button onclick="switchProfileActivityTab('${t.toLowerCase()}')" id="pa-tab-${t.toLowerCase()}" style="padding:8px 14px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:${i===0?'600':'400'};color:${i===0?'var(--blue)':'var(--text-2)'};border-bottom:${i===0?'2px solid var(--blue)':'2px solid transparent'};white-space:nowrap;transition:all .15s;">${t}</button>`).join('')}
        </div>
        <div id="profile-activity-content">
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${App.state.feedPosts.slice(0,3).map(p => {
              const pContent = p.content || '';
              const reactions = p.totalReactions || Object.values(p.reactions||{}).reduce((a,b)=>a+b,0);
              return `<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="window.location.hash='feed'" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background=''">
                <div style="flex:1;min-width:0;">
                  <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">${isOwn ? 'You' : escapeHtml(user.name)} posted this • ${formatTime(p.timestamp)}</div>
                  <div style="font-size:14px;color:var(--text);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(pContent)}</div>
                  ${reactions > 0 ? `<div style="margin-top:6px;font-size:12px;color:var(--text-2);">👍 ${formatNumber(reactions)} reactions · 💬 ${p.comments||0} comments</div>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <a href="#feed" style="display:flex;align-items:center;justify-content:center;gap:4px;font-size:14px;font-weight:700;color:var(--text-2);margin-top:14px;text-decoration:none;padding:10px;border-top:1px solid var(--border);">Show all activity <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 12l4-4-4-4"/></svg></a>
      </div>

      <!-- Experience -->
      <div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:700;margin:0;">Experience</h2>
          ${isOwn ? `<div style="display:flex;gap:4px;"><button onclick="createToast('Add experience','info')" style="background:none;border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;font-size:22px;color:var(--text-2);display:flex;align-items:center;justify-content:center;" title="Add">+</button></div>` : ''}
        </div>
        <div class="li-timeline">
          ${exp.map((e, i) => {
            const duration = e.duration || [e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ');
            const location = e.location || '';
            const desc = e.desc || e.description || '';
            const empType = e.type || '';
            const logo = e.companyLogo || '🏢';
            const skillsStr = e.skills || '';
            const isLast = i === exp.length - 1;
            return `<div class="li-timeline-item" style="position:relative;${!isLast ? 'padding-bottom:8px;' : ''}">
              ${!isLast ? `<div style="position:absolute;left:23px;top:52px;bottom:0;width:2px;background:var(--border);"></div>` : ''}
              <div class="li-timeline-logo" onclick="createToast('View ${escapeHtml(e.company||'')}','info')" style="cursor:pointer;z-index:1;background:var(--bg);">${logo}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:15px;line-height:1.3;">${escapeHtml(e.title||'')}</div>
                <a href="#company/1" style="font-size:14px;color:var(--text);text-decoration:none;font-weight:500;">${escapeHtml(e.company||'')}${empType ? ` <span style="color:var(--text-2);font-weight:400;">· ${escapeHtml(empType)}</span>` : ''}</a>
                <div style="font-size:13px;color:var(--text-2);margin-top:2px;">${escapeHtml(duration)}${location ? ` · ${escapeHtml(location)}` : ''}</div>
                ${desc ? `<div style="font-size:14px;color:var(--text);margin-top:8px;line-height:1.6;">${truncateText(desc, 220)}</div>` : ''}
                ${skillsStr ? `<div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">${skillsStr.split(',').slice(0,4).map(sk => `<span style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:2px 10px;font-size:12px;font-weight:600;color:var(--text);">${escapeHtml(sk.trim())}</span>`).join('')}</div>` : ''}
              </div>
              ${isOwn ? `<button onclick="createToast('Edit experience','info')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:18px;flex-shrink:0;padding:4px;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;" title="Edit">✏️</button>` : ''}
            </div>`;
          }).join('')}
        </div>
        ${exp.length > 3 ? `<button onclick="createToast('Show all experience','info')" style="width:100%;margin-top:12px;padding:10px;background:none;border:none;cursor:pointer;font-size:14px;font-weight:600;color:var(--text-2);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:center;gap:4px;">Show all ${exp.length} experiences <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6l4 4 4-4" stroke-linecap="round"/></svg></button>` : ''}
      </div>

      <!-- Education -->
      <div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:700;margin:0;">Education</h2>
          ${isOwn ? `<button onclick="createToast('Add education','info')" style="background:none;border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;font-size:22px;color:var(--text-2);display:flex;align-items:center;justify-content:center;">+</button>` : ''}
        </div>
        <div class="li-timeline">
          ${edu.map((e, i) => {
            const years = e.years || [e.startYear, e.endYear].filter(Boolean).join(' – ');
            const grade = e.grade || '';
            const field = e.field || '';
            const activities = e.activities || '';
            const desc = e.description || '';
            const isLast = i === edu.length - 1;
            return `<div class="li-timeline-item" style="position:relative;${!isLast ? 'padding-bottom:8px;' : ''}">
              ${!isLast ? `<div style="position:absolute;left:23px;top:52px;bottom:0;width:2px;background:var(--border);"></div>` : ''}
              <div class="li-timeline-logo" style="font-size:22px;z-index:1;background:var(--bg);">🎓</div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:15px;line-height:1.3;">${escapeHtml(e.school||'')}</div>
                <div style="font-size:14px;color:var(--text);margin-top:1px;">${escapeHtml(e.degree||'')}${field ? `, ${escapeHtml(field)}` : ''}</div>
                <div style="font-size:13px;color:var(--text-2);margin-top:2px;">${escapeHtml(years)}${grade ? ` · Grade: ${escapeHtml(grade)}` : ''}</div>
                ${activities ? `<div style="font-size:13px;color:var(--text-2);margin-top:4px;">Activities: ${escapeHtml(activities)}</div>` : ''}
                ${desc ? `<div style="font-size:13px;color:var(--text);margin-top:4px;line-height:1.5;">${escapeHtml(desc)}</div>` : ''}
              </div>
              ${isOwn ? `<button onclick="createToast('Edit education','info')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:18px;flex-shrink:0;padding:4px;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;" title="Edit">✏️</button>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Licenses & Certifications -->
      ${certs.length > 0 ? `<div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:700;margin:0;">Licenses &amp; Certifications</h2>
          ${isOwn ? `<button onclick="createToast('Add certification','info')" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text-2);">+</button>` : ''}
        </div>
        ${certs.map((c,i) => `<div style="display:flex;gap:14px;${i>0?'margin-top:16px;padding-top:16px;border-top:1px solid var(--border);':''}">
          <div style="flex-shrink:0;width:48px;height:48px;background:var(--bg);border-radius:8px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:22px;">📜</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:15px;color:var(--text);">${escapeHtml(c.name||'')}</div>
            <div style="font-size:14px;color:var(--text);margin-top:1px;">${escapeHtml(c.org||c.issuer||'')}</div>
            <div style="font-size:13px;color:var(--text-2);margin-top:2px;">${c.issueDate ? 'Issued ' + escapeHtml(c.issueDate) : ''}${c.expDate ? ' · Expires ' + escapeHtml(c.expDate) : ''}${(!c.issueDate && c.year) ? escapeHtml(c.year) : ''}</div>
            ${c.credentialId ? `<div style="font-size:12px;color:var(--text-2);margin-top:3px;">Credential ID: ${escapeHtml(c.credentialId)}</div>` : ''}
            ${c.credentialUrl || c.url ? `<a href="#" onclick="createToast('Opening credential...','info');return false;" style="font-size:13px;color:var(--blue);font-weight:600;margin-top:4px;display:inline-flex;align-items:center;gap:3px;text-decoration:none;">Show credential <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h7v7M13 3L3 13"/></svg></a>` : ''}
          </div>
          ${isOwn ? `<button onclick="createToast('Edit certification','info')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:18px;flex-shrink:0;padding:4px;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✏️</button>` : ''}
        </div>`).join('')}
      </div>` : ''}

      <!-- Skills -->
      <div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:700;margin:0;">Skills</h2>
          ${isOwn ? `<button onclick="createToast('Add skill','info')" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text-2);">+</button>` : ''}
        </div>
        <div id="skills-list-${user.id||'me'}">
          ${skills.slice(0,5).map((s,i) => {
            const pct = Math.min(100, Math.round(((s.endorsements||0) / 100) * 100));
            return `<div style="padding:12px 0;${i>0?'border-top:1px solid var(--border);':''}">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:700;font-size:15px;">${escapeHtml(s.name||'')}</div>
                  ${s.category ? `<div style="font-size:12px;color:var(--blue);margin-top:2px;">${escapeHtml(s.category)}</div>` : ''}
                  <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                    <div style="flex:1;height:4px;background:var(--border);border-radius:2px;max-width:140px;">
                      <div style="width:${pct}%;height:100%;background:var(--blue);border-radius:2px;"></div>
                    </div>
                    <span style="font-size:12px;color:var(--text-2);">${formatNumber(s.endorsements||0)} endorsements</span>
                  </div>
                </div>
                ${!isOwn ? `<button onclick="endorseSkill('${escapeHtml(s.name||'')}', this)" style="flex-shrink:0;border:1px solid var(--blue);color:var(--blue);background:none;border-radius:14px;padding:5px 14px;font-size:13px;cursor:pointer;font-weight:600;">Endorse</button>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
        ${skills.length > 5 ? `<button onclick="showAllSkills('${user.id||'me'}')" id="skills-toggle-${user.id||'me'}" style="background:none;border:none;color:var(--blue);font-size:14px;font-weight:600;cursor:pointer;margin-top:8px;width:100%;text-align:center;padding:8px;">Show all ${skills.length} skills ›</button>` : ''}
      </div>

      <!-- Recommendations -->
      <div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="font-size:20px;font-weight:700;margin:0;">Recommendations</h2>
          ${isOwn ? `<button onclick="createToast('Request a recommendation','info')" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:16px;padding:5px 12px;font-size:13px;cursor:pointer;font-weight:600;">Ask for a recommendation</button>` : `<button onclick="createToast('Recommendation sent!','success')" style="background:var(--blue);color:white;border:none;border-radius:16px;padding:5px 14px;font-size:13px;cursor:pointer;font-weight:600;">Recommend ${escapeHtml(user.name.split(' ')[0])}</button>`}
        </div>
        <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:16px;">
          <button onclick="switchTab('rec-tab','received','rec-content')" id="rec-tab-received" style="padding:8px 16px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:600;color:var(--blue);border-bottom:2px solid var(--blue);">Received</button>
          <button onclick="switchTab('rec-tab','given','rec-content')" id="rec-tab-given" style="padding:8px 16px;border:none;background:none;cursor:pointer;font-size:14px;color:var(--text-2);border-bottom:2px solid transparent;">Given</button>
        </div>
        <div id="rec-content">
          ${_renderRecommendations(user)}
        </div>
      </div>

      <!-- Languages -->
      ${(user.languages && user.languages.length > 0) ? `<div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:700;margin:0;">Languages</h2>
          ${isOwn ? `<button onclick="createToast('Add language','info')" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text-2);">+</button>` : ''}
        </div>
        ${user.languages.map((l,i) => `<div style="padding:8px 0;${i>0?'border-top:1px solid var(--border);':''}">
          <div style="font-weight:700;font-size:15px;">${escapeHtml(l.name||'')}</div>
          <div style="font-size:13px;color:var(--text-2);">${escapeHtml(l.proficiency||'')}</div>
        </div>`).join('')}
      </div>` : ''}

      <!-- Accomplishments -->
      ${user.accomplishments ? `<div class="li-card" style="padding:20px;margin-bottom:8px;">
        <h2 style="font-size:20px;font-weight:700;margin:0 0 16px;">Accomplishments</h2>
        ${[
          user.accomplishments.courses?.length > 0 ? ['📚','Courses',user.accomplishments.courses.join(', ')] : null,
          user.accomplishments.projects?.length > 0 ? ['🚀','Projects',user.accomplishments.projects.map(p=>p.name).join(', ')] : null,
          user.accomplishments.publications?.length > 0 ? ['📖','Publications',user.accomplishments.publications.map(p=>p.title).join(', ')] : null,
          user.accomplishments.honors?.length > 0 ? ['🏆','Honors & Awards',user.accomplishments.honors.map(h=>h.title).join(', ')] : null,
          user.accomplishments.testScores?.length > 0 ? ['📊','Test Scores',user.accomplishments.testScores.map(t=>t.name+': '+t.score).join(', ')] : null,
          user.accomplishments.organizations?.length > 0 ? ['🌐','Organizations',user.accomplishments.organizations.map(o=>o.name).join(', ')] : null,
        ].filter(Boolean).map(([icon,title,detail]) =>
          `<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid var(--border);">
            <span style="font-size:22px;flex-shrink:0;margin-top:2px;">${icon}</span>
            <div><div style="font-weight:700;font-size:15px;">${title}</div><div style="font-size:13px;color:var(--text-2);margin-top:2px;line-height:1.5;">${escapeHtml(detail)}</div></div>
          </div>`
        ).join('')}
      </div>` : ''}
    </div>

    <aside class="li-profile-aside">
      <!-- Analytics (own only) -->
      ${isOwn ? `<div class="li-card" style="padding:16px 20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
          <div>
            <h3 style="font-size:16px;font-weight:700;margin:0 0 2px;">Analytics</h3>
            <div style="font-size:12px;color:var(--text-2);display:flex;align-items:center;gap:4px;">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3a5 5 0 100 10A5 5 0 008 3z"/><path d="M8 6v2l1.5 1.5"/></svg>
              Private to you
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border-top:1px solid var(--border);">
          ${[
            ['Profile views',formatNumber(user.profileViews||234),'Past 90 days','+18%'],
            ['Post impressions',formatNumber(user.postImpressions||1891),'Past 60 days','+34%'],
            ['Search appearances',formatNumber(user.searchAppearances||47),'Past 7 days','+12%'],
          ].map(([label,val,sub,trend], idx, arr) =>
            `<div style="padding:12px 8px;cursor:pointer;text-align:center;${idx < arr.length-1 ? 'border-right:1px solid var(--border);' : ''};transition:background 0.15s;border-radius:4px;" onclick="createToast('${label} analytics','info')" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background=''">
              <div style="font-size:20px;font-weight:700;color:var(--text);">${val}</div>
              <div style="font-size:11px;color:var(--text);margin-top:2px;font-weight:600;">${label}</div>
              <div style="font-size:11px;color:var(--text-2);margin-top:2px;">${sub}</div>
              <div style="font-size:11px;color:var(--green);font-weight:600;margin-top:3px;">↑ ${trend}</div>
            </div>`
          ).join('')}
        </div>
        <button onclick="createToast('All analytics','info')" style="margin-top:10px;background:none;border:none;cursor:pointer;color:var(--blue);font-size:13px;font-weight:600;padding:0;display:flex;align-items:center;gap:4px;">View all analytics →</button>
      </div>` : ''}
      <div class="li-card" style="padding:16px;margin-bottom:8px;">
        <h3 style="font-size:15px;font-weight:700;margin:0 0 12px;">People also viewed</h3>
        ${_peopleAlsoViewed()}
      </div>
      ${isOwn ? `<div class="li-card" style="padding:16px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h3 style="font-size:14px;font-weight:700;margin:0;color:var(--text);">Profile language</h3>
          <button onclick="App.navigate('settings')" style="background:none;border:none;cursor:pointer;color:var(--blue);font-size:13px;font-weight:600;">Edit</button>
        </div>
        <div style="font-size:14px;color:var(--text);">English</div>
      </div>
      <div class="li-card" style="padding:16px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:var(--text);">Public profile &amp; URL</div>
        <div style="font-size:13px;color:var(--blue);word-break:break-all;">linkedin.com/in/${escapeHtml(user.name.toLowerCase().replace(/\s+/g,'-'))}</div>
        <button onclick="createToast('Link copied!','success')" style="margin-top:10px;border:1px solid var(--blue);color:var(--blue);background:none;border-radius:16px;padding:5px 12px;font-size:13px;cursor:pointer;font-weight:600;">Copy URL</button>
      </div>` : ''}
    </aside>
  </div>`;
}

function _sampleRecommendations() {
  const recs = [
    { from: 'Michael Torres', role: 'CTO at TechCorp', text: 'One of the most talented engineers I have had the pleasure of working with. Delivers exceptional results consistently.' },
    { from: 'Sarah Lee', role: 'Product Director', text: 'Outstanding technical skills combined with excellent communication. A true team player.' }
  ];
  return recs.map(r => `<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
    <div style="display:flex;gap:10px;margin-bottom:8px;align-items:center;">
      ${generateAvatar(r.from, 40)}
      <div><div style="font-weight:600;font-size:14px;color:var(--text);">${escapeHtml(r.from)}</div><div style="font-size:12px;color:var(--text-2);">${escapeHtml(r.role)}</div></div>
    </div>
    <div style="font-size:14px;color:var(--text);font-style:italic;line-height:1.5;">"${escapeHtml(r.text)}"</div>
  </div>`).join('');
}

function _renderRecommendations(user) {
  const recs = user.recommendations;
  if (!recs || recs.length === 0) return _sampleRecommendations();
  return recs.map(r => {
    const a = r.author || {};
    return `<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border);">
      <div style="display:flex;gap:10px;margin-bottom:8px;align-items:center;">
        ${generateAvatar(a.name || 'U', 44, a.avatarColor)}
        <div>
          <div style="font-weight:600;font-size:14px;cursor:pointer;color:var(--text);" onclick="App.navigate('profile/${a.id||''}')">${escapeHtml(a.name||'Unknown')}</div>
          <div style="font-size:12px;color:var(--text-2);">${escapeHtml(a.headline||'')}</div>
          ${r.relationship ? `<div style="font-size:11px;color:var(--text-2);margin-top:2px;">${escapeHtml(r.relationship)}</div>` : ''}
        </div>
        ${r.date ? `<div style="margin-left:auto;font-size:12px;color:var(--text-2);">${escapeHtml(r.date)}</div>` : ''}
      </div>
      <div style="font-size:14px;color:var(--text);line-height:1.5;font-style:italic;">"${escapeHtml(r.text||'')}"</div>
    </div>`;
  }).join('');
}

function endorseSkill(skillName, btn) {
  if (!skillName) return;
  const key = 'endorsed-' + skillName;
  if (App.state[key]) {
    createToast('Already endorsed ' + skillName, 'info');
    return;
  }
  App.state[key] = true;
  btn.textContent = 'Endorsed ✓';
  btn.style.background = 'var(--blue)';
  btn.style.color = 'white';
  btn.disabled = true;
  createToast('You endorsed ' + skillName, 'success');
  // Update count display if present
  const countEl = btn.parentElement?.querySelector?.('.skill-endorse-count');
  if (countEl) {
    const n = parseInt(countEl.textContent) || 0;
    countEl.textContent = n + 1;
  }
}

function showAllSkills(userId) {
  const data = window.LinkedInData;
  const user = data?.users?.find(u => String(u.id) === String(userId)) || App.state.currentUser;
  const skills = user.skills || [{ name:'JavaScript', endorsements:45 },{ name:'React', endorsements:38 },{ name:'Node.js', endorsements:29 },{ name:'Python', endorsements:24 },{ name:'SQL', endorsements:19 },{ name:'TypeScript', endorsements:15 },{ name:'GraphQL', endorsements:11 }];
  const list = document.getElementById('skills-list-' + userId);
  const btn = document.getElementById('skills-toggle-' + userId);
  if (list && btn) {
    list.innerHTML = skills.map((s,i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;${i>0?'border-top:1px solid var(--border);':''}">
      <div><div style="font-weight:600;font-size:15px;">${escapeHtml(s.name||'')}</div><div style="font-size:13px;color:var(--text-2);">${s.endorsements||0} endorsements</div></div>
    </div>`).join('');
    btn.style.display = 'none';
  }
}

function switchProfileActivityTab(tab) {
  ['posts','comments','reactions','documents'].forEach(t => {
    const btn = document.getElementById('pa-tab-' + t);
    if (!btn) return;
    const active = t === tab;
    btn.style.fontWeight = active ? '600' : '400';
    btn.style.color = active ? 'var(--blue)' : 'var(--text-2)';
    btn.style.borderBottom = active ? '2px solid var(--blue)' : '2px solid transparent';
  });
  const content = document.getElementById('profile-activity-content');
  if (!content) return;
  const labels = { posts: 'posts', comments: 'comments on', reactions: 'reactions to', documents: 'documents' };
  if (tab === 'posts') {
    // Already rendered — just show it
  } else {
    content.innerHTML = `<div style="padding:32px 0;text-align:center;color:var(--text-2);">
      <div style="font-size:32px;margin-bottom:8px;">📄</div>
      <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px;">No ${labels[tab]} yet</div>
      <div style="font-size:13px;">Activity will appear here</div>
    </div>`;
  }
}

function switchTab(tabGroup, tabName, contentId) {
  document.querySelectorAll(`[id^="${tabGroup}-"]`).forEach(btn => {
    btn.classList.remove('active-tab');
    btn.style.borderBottom = '2px solid transparent';
    btn.style.color = 'var(--text-2)';
    btn.style.fontWeight = '400';
  });
  const activeBtn = document.getElementById(tabGroup + '-' + tabName);
  if (activeBtn) { activeBtn.style.borderBottom = '2px solid var(--blue)'; activeBtn.style.color = 'var(--blue)'; activeBtn.style.fontWeight = '600'; }
  const content = document.getElementById(contentId);
  if (content) {
    if (tabName === 'given') content.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-2);font-size:14px;">No recommendations given yet.</div>`;
    else {
      const u = App.state.currentUser;
      content.innerHTML = _renderRecommendations(u);
    }
  }
}

function toggleConnect(userId, btn) {
  const connected = App.state.connections.has(String(userId));
  if (connected) { App.state.connections.delete(String(userId)); btn.textContent = 'Connect'; btn.style.background = 'var(--blue)'; btn.style.color = 'white'; btn.style.border = '1.5px solid var(--blue)'; }
  else { App.state.connections.add(String(userId)); btn.textContent = '✓ Connected'; btn.style.background = 'transparent'; btn.style.color = 'var(--blue)'; btn.style.border = '1.5px solid var(--blue)'; createToast('Connection request sent! 🎉', 'success'); }
}

function openEditProfileModal() {
  const u = App.state.currentUser;
  openModal(`<div style="display:flex;flex-direction:column;gap:14px;">
    <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Name</label>
      <input type="text" id="edit-name" value="${escapeHtml(u.name)}" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:14px;box-sizing:border-box;"/></div>
    <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Headline</label>
      <input type="text" id="edit-headline" value="${escapeHtml(u.headline||'')}" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:14px;box-sizing:border-box;"/></div>
    <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Location</label>
      <input type="text" id="edit-location" value="${escapeHtml(u.location||'')}" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:14px;box-sizing:border-box;"/></div>
    <div><label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">About</label>
      <textarea id="edit-about" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:14px;resize:vertical;min-height:80px;box-sizing:border-box;">${escapeHtml(u.about||'')}</textarea></div>
    <button onclick="saveProfileEdit()" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:10px 24px;font-size:14px;font-weight:600;cursor:pointer;">Save</button>
  </div>`, 'Edit Profile');
}

function saveProfileEdit() {
  const name = document.getElementById('edit-name')?.value?.trim();
  const headline = document.getElementById('edit-headline')?.value?.trim();
  const location = document.getElementById('edit-location')?.value?.trim();
  const about = document.getElementById('edit-about')?.value?.trim();
  if (name) App.state.currentUser.name = name;
  if (headline !== undefined) App.state.currentUser.headline = headline;
  if (location !== undefined) App.state.currentUser.location = location;
  if (about !== undefined) App.state.currentUser.about = about;
  closeModal();
  createToast('Profile updated!','success');
  App._renderNav();
  App.render('profile', null);
}

// ============================================================
// MY NETWORK PAGE
// ============================================================
function renderNetwork() {
  const data = window.LinkedInData;
  const invitations = data?.invitations || [
    { id:1, name:'Alice Chen', headline:'Data Scientist at OpenAI', mutualConnections: 12 },
    { id:2, name:'Bob Martinez', headline:'DevOps Engineer at AWS', mutualConnections: 5 },
    { id:3, name:'Carol White', headline:'UX Researcher at Microsoft', mutualConnections: 8 }
  ];
  const suggestions = data?.users?.slice(0,8) || [
    { id:2, name:'Emma Davis', headline:'UX Designer at Apple', mutualConnections:14 },
    { id:3, name:'James Wilson', headline:'Product Lead at Spotify', mutualConnections:9 },
    { id:4, name:'Priya Patel', headline:'Data Scientist at Meta', mutualConnections:21 },
    { id:5, name:'Kevin Park', headline:'Backend Engineer at Netflix', mutualConnections:6 },
    { id:6, name:'Sofia Lopez', headline:'Marketing Director at Adobe', mutualConnections:18 },
    { id:7, name:'Amir Hassan', headline:'AI Researcher at DeepMind', mutualConnections:3 },
    { id:8, name:'Rachel Green', headline:'SRE at Google', mutualConnections:11 },
    { id:9, name:'Tyler Johnson', headline:'Startup Founder', mutualConnections:7 }
  ];

  return `<div class="li-network-inner">
    <aside class="li-network-aside">
      <div class="li-card" style="padding:16px;">
        <h3 style="font-size:16px;font-weight:600;margin:0 0 14px;">Manage my network</h3>
        ${[
          ['Connections', formatNumber(App.state.currentUser.connections||847), '#profile'],
          ['Contacts', '0', '#settings'],
          ['Following & Followers', formatNumber(App.state.following.size + 120), '#profile'],
          ['Pages', '3', '#company/1'],
          ['Events', '2', '#events'],
          ['Groups', '5', '#groups'],
          ['Newsletters', '4', '#feed'],
          ['Hashtags', '12', '#feed']
        ].map(([label,count,href]) =>
          `<a href="${href}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--border);text-decoration:none;color:var(--text);font-size:14px;">
            <span>${label}</span><span style="font-weight:600;color:var(--blue);">${count}</span>
          </a>`
        ).join('')}
      </div>
    </aside>

    <main class="li-network-main">
      <!-- Grow / Catch up tabs -->
      <div class="li-card" style="padding:0;margin-bottom:8px;overflow:hidden;">
        <div style="display:flex;border-bottom:1px solid var(--border);">
          ${['Grow','Catch up'].map((tab, i) => `<button onclick="switchNetworkTab('${tab.toLowerCase().replace(' ','-')}')" id="net-tab-${tab.toLowerCase().replace(' ','-')}" style="flex:1;padding:14px 20px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:600;color:${i===0?'var(--blue)':'var(--text-2)'};border-bottom:${i===0?'2px solid var(--blue)':'2px solid transparent'};transition:all 0.15s;">${tab}</button>`).join('')}
        </div>
      </div>

      <!-- Invitations -->
      ${invitations.length > 0 ? `<div class="li-card" style="padding:20px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:600;margin:0;">Invitations <span style="font-size:16px;color:var(--blue);">(${invitations.length})</span></h2>
          <a href="#" style="font-size:14px;color:var(--blue);text-decoration:none;">See all</a>
        </div>
        <div id="invitations-list">
          ${invitations.map(inv => {
            // data.js format: { id, user: {id, name, headline, avatarColor}, mutualCount, note }
            // fallback format: { id, name, headline, mutualConnections }
            const person = inv.user || inv;
            const name = person.name || inv.name || 'Unknown';
            const headline = person.headline || inv.headline || '';
            const color = person.avatarColor || null;
            const profileId = person.id || inv.id;
            const mutual = inv.mutualCount || inv.mutualConnections || 0;
            const note = inv.note || '';
            return `<div id="inv-${inv.id}" style="display:flex;align-items:flex-start;gap:14px;padding:16px 0;border-top:1px solid var(--border);">
              <a href="#profile/${profileId}" style="flex-shrink:0;">${generateAvatar(name, 56, color)}</a>
              <div style="flex:1;min-width:0;">
                <a href="#profile/${profileId}" style="font-weight:700;font-size:15px;color:var(--text);text-decoration:none;display:block;">${escapeHtml(name)}</a>
                <div style="font-size:13px;color:var(--text-2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(headline)}</div>
                <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${mutual} mutual connection${mutual!==1?'s':''}</div>
                ${note ? `<div style="font-size:13px;color:var(--text-2);margin-top:6px;font-style:italic;border-left:2px solid var(--border);padding-left:8px;">"${escapeHtml(note)}"</div>` : ''}
              </div>
              <div style="display:flex;gap:8px;flex-shrink:0;">
                <button onclick="acceptInvitation(${inv.id}, this)" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">Accept</button>
                <button onclick="ignoreInvitation(${inv.id})" style="border:1px solid var(--border-2);color:var(--text);background:none;border-radius:20px;padding:6px 16px;font-size:13px;cursor:pointer;">Ignore</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- People You May Know -->
      <div class="li-card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:600;margin:0;">People you may know</h2>
          <a href="#" style="font-size:14px;color:var(--blue);text-decoration:none;">See all</a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;">
          ${suggestions.map((u,i) => {
            const mutualCount = u.mutualConnections || (Math.abs(u.name.split('').reduce((h,c)=>(h<<5)-h+c.charCodeAt(0),0)) % 20 + 1);
            // Generate 2 fake mutual avatars from the suggestions list itself
            const mutualAvatars = suggestions.filter((_,j) => j !== i).slice(0,2);
            return `<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;text-align:center;padding-bottom:12px;background:var(--white);">
              <div style="height:56px;background:linear-gradient(135deg,${getAvatarColor(u.name)},${getAvatarColor(u.name+'extra')});"></div>
              <div style="margin:-24px auto 0;width:fit-content;">
                <div style="border:3px solid var(--white);border-radius:50%;overflow:hidden;">${generateAvatar(u.name, 48, u.avatarColor)}</div>
              </div>
              <div style="padding:8px 12px 0;">
                <a href="#profile/${u.id||i+2}" style="font-weight:700;font-size:14px;color:var(--text);text-decoration:none;">${escapeHtml(u.name)}</a>
                <div style="font-size:12px;color:var(--text-2);margin:3px 0 6px;line-height:1.3;height:2.6em;overflow:hidden;">${escapeHtml((u.headline||'').split('|')[0].trim())}</div>
                <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:10px;">
                  <div style="display:flex;gap:-4px;">
                    ${mutualAvatars.map(m => `<div style="border:1.5px solid var(--white);border-radius:50%;overflow:hidden;margin-right:-4px;">${generateAvatar(m.name, 16, m.avatarColor)}</div>`).join('')}
                  </div>
                  <span style="font-size:11px;color:var(--text-2);">${mutualCount} mutual</span>
                </div>
                <button onclick="connectUser(${u.id||i+2}, this)" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:16px;padding:5px 18px;font-size:13px;font-weight:600;cursor:pointer;width:100%;">Connect</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </main>
  </div>`;
}

function acceptInvitation(invId, _btn) {
  const card = document.getElementById('inv-' + invId);
  if (card) { card.style.opacity = '0'; card.style.transition = 'opacity 0.3s'; setTimeout(() => card.remove(), 300); }
  App.state.connections.add(String(invId));
  createToast('Connection accepted!','success');
}
function ignoreInvitation(invId) {
  const card = document.getElementById('inv-' + invId);
  if (card) { card.style.opacity = '0'; card.style.transition = 'opacity 0.3s'; setTimeout(() => card.remove(), 300); }
  createToast('Invitation ignored','info');
}
function connectUser(userId, btn) {
  App.state.connections.add(String(userId));
  btn.textContent = 'Pending';
  btn.style.background = 'var(--bg)';
  btn.style.color = 'var(--text-2)';
  btn.disabled = true;
  createToast('Connection request sent!','success');
}
function switchNetworkTab(tab) {
  ['grow','catch-up'].forEach(t => {
    const btn = document.getElementById('net-tab-' + t);
    if (btn) {
      const active = t === tab;
      btn.style.color = active ? 'var(--blue)' : 'var(--text-2)';
      btn.style.borderBottom = active ? '2px solid var(--blue)' : '2px solid transparent';
    }
  });
  if (tab === 'catch-up') createToast('Catch up with your network','info');
}

// ============================================================
// JOBS PAGE
// ============================================================
function renderJobs() {
  const data = window.LinkedInData;
  const jobs = data?.jobs || _sampleJobs();
  const activeTab = App.state.activeTab['jobs'] || 'recommended';
  const u = App.state.currentUser;
  return `<div class="li-jobs-inner">
    <!-- Left Sidebar -->
    <aside class="li-jobs-sidebar">
      <!-- Mini profile card -->
      <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:8px;">
        <div style="height:56px;background:${u.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};"></div>
        <div style="padding:0 16px 12px;">
          <div style="margin-top:-28px;margin-bottom:8px;">
            <div style="border:2px solid var(--white);border-radius:50%;overflow:hidden;display:inline-block;">${generateAvatar(u.name, 56, u.avatarColor)}</div>
          </div>
          <a href="#profile" style="font-weight:700;font-size:14px;color:var(--text);text-decoration:none;display:block;">${escapeHtml(u.name)}</a>
          <div style="font-size:12px;color:var(--text-2);margin-top:2px;line-height:1.4;">${escapeHtml((u.headline||'').split('|')[0].trim())}</div>
        </div>
      </div>
      <!-- Jobs navigation links -->
      <div class="li-card" style="padding:8px 0;margin-bottom:8px;">
        ${[
          ['💼','Job preferences','#jobs'],
          ['📋','My jobs','#jobs'],
          ['📊','My career insights','#jobs'],
        ].map(([icon,label,href]) =>
          `<a href="${href}" style="display:flex;align-items:center;gap:10px;padding:10px 16px;text-decoration:none;color:var(--text);font-size:14px;font-weight:600;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">${icon} ${label}</a>`
        ).join('')}
        <div style="border-top:1px solid var(--border);margin-top:4px;padding-top:8px;">
          <a href="#jobs" style="display:flex;align-items:center;gap:10px;padding:8px 16px;text-decoration:none;color:var(--text-2);font-size:13px;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">Post a free job</a>
        </div>
      </div>
    </aside>

    <!-- Center: job list -->
    <main class="li-jobs-list">
      <div class="li-card" style="padding:12px 16px;margin-bottom:8px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <div style="flex:1;min-width:180px;display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:4px;padding:8px 12px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search jobs" id="job-search-input" style="border:none;outline:none;font-size:14px;width:100%;" oninput="filterJobs(this.value)"/>
          </div>
          <div style="flex:1;min-width:140px;display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:4px;padding:8px 12px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input type="text" placeholder="Location" id="job-location-input" style="border:none;outline:none;font-size:14px;width:100%;background:transparent;" onkeydown="if(event.key==='Enter')filterJobsBySearch()"/>
          </div>
          <button onclick="filterJobsBySearch()" style="background:var(--blue);color:white;border:none;border-radius:4px;padding:8px 20px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s;" onmouseenter="this.style.opacity='.85'" onmouseleave="this.style.opacity='1'">Search</button>
        </div>
      </div>

      <div class="li-card" style="padding:0;overflow:hidden;">
        <div style="padding:12px 16px 0;border-bottom:1px solid var(--border);">
          <div style="font-size:16px;font-weight:700;margin-bottom:10px;">Top job picks for you</div>
          <div style="display:flex;border-bottom:none;gap:0;">
            ${['recommended','applied','saved'].map(tab => `<button onclick="switchJobTab('${tab}')" id="job-tab-${tab}" style="padding:8px 16px 12px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:${activeTab===tab?'700':'400'};color:${activeTab===tab?'var(--blue)':'var(--text-2)'};border-bottom:${activeTab===tab?'2px solid var(--blue)':'2px solid transparent'};margin-bottom:-1px;">${tab.charAt(0).toUpperCase()+tab.slice(1)}</button>`).join('')}
          </div>
        </div>
        <div id="jobs-list" style="padding:0;">
          ${jobs.map(j => renderJobCard(j)).join('')}
        </div>
      </div>
    </main>

    <aside class="li-jobs-detail" id="job-detail-panel">
      ${(() => { const firstJob = jobs[0]; if (firstJob) { App.state._activeJobId = App.state._activeJobId || firstJob.id; return renderJobDetail(App.state._activeJobId || firstJob.id); } return `<div class="li-card" style="padding:24px;text-align:center;color:var(--text-2);"><svg viewBox="0 0 48 48" width="64" height="64" style="margin:0 auto 12px;display:block;"><path d="M40 12H32V8a4 4 0 00-4-4h-8a4 4 0 00-4 4v4H8a4 4 0 00-4 4v24a4 4 0 004 4h32a4 4 0 004-4V16a4 4 0 00-4-4zm-16-4h8v4h-8V8z" fill="var(--border)"/></svg><div style="font-size:20px;font-weight:600;color:var(--text);margin-bottom:8px;">Find your next job</div><div style="font-size:14px;">Click on a job to see details</div></div>`; })()}
    </aside>
  </div>`;
}

function _sampleJobs() {
  return [
    { id:1, title:'Senior Software Engineer', company:'Google', location:'Mountain View, CA', type:'Full-time', remote:'Hybrid', posted:'2 days ago', salary:'$180K - $250K', easyApply:true, description:'We are looking for a talented Senior Software Engineer to join our team...', skills:['Python','Go','Distributed Systems'], applicants:234 },
    { id:2, title:'Product Manager', company:'Meta', location:'Menlo Park, CA', type:'Full-time', remote:'On-site', posted:'1 week ago', salary:'$160K - $220K', easyApply:false, description:'Join Meta as a Product Manager and help shape the future of social connectivity...', skills:['Product Strategy','Roadmapping','SQL'], applicants:567 },
    { id:3, title:'Data Scientist', company:'Netflix', location:'Los Gatos, CA', type:'Full-time', remote:'Remote', posted:'3 days ago', salary:'$150K - $200K', easyApply:true, description:'Netflix is seeking a Data Scientist to help drive personalization...', skills:['Python','Machine Learning','Statistics'], applicants:389 },
    { id:4, title:'UX Designer', company:'Apple', location:'Cupertino, CA', type:'Full-time', remote:'Hybrid', posted:'5 days ago', salary:'$140K - $190K', easyApply:false, description:'Join Apple to design beautiful, intuitive experiences...', skills:['Figma','Prototyping','User Research'], applicants:412 },
    { id:5, title:'DevOps Engineer', company:'Amazon', location:'Seattle, WA', type:'Full-time', remote:'On-site', posted:'1 day ago', salary:'$160K - $210K', easyApply:true, description:'AWS is looking for a talented DevOps Engineer...', skills:['AWS','Kubernetes','Terraform'], applicants:198 }
  ];
}

function _jobPostedLabel(job) {
  if (job.postedDays !== undefined) {
    if (job.postedDays === 0) return 'Today';
    if (job.postedDays === 1) return '1 day ago';
    return job.postedDays + ' days ago';
  }
  return job.posted || '';
}

function _jobRemoteLabel(job) {
  // data.js: remote is boolean + location string contains type
  // fallback: remote is a string like 'Remote', 'Hybrid', 'On-site'
  if (typeof job.remote === 'string') return job.remote;
  if (job.remote === true) return 'Remote';
  return '';
}

function renderJobCard(job) {
  const saved = App.state.savedJobs.has(job.id);
  const logo = job.companyLogo || job.logo || null;
  const remoteLabel = _jobRemoteLabel(job);
  const isRemote = remoteLabel === 'Remote' || job.remote === true;
  return `<div class="li-job-card ${App.state._activeJobId===job.id?'active':''}" id="jcard-${job.id}" onclick="showJobDetail(${job.id})">
    <div class="li-job-card__logo" style="${logo ? 'background:var(--bg);font-size:24px;' : 'background:'+getAvatarColor(job.company)+';color:white;font-weight:700;font-size:16px;'}">${logo || getInitials(job.company)}</div>
    <div class="li-job-card__info">
      <div class="li-job-card__title">${escapeHtml(job.title)}</div>
      <div class="li-job-card__company">${escapeHtml(job.company)}</div>
      <div class="li-job-card__location">${escapeHtml(job.location)}</div>
      <div class="li-job-card__meta">
        ${job.easyApply ? `<span class="li-job-card__badge li-job-card__badge--easy">Easy Apply</span>` : ''}
        ${isRemote ? `<span class="li-job-card__badge li-job-card__badge--remote">Remote</span>` : remoteLabel ? `<span class="li-job-card__badge">${escapeHtml(remoteLabel)}</span>` : ''}
        <span class="li-job-card__time">${escapeHtml(_jobPostedLabel(job))}</span>
      </div>
    </div>
    <button class="li-job-card__save ${saved?'saved':''}" onclick="toggleSaveJob(${job.id}, this, event)" title="${saved?'Unsave':'Save'}">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="${saved?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
    </button>
  </div>`;
}

function toggleSaveJob(jobId, btn, event) {
  if (event) event.stopPropagation();
  const saved = App.state.savedJobs.has(jobId);
  if (saved) { App.state.savedJobs.delete(jobId); btn.querySelector('svg').setAttribute('fill','none'); createToast('Job unsaved','info'); }
  else { App.state.savedJobs.add(jobId); btn.querySelector('svg').setAttribute('fill','var(--blue)'); createToast('Job saved!','success'); }
}

function showJobDetail(jobId) {
  const data = window.LinkedInData;
  const jobs = data?.jobs || _sampleJobs();
  const job = jobs.find(j => j.id === jobId) || jobs[0];
  if (!job) return;
  const panel = document.getElementById('job-detail-panel');
  if (panel) { panel.innerHTML = renderJobDetail(jobId); }
  App.state._activeJobId = jobId;
  document.querySelectorAll('.li-job-card').forEach(c => c.classList.remove('active'));
  const selected = document.getElementById('jcard-' + jobId);
  if (selected) selected.classList.add('active');
}

function switchJobTab(tab) {
  App.state.activeTab['jobs'] = tab;
  ['recommended','applied','saved'].forEach(t => {
    const btn = document.getElementById('job-tab-' + t);
    if (btn) { btn.style.fontWeight = t===tab?'600':'400'; btn.style.color = t===tab?'var(--blue)':'var(--text-2)'; btn.style.borderBottom = t===tab?'2px solid var(--blue)':'2px solid transparent'; }
  });
  const list = document.getElementById('jobs-list');
  if (!list) return;
  const data = window.LinkedInData;
  const allJobs = data?.jobs || _sampleJobs();
  let filtered = allJobs;
  if (tab === 'saved') filtered = allJobs.filter(j => App.state.savedJobs.has(j.id));
  if (tab === 'applied') filtered = [];
  if (filtered.length === 0) list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-2);">${tab === 'applied' ? 'No applications yet. Start applying!' : 'No saved jobs.'}</div>`;
  else list.innerHTML = filtered.map(j => renderJobCard(j)).join('');
}

function filterJobsBySearch() {
  const q = (document.getElementById('job-search-input')?.value||'').toLowerCase();
  const loc = (document.getElementById('job-location-input')?.value||'').toLowerCase();
  const data = window.LinkedInData;
  const allJobs = data?.jobs || _sampleJobs();
  const filtered = allJobs.filter(j =>
    (!q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) &&
    (!loc || (j.location||'').toLowerCase().includes(loc))
  );
  const list = document.getElementById('jobs-list');
  if (!list) return;
  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-2);">
      <div style="font-size:32px;margin-bottom:8px;">🔍</div>
      <div style="font-size:16px;font-weight:600;margin-bottom:4px;">No jobs found</div>
      <div style="font-size:14px;">Try different keywords or location</div>
    </div>`;
  } else {
    App.state._activeJobId = null;
    list.innerHTML = filtered.map(j => renderJobCard(j)).join('');
    if (filtered[0]) showJobDetail(filtered[0].id);
  }
  if (q || loc) createToast(`${filtered.length} job${filtered.length!==1?'s':''} found`,'info');
}
function filterJobs(query) {
  const data = window.LinkedInData;
  const allJobs = data?.jobs || _sampleJobs();
  const q = (query || '').toLowerCase();
  const filtered = q ? allJobs.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.location||'').toLowerCase().includes(q)) : allJobs;
  const list = document.getElementById('jobs-list');
  if (list) {
    if (filtered.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-2);">
        <div style="font-size:32px;margin-bottom:8px;">🔍</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:4px;">No jobs found</div>
        <div style="font-size:14px;">Try different keywords</div>
      </div>`;
    } else {
      list.innerHTML = filtered.map(j => renderJobCard(j)).join('');
    }
  }
}

function switchFeedSort(sort, btn) {
  App.state.feedSort = sort;
  document.querySelectorAll('.feed-sort-pill').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = 'var(--text-2)';
  });
  if (btn) { btn.classList.add('active'); btn.style.background = 'var(--blue)'; btn.style.color = 'white'; }
  const feedPosts = document.getElementById('feed-posts');
  if (!feedPosts) return;
  const posts = [...App.state.feedPosts];
  if (sort === 'Recent') {
    posts.sort((a, b) => (b.timestamp||0) - (a.timestamp||0));
    createToast('Showing most recent posts', 'info');
  } else {
    posts.sort((a, b) => {
      const aR = Object.values(a.reactions||{}).reduce((s,v)=>s+v,0);
      const bR = Object.values(b.reactions||{}).reduce((s,v)=>s+v,0);
      return bR - aR;
    });
    createToast('Showing top posts', 'info');
  }
  feedPosts.innerHTML = posts.map(p => renderPostCard(p)).join('');
}

// ============================================================
// Safe HTML renderer for job descriptions from our own data.js (trusted source)
function _renderJobDescription(desc) {
  if (!desc) {
    return `<p>We are looking for talented individuals to join our growing team.</p>
<h3>Responsibilities</h3><ul>
<li>Design and implement scalable software solutions</li>
<li>Collaborate with product and design teams</li>
<li>Write clean, maintainable code</li>
<li>Participate in code reviews</li>
</ul>
<h3>Requirements</h3><ul>
<li>5+ years of software engineering experience</li>
<li>Strong problem-solving skills</li>
<li>Experience with distributed systems</li>
<li>Excellent communication skills</li>
</ul>`;
  }
  // If it already contains HTML tags, return as-is (trusted data.js content)
  if (/<[a-z][\s\S]*>/i.test(desc)) return desc;
  // Otherwise convert plain text with newlines to paragraphs
  return desc.split('\n\n').map(p => p.trim() ? `<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>` : '').join('');
}

// ============================================================
// JOB DETAIL PAGE
// ============================================================
function renderJobDetail(jobId) {
  const data = window.LinkedInData;
  const jobs = data?.jobs || _sampleJobs();
  const job = jobs.find(j => String(j.id) === String(jobId)) || jobs[0];
  if (!job) return `<div class="li-card" style="padding:32px;text-align:center;color:var(--text-2);">Job not found.</div>`;
  const saved = App.state.savedJobs.has(job.id);
  const similarJobs = jobs.filter(j => j.id !== job.id).slice(0,3);
  const logo = job.companyLogo || job.logo || null;
  const remoteLabel = _jobRemoteLabel(job);
  const postedLabel = _jobPostedLabel(job);
  const applicantsLabel = job.applicants ? (String(job.applicants).startsWith('Over') ? job.applicants : formatNumber(job.applicants) + '+') : '100+';
  return `<div class="li-card" style="padding:24px;position:relative;">
    ${job.matchScore ? `<div style="position:absolute;top:16px;right:16px;background:${job.matchScore>=80?'var(--green)':job.matchScore>=60?'var(--orange)':'var(--text-3)'};color:white;border-radius:12px;padding:3px 10px;font-size:12px;font-weight:700;">${job.matchScore}% match</div>` : ''}
    <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:20px;">
      <div style="flex-shrink:0;width:64px;height:64px;${logo?'background:var(--bg);':'background:'+getAvatarColor(job.company)+';'}border-radius:8px;display:flex;align-items:center;justify-content:center;${logo?'font-size:28px;':'color:white;font-weight:700;font-size:22px;'}">${logo || getInitials(job.company)}</div>
      <div style="flex:1;padding-right:60px;">
        <h1 style="font-size:20px;font-weight:700;margin:0 0 4px;">${escapeHtml(job.title)}</h1>
        <div style="font-size:15px;color:var(--text);margin-bottom:4px;">
          <a href="#company/${job.companyId||1}" style="color:var(--blue);text-decoration:none;font-weight:600;">${escapeHtml(job.company)}</a>
        </div>
        <div style="font-size:13px;color:var(--text-2);">${escapeHtml(job.location)}${remoteLabel ? ' · ' + escapeHtml(remoteLabel) : ''}${job.type ? ' · ' + escapeHtml(job.type) : ''}</div>
        <div style="font-size:13px;color:var(--text-2);margin-top:4px;">${postedLabel ? 'Posted ' + escapeHtml(postedLabel) + ' · ' : ''}${applicantsLabel} applicants</div>
        ${job.salary ? `<div style="font-size:14px;color:var(--green);font-weight:600;margin-top:4px;">💰 ${escapeHtml(job.salary)}</div>` : ''}
      </div>
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
      ${job.easyApply
        ? `<button onclick="App.openModal('apply-modal')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:10px 24px;font-size:15px;font-weight:600;cursor:pointer;">Easy Apply</button>`
        : `<button onclick="createToast('Redirecting to company site...','info')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:10px 24px;font-size:15px;font-weight:600;cursor:pointer;">Apply Now</button>`
      }
      <button onclick="toggleSaveJob(${job.id}, this, null)" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:10px 24px;font-size:15px;font-weight:600;cursor:pointer;">${saved ? '✓ Saved' : 'Save'}</button>
      <button onclick="createToast('More options','info')" style="border:1px solid var(--border);color:var(--text);background:none;border-radius:50%;width:42px;height:42px;font-size:18px;cursor:pointer;">&#8943;</button>
    </div>

    <div style="padding:16px;background:var(--bg);border-radius:8px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:8px;">Your skills match this job</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${(job.skills||['JavaScript','React']).map(s => `<span style="background:var(--white);border:1px solid var(--border);border-radius:14px;padding:4px 12px;font-size:12px;">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>

    <!-- Application insights -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-radius:8px;overflow:hidden;margin-bottom:20px;">
      ${[
        ['👤', job.applicants ? formatNumber(job.applicants) + '+' : '200+', 'Applicants'],
        ['🎯', job.matchScore ? job.matchScore + '%' : 'Good', 'Match score'],
        ['⚡', job.easyApply ? 'Yes' : 'External', 'Easy Apply'],
      ].map(([icon,val,label]) => `<div style="background:var(--bg);padding:14px 8px;text-align:center;">
        <div style="font-size:20px;margin-bottom:4px;">${icon}</div>
        <div style="font-size:15px;font-weight:700;color:var(--text);">${val}</div>
        <div style="font-size:11px;color:var(--text-2);">${label}</div>
      </div>`).join('')}
    </div>

    <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;">About the job</h2>
    <div class="job-description" style="font-size:14px;color:var(--text);line-height:1.7;margin-bottom:24px;">${_renderJobDescription(job.description)}</div>

    <!-- Meet the hiring team -->
    <div style="border-top:1px solid var(--border);padding-top:20px;margin-bottom:20px;">
      <h2 style="font-size:18px;font-weight:700;margin:0 0 14px;">Meet the hiring team</h2>
      ${(() => {
        const data = window.LinkedInData;
        const recruiters = data?.users?.slice(2,4) || [
          { id:3, name:'Marcus Williams', headline:'Talent Acquisition at ' + job.company, avatarColor: null },
          { id:4, name:'Emma Davis', headline:'HR Manager at ' + job.company, avatarColor: null }
        ];
        return recruiters.slice(0,2).map(r => `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          ${generateAvatar(r.name, 48, r.avatarColor)}
          <div style="flex:1;">
            <a href="#profile/${r.id}" style="font-weight:700;font-size:14px;color:var(--text);text-decoration:none;">${escapeHtml(r.name)}</a>
            <div style="font-size:12px;color:var(--text-2);">${escapeHtml((r.headline||'').split('|')[0])}</div>
            <div style="font-size:12px;color:var(--blue);margin-top:1px;">Recruiter · 1st</div>
          </div>
          <button onclick="App.navigate('messaging');createToast('Message sent to ${escapeHtml(r.name)}','success')" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:16px;padding:5px 14px;font-size:13px;font-weight:600;cursor:pointer;">Message</button>
        </div>`).join('');
      })()}
    </div>

    ${similarJobs.length > 0 ? `<div style="border-top:1px solid var(--border);padding-top:20px;">
      <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;">More jobs like this</h2>
      ${similarJobs.map(j => {
        const jLogo = j.companyLogo || j.logo || null;
        return `<div style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="showJobDetail(${j.id})">
          <div style="flex-shrink:0;width:44px;height:44px;${jLogo?'background:var(--bg);font-size:22px;':'background:'+getAvatarColor(j.company)+';color:white;font-weight:700;font-size:16px;'}border-radius:8px;display:flex;align-items:center;justify-content:center;">${jLogo || getInitials(j.company)}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:14px;color:var(--blue);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(j.title)}</div>
            <div style="font-size:13px;color:var(--text);">${escapeHtml(j.company)}</div>
            <div style="font-size:12px;color:var(--text-2);">${escapeHtml(j.location)} · ${escapeHtml(_jobPostedLabel(j))}</div>
          </div>
          <button class="li-job-card__save" onclick="toggleSaveJob(${j.id},this,event)" title="Save">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          </button>
        </div>`;
      }).join('')}
    </div>` : ''}

    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:16px;">
      <button onclick="createToast('Job shared!','success')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:13px;display:flex;align-items:center;gap:4px;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
        Share
      </button>
      <button onclick="createToast('Job reported','info')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:13px;display:flex;align-items:center;gap:4px;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Report
      </button>
    </div>
  </div>`;
}

// ============================================================
// OUTREACH MESSAGE GUIDE — CONSTANTS
// ============================================================
const _OUTREACH_GOALS = [
  { key: 'advice',   icon: '💡', label: 'Ask for Advice',    desc: 'Career guidance from a pro' },
  { key: 'job',      icon: '💼', label: 'Job / Internship',  desc: 'Express interest in a role' },
  { key: 'network',  icon: '🤝', label: 'Build Network',     desc: 'Connect in your field' },
  { key: 'mentor',   icon: '🎓', label: 'Find a Mentor',     desc: 'Request ongoing guidance' },
  { key: 'followup', icon: '✉️',  label: 'Follow Up',         desc: 'After meeting or applying' },
  { key: 'referral', icon: '⭐', label: 'Ask for Referral',  desc: 'Request a job referral' },
];

const _OUTREACH_TEMPLATES = {
  advice: [
    { tone: 'Warm',
      template: (d) => `Hi ${d.recipient||'[Name]'},\n\nI'm ${d.yourRole||'[your name/major]'} and I've been following your work in ${d.field||'[their field]'}. I'd love to learn from your experience — would you have 15–20 minutes for a quick chat sometime?\n\nThanks so much for considering it!` },
    { tone: 'Professional',
      template: (d) => `Hello ${d.recipient||'[Name]'},\n\nMy name is ${d.yourRole||'[your name]'} and I'm currently studying ${d.field||'[field]'}. I came across your profile and was impressed by your background. I'd greatly appreciate any insights you could share about your career path.\n\nWould you be open to a brief informational chat?` },
  ],
  job: [
    { tone: 'Direct',
      template: (d) => `Hi ${d.recipient||'[Name]'},\n\nI saw the ${d.role||'[role]'} opening at ${d.company||'[Company]'} and I'm very interested! I'm a ${d.yourRole||'[your background]'} with relevant skills and I'd love to learn more about the team.\n\nWould you be open to a quick conversation?` },
    { tone: 'Enthusiastic',
      template: (d) => `Hello ${d.recipient||'[Name]'},\n\nI'm really excited about the ${d.role||'[role]'} role at ${d.company||'[Company]'} — your team's work in ${d.field||'[field]'} is exactly where I want to grow. As a ${d.yourRole||'[your background]'}, I believe I'd be a great fit.\n\nI'd love to connect and learn more!` },
  ],
  network: [
    { tone: 'Friendly',
      template: (d) => `Hi ${d.recipient||'[Name]'},\n\nI'm ${d.yourRole||'[your name/role]'} and I'm building my network in ${d.field||'[field/industry]'}. Your profile really stood out to me!\n\nI'd love to connect and follow your work. Hope you're open to it!` },
    { tone: 'Professional',
      template: (d) => `Hello ${d.recipient||'[Name]'},\n\nI'm ${d.yourRole||'[your name]'}, a ${d.field||'[field]'} professional${d.company?' at '+d.company:''}. I came across your profile and would love to add you to my network for potential future collaboration.\n\nLooking forward to connecting!` },
  ],
  mentor: [
    { tone: 'Sincere',
      template: (d) => `Hi ${d.recipient||'[Name]'},\n\nI'm ${d.yourRole||'[your name/major]'} and I've been really inspired by your journey in ${d.field||'[field]'}. I'm at an early stage in my career and would be incredibly grateful for any guidance you could offer.\n\nWould you be open to a mentoring relationship, even informally?` },
    { tone: 'Humble',
      template: (d) => `Hello ${d.recipient||'[Name]'},\n\nMy name is ${d.yourRole||'[your name]'} and I'm working toward a career in ${d.field||'[field]'}. Your path has been really motivating to read about. Even a short conversation would mean a lot to me.\n\nThank you for your time!` },
  ],
  followup: [
    { tone: 'Prompt',
      template: (d) => `Hi ${d.recipient||'[Name]'},\n\nIt was great ${d.context||'meeting you recently'}! I wanted to follow up and say I really enjoyed our conversation${d.company?' about '+d.company:''}.\n\nI'd love to stay in touch — looking forward to connecting further!` },
    { tone: 'Professional',
      template: (d) => `Hello ${d.recipient||'[Name]'},\n\nI'm following up after ${d.context||'our recent interaction'}. Thank you for your time — I found it really valuable.\n\n${d.company?'I remain very interested in '+d.company+' and ':''}I hope we can stay connected!` },
  ],
  referral: [
    { tone: 'Gracious',
      template: (d) => `Hi ${d.recipient||'[Name]'},\n\nI hope you're doing well! I'm ${d.yourRole||'[your name]'} and I recently applied for the ${d.role||'[role]'} position at ${d.company||'[Company]'}. I know this is a big ask, but would you be comfortable referring me?\n\nI'd be happy to share my resume and portfolio. Thank you so much!` },
    { tone: 'Direct',
      template: (d) => `Hello ${d.recipient||'[Name]'},\n\nI applied for the ${d.role||'[role]'} role at ${d.company||'[Company]'} and noticed you work there. I'm ${d.yourRole||'[your background]'} — would you be open to referring me if you think I'm a good fit?\n\nI can send over my materials anytime. Thanks!` },
  ],
};

const _OUTREACH_TIPS = {
  advice:   ['Keep it under 150 words — professionals are busy', 'Mention a specific project or article of theirs', 'Ask for a specific time commitment (e.g. 15 min)', "Don't ask for a job — just a conversation"],
  job:      ['Reference the specific role title', "Show you've researched the company", 'Mention one concrete skill or achievement', 'Attach your resume or portfolio link'],
  network:  ['Explain why you want to connect specifically', 'Find common ground (school, interest, city)', 'Keep it short and genuine', "Don't pitch anything on the first message"],
  mentor:   ["Be specific about what guidance you're seeking", "Show you've done your homework on their work", 'Make it easy to say no — low pressure ask', 'Offer flexibility: even async advice helps'],
  followup: ['Send within 24–48 hours of meeting', 'Reference a specific moment from your conversation', 'Include a next step or question', 'Keep it brief — they remember you'],
  referral: ["Only ask someone who knows your work quality", 'Make it easy — provide resume + role link', 'Give them an out ("only if you feel comfortable")', 'Thank them regardless of outcome'],
};

// ============================================================
// MESSAGING PAGE
// ============================================================
function renderMessaging(conversationId) {
  const data = window.LinkedInData;
  const conversations = data?.conversations || _sampleConversations();
  // Auto-select first conversation if none specified
  const activeConv = conversationId
    ? conversations.find(c => String(c.id) === String(conversationId))
    : conversations[0] || null;

  return `<div class="li-messaging-inner">
    <div class="li-msg-sidebar">
      <div class="li-msg-sidebar__header">
        <span class="li-msg-sidebar__title">Messaging</span>
        <div style="display:flex;gap:4px;">
          <button class="li-post__options" onclick="createToast('New message','info')" title="New message">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="li-post__options" onclick="createToast('Filters','info')" title="Filters">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
        </div>
      </div>
      <!-- Focused / Other tabs -->
      <div style="display:flex;border-bottom:1px solid var(--border);">
        ${['Focused','Other'].map((tab,i) => `<button onclick="switchMsgTab('${tab.toLowerCase()}')" id="msg-tab-${tab.toLowerCase()}" style="flex:1;padding:10px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:${i===0?'700':'400'};color:${i===0?'var(--blue)':'var(--text-2)'};border-bottom:${i===0?'2px solid var(--blue)':'2px solid transparent'};transition:all 0.15s;">${tab}</button>`).join('')}
      </div>
      <!-- Filter pills -->
      <div id="msg-filter-pills" style="display:flex;gap:6px;padding:8px 10px;overflow-x:auto;flex-shrink:0;scrollbar-width:none;">
        ${['All','Unread','InMail','Starred'].map((pill,i) => `<button onclick="filterMsgPill('${pill.toLowerCase()}')" id="msg-pill-${pill.toLowerCase()}" style="flex-shrink:0;padding:4px 12px;border-radius:16px;border:1px solid var(--border-2);background:${i===0?'var(--blue)':'var(--white)'};color:${i===0?'white':'var(--text-2)'};font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">${pill}</button>`).join('')}
      </div>
      <div class="li-msg-sidebar__search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input type="text" placeholder="Search messages" class="li-msg-search-input" oninput="filterConversations(this.value)"/>
      </div>
      <div class="li-msg-conv-list" id="conversation-list">
        ${conversations.map(c => renderConversationItem(c, activeConv?.id)).join('')}
      </div>
    </div>

    <div class="li-msg-main" id="messaging-chat">
      ${activeConv ? renderChatPanel(activeConv) : `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-2);text-align:center;padding:40px;background:var(--white);">
          <svg viewBox="0 0 64 64" width="80" height="80" style="margin-bottom:16px;"><circle cx="32" cy="32" r="30" fill="var(--border)"/><path d="M32 18c-7.7 0-14 5.6-14 12.5 0 3.9 1.9 7.4 5 9.8v5.2l5-2.8c1.3.4 2.6.6 4 .6 7.7 0 14-5.6 14-12.5S39.7 18 32 18z" fill="var(--text-3)"/></svg>
          <div style="font-size:20px;font-weight:600;color:var(--text);margin-bottom:8px;">Select a message</div>
          <div style="font-size:15px;color:var(--text-2);">Choose from your existing conversations, or start a new one.</div>
          <button onclick="createToast('New message','info')" style="margin-top:20px;background:var(--blue);color:white;border:none;border-radius:20px;padding:10px 24px;font-size:14px;font-weight:600;cursor:pointer;">New message</button>
        </div>`}
    </div>
  </div>`;
}

function _sampleConversations() {
  const now = Date.now();
  return [
    { id:1, name:'Sarah Chen', headline:'Product Manager at Google', lastMessage:'Thanks for connecting! I wanted to ask...', time: now-1800000, unread:2, online:true, messages:[
      { id:1, from:'them', text:'Hi! Thanks for connecting.', time: now-7200000 },
      { id:2, from:'me', text:'Hello Sarah! Great to connect.', time: now-3600000 },
      { id:3, from:'them', text:'Thanks for connecting! I wanted to ask about your experience with React.', time: now-1800000 }
    ]},
    { id:2, name:'Marcus Williams', headline:'CTO at StartupXYZ', lastMessage:'Let me know if you are interested', time: now-86400000, unread:0, online:false, messages:[
      { id:1, from:'them', text:'Hey! I saw your profile and wanted to reach out.', time: now-172800000 },
      { id:2, from:'me', text:'Hi Marcus! Thanks for reaching out.', time: now-162800000 },
      { id:3, from:'them', text:'Let me know if you are interested in chatting about some opportunities.', time: now-86400000 }
    ]},
    { id:3, name:'LinkedIn Recruiter', headline:'Talent Acquisition at TechCorp', tab:'other', lastMessage:'We have an exciting opportunity for you!', time: now-259200000, unread:1, online:false, messages:[
      { id:1, from:'them', text:'Hi there! I came across your profile and I have an exciting opportunity for you!', time: now-259200000 }
    ]},
    { id:4, name:'Emma Davis', headline:'UX Designer at Apple', lastMessage:'That design looks amazing!', time: now-604800000, unread:0, online:true, messages:[
      { id:1, from:'me', text:'Emma, check out this design I just finished.', time: now-700000000 },
      { id:2, from:'them', text:'That design looks amazing! Love the color palette.', time: now-604800000 }
    ]}
  ];
}

function _convNormalize(conv) {
  // Normalize data.js format (participant object) and sample format (flat fields)
  const p = conv.participant || {};
  return {
    id: conv.id,
    name: p.name || conv.name || 'Unknown',
    headline: p.headline || conv.headline || '',
    avatarColor: p.avatarColor || conv.avatarColor || null,
    participantId: p.id || conv.id,
    unread: conv.unreadCount || conv.unread || 0,
    online: conv.isOnline || conv.online || false,
    lastMessage: conv.lastMessage || '',
    time: conv.lastTimestamp ? new Date(conv.lastTimestamp).getTime() : (conv.time || 0),
    messages: (conv.messages || []).map(m => ({
      id: m.id,
      from: m.senderId === 1 ? 'me' : 'them',
      senderName: m.senderId === 1 ? null : (p.name || conv.name || 'User'),
      text: m.text || '',
      time: m.timestamp ? new Date(m.timestamp).getTime() : (m.time || 0),
    })),
  };
}

function renderConversationItem(conv, activeId) {
  const c = _convNormalize(conv);
  const isActive = String(c.id) === String(activeId);
  const tabLabel = (conv.tab||conv.msgTab||'focused');
  return `<div class="li-msg-conv ${isActive?'active':''} ${c.unread?'unread':''}" data-tab="${tabLabel}" data-unread="${c.unread>0?'true':'false'}" onclick="window.location.hash='messaging/${c.id}'">
    <div style="position:relative;flex-shrink:0;">
      <div class="li-msg-conv__photo">${generateAvatar(c.name, 48, c.avatarColor)}</div>
      ${c.online ? `<div style="position:absolute;bottom:2px;right:2px;width:10px;height:10px;background:var(--green);border:2px solid var(--white);border-radius:50%;"></div>` : ''}
    </div>
    <div class="li-msg-conv__info">
      <div class="li-msg-conv__name">
        <span>${escapeHtml(c.name)}</span>
        <span class="li-msg-conv__time">${formatTime(c.time)}</span>
      </div>
      <div class="li-msg-conv__preview">${escapeHtml(c.lastMessage)}</div>
    </div>
    ${c.unread > 0 ? `<span class="li-msg-unread-dot">${c.unread}</span>` : ''}
  </div>`;
}

function renderChatPanel(conv) {
  const c = _convNormalize(conv);
  const messages = c.messages;
  const hasSentMessages = messages.some(m => m.from === 'me');
  return `<div style="display:flex;flex-direction:column;height:100%;background:var(--white);">
    <!-- Chat header -->
    <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;background:var(--white);">
      <a href="#profile/${c.participantId}" style="display:flex;gap:10px;align-items:center;text-decoration:none;">
        <div style="position:relative;flex-shrink:0;">
          <div style="border-radius:50%;overflow:hidden;">${generateAvatar(c.name, 44, c.avatarColor)}</div>
          <div style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;background:${c.online?'var(--green)':'var(--border-2)'};border:2px solid var(--white);border-radius:50%;"></div>
        </div>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--text);">${escapeHtml(c.name)}</div>
          <div style="font-size:12px;color:var(--text-2);display:flex;align-items:center;gap:4px;">
            ${c.online ? `<span style="color:var(--green);">● Active now</span>` : escapeHtml(c.headline)}
          </div>
        </div>
      </a>
      <div style="display:flex;gap:2px;">
        <button onclick="createToast('Voice call','info')" title="Voice call" class="li-post__options">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        </button>
        <button onclick="createToast('Video call started','info')" title="Video call" class="li-post__options">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        </button>
        <button onclick="createToast('More options','info')" title="More" class="li-post__options">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div id="chat-messages-${c.id}" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:4px;background:var(--bg);">
      ${!hasSentMessages ? `<div id="guide-banner-${c.id}" class="li-msg-guide__banner">
        <span class="li-msg-guide__banner-icon">✨</span>
        <div style="min-width:0;">
          <div style="font-weight:700;font-size:13px;color:var(--text);">First time reaching out?</div>
          <div style="font-size:12px;color:var(--text-2);margin-top:2px;line-height:1.4;">Use our Outreach Guide to draft a confident, personalized first message.</div>
        </div>
        <button class="li-msg-guide__banner-btn" onclick="openMessageGuide(${c.id})">Try the Guide</button>
        <button class="li-msg-guide__banner-dismiss" onclick="this.closest('.li-msg-guide__banner').style.display='none'" title="Dismiss" aria-label="Dismiss banner">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>` : ''}
      ${messages.map((m, idx) => {
        const isMe = m.from === 'me';
        const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx+1]?.from === 'me');
        const showTime = idx === messages.length - 1 || Math.abs((messages[idx+1]?.time||0) - m.time) > 300000;
        return `<div style="display:flex;flex-direction:column;align-items:${isMe?'flex-end':'flex-start'};gap:2px;${idx > 0 && messages[idx-1].from !== m.from ? 'margin-top:8px;' : ''}">
          <div style="display:flex;align-items:flex-end;gap:6px;max-width:70%;${isMe?'flex-direction:row-reverse;':''}">
            ${!isMe ? `<div style="flex-shrink:0;${showAvatar?'':'visibility:hidden;'};border-radius:50%;overflow:hidden;">${generateAvatar(c.name, 28, c.avatarColor)}</div>` : ''}
            <div style="background:${isMe?'var(--blue)':'var(--white)'};color:${isMe?'white':'var(--text)'};padding:10px 14px;border-radius:${isMe?'18px 4px 18px 18px':'4px 18px 18px 18px'};font-size:14px;line-height:1.5;box-shadow:0 1px 2px rgba(0,0,0,.08);">${escapeHtml(m.text)}</div>
          </div>
          ${showTime ? `<div style="font-size:10px;color:var(--text-3);margin:1px ${isMe?'4px':'36px'} 0;">${formatTime(m.time)}</div>` : ''}
        </div>`;
      }).join('')}
      <div id="typing-indicator-${c.id}" style="display:none;padding-left:34px;">
        <div style="background:var(--white);border-radius:12px;padding:8px 14px;display:inline-flex;gap:4px;box-shadow:0 1px 2px rgba(0,0,0,.1);">
          <span style="width:6px;height:6px;background:var(--text-3);border-radius:50%;animation:typing-dot 1.2s infinite;"></span>
          <span style="width:6px;height:6px;background:var(--text-3);border-radius:50%;animation:typing-dot 1.2s 0.2s infinite;"></span>
          <span style="width:6px;height:6px;background:var(--text-3);border-radius:50%;animation:typing-dot 1.2s 0.4s infinite;"></span>
        </div>
      </div>
    </div>

    <!-- Outreach Guide panel (slides up above input) -->
    ${_renderMessageGuide(conv)}

    <!-- Input area -->
    <div style="padding:10px 12px;border-top:1px solid var(--border);background:var(--white);flex-shrink:0;">
      <div style="display:flex;gap:6px;align-items:flex-end;border:1.5px solid var(--border-2);border-radius:8px;padding:6px 10px;background:var(--white);" onfocusin="this.style.borderColor='var(--blue)'" onfocusout="this.style.borderColor='var(--border-2)'">
        <div style="display:flex;gap:4px;flex-shrink:0;align-items:center;">
          <button onclick="createToast('Attach','info')" style="background:none;border:none;cursor:pointer;color:var(--text-2);padding:2px;" title="Attach"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></button>
          <button onclick="createToast('Add image','info')" style="background:none;border:none;cursor:pointer;color:var(--text-2);padding:2px;" title="Image"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></button>
          <button onclick="createToast('Add emoji','info')" style="background:none;border:none;cursor:pointer;color:var(--text-2);padding:2px;font-size:16px;" title="Emoji">😊</button>
          <button class="li-msg-guide__trigger" onclick="openMessageGuide(${c.id})" title="Outreach Guide — get help drafting your first message">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4m0 4h.01"/></svg>
            ✨ Guide
          </button>
        </div>
        <textarea id="msg-input-${c.id}" placeholder="Write a message…" style="flex:1;border:none;outline:none;font-size:14px;resize:none;max-height:100px;font-family:inherit;background:transparent;line-height:1.4;" rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage(${c.id})}" oninput="autoResizeTextarea(this)"></textarea>
        <button onclick="sendMessage(${c.id})" style="background:none;border:none;cursor:pointer;flex-shrink:0;color:var(--blue);" title="Send">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        </button>
      </div>
    </div>
  </div>`;
}

// ============================================================
// OUTREACH MESSAGE GUIDE — FUNCTIONS
// ============================================================
function openMessageGuide(convId) {
  const panel = document.getElementById('msg-guide-' + convId);
  if (!panel) return;
  if (panel.style.display !== 'none') { closeMessageGuide(convId); return; }
  if (!App.state.messageGuide[convId]) {
    App.state.messageGuide[convId] = { step: 1, goal: null, variantIdx: 0, details: {} };
  } else {
    // Keep existing goal/details but go back to step 1 so user can review or change
    App.state.messageGuide[convId].step = 1;
  }
  panel.style.display = 'flex';
  panel.style.animation = 'slideUpGuide 0.25s ease';
  _showGuideStep(convId, App.state.messageGuide[convId].step);
  // Update trigger button to show "active" state
  const trigger = panel.closest('[style*="flex-direction:column"]')?.querySelector('.li-msg-guide__trigger');
  if (trigger) trigger.style.background = 'rgba(10,102,194,0.12)';
  // Escape key closes the guide
  const handler = (e) => { if (e.key === 'Escape') { closeMessageGuide(convId); document.removeEventListener('keydown', handler); } };
  document.addEventListener('keydown', handler);
}

function closeMessageGuide(convId) {
  const panel = document.getElementById('msg-guide-' + convId);
  if (!panel) return;
  panel.style.animation = 'slideDownGuide 0.2s ease forwards';
  setTimeout(() => { panel.style.display = 'none'; }, 200);
}

function _showGuideStep(convId, step) {
  const state = App.state.messageGuide[convId];
  if (!state) return;
  state.step = step;
  [1, 2, 3].forEach(s => {
    const dot = document.getElementById('guide-dot-' + convId + '-' + s);
    if (dot) dot.className = 'li-msg-guide__dot' + (s === step ? ' active' : s < step ? ' done' : '');
    const stepEl = document.getElementById('guide-step-' + convId + '-' + s);
    if (stepEl) stepEl.style.display = s === step ? 'block' : 'none';
  });
  const backBtn = document.getElementById('guide-back-' + convId);
  const nextBtn = document.getElementById('guide-next-' + convId);
  if (backBtn) backBtn.style.display = step > 1 ? 'inline-flex' : 'none';
  if (nextBtn) {
    if (step === 3) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'inline-flex';
      const label = step === 2 ? 'Preview' : 'Next';
      nextBtn.innerHTML = label + ' <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    }
  }
  if (step === 3) previewOutreachMessage(convId);
}

function selectMessageGoal(convId, goalKey) {
  if (!App.state.messageGuide[convId]) App.state.messageGuide[convId] = { step: 1, goal: null, variantIdx: 0, details: {} };
  App.state.messageGuide[convId].goal = goalKey;
  App.state.messageGuide[convId].variantIdx = 0;
  _OUTREACH_GOALS.forEach(g => {
    const tile = document.getElementById('goal-tile-' + convId + '-' + g.key);
    if (tile) tile.className = 'li-msg-guide__goal-tile' + (g.key === goalKey ? ' selected' : '');
  });
  _updateGuideTips(convId);
  setTimeout(() => _showGuideStep(convId, 2), 300);
}

function _updateGuideTips(convId) {
  const state = App.state.messageGuide[convId];
  if (!state || !state.goal) return;
  const tips = _OUTREACH_TIPS[state.goal] || [];
  const tipsEl = document.getElementById('guide-tips-' + convId);
  if (tipsEl) {
    tipsEl.innerHTML = tips.map(t =>
      `<div class="li-msg-guide__tip"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--blue)" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>${escapeHtml(t)}</span></div>`
    ).join('');
  }
}

function previewOutreachMessage(convId) {
  const state = App.state.messageGuide[convId];
  if (!state || !state.goal) return;
  const variants = _OUTREACH_TEMPLATES[state.goal] || [];
  if (!variants.length) return;
  const variant = variants[state.variantIdx % variants.length];
  const details = {
    recipient: (document.getElementById('guide-recipient-' + convId) || {}).value || '',
    yourRole:  (document.getElementById('guide-yourrole-'  + convId) || {}).value || '',
    field:     (document.getElementById('guide-field-'     + convId) || {}).value || '',
    company:   (document.getElementById('guide-company-'   + convId) || {}).value || '',
    role:      (document.getElementById('guide-role-'      + convId) || {}).value || '',
    context:   (document.getElementById('guide-context-'   + convId) || {}).value || '',
  };
  state.details = details;
  const text = variant.template(details);
  state.currentText = text;
  const preview = document.getElementById('guide-preview-' + convId);
  if (preview) { preview.value = text; _updateGuideCharCount(convId); }
  const toneBadge = document.getElementById('guide-tone-' + convId);
  if (toneBadge) toneBadge.textContent = variant.tone;
  const variantLabel = document.getElementById('guide-variant-label-' + convId);
  if (variantLabel) variantLabel.textContent = 'v' + (state.variantIdx + 1) + ' of ' + variants.length;
}

function cycleOutreachVariant(convId) {
  const state = App.state.messageGuide[convId];
  if (!state || !state.goal) return;
  const variants = _OUTREACH_TEMPLATES[state.goal] || [];
  state.variantIdx = (state.variantIdx + 1) % variants.length;
  // Flash feedback on preview
  const preview = document.getElementById('guide-preview-' + convId);
  if (preview) {
    preview.style.transition = 'opacity 0.12s';
    preview.style.opacity = '0.3';
    setTimeout(() => { preview.style.opacity = '1'; previewOutreachMessage(convId); }, 130);
  } else {
    previewOutreachMessage(convId);
  }
}

function insertOutreachMessage(convId) {
  const state = App.state.messageGuide[convId];
  const preview = document.getElementById('guide-preview-' + convId);
  const text = (preview && preview.value.trim()) || (state && state.currentText) || '';
  if (!text) { createToast('Nothing to insert — write or generate a message first.', 'info'); return; }
  const input = document.getElementById('msg-input-' + convId);
  if (input) { input.value = text; autoResizeTextarea(input); input.focus(); }
  const banner = document.getElementById('guide-banner-' + convId);
  if (banner) banner.style.display = 'none';
  closeMessageGuide(convId);
  createToast('Message drafted! Review and send when ready.', 'success');
}

function _updateGuideCharCount(convId) {
  const preview = document.getElementById('guide-preview-' + convId);
  const counter = document.getElementById('guide-char-count-' + convId);
  if (!preview || !counter) return;
  const len = preview.value.length;
  const ideal = 300;
  counter.textContent = len + ' chars' + (len > ideal ? ' — consider trimming' : len < 80 ? ' — add more detail' : ' ✓ good length');
  counter.style.color = len > ideal ? 'var(--orange)' : len < 80 && len > 0 ? 'var(--text-3)' : len === 0 ? 'var(--text-3)' : 'var(--green)';
}

function advanceGuideStep(convId) {
  const state = App.state.messageGuide[convId];
  if (!state) return;
  if (state.step === 1) {
    if (!state.goal) { createToast('Choose a goal to continue', 'info'); return; }
    _showGuideStep(convId, 2);
  } else if (state.step === 2) {
    _showGuideStep(convId, 3);
  }
}

function _renderMessageGuide(conv) {
  const c = _convNormalize(conv);
  const id = c.id;
  // Restore previously selected goal (if returning to this conversation)
  const savedState = App.state.messageGuide[id];
  const savedGoal = savedState ? savedState.goal : null;
  return `<div id="msg-guide-${id}" class="li-msg-guide" style="display:none;" role="complementary" aria-label="Outreach message guide">
    <!-- Header -->
    <div class="li-msg-guide__header">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:15px;line-height:1;">✨</span>
        <span class="li-msg-guide__title">Outreach Guide</span>
        <div class="li-msg-guide__dots">
          <div id="guide-dot-${id}-1" class="li-msg-guide__dot active"><span>1</span></div>
          <div class="li-msg-guide__dot-line"></div>
          <div id="guide-dot-${id}-2" class="li-msg-guide__dot"><span>2</span></div>
          <div class="li-msg-guide__dot-line"></div>
          <div id="guide-dot-${id}-3" class="li-msg-guide__dot"><span>3</span></div>
        </div>
      </div>
      <button class="li-msg-guide__close" onclick="closeMessageGuide(${id})" title="Close guide" aria-label="Close guide">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Body: steps + tips sidebar -->
    <div class="li-msg-guide__body">
      <div class="li-msg-guide__steps">

        <!-- Step 1: Choose goal -->
        <div id="guide-step-${id}-1" class="li-msg-guide__step">
          <div class="li-msg-guide__step-label">What's the purpose of your message?</div>
          <div class="li-msg-guide__goals">
            ${_OUTREACH_GOALS.map(g => `<div id="goal-tile-${id}-${g.key}" class="li-msg-guide__goal-tile${savedGoal === g.key ? ' selected' : ''}" onclick="selectMessageGoal(${id},'${g.key}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')selectMessageGoal(${id},'${g.key}')">
              <span class="li-msg-guide__goal-icon">${g.icon}</span>
              <span class="li-msg-guide__goal-label">${g.label}</span>
              <span class="li-msg-guide__goal-desc">${g.desc}</span>
            </div>`).join('')}
          </div>
        </div>

        <!-- Step 2: Fill details -->
        <div id="guide-step-${id}-2" class="li-msg-guide__step" style="display:none;">
          <div class="li-msg-guide__step-label">Personalize your message</div>
          <div class="li-msg-guide__fields">
            <div class="li-msg-guide__field-row">
              <label>Their first name</label>
              <input id="guide-recipient-${id}" class="li-msg-guide__input" placeholder="e.g. Sarah" />
            </div>
            <div class="li-msg-guide__field-row">
              <label>Your name / major</label>
              <input id="guide-yourrole-${id}" class="li-msg-guide__input" placeholder="e.g. CS sophomore at NJIT" />
            </div>
            <div class="li-msg-guide__field-row">
              <label>Their field / industry</label>
              <input id="guide-field-${id}" class="li-msg-guide__input" placeholder="e.g. Software Engineering" />
            </div>
            <div class="li-msg-guide__field-row">
              <label>Company <span style="font-weight:400;color:var(--text-3);">(optional)</span></label>
              <input id="guide-company-${id}" class="li-msg-guide__input" placeholder="e.g. Google" />
            </div>
            <div class="li-msg-guide__field-row">
              <label>Role / position <span style="font-weight:400;color:var(--text-3);">(optional)</span></label>
              <input id="guide-role-${id}" class="li-msg-guide__input" placeholder="e.g. SWE Intern" />
            </div>
            <div class="li-msg-guide__field-row">
              <label>Context <span style="font-weight:400;color:var(--text-3);">(optional)</span></label>
              <input id="guide-context-${id}" class="li-msg-guide__input" placeholder="e.g. met at career fair…" />
            </div>
          </div>
        </div>

        <!-- Step 3: Preview & insert -->
        <div id="guide-step-${id}-3" class="li-msg-guide__step" style="display:none;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
            <div class="li-msg-guide__step-label" style="margin:0;">Review &amp; edit your message</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="li-msg-guide__tone-badge" id="guide-tone-${id}">Warm</span>
              <span id="guide-variant-label-${id}" style="font-size:10px;color:var(--text-3);">v1 of 2</span>
              <button class="li-msg-guide__cycle-btn" onclick="cycleOutreachVariant(${id})" title="Try another version">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
                Try another
              </button>
            </div>
          </div>
          <textarea id="guide-preview-${id}" class="li-msg-guide__preview" placeholder="Your message will appear here…" rows="6" oninput="_updateGuideCharCount(${id})"></textarea>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
            <span id="guide-char-count-${id}" style="font-size:11px;color:var(--text-3);">0 / 300</span>
            <button class="li-msg-guide__insert-btn" onclick="insertOutreachMessage(${id})">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Use this message
            </button>
          </div>
        </div>

      </div><!-- /steps -->

      <!-- Tips sidebar -->
      <div class="li-msg-guide__tips-panel">
        <div class="li-msg-guide__tips-heading">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--blue)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          Quick Tips
        </div>
        <div id="guide-tips-${id}" class="li-msg-guide__tips-list">
          <div style="font-size:11px;color:var(--text-3);font-style:italic;line-height:1.5;">Pick a goal to see\ntailored tips</div>
        </div>
      </div>
    </div><!-- /body -->

    <!-- Footer nav -->
    <div class="li-msg-guide__footer">
      <button id="guide-back-${id}" class="li-msg-guide__nav-btn" style="display:none;" onclick="(()=>{const s=App.state.messageGuide[${id}];if(s&&s.step>1)_showGuideStep(${id},s.step-1);})()">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>
      <div style="flex:1;"></div>
      <button id="guide-next-${id}" class="li-msg-guide__nav-btn primary" onclick="advanceGuideStep(${id})">
        Next <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>`;
}

const _autoReplies = [
  'Thanks for reaching out!',
  'That sounds great, let me get back to you.',
  'Absolutely! Let\'s connect.',
  'Happy to discuss this further.',
  'Interesting! Tell me more.',
  'I\'ll check my schedule and follow up.',
  'Great point! I agree.',
  'Looking forward to connecting!',
];
function sendMessage(convId) {
  const input = document.getElementById('msg-input-' + convId);
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  const chatMessages = document.getElementById('chat-messages-' + convId);
  if (chatMessages) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = 'display:flex;justify-content:flex-end;margin-top:4px;';
    msgDiv.innerHTML = `<div style="max-width:65%;background:var(--blue);color:white;padding:10px 14px;border-radius:18px 4px 18px 18px;font-size:14px;line-height:1.5;box-shadow:0 1px 2px rgba(0,0,0,.1);animation:msgSlideLeft 0.2s ease;">
      ${escapeHtml(text)}
      <div style="font-size:10px;opacity:0.65;margin-top:4px;text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:3px;">
        Just now
        <svg viewBox="0 0 16 16" width="12" height="12" fill="white" opacity="0.8"><path d="M2 8l4 4 8-8"/></svg>
      </div>
    </div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // Show typing indicator
    const typing = document.getElementById('typing-indicator-' + convId);
    if (typing) {
      setTimeout(() => {
        typing.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(() => {
          typing.style.display = 'none';
          // Add auto-reply
          const reply = _autoReplies[Math.floor(Math.random() * _autoReplies.length)];
          const data = window.LinkedInData;
          const conv = data?.conversations?.find(c => c.id === convId);
          const convName = conv?.participant?.name || conv?.name || 'User';
          const convColor = conv?.participant?.avatarColor || null;
          const replyDiv = document.createElement('div');
          replyDiv.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;margin-top:8px;';
          replyDiv.innerHTML = `<div style="display:flex;align-items:flex-end;gap:6px;max-width:70%;">
            <div style="flex-shrink:0;border-radius:50%;overflow:hidden;">${generateAvatar(convName, 28, convColor)}</div>
            <div style="background:var(--white);color:var(--text);padding:10px 14px;border-radius:4px 18px 18px 18px;font-size:14px;line-height:1.5;box-shadow:0 1px 2px rgba(0,0,0,.08);animation:msgSlideRight 0.2s ease;">${escapeHtml(reply)}</div>
          </div>
          <div style="font-size:10px;color:var(--text-3);margin:2px 34px 0;">Just now</div>`;
          chatMessages.appendChild(replyDiv);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1500);
      }, 600);
    }
  }
  input.value = '';
  input.style.height = 'auto';
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function filterConversations(query) {
  const items = document.querySelectorAll('.li-msg-conv');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
  });
}
function switchMsgTab(tab) {
  App.state.activeTab['msgTab'] = tab;
  ['focused','other'].forEach(t => {
    const btn = document.getElementById('msg-tab-' + t);
    if (btn) {
      const active = t === tab;
      btn.style.fontWeight = active ? '700' : '400';
      btn.style.color = active ? 'var(--blue)' : 'var(--text-2)';
      btn.style.borderBottom = active ? '2px solid var(--blue)' : '2px solid transparent';
    }
  });
  _applyMsgFilters();
}

function filterMsgPill(pill) {
  App.state.activeTab['msgPill'] = pill;
  // Update pill styles
  ['all','unread','inmail','starred'].forEach(p => {
    const btn = document.getElementById('msg-pill-' + p);
    if (!btn) return;
    const active = p === pill;
    btn.style.background = active ? 'var(--blue)' : 'var(--white)';
    btn.style.color = active ? 'white' : 'var(--text-2)';
    btn.style.border = active ? '1px solid var(--blue)' : '1px solid var(--border-2)';
  });
  _applyMsgFilters();
}

function _applyMsgFilters() {
  const tab = App.state.activeTab['msgTab'] || 'focused';
  const pill = App.state.activeTab['msgPill'] || 'all';
  document.querySelectorAll('.li-msg-conv').forEach(el => {
    const elTab = el.dataset.tab || 'focused';
    const isUnread = el.dataset.unread === 'true';
    let show = (elTab === tab);
    if (show && pill === 'unread') show = isUnread;
    if (show && pill === 'inmail') show = (elTab === 'other');
    el.style.display = show ? '' : 'none';
  });
  // Show empty state if none visible
  const list = document.getElementById('conversation-list');
  if (!list) return;
  const anyVisible = [...list.querySelectorAll('.li-msg-conv')].some(el => el.style.display !== 'none');
  let emptyEl = list.querySelector('.msg-empty-state');
  if (!anyVisible) {
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.className = 'msg-empty-state';
      emptyEl.style.cssText = 'padding:32px 16px;text-align:center;color:var(--text-2);font-size:14px;';
      emptyEl.innerHTML = '<div style="font-size:32px;margin-bottom:8px;">💬</div><div>No messages here yet</div>';
      list.appendChild(emptyEl);
    }
    emptyEl.style.display = '';
  } else if (emptyEl) {
    emptyEl.style.display = 'none';
  }
}

function _initMessagingScroll(convId) {
  if (!convId) return;
  const chatEl = document.getElementById('chat-messages-' + convId);
  if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
}

// ============================================================
// NOTIFICATIONS PAGE
// ============================================================
function renderNotifications() {
  const notifs = App.state.notifications.length > 0 ? App.state.notifications : _sampleNotifications();
  const activeTab = App.state.activeTab['notif'] || 'all';
  App.state.unreadNotifications = 0;
  App._renderNav();
  App._initStaticNav(); // update static nav badge
  const u = App.state.currentUser;

  // Normalize data.js format (actor/content/timestamp/isRead) to internal format
  const normalizedNotifs = notifs.map(n => ({
    ...n,
    avatar: n.actor ? n.actor.name : (n.avatar || 'User'),
    avatarColor: n.actor ? n.actor.avatarColor : null,
    text: (() => {
      const raw = n.content || n.text || '';
      if (raw.includes('<b>')) return raw; // already formatted
      const actorName = n.actor ? n.actor.name : null;
      if (actorName && raw.startsWith(actorName)) return `<b>${actorName}</b>${raw.slice(actorName.length)}`;
      return raw;
    })(),
    time: n.time || 0,
    timeLabel: n.timestamp || n.timeLabel || '',
    read: n.read !== undefined ? n.read : (n['isRead'] !== undefined ? n['isRead'] : true),
    isInvitation: n.isPending || n.isInvitation || false,
  }));

  const groups = { today: [], week: [], earlier: [] };
  // Group by timestamp string ("2m","1h" = today; "1d","2d","3d" = this week; older = earlier)
  normalizedNotifs.forEach(n => {
    const ts = (n.timeLabel || '').trim();
    if (ts.endsWith('m') || ts.endsWith('h')) groups.today.push(n);
    else if (ts.endsWith('d') && parseInt(ts) <= 3) groups.week.push(n);
    else if (n.time > 0) {
      const diff = Date.now() - n.time;
      if (diff < 86400000) groups.today.push(n);
      else if (diff < 604800000) groups.week.push(n);
      else groups.earlier.push(n);
    } else groups.week.push(n);
  });

  return `<div class="li-page-inner">
    <!-- Left sidebar -->
    <aside class="li-sidebar-left">
      <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:8px;">
        <div style="height:56px;background:${u.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};"></div>
        <div style="padding:0 16px 16px;text-align:center;">
          <div style="margin-top:-28px;display:flex;justify-content:center;margin-bottom:8px;">
            <div style="border:2px solid var(--white);border-radius:50%;overflow:hidden;">${generateAvatar(u.name, 56, u.avatarColor)}</div>
          </div>
          <a href="#profile" style="font-weight:700;font-size:14px;color:var(--text);text-decoration:none;display:block;">${escapeHtml(u.name)}</a>
          <div style="font-size:12px;color:var(--text-2);margin-top:2px;line-height:1.4;">${escapeHtml((u.headline||'').split('|')[0].trim())}</div>
        </div>
      </div>
      <div class="li-card" style="padding:16px;margin-bottom:8px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:10px;">Manage your notifications</div>
        <a href="#settings" style="display:flex;align-items:center;gap:8px;padding:8px 0;color:var(--text);text-decoration:none;font-size:14px;border-top:1px solid var(--border);">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          View settings
        </a>
      </div>
      <div class="li-card" style="padding:12px 16px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Filter notifications</div>
        ${['All activity','Reactions','Comments','Mentions','Jobs','Connections'].map((f,i) => `<div onclick="switchNotifTab('${['all','my posts','my posts','mentions','jobs','all'][i]}')" style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:13px;color:var(--text-2);cursor:pointer;border-top:1px solid var(--border);transition:color .15s;" onmouseenter="this.style.color='var(--blue)'" onmouseleave="this.style.color='var(--text-2)'">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 12l4-4-4-4"/></svg>
          ${f}</div>`).join('')}
      </div>
    </aside>

    <!-- Main notifications -->
    <main class="li-main-col">
      <div class="li-card" style="padding:0;overflow:hidden;">
        <div style="padding:16px 20px 0;">
          <h1 style="font-size:20px;font-weight:700;margin:0 0 12px;">Notifications</h1>
          <div class="li-notifs-tabs">
            ${['all','my posts','mentions','jobs'].map(tab => `<button onclick="switchNotifTab('${tab}')" id="notif-tab-${tab.replace(' ','-')}" class="li-notifs-tab ${activeTab===tab?'active':''}">${tab.charAt(0).toUpperCase()+tab.slice(1)}</button>`).join('')}
          </div>
        </div>
        <div id="notif-content">
          ${renderNotifGroup('Today', groups.today)}
          ${renderNotifGroup('This week', groups.week)}
          ${renderNotifGroup('Earlier', groups.earlier)}
          ${notifs.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--text-2);">No notifications yet</div>' : ''}
        </div>
      </div>
    </main>

    <!-- Right sidebar -->
    <aside class="li-sidebar-right">
      <div class="li-card" style="padding:16px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">Quick links</div>
        ${[
          ['My Network','network','👥'],['Jobs','jobs','💼'],['Messages','messaging','💬'],['Profile','profile','👤'],['Settings','settings','⚙️']
        ].map(([label,href,icon]) => `<a href="#${href}" style="display:flex;align-items:center;gap:10px;padding:8px 0;font-size:13px;color:var(--text);text-decoration:none;border-top:1px solid var(--border);" onmouseenter="this.style.color='var(--blue)'" onmouseleave="this.style.color='var(--text)'">
          <span style="font-size:16px;">${icon}</span>${label}
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:auto;"><path d="M6 12l4-4-4-4"/></svg>
        </a>`).join('')}
      </div>
      <div class="li-card" style="margin-top:0;">
        <div class="li-news-card__header">
          LinkedIn News
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="cursor:pointer;" onclick="createToast('News info','info')"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div style="padding:0 0 8px;">
          <div style="font-size:12px;font-weight:600;color:var(--text-2);padding:0 16px 8px;">Top stories</div>
          ${_linkedInNews()}
        </div>
        <div class="li-news-show-more" onclick="createToast('Loading more news...','info')">
          Show more <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
    </aside>
  </div>`;
}

function _sampleNotifications() {
  const now = Date.now();
  return [
    { id:1, type:'like', avatar:'Sarah Chen', avatarColor:'#1a73e8', text:'<b>Sarah Chen</b> and <b>12 others</b> reacted to your post about React performance.', time: now-1800000, read:false },
    { id:2, type:'comment', avatar:'Marcus Williams', avatarColor:'#0f9d58', text:'<b>Marcus Williams</b> commented: <i>"This is exactly what I needed — great write-up!"</i>', time: now-3600000, read:false },
    { id:3, type:'connection', avatar:'Priya Patel', avatarColor:'#e91e63', text:'<b>Priya Patel</b> accepted your connection request. You can now message each other.', time: now-7200000, read:false },
    { id:4, type:'view', avatar:'LinkedIn', avatarColor:'#0A66C2', text:'<b>14 people</b> viewed your profile in the last 7 days — up 43% from last week.', time: now-10800000, read:false },
    { id:5, type:'invitation', avatar:'James Liu', avatarColor:'#795548', text:'<b>James Liu</b>, Senior Engineer at Google, wants to connect with you.', time: now-86400000, read:false, isInvitation:true },
    { id:6, type:'mention', avatar:'Emma Davis', avatarColor:'#ff5722', text:'<b>Emma Davis</b> mentioned you in a post: <i>"Shoutout to Alex Johnson for the fantastic talk!"</i>', time: now-172800000, read:true },
    { id:7, type:'like', avatar:'Kevin Park', avatarColor:'#607d8b', text:'<b>Kevin Park</b> and <b>5 others</b> liked your comment on the TypeScript article.', time: now-259200000, read:true },
    { id:8, type:'job', avatar:'LinkedIn Jobs', avatarColor:'#0A66C2', text:'<b>3 new jobs</b> match your profile: Senior Frontend Engineer at Meta, Staff Engineer at Airbnb, and more.', time: now-345600000, read:true },
    { id:9, type:'comment', avatar:'Aisha Thompson', avatarColor:'#9c27b0', text:'<b>Aisha Thompson</b> replied to your comment: <i>"Totally agree, the new APIs are a game changer."</i>', time: now-432000000, read:true },
    { id:10, type:'anniversary', avatar:'LinkedIn', avatarColor:'#0A66C2', text:"Congratulate <b>Jordan Kim</b> on their 3-year work anniversary at Microsoft!", time: now-518400000, read:true }
  ];
}

function renderNotifGroup(label, notifs) {
  if (!notifs || notifs.length === 0) return '';
  const typeIcon = { reaction:'👍', like:'👍', comment:'💬', connect:'🤝', connection:'🤝', job:'💼', birthday:'🎂', anniversary:'🎉', invitation:'👋', mention:'💬', view:'👁️' };
  const typeClass = { reaction:'li-notif-item__icon--like', like:'li-notif-item__icon--like', comment:'li-notif-item__icon--comment', connect:'li-notif-item__icon--connect', connection:'li-notif-item__icon--connect', job:'li-notif-item__icon--job', mention:'li-notif-item__icon--comment' };
  return `<div>
    <div style="padding:12px 20px 4px;font-size:16px;font-weight:700;color:var(--text);">${label}</div>
    ${notifs.map(n => {
      const isUnread = !n.read;
      const avatarName = n.avatar || 'User';
      const avatarColor = n.avatarColor || null;
      const timeStr = n.timeLabel || (n.time ? formatTime(n.time) : '');
      return `<div id="notif-${n.id}" class="li-notif-item ${isUnread?'unread':''}" data-type="${n.type||''}" onclick="markNotifRead(${n.id})" style="${isUnread?'border-left:3px solid var(--blue);':''}>
        <div class="li-notif-item__photo">
          ${generateAvatar(avatarName, 48, avatarColor)}
          <span class="li-notif-item__icon ${typeClass[n.type]||'li-notif-item__icon--connect'}">${typeIcon[n.type]||'🔔'}</span>
        </div>
        <div class="li-notif-item__body" style="flex:1;min-width:0;">
          <div class="li-notif-item__text">${n.text||n.content||''}</div>
          <div class="li-notif-item__time" style="color:${isUnread?'var(--blue)':'var(--text-2)'};font-weight:${isUnread?'600':'400'};">${timeStr}</div>
          ${n.isInvitation ? `<div class="li-notif-item__actions">
            <button onclick="event.stopPropagation();acceptInvitation(${n.id},this);markNotifRead(${n.id})" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:5px 16px;font-size:13px;font-weight:600;cursor:pointer;">Accept</button>
            <button onclick="event.stopPropagation();ignoreInvitation(${n.id})" style="border:1px solid var(--border-2);color:var(--text);background:none;border-radius:20px;padding:5px 16px;font-size:13px;cursor:pointer;">Decline</button>
          </div>` : ''}
        </div>
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:6px;padding-left:8px;">
          ${isUnread ? `<div style="width:10px;height:10px;background:var(--blue);border-radius:50%;flex-shrink:0;"></div>` : '<div style="width:10px;"></div>'}
          <button onclick="event.stopPropagation();createToast('Options','info')" style="background:none;border:none;cursor:pointer;padding:4px 6px;border-radius:50%;color:var(--text-2);font-size:18px;line-height:1;" title="More options">&#8943;</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function markNotifRead(notifId) {
  const notif = App.state.notifications.find(n => n.id === notifId);
  if (notif) { notif.read = true; if ('isRead' in notif) notif.isRead = true; }
  const el = document.getElementById('notif-' + notifId);
  if (el) {
    el.classList.remove('unread');
    el.style.borderLeft = '';
    const timeEl = el.querySelector('.li-notif-item__time');
    if (timeEl) { timeEl.style.color = 'var(--text-2)'; timeEl.style.fontWeight = '400'; }
    el.querySelector('[style*="background:var(--blue)"]')?.remove();
  }
}

function switchNotifTab(tab) {
  App.state.activeTab['notif'] = tab;
  document.querySelectorAll('[id^="notif-tab-"]').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('notif-tab-' + tab.replace(' ','-'));
  if (activeBtn) activeBtn.classList.add('active');
  // Filter notification items
  const typeMap = {
    'all': null,
    'my posts': ['like','reaction','celebrate','comment','repost'],
    'mentions': ['mention'],
    'jobs': ['job'],
  };
  const allowed = typeMap[tab];
  document.querySelectorAll('.li-notif-item').forEach(el => {
    if (!allowed) { el.style.display = ''; return; }
    const t = el.dataset.type || '';
    el.style.display = allowed.includes(t) ? '' : 'none';
  });
  // Hide section headers that become empty
  document.querySelectorAll('#notif-content > div').forEach(section => {
    const visible = [...section.querySelectorAll('.li-notif-item')].some(el => el.style.display !== 'none');
    section.style.display = visible ? '' : 'none';
  });
}

// ============================================================
// SEARCH RESULTS PAGE
// ============================================================
function renderSearch(query) {
  const data = window.LinkedInData;
  const activeTab = App.state.activeTab['search'] || 'all';
  const users = data?.users || [];
  const jobs = data?.jobs || _sampleJobs();
  const companies = [
    { id:1, name:'Google', industry:'Technology', employees:'100K+', followers:'25M' },
    { id:2, name:'Meta', industry:'Technology', employees:'50K-100K', followers:'12M' },
    { id:3, name:'Apple', industry:'Technology', employees:'100K+', followers:'18M' }
  ];

  const filteredUsers = query ? users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || (u.headline||'').toLowerCase().includes(query.toLowerCase())) : users;
  const filteredJobs = query ? jobs.filter(j => j.title.toLowerCase().includes(query.toLowerCase()) || j.company.toLowerCase().includes(query.toLowerCase())) : jobs;
  const filteredPosts = App.state.feedPosts.filter(p => !query || (p.content||'').toLowerCase().includes(query.toLowerCase()));

  const tabs = ['all','people','jobs','posts','companies','schools','groups','events'];

  const totalResults = filteredUsers.length + filteredJobs.length + filteredPosts.length;
  return `<div class="li-page-inner">
    <div style="max-width:1200px;margin:0 auto;padding:16px;">
      ${query ? `<div style="margin-bottom:12px;font-size:14px;color:var(--text-2);">Showing <b>${totalResults}</b> results for "<b>${escapeHtml(query)}</b>"</div>` : ''}
      <div style="display:flex;gap:12px;">
        <!-- Sidebar filters -->
        <aside style="flex-shrink:0;width:240px;">
          <div class="li-card" style="padding:16px;">
            <h3 style="font-size:15px;font-weight:700;margin:0 0 12px;">Filter by</h3>
            ${activeTab === 'people' ? [['Connections','1st','2nd','3rd+'],['Location','United States','United Kingdom','India','Canada'],['Current company','Google','Meta','Amazon','Microsoft'],['Past company','Any']].map(([label,...options]) =>
              `<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border);">
                <div style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--text);">${label}</div>
                ${options.map(o => `<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text);margin-bottom:7px;cursor:pointer;"><input type="checkbox" style="cursor:pointer;accent-color:var(--blue);width:14px;height:14px;"/> ${o}</label>`).join('')}
              </div>`
            ).join('') + `<button onclick="createToast('Filters applied!','success')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;width:100%;">Show results</button>` :
            activeTab === 'jobs' ? [['Date posted','Past 24h','Past week','Past month'],['Experience level','Entry level','Associate','Mid-Senior','Director'],['Job type','Full-time','Part-time','Contract','Internship'],['Remote','Remote','Hybrid','On-site']].map(([label,...options]) =>
              `<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border);">
                <div style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--text);">${label}</div>
                ${options.map(o => `<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text);margin-bottom:7px;cursor:pointer;"><input type="checkbox" style="cursor:pointer;accent-color:var(--blue);width:14px;height:14px;"/> ${o}</label>`).join('')}
              </div>`
            ).join('') + `<button onclick="createToast('Filters applied!','success')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;width:100%;">Show results</button>` :
            `<div style="font-size:13px;color:var(--text-2);">Select a specific category tab above to see filter options.</div>`}
          </div>
        </aside>

        <div style="flex:1;min-width:0;">
          <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:8px;">
            <div style="display:flex;border-bottom:1px solid var(--border);overflow-x:auto;">
              ${tabs.map(tab => `<button onclick="switchSearchTab('${tab}')" id="search-tab-${tab}" style="padding:14px 16px;border:none;background:none;cursor:pointer;font-size:14px;white-space:nowrap;font-weight:${activeTab===tab?'700':'400'};color:${activeTab===tab?'var(--blue)':'var(--text-2)'};border-bottom:${activeTab===tab?'2px solid var(--blue)':'2px solid transparent'};">${tab.charAt(0).toUpperCase()+tab.slice(1)}</button>`).join('')}
            </div>
          </div>

          <div id="search-results-content">
            ${activeTab === 'all' || activeTab === 'people' ? (filteredUsers.length > 0 ? `
              <div class="li-card" style="padding:16px;margin-bottom:8px;">
                <h3 style="font-size:16px;font-weight:700;margin:0 0 14px;">People ${filteredUsers.length > 0 ? `<span style="font-size:14px;font-weight:400;color:var(--text-2);">(${filteredUsers.length})</span>` : ''}</h3>
                ${filteredUsers.slice(0,activeTab==='people'?10:3).map((u,i) => {
                  const isConn = App.state.connections.has(String(u.id));
                  const mutual = Math.floor(Math.abs(u.name.charCodeAt(0)*3) % 15) + 1;
                  return `<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;${i>0?'border-top:1px solid var(--border);':''}">
                    <a href="#profile/${u.id}" style="flex-shrink:0;text-decoration:none;border-radius:50%;overflow:hidden;">${generateAvatar(u.name, 56, u.avatarColor)}</a>
                    <div style="flex:1;min-width:0;">
                      <div style="display:flex;align-items:center;gap:6px;">
                        <a href="#profile/${u.id}" style="font-weight:700;font-size:15px;color:var(--text);text-decoration:none;">${escapeHtml(u.name)}</a>
                        <span style="font-size:12px;color:var(--text-2);">· ${isConn?'1st':'2nd'}</span>
                      </div>
                      <div style="font-size:13px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml((u.headline||'').split('|')[0].trim())}</div>
                      <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${escapeHtml(u.location||'')}${mutual ? ` · ${mutual} mutual connection${mutual!==1?'s':''}` : ''}</div>
                    </div>
                    <button onclick="${isConn?'createToast(\'Already connected\',\'info\')':'connectUser('+u.id+', this)'}" style="flex-shrink:0;border:1px solid ${isConn?'var(--border-2)':'var(--blue)'};color:${isConn?'var(--text-2)':'var(--blue)'};background:none;border-radius:16px;padding:6px 16px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">${isConn?'✓ Connected':'Connect'}</button>
                  </div>`;
                }).join('')}
                ${activeTab === 'all' && filteredUsers.length > 3 ? `<button onclick="switchSearchTab('people')" style="display:block;background:none;border:none;color:var(--blue);font-size:14px;font-weight:600;cursor:pointer;margin-top:12px;padding:8px 0;border-top:1px solid var(--border);width:100%;text-align:center;">See all ${filteredUsers.length} results for People →</button>` : ''}
              </div>` : '') : ''}

            ${activeTab === 'all' || activeTab === 'jobs' ? (filteredJobs.length > 0 ? `
              <div class="li-card" style="padding:16px;margin-bottom:8px;">
                <h3 style="font-size:16px;font-weight:600;margin:0 0 14px;">Jobs${filteredJobs.length > 0 ? ` (${filteredJobs.length})` : ''}</h3>
                ${filteredJobs.slice(0,activeTab==='jobs'?10:3).map(j => renderJobCard(j)).join('')}
                ${activeTab === 'all' && filteredJobs.length > 3 ? `<button onclick="switchSearchTab('jobs')" style="background:none;border:none;color:var(--blue);font-size:14px;cursor:pointer;margin-top:8px;">See all ${filteredJobs.length} jobs ›</button>` : ''}
              </div>` : '') : ''}

            ${activeTab === 'all' || activeTab === 'posts' ? (filteredPosts.length > 0 ? `
              <div class="li-card" style="padding:16px;margin-bottom:8px;">
                <h3 style="font-size:16px;font-weight:600;margin:0 0 14px;">Posts</h3>
                ${filteredPosts.slice(0,activeTab==='posts'?10:2).map(p => renderPostCard(p)).join('')}
              </div>` : '') : ''}

            ${activeTab === 'all' || activeTab === 'companies' ? `
              <div class="li-card" style="padding:16px;margin-bottom:8px;">
                <h3 style="font-size:16px;font-weight:600;margin:0 0 14px;">Companies</h3>
                ${companies.map((c,i) => `<div style="display:flex;gap:12px;align-items:center;padding:12px 0;${i>0?'border-top:1px solid var(--border);':''}">
                  <div style="flex-shrink:0;width:56px;height:56px;background:${getAvatarColor(c.name)};border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:20px;">${getInitials(c.name)}</div>
                  <div style="flex:1;">
                    <a href="#company/${c.id}" style="font-weight:600;font-size:15px;color:var(--text);text-decoration:none;">${escapeHtml(c.name)}</a>
                    <div style="font-size:13px;color:var(--text-2);">${escapeHtml(c.industry)}</div>
                    <div style="font-size:12px;color:var(--text-2);">${escapeHtml(c.employees)} employees · ${escapeHtml(c.followers)} followers</div>
                  </div>
                  <button onclick="createToast('Following ${escapeHtml(c.name)}!','success')" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:16px;padding:6px 16px;font-size:13px;font-weight:600;cursor:pointer;">Follow</button>
                </div>`).join('')}
              </div>` : ''}

            ${activeTab !== 'all' && activeTab !== 'people' && activeTab !== 'jobs' && activeTab !== 'posts' && activeTab !== 'companies' ? `
              <div class="li-card" style="padding:32px;text-align:center;color:var(--text-2);">
                <div style="font-size:18px;font-weight:600;margin-bottom:8px;">No ${activeTab} results found</div>
                <div style="font-size:14px;">Try a different search term or remove some filters.</div>
              </div>` : ''}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function switchSearchTab(tab) {
  App.state.activeTab['search'] = tab;
  document.querySelectorAll('[id^="search-tab-"]').forEach(btn => { btn.style.fontWeight = '400'; btn.style.color = 'var(--text-2)'; btn.style.borderBottom = '2px solid transparent'; });
  const activeBtn = document.getElementById('search-tab-' + tab);
  if (activeBtn) { activeBtn.style.fontWeight = '600'; activeBtn.style.color = 'var(--blue)'; activeBtn.style.borderBottom = '2px solid var(--blue)'; }
  App.render('search', null);
}

// ============================================================
// COMPANY PAGE
// ============================================================
function renderCompany(companyId) {
  const data = window.LinkedInData;
  const companies = data?.companies || _sampleCompanies();
  const company = companies.find(c => String(c.id) === String(companyId)) || companies[0];
  if (!company) return `<div class="li-card" style="padding:32px;text-align:center;">Company not found.</div>`;
  const activeTab = App.state.activeTab['company-'+companyId] || 'home';
  const employees = data?.users?.slice(0,6) || [
    { id:2, name:'Sarah Chen', headline:'Product Manager' },
    { id:3, name:'Marcus Williams', headline:'CTO' },
    { id:4, name:'Emma Davis', headline:'UX Designer' },
    { id:5, name:'Kevin Park', headline:'Backend Engineer' }
  ];

  const logo = company.logo || null;
  return `<div class="li-page-inner">
    <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:8px;">
      <div style="height:180px;background:${company.coverGradient||'linear-gradient(135deg,'+getAvatarColor(company.name)+','+getAvatarColor(company.name+'2')+')'};"></div>
      <div style="padding:0 24px 20px;position:relative;">
        <!-- Company logo -->
        <div style="position:absolute;top:-44px;left:24px;background:var(--white);border:3px solid var(--white);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.12);">
          <div style="width:88px;height:88px;background:${logo?'var(--bg)':''+getAvatarColor(company.name)};border-radius:10px;display:flex;align-items:center;justify-content:center;${logo?'font-size:44px;':'color:white;font-weight:700;font-size:30px;'}">${logo || getInitials(company.name)}</div>
        </div>
        <div style="display:flex;justify-content:flex-end;padding-top:12px;gap:8px;flex-wrap:wrap;">
          <button onclick="this.textContent=this.textContent==='Follow'?'Following':'Follow';createToast('Following ${escapeHtml(company.name)}!','success')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 20px;font-size:14px;font-weight:600;cursor:pointer;">Follow</button>
          <button onclick="createToast('Visit website','info')" style="border:1.5px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">Visit website</button>
          <button onclick="createToast('More options','info')" style="border:1.5px solid var(--border-2);color:var(--text);background:none;border-radius:50%;width:38px;height:38px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">&#8943;</button>
        </div>
        <div style="margin-top:52px;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
            <h1 style="font-size:24px;font-weight:700;margin:0;">${escapeHtml(company.name)}</h1>
            <svg viewBox="0 0 16 16" width="18" height="18" fill="var(--blue)" title="Verified"><path d="M8 0L9.9 3.8 14 4.5 11 7.4 11.8 11.5 8 9.5 4.2 11.5 5 7.4 2 4.5 6.1 3.8z"/></svg>
          </div>
          <div style="font-size:15px;color:var(--text);margin-bottom:4px;line-height:1.4;">${escapeHtml(company.tagline||company.industry||'')}</div>
          <div style="font-size:14px;color:var(--text-2);">${[company.industry, company.size||company.employeeRange, formatNumber(company.followers||50000)+' followers'].filter(Boolean).map(escapeHtml).join(' · ')}</div>
          ${company.headquarters || company.hq ? `<div style="font-size:13px;color:var(--text-2);margin-top:4px;display:flex;align-items:center;gap:4px;"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 1C5.2 1 3 3.2 3 6c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5z"/><circle cx="8" cy="6" r="1.5"/></svg> ${escapeHtml(company.headquarters||company.hq||'')}</div>` : ''}
        </div>
      </div>
      <div style="display:flex;border-top:1px solid var(--border);overflow-x:auto;">
        ${['home','about','posts','jobs','people','life','videos','insights'].map(tab => `<button onclick="switchCompanyTab('${companyId}','${tab}')" id="ctab-${companyId}-${tab}" style="padding:14px 18px;border:none;background:none;cursor:pointer;font-size:14px;white-space:nowrap;font-weight:${activeTab===tab?'600':'400'};color:${activeTab===tab?'var(--blue)':'var(--text-2)'};border-bottom:${activeTab===tab?'2px solid var(--blue)':'2px solid transparent'};">${tab.charAt(0).toUpperCase()+tab.slice(1)}</button>`).join('')}
      </div>
    </div>

    <div id="company-tab-content-${companyId}">
      ${activeTab === 'home' ? `
        <div class="li-card" style="padding:20px;margin-bottom:8px;">
          <div style="font-size:14px;color:var(--text);line-height:1.7;">${truncateText(company.description||company.about||'', 300)}</div>
          <div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;">
            ${[['🌐 Website',company.website||'—'],['🏭 Industry',company.industry||'Technology'],['👥 Size',company.size||company.employeeRange||'—'],['📅 Founded',String(company.founded||'—')]].map(([label,val]) =>
              `<div style="background:var(--bg);border-radius:8px;padding:12px;"><div style="font-size:11px;color:var(--text-2);">${label}</div><div style="font-size:13px;font-weight:600;margin-top:2px;">${escapeHtml(String(val))}</div></div>`
            ).join('')}
          </div>
        </div>
        <!-- People you know there -->
        <div class="li-card" style="padding:20px;margin-bottom:8px;">
          <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;">People you may know at ${escapeHtml(company.name)}</h2>
          ${employees.slice(0,3).map((e,i) => `<div style="display:flex;align-items:center;gap:12px;${i>0?'margin-top:12px;padding-top:12px;border-top:1px solid var(--border);':''}">
            <div style="border-radius:50%;overflow:hidden;flex-shrink:0;">${generateAvatar(e.name, 44, e.avatarColor)}</div>
            <div style="flex:1;min-width:0;">
              <a href="#profile/${e.id||i+2}" style="font-weight:700;font-size:14px;color:var(--text);text-decoration:none;">${escapeHtml(e.name)}</a>
              <div style="font-size:12px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml((e.headline||'').split('|')[0].trim())}</div>
              <div style="font-size:11px;color:var(--text-2);margin-top:2px;">${Math.floor(Math.abs(e.name.charCodeAt(0)*7) % 12) + 1} mutual connections</div>
            </div>
            <button onclick="connectUser(${e.id||i+2}, this)" style="flex-shrink:0;border:1px solid var(--blue);color:var(--blue);background:none;border-radius:16px;padding:5px 14px;font-size:13px;font-weight:600;cursor:pointer;">Connect</button>
          </div>`).join('')}
          <button onclick="App.state.activeTab['company-${companyId}']='people';document.getElementById('ctab-${companyId}-people')?.click()" style="margin-top:12px;background:none;border:none;cursor:pointer;color:var(--text-2);font-size:13px;font-weight:600;width:100%;text-align:center;padding:8px;border-top:1px solid var(--border);">See all employees →</button>
        </div>
        <div class="li-card" style="padding:20px;">
          <h2 style="font-size:18px;font-weight:700;margin:0 0 16px;">Recent posts</h2>
          ${App.state.feedPosts.slice(0,2).map(p => renderPostCard(p)).join('')}
        </div>
      ` : ''}
      ${activeTab === 'about' ? `
        <div class="li-card" style="padding:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 16px;">Overview</h2>
          <p style="font-size:15px;line-height:1.7;color:var(--text);">${escapeHtml(company.description||company.about||'A leading technology company.')}</p>
          <div style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px;">
            ${[
              ['Website', company.website||null],
              ['Industry', company.industry||'Technology'],
              ['Company size', company.size||company.employeeRange||null],
              ['Headquarters', company.headquarters||company.hq||null],
              ['Founded', company.founded ? String(company.founded) : null],
              ['Specialties', Array.isArray(company.specialties) ? company.specialties.join(', ') : (company.specialties||null)]
            ].filter(([,v]) => v).map(([label,val]) =>
              `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px;"><span style="font-weight:600;min-width:140px;color:var(--text-2);">${label}</span><span style="color:var(--text);">${label==='Website' ? `<a href="${escapeHtml(val)}" style="color:var(--blue);" target="_blank">${escapeHtml(val)}</a>` : escapeHtml(val)}</span></div>`
            ).join('')}
          </div>
        </div>
      ` : ''}
      ${activeTab === 'people' ? `
        <div class="li-card" style="padding:20px;">
          <h2 style="font-size:18px;font-weight:700;margin:0 0 16px;">People at ${escapeHtml(company.name)}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
            ${employees.map((e,i) => `<div style="border:1px solid var(--border);border-radius:8px;padding:16px;text-align:center;">
              ${generateAvatar(e.name, 56)}
              <a href="#profile/${e.id||i+2}" style="display:block;font-weight:600;font-size:14px;color:var(--text);text-decoration:none;margin-top:8px;">${escapeHtml(e.name)}</a>
              <div style="font-size:12px;color:var(--text-2);margin:4px 0 10px;">${escapeHtml(e.headline||'')}</div>
              <button onclick="connectUser(${e.id||i+2}, this)" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:14px;padding:5px 16px;font-size:13px;font-weight:600;cursor:pointer;width:100%;">Connect</button>
            </div>`).join('')}
          </div>
        </div>
      ` : ''}
      ${activeTab === 'jobs' ? `
        <div class="li-card" style="padding:20px;">
          <h2 style="font-size:18px;font-weight:700;margin:0 0 16px;">Jobs at ${escapeHtml(company.name)}</h2>
          ${(_sampleJobs().slice(0,3)).map(j => renderJobCard(j)).join('')}
        </div>
      ` : ''}
      ${activeTab !== 'home' && activeTab !== 'about' && activeTab !== 'people' && activeTab !== 'jobs' ? `
        <div class="li-card" style="padding:32px;text-align:center;color:var(--text-2);">
          <div style="font-size:20px;margin-bottom:8px;">📊</div>
          <div style="font-size:16px;font-weight:600;margin-bottom:6px;">${activeTab.charAt(0).toUpperCase()+activeTab.slice(1)}</div>
          <div style="font-size:14px;">Content coming soon.</div>
        </div>
      ` : ''}
    </div>
  </div>`;
}

function _sampleCompanies() {
  return [
    { id:1, name:'TechCorp', tagline:'Building tomorrow\'s technology today', industry:'Software Development', employees:4500, followers:78000, about:'TechCorp is a leading software company specializing in enterprise solutions, cloud infrastructure, and AI-powered tools.', website:'https://techcorp.com', hq:'San Francisco, CA', founded:2008, type:'Public', employeeRange:'1,001-5,000 employees', specialties:'Software, Cloud, AI, Enterprise' },
    { id:2, name:'StartupXYZ', tagline:'Move fast, build things', industry:'Internet', employees:250, followers:12000, about:'StartupXYZ is a fast-moving startup building the next generation of consumer software.', website:'https://startupxyz.com', hq:'New York, NY', founded:2019, type:'Private', employeeRange:'51-200 employees', specialties:'Mobile, Consumer Tech, Fintech' }
  ];
}

function switchCompanyTab(companyId, tab) {
  App.state.activeTab['company-'+companyId] = tab;
  document.querySelectorAll(`[id^="ctab-${companyId}-"]`).forEach(btn => { btn.style.fontWeight = '400'; btn.style.color = 'var(--text-2)'; btn.style.borderBottom = '2px solid transparent'; });
  const activeBtn = document.getElementById('ctab-' + companyId + '-' + tab);
  if (activeBtn) { activeBtn.style.fontWeight = '600'; activeBtn.style.color = 'var(--blue)'; activeBtn.style.borderBottom = '2px solid var(--blue)'; }
  App.render('company', companyId);
}

// ============================================================
// SETTINGS PAGE
// ============================================================
function renderSettings(tab) {
  const activeTab = tab || App.state.activeTab['settings'] || 'account';
  const u = App.state.currentUser;
  const s = App.state.settings;

  const tabs = [
    { id: 'account', label: 'Account preferences', icon: '👤' },
    { id: 'privacy', label: 'Sign in & security', icon: '🔒' },
    { id: 'data', label: 'Data privacy', icon: '🛡️' },
    { id: 'advertising', label: 'Advertising data', icon: '📢' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'communications', label: 'Communications', icon: '💬' },
  ];

  const accountContent = `
    <div>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 4px;">Account preferences</h2>
      <p style="font-size:14px;color:var(--text-2);margin:0 0 20px;">Manage your profile, account, and privacy settings.</p>

      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
          <div style="font-size:14px;font-weight:700;color:var(--text);">Profile information</div>
        </div>
        ${[
          ['Name, location, and industry', 'Edit your public profile details', () => `<button onclick="openEditProfileModal()" style="border:none;background:none;color:var(--blue);font-size:14px;cursor:pointer;font-weight:600;">Edit</button>`],
          ['Personal demographic information', 'Provide demographic details to help LinkedIn improve', () => `<button onclick="createToast('Opening demographic settings','info')" style="border:none;background:none;color:var(--blue);font-size:14px;cursor:pointer;font-weight:600;">Add</button>`],
          ['Verifications', 'Verify your identity or workplace', () => `<button onclick="createToast('Starting verification','info')" style="border:none;background:none;color:var(--blue);font-size:14px;cursor:pointer;font-weight:600;">Verify</button>`],
        ].map(([title, desc, action]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);">
          <div><div style="font-size:14px;font-weight:600;">${title}</div><div style="font-size:13px;color:var(--text-2);">${desc}</div></div>
          ${action()}
        </div>`).join('')}
      </div>

      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
          <div style="font-size:14px;font-weight:700;color:var(--text);">Display</div>
        </div>
        <div style="padding:14px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);">
          <div>
            <div style="font-size:14px;font-weight:600;">Dark mode</div>
            <div style="font-size:13px;color:var(--text-2);">Switch to dark theme</div>
          </div>
          <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">
            <input type="checkbox" ${App.state.darkMode ? 'checked' : ''} onchange="toggleDarkMode(this.checked)" style="opacity:0;width:0;height:0;position:absolute;"/>
            <span style="position:absolute;inset:0;background:${App.state.darkMode ? 'var(--blue)' : 'var(--border-2)'};border-radius:24px;transition:0.3s;"></span>
            <span style="position:absolute;left:${App.state.darkMode ? '20px' : '2px'};top:2px;width:20px;height:20px;background:var(--white);border-radius:50%;transition:0.3s;"></span>
          </label>
        </div>
        <div style="padding:14px 20px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:14px;font-weight:600;">Language</div>
            <div style="font-size:13px;color:var(--text-2);">English (Default)</div>
          </div>
          <button onclick="createToast('Language settings opening','info')" style="border:none;background:none;color:var(--blue);font-size:14px;cursor:pointer;font-weight:600;">Change</button>
        </div>
      </div>

      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
          <div style="font-size:14px;font-weight:700;color:var(--text);">General preferences</div>
        </div>
        ${[
          ['Autoplay videos', 'Videos will play automatically in the feed', s.autoplayVideos !== false],
          ['Open links in new tab', 'External links open in a new browser tab', s.openLinksNewTab !== false],
          ['Show profile photo to non-connections', 'People outside your network can see your photo', s.publicPhoto !== false],
        ].map(([label, desc, checked]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);">
          <div><div style="font-size:14px;font-weight:600;">${label}</div><div style="font-size:13px;color:var(--text-2);">${desc}</div></div>
          <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleSwitch(this)" style="opacity:0;width:0;height:0;position:absolute;"/>
            <span style="position:absolute;inset:0;background:${checked ? 'var(--blue)' : 'var(--border-2)'};border-radius:24px;transition:background 0.3s;"></span>
            <span style="position:absolute;left:${checked ? '20px' : '2px'};top:2px;width:20px;height:20px;background:var(--white);border-radius:50%;transition:left 0.3s;"></span>
          </label>
        </div>`).join('')}
      </div>

      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
          <div style="font-size:14px;font-weight:700;color:var(--text);">Account management</div>
        </div>
        <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <div><div style="font-size:14px;font-weight:600;">Merge accounts</div><div style="font-size:13px;color:var(--text-2);">Combine duplicate LinkedIn accounts</div></div>
          <button onclick="createToast('Merge accounts feature','info')" style="border:none;background:none;color:var(--blue);font-size:14px;cursor:pointer;font-weight:600;">Merge</button>
        </div>
        <div style="padding:14px 20px;display:flex;justify-content:space-between;align-items:center;">
          <div><div style="font-size:14px;font-weight:600;color:var(--red);">Close account</div><div style="font-size:13px;color:var(--text-2);">Permanently close your LinkedIn account</div></div>
          <button onclick="createToast('Please contact support to close your account','warning')" style="border:none;background:none;color:var(--red);font-size:14px;cursor:pointer;font-weight:600;">Close</button>
        </div>
      </div>
    </div>`;

  const privacyContent = `
    <div>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 4px;">Sign in & security</h2>
      <p style="font-size:14px;color:var(--text-2);margin:0 0 20px;">Manage your account access and security settings.</p>

      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
          <div style="font-size:14px;font-weight:700;color:var(--text);">Account access</div>
        </div>
        ${[
          ['Email address', u.email || 'alex.johnson@gmail.com', 'Change'],
          ['Phone number', u.phone || '+1 (415) 234-5678', 'Change'],
          ['Password', '••••••••••••', 'Change'],
        ].map(([label, val, action]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);">
          <div><div style="font-size:14px;font-weight:600;">${label}</div><div style="font-size:13px;color:var(--text-2);">${val}</div></div>
          <button onclick="createToast('${action} ${label.toLowerCase()}','info')" style="border:none;background:none;color:var(--blue);font-size:14px;cursor:pointer;font-weight:600;">${action}</button>
        </div>`).join('')}
        <div style="padding:14px 20px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:14px;font-weight:600;">Two-step verification</div>
            <div style="font-size:13px;color:${s.twoFactor ? 'var(--green)' : 'var(--text-2)'};">${s.twoFactor ? '✓ Enabled' : 'Not enabled — add an extra layer of security'}</div>
          </div>
          <button onclick="toggleSetting('twoFactor',this)" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:16px;padding:5px 14px;font-size:13px;cursor:pointer;font-weight:600;">${s.twoFactor ? 'Disable' : 'Enable'}</button>
        </div>
      </div>

      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
          <div style="font-size:14px;font-weight:700;color:var(--text);">Active sessions</div>
        </div>
        ${[
          ['Chrome on macOS', 'San Francisco, CA · Active now', '💻'],
          ['LinkedIn mobile app (iOS)', 'San Francisco, CA · 2 hours ago', '📱'],
          ['Firefox on Windows', 'New York, NY · 3 days ago', '💻'],
        ].map(([device, detail, icon]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);">
          <div style="display:flex;gap:12px;align-items:center;">
            <span style="font-size:24px;">${icon}</span>
            <div><div style="font-size:14px;font-weight:600;">${device}</div><div style="font-size:13px;color:var(--text-2);">${detail}</div></div>
          </div>
          <button onclick="createToast('Session ended','success')" style="border:none;background:none;color:var(--red);font-size:13px;cursor:pointer;">End</button>
        </div>`).join('')}
      </div>
    </div>`;

  const notificationsContent = `
    <div>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 4px;">Notifications</h2>
      <p style="font-size:14px;color:var(--text-2);margin:0 0 20px;">Choose how and when you'll be notified.</p>
      ${[
        { section: 'On LinkedIn', items: [
          ['Mentions and comments', 'Get notified when someone mentions you or comments on your content', true],
          ['Reactions to your posts', 'Get notified when someone reacts to your post', true],
          ['Connection requests', 'Get notified when someone wants to connect', true],
          ['Messages', 'Get notified when you receive a new message', true],
          ['Job recommendations', 'Get notified about jobs matching your profile', false],
          ['Profile views', 'Know when someone visits your profile', true],
          ['Work anniversaries and birthdays', 'Get reminded about your network\'s milestones', true],
        ]},
        { section: 'Email notifications', items: [
          ['Weekly digest', 'A weekly summary of your top activity', s.emailNotifications],
          ['Job alerts', 'New jobs matching your saved searches', true],
          ['News and articles', 'Important updates and trending content', false],
          ['Connection suggestions', 'People you may want to connect with', false],
        ]},
        { section: 'Push notifications', items: [
          ['New messages', 'Push notifications for new messages', s.pushNotifications],
          ['Connection requests', 'Push notifications for connection requests', true],
          ['Reactions and comments', 'Push notifications for engagement on your posts', false],
        ]},
      ].map(({ section, items }) => `
        <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
          <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
            <div style="font-size:14px;font-weight:700;color:var(--text);">${section}</div>
          </div>
          ${items.map(([label, desc, checked]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);">
            <div><div style="font-size:14px;font-weight:600;">${label}</div><div style="font-size:13px;color:var(--text-2);">${desc}</div></div>
            <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;flex-shrink:0;">
              <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleSwitch(this)" style="opacity:0;width:0;height:0;position:absolute;"/>
              <span style="position:absolute;inset:0;background:${checked ? 'var(--blue)' : 'var(--border-2)'};border-radius:24px;transition:background 0.3s;"></span>
              <span style="position:absolute;top:2px;left:${checked ? '20px' : '2px'};width:20px;height:20px;background:var(--white);border-radius:50%;transition:left 0.3s;"></span>
            </label>
          </div>`).join('')}
        </div>`).join('')}
    </div>`;

  const dataPrivacyContent = `
    <div>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 4px;">Data privacy</h2>
      <p style="font-size:14px;color:var(--text-2);margin:0 0 20px;">Manage your personal data and how it's used.</p>
      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
          <div style="font-size:14px;font-weight:700;color:var(--text);">Profile privacy</div>
        </div>
        ${[
          ['Profile visibility', 'Your profile is visible to: Everyone', 'Edit'],
          ['Who can see your email address', 'Your connections', 'Change'],
          ['Who can see your connections', 'Your connections', 'Change'],
          ['Who can see your following list', 'Everyone', 'Change'],
          ['Profile discovery by email', 'Enabled', 'Change'],
          ['Profile discovery by phone', 'Enabled', 'Change'],
        ].map(([label, current, action]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border);">
          <div><div style="font-size:14px;font-weight:600;">${label}</div><div style="font-size:13px;color:var(--text-2);">${current}</div></div>
          <button onclick="createToast('Privacy setting updated','info')" style="border:none;background:none;color:var(--blue);font-size:14px;cursor:pointer;font-weight:600;">${action}</button>
        </div>`).join('')}
      </div>
      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);background:var(--bg);">
          <div style="font-size:14px;font-weight:700;color:var(--text);">Data export</div>
        </div>
        <div style="padding:16px 20px;">
          <div style="font-size:14px;color:var(--text);margin-bottom:12px;">Download a copy of your LinkedIn data including your connections, messages, posts, and more.</div>
          <button onclick="createToast('Your data export request has been submitted. You will receive an email shortly.','success')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">Request data archive</button>
        </div>
      </div>
    </div>`;

  const contentMap = {
    account: accountContent,
    privacy: privacyContent,
    notifications: notificationsContent,
    data: dataPrivacyContent,
    advertising: `<div><h2 style="font-size:20px;font-weight:700;margin:0 0 16px;">Advertising data</h2>
      <div style="background:var(--blue-light);border:1px solid var(--blue);border-radius:8px;padding:14px;font-size:14px;margin-bottom:16px;">LinkedIn uses your data to show relevant ads. You can control what data is used.</div>
      ${[['Ads based on your profile data','LinkedIn uses your experience, skills, and education to show relevant ads',true],['Ads based on your activity','LinkedIn uses your engagement and content interactions for ads',true],['Interest categories','LinkedIn infers interests from your activity',false],['Third-party data','Data from LinkedIn partners used for ad targeting',false]].map(([label,desc,checked])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;">
        <div><div style="font-size:14px;font-weight:600;">${label}</div><div style="font-size:13px;color:var(--text-2);">${desc}</div></div>
        <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;flex-shrink:0;">
          <input type="checkbox" ${checked?'checked':''} onchange="toggleSwitch(this)" style="opacity:0;width:0;height:0;position:absolute;"/>
          <span style="position:absolute;inset:0;background:${checked?'var(--blue)':'var(--border-2)'};border-radius:24px;transition:background 0.3s;"></span>
          <span style="position:absolute;top:2px;left:${checked?'20px':'2px'};width:20px;height:20px;background:var(--white);border-radius:50%;transition:left 0.3s;"></span>
        </label>
      </div>`).join('')}
    </div>`,
    communications: `<div><h2 style="font-size:20px;font-weight:700;margin:0 0 16px;">Communications preferences</h2>
      ${[['InMail messages','Allow anyone to send you InMail messages',true],['Connection request messages','Show a message box when someone connects',true],['Recruiter messages','Allow recruiters to contact you',true],['Open Profile','Let Premium members contact you for free',false],['Read receipts','Show when you\'ve read messages',true]].map(([label,desc,checked])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;">
        <div><div style="font-size:14px;font-weight:600;">${label}</div><div style="font-size:13px;color:var(--text-2);">${desc}</div></div>
        <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;flex-shrink:0;">
          <input type="checkbox" ${checked?'checked':''} onchange="toggleSwitch(this)" style="opacity:0;width:0;height:0;position:absolute;"/>
          <span style="position:absolute;inset:0;background:${checked?'var(--blue)':'var(--border-2)'};border-radius:24px;transition:background 0.3s;"></span>
          <span style="position:absolute;top:2px;left:${checked?'20px':'2px'};width:20px;height:20px;background:var(--white);border-radius:50%;transition:left 0.3s;"></span>
        </label>
      </div>`).join('')}
    </div>`,
  };

  return `<div style="max-width:1100px;margin:0 auto;padding:20px 16px;display:flex;gap:16px;">
    <aside style="flex-shrink:0;width:240px;">
      <div class="li-card" style="padding:0;overflow:hidden;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);">
          <div style="display:flex;gap:10px;align-items:center;">
            ${generateAvatar(u.name, 48)}
            <div>
              <div style="font-weight:700;font-size:14px;">${escapeHtml(u.name)}</div>
              <a href="#profile" style="font-size:12px;color:var(--blue);text-decoration:none;">View profile</a>
            </div>
          </div>
        </div>
        ${tabs.map(t => `<button onclick="switchSettingsTab('${t.id}')" id="stab-${t.id}" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:12px 20px;border:none;background:${activeTab===t.id?'var(--blue-light)':'transparent'};cursor:pointer;font-size:14px;font-weight:${activeTab===t.id?'600':'400'};color:${activeTab===t.id?'var(--blue)':'var(--text)'};border-left:${activeTab===t.id?'3px solid var(--blue)':'3px solid transparent'};" onmouseenter="if(this.id!=='stab-${t.id}' || '${activeTab}'!=='${t.id}') this.style.background='var(--bg)'" onmouseleave="if('${activeTab}'!=='${t.id}') this.style.background='transparent'">
          <span>${t.icon}</span><span>${t.label}</span>
        </button>`).join('')}
        <div style="padding:12px 20px;border-top:1px solid var(--border);">
          <a href="index.html" style="font-size:14px;color:var(--red);text-decoration:none;font-weight:600;">Sign out</a>
        </div>
      </div>
    </aside>
    <main style="flex:1;min-width:0;">
      <div class="li-card" style="padding:24px;" id="settings-content">
        ${contentMap[activeTab] || contentMap.account}
      </div>
    </main>
  </div>`;
}

function switchSettingsTab(tab) {
  App.state.activeTab['settings'] = tab;
  App.render('settings', tab);
}

function toggleSetting(key, btn) {
  App.state.settings[key] = !App.state.settings[key];
  btn.textContent = App.state.settings[key] ? 'Disable' : 'Enable';
  createToast('Setting updated!', 'success');
}

// Animate toggle switch knob on click — call from onchange on the hidden <input>
function toggleSwitch(input, settingKey) {
  const track = input.nextElementSibling;
  const knob  = track ? track.nextElementSibling : null;
  if (track) track.style.background = input.checked ? 'var(--blue)' : 'var(--border-2)';
  if (knob)  knob.style.left        = input.checked ? '20px' : '2px';
  if (settingKey) {
    if (!App.state.settings) App.state.settings = {};
    App.state.settings[settingKey] = input.checked;
  }
  createToast('Setting updated', 'success');
}

function toggleDarkMode(enabled) {
  App.state.darkMode = enabled;
  document.body.classList.toggle('dark-mode', enabled);
  // persist to localStorage
  try { localStorage.setItem('li-dark-mode', enabled ? '1' : '0'); } catch(e) { /* ignore */ }
  createToast(enabled ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
  // re-render settings so toggle visually reflects new state
  if (App.state.currentPage === 'settings') {
    setTimeout(() => App.render('settings', App.state.activeTab['settings'] || 'account'), 10);
  }
}

// ============================================================
// LEARNING PAGE
// ============================================================
function renderLearning() {
  const data = window.LinkedInData;
  const courses = data?.courses || [];
  const activeTab = App.state.activeTab['learning'] || 'mylearning';
  const inProgress = courses.filter(c => c.isInProgress);
  const completed = courses.filter(c => c.isCompleted);
  const saved = courses.filter(c => c.isSaved);

  const tabBar = `<div style="display:flex;border-bottom:1px solid var(--border);overflow-x:auto;">
    ${[['mylearning','My Learning'],['collections','Collections'],['history','History']].map(([id,label]) =>
      `<button onclick="switchLearningTab('${id}')" id="ltab-${id}" style="padding:14px 20px;border:none;background:none;cursor:pointer;font-size:14px;white-space:nowrap;font-weight:${activeTab===id?'600':'400'};color:${activeTab===id?'var(--blue)':'var(--text-2)'};border-bottom:${activeTab===id?'2px solid var(--blue)':'2px solid transparent'};">${label}</button>`
    ).join('')}
  </div>`;

  function courseCard(course) {
    return `<div class="li-card" style="padding:0;overflow:hidden;cursor:pointer;" onclick="createToast('Opening: ${escapeHtml(course.title)}','info')">
      <div style="height:120px;background:${course.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};display:flex;align-items:center;justify-content:center;font-size:48px;">${course.emoji||'📚'}</div>
      <div style="padding:14px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:4px;line-height:1.4;">${escapeHtml(course.title)}</div>
        <div style="font-size:12px;color:var(--text-2);margin-bottom:6px;">${escapeHtml(course.instructor||'')} · ${escapeHtml(course.duration||'')}</div>
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;">
          <span style="color:var(--gold);font-size:12px;">${'★'.repeat(Math.round(course.rating||4.5))}${'☆'.repeat(5-Math.round(course.rating||4.5))}</span>
          <span style="font-size:12px;color:var(--text-2);">${(course.rating||4.5).toFixed(1)} (${formatNumber(course.reviews||0)})</span>
        </div>
        ${course.isInProgress ? `<div style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-2);margin-bottom:4px;"><span>Progress</span><span>${course.progress||0}%</span></div>
          <div style="height:4px;background:var(--border);border-radius:2px;"><div style="height:4px;background:var(--blue);border-radius:2px;width:${course.progress||0}%;"></div></div>
        </div>` : ''}
        ${course.isCompleted ? `<div style="background:var(--green-light);color:var(--green);font-size:11px;padding:3px 10px;border-radius:10px;display:inline-block;font-weight:600;">✓ Completed</div>` : ''}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
          ${(course.skills||[]).slice(0,3).map(s => `<span style="background:var(--blue-light);color:var(--blue);font-size:11px;padding:2px 8px;border-radius:10px;">${escapeHtml(s)}</span>`).join('')}
        </div>
        <button onclick="event.stopPropagation();createToast('${course.isInProgress?'Continuing':'Starting'}: ${escapeHtml(course.title)}','success')" style="margin-top:10px;width:100%;background:var(--blue);color:white;border:none;border-radius:16px;padding:7px;font-size:13px;font-weight:600;cursor:pointer;">${course.isInProgress?'Continue':'Start course'}</button>
      </div>
    </div>`;
  }

  const myLearningContent = `
    ${inProgress.length > 0 ? `<div style="margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h2 style="font-size:18px;font-weight:700;margin:0;">In progress (${inProgress.length})</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
        ${inProgress.map(courseCard).join('')}
      </div>
    </div>` : ''}
    ${saved.length > 0 ? `<div style="margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h2 style="font-size:18px;font-weight:700;margin:0;">Saved (${saved.length})</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
        ${saved.map(courseCard).join('')}
      </div>
    </div>` : ''}
    ${completed.length > 0 ? `<div style="margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h2 style="font-size:18px;font-weight:700;margin:0;">Completed (${completed.length})</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
        ${completed.map(courseCard).join('')}
      </div>
    </div>` : ''}`;

  const discoverContent = `
    <div>
      <div style="background:linear-gradient(135deg,#0a66c2,#004182);color:white;border-radius:8px;padding:24px;margin-bottom:20px;text-align:center;">
        <div style="font-size:24px;font-weight:700;margin-bottom:8px;">LinkedIn Learning</div>
        <div style="font-size:15px;opacity:0.9;margin-bottom:16px;">Grow your skills with 16,000+ expert-led courses</div>
        <button onclick="createToast('Starting free trial!','success')" style="background:white;color:var(--blue);border:none;border-radius:20px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;">Try 1 month free</button>
      </div>
      <div style="margin-bottom:24px;">
        <h2 style="font-size:18px;font-weight:700;margin:0 0 14px;">Recommended for you</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
          ${courses.slice(0,4).map(courseCard).join('')}
        </div>
      </div>
      <div style="margin-bottom:24px;">
        <h2 style="font-size:18px;font-weight:700;margin:0 0 14px;">Browse by category</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">
          ${[['💻','Technology','16,240 courses'],['📊','Business','8,120 courses'],['🎨','Creative','5,340 courses'],['📈','Marketing','3,890 courses'],['🤝','Personal Development','2,120 courses'],['🔒','Security','1,440 courses']].map(([icon,label,count]) =>
            `<div style="border:1px solid var(--border);border-radius:8px;padding:16px;cursor:pointer;text-align:center;transition:border-color 0.2s;" onclick="createToast('Browsing ${label}','info')" onmouseenter="this.style.borderColor='var(--blue)'" onmouseleave="this.style.borderColor='var(--border)'">
              <div style="font-size:32px;margin-bottom:8px;">${icon}</div>
              <div style="font-size:14px;font-weight:600;">${label}</div>
              <div style="font-size:12px;color:var(--text-2);margin-top:2px;">${count}</div>
            </div>`
          ).join('')}
        </div>
      </div>
      <div>
        <h2 style="font-size:18px;font-weight:700;margin:0 0 14px;">Top courses</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
          ${courses.slice(0,8).map(courseCard).join('')}
        </div>
      </div>
    </div>`;

  return `<div style="max-width:1200px;margin:0 auto;padding:20px 16px;">
    <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);">
        <h1 style="font-size:24px;font-weight:700;margin:0;">Learning</h1>
        <div style="display:flex;gap:8px;align-items:center;">
          <div style="border:1px solid var(--border);border-radius:4px;padding:6px 12px;display:flex;gap:8px;align-items:center;background:var(--white);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
            <input type="text" placeholder="Search courses" style="border:none;outline:none;font-size:14px;width:180px;" onkeydown="if(event.key==='Enter')createToast('Searching: '+this.value,'info')"/>
          </div>
          <button onclick="createToast('Learning history','info')" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:20px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer;">History</button>
        </div>
      </div>
      ${tabBar}
    </div>
    <div id="learning-content">
      ${activeTab === 'mylearning' ? myLearningContent : activeTab === 'collections' ? `
        <div style="text-align:center;padding:40px;color:var(--text-2);">
          <div style="font-size:40px;margin-bottom:12px;">📁</div>
          <div style="font-size:18px;font-weight:600;margin-bottom:8px;">No collections yet</div>
          <div style="font-size:14px;margin-bottom:16px;">Create collections to organize your learning content</div>
          <button onclick="createToast('Collection created!','success')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">+ Create collection</button>
        </div>` : `
        <div>${discoverContent}</div>`}
    </div>
  </div>`;
}

function switchLearningTab(tab) {
  App.state.activeTab['learning'] = tab;
  App.render('learning', null);
}

// ============================================================
// EVENTS PAGE
// ============================================================
function renderEvents() {
  const data = window.LinkedInData;
  const events = data?.events || [];
  const activeTab = App.state.activeTab['events'] || 'discover';
  const attending = events.filter(e => e.isAttending);
  const interested = events.filter(e => e.isInterested);

  function eventCard(event) {
    const date = event.date instanceof Date ? event.date : new Date(event.date);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const daysUntil = Math.ceil((date - Date.now()) / 86400000);
    const daysLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : daysUntil > 0 ? `In ${daysUntil} days` : 'Past';

    return `<div class="li-card" style="padding:0;overflow:hidden;cursor:pointer;" onclick="createToast('Opening event: ${escapeHtml(event.title)}','info')">
      <div style="height:100px;background:${event.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};position:relative;">
        <div style="position:absolute;top:10px;left:10px;background:var(--white);border-radius:6px;padding:6px 10px;text-align:center;min-width:44px;">
          <div style="font-size:10px;font-weight:700;color:var(--blue);">${month}</div>
          <div style="font-size:20px;font-weight:700;color:var(--text);">${day}</div>
        </div>
        ${event.isVirtual ? `<div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.5);color:white;font-size:11px;padding:3px 8px;border-radius:10px;">🌐 Online</div>` : `<div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.5);color:white;font-size:11px;padding:3px 8px;border-radius:10px;">📍 In-Person</div>`}
      </div>
      <div style="padding:14px;">
        <div style="font-size:13px;color:${daysUntil <= 3 ? 'var(--orange)' : 'var(--blue)'};font-weight:600;margin-bottom:4px;">${daysLabel}</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:4px;line-height:1.3;">${escapeHtml(event.title)}</div>
        <div style="font-size:13px;color:var(--text-2);margin-bottom:4px;">${escapeHtml(event.time||'')}</div>
        <div style="font-size:13px;color:var(--text-2);margin-bottom:8px;">📍 ${escapeHtml(event.location||'')}</div>
        <div style="font-size:12px;color:var(--text-2);margin-bottom:12px;">${formatNumber(event.attendees||0)} attending · ${formatNumber(event.interested||0)} interested</div>
        <div style="display:flex;gap:8px;">
          <button onclick="event.stopPropagation();toggleEventAttend(${event.id},this)" style="flex:1;background:${event.isAttending?'var(--green)':'var(--blue)'};color:white;border:none;border-radius:16px;padding:7px;font-size:13px;font-weight:600;cursor:pointer;">${event.isAttending ? '✓ Attending' : 'Attend'}</button>
          <button onclick="event.stopPropagation();toggleEventInterest(${event.id},this)" style="border:1px solid ${event.isInterested?'var(--blue)':'var(--border-2)'};color:${event.isInterested?'var(--blue)':'var(--text-2)'};background:none;border-radius:16px;padding:7px 12px;font-size:13px;cursor:pointer;">${event.isInterested ? '★' : '☆'}</button>
        </div>
      </div>
    </div>`;
  }

  return `<div style="max-width:1100px;margin:0 auto;padding:20px 16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h1 style="font-size:24px;font-weight:700;margin:0;">Events</h1>
      <button onclick="App.openModal('create-event-modal')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">+ Create event</button>
    </div>

    <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:16px;">
      <div style="display:flex;border-bottom:1px solid var(--border);overflow-x:auto;">
        ${[['discover','Discover'],['attending','Attending ('+attending.length+')'],['interested','Interested ('+interested.length+')']].map(([id,label]) =>
          `<button onclick="switchEventsTab('${id}')" id="etab-${id}" style="padding:14px 20px;border:none;background:none;cursor:pointer;font-size:14px;white-space:nowrap;font-weight:${activeTab===id?'600':'400'};color:${activeTab===id?'var(--blue)':'var(--text-2)'};border-bottom:${activeTab===id?'2px solid var(--blue)':'2px solid transparent'};">${label}</button>`
        ).join('')}
      </div>
    </div>

    ${activeTab === 'attending' ? (attending.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">${attending.map(eventCard).join('')}</div>` : `<div class="li-card" style="padding:40px;text-align:center;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">📅</div><div style="font-size:18px;font-weight:600;margin-bottom:8px;">No events yet</div><div style="font-size:14px;margin-bottom:16px;">Find events to attend from the Discover tab</div><button onclick="switchEventsTab('discover')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">Discover events</button></div>`) : ''}
    ${activeTab === 'interested' ? (interested.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">${interested.map(eventCard).join('')}</div>` : `<div class="li-card" style="padding:40px;text-align:center;color:var(--text-2);"><div style="font-size:40px;margin-bottom:12px;">⭐</div><div style="font-size:18px;font-weight:600;margin-bottom:8px;">No interested events</div><div style="font-size:14px;">Mark events as interested to see them here</div></div>`) : ''}
    ${activeTab === 'discover' ? `
      <div style="margin-bottom:20px;">
        <div style="background:linear-gradient(135deg,#0a66c2,#004182);color:white;border-radius:8px;padding:20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
          <div style="flex:1;">
            <div style="font-size:18px;font-weight:700;margin-bottom:4px;">Find events you'll love</div>
            <div style="font-size:14px;opacity:0.9;">Connect with professionals at in-person and online events</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${[['All','all'],['Online','online'],['In-person','inperson'],['This week','week']].map(([label]) =>
              `<button onclick="createToast('Filtering: ${label}','info')" style="background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.5);border-radius:16px;padding:6px 14px;font-size:13px;cursor:pointer;">${label}</button>`
            ).join('')}
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
        ${events.map(eventCard).join('')}
      </div>` : ''}
  </div>`;
}

function switchEventsTab(tab) {
  App.state.activeTab['events'] = tab;
  App.render('events', null);
}

function toggleEventAttend(eventId, btn) {
  const data = window.LinkedInData;
  const event = data?.events?.find(e => e.id === eventId);
  if (event) {
    event.isAttending = !event.isAttending;
    btn.textContent = event.isAttending ? '✓ Attending' : 'Attend';
    btn.style.background = event.isAttending ? 'var(--green)' : 'var(--blue)';
    createToast(event.isAttending ? 'You are now attending!' : 'Removed from attending', event.isAttending ? 'success' : 'info');
  }
}

function toggleEventInterest(eventId, btn) {
  const data = window.LinkedInData;
  const event = data?.events?.find(e => e.id === eventId);
  if (event) {
    event.isInterested = !event.isInterested;
    btn.textContent = event.isInterested ? '★' : '☆';
    btn.style.color = event.isInterested ? 'var(--blue)' : 'var(--text-2)';
    btn.style.borderColor = event.isInterested ? 'var(--blue)' : '#ccc';
    createToast(event.isInterested ? 'Marked as interested!' : 'Removed from interested', 'info');
  }
}

// ============================================================
// GROUPS PAGES
// ============================================================
function renderGroups() {
  const data = window.LinkedInData;
  const groups = data?.groups || [];
  const myGroups = groups.filter(g => g.isJoined);
  const activeTab = App.state.activeTab['groups'] || 'mygroups';

  function groupCard(group) {
    return `<div class="li-card" style="padding:0;overflow:hidden;cursor:pointer;transition:box-shadow 0.2s;" onclick="window.location.hash='group/${group.id}'" onmouseenter="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onmouseleave="this.style.boxShadow=''">
      <div style="height:80px;background:${group.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};position:relative;">
        <div style="position:absolute;bottom:-24px;left:14px;width:48px;height:48px;border-radius:8px;border:2px solid var(--white);overflow:hidden;background:var(--white);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 1px 4px rgba(0,0,0,0.15);">${group.logo||'👥'}</div>
        ${group.unread > 0 ? `<div style="position:absolute;top:8px;right:8px;background:var(--red);color:white;border-radius:10px;font-size:11px;font-weight:700;padding:2px 7px;">${group.unread} new</div>` : ''}
      </div>
      <div style="padding:32px 14px 14px;">
        <div style="font-size:15px;font-weight:700;margin-bottom:3px;line-height:1.3;">${escapeHtml(group.name)}</div>
        <div style="font-size:12px;color:var(--text-2);margin-bottom:6px;">${group.privacy||'Public'} · ${formatNumber(group.members||0)} members</div>
        <div style="font-size:12px;color:var(--text-2);margin-bottom:12px;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(group.description||'')}</div>
        <button onclick="event.stopPropagation();toggleGroupMembership(${group.id},this)" style="width:100%;border:${group.isJoined?'1px solid var(--border-2)':'1.5px solid var(--blue)'};color:${group.isJoined?'var(--text-2)':'var(--blue)'};background:none;border-radius:16px;padding:7px;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.15s;" onmouseenter="if(!this.textContent.includes('✓'))this.style.background='var(--blue-light)'" onmouseleave="this.style.background='none'">${group.isJoined?'✓ Member':'Join'}</button>
      </div>
    </div>`;
  }

  return `<div style="max-width:1100px;margin:0 auto;padding:20px 16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h1 style="font-size:24px;font-weight:700;margin:0;">Groups</h1>
      <button onclick="createToast('Create group feature coming soon','info')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">+ Create a group</button>
    </div>

    <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:16px;">
      <div style="display:flex;border-bottom:1px solid var(--border);">
        ${[['mygroups','My groups ('+myGroups.length+')'],['discover','Discover']].map(([id,label]) =>
          `<button onclick="switchGroupsTab('${id}')" id="gtab-${id}" style="padding:14px 20px;border:none;background:none;cursor:pointer;font-size:14px;font-weight:${activeTab===id?'600':'400'};color:${activeTab===id?'var(--blue)':'var(--text-2)'};border-bottom:${activeTab===id?'2px solid var(--blue)':'2px solid transparent'};">${label}</button>`
        ).join('')}
      </div>
    </div>

    ${activeTab === 'mygroups' ? (myGroups.length ? `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;">
        ${myGroups.map(groupCard).join('')}
      </div>` : `
      <div class="li-card" style="padding:40px;text-align:center;color:var(--text-2);">
        <div style="font-size:40px;margin-bottom:12px;">👥</div>
        <div style="font-size:18px;font-weight:600;margin-bottom:8px;">No groups yet</div>
        <div style="font-size:14px;margin-bottom:16px;">Join groups to connect with professionals who share your interests</div>
        <button onclick="switchGroupsTab('discover')" style="background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">Discover groups</button>
      </div>`) : ''}

    ${activeTab === 'discover' ? `
      <div style="margin-bottom:16px;">
        <div style="border:1px solid var(--border);border-radius:4px;padding:8px 14px;display:flex;gap:8px;align-items:center;background:var(--white);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          <input type="text" placeholder="Search groups" style="border:none;outline:none;font-size:14px;flex:1;" oninput="filterGroupsList(this.value)"/>
        </div>
      </div>
      <div style="margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap;">
        ${['Technology','Business','Product','Design','AI/ML','Startups'].map(cat =>
          `<button onclick="createToast('Filtering: ${cat}','info')" style="border:1px solid var(--border);color:var(--text);background:none;border-radius:16px;padding:6px 14px;font-size:13px;cursor:pointer;">${cat}</button>`
        ).join('')}
      </div>
      <div id="groups-discover-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;">
        ${groups.map(groupCard).join('')}
      </div>` : ''}
  </div>`;
}

function switchGroupsTab(tab) {
  App.state.activeTab['groups'] = tab;
  App.render('groups', null);
}

function toggleGroupMembership(groupId, btn) {
  const data = window.LinkedInData;
  const group = data?.groups?.find(g => g.id === groupId);
  if (group) {
    group.isJoined = !group.isJoined;
    btn.textContent = group.isJoined ? '✓ Joined' : 'Join';
    btn.style.color = group.isJoined ? 'var(--text-2)' : 'var(--blue)';
    btn.style.borderColor = group.isJoined ? '#ccc' : 'var(--blue)';
    createToast(group.isJoined ? `Joined ${group.name}!` : `Left ${group.name}`, group.isJoined ? 'success' : 'info');
  }
}

function filterGroupsList(query) {
  const container = document.getElementById('groups-discover-list');
  if (!container) return;
  const cards = container.querySelectorAll('[onclick]');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
  });
}

function renderGroup(groupId) {
  const data = window.LinkedInData;
  const group = data?.groups?.find(g => String(g.id) === String(groupId));
  if (!group) return `<div class="li-card" style="padding:32px;text-align:center;color:var(--text-2);">Group not found.</div>`;
  const activeTab = App.state.activeTab['group-'+groupId] || 'posts';
  const groupPosts = App.state.feedPosts.slice(0, 5);
  const members = data?.users?.slice(0, 12) || [];

  return `<div style="max-width:1100px;margin:0 auto;padding:20px 16px;">
    <div class="li-card" style="padding:0;overflow:hidden;margin-bottom:8px;">
      <div style="height:160px;background:${group.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};display:flex;align-items:center;justify-content:center;font-size:64px;">${group.logo||'👥'}</div>
      <div style="padding:20px 24px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 style="font-size:22px;font-weight:700;margin:0 0 6px;">${escapeHtml(group.name)}</h1>
            <div style="font-size:14px;color:var(--text-2);">${group.privacy||'Public'} group · ${formatNumber(group.members||0)} members</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="toggleGroupMembership(${group.id},this)" style="background:${group.isJoined?'white':'var(--blue)'};color:${group.isJoined?'var(--blue)':'white'};border:1px solid var(--blue);border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">${group.isJoined?'✓ Joined':'Join group'}</button>
            <button onclick="createToast('Group shared!','success')" style="border:1px solid var(--border-2);color:var(--text);background:none;border-radius:20px;padding:8px 14px;font-size:14px;cursor:pointer;">Share</button>
          </div>
        </div>
      </div>
      <div style="display:flex;border-top:1px solid var(--border);overflow-x:auto;">
        ${[['posts','Posts'],['about','About'],['members','Members ('+members.length+')'],['events','Events'],['rules','Rules']].map(([id,label]) =>
          `<button onclick="switchGroupTab('${groupId}','${id}')" id="gptab-${groupId}-${id}" style="padding:14px 18px;border:none;background:none;cursor:pointer;font-size:14px;white-space:nowrap;font-weight:${activeTab===id?'600':'400'};color:${activeTab===id?'var(--blue)':'var(--text-2)'};border-bottom:${activeTab===id?'2px solid var(--blue)':'2px solid transparent'};">${label}</button>`
        ).join('')}
      </div>
    </div>

    <div style="display:flex;gap:16px;">
      <main style="flex:1;min-width:0;">
        ${activeTab === 'posts' ? `
          <div class="li-card" style="padding:16px;margin-bottom:8px;cursor:pointer;" onclick="openPostModal()">
            <div style="display:flex;gap:12px;align-items:center;">
              ${generateAvatar(App.state.currentUser.name, 48, App.state.currentUser.avatarColor)}
              <div style="flex:1;border:1px solid var(--border);border-radius:24px;padding:10px 16px;font-size:14px;color:var(--text-2);">Start a post in ${escapeHtml(group.name)}</div>
            </div>
          </div>
          ${groupPosts.map(p => renderPostCard(p)).join('')}` : ''}

        ${activeTab === 'about' ? `<div class="li-card" style="padding:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 14px;">About this group</h2>
          <p style="font-size:15px;color:var(--text);line-height:1.7;">${escapeHtml(group.description||'')}</p>
          <div style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px;">
            ${[['Members',formatNumber(group.members||0)],['Posts per week',Math.floor((group.posts||1000)/52).toLocaleString()],['Privacy',group.privacy||'Public'],['Founded','2016'],['Category',group.category||'Technology']].map(([k,v]) =>
              `<div style="display:flex;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px;"><span style="font-weight:600;min-width:160px;color:var(--text-2);">${k}</span><span style="color:var(--text);">${v}</span></div>`
            ).join('')}
          </div>
        </div>` : ''}

        ${activeTab === 'members' ? `<div class="li-card" style="padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h2 style="font-size:20px;font-weight:700;margin:0;">${formatNumber(group.members||0)} members</h2>
            <div style="border:1px solid var(--border);border-radius:4px;padding:6px 12px;display:flex;gap:6px;align-items:center;">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/></svg>
              <input type="text" placeholder="Search members" style="border:none;outline:none;font-size:13px;width:140px;"/>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
            ${[App.state.currentUser, ...members].slice(0,12).map((m,i) => `<div style="border:1px solid var(--border);border-radius:8px;padding:16px;text-align:center;">
              ${generateAvatar(m.name, 56, m.avatarColor)}
              <a href="#profile/${m.id||i+1}" style="display:block;font-weight:600;font-size:14px;color:var(--text);text-decoration:none;margin-top:8px;">${escapeHtml(m.name)}</a>
              <div style="font-size:12px;color:var(--text-2);margin:4px 0 8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml((m.headline||'').split('|')[0].trim())}</div>
              ${i === 0 ? `<span style="background:var(--blue-light);color:var(--blue);font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;">You</span>` : `<button onclick="connectUser(${m.id||i+1}, this)" style="border:1px solid var(--blue);color:var(--blue);background:none;border-radius:14px;padding:5px 16px;font-size:12px;font-weight:600;cursor:pointer;width:100%;">Connect</button>`}
            </div>`).join('')}
          </div>
        </div>` : ''}

        ${activeTab === 'rules' ? `<div class="li-card" style="padding:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 16px;">Group Rules</h2>
          ${[
            ['1. Be professional and respectful','Keep interactions professional. Personal attacks, harassment, or discriminatory language are not tolerated.'],
            ['2. No spam or self-promotion','Don\'t post repetitive promotional content, MLM pitches, or unsolicited job offers.'],
            ['3. Stay on topic','Keep discussions relevant to the group\'s focus area.'],
            ['4. Share original content','Credit original sources and avoid plagiarism.'],
            ['5. No misinformation','Ensure shared information is accurate and from reputable sources.'],
          ].map(([title, desc]) => `<div style="padding:16px 0;border-bottom:1px solid var(--border);">
            <div style="font-weight:700;font-size:15px;margin-bottom:6px;">${title}</div>
            <div style="font-size:14px;color:var(--text-2);line-height:1.6;">${desc}</div>
          </div>`).join('')}
        </div>` : ''}

        ${activeTab === 'events' ? `<div class="li-card" style="padding:24px;">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 16px;">Group Events</h2>
          <div style="text-align:center;padding:20px;color:var(--text-2);">
            <div style="font-size:40px;margin-bottom:12px;">📅</div>
            <div style="font-size:15px;">No upcoming events in this group.</div>
            <button onclick="App.navigate('events')" style="margin-top:12px;background:var(--blue);color:white;border:none;border-radius:20px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;">Browse all events</button>
          </div>
        </div>` : ''}
      </main>

      <aside style="flex-shrink:0;width:280px;">
        <div class="li-card" style="padding:16px;margin-bottom:8px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:12px;">About</div>
          <p style="font-size:13px;color:var(--text-2);line-height:1.5;margin:0 0 12px;">${escapeHtml((group.description||'').slice(0,120))}${(group.description||'').length > 120 ? '...' : ''}</p>
          <div style="font-size:13px;color:var(--text-2);padding:4px 0;">${group.privacy||'Public'} group</div>
          <div style="font-size:13px;color:var(--text-2);padding:4px 0;">${formatNumber(group.members||0)} members</div>
          <div style="font-size:13px;color:var(--text-2);padding:4px 0;">~${(group.posts||500).toLocaleString()} posts per week</div>
        </div>
        <div class="li-card" style="padding:16px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:12px;">Similar groups</div>
          ${(data?.groups||[]).filter(g => g.id !== parseInt(groupId)).slice(0,3).map(g =>
            `<div style="display:flex;gap:10px;align-items:center;padding:8px 0;cursor:pointer;" onclick="window.location.hash='group/${g.id}'">
              <div style="width:40px;height:40px;background:${g.coverGradient||'linear-gradient(135deg,#0a66c2,#004182)'};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${g.logo||'👥'}</div>
              <div>
                <div style="font-size:13px;font-weight:600;">${escapeHtml(g.name)}</div>
                <div style="font-size:11px;color:var(--text-2);">${formatNumber(g.members||0)} members</div>
              </div>
            </div>`
          ).join('')}
        </div>
      </aside>
    </div>
  </div>`;
}

function switchGroupTab(groupId, tab) {
  App.state.activeTab['group-'+groupId] = tab;
  App.render('group', groupId);
}

// ============================================================
// PREMIUM PAGE
// ============================================================
function renderPremium() {
  const u = App.state.currentUser;
  const plans = [
    {
      id: 'career', name: 'Career', price: 39.99, color: '#f5a623', icon: '🎯',
      tagline: 'Get hired faster',
      features: [
        'LinkedIn Learning (16,000+ courses)',
        '5 InMail messages per month',
        'See who viewed your profile',
        'AI-powered job insights',
        'Top Applicant badge on jobs',
        'Applicant insights (where you rank)',
        'Resume insights from experts',
        'Interview preparation with AI',
      ]
    },
    {
      id: 'business', name: 'Business', price: 59.99, color: '#0a66c2', icon: '💼',
      tagline: 'Build your network', popular: true,
      features: [
        'Everything in Career',
        '15 InMail messages per month',
        'Unlimited people browsing',
        'Business insights',
        'Company insights and analytics',
        'Open Profile (anyone can message you)',
        'LinkedIn Learning advanced paths',
        'Custom button on profile',
      ]
    },
    {
      id: 'sales', name: 'Sales Navigator', price: 99.99, color: '#057642', icon: '📈',
      tagline: 'Grow your business',
      features: [
        'Everything in Business',
        '50 InMail messages per month',
        'Advanced lead & account search',
        'Lead recommendations',
        'CRM integrations (Salesforce, HubSpot)',
        'Real-time sales updates',
        'Saved leads & accounts lists',
        'TeamLink (see your team\'s network)',
      ]
    },
    {
      id: 'recruiter', name: 'Recruiter Lite', price: 169.99, color: '#6b46c1', icon: '🔍',
      tagline: 'Find top talent',
      features: [
        'Everything in Business',
        '30 InMail messages per month',
        'Advanced candidate search filters',
        'Saved searches & alerts',
        'Project organization for candidates',
        'Collaborative hiring tools',
        'Candidate tracking & notes',
        'Smart suggestions for candidates',
      ]
    }
  ];

  return `<div style="max-width:1100px;margin:0 auto;padding:20px 16px;">
    <!-- Hero -->
    <div style="text-align:center;padding:40px 20px;background:linear-gradient(135deg,#0a66c2,#004182);color:white;border-radius:12px;margin-bottom:32px;">
      <div style="font-size:14px;font-weight:600;opacity:0.9;margin-bottom:8px;">LINKEDIN PREMIUM</div>
      <h1 style="font-size:36px;font-weight:800;margin:0 0 12px;">Unlock your full potential</h1>
      <div style="font-size:16px;opacity:0.9;margin-bottom:24px;">Stand out, get hired faster, and grow your network with Premium tools</div>
      <div style="display:flex;justify-content:center;gap:32px;flex-wrap:wrap;">
        ${['👁️ See who viewed your profile','✉️ InMail any LinkedIn member','🎓 16,000+ online courses','📊 Job & business insights'].map(f =>
          `<div style="font-size:14px;opacity:0.9;">${f}</div>`
        ).join('')}
      </div>
    </div>

    <!-- Current plan banner -->
    ${u.isPremium ? `<div style="background:var(--premium-banner-bg,#fef3c7);border:1px solid var(--premium-banner-border,#f5a623);border-radius:8px;padding:14px 20px;margin-bottom:24px;display:flex;gap:12px;align-items:center;">
      <span style="font-size:24px;">⭐</span>
      <div><div style="font-weight:700;font-size:15px;color:var(--text);">You have LinkedIn Premium Business</div><div style="font-size:13px;color:var(--text-2);">Your subscription renews on March 15, 2026</div></div>
      <button onclick="createToast('Manage subscription','info')" style="margin-left:auto;border:1px solid var(--premium-banner-border,#f5a623);color:var(--gold-dark);background:none;border-radius:16px;padding:6px 16px;font-size:13px;font-weight:600;cursor:pointer;">Manage</button>
    </div>` : `<div style="background:var(--success-banner-bg,#d1fae5);border:1px solid var(--success-banner-border,#34d399);border-radius:8px;padding:14px 20px;margin-bottom:24px;display:flex;gap:12px;align-items:center;">
      <span style="font-size:24px;">🎁</span>
      <div><div style="font-weight:700;font-size:15px;color:var(--text);">Try 1 month free, then cancel anytime</div><div style="font-size:13px;color:var(--text-2);">No commitment. Full access to all Premium features.</div></div>
    </div>`}

    <!-- Plans -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:32px;">
      ${plans.map(plan => `<div style="border:2px solid ${plan.popular?plan.color:'var(--border)'};border-radius:12px;overflow:hidden;position:relative;background:var(--white);transition:transform 0.2s,box-shadow 0.2s;" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.14)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
        ${plan.popular ? `<div style="background:${plan.color};color:white;text-align:center;font-size:11px;font-weight:800;padding:7px;letter-spacing:.5px;">⭐ MOST POPULAR</div>` : `<div style="height:4px;background:${plan.color};"></div>`}
        <div style="padding:22px;">
          <div style="width:48px;height:48px;background:${plan.color}22;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:14px;">${plan.icon}</div>
          <div style="font-size:20px;font-weight:800;margin-bottom:3px;color:var(--text);">LinkedIn ${plan.name}</div>
          <div style="font-size:13px;color:var(--text-2);margin-bottom:16px;">${plan.tagline}</div>
          <div style="margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid var(--border);">
            <span style="font-size:34px;font-weight:800;color:${plan.color};">$${plan.price}</span>
            <span style="font-size:14px;color:var(--text-2);">/mo</span>
            <div style="font-size:12px;color:var(--text-2);margin-top:3px;">Billed monthly · Save 20% annually</div>
          </div>
          <button onclick="createToast('Starting ${u.isPremium?'plan switch':'free trial'} for LinkedIn ${plan.name}!','success')" style="width:100%;background:${plan.popular?plan.color:'var(--white)'};color:${plan.popular?'white':plan.color};border:2px solid ${plan.color};border-radius:20px;padding:10px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:18px;transition:opacity .15s;" onmouseenter="this.style.opacity='.85'" onmouseleave="this.style.opacity='1'">
            ${u.isPremium ? 'Switch to this plan' : 'Start free 1-month trial'}
          </button>
          <div style="font-size:12px;font-weight:700;color:var(--text-2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Includes</div>
          ${plan.features.map(f => `<div style="display:flex;gap:8px;font-size:13px;margin-bottom:9px;color:var(--text);align-items:flex-start;">
            <svg viewBox="0 0 16 16" width="14" height="14" style="flex-shrink:0;margin-top:1px;" fill="${plan.color}"><path d="M13.5 3.5L6 11 2.5 7.5" stroke="${plan.color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>${f}</span>
          </div>`).join('')}
        </div>
      </div>`).join('')}
    </div>

    <!-- Features comparison table -->
    <div class="li-card" style="padding:24px;margin-bottom:24px;">
      <h2 style="font-size:22px;font-weight:700;margin:0 0 20px;text-align:center;">Compare all features</h2>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="border-bottom:2px solid var(--border);">
              <th style="text-align:left;padding:12px 16px;font-weight:700;min-width:220px;">Feature</th>
              ${plans.map(p => `<th style="text-align:center;padding:12px 16px;font-weight:700;color:${p.color};">${p.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${[
              ['Profile viewers', '90 days', '365 days', '365 days', '365 days'],
              ['InMail messages', '5/mo', '15/mo', '50/mo', '30/mo'],
              ['LinkedIn Learning', '✓', '✓', '✓', '✓'],
              ['AI job insights', '✓', '✓', '✓', '✓'],
              ['Open Profile', '—', '✓', '✓', '✓'],
              ['Business insights', '—', '✓', '✓', '✓'],
              ['Advanced search', '—', '—', '✓', '✓'],
              ['CRM integration', '—', '—', '✓', '—'],
              ['Candidate tools', '—', '—', '—', '✓'],
            ].map((row, i) => `<tr style="border-bottom:1px solid var(--border);background:${i%2===0?'var(--white)':'var(--bg)'};">
              ${row.map((cell, j) => `<td style="padding:12px 16px;${j===0?'font-weight:600;color:var(--text);':'text-align:center;color:'+(cell==='✓'?'var(--green)':cell==='—'?'var(--text-3)':'var(--text)')+';'}">${cell}</td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Testimonials -->
    <div style="margin-bottom:32px;">
      <h2 style="font-size:22px;font-weight:700;margin:0 0 20px;text-align:center;">What Premium members say</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
        ${[
          { name: 'Jennifer Lee', role: 'Software Engineer', company: 'Google', text: 'LinkedIn Learning helped me land my dream job. The courses are top-notch and the certificate gave me an edge over other candidates.', rating: 5, plan: 'Career' },
          { name: 'Michael Torres', role: 'Sales Director', company: 'Salesforce', text: 'Sales Navigator transformed how I prospect. The lead recommendations are incredibly accurate and save me hours every week.', rating: 5, plan: 'Sales Navigator' },
          { name: 'Priya Sharma', role: 'HR Manager', company: 'Meta', text: 'Recruiter Lite is invaluable for finding passive candidates. The search filters are far more powerful than free LinkedIn.', rating: 5, plan: 'Recruiter Lite' },
        ].map(t => `<div class="li-card" style="padding:20px;position:relative;">
          <div style="position:absolute;top:16px;right:16px;font-size:11px;font-weight:700;color:var(--blue);background:var(--bg);padding:3px 8px;border-radius:8px;">${escapeHtml(t.plan)}</div>
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">
            <div style="border-radius:50%;overflow:hidden;">${generateAvatar(t.name, 48)}</div>
            <div>
              <div style="font-weight:700;font-size:14px;">${escapeHtml(t.name)}</div>
              <div style="font-size:12px;color:var(--text-2);">${escapeHtml(t.role)} at ${escapeHtml(t.company)}</div>
            </div>
          </div>
          <div style="color:var(--gold);margin-bottom:10px;font-size:16px;letter-spacing:1px;">${'★'.repeat(t.rating)}</div>
          <p style="font-size:14px;color:var(--text);line-height:1.6;margin:0;">"${escapeHtml(t.text)}"</p>
        </div>`).join('')}
      </div>
    </div>

    <!-- FAQ -->
    <div class="li-card" style="padding:24px;">
      <h2 style="font-size:22px;font-weight:700;margin:0 0 20px;">Frequently asked questions</h2>
      ${[
        ['Can I cancel anytime?', 'Yes! You can cancel your Premium subscription at any time. You\'ll continue to have access until the end of your billing period.'],
        ['What happens to my data if I cancel?', 'Your profile and connections remain intact. You\'ll simply lose access to Premium features.'],
        ['Is there a free trial?', 'New Premium subscribers get 1 month free. After the trial, you\'re charged the monthly or annual rate.'],
        ['Can I switch between plans?', 'Yes, you can upgrade or downgrade your plan at any time from your subscription settings.'],
      ].map(([q, a], i) => `<div style="border-bottom:1px solid var(--border);overflow:hidden;">
        <button onclick="toggleFaq(${i}, this)" style="width:100%;text-align:left;padding:16px 0;background:none;border:none;cursor:pointer;font-size:15px;font-weight:600;color:var(--text);display:flex;justify-content:space-between;align-items:center;">
          ${q} <span id="faq-icon-${i}" style="font-size:18px;color:var(--text-2);">+</span>
        </button>
        <div id="faq-${i}" style="display:none;padding-bottom:16px;font-size:14px;color:var(--text-2);line-height:1.6;">${a}</div>
      </div>`).join('')}
    </div>
  </div>`;
}

function toggleFaq(index, _btn) {
  const content = document.getElementById('faq-' + index);
  const icon = document.getElementById('faq-icon-' + index);
  if (content) {
    const isOpen = content.style.display !== 'none';
    content.style.display = isOpen ? 'none' : 'block';
    if (icon) icon.textContent = isOpen ? '+' : '−';
  }
}

// ============================================================
// BOOTSTRAP (start the SPA)
// ============================================================
(function boot() {
  function start() {
    try {
      // initialize app if available
      if (typeof App !== 'undefined' && App && typeof App.init === 'function') {
        App.init();
      }

      // ensure something renders on first load
      if (!window.location.hash) window.location.hash = '#feed';

      // route render if the function exists
      if (typeof App !== 'undefined' && App && typeof App._handleRoute === 'function') {
        App._handleRoute();
      }

      // optional infinite scroll hook
      window.addEventListener('scroll', () => {
        if (typeof _loadMorePosts === 'function') _loadMorePosts();
      }, { passive: true });

    } catch (e) {
      console.error('Boot error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
