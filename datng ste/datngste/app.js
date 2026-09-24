/**
 * AmourLuxe - Luxury Dating & Photo Vault Application Logic
 * Full interactive features: Photo upload, Lightbox, Real-time Chat with simulated bot/host dual mode,
 * Date scheduling system, and LocalStorage persistence.
 */

// Initial State & Preloaded Seed Data
const DEFAULT_HOST_PROFILE = {
    name: "Elena Vance",
    location: "Manhattan, NY & Traveling",
    tagline: "Designer & Travel Enthusiast • Seeking meaningful connections & memorable dates.",
    bio: "Welcome to my private space! I love high fashion, spontaneous weekend getaways, contemporary art, and deep late-night conversations. Browse through my photo vault, leave a message, or propose a date if you'd like to get to know me better.",
    interests: "Fine Dining, Luxury Travel, Contemporary Art, Wine Tasting, Fashion Design, Fitness",
    rules: "Please propose meetups at least 24 hours in advance. Public venues only for first meetings. Polite & respectful gentleman etiquette expected.",
    avatar: "assets/host_portrait.jpg"
};

const DEFAULT_PHOTOS = [
    {
        id: "p1",
        url: "assets/host_portrait.jpg",
        caption: "Warm golden hour vibes before the evening gala in Paris ✨",
        category: "Glamour",
        access: "public",
        likes: 84,
        liked: false,
        comments: [
            { author: "Marcus Sterling", text: "Stunning look! Hope Paris treats you well." },
            { author: "Julian V.", text: "Breathtaking portrait!" }
        ],
        timestamp: "2 hours ago"
    },
    {
        id: "p2",
        url: "assets/host_gallery_1.jpg",
        caption: "Sunset cocktails on the rooftop lounge. My absolute favorite evening ritual 🍸",
        category: "Evening",
        access: "public",
        likes: 58,
        liked: false,
        comments: [
            { author: "David Chen", text: "That cocktail looks incredible. Which rooftop is this?" }
        ],
        timestamp: "Yesterday"
    },
    {
        id: "p3",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        caption: "Casual Sunday stroll through the modern art museum gallery 🎨",
        category: "Casual",
        access: "public",
        likes: 42,
        liked: false,
        comments: [],
        timestamp: "3 days ago"
    },
    {
        id: "p4",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        caption: "Private balcony view overlooking the Amalfi Coast coastline 🌊",
        category: "Travel",
        access: "vip",
        likes: 96,
        liked: true,
        comments: [
            { author: "Marcus Sterling", text: "Amalfi is gorgeous! Have you visited Positano yet?" }
        ],
        timestamp: "4 days ago"
    },
    {
        id: "p5",
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        caption: "Chic black dress night out for wine tasting with close friends 🍷",
        category: "Evening",
        access: "public",
        likes: 67,
        liked: false,
        comments: [],
        timestamp: "1 week ago"
    },
    {
        id: "p6",
        url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
        caption: "Morning coffee & quiet reading before the city wakes up ☕",
        category: "Casual",
        access: "vip",
        likes: 110,
        liked: true,
        comments: [],
        timestamp: "2 weeks ago"
    }
];

const DEFAULT_CONVERSATIONS = [
    {
        id: "conv_elena",
        name: "Elena Vance",
        avatar: "assets/host_portrait.jpg",
        status: "Online • Fast Responder",
        isHost: true,
        unread: 1,
        messages: [
            { sender: "host", text: "Hi there! Welcome to my private portal. Feel free to browse my gallery or let me know if you'd like to get coffee!", time: "10:30 AM" }
        ]
    },
    {
        id: "conv_marcus",
        name: "Marcus Sterling",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        status: "Online",
        isHost: false,
        unread: 0,
        messages: [
            { sender: "client", text: "Good evening Elena! I loved your Paris rooftop photo. Are you free for dinner this Friday?", time: "6:15 PM" },
            { sender: "host", text: "Thank you Marcus! Friday night sounds lovely. Would 8:00 PM work for you?", time: "6:22 PM" }
        ]
    },
    {
        id: "conv_david",
        name: "David Chen",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        status: "Offline",
        isHost: false,
        unread: 0,
        messages: [
            { sender: "client", text: "Hey Elena, I submitted a date request for the Art Gallery Walk next Tuesday!", time: "Yesterday" }
        ]
    }
];

const DEFAULT_MEETUPS = [
    {
        id: "m1",
        clientName: "Marcus Sterling",
        concept: "Fine Dining & Wine Tasting",
        date: "2026-09-28",
        time: "20:00",
        location: "The Grill at Rockefeller Center, NYC",
        note: "Looking forward to an evening of great wine and conversation!",
        status: "confirmed"
    },
    {
        id: "m2",
        clientName: "David Chen",
        concept: "Art Gallery & Espresso Walk",
        date: "2026-10-02",
        time: "15:30",
        location: "Chelsea Contemporary Art Gallery",
        note: "Would love to check out the new modern art exhibition together.",
        status: "pending"
    }
];

// App Controller State
class AppState {
    constructor() {
        this.currentMode = localStorage.getItem('amour_mode') || 'client'; // 'client' | 'host'
        this.currentTab = 'gallery';
        this.profile = JSON.parse(localStorage.getItem('amour_profile')) || DEFAULT_HOST_PROFILE;
        this.photos = JSON.parse(localStorage.getItem('amour_photos')) || DEFAULT_PHOTOS;
        this.conversations = JSON.parse(localStorage.getItem('amour_conversations')) || DEFAULT_CONVERSATIONS;
        this.meetups = JSON.parse(localStorage.getItem('amour_meetups')) || DEFAULT_MEETUPS;
        
        this.activeFilter = 'all';
        this.searchQuery = '';
        this.activeChatId = this.currentMode === 'client' ? 'conv_elena' : 'conv_marcus';
        this.selectedLightboxPhoto = null;
        this.stagedUploadFile = null;
    }

    saveState() {
        localStorage.setItem('amour_mode', this.currentMode);
        localStorage.setItem('amour_profile', JSON.stringify(this.profile));
        localStorage.setItem('amour_photos', JSON.stringify(this.photos));
        localStorage.setItem('amour_conversations', JSON.stringify(this.conversations));
        localStorage.setItem('amour_meetups', JSON.stringify(this.meetups));
    }
}

const state = new AppState();

// Web Audio API Chime Effects
function playSound(type) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'sent') {
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'received') {
            osc.frequency.setValueAtTime(659.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'pop') {
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        }
    } catch (e) {
        // Audio context muted or unallowed
    }
}

// UI Notification Toasts
function showToast(message, icon = 'fa-solid fa-circle-check') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 400);
    }, 3200);
}

// DOM Elements Initialization & Event Binders
document.addEventListener('DOMContentLoaded', () => {
    initModeSwitcher();
    initTabNavigation();
    initProfileUI();
    renderGallery();
    renderChatSystem();
    renderMeetups();

    initModalListeners();
    initUploadSystem();
    initDateScheduler();
    initProfileEditor();
});

/* ================= 1. MODE SWITCHER ================= */
function initModeSwitcher() {
    const clientBtn = document.getElementById('clientModeBtn');
    const hostBtn = document.getElementById('hostModeBtn');
    const roleNoticeText = document.getElementById('roleNoticeText');
    const uploadBtnText = document.getElementById('uploadBtnText');
    const uploadTriggerBtn = document.getElementById('uploadTriggerBtn');

    function updateModeUI() {
        if (state.currentMode === 'client') {
            clientBtn.classList.add('active');
            hostBtn.classList.remove('active');
            roleNoticeText.innerHTML = `You are currently viewing as a <strong>Client (Visitor)</strong>. Browse photos, chat with ${state.profile.name}, or request a date!`;
            uploadBtnText.textContent = "Propose a Date";
            uploadTriggerBtn.onclick = () => openModal('meetupModal');
            state.activeChatId = 'conv_elena';
        } else {
            hostBtn.classList.add('active');
            clientBtn.classList.remove('active');
            roleNoticeText.innerHTML = `You are currently in <strong>Host / Admin Mode</strong>. Upload photos to your vault, reply to clients, & manage dates.`;
            uploadBtnText.textContent = "Upload Photo";
            uploadTriggerBtn.onclick = () => openModal('uploadModal');
            state.activeChatId = 'conv_marcus';
        }
        renderGallery();
        renderChatSystem();
        renderMeetups();
        state.saveState();
    }

    clientBtn.addEventListener('click', () => {
        state.currentMode = 'client';
        updateModeUI();
        showToast("Switched to Client View", "fa-solid fa-user");
    });

    hostBtn.addEventListener('click', () => {
        state.currentMode = 'host';
        updateModeUI();
        showToast("Switched to Host / Admin View", "fa-solid fa-crown");
    });

    updateModeUI();
}

/* ================= 2. TAB NAVIGATION ================= */
function initTabNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            navBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab${capitalize(targetTab)}`).classList.add('active');
            state.currentTab = targetTab;
        });
    });

    document.getElementById('quickChatBtn').onclick = () => {
        document.getElementById('navChat').click();
    };
    document.getElementById('quickMeetupBtn').onclick = () => {
        openModal('meetupModal');
    };
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ================= 3. PROFILE HERO HEADER ================= */
function initProfileUI() {
    document.getElementById('heroName').textContent = state.profile.name;
    document.getElementById('heroTagline').textContent = state.profile.tagline;
    document.getElementById('heroLocation').textContent = state.profile.location;
    document.getElementById('heroAvatar').src = state.profile.avatar;
    document.getElementById('bioAvatarPreview').src = state.profile.avatar;
    updateStatsCounter();
}

function updateStatsCounter() {
    const totalLikes = state.photos.reduce((sum, p) => sum + p.likes, 0);
    document.getElementById('totalLikesCount').textContent = totalLikes;
    document.getElementById('totalPhotosCount').textContent = state.photos.length;
    document.getElementById('bioLikesCount').textContent = totalLikes;
}

/* ================= 4. PHOTO GALLERY & LIGHTBOX ================= */
function renderGallery() {
    const grid = document.getElementById('photoGrid');
    grid.innerHTML = '';

    // Filter photos
    const filtered = state.photos.filter(photo => {
        const matchesCategory = (state.activeFilter === 'all') ||
            (state.activeFilter === 'vip' ? photo.access === 'vip' : photo.category.toLowerCase() === state.activeFilter.toLowerCase());
        const matchesSearch = photo.caption.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            photo.category.toLowerCase().includes(state.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="glass-panel" style="grid-column: 1/-1; padding: 3rem; text-align: center;">
                <i class="fa-solid fa-camera-retro" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No photos found in this category</h3>
                <p class="subtext">Try selecting a different filter or search term.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-card';

        const isVipLocked = photo.access === 'vip' && state.currentMode === 'client' && false; // VIP access preview

        card.innerHTML = `
            <div class="photo-card-img-wrap" onclick="openLightbox('${photo.id}')">
                <img src="${photo.url}" alt="${photo.caption}">
                <span class="photo-tag ${photo.access}">${photo.access === 'vip' ? '<i class="fa-solid fa-lock"></i> VIP Exclusive' : photo.category}</span>
                ${state.currentMode === 'host' ? `<button class="delete-photo-btn" title="Delete Photo" onclick="deletePhoto(event, '${photo.id}')"><i class="fa-solid fa-trash"></i></button>` : ''}
            </div>
            <div class="photo-card-body">
                <p class="photo-caption">${photo.caption}</p>
                <div class="photo-card-footer">
                    <div class="photo-stats">
                        <span class="stat-item ${photo.liked ? 'liked' : ''}" onclick="toggleLike(event, '${photo.id}')">
                            <i class="${photo.liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                            <span>${photo.likes}</span>
                        </span>
                        <span class="stat-item" onclick="openLightbox('${photo.id}')">
                            <i class="fa-regular fa-comment"></i>
                            <span>${photo.comments.length}</span>
                        </span>
                    </div>
                    <span class="subtext" style="font-size: 0.75rem;">${photo.timestamp}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Filter pills event listeners
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeFilter = pill.getAttribute('data-filter');
            renderGallery();
        };
    });

    const searchInput = document.getElementById('gallerySearchInput');
    searchInput.oninput = (e) => {
        state.searchQuery = e.target.value;
        renderGallery();
    };
}

function toggleLike(e, photoId) {
    if (e) e.stopPropagation();
    const photo = state.photos.find(p => p.id === photoId);
    if (!photo) return;

    if (photo.liked) {
        photo.likes--;
        photo.liked = false;
    } else {
        photo.likes++;
        photo.liked = true;
        playSound('pop');
    }

    state.saveState();
    renderGallery();
    updateStatsCounter();

    if (state.selectedLightboxPhoto && state.selectedLightboxPhoto.id === photoId) {
        updateLightboxUI();
    }
}

function deletePhoto(e, photoId) {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this photo from your vault?")) {
        state.photos = state.photos.filter(p => p.id !== photoId);
        state.saveState();
        renderGallery();
        updateStatsCounter();
        showToast("Photo removed from gallery", "fa-solid fa-trash");
    }
}

function openLightbox(photoId) {
    const photo = state.photos.find(p => p.id === photoId);
    if (!photo) return;
    state.selectedLightboxPhoto = photo;

    document.getElementById('lightboxImg').src = photo.url;
    document.getElementById('lightboxCaption').textContent = photo.caption;
    document.getElementById('lightboxCategory').textContent = photo.category;
    document.getElementById('lightboxTime').textContent = photo.timestamp;
    document.getElementById('lightboxAuthor').textContent = state.profile.name;

    updateLightboxUI();
    openModal('lightboxModal');
}

function updateLightboxUI() {
    const photo = state.selectedLightboxPhoto;
    if (!photo) return;

    const likeBtn = document.getElementById('lightboxLikeBtn');
    const likeCount = document.getElementById('lightboxLikeCount');
    const commentCount = document.getElementById('lightboxCommentCount');
    const commentsList = document.getElementById('lightboxComments');

    likeCount.textContent = photo.likes;
    commentCount.textContent = photo.comments.length;

    if (photo.liked) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').className = 'fa-solid fa-heart';
    } else {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').className = 'fa-regular fa-heart';
    }

    likeBtn.onclick = () => toggleLike(null, photo.id);

    commentsList.innerHTML = '';
    photo.comments.forEach(c => {
        const item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML = `<span class="comment-author">${c.author}:</span><span>${c.text}</span>`;
        commentsList.appendChild(item);
    });

    document.getElementById('lightboxChatTrigger').onclick = () => {
        closeModal('lightboxModal');
        document.getElementById('navChat').click();
        const msgInput = document.getElementById('messageInput');
        msgInput.value = `Hi Elena! I love this photo: "${photo.caption.substring(0, 35)}..."`;
        msgInput.focus();
    };
}

// Lightbox Comment Submission
document.getElementById('commentForm').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text || !state.selectedLightboxPhoto) return;

    const authorName = state.currentMode === 'client' ? "You (Client)" : state.profile.name;
    state.selectedLightboxPhoto.comments.push({ author: authorName, text: text });
    state.saveState();
    input.value = '';
    updateLightboxUI();
    renderGallery();
    showToast("Comment posted!");
};

/* ================= 5. PHOTO UPLOADER (HOST MODE) ================= */
function initUploadSystem() {
    const dropZone = document.getElementById('dragDropZone');
    const fileInput = document.getElementById('photoFileInput');
    const previewContainer = document.getElementById('uploadPreviewContainer');
    const previewImg = document.getElementById('uploadPreviewImg');
    const removePreviewBtn = document.getElementById('removePreviewBtn');

    dropZone.onclick = (e) => {
        if (e.target !== removePreviewBtn && !removePreviewBtn.contains(e.target)) {
            fileInput.click();
        }
    };

    fileInput.onchange = () => {
        if (fileInput.files && fileInput.files[0]) {
            handleSelectedFile(fileInput.files[0]);
        }
    };

    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-light)';
    };

    dropZone.ondragleave = () => {
        dropZone.style.borderColor = 'var(--border-glass)';
    };

    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-glass)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleSelectedFile(e.dataTransfer.files[0]);
        }
    };

    function handleSelectedFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.stagedUploadFile = e.target.result;
            previewImg.src = e.target.result;
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    removePreviewBtn.onclick = (e) => {
        e.stopPropagation();
        state.stagedUploadFile = null;
        fileInput.value = '';
        previewContainer.classList.add('hidden');
    };

    document.getElementById('uploadPhotoForm').onsubmit = (e) => {
        e.preventDefault();
        const caption = document.getElementById('photoCaption').value.trim();
        const category = document.getElementById('photoCategory').value;
        const privacy = document.getElementById('photoPrivacy').value;

        if (!state.stagedUploadFile) {
            showToast("Please select a photo file to upload", "fa-solid fa-triangle-exclamation");
            return;
        }

        const newPhoto = {
            id: "p_" + Date.now(),
            url: state.stagedUploadFile,
            caption: caption,
            category: category,
            access: privacy,
            likes: 0,
            liked: false,
            comments: [],
            timestamp: "Just now"
        };

        state.photos.unshift(newPhoto);
        state.saveState();

        // Reset form
        state.stagedUploadFile = null;
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        document.getElementById('photoCaption').value = '';

        closeModal('uploadModal');
        renderGallery();
        updateStatsCounter();
        showToast("Photo uploaded successfully to your vault!", "fa-solid fa-cloud-arrow-up");
    };
}

/* ================= 6. REAL-TIME INTERACTIVE CHAT ================= */
function renderChatSystem() {
    renderConversationsList();
    renderActiveMessagesFeed();
}

function renderConversationsList() {
    const list = document.getElementById('conversationsList');
    list.innerHTML = '';

    state.conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = `conversation-item ${conv.id === state.activeChatId ? 'active' : ''}`;
        const lastMsg = conv.messages[conv.messages.length - 1];

        item.innerHTML = `
            <div class="avatar-sm-wrap">
                <img src="${conv.avatar}" alt="${conv.name}">
                <span class="status-dot ${conv.status.includes('Online') ? 'online' : 'offline'}"></span>
            </div>
            <div class="conv-info">
                <div class="conv-title-row">
                    <span class="conv-name">${conv.name}</span>
                    <span class="conv-time">${lastMsg ? lastMsg.time : ''}</span>
                </div>
                <p class="conv-preview">${lastMsg ? (lastMsg.sender === 'host' ? 'Host: ' : '') + lastMsg.text : 'No messages yet'}</p>
            </div>
        `;

        item.onclick = () => {
            state.activeChatId = conv.id;
            renderChatSystem();
        };

        list.appendChild(item);
    });
}

function renderActiveMessagesFeed() {
    const activeConv = state.conversations.find(c => c.id === state.activeChatId) || state.conversations[0];
    if (!activeConv) return;

    // Header info
    document.getElementById('chatHeaderName').textContent = activeConv.name;
    document.getElementById('chatHeaderAvatar').src = activeConv.avatar;
    document.getElementById('chatHeaderStatus').textContent = activeConv.status;

    const feed = document.getElementById('messagesFeed');
    feed.innerHTML = '';

    activeConv.messages.forEach(msg => {
        const row = document.createElement('div');
        // If in Client mode, sender === 'client' is 'sent', 'host' is 'received'
        // If in Host mode, sender === 'host' is 'sent', 'client' is 'received'
        const isSentByMe = (state.currentMode === 'client' && msg.sender === 'client') ||
                           (state.currentMode === 'host' && msg.sender === 'host');

        row.className = `message-bubble-row ${isSentByMe ? 'sent' : 'received'}`;
        row.innerHTML = `
            <div class="message-bubble">
                ${msg.img ? `<img src="${msg.img}" class="message-img" alt="Attachment">` : ''}
                ${msg.text}
            </div>
            <span class="message-time">${msg.time}</span>
        `;
        feed.appendChild(row);
    });

    feed.scrollTop = feed.scrollHeight;
}

// Chat Send Form
document.getElementById('chatForm').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;

    const activeConv = state.conversations.find(c => c.id === state.activeChatId);
    if (!activeConv) return;

    const senderRole = state.currentMode === 'client' ? 'client' : 'host';
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
        sender: senderRole,
        text: text,
        time: timeNow
    };

    activeConv.messages.push(newMsg);
    state.saveState();
    input.value = '';

    playSound('sent');
    renderChatSystem();

    // Simulated Bot Response when Client chats with Host
    if (state.currentMode === 'client' && activeConv.id === 'conv_elena') {
        triggerSimulatedHostReply(activeConv, text);
    }
};

function triggerSimulatedHostReply(conv, userText) {
    const typingIndicator = document.getElementById('typingIndicator');
    document.getElementById('typingUserText').textContent = `${state.profile.name} is typing...`;
    
    setTimeout(() => {
        typingIndicator.classList.remove('hidden');
    }, 600);

    setTimeout(() => {
        typingIndicator.classList.add('hidden');

        // Dynamic responses based on client input
        let replyText = "That sounds wonderful! I'd love to chat more about it.";
        const lower = userText.toLowerCase();

        if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
            replyText = `Hello! Thanks for reaching out. How is your day going?`;
        } else if (lower.includes('date') || lower.includes('meet') || lower.includes('coffee') || lower.includes('dinner')) {
            replyText = `I'd love to meet up! Have you checked my 'Book a Date' tab to propose a time and spot?`;
        } else if (lower.includes('photo') || lower.includes('picture') || lower.includes('gorgeous') || lower.includes('beautiful')) {
            replyText = `Thank you so much for the compliment! I love taking photos when I travel and visit nice spots.`;
        } else if (lower.includes('where') || lower.includes('location') || lower.includes('city')) {
            replyText = `I am currently based in ${state.profile.location}! What city are you in?`;
        }

        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        conv.messages.push({
            sender: 'host',
            text: replyText,
            time: timeNow
        });

        state.saveState();
        playSound('received');
        renderChatSystem();
    }, 2200);
}

/* ================= 7. DATE BOOKING & MEETUPS ================= */
function renderMeetups() {
    const list = document.getElementById('meetupsCardsList');
    list.innerHTML = '';

    if (state.meetups.length === 0) {
        list.innerHTML = `<p class="subtext" style="padding: 1.5rem; text-align: center;">No meetup requests scheduled yet.</p>`;
        return;
    }

    state.meetups.forEach(m => {
        const card = document.createElement('div');
        card.className = 'meetup-card';
        card.innerHTML = `
            <div class="meetup-card-header">
                <div>
                    <h4 class="meetup-concept-title">${m.concept}</h4>
                    <span class="subtext">Client: <strong>${m.clientName}</strong></span>
                </div>
                <span class="status-badge ${m.status}">${m.status}</span>
            </div>
            <div class="meetup-details-list">
                <div><i class="fa-solid fa-calendar-day"></i> <span>Date: <strong>${m.date}</strong> at <strong>${m.time}</strong></span></div>
                <div><i class="fa-solid fa-location-dot"></i> <span>Venue: <strong>${m.location}</strong></span></div>
                <div><i class="fa-solid fa-quote-left"></i> <span>"${m.note}"</span></div>
            </div>
            ${state.currentMode === 'host' && m.status === 'pending' ? `
                <div class="meetup-card-actions">
                    <button class="btn btn-sm btn-outline" onclick="updateMeetupStatus('${m.id}', 'declined')"><i class="fa-solid fa-xmark"></i> Decline</button>
                    <button class="btn btn-sm btn-primary" onclick="updateMeetupStatus('${m.id}', 'confirmed')"><i class="fa-solid fa-check"></i> Accept Date</button>
                </div>
            ` : ''}
        `;
        list.appendChild(card);
    });

    // Date concept auto-fill listeners
    document.querySelectorAll('.idea-card').forEach(card => {
        card.onclick = () => {
            const concept = card.getAttribute('data-concept');
            document.getElementById('meetupConcept').value = concept;
            openModal('meetupModal');
        };
    });
}

function updateMeetupStatus(meetupId, newStatus) {
    const m = state.meetups.find(item => item.id === meetupId);
    if (!m) return;
    m.status = newStatus;
    state.saveState();
    renderMeetups();
    playSound('pop');
    showToast(`Date request ${newStatus}!`, newStatus === 'confirmed' ? 'fa-solid fa-calendar-check' : 'fa-solid fa-info-circle');
}

function initDateScheduler() {
    document.getElementById('createNewMeetupBtn').onclick = () => {
        openModal('meetupModal');
    };

    document.getElementById('meetupForm').onsubmit = (e) => {
        e.preventDefault();
        const concept = document.getElementById('meetupConcept').value;
        const date = document.getElementById('meetupDate').value;
        const time = document.getElementById('meetupTime').value;
        const location = document.getElementById('meetupLocation').value.trim();
        const note = document.getElementById('meetupNote').value.trim();

        const clientName = state.currentMode === 'client' ? "You (Client)" : "Marcus Sterling";

        const newMeetup = {
            id: "m_" + Date.now(),
            clientName: clientName,
            concept: concept,
            date: date,
            time: time,
            location: location,
            note: note,
            status: 'pending'
        };

        state.meetups.unshift(newMeetup);
        state.saveState();

        closeModal('meetupModal');
        renderMeetups();
        showToast("Date request submitted to host!", "fa-solid fa-wine-glass");
    };
}

/* ================= 8. PROFILE & BIO EDITOR ================= */
function initProfileEditor() {
    const form = document.getElementById('profileForm');

    // Populate inputs from state
    document.getElementById('inputHostName').value = state.profile.name;
    document.getElementById('inputHostLocation').value = state.profile.location;
    document.getElementById('inputHostTagline').value = state.profile.tagline;
    document.getElementById('inputHostBio').value = state.profile.bio;
    document.getElementById('inputHostInterests').value = state.profile.interests;
    document.getElementById('inputHostRules').value = state.profile.rules;

    form.onsubmit = (e) => {
        e.preventDefault();
        state.profile.name = document.getElementById('inputHostName').value.trim();
        state.profile.location = document.getElementById('inputHostLocation').value.trim();
        state.profile.tagline = document.getElementById('inputHostTagline').value.trim();
        state.profile.bio = document.getElementById('inputHostBio').value.trim();
        state.profile.interests = document.getElementById('inputHostInterests').value.trim();
        state.profile.rules = document.getElementById('inputHostRules').value.trim();

        state.saveState();
        initProfileUI();
        showToast("Profile settings saved successfully!", "fa-solid fa-floppy-disk");
    };
}

/* ================= MODAL HELPERS ================= */
function initModalListeners() {
    // Close modal triggers
    document.getElementById('closeUploadModal').onclick = () => closeModal('uploadModal');
    document.getElementById('cancelUploadBtn').onclick = () => closeModal('uploadModal');

    document.getElementById('closeLightboxBtn').onclick = () => closeModal('lightboxModal');

    document.getElementById('closeMeetupModal').onclick = () => closeModal('meetupModal');
    document.getElementById('cancelMeetupBtn').onclick = () => closeModal('meetupModal');

    // Overlay click outside to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        };
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}
