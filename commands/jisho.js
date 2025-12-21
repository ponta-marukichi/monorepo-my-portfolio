// ===== commands/jisho.js =====
import JishoAPI from 'unofficial-jisho-api';
import { writeToGoogleSheets } from '../utils/googleSheets.js';

const jishoApi = new JishoAPI();
let wordSearchHistory = {};

// ローマ字をひらがなに変換するマッピング
const romajiToHiragana = {
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  'ha': 'は', 'hi': 'ひ', 'hu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を', 'n': 'ん',
  // 拗音
  'kya': 'きゃ', 'kyi': 'きぃ', 'kyu': 'きゅ', 'kye': 'きぇ', 'kyo': 'きょ',
  'gya': 'ぎゃ', 'gyi': 'ぎぃ', 'gyu': 'ぎゅ', 'gye': 'ぎぇ', 'gyo': 'ぎょ',
  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
  // 促音用
  'kk': 'っk', 'ss': 'っs', 'tt': 'っt', 'pp': 'っp'
};

// ローマ字をひらがなに変換する関数
function convertRomajiToHiragana(romaji) {
  let result = '';
  let i = 0;
  const input = romaji.toLowerCase();
  
  while (i < input.length) {
    let found = false;
    
    // 長い順に検索（3文字、2文字、1文字）
    for (let len = 3; len >= 1; len--) {
      if (i + len <= input.length) {
        const substr = input.substring(i, i + len);
        if (romajiToHiragana[substr]) {
          result += romajiToHiragana[substr];
          i += len;
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      // 促音の処理
      if (i < input.length - 1 && input[i] === input[i + 1] && 
          ['k', 's', 't', 'p', 'c'].includes(input[i])) {
        result += 'っ';
        i++;
      } else {
        // 変換できない文字はそのまま
        result += input[i];
        i++;
      }
    }
  }
  
  return result;
}

// 検索クエリの種類を判定する関数
function detectQueryType(query) {
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query);
  const hasEnglish = /[a-zA-Z]/.test(query);
  
  if (hasJapanese) {
    return 'japanese';
  } else if (hasEnglish && /^[a-zA-Z\s]+$/.test(query)) {
    // ローマ字の特徴をチェック
    const romajiPatterns = [
      /^[aiueo]+$/,           // 母音のみ
      /[aiueo][aiueo]/,       // 連続する母音
      /u[ua]/,                // uu, ua パターン
      /ou/,                   // ou パターン
      /[kg]y[aiueo]/,         // kya, gyo など
      /^[a-z]{2,6}$/,         // 短い文字列（2-6文字）
      /sh[aiueo]/,            // sha, shi など
      /ch[aiueo]/,            // cha, chi など
      /ts[aiueo]/,            // tsa, tsu など
      /^[nbmprltskgzjdfhwycx]+[aiueo]+[nbmprltskgzjdfhwycx]*[aiueo]*$/  // 典型的なローマ字パターン
    ];
    
    // 英語らしい特徴をチェック
    const englishPatterns = [
      /[bcdfghjklmnpqrstvwxyz]{3,}/,  // 子音が3つ以上連続
      /ing$/,                          // -ing 語尾
      /ed$/,                           // -ed 語尾
      /tion$/,                         // -tion 語尾
      /ly$/,                           // -ly 語尾
      /[aeiou][bcdfghjklmnpqrstvwxyz][bcdfghjklmnpqrstvwxyz]/, // 母音+子音+子音
      /qu/,                            // qu 組み合わせ
      /[bcdfghjklmnpqrstvwxyz]y$/,     // 子音+y で終わる
      /^[a-z]{7,}/,                    // 7文字以上の長い単語
      /ght$/,                          // -ght 語尾
      /ck/,                            // ck 組み合わせ
      /ph/,                            // ph 組み合わせ
      /th/                             // th 組み合わせ
    ];
    
    const hasEnglishPattern = englishPatterns.some(pattern => pattern.test(query.toLowerCase()));
    const hasRomajiPattern = romajiPatterns.some(pattern => pattern.test(query.toLowerCase()));
    
    // 英語パターンが強い場合は英語として判定
    if (hasEnglishPattern && !hasRomajiPattern) {
      return 'english';
    }
    
    // 長い単語（7文字以上）は基本的に英語として扱う
    if (query.length >= 7) {
      return 'english';
    }
    
    // ローマ字パターンが強い場合はローマ字として判定
    if (hasRomajiPattern && !hasEnglishPattern) {
      return 'romaji';
    }
    
    // 判定が曖昧な場合は英語を優先（デフォルト）
    return 'english';
  }
  
  return 'unknown';
}

// 類語を取得する関数
async function getSynonyms(query, queryType, mainResult) {
  try {
    let synonyms = [];
    
    if (queryType === 'english') {
      // 英語の場合：英語の類語を検索
      // メインの結果の日本語から英語の類語を探す
      const mainWord = mainResult.japanese[0];
      const searchWords = [mainWord.word, mainWord.reading].filter(Boolean);
      
      for (const word of searchWords) {
        const result = await jishoApi.searchForPhrase(word);
        if (result.data.length > 0) {
          // 全ての結果から英語の定義を収集
          const englishSynonyms = [];
          for (const entry of result.data.slice(0, 3)) {
            for (const sense of entry.senses.slice(0, 2)) {
              englishSynonyms.push(...sense.english_definitions);
            }
          }
          
          // 元のクエリと異なる英語の類語をフィルタ
          const filteredSynonyms = englishSynonyms.filter(eng => 
            eng.toLowerCase() !== query.toLowerCase() && 
            !eng.toLowerCase().includes(query.toLowerCase()) &&
            eng.length < 20 // 長すぎる説明を除外
          );
          
          synonyms.push(...filteredSynonyms);
        }
      }
    } else {
      // 日本語・ローマ字の場合：英語の類語を検索
      // メインの結果から全ての英語定義を取得
      const allEnglishDefs = [];
      for (const sense of mainResult.senses.slice(0, 3)) {
        allEnglishDefs.push(...sense.english_definitions);
      }
      
      // メインの英語定義以外を類語として使用
      const mainEnglish = mainResult.senses[0].english_definitions[0];
      const englishSynonyms = allEnglishDefs.filter((def, index) => 
        index > 0 && def !== mainEnglish && def.length < 20
      );
      
      synonyms.push(...englishSynonyms);
      
      // 足りない場合は、メインの英語から更に検索
      if (synonyms.length < 2) {
        try {
          const englishResult = await jishoApi.searchForPhrase(mainEnglish);
          if (englishResult.data.length > 1) {
            for (const entry of englishResult.data.slice(1, 4)) {
              for (const sense of entry.senses.slice(0, 1)) {
                const additionalSynonyms = sense.english_definitions.filter(def => 
                  def !== mainEnglish && def.length < 20
                );
                synonyms.push(...additionalSynonyms);
              }
            }
          }
        } catch (e) {
          // エラーは無視
        }
      }
    }
    
    // 重複を除去し、2-4語に制限
    const uniqueSynonyms = [...new Set(synonyms)].slice(0, 4);
    return uniqueSynonyms.length >= 2 ? uniqueSynonyms.slice(0, 4) : uniqueSynonyms;
    
  } catch (error) {
    console.error('類語取得エラー:', error);
    return [];
  }
}

export default {
  name: 'j',
  description: '日本語の単語を検索します（漢字・ひらがな・カタカナ・ローマ字・英語対応）',
  usage: '!j [検索語]',
  
  async execute(client, channel, tags, message, args) {
    const query = args.trim();
    if (!query) {
      client.say(channel, '使用方法: !j [検索語] (例: !j 勇者, !j ゆうしゃ, !j yuusha, !j hero)');
      return;
    }

    try {
      const queryType = detectQueryType(query);
      let searchQuery = query;
      let isRomajiSearch = false;
      
      // ローマ字の場合はひらがなに変換してから検索
      if (queryType === 'romaji') {
        searchQuery = convertRomajiToHiragana(query);
        isRomajiSearch = true;
        console.log(`ローマ字検索: "${query}" → "${searchQuery}"`);
      }
      
      const result = await jishoApi.searchForPhrase(searchQuery);
      
      if (result.data.length > 0) {
        if (queryType === 'english') {
          // 英語で検索 → 日本語の結果を複数表示
          const queryLower = query.toLowerCase();
          
          // まず完全一致を探す
          let matchingEntries = result.data.filter(entry => 
            entry.senses.some(sense => 
              sense.english_definitions.some(def => 
                def.toLowerCase() === queryLower ||
                def.toLowerCase().split(/[,;]/).map(s => s.trim()).includes(queryLower)
              )
            )
          ).slice(0, 3);
          
          // 完全一致がない場合は単語の始まりでマッチ
          if (matchingEntries.length === 0) {
            matchingEntries = result.data.filter(entry => 
              entry.senses.some(sense => 
                sense.english_definitions.some(def => {
                  const defLower = def.toLowerCase();
                  return defLower.startsWith(queryLower + ' ') ||
                         defLower.startsWith(queryLower + ',') ||
                         defLower === queryLower;
                })
              )
            ).slice(0, 3);
          }
          
          // それでもない場合は部分一致（元の条件）
          if (matchingEntries.length === 0) {
            matchingEntries = result.data.filter(entry => 
              entry.senses.some(sense => 
                sense.english_definitions.some(def => 
                  def.toLowerCase().includes(queryLower)
                )
              )
            ).slice(0, 3);
          }
          
          if (matchingEntries.length > 0) {
            const results = matchingEntries.map((entry, index) => {
              const japanese = entry.japanese[0];
              const word = japanese.word || japanese.reading;
              const reading = japanese.reading;
              
              const partsOfSpeech = entry.senses[0].parts_of_speech.length > 0 
                ? `(${entry.senses[0].parts_of_speech.join(', ')})` 
                : '';
              
              if (japanese.word && japanese.word !== japanese.reading) {
                return `${index + 1}. ${japanese.word}(${reading}) ${partsOfSpeech}`.trim();
              } else {
                return `${index + 1}. ${word} ${partsOfSpeech}`.trim();
              }
            });
            
            // 類語を取得
            const synonyms = await getSynonyms(query, queryType, matchingEntries[0]);
            const synonymsText = synonyms.length > 0 ? ` [類語: ${synonyms.join(', ')}]` : '';
            
            client.say(channel, `${query}: ${results.join(' | ')}${synonymsText}`);
            
            if (!wordSearchHistory[query]) {
              wordSearchHistory[query] = {
                originalQuery: query,
                meanings: matchingEntries.map(entry => {
                  const jp = entry.japanese[0];
                  return jp.word || jp.reading;
                }),
                partsOfSpeech: matchingEntries[0]?.senses[0]?.parts_of_speech?.join(', ') || '',
                count: 0,
                lastSearched: null
              };
            }
            wordSearchHistory[query].count++;
            wordSearchHistory[query].lastSearched = new Date().toLocaleString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          } else {
            client.say(channel, `「${query}」の日本語が見つかりませんでした。`);
          }
        } else {
          // 日本語またはローマ字で検索 → 英語の意味を複数表示
          const firstResult = result.data[0];
          const japanese = firstResult.japanese[0];
          const word = japanese.word || japanese.reading;
          const reading = japanese.reading;
          
          const meanings = [];
          const maxMeanings = Math.min(3, firstResult.senses.length);
          
          for (let i = 0; i < maxMeanings; i++) {
            const sense = firstResult.senses[i];
            const englishDefs = sense.english_definitions.join(', ');
            
            const partsOfSpeech = sense.parts_of_speech.length > 0 
              ? `(${sense.parts_of_speech.join(', ')})` 
              : '';
            
            meanings.push(`${i + 1}. ${englishDefs} ${partsOfSpeech}`.trim());
          }
          
          let output = '';
          if (japanese.word && japanese.word !== japanese.reading) {
            output = `${japanese.word}(${reading}): `;
          } else {
            output = `${word}: `;
          }
          
          // ローマ字検索の場合は元のクエリも表示
          if (isRomajiSearch) {
            output = `${query} → ${output}`;
          }
          
          output += meanings.join(' | ');
          
          // 類語を取得
          const synonyms = await getSynonyms(searchQuery, queryType, firstResult);
          const synonymsText = synonyms.length > 0 ? ` [synonyms: ${synonyms.join(', ')}]` : '';
          
          client.say(channel, output + synonymsText);
          
          const historyKey = isRomajiSearch ? query : searchQuery;
          if (!wordSearchHistory[historyKey]) {
            wordSearchHistory[historyKey] = {
              originalQuery: historyKey,
              meanings: firstResult.senses.slice(0, 3).map(sense => sense.english_definitions.join(', ')),
              partsOfSpeech: firstResult.senses[0]?.parts_of_speech?.join(', ') || '',
              count: 0,
              lastSearched: null
            };
          }
          wordSearchHistory[historyKey].count++;
          wordSearchHistory[historyKey].lastSearched = new Date().toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
      } else {
        if (isRomajiSearch) {
          client.say(channel, `「${query}」(${searchQuery})が見つかりませんでした。`);
        } else {
          client.say(channel, `「${query}」が見つかりませんでした。`);
        }
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      client.say(channel, 'データを取得できませんでした。');
    }
  },

  getWordHistory() {
    return wordSearchHistory;
  },

  clearWordHistory() {
    wordSearchHistory = {};
  }
};