// ===== commands/time.js =====

// 国名とタイムゾーンのマッピング（英語名、日本語名、略称に対応）
const countryToTimezone = {
  // 日本
  'japan': 'Asia/Tokyo',
  'jp': 'Asia/Tokyo',
  '日本': 'Asia/Tokyo',
  
  // アメリカ（複数タイムゾーン）
  'usa': 'multiple',
  'us': 'multiple',
  'america': 'multiple',
  'united states': 'multiple',
  'アメリカ': 'multiple',
  '米国': 'multiple',
  
  // イギリス
  'uk': 'Europe/London',
  'united kingdom': 'Europe/London',
  'britain': 'Europe/London',
  'england': 'Europe/London',
  'イギリス': 'Europe/London',
  '英国': 'Europe/London',
  
  // カナダ（複数タイムゾーン）
  'canada': 'multiple',
  'ca': 'multiple',
  'カナダ': 'multiple',
  
  // オーストラリア（複数タイムゾーン）
  'australia': 'multiple',
  'au': 'multiple',
  'オーストラリア': 'multiple',
  
  // フランス
  'france': 'Europe/Paris',
  'fr': 'Europe/Paris',
  'フランス': 'Europe/Paris',
  
  // ドイツ
  'germany': 'Europe/Berlin',
  'de': 'Europe/Berlin',
  'ドイツ': 'Europe/Berlin',
  
  // 中国
  'china': 'Asia/Shanghai',
  'cn': 'Asia/Shanghai',
  '中国': 'Asia/Shanghai',
  
  // 韓国
  'korea': 'Asia/Seoul',
  'south korea': 'Asia/Seoul',
  'kr': 'Asia/Seoul',
  '韓国': 'Asia/Seoul',
  
  // イタリア
  'italy': 'Europe/Rome',
  'it': 'Europe/Rome',
  'イタリア': 'Europe/Rome',
  
  // スペイン
  'spain': 'Europe/Madrid',
  'es': 'Europe/Madrid',
  'スペイン': 'Europe/Madrid',
  
  // ブラジル
  'brazil': 'America/Sao_Paulo',
  'br': 'America/Sao_Paulo',
  'ブラジル': 'America/Sao_Paulo',
  
  // メキシコ
  'mexico': 'America/Mexico_City',
  'mx': 'America/Mexico_City',
  'メキシコ': 'America/Mexico_City',
  
  // インド
  'india': 'Asia/Kolkata',
  'in': 'Asia/Kolkata',
  'インド': 'Asia/Kolkata',
  
  // ロシア（複数タイムゾーン）
  'russia': 'multiple',
  'ru': 'multiple',
  'ロシア': 'multiple',
  
  // タイ
  'thailand': 'Asia/Bangkok',
  'th': 'Asia/Bangkok',
  'タイ': 'Asia/Bangkok',
  
  // シンガポール
  'singapore': 'Asia/Singapore',
  'sg': 'Asia/Singapore',
  'シンガポール': 'Asia/Singapore',
  
  // オランダ
  'netherlands': 'Europe/Amsterdam',
  'nl': 'Europe/Amsterdam',
  'オランダ': 'Europe/Amsterdam',
  
  // ベルギー
  'belgium': 'Europe/Brussels',
  'be': 'Europe/Brussels',
  'ベルギー': 'Europe/Brussels',
  
  // スイス
  'switzerland': 'Europe/Zurich',
  'ch': 'Europe/Zurich',
  'スイス': 'Europe/Zurich',
  
  // スウェーデン
  'sweden': 'Europe/Stockholm',
  'se': 'Europe/Stockholm',
  'スウェーデン': 'Europe/Stockholm',
  
  // ノルウェー
  'norway': 'Europe/Oslo',
  'no': 'Europe/Oslo',
  'ノルウェー': 'Europe/Oslo',
  
  // デンマーク
  'denmark': 'Europe/Copenhagen',
  'dk': 'Europe/Copenhagen',
  'デンマーク': 'Europe/Copenhagen',
  
  // フィンランド
  'finland': 'Europe/Helsinki',
  'fi': 'Europe/Helsinki',
  'フィンランド': 'Europe/Helsinki',
  
  // ポーランド
  'poland': 'Europe/Warsaw',
  'pl': 'Europe/Warsaw',
  'ポーランド': 'Europe/Warsaw',
  
  // トルコ
  'turkey': 'Europe/Istanbul',
  'tr': 'Europe/Istanbul',
  'トルコ': 'Europe/Istanbul',
  
  // UAE
  'uae': 'Asia/Dubai',
  'dubai': 'Asia/Dubai',
  'アラブ首長国連邦': 'Asia/Dubai',
  
  // サウジアラビア
  'saudi arabia': 'Asia/Riyadh',
  'sa': 'Asia/Riyadh',
  'サウジアラビア': 'Asia/Riyadh',
  
  // 南アフリカ
  'south africa': 'Africa/Johannesburg',
  'za': 'Africa/Johannesburg',
  '南アフリカ': 'Africa/Johannesburg',
  
  // エジプト
  'egypt': 'Africa/Cairo',
  'eg': 'Africa/Cairo',
  'エジプト': 'Africa/Cairo',
  
  // ニュージーランド
  'new zealand': 'Pacific/Auckland',
  'nz': 'Pacific/Auckland',
  'ニュージーランド': 'Pacific/Auckland',
  
  // アルゼンチン
  'argentina': 'America/Argentina/Buenos_Aires',
  'ar': 'America/Argentina/Buenos_Aires',
  'アルゼンチン': 'America/Argentina/Buenos_Aires',
  
  // チリ
  'chile': 'America/Santiago',
  'cl': 'America/Santiago',
  'チリ': 'America/Santiago',
  
  // ベトナム
  'vietnam': 'Asia/Ho_Chi_Minh',
  'vn': 'Asia/Ho_Chi_Minh',
  'ベトナム': 'Asia/Ho_Chi_Minh',
  
  // インドネシア
  'indonesia': 'Asia/Jakarta',
  'id': 'Asia/Jakarta',
  'インドネシア': 'Asia/Jakarta',
  
  // マレーシア
  'malaysia': 'Asia/Kuala_Lumpur',
  'my': 'Asia/Kuala_Lumpur',
  'マレーシア': 'Asia/Kuala_Lumpur',
  
  // フィリピン
  'philippines': 'Asia/Manila',
  'ph': 'Asia/Manila',
  'フィリピン': 'Asia/Manila',
  
  // 台湾
  'taiwan': 'Asia/Taipei',
  'tw': 'Asia/Taipei',
  '台湾': 'Asia/Taipei',
  
  // 香港
  'hong kong': 'Asia/Hong_Kong',
  'hk': 'Asia/Hong_Kong',
  '香港': 'Asia/Hong_Kong',
};

// 複数タイムゾーンを持つ国の定義
const multipleTimezones = {
  'usa': [
    { name: '東部', timezone: 'America/New_York' },
    { name: '中部', timezone: 'America/Chicago' },
    { name: '山岳部', timezone: 'America/Denver' },
    { name: '太平洋', timezone: 'America/Los_Angeles' },
    { name: 'アラスカ', timezone: 'America/Anchorage' },
    { name: 'ハワイ', timezone: 'Pacific/Honolulu' }
  ],
  'us': [
    { name: '東部', timezone: 'America/New_York' },
    { name: '中部', timezone: 'America/Chicago' },
    { name: '山岳部', timezone: 'America/Denver' },
    { name: '太平洋', timezone: 'America/Los_Angeles' },
    { name: 'アラスカ', timezone: 'America/Anchorage' },
    { name: 'ハワイ', timezone: 'Pacific/Honolulu' }
  ],
  'america': [
    { name: '東部', timezone: 'America/New_York' },
    { name: '中部', timezone: 'America/Chicago' },
    { name: '山岳部', timezone: 'America/Denver' },
    { name: '太平洋', timezone: 'America/Los_Angeles' },
    { name: 'アラスカ', timezone: 'America/Anchorage' },
    { name: 'ハワイ', timezone: 'Pacific/Honolulu' }
  ],
  'united states': [
    { name: '東部', timezone: 'America/New_York' },
    { name: '中部', timezone: 'America/Chicago' },
    { name: '山岳部', timezone: 'America/Denver' },
    { name: '太平洋', timezone: 'America/Los_Angeles' },
    { name: 'アラスカ', timezone: 'America/Anchorage' },
    { name: 'ハワイ', timezone: 'Pacific/Honolulu' }
  ],
  'アメリカ': [
    { name: '東部', timezone: 'America/New_York' },
    { name: '中部', timezone: 'America/Chicago' },
    { name: '山岳部', timezone: 'America/Denver' },
    { name: '太平洋', timezone: 'America/Los_Angeles' },
    { name: 'アラスカ', timezone: 'America/Anchorage' },
    { name: 'ハワイ', timezone: 'Pacific/Honolulu' }
  ],
  '米国': [
    { name: '東部', timezone: 'America/New_York' },
    { name: '中部', timezone: 'America/Chicago' },
    { name: '山岳部', timezone: 'America/Denver' },
    { name: '太平洋', timezone: 'America/Los_Angeles' },
    { name: 'アラスカ', timezone: 'America/Anchorage' },
    { name: 'ハワイ', timezone: 'Pacific/Honolulu' }
  ],
  'canada': [
    { name: '東部', timezone: 'America/Toronto' },
    { name: '中部', timezone: 'America/Winnipeg' },
    { name: '山岳部', timezone: 'America/Edmonton' },
    { name: '太平洋', timezone: 'America/Vancouver' }
  ],
  'ca': [
    { name: '東部', timezone: 'America/Toronto' },
    { name: '中部', timezone: 'America/Winnipeg' },
    { name: '山岳部', timezone: 'America/Edmonton' },
    { name: '太平洋', timezone: 'America/Vancouver' }
  ],
  'カナダ': [
    { name: '東部', timezone: 'America/Toronto' },
    { name: '中部', timezone: 'America/Winnipeg' },
    { name: '山岳部', timezone: 'America/Edmonton' },
    { name: '太平洋', timezone: 'America/Vancouver' }
  ],
  'australia': [
    { name: '東部', timezone: 'Australia/Sydney' },
    { name: '中部', timezone: 'Australia/Adelaide' },
    { name: '西部', timezone: 'Australia/Perth' }
  ],
  'au': [
    { name: '東部', timezone: 'Australia/Sydney' },
    { name: '中部', timezone: 'Australia/Adelaide' },
    { name: '西部', timezone: 'Australia/Perth' }
  ],
  'オーストラリア': [
    { name: '東部', timezone: 'Australia/Sydney' },
    { name: '中部', timezone: 'Australia/Adelaide' },
    { name: '西部', timezone: 'Australia/Perth' }
  ],
  'russia': [
    { name: 'モスクワ', timezone: 'Europe/Moscow' },
    { name: 'エカテリンブルク', timezone: 'Asia/Yekaterinburg' },
    { name: 'ウラジオストク', timezone: 'Asia/Vladivostok' }
  ],
  'ru': [
    { name: 'モスクワ', timezone: 'Europe/Moscow' },
    { name: 'エカテリンブルク', timezone: 'Asia/Yekaterinburg' },
    { name: 'ウラジオストク', timezone: 'Asia/Vladivostok' }
  ],
  'ロシア': [
    { name: 'モスクワ', timezone: 'Europe/Moscow' },
    { name: 'エカテリンブルク', timezone: 'Asia/Yekaterinburg' },
    { name: 'ウラジオストク', timezone: 'Asia/Vladivostok' }
  ]
};

export default {
  name: 't',
  description: '指定した国の現在時刻を表示します',
  usage: '!t [国名]',
  
  async execute(client, channel, tags, message, args) {
    const country = args.trim();
    
    if (!country) {
      client.say(channel, '使用方法: !t [国名] (例: !t Japan、!t USA、!t UK)');
      return;
    }
    
    const countryTime = this.getCountryTime(country);
    
    if (!countryTime) {
      client.say(channel, `「${country}」の時間情報を取得できませんでした。国名を確認してください。`);
      return;
    }
    
    if (countryTime.isMultipleTimezones) {
      client.say(channel, `${country}の日付: ${countryTime.date} (${countryTime.dayOfWeek})`);
      client.say(channel, `${country}の時間: ${countryTime.times.join('、 ')}`);
    } else {
      client.say(channel, `${countryTime.country}の現在時刻: ${countryTime.time} (${countryTime.timezone}) ${countryTime.dayOfWeek}`);
    }
  },

  getCountryTime(country) {
    const countryLower = country.toLowerCase();
    const timezoneInfo = countryToTimezone[countryLower];
    
    if (!timezoneInfo) {
      return null;
    }
    
    // 複数タイムゾーンを持つ国の場合
    if (timezoneInfo === 'multiple') {
      return this.getMultipleTimezones(countryLower);
    }
    
    // 単一タイムゾーンの国の場合
    try {
      const localTime = new Date(new Date().toLocaleString('en-US', { timeZone: timezoneInfo }));
      
      const formattedTime = localTime.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      return {
        country: country,
        time: formattedTime,
        timezone: timezoneInfo,
        dayOfWeek: localTime.toLocaleString('ja-JP', { weekday: 'long' })
      };
    } catch (error) {
      console.error('時間計算エラー:', error.message);
      return null;
    }
  },

  getMultipleTimezones(countryLower) {
    const zones = multipleTimezones[countryLower];
    
    if (!zones) {
      return null;
    }
    
    let results = [];
    
    for (const zone of zones) {
      try {
        const localTime = new Date(new Date().toLocaleString('en-US', { timeZone: zone.timezone }));
        
        const formattedTime = localTime.toLocaleString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        results.push(`${zone.name}: ${formattedTime}`);
      } catch (error) {
        console.error(`${zone.name}の時間計算エラー:`, error.message);
      }
    }
    
    const primaryZone = zones[0];
    const primaryLocalTime = new Date(new Date().toLocaleString('en-US', { timeZone: primaryZone.timezone }));
    
    const formattedDate = primaryLocalTime.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const dayOfWeek = primaryLocalTime.toLocaleString('ja-JP', { weekday: 'long' });
    
    return {
      country: countryLower,
      isMultipleTimezones: true,
      date: formattedDate,
      times: results,
      dayOfWeek: dayOfWeek
    };
  }
};