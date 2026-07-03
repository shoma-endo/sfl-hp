# Cloudflare Pages デプロイメモ

- Cloudflare Pages project name: `sfl-hp`
- Framework preset: `None`
- Build command: 空
- Build output directory: `public`

## 環境変数

Cloudflare PagesのSettings > Environment variablesに以下を設定します。

- `RESEND_API_KEY`: メール送信用のResend APIキー。
- `CONTACT_FROM_EMAIL`: 送信元メールアドレス。
- `CONTACT_TO_EMAIL`: `salonflowlab2603@gmail.com`。
- `LARK_CONTACT_WEBHOOK_URL`: Larkチャット通知用webhook URL。URL確定後に追加。

CLIでデプロイする場合:

```bash
npm run deploy
```
