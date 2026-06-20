/* ===== 音乐面板组件 - 导航栏内嵌版（支持 pjax） ===== */
(function() {
  /* 持久化的音频和状态（跨 pjax 页面切换不丢失） */
  var audio = new Audio();
  var playlist = [];
  var currentIndex = 0;
  var isPlaying = false;
  var panel = null;
  var panelListEl = null;
  var loaded = false;

  function init() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    /* 防止重复添加（pjax 可能多次触发） */
    if (nav.querySelector('.nav-right-controls')) return;

    /* --- 导航栏右侧控制区 --- */
    var navControls = document.createElement('div');
    navControls.className = 'nav-right-controls';
    navControls.innerHTML =
      '<button class="nav-btn nav-btn-music" title="播放/暂停"><i class="fas fa-' + (isPlaying ? 'pause' : 'play') + '"></i></button>' +
      '<button class="nav-btn nav-btn-next" title="下一首"><i class="fas fa-step-forward"></i></button>' +
      '<button class="nav-btn nav-btn-list" title="播放列表"><i class="fas fa-list"></i></button>';
    nav.appendChild(navControls);

    var playBtn = navControls.querySelector('.nav-btn-music');
    var nextBtn = navControls.querySelector('.nav-btn-next');
    var listBtn = navControls.querySelector('.nav-btn-list');

    /* --- 首次初始化：创建面板 --- */
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'music-panel';
      panel.innerHTML =
        '<div class="music-panel-header">' +
          '<span class="music-panel-title">播放列表</span>' +
          '<span class="music-panel-close">&times;</span>' +
        '</div>' +
        '<div class="music-panel-now">' +
          '<img class="music-panel-cover" src="" alt="">' +
          '<div class="music-panel-info">' +
            '<div class="music-panel-name">未播放</div>' +
            '<div class="music-panel-artist">-</div>' +
          '</div>' +
        '</div>' +
        '<div class="music-panel-controls">' +
          '<button class="music-btn-prev"><i class="fas fa-step-backward"></i></button>' +
          '<button class="music-btn-play"><i class="fas fa-play"></i></button>' +
          '<button class="music-btn-next"><i class="fas fa-step-forward"></i></button>' +
        '</div>' +
        '<div class="music-panel-progress">' +
          '<div class="music-progress-bar"><div class="music-progress-fill"></div></div>' +
          '<div class="music-panel-time"><span class="music-time-current">0:00</span><span class="music-time-total">0:00</span></div>' +
        '</div>' +
        '<div class="music-panel-list"></div>';
      document.body.appendChild(panel);
      panelListEl = panel.querySelector('.music-panel-list');

      /* 面板内部控制 */
      panel.querySelector('.music-btn-play').addEventListener('click', function() {
        togglePlay();
      });
      panel.querySelector('.music-btn-prev').addEventListener('click', function() {
        playSong((currentIndex - 1 + playlist.length) % playlist.length);
      });
      panel.querySelector('.music-btn-next').addEventListener('click', function() {
        playSong((currentIndex + 1) % playlist.length);
      });
      panel.querySelector('.music-panel-close').addEventListener('click', function() {
        panel.classList.remove('open');
      });
      panel.querySelector('.music-progress-bar').addEventListener('click', function(e) {
        var rect = this.getBoundingClientRect();
        var pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
      });

      /* 音频事件 */
      audio.addEventListener('ended', function() {
        playSong((currentIndex + 1) % playlist.length);
      });
      audio.addEventListener('timeupdate', function() {
        if (!panel) return;
        var pct = (audio.currentTime / audio.duration) * 100 || 0;
        panel.querySelector('.music-progress-fill').style.width = pct + '%';
        panel.querySelector('.music-time-current').textContent = formatTime(audio.currentTime);
        panel.querySelector('.music-time-total').textContent = formatTime(audio.duration);
      });
    }

    /* --- 加载播放列表（只加载一次） --- */
    if (!loaded) {
      loaded = true;
      fetch('/music/playlist.json').then(function(r) { return r.json(); }).then(function(list) {
        playlist = list;
        list.forEach(function(song, i) {
          var item = document.createElement('div');
          item.className = 'music-panel-item';
          item.innerHTML = '<div class="music-panel-item-info"><span class="music-panel-item-name">' + song.name + '</span><span class="music-panel-item-artist">' + song.artist + '</span></div>';
          item.addEventListener('click', function() { playSong(i); });
          panelListEl.appendChild(item);
        });
        if (list.length > 0) {
          panel.querySelector('.music-panel-name').textContent = list[0].name;
          panel.querySelector('.music-panel-artist').textContent = list[0].artist;
          panel.querySelector('.music-panel-cover').src = list[0].cover;
        }
      }).catch(function(e) { console.warn('加载播放列表失败:', e); });
    }

    /* --- 导航栏按钮事件 --- */
    playBtn.addEventListener('click', function() {
      if (playlist.length === 0) return;
      togglePlay();
    });
    nextBtn.addEventListener('click', function() {
      if (playlist.length === 0) return;
      playSong((currentIndex + 1) % playlist.length);
    });
    listBtn.addEventListener('click', function() {
      panel.classList.toggle('open');
    });
  }

  /* --- 播放/暂停切换 --- */
  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      if (!audio.src) { playSong(0); return; }
      audio.play();
      isPlaying = true;
    }
    updatePlayIcons();
  }

  /* --- 播放指定歌曲 --- */
  function playSong(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    var song = playlist[index];
    audio.src = song.url;
    audio.play().catch(function(e) { console.warn('播放失败:', e); });
    isPlaying = true;
    if (panel) {
      panel.querySelector('.music-panel-name').textContent = song.name;
      panel.querySelector('.music-panel-artist').textContent = song.artist;
      panel.querySelector('.music-panel-cover').src = song.cover;
      var items = panel.querySelectorAll('.music-panel-item');
      items.forEach(function(el, i) { el.classList.toggle('active', i === index); });
    }
    updatePlayIcons();
  }

  /* --- 同步所有播放按钮图标 --- */
  function updatePlayIcons() {
    var icon = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    /* 导航栏按钮 */
    var navPlayBtn = document.querySelector('.nav-btn-music i');
    if (navPlayBtn) navPlayBtn.className = icon;
    /* 面板按钮 */
    if (panel) {
      var panelPlayIcon = panel.querySelector('.music-btn-play i');
      if (panelPlayIcon) panelPlayIcon.className = icon;
    }
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  /* --- 初始化 + pjax 兼容 --- */
  function run() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  run();

  /* pjax 页面切换后重新注入导航栏按钮 */
  document.addEventListener('pjax:complete', function() { init(); });
  /* Butterfly 可能用的自定义事件 */
  window.addEventListener('hexo:page-loaded', function() { init(); });
})();
