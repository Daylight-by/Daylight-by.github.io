/* ===== 深色模式切换 ===== */
(function() {
  // 创建切换按钮
  var toggle = document.createElement('div');
  toggle.className = 'dark-mode-toggle';
  toggle.innerHTML = '🌙';
  toggle.title = '切换深色模式';
  document.body.appendChild(toggle);

  // 读取保存的状态
  var isDark = localStorage.getItem('dark-mode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
    toggle.innerHTML = '☀️';
  }

  // 切换事件
  toggle.addEventListener('click', function() {
    isDark = !isDark;
    document.documentElement.classList.toggle('dark-mode');
    toggle.innerHTML = isDark ? '☀️' : '🌙';
    localStorage.setItem('dark-mode', isDark);
  });
})();
