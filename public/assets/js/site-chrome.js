(() => {
  const navItems = [
    { slug: 'home', label: 'ホーム', key: 'home' },
    { slug: 'services', label: 'サービス', key: 'services' },
    { slug: 'case-study', label: '導入事例', key: 'case' },
    { slug: 'knowledge', label: 'コラム', key: 'knowledge' },
    { slug: 'company', label: '会社概要', key: 'company' }
  ];
  const footerItems = [
    ...navItems,
    { slug: 'cycle-pro', label: 'Cycle Proとは', key: 'cycle' },
    { slug: 'features', label: '機能', key: 'features' },
    { slug: 'flow', label: '導入の流れ', key: 'flow' },
    { slug: 'pricing', label: '料金プラン', key: 'pricing' },
    { slug: 'faq', label: 'よくある質問', key: 'faq' },
    { slug: 'download', label: '資料請求', key: 'download' },
    { slug: 'contact', label: 'お問い合わせ', key: 'contact' }
  ];
  const pageHref = (slug) => '../' + slug + '/index.html';
  const prefetched = new Set();
  const prefetchPage = (href) => {
    if (!href || prefetched.has(href)) return;
    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      return;
    }
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    prefetched.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    link.as = 'document';
    document.head.appendChild(link);
  };
  const schedulePrefetch = () => {
    const run = () => {
      document.querySelectorAll('a[href$="/index.html"]').forEach((link) => {
        prefetchPage(link.getAttribute('href'));
      });
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2500 });
    else window.setTimeout(run, 900);
  };
  const mount = document.querySelector('[data-site-header]');
  const active = mount?.dataset.active || '';
  const navLinks = navItems.map((item) => '<a href="' + pageHref(item.slug) + '" class="' + (active === item.key ? 'active' : '') + '">' + item.label + '</a>').join('');
  if (mount) {
    mount.outerHTML = '<header class="sfl-header"><div class="sfl-nav-wrap"><a class="sfl-brand" href="' + pageHref('home') + '" aria-label="合同会社SFL SALON FLOW LAB."><img class="sfl-logo" src="../../assets/images/sfl-logo-primary.png" alt="合同会社SFL SALON FLOW LAB."></a><nav class="sfl-nav">' + navLinks + '</nav><div class="sfl-header-actions"><a class="sfl-btn sfl-btn-gold" href="' + pageHref('contact') + '">お問い合わせ</a><a class="sfl-btn sfl-btn-outline" href="' + pageHref('download') + '">資料請求</a></div><button class="sfl-menu" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="sfl-drawer" data-open-drawer><span></span><span></span><span></span></button></div></header>';
  }
  const drawerMount = document.querySelector('[data-site-drawer]');
  if (drawerMount) {
    const drawerLinks = footerItems.filter((item) => item.key !== 'download').map((item) => '<a href="' + pageHref(item.slug) + '">' + item.label + '</a>').join('');
    drawerMount.outerHTML = '<div class="sfl-drawer" id="sfl-drawer" data-drawer role="dialog" aria-modal="true" aria-label="サイトメニュー" aria-hidden="true"><div class="sfl-drawer-panel"><button class="sfl-drawer-close" type="button" aria-label="閉じる" data-close-drawer>×</button>' + drawerLinks + '<a class="sfl-btn sfl-btn-gold" href="' + pageHref('contact') + '">お問い合わせ</a><a class="sfl-btn sfl-btn-outline" href="' + pageHref('download') + '">資料請求</a></div></div>';
  }
  const footerMount = document.querySelector('[data-site-footer]');
  if (footerMount) {
    const links = footerItems.map((item) => '<a href="' + pageHref(item.slug) + '">' + item.label + '</a>').join('');
    footerMount.outerHTML = '<footer class="sfl-footer"><div class="sfl-footer-grid"><div><div class="sfl-footer-brand"><span>合同会社SFL</span><strong>SALON FLOW LAB.</strong><p>美容サロンの現場に寄り添い、Lark・AI・業務データを活用した業務改善とDX支援を行います。</p></div></div><nav class="sfl-footer-nav">' + links + '</nav></div><p class="sfl-copy">© <span data-year></span> SFL / SALON FLOW LAB. All Rights Reserved.</p></footer>';
  }
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  const drawer = document.querySelector('[data-drawer]');
  const open = document.querySelector('[data-open-drawer]');
  if (drawer && open) {
    const focusableSelector = 'a[href], button:not([disabled])';
    const getFocusables = () => [...drawer.querySelectorAll('.sfl-drawer-panel ' + focusableSelector)];
    let lastFocus = null;
    const close = () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      open.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };
    const openDrawer = () => {
      lastFocus = document.activeElement;
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      open.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const focusables = getFocusables();
      if (focusables.length) focusables[0].focus();
    };
    open.addEventListener('click', openDrawer);
    drawer.addEventListener('click', (event) => {
      if (event.target === drawer || event.target.closest('[data-close-drawer]') || event.target.tagName === 'A') close();
    });
    drawer.addEventListener('keydown', (event) => {
      if (!drawer.classList.contains('open') || event.key !== 'Tab') return;
      const focusables = getFocusables();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && drawer.classList.contains('open')) close();
    });
  }
  document.addEventListener('mouseover', (event) => {
    const link = event.target.closest?.('a[href$="/index.html"]');
    if (link) prefetchPage(link.getAttribute('href'));
  }, { passive: true });
  document.addEventListener('focusin', (event) => {
    const link = event.target.closest?.('a[href$="/index.html"]');
    if (link) prefetchPage(link.getAttribute('href'));
  });
  document.addEventListener('pointerdown', (event) => {
    const link = event.target.closest?.('a[href$="/index.html"]');
    if (link) prefetchPage(link.getAttribute('href'));
  }, { passive: true });
  if (document.readyState === 'complete') schedulePrefetch();
  else window.addEventListener('load', schedulePrefetch, { once: true });
})();
