(function () {
  var forms = document.querySelectorAll('[data-contact-form]');

  forms.forEach(function (form) {
    var status = form.querySelector('[data-form-status]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (status) {
        status.textContent = '送信中です。';
        status.className = 'sfl-form-status';
      }

      var submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;

      var payload = Object.fromEntries(new FormData(form).entries());
      payload.formType = form.getAttribute('data-form-type') || 'お問い合わせ';
      payload.pageUrl = window.location.href;

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
          if (status) {
            status.textContent = '送信しました。担当者よりご連絡します。';
            status.className = 'sfl-form-status success';
          }
        })
        .catch(function (error) {
          if (status) {
            status.textContent = error.message;
            status.className = 'sfl-form-status error';
          }
        })
        .finally(function () {
          if (submit) submit.disabled = false;
        });
    });
  });
})();
