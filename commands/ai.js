// ===== commands/ai.js =====
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .envファイルを読み込む簡易関数
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../.env');
    console.log('環境変数ファイルパス:', envPath);
    
    if (!fs.existsSync(envPath)) {
      console.error('.envファイルが見つかりません:', envPath);
      return {};
    }
    
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          env[key.trim()] = values.join('=').trim();
        }
      }
    });
    
    console.log('環境変数読み込み完了。APIキーの有無:', !!env.ANTHROPIC_API_KEY);
    return env;
  } catch (error) {
    console.error('環境変数ファイルの読み込みエラー:', error);
    return {};
  }
}

const env = loadEnv();
const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;

// キャラクター設定を保持（Bot終了まで有効）
let currentCharacter = null;

// 日本語かどうかを簡易判定
function isJapanese(text) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}

export default {
  name: 'ai',
  aliases: ['AI', 'claude'],
  description: 'ClaudeのAPIを使って質問に答えます',
  
  async execute(client, channel, tags, message, args) {
    console.log('=== AIコマンド実行開始 ===');
    console.log('ユーザー:', tags.username);
    console.log('引数:', args);
    
    // APIキーチェック
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === '') {
      console.error('ANTHROPIC_API_KEYが設定されていません');
      client.say(channel, '@' + tags.username + ' ボットの設定エラーです。管理者に連絡してください。');
      return;
    }
    
    if (!args || args.trim() === '') {
      client.say(channel, '@' + tags.username + ' 質問を入力してください。例: !AI こんにちは');
      return;
    }

    // キャラクター設定のチェック - [キャラクター名] 形式のみ認識
    let question = args.trim();
    let characterInstruction = '';
    let isCharacterSetting = false;
    
    // [キャラクター名] の形式でキャラクター指定をチェック
    const characterMatch = args.match(/^\[(.+?)\]\s+(.+)$/);
    if (characterMatch) {
      currentCharacter = characterMatch[1];
      question = characterMatch[2];
      isCharacterSetting = true;
      console.log('新しいキャラクター設定:', currentCharacter);
      client.say(channel, `@${tags.username} わかりました！これから「${currentCharacter}」として話しますね！`);
    }
    
    // キャラクター設定がある場合のみ適用（[character]形式で設定された時のみ）
    if (currentCharacter && isCharacterSetting) {
      characterInstruction = `あなたは「${currentCharacter}」というキャラクターです。このキャラクターの口調や性格を完璧に演じて答えてください。`;
      console.log('適用中のキャラクター:', currentCharacter);
    }

    const isJapaneseQuestion = isJapanese(question);
    
    // 文字数制限
    const charLimit = isJapaneseQuestion ? 120 : 150;
    
    console.log('質問:', question);
    console.log('言語:', isJapaneseQuestion ? '日本語' : '英語');
    console.log('文字数制限:', charLimit);
    
    try {
      console.log('Claude APIにリクエスト送信中...');
      
      const requestBody = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `${characterInstruction}${characterInstruction ? '\n\n' : ''}以下の質問に答えてください。${isJapaneseQuestion ? '日本語で120文字' : '英語で150文字'}以内で簡潔に答えてください。Twitchチャットでの返信なので、カジュアルで親しみやすい口調で答えてください。\n\n質問: ${question}`
        }]
      };
      
      console.log('リクエストボディ:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('APIレスポンスステータス:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('APIエラーレスポンス:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('APIレスポンス:', JSON.stringify(data, null, 2));
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('予期しないAPIレスポンス形式');
      }
      
      let answer = data.content[0].text;
      console.log('元の回答:', answer);
      console.log('回答の文字数:', answer.length);
      
      // 文字数制限を適用
      if (answer.length > charLimit) {
        answer = answer.substring(0, charLimit - 3) + '...';
        console.log('制限後の回答:', answer);
      }
      
      const finalMessage = `@${tags.username} ${answer}`;
      console.log('最終メッセージ:', finalMessage);
      
      client.say(channel, finalMessage);
      console.log('=== AIコマンド実行完了 ===');
      
    } catch (error) {
      console.error('=== エラー発生 ===');
      console.error('エラーの種類:', error.name);
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
      
      let errorMsg = 'ごめんなさい、エラーが発生しました。';
      
      if (error.message.includes('fetch')) {
        errorMsg = 'ネットワークエラーです。接続を確認してください。';
      } else if (error.message.includes('401')) {
        errorMsg = 'APIキーが無効です。管理者に連絡してください。';
      } else if (error.message.includes('429')) {
        errorMsg = 'リクエストが多すぎます。少し待ってから試してください。';
      }
      
      client.say(channel, '@' + tags.username + ' ' + errorMsg);
    }
  }
};