(function () {
  var forms = document.querySelectorAll('[data-contact-form]');
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phonePattern = /^[0-9+\-()（）\s]{8,20}$/;

  function setStatus(status, message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = 'sfl-form-status' + (type ? ' ' + type : '');
  }

  function validateForm(form) {
    var name = (form.elements.name?.value || '').trim();
    var email = (form.elements.email?.value || '').trim();
    var phone = (form.elements.phone?.value || '').trim();
    var message = (form.elements.message?.value || '').trim();
    var privacy = Boolean(form.elements.privacy?.checked);

    if (!name) {
      return '氏名を入力してください。';
    }

    if (!email) {
      return 'メールアドレスを入力してください。';
    }

    if (!emailPattern.test(email)) {
      return 'メールアドレスの形式を確認してください。';
    }

    if (phone && !phonePattern.test(phone)) {
      return '電話番号は半角数字・ハイフン・括弧で入力してください。';
    }

    if (!message) {
      return 'お問い合わせ内容を入力してください。';
    }

    if (!privacy) {
      return 'プライバシーポリシーへの同意が必要です。';
    }

    return '';
  }

  function validateField(field) {
    if (!field) return '';

    var value = (field.value || '').trim();
    if (field.name === 'email' && !value) {
      return 'メールアドレスを入力してください。';
    }

    if (field.name === 'email' && value && !emailPattern.test(value)) {
      return 'メールアドレスの形式を確認してください。';
    }

    if (field.name === 'phone' && value && !phonePattern.test(value)) {
      return '電話番号は半角数字・ハイフン・括弧で入力してください。';
    }

    return '';
  }

  function getFieldError(field) {
    var errorId = field.getAttribute('aria-describedby');
    var error = errorId ? document.getElementById(errorId) : null;
    if (error) return error;

    error = document.createElement('span');
    error.id = 'sfl-error-' + field.name + '-' + Math.random().toString(36).slice(2, 8);
    error.className = 'sfl-field-error';
    error.setAttribute('aria-live', 'polite');
    field.setAttribute('aria-describedby', error.id);
    field.insertAdjacentElement('afterend', error);
    return error;
  }

  function setFieldError(field, message) {
    var error = getFieldError(field);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message;
  }

  function validateFieldInline(field, showEmpty) {
    var message = validateField(field);
    if (!showEmpty && field.name === 'email' && !(field.value || '').trim()) {
      message = '';
    }
    setFieldError(field, message);
    return message;
  }

  forms.forEach(function (form) {
    var status = form.querySelector('[data-form-status]');
    var realtimeFields = [form.elements.email, form.elements.phone].filter(Boolean);
    form.noValidate = true;

    realtimeFields.forEach(function (field) {
      getFieldError(field);
      field.addEventListener('input', function () {
        validateFieldInline(field, false);
        setStatus(status, '', '');
      });
      field.addEventListener('blur', function () {
        validateFieldInline(field, true);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var validationError = validateForm(form);
      if (validationError) {
        var firstInvalidField = null;
        realtimeFields.forEach(function (field) {
          var fieldError = validateFieldInline(field, true);
          if (fieldError && !firstInvalidField) firstInvalidField = field;
        });
        setStatus(status, firstInvalidField ? '' : validationError, firstInvalidField ? '' : 'error');
        if (firstInvalidField) {
          firstInvalidField.focus();
        } else {
          form.reportValidity();
        }
        return;
      }

      realtimeFields.forEach(function (field) {
        setFieldError(field, '');
      });

      setStatus(status, '送信中です。', '');

      var submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;

      var payload = Object.fromEntries(new FormData(form).entries());
      payload.formType = form.getAttribute('data-form-type') || 'お問い合わせ';
      payload.pageUrl = window.location.href;

      if (window.location.hostname.endsWith('github.io')) {
        setStatus(status, 'GitHub Pagesのプレビューではフォーム送信は利用できません。本番公開後に送信できます。', 'error');
        if (submit) submit.disabled = false;
        return;
      }

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) {
            return response.json().catch(function () {
              return {};
            }).then(function (body) {
              throw new Error(body.message || '送信に失敗しました。時間をおいて再度お試しください。');
            });
          }
          return response.json();
        })
        .then(function () {
          form.reset();
          setStatus(status, '送信しました。担当者よりご連絡します。', 'success');
        })
        .catch(function (error) {
          setStatus(status, error.message, 'error');
        })
        .finally(function () {
          if (submit) submit.disabled = false;
        });
    });
  });
})();
