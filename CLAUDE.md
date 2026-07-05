# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

合同会社SFL（SALON FLOW LAB.）の静的Webサイト。HTML/CSS/JavaScriptのみ、ビルド工程なし。Cloudflare Pages が `public/` をそのまま配信する。詳細は `README.md`、作業規約は `AGENTS.md` を参照。

## コマンド

```bash
npm run dev            # Wrangler で Cloudflare Pages 相当のプレビュー（フォームAPI動作確認はこちら）
npm run check          # check:links + check:assets（変更後は必ず実行）
npm run check:links    # HTML/CSS のローカル参照チェック
npm run check:assets   # public/assets/ の未使用アセット検出
npm run deploy         # Cloudflare Pages へデプロイ
python3 -m http.server 8123 --directory public   # 静的確認のみの軽量サーバー
```

自動テストはない。検証はブラウザ確認 + `npm run check` + `git diff --check`。フォーム関連を触ったら追加で:

```bash
node --check public/assets/js/contact-form.js
node --check public/assets/js/sfl-lead-form.js
node --check functions/api/contact.js
```

## アーキテクチャ

**共通UIはJSがランタイム生成する。** ヘッダー・ドロワー・フッターは `public/assets/js/site-chrome.js`、ページ下部CTAは `sfl-wide-cta.js`、問い合わせ・資料請求フォームのマークアップは `sfl-lead-form.js` が生成。各ページの `index.html` にはこれらのHTMLは書かれていないので、ナビ・フッター・CTA・フォームの変更はJS側で行う。

**サービス定義の単一ソースは `public/assets/js/sfl-services-catalog.js`**（`window.SFL_SERVICES`）。ナビ・フッター・フォームの「興味を持ったサービス」はここを参照して連動する。サービス追加時の更新箇所: ①catalog定義 ②`pages/services/index.html` のカード ③`pages/{slug}/index.html` の新規LP ④`sitemap.xml`。

**パス規約**: ルート（`public/index.html`）は `assets/...`、ネストページ（`public/pages/*/`）は `../../assets/...`。

**フォームAPI**: `functions/api/contact.js` が Cloudflare Pages Functions として `/api/contact` で動く。クライアント側（`contact-form.js`）と同じ検証をサーバー側でも行い、`company_website` ハニーポットを持つ。環境変数: `RESEND_API_KEY` / `CONTACT_FROM_EMAIL`（メール送信に必須）、`CONTACT_TO_EMAIL`、`LARK_CONTACT_WEBHOOK_URL`（任意）。GitHub Pages プレビュー（`shoma-endo.github.io/sfl-hp`）は静的配信のみで Functions は動かない。

**旧URL**: `public/_redirects` で301転送（features→cycle-pro、lark→lark-flow-one、flow/pricing→salon-flow-one のアンカー）。旧ページHTMLは `public/pages/` に残っているが本番では転送される。

## 制約・規約

- ブランドカラーは固定: `#F8F5EF` `#103A71` `#C99A1A` `#E7D3A0` `#1E88E5` `#333333`。構成・密度・見せ方のみ調整し、色は変えない。
- CTAは「お問い合わせ」「資料請求」の2種に統一。公式LINEへの直接誘導CTAは使わない。
- フォームのバリデーションエラーは全体ステータスに集約せず、該当入力欄の直下に表示する。
- 問い合わせ・資料請求のサービス選択肢はページごとに分岐させず同一リストを使う。
- コミットは日本語の Conventional Commits（`feat:` `fix:` `docs:` `chore:`）。
- `tasks/lessons.md` は廃止済み（auto-memory へ移行）。追記しない。
- 住所・電話番号・料金・実績値は公開前に実データか確認する。秘密情報・Cloudflare APIトークンはコミットしない。
