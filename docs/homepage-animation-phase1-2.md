# ホームページ アニメーション詳細設計 — Phase 1〜2

> **対象:** `public/pages/home/index.html`（第1弾）。下層ページ展開は Phase 2 完了後。  
> **方針:** 依存ライブラリなし（CSS + `Intersection Observer` + 小さな `sfl-motion.js`）。  
> **関連:** [homepage-improvement-learnings.md](./homepage-improvement-learnings.md)  
> **最終更新:** 2026-07-05（ヒーロー右カラムを実写真に置き換え。§3.2/3.3/3.4/3.5/§4 に廃止注記を追加）  
> **ステータス:** 実装済み（ホーム Phase 1–2）。**2026-07-05 差分:** 右カラムの CSS ダッシュボードモック（`salon-photo` / `device-stage`）を実写真 `.sfl-hero-photo`（`data-sfl-enter="device"`）1枚に統合。float は `.notice`（LINEバッジ）のみ運用し、`.doc`（電子同意書）/ `.karte`（顧客カルテ）と KPI カウントアップは廃止。左カラム（§3.1）・スクロール reveal（§6）・hover（§5）は変更なし。詳細は各節の「※2026-07-05」注記を参照。

---

## 0. 設計原則

| 原則 | 内容 |
|------|------|
| CTA 優先 | ヒーロー左カラムは **CTA・価格行を視覚的に最後まで最優先**。右ビジュアルは従 |
| 1ブロック1回 | スクロール reveal は **セクション単位**。子要素のスタッガーは最大4段 |
| 控えめ | FV の **同時 transition enter** は最大6（§10 参照）。**infinite animation** は float のみ最大3 |
| a11y | `prefers-reduced-motion: reduce` で **enter アニメを無効化**（最終状態を即表示） |
| 性能 | `transform` / `opacity` のみ。`filter: blur()` は **PC のみ**（≤720px は off） |

---

## 1. デザイントークン（easing / duration）

### 1.1 CSS カスタムプロパティ（`sfl.css` 先頭付近に追加予定）

```css
:root {
  /* Easing */
  --sfl-ease-out: cubic-bezier(0.22, 1, 0.36, 1);      /* 標準の登場 */
  --sfl-ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);   /* ループ・双方向 */
  --sfl-ease-snap: cubic-bezier(0.16, 1, 0.3, 1);      /* 見出し・キレ */
  --sfl-ease-hover: cubic-bezier(0.25, 0.8, 0.25, 1); /* hover */

  /* Duration */
  --sfl-dur-xs: 180ms;
  --sfl-dur-sm: 320ms;
  --sfl-dur-md: 520ms;
  --sfl-dur-lg: 720ms;
  --sfl-dur-xl: 900ms;

  /* Scroll reveal — desktop default */
  --sfl-reveal-y: 28px;
  --sfl-reveal-blur: 6px;
}

/* タブレット: 721〜1100px */
@media (max-width: 1100px) {
  :root {
    --sfl-reveal-y: 22px;
  }
}

/* モバイル: ≤720px */
@media (max-width: 720px) {
  :root {
    --sfl-reveal-y: 18px;
    --sfl-reveal-blur: 0;   /* 低スペック端末の paint 負荷回避 */
  }
}
```

### 1.2 Easing 使い分け

| トークン | 用途 |
|----------|------|
| `--sfl-ease-out` | フェードイン・上昇の **終わり**（自然な減速） |
| `--sfl-ease-snap` | ヒーロー h1、セクション見出し（短くシャープ） |
| `--sfl-ease-in-out` | float ループ、hover 復帰 |
| `--sfl-ease-hover` | ボタン hover の transform / shadow |

---

## 2. 実装アーキテクチャ（設計のみ）

### 2.1 ファイル構成（予定）

```
public/assets/js/sfl-motion.js   … IO + クラス付与 + ヒーロー初期化
public/assets/css/sfl.css        … トークン + keyframes + reveal 初期状態
```

### 2.2 HTML / data 属性

| 属性 | 付与先 | 役割 |
|------|--------|------|
| `id="sfl-hero"` | `<section class="sfl-hero">` | アンカー・CSS フック（**JS の主セレクタは下記 `data-sfl-hero` と同一要素**） |
| `data-sfl-hero` | 同上（`id` と **同一要素に両方**） | ヒーロー load シーケンスのルート |
| `data-sfl-enter` | ヒーロー内の enter 対象 | load 時フェードイン対象 |
| `data-sfl-enter-delay="120"` | 同上（任意） | ms 単位 delay（HTML で上書き） |
| `data-sfl-reveal` | **IO observe 対象**（必須） | スクロール reveal の監視対象 |
| `data-sfl-reveal-group="proof"` | `data-sfl-reveal` と **同一要素** | スタッガー子のグループ ID（observe 用ではない） |
| `data-sfl-stagger=".sfl-proof"` | グループ親と同一要素 | スタッガー対象の子セレクタ |
| `data-sfl-float` | `.sfl-float` 各要素 | float ループ対象 |
| `data-sfl-reveal-mobile` | `.sfl-hero-sub` | **≤720px のみ** scroll reveal（§6.0.3）。**`data-sfl-reveal` は付けない** |

**`.sfl-hero-sub` の属性（確定）:**

| ビューポート | HTML に付与 | JS 初期化 |
|-------------|------------|-----------|
| 全幅（静的 HTML） | `data-sfl-enter` + `data-sfl-reveal-mobile` | — |
| PC / タブレット | 上記のまま | `data-sfl-enter` で load enter（§3.1 / §3.5）。`data-sfl-reveal-mobile` の CSS は `@media (max-width:720px)` 外のため **非表示にならない** |
| モバイル | 上記のまま | `prepareHeroSubForViewport()` が **`data-sfl-enter` を除去**し、scroll reveal（`data-sfl-reveal-mobile`）のみ有効化 |

**禁止:** `data-sfl-reveal` を hero-sub に付与。`data-sfl-reveal-mobile` のみを付ける、という意味ではない（PC では `data-sfl-enter` も必要）。

### 2.3 状態クラス（JS が付与）

| クラス | 付与先 | 意味 |
|--------|--------|------|
| `html.sfl-motion-ready` | `<html>` | JS 初期化完了。**非表示初期状態の CSS はこれ以下にのみスコープ** |
| `.sfl-is-visible` | 各アニメ対象 | enter / reveal 完了 |
| `.sfl-hero-played` | `[data-sfl-hero]` | ヒーロー load シーケンス開始 |
| `.sfl-no-motion` | `<html>` | `prefers-reduced-motion` 時 |

### 2.4 Intersection Observer

詳細は **§6.0** を参照。observe セレクタは **`[data-sfl-reveal]`**（常時）と **`[data-sfl-reveal-mobile]`**（≤720px 初期化時のみ）の 2 系統（§2.6）。

### 2.5 表示契約（Progressive Enhancement / no-JS フォールバック）

**原則:** JS 未読込・例外・CSP 事故時も **コンテンツは常に表示**する。非表示初期状態は `html.sfl-motion-ready` 付与後にのみ有効。

**初期化は `try/catch` 1 ブロックにまとめる。** `sfl-motion-ready` の付与も try 内の先頭とし、以降の処理で例外が出たら **必ずフォールバック**する（§2.5.1）。

```javascript
function showAllMotionTargets(root = document) {
  root.querySelectorAll('[data-sfl-enter], [data-sfl-reveal], [data-sfl-reveal-mobile]')
    .forEach((el) => el.classList.add('sfl-is-visible'));
}

function abortMotionInit() {
  document.documentElement.classList.remove('sfl-motion-ready');
  document.documentElement.classList.add('sfl-no-motion');
  showAllMotionTargets();
}

function initSflMotion() {
  try {
    document.documentElement.classList.add('sfl-motion-ready');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('sfl-no-motion');
      showAllMotionTargets();
      return;
    }

    prepareHeroSubForViewport(); // §6.0.3 — モバイル時 sub の enter 除外
    registerRevealObservers();
    startHeroSequence();
  } catch (err) {
    abortMotionInit();
    console.error('[sfl-motion]', err);
  }
}

document.addEventListener('DOMContentLoaded', initSflMotion);
```

```css
/* --- ヒーロー load enter（§3） --- */
html.sfl-motion-ready [data-sfl-hero]:not(.sfl-hero-played) [data-sfl-enter] {
  opacity: 0;
  transform: translateY(var(--sfl-enter-y, 16px));
}

html.sfl-motion-ready [data-sfl-hero].sfl-hero-played [data-sfl-enter].sfl-is-visible,
html.sfl-no-motion [data-sfl-enter],
html.sfl-no-motion [data-sfl-reveal],
html.sfl-no-motion [data-sfl-reveal-mobile] {
  opacity: 1;
  transform: none;
  filter: none;
}

/* --- scroll reveal（§6） --- */
html.sfl-motion-ready [data-sfl-reveal]:not(.sfl-is-visible) {
  opacity: 0;
  transform: translateY(var(--sfl-reveal-y));
  filter: blur(var(--sfl-reveal-blur));
}

@media (max-width: 720px) {
  html.sfl-motion-ready [data-sfl-reveal-mobile]:not(.sfl-is-visible) {
    opacity: 0;
    transform: translateY(16px);
  }
}
```

| 状態 | 表示 |
|------|------|
| JS なし | 通常表示（上記 CSS はマッチしない） |
| `sfl-motion-ready` 後・正常 init | enter / reveal 対象のみ一時非表示 → 順次 visible |
| init **成功前**に例外 | `abortMotionInit()` → `sfl-motion-ready` 除去 + 全文即表示 |
| `prefers-reduced-motion` | `sfl-no-motion` + 全文即表示 |

### 2.5.1 init 失敗フォールバック（必須）

| 項目 | 契約 |
|------|------|
| トリガー | `initSflMotion` の `try` 内で **任意の例外** |
| 処理 | `abortMotionInit()` を **必ず 1 回**呼ぶ |
| `abortMotionInit` | ① `sfl-motion-ready` を `<html>` から除去 ② `sfl-no-motion` 付与 ③ `[data-sfl-enter]`, `[data-sfl-reveal]`, `[data-sfl-reveal-mobile]` すべてに `.sfl-is-visible` |
| 禁止 | 例外後に `sfl-motion-ready` だけが残り、非表示 CSS が有効なままになること |
| 検証 | §11.3「init 例外シミュレーション」 |

### 2.6 IO observe 契約（属性の組み合わせ）

**observe セレクタ:**

| 条件 | セレクタ |
|------|----------|
| 常時 | `document.querySelectorAll('[data-sfl-reveal]')` |
| モバイル初期化時のみ | `document.querySelectorAll('[data-sfl-reveal-mobile]')` |

`data-sfl-reveal-group` 単独では observe しない。グループ化スタッガーでは **親にも `data-sfl-reveal` が必須**。

| パターン | 親要素の属性例 | observe | IO 発火時の JS 動作 |
|----------|---------------|---------|---------------------|
| **A. 単体ブロック** | `data-sfl-reveal` | 自身 | 自身に `.sfl-is-visible` |
| **B. スタッガー親** | `data-sfl-reveal` + `data-sfl-reveal-group="proof"` + `data-sfl-stagger=".sfl-proof"` | 親 | 親に `.sfl-is-visible`、子 `.sfl-proof` に index 別 `transition-delay` |
| **C. 見出しブロック** | `.sfl-section-head[data-sfl-reveal]` | 自身 | 自身 + 内側 `.sfl-en` / `h2` / `p` に子 delay（JS または CSS） |
| **D. wide-cta** | 生成 `.sfl-wide-cta[data-sfl-reveal]` | 自身 | §6.3.3 |
| **E. hero-sub（SP）** | `.sfl-hero-sub[data-sfl-reveal-mobile]` | 自身（**≤720px 時のみ JS が observe 登録**） | §6.0.3 |

**HTML 例（proof）:**

```html
<div class="sfl-proof-row"
     data-sfl-reveal
     data-sfl-reveal-group="proof"
     data-sfl-stagger=".sfl-proof">
  <div class="sfl-proof">…</div>
  …
</div>
```

**HTML 例（ヒーロー）:**

```html
<section class="sfl-hero" id="sfl-hero" data-sfl-hero>
  <p class="sfl-hero-kicker" data-sfl-enter>…</p>
  <h1 data-sfl-enter>…</h1>
  …
  <p class="sfl-hero-sub"
     data-sfl-enter
     data-sfl-reveal-mobile>…</p>
  <!-- 両属性を静的 HTML に付与。モバイルのみ JS が data-sfl-enter を除去（§2.2） -->
</section>
```

### 2.7 スクリプト読込順（ホーム）

```html
<script src="../../assets/js/site-chrome.js"></script>
<script src="../../assets/js/sfl-wide-cta.js"></script>  <!-- wide-cta DOM 生成 -->
<script src="../../assets/js/sfl-motion.js"></script>     <!-- IO 登録・hero 開始 -->
```

`sfl-motion.js` は **wide-cta 生成後**に実行し、`.sfl-wide-cta[data-sfl-reveal]` を observe 対象に含める。

---

## 3. Phase 1 — ヒーロー段階フェードイン

**トリガー:** `DOMContentLoaded` → `html.sfl-motion-ready` 付与 → 120ms 後に `[data-sfl-hero]` に `.sfl-hero-played` を付与。  
**JS セレクタ:** `document.querySelector('[data-sfl-hero]')`（= `#sfl-hero` と同一要素）。
**合計尺（表示完了）:** PC **980ms**（copy）・**1720ms**（float 含む） / タブレット **890ms**（copy）・**1630ms**（float 含む） / モバイル **800ms**（§3.4 参照）。  
**float enter 開始ルール:** copy 列 H7（meta）完了 **+120ms** 以降（PC: **1100ms**〜）。§0 の FV 同時 transition 上限を守るため、CTA 帯と float enter を重ねない。
**ビューポート別 ms 表:** §3.1 が PC 基準。§3.4（モバイル）・§3.5（タブレット）に絶対値を記載。

### 3.1 左カラム（`.sfl-hero-copy`）— PC 基準（≥1101px）

| # | 要素 | delay | duration | easing | 初期状態 → 終了状態 |
|---|------|------:|---------:|--------|---------------------|
| H1 | `.sfl-hero-kicker` | 0ms | 420ms | `--sfl-ease-out` | opacity 0 → 1, translateY(16px) → 0 |
| H2 | `.sfl-hero h1` | 80ms | 560ms | `--sfl-ease-snap` | opacity 0 → 1, translateY(24px) → 0 |
| H3 | `.sfl-hero-lead` | 200ms | 480ms | `--sfl-ease-out` | opacity 0 → 1, translateY(20px) → 0 |
| H4 | `.sfl-hero-sub` | 320ms | 420ms | `--sfl-ease-out` | opacity 0 → 1, translateY(16px) → 0 ※SP: skip |
| H5 | `.sfl-hero-actions` | 420ms | 480ms | `--sfl-ease-snap` | opacity 0 → 1, translateY(12px) → 0, scale(0.98) → 1 |
| H6 | `.sfl-hero-pricing` | 520ms | 400ms | `--sfl-ease-out` | opacity 0 → 1, translateY(10px) → 0 |
| H7 | `.sfl-hero-meta` | 600ms | 380ms | `--sfl-ease-out` | opacity 0 → 1, translateY(8px) → 0 |

**blur（PC のみ）:** H2・H3 のみ `filter: blur(6px) → blur(0)` を **280ms** 同期。**≤720px および reduce 時は blur なし。**

### 3.2 右カラム（`.sfl-hero-visual`）— PC 基準（≥1101px）

> **※2026-07-05 更新:** `.sfl-salon-photo`（V1）と `.sfl-device-stage`（V2）は実写真 `.sfl-hero-photo`（`data-sfl-enter="device"`）1枚に統合され、V2 のタイミング（280ms / 640ms / snap）のみが残っている。`.sfl-float.doc`（V4）・`.sfl-float.karte`（V5）は要素ごと削除。以下の表は当時の設計意図を残すための履歴として保持する。

| # | 要素 | delay | duration | easing | 初期状態 → 終了状態 |
|---|------|------:|---------:|--------|---------------------|
| V1 | ~~`.sfl-salon-photo`~~ **廃止（2026-07-05）** | ~~160ms~~ | ~~720ms~~ | ~~`--sfl-ease-out`~~ | opacity 0 → 0.58（既存 opacity 維持）, scale(1.04) → 1 |
| V2 | `.sfl-hero-photo`（旧 `.sfl-device-stage`） | 280ms | 640ms | `--sfl-ease-snap` | opacity 0 → 1, translateY(32px) → 0, scale(0.96) → 1 |
| V3 | `.sfl-float.notice` | 1100ms | 420ms | `--sfl-ease-out` | opacity 0 → 1, translateY(12px) → 0 |
| V4 | ~~`.sfl-float.doc`~~ **廃止（2026-07-05）** | ~~1200ms~~ | ~~420ms~~ | ~~`--sfl-ease-out`~~ | 同上 |
| V5 | ~~`.sfl-float.karte`~~ **廃止（2026-07-05）** | ~~1300ms~~ | ~~420ms~~ | ~~`--sfl-ease-out`~~ | 同上 |

**float 開始:** H7 meta 完了（980ms）+ **120ms** 後。CTA 帯（420〜980ms）と **重複しない**。現行は `.notice`（LINEバッジ）のみが float 対象。

**モバイル:** §3.4 参照。float（V3）は **720px 以下で非表示**（既存 CSS `display:none`）のため **アニメ対象外**。

**CSS 整理:** HTML は `.sfl-float.notice` が正式。`sfl.css` の `.sfl-float.line` は未使用のため削除済み（2026-07-05）。

### 3.3 ヒーロータイムライン（視覚）— PC

> **※2026-07-05 更新:** 実際のタイムラインは `salon-photo` 行が無く、`device-stage` は `hero-photo`（実写真）に、`float.doc`/`float.karte` は無い。現行版を下に、当時の設計図を参考として残す。

**現行（2026-07-05〜）:**

```
0ms     kicker ────────────────────▶ 420ms
80ms         h1 ──────────────────────────▶ 640ms
200ms                   lead ──────────────────▶ 680ms
280ms                        hero-photo ────────────────▶ 920ms
420ms                             CTA ──────────────▶ 900ms
520ms                                  pricing ────────▶ 920ms
600ms                                       meta ──────▶ 980ms
1100ms                                         float.notice ──▶ 1520ms
```

**旧版（〜2026-07-04・参考）:**

```
0ms     kicker ────────────────────▶ 420ms
80ms         h1 ──────────────────────────▶ 640ms
160ms              salon-photo ─────────────────────▶ 880ms
200ms                   lead ──────────────────▶ 680ms
280ms                        device-stage ────────────────▶ 920ms
420ms                             CTA ──────────────▶ 900ms
520ms                                  pricing ────────▶ 920ms
600ms                                       meta ──────▶ 980ms
1100ms                                         float.notice ──▶ 1520ms
1200ms                                              float.doc ──▶ 1620ms
1300ms                                                   float.karte ──▶ 1720ms
```

### 3.4 左・右カラム — モバイル（≤720px）

**係数:** delay × **0.7**（duration は PC と同値）。**H4 sub は load enter 対象外** → §6.0.3。

#### 左カラム

| # | 要素 | delay | duration | easing | 完了時刻 | 備考 |
|---|------|------:|---------:|--------|--------:|------|
| H1 | `.sfl-hero-kicker` | 0ms | 420ms | ease-out | 420ms | |
| H2 | `.sfl-hero h1` | 56ms | 560ms | snap | 616ms | blur なし |
| H3 | `.sfl-hero-lead` | 140ms | 480ms | ease-out | 620ms | blur なし |
| H4 | `.sfl-hero-sub` | — | — | — | — | **§6.0.3 scroll reveal** |
| H5 | `.sfl-hero-actions` | **294ms** | 480ms | snap | **774ms** | **主 CTA。FV 優先** |
| H6 | `.sfl-hero-pricing` | 364ms | 400ms | ease-out | 764ms | |
| H7 | `.sfl-hero-meta` | 420ms | 380ms | ease-out | 800ms | |

#### 右カラム（1 列レイアウトで copy の下）

> **※2026-07-05 更新:** V1（salon-photo）は廃止。V2 は実写真 `.sfl-hero-photo` として同タイミングのまま残る。

| # | 要素 | delay | duration | easing | 完了時刻 |
|---|------|------:|---------:|--------|--------:|
| V1 | ~~`.sfl-salon-photo`~~ **廃止（2026-07-05）** | ~~100ms~~ | ~~720ms~~ | ~~ease-out~~ | ~~820ms~~ |
| V2 | `.sfl-hero-photo`（旧 `.sfl-device-stage`） | 200ms | 640ms | snap | 840ms |

**モバイル FV 注意:** 390px 幅では h1 + lead + CTA で **約 480〜560px** を占有。CTA は **294ms 開始**で 774ms までに完全表示。初回 viewport 外に CTA が落ちる端末では **レイアウト問題**（アニメでは解決不可）— 実機 390px で要確認。

### 3.5 左・右カラム — タブレット（721〜1100px）

**係数:** delay × **0.85**（duration は PC と同値）。H4 sub は **load enter 継続**（PC 同様）。

#### 左カラム

| # | 要素 | delay | duration | easing | 完了時刻 |
|---|------|------:|---------:|--------|--------:|
| H1 | `.sfl-hero-kicker` | 0ms | 420ms | ease-out | 420ms |
| H2 | `.sfl-hero h1` | 68ms | 560ms | snap | 628ms |
| H3 | `.sfl-hero-lead` | 170ms | 480ms | ease-out | 650ms |
| H4 | `.sfl-hero-sub` | 272ms | 420ms | ease-out | 692ms |
| H5 | `.sfl-hero-actions` | 357ms | 480ms | snap | 837ms |
| H6 | `.sfl-hero-pricing` | 442ms | 400ms | ease-out | 842ms |
| H7 | `.sfl-hero-meta` | 510ms | 380ms | ease-out | 890ms |

#### 右カラム

> **※2026-07-05 更新:** V1 は廃止、V2 は実写真として残存。V4/V5（float.doc/karte）は要素ごと削除。

| # | 要素 | delay | duration | easing | 完了時刻 |
|---|------|------:|---------:|--------|--------:|
| V1 | ~~`.sfl-salon-photo`~~ **廃止（2026-07-05）** | ~~136ms~~ | ~~720ms~~ | ~~ease-out~~ | ~~856ms~~ |
| V2 | `.sfl-hero-photo`（旧 `.sfl-device-stage`） | 238ms | 640ms | snap | 878ms |
| V3 | `.sfl-float.notice` | 1010ms | 420ms | ease-out | 1430ms |
| V4 | ~~`.sfl-float.doc`~~ **廃止（2026-07-05）** | ~~1110ms~~ | ~~420ms~~ | ~~ease-out~~ | ~~1530ms~~ |
| V5 | ~~`.sfl-float.karte`~~ **廃止（2026-07-05）** | ~~1210ms~~ | ~~420ms~~ | ~~ease-out~~ | ~~1630ms~~ |

**float 開始:** タブレット H7 完了（890ms）+ **120ms** 後（PC と同ルール）。

**float ループ:** タブレットでは **enter のみ**（§4 参照）。1 列ヒーローで float が dashboard と重なり、微動が UI の視認性を下げるため。

### 3.6 ビューポート段階の早見表

| 段階 | 幅 | ヒーロー ms 表 | float enter | float ループ | hero-sub |
|------|-----|---------------|-------------|-------------|----------|
| PC | ≥1101px | §3.1〜3.2 | ○ | ○ | load enter |
| タブレット | 721〜1100px | §3.5 | ○ | **×** | load enter |
| モバイル | ≤720px | §3.4 | ×（非表示） | × | **scroll reveal** |

---

## 4. Phase 1 — float 微細ループ

### 4.1 ビューポート別の float 扱い

| 幅 | CSS 表示 | enter（§3.2 / §3.5） | ループ（§4.2） |
|----|----------|---------------------|----------------|
| ≥1101px | 表示 | ○ | ○ |
| 721〜1100px | 表示 | ○ | **×（enter のみ）** |
| ≤720px | `display:none` | × | × |

**721〜1100px でループ off の理由:** 1 列レイアウトで float が dashboard 上に重なり、微動が数値 UI の読み取りを妨げる。タブレットは enter で十分。

### 4.2 ループ spec（≥1101px かつ reduce 以外）

> **※2026-07-05 更新:** `.doc`/`.karte` の float 要素は削除済み。対応する `@keyframes sfl-float-drift-doc`/`-karte` も `sfl.css` から削除した。ループ対象は `.notice` のみ。

**対象:** `.sfl-float.notice`（旧: `.doc` / `.karte` は廃止）
**開始:** 該当 float の enter 完了 + **400ms** 後に `.sfl-float-active` 付与

| 要素 |  motion | duration | easing | 振幅 | 備考 |
|------|---------|----------|--------|------|------|
| `.notice` | translateY | 3600ms | ease-in-out | 0 → -6px → 0 | ループ infinite |
| ~~`.doc`~~ | ~~translateY~~ | ~~4200ms~~ | ~~ease-in-out~~ | ~~0 → -5px → 0~~ | **廃止（2026-07-05）** |
| ~~`.karte`~~ | ~~translateY~~ | ~~3900ms~~ | ~~ease-in-out~~ | ~~0 → -7px → 0~~ | **廃止（2026-07-05）** |

**追加（任意）:** `box-shadow` を 3600ms で `0 14px 42px …` ↔ `0 18px 48px …` に **±8%** 変化。負荷が気になる場合は省略。

---

## 5. Phase 1 — hover マイクロインタラクション

すべて **`@media (hover: hover) and (pointer: fine)`** 内でのみ有効。タップ端末では active のみ。

### 5.1 ボタン

| セレクタ | プロパティ | duration | easing | hover 値 |
|----------|-----------|----------|--------|----------|
| `.sfl-btn-gold` | transform | 220ms | `--sfl-ease-hover` | translateY(-2px) |
| `.sfl-btn-gold` | box-shadow | 220ms | `--sfl-ease-hover` | `0 16px 40px rgba(201,154,26,.28)` |
| `.sfl-btn-dark` | transform + shadow | 220ms | 同上 | translateY(-2px), navy shadow 強調 |
| `.sfl-btn` | transform | 180ms | `--sfl-ease-hover` | `:active` scale(0.98) |

**斜め色スライダー（gold / dark）:** `::before` 擬似要素、scaleX(0→1) **320ms** `--sfl-ease-out`、origin left。hover 時に文字色 `#fff` 維持。  
**禁止:** 呼吸（scale ループ）エフェクト。

### 5.2 テキストリンク

| セレクタ | 効果 | duration | easing |
|----------|------|----------|--------|
| `.sfl-text-link` | 下線 scaleX 0→1（既存 border-bottom または ::after） | 280ms | `--sfl-ease-out` |
| `.sfl-nav a::after` | 現状 200ms → **280ms** に統一 | 280ms | `--sfl-ease-out` |

### 5.3 カード

| セレクタ | プロパティ | duration | easing | hover 値 |
|----------|-----------|----------|--------|----------|
| `.sfl-card` | transform | 260ms | `--sfl-ease-hover` | translateY(-4px) |
| `.sfl-card` | box-shadow | 260ms | `--sfl-ease-hover` | shadow 1段階強 |
| `.sfl-card` | border-color | 260ms | ease | gold 22% → 40% |
| `.sfl-benefit-grid article` | 同上 | 260ms | 同上 | 同上 |
| `.sfl-proof` | transform | 240ms | `--sfl-ease-hover` | translateY(-2px)（控えめ） |

**画像 grayscale:** ホームに実写真カードは少ないため **Phase 1 では見送り**。事例ページ展開時に `.sfl-post-img` 等へ適用。

---

## 6. Phase 2 — スクロール reveal

### 6.0 Intersection Observer（ビューポート別）

```javascript
// sfl-motion.js — 初期化時に 1 回だけ判定
function getRevealObserverOptions() {
  const mobile = window.matchMedia('(max-width: 720px)').matches;
  const tablet = window.matchMedia('(max-width: 1100px)').matches;

  if (mobile) {
    return { root: null, rootMargin: '-4% 0px -6% 0px', threshold: 0.12 };
  }
  if (tablet) {
    return { root: null, rootMargin: '-6% 0px -8% 0px', threshold: 0.14 };
  }
  return { root: null, rootMargin: '-8% 0px -10% 0px', threshold: 0.15 };
}
```

| 段階 | rootMargin | threshold | 意図 |
|------|------------|----------:|------|
| PC（≥1101px） | `-8% 0 -10% 0` | 0.15 | 早すぎない発火 |
| タブレット（721〜1100px） | `-6% 0 -8% 0` | 0.14 | 縦短 viewport 向け調整 |
| モバイル（≤720px） | `-4% 0 -6% 0` | 0.12 | 小画面で reveal が見える位置で発火 |

**共通:** `once: true`。同一 `data-sfl-reveal-group` は親 1 要素のみ observe。

### 6.0.1 reveal トークン（CSS）

§1.1 のメディアクエリで `--sfl-reveal-y` / `--sfl-reveal-blur` を切替。JS 側の変更は不要。

| 段階 | `--sfl-reveal-y` | `--sfl-reveal-blur` |
|------|-----------------|---------------------|
| PC | 28px | 6px |
| タブレット | 22px | 6px |
| モバイル | 18px | **0** |

**共通:** `once: true`。observe 対象は §2.6 の 2 系統。

### 6.0.2 共通 reveal 式（reduce 以外）

§2.5 の `html.sfl-motion-ready` スコープ付き CSS を使用。以下は終了状態の transition 定義。

```css
html.sfl-motion-ready [data-sfl-reveal].sfl-is-visible {
  opacity: 1;
  transform: none;
  filter: none;
  transition:
    opacity var(--sfl-dur-md) var(--sfl-ease-out),
    transform var(--sfl-dur-md) var(--sfl-ease-out),
    filter var(--sfl-dur-sm) var(--sfl-ease-out);
}

/* モバイル専用 hero-sub — PC/タブレットではマッチしない */
@media (max-width: 720px) {
  html.sfl-motion-ready [data-sfl-reveal-mobile]:not(.sfl-is-visible) {
    opacity: 0;
    transform: translateY(16px);
  }
}
```

### 6.0.3 モバイル専用 — `.sfl-hero-sub` scroll reveal

**適用条件:** `max-width: 720px` のみ。PC / タブレットは §3.1 / §3.5 の load enter（`data-sfl-enter`）を使用。

| 項目 | 値 |
|------|-----|
| 静的 HTML | `data-sfl-enter` + `data-sfl-reveal-mobile` を付与。**`data-sfl-reveal` は付けない** |
| PC / タブレット | `data-sfl-enter` で load enter（§3.1 / §3.5） |
| モバイル | `prepareHeroSubForViewport()` が **`data-sfl-enter` を除去** → scroll reveal のみ |
| IO 登録 | モバイル判定時のみ `[data-sfl-reveal-mobile]` を observe |
| delay | **0ms** |
| duration | **420ms** |
| easing | `--sfl-ease-out` |
| blur | **なし** |

**発火タイミング（CTA 優先）:**

```javascript
// prepareHeroSubForViewport() — try 内、hero 開始前（§2.5）
function prepareHeroSubForViewport() {
  const sub = document.querySelector('.sfl-hero-sub[data-sfl-reveal-mobile]');
  if (!sub || !window.matchMedia('(max-width: 720px)').matches) return;
  sub.removeAttribute('data-sfl-enter');
}

// hero-sub reveal — モバイルのみ
const heroCtaEndMs = 294 + 480; // 774ms（§3.4 H5）
const subRevealAt = Math.max(intersectionTimestamp, heroStartMs + heroCtaEndMs + 100);
// heroStartMs = DOMContentLoaded 後 120ms（§3 トリガー）
// → 最早 894ms 以降に .sfl-is-visible を付与
```

CTA アニメ完了前に IO が発火しても **894ms まで sub の reveal を保留**する。CTA の視認性を優先。

**レイアウト:** sub は DOM 上 CTA の**前**にあるが `opacity: 0` でスペースは確保。CTA 位置は変わらない。

---

### 6.1 信頼バッジ（`.sfl-proof-row`）

| 項目 | 値 |
|------|-----|
| グループ | 親 `.sfl-proof-row` に **`data-sfl-reveal`** + `data-sfl-reveal-group="proof"` + `data-sfl-stagger=".sfl-proof"` |
| observe | **親 `.sfl-proof-row`**（§2.6 パターン B） |
| 子スタッガー | `.sfl-proof` ×4 |
| 子 delay（PC / タブレット） | 0 / 80 / 160 / 240 ms |
| 子 delay（**モバイル** 2 列 grid） | **0 / 60 / 120 / 180 ms** |
| 子 duration | 480ms |
| 子 easing | `--sfl-ease-out` |
| 初期 | translateY(20px), opacity 0 |

---

### 6.2 ベネフィット（`.sfl-benefit-grid`）

| 項目 | 値 |
|------|-----|
| グループ ID | `benefit` |
| 親属性 | `.sfl-benefit-grid` に `data-sfl-reveal` + `data-sfl-reveal-group="benefit"` + `data-sfl-stagger="article"` |
| observe | **`.sfl-benefit-grid`** |
| スタッガー delay | 0 / 100 / 200 ms |
| duration | 520ms |
| easing | `--sfl-ease-out` |
| 追加 | `span`（01〜03）のみ scale(0.92)→1 を **400ms** `--sfl-ease-snap` で同期 |

---

### 6.3 サービス（`.sfl-section` Services）

**6.3.1 見出し（`.sfl-section-head`）**

`.sfl-section-head` に **`data-sfl-reveal`** を付与し observe（§2.6 パターン C）。

| 要素 | delay | duration | easing | 動き |
|------|------:|---------:|--------|------|
| `.sfl-en` | 0 | 400ms | ease-out | opacity + translateY(12px) |
| `h2` | 60ms | 520ms | snap | opacity + translateY(20px) |
| `p` | 120ms | 480ms | ease-out | opacity + translateY(16px) |
| `::after` ライン | 200ms | **640ms** | `--sfl-ease-out` | **width 0 → 180px**（既存グラデーション線を animate） |

**6.3.2 カードグリッド**

| 項目 | 値 |
|------|-----|
| 親属性 | `.sfl-card-grid` に `data-sfl-reveal` + `data-sfl-reveal-group="services-cards"` + `data-sfl-stagger=".sfl-card"` |
| observe | **`.sfl-card-grid`**（見出し `.sfl-section-head` とは **別 IO**） |
| 対象 | `.sfl-card` ×3 |
| delay（PC / タブレット 2 列） | 0 / 90 / 180 ms（見出し完了 **+120ms** 後に IO 発火） |
| delay（**モバイル** 1 列） | **0 / 80 / 160 ms** |
| duration | 520ms |
| easing | `--sfl-ease-out` |

**6.3.3 wide-cta**

現行 `sfl-wide-cta.js` は `mount.outerHTML = …` でマウント要素を置換するため、**マウント div に `data-sfl-reveal` を残す方式は不可**。

**採用方針（推奨）:** `sfl-wide-cta.js` の `renderCta` が生成する `.sfl-wide-cta` ルートに `data-sfl-reveal` を付与する。

```javascript
// sfl-wide-cta.js — 実装時変更
const renderCta = (config) => ''
  + '<div class="sfl-wide-cta" data-sfl-reveal>'
  + …
  + '</div>';
```

| 項目 | 値 |
|------|-----|
| 対象 | 生成後の `.sfl-wide-cta[data-sfl-reveal]` |
| observe | 自身（§2.6 パターン D） |
| タイミング | `sfl-wide-cta.js` 実行後、`sfl-motion.js` が observe 登録 |
| delay | 0（カード grid の IO とは独立） |
| duration | 560ms |
| easing | `--sfl-ease-out` |
| 動き | translateY(24px) → 0 |

**代替案（非推奨）:** `outerHTML` をやめ `replaceWith` + 属性引き継ぎ — 差分が大きいため Phase 1 では見送り。

---

### 6.4 Cycle Pro ストリップ（`.sfl-section.soft`）

| 要素 | 属性 / observe | delay | duration | easing / 動き |
|------|---------------|------:|---------:|----------------|
| `.sfl-section-head` | `data-sfl-reveal` | 0〜200ms（内側子） | 400〜520ms | 同上パターン |
| `.sfl-feature-strip` | `data-sfl-reveal` on strip | 120ms | 560ms | ease-out, opacity + translateY(16px) |
| strip 内 `div` ×6 | 親 `.sfl-is-visible` 後 | 0/50/100/150/200/250ms | 420ms | opacity のみ |

**グリッド:** 1100px 以下は 3 列、720px 以下は **1 列**（既存 CSS）。いずれも opacity スタッガーのみでレイアウト崩れなし。

---

### 6.5 事例（`.sfl-case`）

**左カラム（`.sfl-section-head` left align）:** 見出しパターン同様。`::after` は **left align のため margin-left:0; width 0→120px**。

| ブロック | 親属性 / observe | delay 基準 | duration |
|----------|-----------------|-----------|----------|
| `.sfl-case-kpis` | `data-sfl-reveal` + `data-sfl-reveal-group="case-kpis"` + `data-sfl-stagger=".sfl-kpi"` | 0 | 480ms |
| 各 `.sfl-kpi` ×5 | 親 observe | 0/70/140/210/280ms | 450ms, `--sfl-ease-snap` |
| `.sfl-before-after` | `data-sfl-reveal` + `data-sfl-reveal-group="case-ba"` | 独立 IO | 520ms |
| Before / After 各列 | `data-sfl-stagger="> div"` | 0 / 120ms | 480ms |

**KPI カウントアップ:** Phase 3 予定のため **Phase 2 では reveal のみ**（数値は最初から表示）。

---

## 7. Phase 2 — 見出しアンダーライン伸長（詳細）

現状 `.sfl-section-head::after` は常時 `width:180px` 表示。

**変更設計（`html.sfl-motion-ready` スコープ）:**

```css
html.sfl-motion-ready .sfl-section-head::after {
  width: 0;
  transition: width var(--sfl-dur-lg) var(--sfl-ease-out);
}
html.sfl-motion-ready .sfl-section-head.sfl-is-visible::after {
  width: 180px;
}
/* JS なし: 既存 CSS の width:180px がそのまま効く */
```

| バリエーション | width 終値 | duration | delay |
|----------------|------------|----------|------:|
| 中央揃え（Services, Cycle Pro） | 180px | 640ms | 見出し h2 の +140ms |
| 左揃え（Case Study） | 120px | 560ms | 同上 |
| `.sfl-page-title`（下層展開時） | 140px | 600ms | 将来 |

---

## 8. `prefers-reduced-motion` 仕様

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  [data-sfl-reveal],
  [data-sfl-enter],
  [data-sfl-reveal-mobile] {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
  .sfl-section-head::after {
    width: 180px !important; /* 左揃えは 120px */
  }
}
```

JS 側: `window.matchMedia('(prefers-reduced-motion: reduce)')` が true なら IO をスキップし、`showAllMotionTargets()`（§2.5）で **`[data-sfl-enter]`, `[data-sfl-reveal]`, `[data-sfl-reveal-mobile]`** すべてに即 `.sfl-is-visible` を付与し `html.sfl-no-motion` を付与。

---

## 9. ブレークポイント別サマリ

| 条件 | Phase 1 | Phase 2 |
|------|---------|---------|
| **≥1101px（PC）** | §3.1〜3.2、float ループ ○ | IO §6.0 PC、reveal Y 28px |
| **721〜1100px（タブレット）** | §3.5、float enter ○ / ループ × | IO §6.0 tablet、reveal Y 22px |
| **≤720px（モバイル）** | §3.4、sub → §6.0.3、float × | IO §6.0 mobile、reveal Y 18px / blur 0 |
| **hover なし端末** | hover 系無効、`:active` のみ | 同左 |

### 9.1 既存 CSS グリッドとの対応（ホーム）

| 要素 | PC | 721〜1100px | ≤720px |
|------|-----|-------------|--------|
| `.sfl-hero-grid` | 2 列 | 1 列 | 1 列 |
| `.sfl-proof-row` | 4 列 | 4 列 | **2 列** |
| `.sfl-card-grid` | 3 列 | 2 列 | 1 列 |
| `.sfl-feature-strip` | 6 列 | 3 列 | **1 列** |
| `.sfl-case-kpis` | — | 2 列 | 2 列 |
| `.sfl-float` | 表示 | 表示 | 非表示 |

スタッガー delay は §6.1（proof）・§6.3.2（card）のビューポート別値を使用。

---

## 10. パフォーマンス予算

### 10.1 同時アニメーション上限の定義

| 種別 | 上限 | 計測対象 |
|------|------|----------|
| **transition enter**（FV） | **≤6 要素** | `opacity` / `transform` が同時に変化中の `[data-sfl-enter]` |
| **transition enter**（scroll 1 ブロック） | **≤5 要素** | 同一 `data-sfl-reveal-group` 内のスタッガー子 |
| **CSS animation（infinite）** | **≤3 要素** | `.sfl-float-active` の `@keyframes` ループのみ |
| **hover transition** | 上限外 | ユーザー操作時のみ |

**PC ヒーロー同時 transition のピーク（520〜920ms）:** hero-photo（旧 device-stage）・CTA・pricing・meta の **最大 4 要素**が重なる（§0 上限 6 以内。旧 salon-photo は 2026-07-05 に廃止しさらに余裕ができた）。**float enter は 1100ms 以降**のため CTA 帯と重ならない。820ms 付近に float が載る旧タイムラインは廃止（§3.2）。

**720ms 時点の transition 中:** hero-photo（280ms 開始）・CTA（420ms）・pricing（520ms 開始）・lead 残り ≒ **3〜4 要素**（旧 salon 160ms は廃止）。

| 項目 | 上限目安 |
|------|----------|
| `sfl-motion.js` サイズ | **≤3KB** minified |
| 追加 CSS | **≤4KB** |
| LCP 要素（h1 / 主 CTA） | enter 開始 **≤500ms** 以内に可視（モバイル CTA **294ms**） |
| IO 監視数 | **≤9** `observe`（wide-cta + hero-sub mobile 含む） |

計測: 実装後 Lighthouse（mobile）で LCP / INP 悪化 **≤5%** 以内。超えたら blur 削除・スタッガー短縮。

---

## 11. 実装チェックリスト

### 11.1 基盤

- [ ] `sfl-motion.js` 作成、`home/index.html` のみ読み込み（§2.7 順序）
- [ ] `initSflMotion` を **try/catch 1 ブロック**で実装（§2.5）。例外時 `abortMotionInit()`
- [ ] 非表示 CSS は **`html.sfl-motion-ready` スコープ**（§2.5）。JS 無効時に表示されること
- [ ] `<section class="sfl-hero" id="sfl-hero" data-sfl-hero>` — id と data を **同一要素**に付与
- [ ] ヒーロー子要素に `data-sfl-enter` 付与
- [ ] `.sfl-hero-sub` に **`data-sfl-enter` + `data-sfl-reveal-mobile`**（`data-sfl-reveal` は付けない — §2.2）
- [ ] モバイル: `prepareHeroSubForViewport()` で sub の `data-sfl-enter` を除去（§6.0.3）
- [ ] 各 reveal ブロック: **`data-sfl-reveal` 必須** + 必要なら group / stagger（§2.6）
- [ ] `getRevealObserverOptions()` で 3 段 rootMargin を切替
- [ ] reduce: `showAllMotionTargets()` + `html.sfl-no-motion`（**reveal-mobile 含む** — §8）

### 11.2 連携・既存 CSS

- [ ] **`sfl-wide-cta.js`:** 生成 `.sfl-wide-cta` に `data-sfl-reveal` 付与（§6.3.3）
- [ ] **`sfl.css`:** `.sfl-float.line` 未使用なら削除し `.sfl-float.notice` に統一
- [ ] **`sfl.css`:** `.sfl-section-head::after` の width 0 化は `html.sfl-motion-ready` スコープ（§7）
- [ ] モバイル: `--sfl-reveal-blur: 0`、ヒーロー enter blur 無効
- [ ] タブレット: float ループ off（enter のみ）

### 11.3 検証

- [ ] JS 無効（DevTools block script）: 全文表示・opacity 0 要素なし
- [ ] init 例外シミュレーション: `registerRevealObservers` 内で `throw` → 全文表示に復帰（§2.5.1）
- [ ] reduce（OS 設定）: hero-sub（`data-sfl-reveal-mobile`）含め全文即表示
- [ ] 390px 実機: CTA 894ms 以内完全表示・1.5s 以内タップ可能
- [ ] 721px / 1101px 境界: ms 表どおり
- [ ] キーボード Tab: アニメ中でもフォーカス可能（`visibility:hidden` / `pointer-events:none` 禁止）
- [ ] `npm run check` 通過

---

## 12. Phase 3 以降（参考・今回スコープ外）

| 項目 | 理由 |
|------|------|
| ~~KPI カウントアップ（ヒーローダッシュボード）~~ | Phase 2 reveal 完了後に実装したが、2026-07-05 のヒーロー実写真化でダッシュボードDOM自体を廃止したため **再度撤去**（§13 は learnings 参照）。ダッシュボードモックを復活させる場合のみ再実装候補 |
| ダッシュボード chart アニメ | 対象の CSS ダッシュボードが廃止済みのため **見送り**（同上） |
| 下層 `sfl-page-title` reveal | ホーム検証後に横展開 |

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-04 | 初版。Phase 1〜2 の ms / easing / IO 仕様を確定 |
| 2026-07-04 | PC / タブレット / モバイル 3 段 ms 表、IO 別設定、hero-sub reveal、float ループ BP 明確化 |
| 2026-07-04 | レビュー反映: no-JS フォールバック、IO 属性契約、wide-cta 生成方針、hero-sub mobile 属性、同時アニメ定義 |
| 2026-07-04 | 再レビュー反映: init 失敗フォールバック、reveal-mobile reduce 対応、hero-sub 属性契約統一、float enter 1100ms 以降へ移動 |
| 2026-07-05 | ヒーロー右カラムを実写真1枚（`.sfl-hero-photo`）に統合。`salon-photo`/`device-stage`/`float.doc`/`float.karte`/KPIカウントアップを廃止し §3.2〜3.5・§4・§10・§12 に廃止注記を追加。左カラム（§3.1）・reveal（§6）・hover（§5）は変更なし |
