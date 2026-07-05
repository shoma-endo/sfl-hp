(() => {
  const catalog = window.SFL_SERVICES?.catalog || [];
  const topicExtras = window.SFL_SERVICES?.topicExtras || ['その他'];
  const topicOptions = [
    ...catalog.map((service) => service.label),
    ...topicExtras
  ];

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');

  const topicOptionsHtml = () => topicOptions
    .map((option) => '<option>' + escapeHtml(option) + '</option>')
    .join('');

  const renderForm = (config) => {
    const placeholderAttr = config.messagePlaceholder
      ? ' placeholder="' + escapeHtml(config.messagePlaceholder) + '"'
      : '';
    const messageBody = config.messageDefault ? escapeHtml(config.messageDefault) : '';

    return ''
      + '<form class="sfl-form compact" data-contact-form'
      + ' data-form-type="' + escapeHtml(config.formType) + '"'
      + ' data-message-label="' + escapeHtml(config.messageLabel) + '">'
      + '<p class="sfl-form-policy">ご入力いただく個人情報の取扱いについては、送信前に<a href="../privacy/index.html" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>をご確認ください。</p>'
      + '<input type="text" name="company_website" autocomplete="off" tabindex="-1" aria-hidden="true" class="sfl-hp-field">'
      + '<label>会社名<input name="company" autocomplete="organization" placeholder="例）Eyelash Salon Lucia"></label>'
      + '<label>氏名<span>（必須）</span><input name="name" autocomplete="name" required placeholder="例）山田 太郎"></label>'
      + '<label>メールアドレス<span>（必須）</span><input type="email" name="email" autocomplete="email" required placeholder="例）info@example.com"></label>'
      + '<label>電話番号<input type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="例）090-1234-5678"></label>'
      + '<label>興味を持ったサービス'
      + '<select name="topic" required>'
      + '<option value="" disabled selected hidden>選択してください</option>'
      + topicOptionsHtml()
      + '</select></label>'
      + '<label>' + escapeHtml(config.messageLabel) + '<span>（必須）</span>'
      + '<textarea name="message" rows="' + escapeHtml(config.messageRows) + '" required'
      + placeholderAttr + '>' + messageBody + '</textarea></label>'
      + '<label class="sfl-check"><input type="checkbox" name="privacy" required> <a href="../privacy/index.html" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>に同意します</label>'
      + '<button class="sfl-btn sfl-btn-gold" type="submit">' + escapeHtml(config.submitLabel) + '</button>'
      + '<p class="sfl-form-status" data-form-status role="status" aria-live="polite"></p>'
      + '</form>';
  };

  document.querySelectorAll('[data-sfl-lead-form]').forEach((mount) => {
    mount.outerHTML = renderForm({
      formType: mount.dataset.formType || 'お問い合わせ',
      submitLabel: mount.dataset.submitLabel || '送信する',
      messageLabel: mount.dataset.messageLabel || 'お問い合わせ内容',
      messagePlaceholder: mount.dataset.messagePlaceholder || '',
      messageDefault: mount.dataset.messageDefault || '',
      messageRows: mount.dataset.messageRows || '5'
    });
  });
})();
