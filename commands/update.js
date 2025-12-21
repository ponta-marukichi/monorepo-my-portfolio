// ===== commands/update.js =====
import { writeToGoogleSheets } from '../utils/googleSheets.js';

// jishoコマンドから履歴データにアクセスするためのインポート
let jishoCommand = null;

export default {
  name: 'update',
  description: 'Google Sheetsに単語履歴を更新します',
  usage: '!update',
  
  // jishoコマンドの参照を設定するメソッド
  setJishoCommand(jisho) {
    jishoCommand = jisho;
  },
  
  async execute(client, channel, tags, message, args, commands) {
    // commandsマップからjishoコマンドを取得
    const jisho = commands?.get('j') || jishoCommand;
    
    if (!jisho) {
      client.say(channel, 'jisho コマンドが見つかりません。');
      return;
    }

    const wordSearchHistory = jisho.getWordHistory();
    
    if (Object.keys(wordSearchHistory).length === 0) {
      client.say(channel, '記録する単語がありません。');
      return;
    }

    try {
      // Google Sheets用のデータ形式に変換
      const sheetData = [];
      
      for (const [searchTerm, data] of Object.entries(wordSearchHistory)) {
        // A列: 調べた語句（検索語）
        const queryTerm = data.originalQuery || searchTerm;
        
        // B列: 出力された複数の単語（meanings配列を文字列で結合）
        const outputWords = Array.isArray(data.meanings) 
          ? data.meanings.join(', ') 
          : data.meanings || '';
        
        // C列: 品詞情報
        const partsOfSpeech = data.partsOfSpeech || '';
        
        // D列: 参照回数
        const referenceCount = data.count || 0;
        
        // E列: 最新検索日時
        const lastSearched = data.lastSearched || '';
        
        sheetData.push({
          searchTerm: queryTerm,
          outputWords: outputWords,
          partsOfSpeech: partsOfSpeech,
          count: referenceCount,
          lastSearched: lastSearched
        });
      }
      
      const result = await writeToGoogleSheets(sheetData);
      client.say(channel, `スプレッドシートを更新しました！更新: ${result.updated}件, 新規追加: ${result.added}件`);
      
      // 履歴をクリア
      jisho.clearWordHistory();
    } catch (error) {
      console.error('スプレッドシート更新エラー:', error);
      client.say(channel, 'スプレッドシートの更新に失敗しました。');
    }
  }
};