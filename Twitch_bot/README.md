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

### バッチファイルで起動（Windows）

`start_bot.bat` を作成:
```batch
@echo off
node main.js
pause
```

### PM2を使った起動

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

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| `!ai` `!claude` | Claude APIで質問に回答。キャラクター設定も可能 | `!ai JavaScriptとは？`<br>`!ai [ピカチュウ] おなかすいた` |
| `!j` | 日本語・英語辞書検索（Jisho API） | `!j 勉強`<br>`!j study` |
| `!usd` | USD ⇔ JPY 通貨換算 | `!usd 100`<br>`!usd` |
| `!yen` | JPY ⇔ USD 通貨換算 | `!yen 15000` |
| `!gbp` | GBP ⇔ JPY 通貨換算 | `!gbp 50` |
| `!w` | 都市の天気と気温を取得 | `!w Tokyo`<br>`!w London` |
| `!time` | 世界各国の現在時刻を表示 | `!time Japan`<br>`!time PST` |
| `!v` | 投票開始（3分間、1〜10の数字で投票） | `!v` |
| `!vend` | 投票終了（モデレーター/配信者のみ） | `!vend` |
| `!update` | Jisho検索履歴をGoogle Sheetsに保存 | `!update` |

### コマンド詳細

#### 🤖 AI機能 (`!ai` / `!claude`)
- **機能**: Claude APIを使用した質問応答
- **特殊機能**: `[キャラクター名]` でキャラクター設定可能
- **文字数制限**: 日本語120文字、英語150文字

#### 📖 辞書機能 (`!j`)
- **機能**: 日本語・英語両対応の辞書検索
- **特徴**: ローマ字からひらがなへ自動変換、検索履歴を記録

#### 💱 通貨換算 (`!usd` / `!yen` / `!gbp`)
- **機能**: リアルタイム為替レートで通貨換算
- **対応**: USD、JPY、GBP

#### 🌤️ 天気情報 (`!w`)
- **機能**: 指定都市の天気と気温を取得
- **注意**: OpenWeather API キーが必要

#### 🕐 時刻情報 (`!time`)
- **機能**: 世界各国の現在時刻を表示
- **対応地域**: 日本、アメリカ、イギリス、カナダ、オーストラリアなど多数

#### 🗳️ 投票システム (`!v` / `!vend`)
- **機能**: 視聴者投票（1〜10の数字）
- **投票期間**: 3分間（自動終了）または手動終了
- **権限**: `!vend` はモデレーター/配信者のみ使用可能

#### 📊 データ管理 (`!update`)
- **機能**: Jisho検索履歴をGoogle Sheetsに保存
- **注意**: Google Sheets API の設定が必要

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
