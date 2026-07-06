# Blog MVP Plan

## Purpose

SFLサイトにブログ機能を追加するためのMVP計画です。要件は未確定のため、初期開発では運用しやすさ、SEO、実装量のバランスを優先します。

## Recommended Architecture

MVPでは、Lark Baseを記事管理画面として使い、サイト側は静的HTMLを生成して配信します。

```text
Lark Base
  title / slug / status / published_at / category / tags / excerpt / body_markdown / og_image

Generation script
  Fetch records from Lark Base
  Generate blog index and article HTML
  Update sitemap entries

Cloudflare Pages
  Serve generated static files from public/
```

この構成では、独自の管理者ページを初期開発しません。投稿、編集、公開ステータス管理はLark Baseで行います。

## MVP Scope

- ブログ一覧ページ
- 記事詳細ページ
- カテゴリ、タグの表示
- 公開、下書きステータス
- 投稿日、更新日
- 記事概要文
- OGP画像、meta description
- Lark Baseから記事データを取得する生成スクリプト
- `public/sitemap.xml` のブログURL更新
- ローカル参照チェックに通るHTML出力
- 運用手順のREADME追記

## Out of Scope for MVP

- 独自管理者ページ
- ログイン、権限管理
- リッチテキストエディタ
- サイト上での記事投稿、編集
- コメント機能
- 検索機能
- 人気記事ランキング
- 関連記事の自動推薦
- アクセス解析連動
- Lark Docs、Lark Wiki本文の高度なHTML変換

## Lark Storage Options

| Option | Fit | Notes |
|---|---|---|
| Lark Base | Best for MVP | 記事メタ情報、公開ステータス、本文Markdownを管理しやすい |
| Lark Docs | Good for writing | 本文は書きやすいが、HTML変換と画像処理が重くなる |
| Lark Wiki | Good for organization | 知識管理には向くが、CMSとしてはMVPにはやや重い |

MVPではLark Baseを採用します。本文は `body_markdown` フィールドにMarkdownとして保存する想定です。

## Estimated Effort

余裕込みの概算です。

| Work item | Estimate |
|---|---:|
| Lark Base設計 | 1.0 day |
| データ取得スクリプト | 1.5 days |
| HTML生成処理 | 2.0 days |
| ブログ一覧、記事詳細テンプレート | 2.0 days |
| SEO、OGP、sitemap対応 | 1.0 day |
| 運用手順、README更新 | 0.5 day |
| ローカル確認、修正 | 1.0 day |
| Buffer | 1.0-3.0 days |

Total: 10-12 days

## Implementation Notes

- 既存サイトはビルド工程を持たないため、生成スクリプトで `public/pages/blog/` 配下に静的HTMLを書き出します。
- 一覧ページは `public/pages/blog/index.html` を想定します。
- 記事ページは `public/pages/blog/{slug}/index.html` を想定します。
- ルートページ、ネストページの相対パス規則に合わせ、記事ページから共通アセットは `../../assets/...` または階層に応じた正しい相対パスで参照します。
- 共通ヘッダー、フッターは既存の `public/assets/js/site-chrome.js` を使います。
- MarkdownからHTMLへ変換する場合は、手書き変換ではなくライブラリ利用を検討します。
- 公開対象は `status = published` の記事のみとします。
- 生成時にslug重複、必須項目不足、公開日不正を検出して失敗させます。

## Verification Plan

- `npm run check`
- `git diff --check`
- ブログ一覧ページのローカル表示確認
- 記事詳細ページのローカル表示確認
- ホームまたは既存のネストページ1つの表示確認
- レスポンシブ表示確認
- ブラウザコンソールエラー確認
- 生成後の `public/sitemap.xml` 確認

## Future Enhancements

- 独自管理者ページ
- Lark Docs本文取り込み
- 画像アップロード運用の整備
- 関連記事
- 検索
- RSS
- タグ、カテゴリ別一覧
- Cloudflare Pagesデプロイ連携
