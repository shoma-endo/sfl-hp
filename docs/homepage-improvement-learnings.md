# ホームページ改善 — 学び・設計方針・再発防止

> **目的:** SFL HP（`public/` 静的サイト）を今後改善するとき、同じ設計ミスを繰り返さないための記録。  
> **対象読者:** ページ改修・CTA追加・コンポーネント化を行う開発者・編集者。  
> **最終更新:** 2026-07-05

---

## 1. このサイトの前提

| 項目 | 方針 |
|------|------|
| 構成 | ビルドなし。`public/` を直接編集して Cloudflare Pages 配信 |
| 共通UI | HTML にマウントポイント → JS が DOM を生成（`site-chrome.js` パターン） |
| 主コンバージョン | **お問い合わせ**（主） / **資料ダウンロード**（副） |
| ヘッダー | **`position: fixed`** — スクロール中も CTA を常時表示（PC） |
| モバイル | 1100px 以下でヘッダー CTA ボタンは非表示。ハンバーガー → ドロワー |

**重要:** 「ヘッダーに CTA があるから body は不要」は **半分だけ正しい**。SP ではファーストビューにヘッダー CTA が見えない。body の主 CTA を安易に全削除しない。

**技術メモ:** 以前 `position: sticky` だったが、`.sfl-page { overflow: hidden }` により sticky が効かずヘッダーがスクロールで消えていた。`fixed` + `padding-top: var(--sfl-header-height)` に変更済み。

---

## 2. 学びの要約（TL;DR）

1. **CTA は「同じボタンの枚数」ではなく「役割の重複」が問題。** ヘッダー・フッター・wide-cta に同じ2ボタンを並べると、コンバージョン向上ではなく選択疲れと安っぽさを生む。
2. **ホームと下層ページで CTA 設計を揃えすぎない。** ホームは「次に読むページ」への導線、下層は「ヘッダー常設で足りる」ケースが多い。
3. **フォームページ（contact / download）に wide-cta を置かない。** フォーム自体が CTA。
4. **共通化は「DRY のため」だけでは足りない。** 静的13ページ規模でも、CTA 文言の一元管理など **運用上のメリットがある箇所** だけコンポーネント化する。
5. **モバイル監査とコンバージョン監査は別軸。** タップ領域・a11y を直しても、価格不明・CTA 重複は残る。両方見る。
6. **ヒーローに価格・導入期間の1行があると離脱が減る。** B2B では「いくらか分からない」が最大の離脱理由の一つ。ただし **同じ行き先をテキストリンクで重ねない**（ナビ・フッターと役割が被る）。
7. **比較・一覧 UI（料金カード等）に問い合わせボタンを1枚だけ置かない。** 他カードと不整合になり、ヘッダー CTA と重複する。
8. **サイト共通ラベル（「よくある質問」等）は、ラベルと着地点のページタイトルが一致させる。** フッター FAQ → 商品 LP ヒーロー、は UX として破綻する。
9. **ナビ・フッターで辿れる導線を本文にテキストリンクで再掲しない。** 「料金・詳細を見る」「サービス一覧へ」等のページ間リンクは、選択肢を増やすだけでコンバージョンには効かない。

---

## 3. CTA 設計 — 最大の学び

### 3.1 起きていた問題

下層ページ（FAQ、サービス、料金など）で、次の **3層が同じ「お問い合わせ + 資料ダウンロード」** を繰り返していた。

```
ヘッダー（2ボタン）→ 本文末尾 wide-cta（2ボタン）→ フッター（2ボタン）
```

典型ページで **コンバージョン系ボタン6個**。うち4個が同義の重複。

さらに **資料ダウンロードページ** では、フォーム送信の直下に「お問い合わせ」 wide-cta があり、文脈と矛盾していた。

### 3.2 採用した CTA 階層（2026-07-04 時点）

| ゾーン | 役割 | 内容 |
|--------|------|------|
| **ヘッダー（PC）** | 常設の逃げ道（**fixed**） | お問い合わせ + 資料ダウンロード |
| **ドロワー（SP）** | モバイル常設 | 同上（1タップでメニュー展開が必要） |
| **ヒーロー（ホームのみ）** | ファーストビューの主 CTA | **無料相談 1本** + 価格1行（テキスト。別ページへの料金リンクは置かない） |
| **本文** | ページ固有の「次の一歩」 | ホーム: サービス / 事例（wide-cta）、事例詳細は **テキストリンク**。商品 LP: **同一ページ内アンカー**（`#pricing` / `#flow`）のみ |
| **フッター** | ナビ + ブランド | **CTA ボタンなし**。サイト欄: 主要ページ + **FAQ 独立ページ**。サービス欄: 各商品 LP |
| **wide-cta** | 読了後の押し場所 | **ホームのサービスセクションのみ**（サービス / 事例。問い合わせと別意図） |

**目安:** 同一ページで「お問い合わせ」「資料ダウンロード」の **ボタン** は、ヘッダー（+ SP ドロワー）で足りる。本文に足すなら **文脈に合った別アクション** にする。

### 3.3 ホームで実施した良い判断

| 変更 | 理由 |
|------|------|
| ヒーローを主 CTA 1本に | 資料ダウンロードはヘッダーに集約。ヒーローで2本並べない |
| ヒーロー直下に価格・導入期間1行 | 「いくらか分からない」離脱への対処。別ページへの料金リンクは削除（フッター・サービスで足りる） |
| フッター直前の wide-cta 削除 | ヘッダー / フッターと完全重複 |
| サービス下 wide-cta は維持 | **問い合わせではなく** SF ONE 詳細 / サービス一覧へのナビ |
| ホーム事例セクションをテキストリンク化 | wide-cta・ナビとボタンが3重。料金詳細リンクと同じ階層に |
| ヘッダーを fixed 化 | sticky が overflow で効いていなかった。CTA 常時表示のため |
| FAQ を独立ページに維持 | フッター「よくある質問」→ 商品 LP ではなく `/pages/faq/`（h1 一致） |
| 本文の冗長リンク削除 | FAQ・SF ONE LP から「料金・詳細を見る」「Cycle Proの詳細を見る」等を除去 |

### 3.4 再発防止チェックリスト

新しい CTA を追加する前に確認する:

- [ ] ヘッダー（と SP ドロワー）と **同じラベル・同じリンク先** のボタンを本文に追加していないか
- [ ] フォームページ（contact / download）の下に、また問い合わせ / 資料ダウンロードを置いていないか
- [ ] SP ファーストビューに **主 CTA が1つ以上** あるか（ホームは特に重要）
- [ ] 追加する CTA は「コンバージョン」か「回遊（別ページへ）」か — 目的が言語化されているか
- [ ] 1ページ内のゴールドボタン（主CTA）が **2つ以上** 並んでいないか
- [ ] 料金表・比較カードの **一部だけ** に問い合わせボタンを置いていないか
- [ ] ナビ / wide-cta と同じ行き先の **本文ボタン** を追加していないか（テキストリンクなら可）
- [ ] フッター・ヘッダーと **同じ行き先** のテキストリンク（「料金を見る」「FAQ」等）を本文に追加していないか
- [ ] サイト共通ラベル（FAQ、サービス、会社概要）のリンク先で **ページ h1 / title がラベルと一致** するか

---

## 4. コンポーネント化の学び

### 4.1 作った共通基盤

| ファイル | マウント / 参照 | 用途 |
|----------|-----------------|------|
| `site-chrome.js` | `[data-site-header]` 等 | ヘッダー / ドロワー / フッター |
| `sfl-services-catalog.js` | `window.SFL_SERVICES` | **FLOW ONE 3商品**の slug・label（フッター・フォーム topic の元） |
| `sfl-lead-form.js` | `[data-sfl-lead-form]` | お問い合わせ・資料ダウンロードフォーム（catalog + topicExtras から選択肢生成） |
| `contact-form.js` | `[data-contact-form]` | 送信・バリデーション |
| `sfl-wide-cta.js` | `[data-sfl-wide-cta]` | ページ下部の横長 CTA ブロック |

**スクリプト読み込み順（フォームページ）:**

```
site-chrome.js → sfl-lead-form.js → contact-form.js
```

フォームは `sfl-lead-form.js` が先に DOM を生成してから `contact-form.js` がバインドする。

### 4.2 フォーム共通化で得たこと

- お問い合わせと資料ダウンロードは **入力項目が同じ**。UI だけ資料ダウンロード（1列 `compact`）に統一した。
- 差分は `data-form-type` / `data-submit-label` / `data-message-label` 等の data 属性で吸収。
- topic 選択肢は **`sfl-services-catalog.js` の catalog + topicExtras** から生成（`sfl-lead-form.js` が読み込む）。

**ミスを避ける:** 片方のフォームだけ placeholder や select を更新して、もう片方を忘れる — 共通化前は実際に起きうる状態だった。

### 4.3 wide-cta 共通化とその後の整理

- 最初は11ページに wide-cta をコンポーネント化した。
- 監査の結果、**コンポーネント化 ≠ 全ページに置くべき** と判明。
- `sfl-wide-cta.js` は残し、**使用箇所はホームのみ** に削減。プリセット（`consult`, `download` 等）は将来の部分配置用に JS 内に残してよい。

**教訓:** 共通化のタイミングで「配置ポリシー」も一緒に決めないと、DRY しただけで UX は改善しない。

### 4.4 共通化しなくてよいもの（現時点）

| 対象 | 理由 |
|------|------|
| `<head>` ボイラープレート | JS 生成は SEO に不利。ビルドなし構成では許容 |
| ページタイトル（`sfl-page-title`） | 中身はページ固有。削減効果が小さい |
| プロダクトヒーロー + ミニダッシュボード | 各商品 LP で共通パターン |
| FAQ / 料金表の本文 | コンテンツ資産。JSON 化は編集コスト増。**サービスハブのカード HTML は catalog と二重管理**（追加時は両方更新） |

---

## 5. モバイル・アクセシビリティ

### 5.1 実施した改善

- ドロワー: `aria-expanded`, フォーカストラップ, Escape 閉じる
- タップ領域: 44px 以上（閉じるボタン、フッターナビ、チェックボックス、テキストリンク）
- `word-break: break-all` 削除 → `overflow-wrap: anywhere` のみ（不自然な改行防止）
- 明背景のゴールド文字を `#6d4f08` に（コントラスト）
- `robots.txt` の Sitemap URL を本番ドメインに修正

### 5.2 モバイルで忘れがちな点

```css
@media (max-width: 1100px) {
  .sfl-header-actions { display: none; }  /* PC用CTAが消える */
  .sfl-menu { display: block; }
}
```

**PC でヘッダー CTA があるから body を空にする** — この判断は SP では成立しない。ホームヒーローの主 CTA は SP 向けの保険として機能している。

### 5.3 固定ヘッダー（2026-07-04）

```css
.sfl-header { position: fixed; top: 0; left: 0; right: 0; }
.sfl-page { padding-top: var(--sfl-header-height); overflow-x: hidden; }
:root { --sfl-header-height: 98px; } /* 1320px↓ 92px / 720px↓ 82px */
```

`overflow: hidden` を `.sfl-page` に付けると **子要素の sticky が無効** になる。固定ヘッダーが必要なら `fixed` + 本文オフセットが確実。

---

## 6. コンバージョン監査からの示唆（未着手・継続課題）

ホームページ監査（2026-07-04）でスコア **3.4/5（Needs Work）**。CTA 整理・価格1行で一部は改善済み。残課題:

| 課題 | 状態 | メモ |
|------|------|------|
| 5秒で「何を買うか」が弱い | 要改善 | Cycle Pro / 伴走 / Lark の関係をもっと明示 |
| Social Proof 3.0/5 | 要改善 | 事例数値はあるが、第三者評価・ロゴ不足 |
| Trust & Risk 2.3/5 | 要改善 | 返金・契約・サポート境界の明示 |
| 信頼バッジの重複 | 未共通化 | home / company で同一4件。表記更新漏れリスク |

これらは **CTA を増やす解決策にはしない**。信頼はコピー・構造・実績で足す。

---

## 7. マルチサービス構成・情報設計（2026-07-04 更新）

SFL は **FLOW ONE シリーズ（3商品）** + **Cycle Pro（買い切り）** を提供。URL・ナビ・料金の置き場所を以下に統一した。

### 7.1 URL マップ（現行）

| 役割 | URL | 備考 |
|------|-----|------|
| **サービス一覧（ハブ）** | `/pages/services/` | **3枚カード**（SF ONE / LARK / AI）。SF ONEカードのみ全幅、LARK・AIは2列。**Cycle Proは独立カードを持たない**（2026-07-05 廃止。SF ONEの中核ツールとして本文・FAQから案内） |
| **SALON FLOW ONE LP** | `/pages/salon-flow-one/` | 料金 `#pricing`、導入の流れ `#flow`。FAQ は **別ページ** |
| **LARK FLOW ONE LP** | `/pages/lark-flow-one/` | 料金 `#pricing` |
| **AI FLOW ONE LP** | `/pages/ai-flow-one/` | 料金 `#pricing` |
| **Cycle Pro LP** | `/pages/cycle-pro/` | 機能 `#features`、料金 `#pricing` |
| **よくある質問** | `/pages/faq/` | **独立ページ**（h1「よくある質問」）。主に SF ONE / Cycle Pro 向け |
| **旧 URL（リダイレクト）** | 下表参照 | HTML スタブ + `public/_redirects`（Cloudflare） |

**廃止・集約したもの:**

- `/pages/pricing/` → `salon-flow-one#pricing`（SF ONE 専用だった料金ページの残骸）
- `/pages/flow/` → `salon-flow-one#flow`
- FAQ を SF ONE LP 内 `#faq` に置く案は **却下**（フッター FAQ から商品 LP ヒーローに着く問題）

### 7.2 フッター構成

| グループ | 内容 |
|----------|------|
| **サイト** | ホーム / サービス / 導入事例 / 会社概要 / **よくある質問** → `/pages/faq/` |
| **サービス** | catalog 3商品 + Cycle Pro |
| **お問い合わせ** | 資料ダウンロード / お問い合わせ |

ヘッダー・ドロワーに FAQ は **載せない**（フッター・必要なら各 LP から contact のみ）。

### 7.3 サービス定義の単一ソース

```javascript
// public/assets/js/sfl-services-catalog.js
window.SFL_SERVICES = { catalog: [...], topicExtras: [...] }
```

| 更新箇所 | 触るファイル |
|----------|----------------|
| フッター・ドロワーの FLOW ONE リンク | `sfl-services-catalog.js`（`site-chrome.js` が参照） |
| 問い合わせ topic | 同上 + `sfl-lead-form.js` |
| サービスハブのカード | **`pages/services/index.html` を手動追加**（catalog とは未連動） |
| 商品 LP | `pages/{slug}/index.html` 新規 |
| サイトマップ | `public/sitemap.xml` |

**Cycle Pro は `catalog` ではなく `topicExtras` に定義**（2026-07-05）。FLOW ONE 系の独立商品ではなく SALON FLOW ONE の中核ツールという位置づけのため、ナビ・フッター・サービスハブのカードには出さず、お問い合わせフォームの選択肢としてのみ登場する。

### 7.4 新サービス追加手順

1. `sfl-services-catalog.js` の `catalog` に `{ slug, label, summary }` を追加
2. `public/pages/{slug}/index.html` を新規（`data-active="{slug}"`）
3. `public/pages/services/index.html` にカード1枚追加
4. `sitemap.xml` に URL 追加
5. 料金がある場合は LP 内 `#pricing` セクションを用意

Cycle Pro のように FLOW ONE 外の商品は `topicExtras` に追加し、フッター `relatedProductItems`（`site-chrome.js`）も検討。

### 7.5 リダイレクト一覧（`public/_redirects`）

| 旧パス | 転送先 |
|--------|--------|
| `/pages/features/` | `/pages/cycle-pro/` |
| `/pages/lark/` | `/pages/lark-flow-one/` |
| `/pages/pricing/` | `/pages/salon-flow-one/#pricing` |
| `/pages/flow/` | `/pages/salon-flow-one/#flow` |

**注意:** GitHub Pages プレビューは `_redirects` を読まない。旧 URL は各 `index.html` の meta refresh スタブに依存。Cloudflare 本番は `_redirects` が効く。

### 7.6 リンク設計の禁止パターン（2026-07-04 整理）

本文に **置かない** 例（ナビ・フッター・サービスハブで足りる）:

- 「SALON FLOW ONEの料金・プランを見る」（FAQ 末尾・ホームヒーロー等）
- SF ONE LP 内の「Cycle Proの詳細を見る」（料金セクションに Cycle Pro 掲載済み）
- SF ONE LP ヒーロー下の「よくある質問」「サービス一覧へ」
- 導入の流れ末尾の「よくある質問を見る」

**置いてよい例:**

- 同一 LP 内 `#pricing` / `#flow`（ヒーロー CTA）
- 別商品へのクロスセル（例: SF ONE → LARK FLOW ONE）
- コンバージョン CTA（無料相談）
- ホーム wide-cta（SF ONE 詳細 / サービス一覧 — 回遊専用）

---

## 8. GitHub Pages プレビュー CI（2026-07-04）

本番は Cloudflare Pages。GitHub Pages は **プレビュー用**（`.github/workflows/deploy-github-pages.yml`）。

| 現象 | 対処 |
|------|------|
| `Deployment failed, try again later.` | **GitHub Pages API の一時障害**。コード起因ではない |
| 3回リトライでも失敗 | Actions から **Re-run failed jobs** |
| 連続 push で失敗しやすい | `cancel-in-progress: false` に変更済み（進行中デプロイを殺さない） |
| リトライ強化 | 5回・待機 60/90/120/180 秒 |

`punycode` DeprecationWarning は無視してよい。

---

## 9. 余白・フォーム UX（簡易メモ）

- モバイル縦スクロール削減のため section padding を desktop 80px / mobile 48px 付近に調整。
- フォーム placeholder を全フィールドに追加（電話だけ例示、は不十分だった）。
- select は「選択してください」+ `required` + JS 側でも未選択チェック。

---

## 10. 変更時の作業手順

1. 対象ページをローカル表示: `python3 -m http.server 8123 --directory public`
2. 確認: ルート `index.html`、ネストページ1つ、直接編集ページ。390px + デスクトップ。
3. リンク・アセット: `npm run check`
4. CTA を触ったら **§3.4 チェックリスト** を再確認
5. コンポーネントを触ったら、依存スクリプトの読み込み順を確認

---

## 11. 関連ファイル早見表

```
public/assets/js/sfl-services-catalog.js … FLOW ONE 定義（フッター・フォーム topic）
public/assets/js/site-chrome.js           … ヘッダー / ドロワー / フッター
public/assets/js/sfl-lead-form.js       … リードフォーム HTML 生成
public/assets/js/contact-form.js        … フォーム送信・バリデーション
public/assets/js/sfl-wide-cta.js        … wide-cta（現状ホームのみ使用）
public/assets/js/sfl-motion.js            … ホームFVのエントランス演出・スクロールreveal
public/assets/css/sfl.css                 … レイアウト・CTA・サービスカードgrid
public/assets/images/hero-salon-devices.jpg … ホームFVの実写真（mask-imageで縁を背景に溶け込ませる）
public/_redirects                         … Cloudflare 本番リダイレクト
public/pages/services/index.html          … サービスハブ（3カード、Cycle Proは独立カードなし）
public/pages/salon-flow-one/index.html    … SF ONE LP（料金・導入の流れ）
public/pages/faq/index.html               … FAQ 独立ページ
public/pages/home/index.html              … CTA 設計の参照実装
public/pages/contact/index.html           … フォームページの参照実装
.github/workflows/deploy-github-pages.yml … プレビューデプロイ（リトライ付き）
```

---

## 12. 用語

| 用語 | 意味 |
|------|------|
| **SALON FLOW ONE** | 美容サロン向け**月額伴走**（Cycle Proを中核ツールに、Lark・専門家チームを組み合わせ） |
| **LARK FLOW ONE** | Lark・Base 伴走（月額100,000円/税別）。サロン以外も対象 |
| **AI FLOW ONE** | 企業向け AI 顧問（月額150,000円/税別、初月100,000円） |
| **Cycle Pro** | SALON FLOW ONEの中核ツール（買い切り初期構築、80,000円/税別〜）。サービス一覧ハブに独立カードは持たず、SF ONE・FAQからの導線でのみ案内 |
| Standard / Core / Custom **プラン** | SALON FLOW ONE の月額プラン名。英語のみ（Standard 等）にしない |
| 主 CTA | ゴールドボタン。通常「お問い合わせ / 無料相談」 |
| 副 CTA | アウトライン。「資料ダウンロード」 |
| wide-cta | 本文内の横長2ボタンブロック（`.sfl-wide-cta`） |
| 回遊 CTA | コンバージョンではなく、別ページへ進むボタン（サービス、事例など） |

### 商品名の階層（サイト表記ルール）

```
合同会社SFL / SALON FLOW LAB.  … 法人・ブランド
├── SALON FLOW ONE            … 美容サロン月額伴走（表に出す中核）
│   ├── Cycle Pro               … 中核ツール（買い切り初期構築。単独ではサービス一覧ハブに掲載しない）
│   ├── Lark                    … 情報共有・連携
│   └── 専門家チーム
│       ├── Standardプラン  100,000円/月（税別）
│       ├── Coreプラン      150,000円/月（税別）← おすすめ
│       └── Customプラン    要相談
├── LARK FLOW ONE               … Lark 伴走（別商品 LP）
└── AI FLOW ONE                 … AI 顧問（別商品 LP）
```

- ヒーロー・料金では **商品名（FLOW ONE / Cycle Pro）** を先に、構成要素は LP 内で説明
- `<title>` の suffix は `| SFL / SALON FLOW LAB.` に統一
- 内部実装（Lark 通知など）をユーザー向け文言に出さない
- **サイト共通「よくある質問」** は `/pages/faq/` のみ。商品 LP に FAQ セクションを復活させない

---

## 13. ヒーロービジュアル — CSSモックから実写真へ（2026-07-05）

### 13.1 起きていた問題

ホームFVの右カラムは完全CSS製（ノートPC筐体・conic-gradient円グラフ・KPIカウントアップ）で、フォトリアルな「サロンの背景 × 実機の質感」を再現できずにいた。リファレンス画像（サロン内観 + ダッシュボード画面のノートPC/タブレット合成）に寄せたい依頼に対し、CSSだけでの再現は現実的ではなかった。

### 13.2 採用した解決策

| 項目 | 内容 |
|------|------|
| 素材 | 提供画像の右側（機材 + サロン背景。コピー文字が写り込んでいない範囲）をクロップしJPEGで書き出し。`public/assets/images/hero-salon-devices.jpg` |
| 境界処理 | `mask-image`（`linear-gradient` 2枚 + `mask-composite: intersect`）で四辺をフェードさせ、クリーム背景 `#F8F5EF` に溶け込ませる。枠・影は付けない |
| フロート | 「公式LINEと連携可能」バッジのみ残し、「電子同意書」「顧客カルテ」は削除（h1本文で言及済みのため重複解消） |
| 削除した死にコード | CSSラップトップ筐体一式・ダッシュボード疑似UI・KPIカウントアップ（`sfl-motion.js`）・`.sfl-float.doc`/`.karte` のループアニメーション keyframes。他LP（cycle-pro 等）が使う汎用 `.sfl-dashboard*` は温存 |

### 13.3 見出し拡大時に踏んだ罠（再発防止）

- 見出し（`.sfl-hero h1`）のフォントサイズを大きくした際、`word-break: keep-all` + `overflow-wrap: normal` の組み合わせで、列幅に収まらない行が **折り返さずそのまま画像側へオーバーフロー** した。`h1.scrollWidth > h1.clientWidth` で検知できる。
- **列幅・フォントサイズ・改行方式（word-break / overflow-wrap）は3点セットで確認する。** どれか1つだけ変えると、日本語の長いフレーズが「1単語」扱いされて不可視の overflow を起こしやすい。
- 見出しに `<br>` で改行位置を明示する場合も同様に、各セグメントが列幅に収まるか `scrollWidth` / `clientWidth` で確認してから確定する。

### 13.4 チェックリスト

- [ ] ヒーロー見出し・列比率・フォントサイズを変更したら、`h1.scrollWidth > h1.clientWidth` で overflow がないか確認する
- [ ] 実写真をヒーローに使う場合、`mask-image` の境界（上下左右）が矩形の切れ目に見えないか実機スクリーンショットで確認する
- [ ] CSSモックを実画像に置き換えたら、対応する JS（カウントアップ・ループ等）と CSS keyframes を一緒に削除する（死にコード化を防ぐ）

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-04 | 初版。モバイル a11y、ホーム CTA、フォーム/wide-cta 共通化、CTA 重複整理までを反映 |
| 2026-07-04 | 料金カード・ホーム事例の CTA 整理、fixed ヘッダー、チェックリスト追記を反映 |
| 2026-07-04 | SALON FLOW ONE を表向け中核サービスとして全ページ表記を統一 |
| 2026-07-04 | フッターを3グループ化。「機能」ページを Cycle Pro へ統合 |
| 2026-07-04 | services を SALON FLOW ONE 商品ページ化、Lark 統合、コラムをナビ非公開 |
| 2026-07-04 | 導入の流れ・FAQ を料金ページに統合、フッター項目を整理 |
| 2026-07-04 | 料金・導入の流れを SF ONE LP に集約（`#pricing` / `#flow`）。Cycle Pro 料金は `cycle-pro#pricing` |
| 2026-07-04 | サービスハブ 2×2 + Cycle Pro カード。FAQ 独立ページ復活、冗長テキストリンク削除 |
| 2026-07-04 | GitHub Pages CI リトライ強化（5回・cancel-in-progress 無効化） |
| 2026-07-05 | ホームFVを実写真+マスクブレンドに置き換え、CSSダッシュボードモック・KPIカウントアップ・float.doc/karte を廃止（§13） |
| 2026-07-05 | SALON FLOW ONE と Cycle Pro の関係を「中核ツール」として整理。サービス一覧から Cycle Pro カードを削除（3枚構成に） |
| 2026-07-05 | 「資料請求」の表記を「資料ダウンロード」に統一（ヘッダー・フッター・wide-cta・フォーム） |
