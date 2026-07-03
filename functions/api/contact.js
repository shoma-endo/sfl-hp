const DEFAULT_TO_EMAIL = 'salonflowlab2603@gmail.com';

export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const data = normalizePayload(payload);

    if (data.companyWebsite) {
      return json({ ok: true });
    }

    const validationError = validate(data);
    if (validationError) {
      return json({ ok: false, message: validationError }, 400);
    }

    const results = await Promise.allSettled([
      notifyLark(context.env, data),
      sendEmail(context.env, data)
    ]);

    const emailFailed = results[1].status === 'rejected';
    if (emailFailed) {
      console.error('contact email delivery failed', results[1].reason);
      return json({ ok: false, message: '送信に失敗しました。時間をおいて再度お試しください。' }, 502);
    }

    if (results[0].status === 'rejected') {
      console.warn('contact lark notification failed', results[0].reason);
    }

    return json({ ok: true });
  } catch (error) {
    console.error('contact request failed', error);
    return json({ ok: false, message: '送信内容を確認してください。' }, 400);
  }
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return json({ ok: true });
  return json({ ok: false, message: 'Method Not Allowed' }, 405);
}

function normalizePayload(payload) {
  return {
    formType: clean(payload.formType || 'お問い合わせ'),
    name: clean(payload.name),
    company: clean(payload.company),
    email: clean(payload.email),
    phone: clean(payload.phone),
    topic: clean(payload.topic),
    message: clean(payload.message),
    pageUrl: clean(payload.pageUrl),
    privacy: Boolean(payload.privacy),
    companyWebsite: clean(payload.company_website)
  };
}

function validate(data) {
  if (!data.name) return '氏名を入力してください。';
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'メールアドレスを確認してください。';
  if (!data.message) return 'お問い合わせ内容を入力してください。';
  if (!data.privacy) return 'プライバシーポリシーへの同意が必要です。';
  return '';
}

function clean(value) {
  return String(value || '').trim().slice(0, 3000);
}

async function notifyLark(env, data) {
  const webhookUrl = env.LARK_CONTACT_WEBHOOK_URL || env.LARK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msg_type: 'text',
      content: {
        text: buildText(data)
      }
    })
  });

  if (!response.ok) {
    throw new Error('Lark webhook failed: ' + response.status);
  }
}

async function sendEmail(env, data) {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing');
  }

  const from = env.CONTACT_FROM_EMAIL;
  if (!from) {
    throw new Error('CONTACT_FROM_EMAIL is missing');
  }

  const to = env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
  const subject = '【SFL HP】' + data.formType + ' - ' + data.name;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: data.email,
      subject,
      text: buildText(data)
    })
  });

  if (!response.ok) {
    throw new Error('Email delivery failed: ' + response.status + ' ' + await response.text());
  }
}

function buildText(data) {
  return [
    'SFL HPから' + data.formType + 'が届きました。',
    '',
    '種別: ' + data.formType,
    '会社名: ' + (data.company || '-'),
    '氏名: ' + data.name,
    'メール: ' + data.email,
    '電話番号: ' + (data.phone || '-'),
    '興味を持ったサービス: ' + (data.topic || '-'),
    'ページ: ' + (data.pageUrl || '-'),
    '',
    '内容:',
    data.message
  ].join('\n');
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
