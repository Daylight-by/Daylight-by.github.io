/* ===== 深色模式切换 - 导航栏内嵌版 ===== */
(function() {
  function init() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    /* 查找或创建导航栏右侧控制区 */
    var navControls = nav.querySelector('.nav-right-controls');
    if (!navControls) {
      navControls = document.createElement('div');
      navControls.className = 'nav-right-controls';
      nav.appendChild(navControls);
    }

    /* 创建深色模式切换按钮 */
    var toggle = document.createElement('button');
    toggle.className = 'nav-btn nav-btn-dark';
    toggle.title = '切换深色模式';

    var isDark = localStorage.getItem('dark-mode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      toggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      toggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    navControls.appendChild(toggle);

    /* 切换事件 */
    toggle.addEventListener('click', function() {
      isDark = !isDark;
      document.documentElement.classList.toggle('dark-mode');
      toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('dark-mode', isDark);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
