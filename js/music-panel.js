/* ===== 音乐面板组件 - 参考 blog.feitwnd.cc ===== */
(function() {
  // 创建音乐按钮（导航栏右侧）
  var musicBtn = document.createElement('div');
  musicBtn.className = 'music-toggle-btn';
  musicBtn.innerHTML = '<i class="fas fa-music"></i>';
  musicBtn.title = '音乐';

  // 创建音乐面板
  var panel = document.createElement('div');
  panel.className = 'music-panel';
  panel.innerHTML = '<div class="music-panel-header"><span class="music-panel-title">音乐</span><span class="music-panel-close">&times;</span></div><div class="music-panel-now"><img class="music-panel-cover" src="" alt=""><div class="music-panel-info"><div class="music-panel-name">未播放</div><div class="music-panel-artist">-</div></div></div><div class="music-panel-controls"><button class="music-btn-prev"><i class="fas fa-step-backward"></i></button><button class="music-btn-play"><i class="fas fa-play"></i></button><button class="music-btn-next"><i class="fas fa-step-forward"></i></button></div><div class="music-panel-progress"><div class="music-progress-bar"><div class="music-progress-fill"></div></div><div class="music-panel-time"><span class="music-time-current">0:00</span><span class="music-time-total">0:00</span></div></div><div class="music-panel-list"></div>';

  document.body.appendChild(musicBtn);
  document.body.appendChild(panel);

  var audio = new Audio();
  var playlist = [];
  var currentIndex = 0;
  var isPlaying = false;

  // 加载播放列表
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

  // 播放指定歌曲
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
    // 高亮当前
    var items = panel.querySelectorAll('.music-panel-item');
    items.forEach(function(el, i) { el.classList.toggle('active', i === index); });
  }

  // 播放/暂停
  panel.querySelector('.music-btn-play').addEventListener('click', function() {
    if (isPlaying) { audio.pause(); this.querySelector('i').className = 'fas fa-play'; isPlaying = false; }
    else { audio.play(); this.querySelector('i').className = 'fas fa-pause'; isPlaying = true; }
  });

  // 上一首/下一首
  panel.querySelector('.music-btn-prev').addEventListener('click', function() {
    playSong((currentIndex - 1 + playlist.length) % playlist.length);
  });
  panel.querySelector('.music-btn-next').addEventListener('click', function() {
    playSong((currentIndex + 1) % playlist.length);
  });

  // 自动下一首
  audio.addEventListener('ended', function() {
    playSong((currentIndex + 1) % playlist.length);
  });

  // 进度更新
  audio.addEventListener('timeupdate', function() {
    var pct = (audio.currentTime / audio.duration) * 100 || 0;
    panel.querySelector('.music-progress-fill').style.width = pct + '%';
    panel.querySelector('.music-time-current').textContent = formatTime(audio.currentTime);
    panel.querySelector('.music-time-total').textContent = formatTime(audio.duration);
  });

  // 进度条点击
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

  // 面板开关
  musicBtn.addEventListener('click', function() {
    panel.classList.toggle('open');
    musicBtn.classList.toggle('active');
  });
  panel.querySelector('.music-panel-close').addEventListener('click', function() {
    panel.classList.remove('open');
    musicBtn.classList.remove('active');
  });
})();
