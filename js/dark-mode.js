/* ===== 深色模式切换 - 导航栏内嵌版（支持 pjax） ===== */
(function() {
  function init() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    /* 防止重复添加 */
    if (nav.querySelector('.nav-btn-dark')) return;

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

    var isDark = document.documentElement.classList.contains('dark-mode');
    toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    navControls.appendChild(toggle);

    /* 切换事件 */
    toggle.addEventListener('click', function() {
      isDark = !isDark;
      document.documentElement.classList.toggle('dark-mode');
      toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('dark-mode', isDark);
    });
  }

  /* 读取保存的状态 */
  if (localStorage.getItem('dark-mode') === 'true') {
    document.documentElement.classList.add('dark-mode');
  }

  /* 初始化 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* pjax 页面切换后重新注入 */
  document.addEventListener('pjax:complete', function() { init(); });
  window.addEventListener('hexo:page-loaded', function() { init(); });
})();
