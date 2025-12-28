# Twitch_bot

TwitchチャットでAI機能や各種便利機能を提供するボットです。Claude API、辞書検索、通貨換算、天気情報、投票システムなど、多彩な機能を備えています。

## 目次
- [必要な環境](#必要な環境)
- [インストール](#インストール)
- [環境変数の設定](#環境変数の設定)
- [実行方法](#実行方法)
- [コマンド一覧](#コマンド一覧)
- [使用例](#使用例)

## 必要な環境

- **Node.js**: v18.0.0 以上推奨
- **npm**: v8.0.0 以上推奨
- **Twitchアカウント**: ボット用のアカウントが必要
- **APIキー**: 各種機能に応じて以下のAPIキーが必要
  - [Anthropic API Key](https://console.anthropic.com/) (AI機能用)
  - [OpenWeather API Key](https://openweathermap.org/api) (天気機能用 - オプション)

## インストール

### 1. リポジトリのクローン

```bash
git clone https://github.com/ponta-marukichi/monorepo-my-portfolio.git
cd monorepo-my-portfolio
```

### 2. 依存関係のインストール

```bash
npm install
```

必要なパッケージ:
- `tmi.js` - Twitch Messaging Interface
- `dotenv` - 環境変数管理
- `node-fetch` - HTTP リクエスト
- `unofficial-jisho-api` - 日本語辞書API

### 3. package.json がない場合

以下のコマンドで `package.json` を作成してください:

```bash
npm init -y
npm install tmi.js dotenv node-fetch unofficial-jisho-api
```

`package.json` に以下を追加:

```json
{
  "type": "module",
  "scripts": {
    "start": "node main.js"
  }
}
```

## 環境変数の設定

### 1. .env ファイルの作成

`.env.example` をコピーして `.env` ファイルを作成します:

```bash
cp .env.example .env
```

### 2. 環境変数の設定

`.env` ファイルを編集して、以下の値を設定します:

```env
# Twitch Bot Configuration
TWITCH_USERNAME=あなたのボットのTwitchユーザー名
TWITCH_OAUTH_TOKEN=oauth:あなたのOAuthトークン
TWITCH_CHANNEL=接続先のチャンネル名

# Anthropic API Configuration
# 以下のURLでAPIキーを取得してください: https://console.anthropic.com/
ANTHROPIC_API_KEY=あなたのAnthropicAPIキー

# OpenWeather API Configuration (オプション)
OPENWEATHER_API_KEY=あなたのOpenWeatherAPIキー
```

### Twitch OAuth トークンの取得方法

1. [Twitch Chat OAuth Token Generator](https://twitchapps.com/tmi/) にアクセス
2. ボット用アカウントでログイン
3. 生成されたトークンをコピー（`oauth:` プレフィックス付き）
4. `.env` ファイルの `TWITCH_OAUTH_TOKEN` に貼り付け

## 実行方法

### 通常起動

```bash
node main.js
```

または

```bash
npm start
```

### バックグラウンド起動（Linux/Mac）

```bash
nohup node main.js > bot.log 2>&1 &
```

### PM2を使った起動（推奨）

```bash
# PM2のインストール
npm install -g pm2

# ボット起動
pm2 start main.js --name twitch-bot

# ログ確認
pm2 logs twitch-bot

# ボット停止
pm2 stop twitch-bot

# ボット再起動
pm2 restart twitch-bot
```

## コマンド一覧

### 🤖 AI機能

#### `!ai` / `!AI` / `!claude`
Claude APIを使用した質問応答機能

**使い方:**
```
!ai [質問内容]
```

**特殊機能 - キャラクター設定:**
```
!ai [キャラクター名] [質問内容]
```

**例:**
```
!ai こんにちは！今日の天気はどう？
!ai [ピカチュウ] おなかすいた
!claude JavaScriptの非同期処理について教えて
```

**機能:**
- 日本語の質問には120文字以内、英語の質問には150文字以内で回答
- `[キャラクター名]` 形式でキャラクター設定が可能
- カジュアルで親しみやすい口調で返答

---

### 📖 辞書機能

#### `!j`
Jisho APIを使用した日本語・英語辞書検索

**使い方:**
```
!j [単語]
```

**例:**
```
!j 勉強
!j study
!j sakura
```

**機能:**
- 日本語・英語両方の検索に対応
- ローマ字からひらがなへの自動変換
- 複数の意味を表示
- 検索履歴を記録（Google Sheets連携用）

---

### 💱 通貨換算

#### `!usd` / `!yen` / `!gbp`
リアルタイム為替レートで通貨換算

**使い方:**
```
!usd [金額]
!yen [金額]
!gbp [金額]
```

**例:**
```
!usd 100    # 100ドルは何円？
!yen 15000  # 15000円は何ドル？
!gbp 50     # 50ポンドは何円？
!usd        # 現在の1ドルのレート
```

**機能:**
- USD（米ドル）⇔ JPY（日本円）
- GBP（英ポンド）⇔ JPY（日本円）
- リアルタイムレート取得

---

### 🌤️ 天気情報

#### `!w`
指定した都市の天気と気温を取得

**使い方:**
```
!w [都市名]
```

**例:**
```
!w Tokyo
!w London
!w New York
```

**注意:** OpenWeather API キーが必要です

---

### 🕐 時刻情報

#### `!time`
世界各国の現在時刻を表示

**使い方:**
```
!time [国名または都市名]
```

**例:**
```
!time Japan
!time 日本
!time UK
!time New York
!time PST
```

**対応国・地域:**
- 日本（Japan, 日本）
- アメリカ（USA, America - 複数タイムゾーン対応）
- イギリス（UK, Britain）
- カナダ（Canada - 複数タイムゾーン対応）
- オーストラリア（Australia - 複数タイムゾーン対応）
- その他多数の国に対応

---

### 🗳️ 投票システム

#### `!v` - 投票開始
投票セッションを開始

**使い方:**
```
!v
```

**機能:**
- 3分間の投票期間
- 各ユーザー1回のみ投票可能
- 1〜10の数字で投票

#### `!vend` - 投票終了
投票を手動で終了（モデレーター/配信者のみ）

**使い方:**
```
!vend
```

**投票方法（視聴者側）:**
投票開始後、チャットに1〜10の数字を入力するだけ
```
5
```

**結果表示:**
- 参加者数
- 合計スコア
- 平均スコア

---

### 📊 データ管理

#### `!update`
Jisho検索履歴をGoogle Sheetsに保存

**使い方:**
```
!update
```

**機能:**
- 調べた単語
- 出力された意味
- 品詞情報
- 検索回数
- 最終検索日時

**注意:** Google Sheets API の設定が必要です

---

## 使用例

### 実際のチャットでの使用例

```
配信者: 今日の配信テーマは「JavaScriptの基礎」です！

視聴者A: !ai JavaScriptって何？
Bot: @視聴者A JavaScriptは、Webページに動きをつけるプログラミング言語だよ！ブラウザ上で動いて、ボタンを押したら反応したり、アニメーションを作ったりできるんだ。初心者でも始めやすくて、Web開発には欠かせない存在だよ！

視聴者B: !j 変数
Bot: @視聴者B 変数 (へんすう) - variable: データを一時的に保存する箱のようなもの。プログラミングで値を記憶しておくために使います。

視聴者C: !time PST
Bot: @視聴者C 🕐 アメリカ太平洋時間 (PST): 2025年12月28日 午前8時30分

配信者: それでは今から視聴者の皆さんに配信の満足度を投票してもらいます！
配信者: !v
Bot: Voting has started! Please submit a number from 1 to 10 within 3 minutes...

視聴者D: 9
Bot: @視聴者D の投票 (9) を受け付けました！/ Your vote has been accepted.

視聴者E: 10
Bot: @視聴者E の投票 (10) を受け付けました！/ Your vote has been accepted.

配信者: !vend
Bot: Voting is now closed./ 投票を終了します。
Bot: 投票結果(Voting results): 参加者数(Number of participants): 2人(voters), 合計(total): 19, 平均(average): 9.50
```

### キャラクター機能の使用例

```
視聴者: !ai [海賊] お腹すいた
Bot: @視聴者 ほう、腹が減ったか！ならば船の厨房で肉を焼いて食うがいい！海の男は飯をしっかり食わねば戦えんぞ！ガハハハ！

視聴者: !ai [関西人] 今日暑いなあ
Bot: @視聴者 ほんまやなあ！めっちゃ暑いわ〜。こんな日はクーラーガンガンにして冷たいもん飲むのが一番やで！アイス食べたなるわ〜。
```

## トラブルシューティング

### ボットが起動しない場合

1. **環境変数の確認**
   ```bash
   cat .env
   ```
   すべての必要な値が設定されているか確認

2. **OAuth トークンの確認**
   - `oauth:` プレフィックスが付いているか
   - トークンの有効期限が切れていないか

3. **依存関係の再インストール**
   ```bash
   rm -rf node_modules
   npm install
   ```

### コマンドが反応しない場合

- コマンドは必ず `!` で始まる
- コマンド名は小文字・大文字どちらでも可
- スペースの入れ方を確認

### AI機能が動かない場合

- `ANTHROPIC_API_KEY` が正しく設定されているか確認
- APIキーの使用制限に達していないか確認
- [Anthropic Console](https://console.anthropic.com/) でキーの状態を確認

## ライセンス

このプロジェクトは個人使用を目的としています。

## 作者

ponta-marukichi

## サポート

問題が発生した場合は、GitHubのIssuesでお知らせください。
