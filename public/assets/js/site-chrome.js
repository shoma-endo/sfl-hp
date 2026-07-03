(() => {
  const navItems = [
    { slug: '01-top', label: 'ホーム', key: 'home' },
    { slug: '02-salon', label: 'サービス', key: 'services' },
    { slug: '10-access', label: '導入事例', key: 'case' },
    { slug: '13-ai-tools', label: 'ナレッジ', key: 'knowledge' },
    { slug: '11-contact', label: '会社概要', key: 'company' }
  ];
  const footerItems = [
    ...navItems,
    { slug: '08-management-system', label: 'Cycle Proとは', key: 'cycle' },
    { slug: '06-school', label: '機能', key: 'features' },
    { slug: '04-reservation', label: '導入の流れ', key: 'flow' },
    { slug: '03-menu-price', label: '料金プラン', key: 'pricing' },
    { slug: '09-consulting', label: 'よくある質問', key: 'faq' },
    { slug: '14-download', label: '資料請求', key: 'download' },
    { slug: '12-privacy-policy', label: 'プライバシーポリシー', key: 'privacy' }
  ];
  const pageHref = (slug) => '../' + slug + '/index.html';
  const mount = document.querySelector('[data-site-header]');
  const active = mount?.dataset.active || '';
  const navLinks = navItems.map((item) => '<a href="' + pageHref(item.slug) + '" class="' + (active === item.key ? 'active' : '') + '">' + item.label + '</a>').join('');
  if (mount) {
    mount.outerHTML = '<header class="sfl-header"><div class="sfl-nav-wrap"><a class="sfl-brand" href="' + pageHref('01-top') + '" aria-label="合同会社SFL SALON FLOW LAB."><img class="sfl-logo" src="../../assets/images/sfl-logo-primary.png" alt="合同会社SFL SALON FLOW LAB."></a><nav class="sfl-nav">' + navLinks + '</nav><div class="sfl-header-actions"><a class="sfl-btn sfl-btn-gold" href="' + pageHref('12-privacy-policy') + '">お問い合わせ</a><a class="sfl-btn sfl-btn-outline" href="' + pageHref('14-download') + '">資料請求</a></div><button class="sfl-menu" aria-label="メニューを開く" data-open-drawer><span></span><span></span><span></span></button></div></header>';
  }
  const drawerMount = document.querySelector('[data-site-drawer]');
  if (drawerMount) {
    const drawerLinks = footerItems.filter((item) => item.key !== 'download').map((item) => '<a href="' + pageHref(item.slug) + '">' + item.label + '</a>').join('');
    drawerMount.outerHTML = '<div class="sfl-drawer" data-drawer><div class="sfl-drawer-panel"><button class="sfl-drawer-close" aria-label="閉じる" data-close-drawer>×</button>' + drawerLinks + '<a class="sfl-btn sfl-btn-gold" href="' + pageHref('12-privacy-policy') + '">お問い合わせ</a><a class="sfl-btn sfl-btn-outline" href="' + pageHref('14-download') + '">資料請求</a></div></div>';
  }
  const footerMount = document.querySelector('[data-site-footer]');
  if (footerMount) {
    const links = footerItems.map((item) => '<a href="' + pageHref(item.slug) + '">' + item.label + '</a>').join('');
    footerMount.outerHTML = '<footer class="sfl-footer"><div class="sfl-footer-grid"><div><div class="sfl-footer-brand"><span>合同会社SFL</span><strong>SALON FLOW LAB.</strong><p>美容サロンの現場に寄り添い、Lark・AI・業務データを活用した業務改善とDX支援を行います。</p></div></div><nav class="sfl-footer-nav">' + links + '</nav><div class="sfl-footer-cta"><a class="sfl-btn sfl-btn-gold" href="' + pageHref('12-privacy-policy') + '">お問い合わせ</a><a class="sfl-btn sfl-btn-outline light" href="' + pageHref('14-download') + '">資料請求</a></div></div><p class="sfl-copy">© <span data-year></span> SFL / SALON FLOW LAB. All Rights Reserved.</p></footer>';
  }
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  const drawer = document.querySelector('[data-drawer]');
  const open = document.querySelector('[data-open-drawer]');
  if (drawer && open) {
    const close = () => { drawer.classList.remove('open'); document.body.style.overflow = ''; };
    open.addEventListener('click', () => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; });
    drawer.addEventListener('click', (event) => {
      if (event.target === drawer || event.target.closest('[data-close-drawer]') || event.target.tagName === 'A') close();
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  }
})();
