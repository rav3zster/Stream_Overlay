/**
 * ==========================================================================
 * STREAM OVERLAY STUDIO - CONTROLLER LOGIC
 * ==========================================================================
 */

// Application state
let state = {
  activeTheme: 'cyber-synth',
  activeScene: 'starting-soon',
  streamerName: 'Rave_VT',
  streamTitle: 'Relaxing Indie Game Night!',
  activeGame: 'Hollow Knight',
  countdownMinutes: 10,
  subGoalText: '84/100',
  donationGoalText: '$145 / $500',
  twitchTag: '/rave_vtuber',
  twitterTag: '@RaveVT',
  youtubeTag: 'RaveVT',
  tickerText: '✨ Welcome to the stream! Keep the chat positive and respect moderators. ✨ Type !rules or !discord in chat to join the community server! ✨ Subscribing unlocks exclusive sub emotes and badges! ✨ Current Schedule: Mon/Wed/Fri at 8:00 PM EST.'
};

// Alert history trackers
const alertsHistory = {
  follower: ['Yukari_Chan', 'VibeSeeker', 'NekoGamer', 'Kuro_Neko', 'ShadowLover'],
  subscriber: ['GamerDave', 'TifaLockhart', 'ChronoTrigger', 'ZenMaster', 'LofiGirl'],
  donation: ['Aria $20.00', 'Tatsuya $5.00', 'Miko $50.00', 'Sora $10.00', 'Ren $100.00'],
  raid: ['SoraStream (23 viewers)', 'MugiCozy (45 viewers)', 'V-Wave (82 viewers)', 'RetroAlex (14 viewers)']
};

// UI Elements caching
const elements = {
  app: document.getElementById('app'),
  overlayCanvas: document.getElementById('overlay-canvas'),
  nebulaCanvas: document.getElementById('nebula-canvas'),
  
  // Inputs
  inputStreamerName: document.getElementById('input-streamer-name'),
  inputStreamTitle: document.getElementById('input-stream-title'),
  inputGameName: document.getElementById('input-game-name'),
  inputStartingTime: document.getElementById('input-starting-time'),
  inputSubGoal: document.getElementById('input-sub-goal'),
  inputDonationGoal: document.getElementById('input-donation-goal'),
  inputTwitchTag: document.getElementById('input-twitch-tag'),
  inputTwitterTag: document.getElementById('input-twitter-tag'),
  inputYoutubeTag: document.getElementById('input-youtube-tag'),
  inputTickerText: document.getElementById('input-ticker-text'),
  
  // Controls
  themeCards: document.querySelectorAll('.theme-card'),
  sceneButtons: document.querySelectorAll('.scene-btn'),
  btnToggleView: document.getElementById('btn-toggle-view'),
  btnCopyObs: document.getElementById('btn-copy-obs'),
  btnExitObs: document.getElementById('btn-exit-obs'),
  
  // Simulated elements in overlay preview
  clockDisplay: document.getElementById('timer-clock'),
  startingTitlePlaceholder: document.getElementById('overlay-starting-title'),
  gameTitlePlaceholder: document.getElementById('overlay-game-title'),
  chatTitlePlaceholder: document.getElementById('overlay-chat-title'),
  chatSubtitlePlaceholder: document.getElementById('overlay-chat-subtitle'),
  subGoalTextPlaceholder: document.getElementById('overlay-sub-goal-text'),
  subGoalFillBar: document.getElementById('overlay-sub-goal-bar'),
  donationGoalTextPlaceholder: document.getElementById('overlay-donation-goal-text'),
  donationGoalFillBar: document.getElementById('overlay-donation-goal-bar'),
  miniGoalText: document.getElementById('overlay-mini-goal-text'),
  miniGoalFillBar: document.getElementById('overlay-mini-goal-fill'),
  tickerTextPlaceholder: document.getElementById('overlay-ticker-text'),
  
  // Placeholders that appear in multiple spots
  streamerNamePlaceholders: document.querySelectorAll('.streamer-name-placeholder'),
  gameNamePlaceholders: document.querySelectorAll('.game-name-placeholder'),
  socialTwitch: document.getElementById('social-twitch'),
  socialTwitter: document.getElementById('social-twitter'),
  socialYoutube: document.getElementById('social-youtube'),

  // Alerts elements
  alertOverlay: document.getElementById('alert-overlay'),
  alertTitleHeader: document.getElementById('alert-title-header'),
  alertUsernameDisplay: document.getElementById('alert-username-display'),
  alertUserMessage: document.getElementById('alert-user-message'),
  alertIcon: document.getElementById('alert-icon'),

  // Chat Feeds
  brbChatFeed: document.getElementById('brb-chat-feed'),
  chattingChatFeed: document.getElementById('chatting-chat-feed'),
  mainChatFeed: document.getElementById('main-chat-feed'),
  
  // Simulator console
  simChatHistory: document.getElementById('sim-chat-history'),
  inputChatUsername: document.getElementById('input-chat-username'),
  inputChatMessage: document.getElementById('input-chat-message'),
  btnSendSimChat: document.getElementById('btn-send-sim-chat')
};

// Countdown timer reference
let timerInterval = null;
let timerSecondsRemaining = 600; // 10 minutes default

// Chat Pools for auto drip generator
const chatUsernames = [
  'VibeSeeker', 'GamerLily', 'KotoSynth', 'NightDrifter', 'CherryPix',
  'CodePanda', 'LofiRider', 'PixelMage', 'TaroChute', 'AikoLuna',
  'ZenithX', 'NeonShadow', 'GlitchCat', 'CyberMoose', 'PastelBunny'
];

const chatMessages = [
  'POGGERS! This stream overlay looks clean!',
  'Love the color scheme so much! 💜',
  'Hype train is starting soon, get ready!',
  'What keyboard are you using? Sounds nice.',
  'Can we do !discord in chat? I want to join!',
  'Retro games are the absolute best, Hollow Knight is top tier.',
  'Let\'s goooo! 🔥🔥🔥',
  'That background animation is mesmerizing.',
  'Cute avatar model! Is it custom made?',
  'Drink water streamer! Hydrate! 🥤',
  'Just lurking while studying, music is super cozy.',
  'Did you beat the colosseum yet?',
  'Amazing frame rates today, streaming settings are perfect.',
  'Subbed! Thanks for the awesome content!',
  'Wait, did I miss the start? Oh starting soon, perfect.'
];

// Audio Context retro chime generator (Web Audio API synth)
function playSynthesizedChime(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'follower') {
      // Gentle retro cute slide chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } 
    else if (type === 'subscriber') {
      // Ascending retro arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.1, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } 
    else if (type === 'donation') {
      // Cash register double beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.start(now);
      osc1.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + 0.22);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } 
    else if (type === 'raid') {
      // Epic dual sawtooth trumpet sound
      [0, 6].forEach(detune => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.detune.setValueAtTime(detune, now);
        
        osc.frequency.setValueAtTime(392.00, now); // G4
        osc.frequency.linearRampToValueAtTime(587.33, now + 0.15); // D5
        osc.frequency.linearRampToValueAtTime(783.99, now + 0.3); // G5
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      });
    }
  } catch (error) {
    console.warn('Audio Context block: Chime sound omitted until user interaction.', error);
  }
}

/**
 * ==========================================================================
 * BACKDROP PARTICLE LOOP CANVAS ENGINE
 * ==========================================================================
 */
const particles = [];
let animationFrameId = null;

function initCanvas() {
  const canvas = elements.nebulaCanvas;
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Generate initial particles
  particles.length = 0;
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4 - 0.2, // Drifts upwards slightly
      alpha: Math.random() * 0.5 + 0.2,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.02
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw based on the active theme
    const theme = state.activeTheme;
    
    particles.forEach(p => {
      // Update coordinates
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.spin;
      
      // Wrap around bounds
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = canvas.height;

      ctx.save();
      
      if (theme === 'cyber-synth') {
        // Neon glitchy dots and light trail squares
        ctx.fillStyle = p.size > 2.5 ? '#ff007f' : '#00f5ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size * 1.5, p.size * 1.5);
      } 
      else if (theme === 'cosmic-nebula') {
        // Floating circular stars that glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, 'rgba(255, 255, 255, ' + p.alpha + ')');
        grad.addColorStop(0.3, 'rgba(168, 85, 247, ' + (p.alpha * 0.6) + ')');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (theme === 'dreamy-lavender') {
        // Sakura petal fall (pink soft leaves rotating)
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = 'rgba(251, 207, 232, 0.75)'; // Soft pink
        ctx.beginPath();
        // Custom petal path
        ctx.ellipse(0, 0, p.size * 2, p.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (theme === 'arcane-sigil') {
        // Firefly golden embers rising vertically
        p.speedY = -Math.abs(p.speedY) - 0.2; // Force going up
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (theme === 'obsidian-mint') {
        // Floating green vertical tech dashes
        p.speedX = 0; // Pure vertical drift
        p.speedY = -0.4;
        ctx.strokeStyle = 'rgba(0, 255, 136, ' + (p.alpha * 0.7) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + p.size * 3);
        ctx.stroke();
      }
      
      ctx.restore();
    });
    
    animationFrameId = requestAnimationFrame(animate);
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  animate();
}

/**
 * ==========================================================================
 * STATE WRITING & SYNCHRONIZATION (LOCALSTORAGE SYNC)
 * ==========================================================================
 */

// Save state to localStorage to broadcast to OBS browser source tabs
function saveState() {
  localStorage.setItem('vibe_overlay_state', JSON.stringify(state));
  updateUI();
}

// Load state from localStorage
function loadState() {
  const data = localStorage.getItem('vibe_overlay_state');
  if (data) {
    try {
      state = JSON.parse(data);
      syncDashboardControls();
      updateUI();
    } catch (e) {
      console.error('Error parsing localStorage state:', e);
    }
  } else {
    // If empty, save default state to start
    saveState();
  }
}

// Synchronize control panel input values with active state
function syncDashboardControls() {
  if (elements.inputStreamerName) elements.inputStreamerName.value = state.streamerName;
  if (elements.inputStreamTitle) elements.inputStreamTitle.value = state.streamTitle;
  if (elements.inputGameName) elements.inputGameName.value = state.activeGame;
  if (elements.inputStartingTime) elements.inputStartingTime.value = state.countdownMinutes;
  
  // Goals
  if (elements.inputSubGoal) elements.inputSubGoal.value = state.subGoalText;
  if (elements.inputDonationGoal) elements.inputDonationGoal.value = state.donationGoalText;
  
  // Socials
  if (elements.inputTwitchTag) elements.inputTwitchTag.value = state.twitchTag;
  if (elements.inputTwitterTag) elements.inputTwitterTag.value = state.twitterTag;
  if (elements.inputYoutubeTag) elements.inputYoutubeTag.value = state.youtubeTag;
  if (elements.inputTickerText) elements.inputTickerText.value = state.tickerText;

  // Active theme list selector
  elements.themeCards.forEach(card => {
    if (card.dataset.theme === state.activeTheme) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // Active scene buttons
  elements.sceneButtons.forEach(btn => {
    if (btn.dataset.scene === state.activeScene) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Update the DOM preview based on current state variables
function updateUI() {
  // Update canvas theme class list
  elements.overlayCanvas.className = '';
  elements.overlayCanvas.classList.add('theme-' + state.activeTheme, 'scene-' + state.activeScene);

  // Update dynamic content elements
  elements.startingTitlePlaceholder.textContent = state.streamTitle.toUpperCase();
  elements.gameTitlePlaceholder.textContent = state.activeGame;
  elements.chatTitlePlaceholder.textContent = state.streamTitle;
  elements.tickerTextPlaceholder.textContent = state.tickerText;

  // Streamer Name placeholders
  elements.streamerNamePlaceholders.forEach(el => {
    el.textContent = state.streamerName;
  });

  // Game Name placeholders
  elements.gameNamePlaceholders.forEach(el => {
    el.textContent = state.activeGame;
  });

  // Goal Meters parsing and progress filling
  updateGoalBar(state.subGoalText, elements.subGoalTextPlaceholder, elements.subGoalFillBar, elements.miniGoalText, elements.miniGoalFillBar);
  updateGoalBar(state.donationGoalText, elements.donationGoalTextPlaceholder, elements.donationGoalFillBar, null, null);

  // Social tags
  if (elements.socialTwitch) elements.socialTwitch.innerHTML = `<i class="fa-brands fa-twitch"></i> ${state.twitchTag}`;
  if (elements.socialTwitter) elements.socialTwitter.innerHTML = `<i class="fa-brands fa-x-twitter"></i> ${state.twitterTag}`;
  if (elements.socialYoutube) elements.socialYoutube.innerHTML = `<i class="fa-brands fa-youtube"></i> ${state.youtubeTag}`;

  // Reset Countdown seconds if changing starting time input
  const currentTotalSeconds = state.countdownMinutes * 60;
  // If timer is not running or minutes input changes, reset seconds remaining
  if (!timerInterval) {
    timerSecondsRemaining = currentTotalSeconds;
    formatTimerClock();
  }

  // Switch overlay active scene visibility
  const scenes = elements.overlayCanvas.querySelectorAll('.overlay-scene');
  scenes.forEach(scene => {
    if (scene.id === 'scene-' + state.activeScene) {
      scene.classList.add('active');
    } else {
      scene.classList.remove('active');
    }
  });
}

// Helper: Parse goal fraction string (e.g. "84/100" or "$145 / $500") and fill matching bar percentage
function updateGoalBar(goalStr, textEl, barEl, miniTextEl, miniBarEl) {
  if (textEl) textEl.textContent = goalStr;
  if (miniTextEl) miniTextEl.textContent = goalStr;
  
  // Clean characters out to resolve percentage logic
  const numbers = goalStr.replace(/[^0-9/]/g, '').split('/');
  if (numbers.length === 2) {
    const current = parseFloat(numbers[0]);
    const target = parseFloat(numbers[1]);
    if (!isNaN(current) && !isNaN(target) && target > 0) {
      const percentage = Math.min((current / target) * 100, 100);
      if (barEl) barEl.style.width = percentage + '%';
      if (miniBarEl) miniBarEl.style.width = percentage + '%';
      return;
    }
  }
  // Default fallback if parsing fails
  if (barEl) barEl.style.width = '50%';
  if (miniBarEl) miniBarEl.style.width = '50%';
}

/**
 * ==========================================================================
 * COUNTDOWN TIMER LOGIC
 * ==========================================================================
 */
function startCountdownTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (timerSecondsRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      elements.clockDisplay.textContent = "00:00";
      // Auto trigger transition to Just Chatting when timer finishes
      state.activeScene = 'chat-session';
      saveState();
      return;
    }
    
    timerSecondsRemaining--;
    formatTimerClock();
  }, 1000);
}

function formatTimerClock() {
  const mins = Math.floor(timerSecondsRemaining / 60);
  const secs = timerSecondsRemaining % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  if (elements.clockDisplay) {
    elements.clockDisplay.textContent = formatted;
  }
}

/**
 * ==========================================================================
 * CHAT INJECTOR & SIMULATOR LOGIC
 * ==========================================================================
 */
function appendSimulatedChatMessage(username, message, badge = '') {
  // Check active scroll view feeds inside the overlay
  const chatContainers = [elements.brbChatFeed, elements.chattingChatFeed, elements.mainChatFeed];
  
  chatContainers.forEach(container => {
    if (!container) return;
    
    const msgElement = document.createElement('div');
    msgElement.className = 'chat-msg';
    
    let badgeSpan = '';
    if (badge) {
      badgeSpan = `<span class="chat-badge">${badge}</span> `;
    }
    
    msgElement.innerHTML = `
      <span class="chat-msg-user">${badgeSpan}${username}</span>
      <span class="chat-msg-text">${message}</span>
    `;
    
    container.appendChild(msgElement);
    
    // Auto-scroll to bottom of container
    container.scrollTop = container.scrollHeight;
    
    // Keep max 20 messages to prevent document bloat
    if (container.children.length > 20) {
      container.removeChild(container.firstChild);
    }
  });

  // Also print to control simulator log on side
  const simHistory = elements.simChatHistory;
  if (simHistory) {
    const historyItem = document.createElement('div');
    historyItem.className = 'sim-user-msg';
    historyItem.innerHTML = `<span>${username}:</span> ${message}`;
    simHistory.appendChild(historyItem);
    simHistory.scrollTop = simHistory.scrollHeight;
    
    if (simHistory.children.length > 30) {
      simHistory.removeChild(simHistory.firstChild);
    }
  }
}

// Auto Drip Feed Generator: appends a random message every 4 to 8 seconds
function startChatDripFeed() {
  const triggerDrip = () => {
    // Only drip feed if pre-existing elements are active or visible
    const randomUser = chatUsernames[Math.floor(Math.random() * chatUsernames.length)];
    const randomMsg = chatMessages[Math.floor(Math.random() * chatMessages.length)];
    
    // Randomly assign subscriber badge to 30% of messages
    const badge = Math.random() < 0.3 ? 'Sub' : '';
    
    appendSimulatedChatMessage(randomUser, randomMsg, badge);
    
    // Schedule next message
    const delay = Math.random() * 4000 + 4000;
    setTimeout(triggerDrip, delay);
  };
  
  setTimeout(triggerDrip, 3000);
}

/**
 * ==========================================================================
 * ALERT EVENT MANAGER (POPUP WIDGET & CHIMES)
 * ==========================================================================
 */
let alertTimeout = null;

function triggerOverlayAlert(type, userText, descriptionText) {
  // Clear any existing alert timer
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    elements.alertOverlay.classList.remove('show');
  }

  // Set card contents
  let iconClass = 'fa-solid ';
  let title = '';
  
  switch(type) {
    case 'follower':
      iconClass += 'fa-heart';
      title = 'NEW FOLLOWER!';
      // Update top widget labels in game scene
      document.getElementById('ticker-new-follower').textContent = userText;
      break;
    case 'subscriber':
      iconClass += 'fa-star';
      title = 'NEW SUBSCRIBER!';
      document.getElementById('ticker-new-subscriber').textContent = userText;
      break;
    case 'donation':
      iconClass += 'fa-dollar-sign';
      title = 'NEW DONATION!';
      document.getElementById('ticker-new-donation').textContent = `${userText} ${descriptionText}`;
      break;
    case 'raid':
      iconClass += 'fa-people-group';
      title = 'LIVE STREAM RAID!';
      break;
  }

  elements.alertIcon.className = iconClass;
  elements.alertTitleHeader.textContent = title;
  elements.alertUsernameDisplay.textContent = userText;
  elements.alertUserMessage.textContent = descriptionText || "Welcome to the squad! 💜";

  // Play synthesized audio
  playSynthesizedChime(type);

  // Trigger floating sparkles particles around the card
  createAlertSparkles();

  // Slide down alert card
  elements.alertOverlay.classList.add('show');

  // Slide back up after 5 seconds
  alertTimeout = setTimeout(() => {
    elements.alertOverlay.classList.remove('show');
  }, 5000);

  // Add system logs to Simulator console
  const simHistory = elements.simChatHistory;
  if (simHistory) {
    const logItem = document.createElement('div');
    logItem.className = 'sim-sys-msg';
    logItem.textContent = `⚡ [ALERT] Simulated ${type} from ${userText}`;
    simHistory.appendChild(logItem);
    simHistory.scrollTop = simHistory.scrollHeight;
  }
}

// Generate animated floating stars in alert popup card background
function createAlertSparkles() {
  const container = elements.alertOverlay.querySelector('.alert-particles-container');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < 15; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-particle';
    
    // Random direction vectors
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 30;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    sparkle.style.setProperty('--tx', `${tx}px`);
    sparkle.style.setProperty('--ty', `${ty}px`);
    sparkle.style.left = '50%';
    sparkle.style.top = '50%';
    
    container.appendChild(sparkle);
  }
}

/**
 * ==========================================================================
 * BIND EVENTS & INITIALIZATION
 * ==========================================================================
 */
function bindDashboardControls() {
  // Theme Switching
  elements.themeCards.forEach(card => {
    card.addEventListener('click', () => {
      state.activeTheme = card.dataset.theme;
      saveState();
    });
  });

  // Scene Switching
  elements.sceneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeScene = btn.dataset.scene;
      saveState();
      
      // Auto trigger starting soon timer if scene changes to pre-stream
      if (state.activeScene === 'starting-soon') {
        startCountdownTimer();
      } else {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
    });
  });

  // Input bindings
  elements.inputStreamerName.addEventListener('input', (e) => {
    state.streamerName = e.target.value;
    saveState();
  });

  elements.inputStreamTitle.addEventListener('input', (e) => {
    state.streamTitle = e.target.value;
    saveState();
  });

  elements.inputGameName.addEventListener('input', (e) => {
    state.activeGame = e.target.value;
    saveState();
  });

  elements.inputStartingTime.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      state.countdownMinutes = val;
      timerSecondsRemaining = val * 60;
      formatTimerClock();
      saveState();
    }
  });

  elements.inputSubGoal.addEventListener('input', (e) => {
    state.subGoalText = e.target.value;
    saveState();
  });

  elements.inputDonationGoal.addEventListener('input', (e) => {
    state.donationGoalText = e.target.value;
    saveState();
  });

  // Social tags
  elements.inputTwitchTag.addEventListener('input', (e) => {
    state.twitchTag = e.target.value;
    saveState();
  });
  elements.inputTwitterTag.addEventListener('input', (e) => {
    state.twitterTag = e.target.value;
    saveState();
  });
  elements.inputYoutubeTag.addEventListener('input', (e) => {
    state.youtubeTag = e.target.value;
    saveState();
  });
  elements.inputTickerText.addEventListener('input', (e) => {
    state.tickerText = e.target.value;
    saveState();
  });

  // View Mode switches (Studio Dashboard vs Full screen OBS Mode)
  elements.btnToggleView.addEventListener('click', () => {
    elements.app.className = 'obs-mode';
    window.location.hash = 'overlay';
    // Re-trigger particle canvases dimensions
    initCanvas();
  });

  elements.btnExitObs.addEventListener('click', () => {
    elements.app.className = 'studio-mode';
    window.location.hash = '';
    initCanvas();
  });

  elements.btnCopyObs.addEventListener('click', () => {
    const obsUrl = `${window.location.origin}${window.location.pathname}#overlay`;
    navigator.clipboard.writeText(obsUrl).then(() => {
      const originalText = elements.btnCopyObs.innerHTML;
      elements.btnCopyObs.innerHTML = `<i class="fa-solid fa-check"></i> URL Copied!`;
      setTimeout(() => {
        elements.btnCopyObs.innerHTML = originalText;
      }, 2000);
    }).catch(err => {
      alert(`OBS Overlay URL: ${obsUrl}`);
    });
  });

  // Simulator Section: Alert buttons trigger
  document.querySelectorAll('.sim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const alertType = btn.dataset.alert;
      const historyPool = alertsHistory[alertType];
      const randomUser = historyPool[Math.floor(Math.random() * historyPool.length)];
      
      let extra = '';
      if (alertType === 'donation') {
        extra = '"Huge support! Have an awesome stream!"';
      } else if (alertType === 'subscriber') {
        extra = '"Tier 1 Sub - 3 Months streak!"';
      } else if (alertType === 'raid') {
        extra = 'Raid in progress!';
      }
      
      // Send Alert state to broadcast via localStorage if in sync mode
      triggerOverlayAlert(alertType, randomUser, extra);
      localStorage.setItem('vibe_overlay_broadcast_alert', JSON.stringify({
        type: alertType,
        user: randomUser,
        message: extra,
        timestamp: Date.now()
      }));
    });
  });

  // Simulator Section: Chat sender
  elements.btnSendSimChat.addEventListener('click', () => {
    const user = elements.inputChatUsername.value.trim() || 'Viewer';
    const message = elements.inputChatMessage.value.trim();
    if (message) {
      appendSimulatedChatMessage(user, message);
      elements.inputChatMessage.value = '';
    }
  });

  elements.inputChatMessage.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      elements.btnSendSimChat.click();
    }
  });

  // Quick chats shortcut button keys
  document.querySelectorAll('.quick-chat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const user = elements.inputChatUsername.value.trim() || 'Viewer';
      const msg = btn.dataset.msg;
      appendSimulatedChatMessage(user, msg);
    });
  });
}

// Setup Multi-tab synchronization listening hooks
function setupTabSynchronization() {
  window.addEventListener('storage', (e) => {
    if (e.key === 'vibe_overlay_state') {
      loadState();
    }
    else if (e.key === 'vibe_overlay_broadcast_alert') {
      // Trigger synced alerts from dashboard control panel tab
      try {
        const alertData = JSON.parse(e.newValue);
        if (alertData && Date.now() - alertData.timestamp < 1000) {
          triggerOverlayAlert(alertData.type, alertData.user, alertData.message);
        }
      } catch (err) {
        console.error('Error parsing broadcast alert data:', err);
      }
    }
  });
}

// On initialization check URL hash variables to open straight to OBS mode
function checkUrlParameters() {
  if (window.location.hash === '#overlay' || window.location.search.includes('mode=overlay')) {
    elements.app.className = 'obs-mode';
  } else {
    elements.app.className = 'studio-mode';
  }
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  // Load state and layout variables
  loadState();
  checkUrlParameters();
  bindDashboardControls();
  setupTabSynchronization();
  initCanvas();
  
  // Start automated chats & countdown timer
  startChatDripFeed();
  if (state.activeScene === 'starting-soon') {
    startCountdownTimer();
  }
});
