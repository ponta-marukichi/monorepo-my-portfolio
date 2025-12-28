// ===== utils/googleSheets.js =====
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function writeToGoogleSheets(sheetData) {
  try {
    // A:E列の既存データを取得（E列まで拡張）
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:E',
    });

    const rows = existingData.data.values || [];
    
    // ヘッダー行がない場合は追加
    if (rows.length === 0 || !rows[0] || rows[0][0] !== '単語') {
      const headerRow = ['単語', '意味', '品詞', '参照回数', '最新検索日時'];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A1:E1',
        valueInputOption: 'RAW',
        resource: {
          values: [headerRow]
        }
      });
      console.log('ヘッダー行を追加しました');
    }
    
    const existingWords = new Map();
    
    // 既存データのマップを作成（A列の検索語をキーとする）
    rows.forEach((row, index) => {
      if (index > 0 && row[0]) { // ヘッダー行をスキップ
        existingWords.set(row[0], index + 1);
      }
    });

    const updates = [];
    const newRows = [];

    // sheetDataは配列形式で受け取る
    for (const data of sheetData) {
      const existingRowIndex = existingWords.get(data.searchTerm);
      
      if (existingRowIndex) {
        // 既存行の更新
        const currentCount = parseInt(rows[existingRowIndex - 1][3] || '0'); // D列（参照回数）
        const newCount = currentCount + data.count;
        
        // B列: 出力された単語を更新
        updates.push({
          range: `B${existingRowIndex}`,
          values: [[data.outputWords]]
        });
        
        // C列: 品詞を更新
        updates.push({
          range: `C${existingRowIndex}`,
          values: [[data.partsOfSpeech]]
        });
        
        // D列: 参照回数を更新
        updates.push({
          range: `D${existingRowIndex}`,
          values: [[newCount]]
        });
        
        // E列: 最新検索日時を更新
        updates.push({
          range: `E${existingRowIndex}`,
          values: [[data.lastSearched]]
        });
      } else {
        // 新規行の追加
        newRows.push([
          data.searchTerm,    // A列: 検索語
          data.outputWords,   // B列: 出力された単語
          data.partsOfSpeech, // C列: 品詞
          data.count,         // D列: 参照回数
          data.lastSearched   // E列: 最新検索日時
        ]);
      }
    }

    // 既存行の更新
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
    }

    // 新規行の追加
    if (newRows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A:E', // E列まで拡張
        valueInputOption: 'RAW',
        resource: {
          values: newRows
        }
      });
    }

    return { updated: updates.length / 4, added: newRows.length }; // 1行あたり4つの更新（B,C,D,E列）
  } catch (error) {
    console.error('Google Sheets書き込みエラー:', error);
    throw error;
  }
}