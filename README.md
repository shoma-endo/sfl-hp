# SFL / SALON FLOW LAB. — Webサイト

合同会社SFLの静的Webサイトです。HTML/CSS/JavaScriptのみで構成し、Cloudflare Pagesで `public/` をそのまま配信します。

## 構成

- `public/index.html`: ルート入口ページ。`/pages/01-top/` へリダイレクトします。
- `public/pages/`: 各ページのHTML。
- `public/assets/css/sfl.css`: SFL用の共通スタイル。
- `public/assets/js/site-chrome.js`: 共通ヘッダー、ドロワー、フッター生成。
- `public/assets/js/contact-form.js`: お問い合わせ・資料請求フォーム送信。
- `functions/api/contact.js`: Cloudflare Pages Functionsのフォーム受付API。
- `wrangler.jsonc`: Cloudflare Pages設定。

## ページ

- ホーム
- サービス
- Cycle Proとは
- 機能
- 導入の流れ
- 料金プラン
- 導入事例
- ナレッジ
- 会社概要
- よくある質問
- お問い合わせ

## コマンド

```bash
npm install
npm run dev
npm run check
npm run deploy
```

Cloudflare PagesのBuild output directoryは `public` です。

## フォーム送信

お問い合わせと資料請求は `/api/contact` へ送信します。送信内容はメール送信し、Lark webhookが設定されている場合はLarkチャットにも通知します。

Cloudflare Pagesの環境変数:

- `RESEND_API_KEY`: メール送信用のResend APIキー。
- `CONTACT_FROM_EMAIL`: 送信元メールアドレス。例: `SFL <noreply@example.com>`。
- `CONTACT_TO_EMAIL`: 受信先メールアドレス。未設定時は `salonflowlab2603@gmail.com`。
- `LARK_CONTACT_WEBHOOK_URL`: Larkチャット通知用webhook URL。後から追加可能。

`LARK_CONTACT_WEBHOOK_URL` が未設定でもフォーム送信は継続します。`RESEND_API_KEY` と `CONTACT_FROM_EMAIL` はメール送信に必須です。
