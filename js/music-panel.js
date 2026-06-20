/* ===== 音乐面板组件 - 导航栏内嵌版 ===== */
(function() {
  function init() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    /* --- 导航栏右侧控制区 --- */
    var navControls = document.createElement('div');
    navControls.className = 'nav-right-controls';
    navControls.innerHTML =
      '<button class="nav-btn nav-btn-music" title="播放/暂停"><i class="fas fa-play"></i></button>' +
      '<button class="nav-btn nav-btn-next" title="下一首"><i class="fas fa-step-forward"></i></button>' +
      '<button class="nav-btn nav-btn-list" title="播放列表"><i class="fas fa-list"></i></button>';
    nav.appendChild(navControls);

    var playBtn = navControls.querySelector('.nav-btn-music');
    var nextBtn = navControls.querySelector('.nav-btn-next');
    var listBtn = navControls.querySelector('.nav-btn-list');

    /* --- 音乐面板（点击列表按钮弹出） --- */
    var panel = document.createElement('div');
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

    var audio = new Audio();
    var playlist = [];
    var currentIndex = 0;
    var isPlaying = false;

    /* --- 加载播放列表 --- */
    fetch('/music/playlist.json').then(function(r) { return r.json(); }).then(function(list) {
      playlist = list;
      var listEl = panel.querySelector('.music-panel-list');
      list.forEach(function(song, i) {
        var item = document.createElement('div');
        item.className = 'music-panel-item';
        item.innerHTML = '<div class="music-panel-item-info"><span class="music-panel-item-name">' + song.name + '</span><span class="music-panel-item-artist">' + song.artist + '</span></div>';
        item.addEventListener('click', function() { playSong(i); });
        listEl.appendChild(item);
      });
      if (list.length > 0) {
        panel.querySelector('.music-panel-name').textContent = list[0].name;
        panel.querySelector('.music-panel-artist').textContent = list[0].artist;
        panel.querySelector('.music-panel-cover').src = list[0].cover;
      }
    }).catch(function() {});

    /* --- 播放指定歌曲 --- */
    function playSong(index) {
      if (index < 0 || index >= playlist.length) return;
      currentIndex = index;
      var song = playlist[index];
      audio.src = song.url;
      audio.play();
      isPlaying = true;
      panel.querySelector('.music-panel-name').textContent = song.name;
      panel.querySelector('.music-panel-artist').textContent = song.artist;
      panel.querySelector('.music-panel-cover').src = song.cover;
      panel.querySelector('.music-btn-play i').className = 'fas fa-pause';
      playBtn.querySelector('i').className = 'fas fa-pause';
      var items = panel.querySelectorAll('.music-panel-item');
      items.forEach(function(el, i) { el.classList.toggle('active', i === index); });
    }

    /* --- 导航栏按钮事件 --- */
    playBtn.addEventListener('click', function() {
      if (playlist.length === 0) return;
      if (isPlaying) {
        audio.pause();
        playBtn.querySelector('i').className = 'fas fa-play';
        panel.querySelector('.music-btn-play i').className = 'fas fa-play';
        isPlaying = false;
      } else {
        if (!audio.src) { playSong(0); return; }
        audio.play();
        playBtn.querySelector('i').className = 'fas fa-pause';
        panel.querySelector('.music-btn-play i').className = 'fas fa-pause';
        isPlaying = true;
      }
    });

    nextBtn.addEventListener('click', function() {
      if (playlist.length === 0) return;
      playSong((currentIndex + 1) % playlist.length);
    });

    listBtn.addEventListener('click', function() {
      panel.classList.toggle('open');
    });

    /* --- 面板内部控制 --- */
    panel.querySelector('.music-btn-play').addEventListener('click', function() {
      if (isPlaying) {
        audio.pause();
        this.querySelector('i').className = 'fas fa-play';
        playBtn.querySelector('i').className = 'fas fa-play';
        isPlaying = false;
      } else {
        audio.play();
        this.querySelector('i').className = 'fas fa-pause';
        playBtn.querySelector('i').className = 'fas fa-pause';
        isPlaying = true;
      }
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

    /* --- 自动下一首 --- */
    audio.addEventListener('ended', function() {
      playSong((currentIndex + 1) % playlist.length);
    });

    /* --- 进度更新 --- */
    audio.addEventListener('timeupdate', function() {
      var pct = (audio.currentTime / audio.duration) * 100 || 0;
      panel.querySelector('.music-progress-fill').style.width = pct + '%';
      panel.querySelector('.music-time-current').textContent = formatTime(audio.currentTime);
      panel.querySelector('.music-time-total').textContent = formatTime(audio.duration);
    });

    /* --- 进度条点击 --- */
    panel.querySelector('.music-progress-bar').addEventListener('click', function(e) {
      var rect = this.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    function formatTime(s) {
      if (!s || isNaN(s)) return '0:00';
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }
  }

  /* 支持 pjax：监听页面加载 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
