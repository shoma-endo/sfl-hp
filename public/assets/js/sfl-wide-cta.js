(() => {
  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');

  const contactDownloadActions = [
    { label: 'お問い合わせ', href: '../contact/index.html', className: 'sfl-btn sfl-btn-gold' },
    { label: '資料請求', href: '../download/index.html', className: 'sfl-btn sfl-btn-outline' }
  ];

  const PRESETS = {
    consult: {
      title: 'まずはサロンの課題をお聞かせください',
      description: '現状の業務やお悩みに合わせて、最適な導入ステップをご提案します。',
      actions: contactDownloadActions
    },
    'cycle-pro': {
      title: 'まずはサロンの課題をお聞かせください',
      description: '専門スタッフが、サロンの課題に合わせて最適な活用方法をご提案します。',
      actions: contactDownloadActions
    },
    'case-study': {
      title: '同じような課題がある方へ',
      description: '現在の業務やサロン規模に合わせて、必要な機能と導入ステップをご提案します。',
      actions: contactDownloadActions
    },
    knowledge: {
      title: 'サロン運営のヒントを、もっと活用しませんか？',
      description: 'SFLでは、業務改善から集客・教育まで、サロンの成長を支援します。',
      actions: contactDownloadActions
    },
    download: {
      title: '具体的な導入相談も可能です',
      description: '資料だけで判断しづらい内容は、サロンの状況に合わせて個別にご案内します。',
      actions: [
        { label: 'お問い合わせ', href: '../contact/index.html', className: 'sfl-btn sfl-btn-gold' },
        { label: '導入事例を見る', href: '../case-study/index.html', className: 'sfl-btn sfl-btn-outline' }
      ]
    },
    'home-services': {
      title: 'ツールの導入だけでなく、定着と運用改善まで伴走します。',
      description: '3本柱の詳細、月額プラン、導入の流れをご案内します。',
      actions: [
        { label: 'SALON FLOW ONEの詳細', href: '../services/index.html', className: 'sfl-btn sfl-btn-gold' },
        { label: '導入事例を見る', href: '../case-study/index.html', className: 'sfl-btn sfl-btn-outline' }
      ]
    }
  };

  const renderAction = (action) => ''
    + '<a class="' + escapeHtml(action.className) + '" href="' + escapeHtml(action.href) + '">'
    + escapeHtml(action.label)
    + '</a>';

  const renderCta = (config) => ''
    + '<div class="sfl-wide-cta" data-sfl-reveal>'
    + '<div><h3>' + escapeHtml(config.title) + '</h3>'
    + '<p>' + escapeHtml(config.description) + '</p></div>'
    + config.actions.map(renderAction).join('')
    + '</div>';

  const resolveConfig = (mount) => {
    const variant = mount.dataset.variant || 'consult';
    const preset = PRESETS[variant] || PRESETS.consult;
    return {
      title: mount.dataset.title || preset.title,
      description: mount.dataset.desc || preset.description,
      actions: preset.actions
    };
  };

  document.querySelectorAll('[data-sfl-wide-cta]').forEach((mount) => {
    mount.outerHTML = renderCta(resolveConfig(mount));
  });
})();
