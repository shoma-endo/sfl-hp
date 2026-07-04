# SFL / SALON FLOW LAB. — Webサイト

合同会社SFLの静的Webサイトです。HTML/CSS/JavaScriptのみで構成し、Cloudflare Pagesで `public/` をそのまま配信します。

## 公開先

- 本番想定ドメイン: `https://salonflowlab.com`
- GitHub Pagesプレビュー: `https://shoma-endo.github.io/sfl-hp/`
- GitHubリポジトリ: `https://github.com/shoma-endo/sfl-hp`

## 構成

- `public/index.html`: ルート入口ページ。`/pages/home/` へリダイレクトします。
- `public/pages/`: 各ページのHTML。
- `public/assets/`: CSS、JavaScript、画像、PDFなどの静的アセット。
- `public/assets/css/sfl.css`: SFL用の共通スタイル。
- `public/assets/js/site-chrome.js`: 共通ヘッダー、ドロワー、フッター生成。
- `public/assets/js/contact-form.js`: お問い合わせ・資料請求フォーム送信。
- `public/_headers`: Cloudflare Pagesのセキュリティ・キャッシュヘッダー。
- `public/robots.txt`, `public/sitemap.xml`: SEO用ファイル。
- `functions/api/contact.js`: Cloudflare Pages Functionsのフォーム受付API。
- `scripts/check-local-refs.mjs`: HTML/CSS内のローカル参照チェック。
- `scripts/check-unused-assets.mjs`: 未使用アセット検出。
- `docs/deployment/README.md`: Cloudflare Pagesデプロイメモ。
- `wrangler.jsonc`: Cloudflare Pages設定。

## ページ

- ホーム
- サービス
- Cycle Proとは
- 機能
- 導入の流れ
- 料金プラン
- 導入事例
- コラム
- 会社概要
- よくある質問
- お問い合わせ
- 資料請求

## デザイン・CTA方針

- ベースカラーはブランドガイド準拠: `#F8F5EF`, `#103A71`, `#C99A1A`, `#E7D3A0`, `#1E88E5`, `#333333`。
- CTAは「お問い合わせ」と「資料請求」に統一しています。
- 公式LINEへの直接誘導CTAは使いません。
- 共通ヘッダー・フッター・ドロワーは `public/assets/js/site-chrome.js` で生成します。

## コマンド

```bash
npm install
npm run dev
npm run check:links
npm run check:assets
npm run check
npm run deploy
```

ビルド工程はありません。Cloudflare PagesのBuild output directoryは `public` です。

## GitHub Pages プレビュー

GitHub Actionsで `public/` をGitHub Pagesに公開します。

- workflow: `.github/workflows/deploy-github-pages.yml`
- 公開対象: `public/`
- 公開URL: `https://shoma-endo.github.io/sfl-hp/`
- 注意: GitHub Pagesは静的配信のみのため、`functions/api/contact.js` のフォーム送信APIは動きません。フォーム送信はCloudflare Pages本番で有効化します。
- デプロイ失敗時: Actions の「Re-run failed jobs」は artifact が重複して失敗しやすいため使わず、`main` へ push するか「Run workflow」で新規 run を実行してください。`Deployment failed, try again later.` は GitHub Pages 側の一時障害であることが多く、workflow は最大3回リトライします。

## Cloudflare Pages

- Project name: `sfl-hp`
- Framework preset: `None`
- Build command: 空
- Build output directory: `public`
- Production branch: `main`
- Functions API: `functions/api/contact.js` が `/api/contact` として動作します。

詳しい手順は `docs/deployment/README.md` を参照してください。

## フォーム送信

お問い合わせと資料請求は `/api/contact` へ送信します。送信内容はメール送信し、Lark webhookが設定されている場合はLarkチャットにも通知します。

フォーム項目:

- 会社名
- 氏名
- メールアドレス
- 電話番号
- 興味を持ったサービス
- お問い合わせ内容
- プライバシーポリシー同意

フロントエンドでは入力中にメールアドレスと電話番号の形式を検証し、各入力欄の直下にエラーメッセージを表示します。Cloudflare Pages Functions側でも同じ項目を送信時に検証します。スパム対策として `company_website` のハニーポット項目も送信対象に含めています。

Cloudflare Pagesの環境変数:

- `RESEND_API_KEY`: メール送信用のResend APIキー。
- `CONTACT_FROM_EMAIL`: 送信元メールアドレス。例: `SFL <noreply@salonflowlab.com>`。
- `CONTACT_TO_EMAIL`: 受信先メールアドレス。未設定時は `salonflowlab2603@gmail.com`。
- `LARK_CONTACT_WEBHOOK_URL`: Larkチャット通知用webhook URL。後から追加可能。

`LARK_CONTACT_WEBHOOK_URL` が未設定でもフォーム送信は継続します。`RESEND_API_KEY` と `CONTACT_FROM_EMAIL` はメール送信に必須です。

## 確認ポイント

変更後は最低限、以下を確認します。

```bash
npm run check
git diff --check
```

フォーム周りを変更した場合は、以下も確認します。

```bash
node --check public/assets/js/contact-form.js
node --check functions/api/contact.js
```
