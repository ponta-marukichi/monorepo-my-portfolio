// ===== commands/currency.js =====
export default {
  name: 'usd',
  aliases: ['yen', 'gbp'],
  description: '通貨換算を行います',
  usage: '!usd [金額] | !yen [金額] | !gbp [金額]',
  
  async execute(client, channel, tags, message, args) {
    const commandName = message.split(' ')[0].substring(1).toLowerCase();
    const amount = args.trim();
    
    try {
      let result;
      switch (commandName) {
        case 'usd':
          result = await this.convertUSD(amount);
          break;
        case 'yen':
          result = await this.convertYEN(amount);
          break;
        case 'gbp':
          result = await this.convertGBP(amount);
          break;
        default:
          // 未知のコマンドの場合のエラーハンドリング
          client.say(channel, 'サポートされていないコマンドです。!usd, !yen, !gbp を使用してください。');
          return;
      }
      
      client.say(channel, result);
    } catch (error) {
      console.error('通貨換算エラー:', error);
      client.say(channel, '通貨情報を取得できませんでした。');
    }
  },

  async convertUSD(amount) {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (amount && !isNaN(amount)) {
      const usdAmount = parseFloat(amount);
      const jpyAmount = usdAmount * data.rates.JPY;
      return `現在 ${usdAmount} USD は 約 ${jpyAmount.toFixed(2)} JPY です。`;
    } else {
      return `現在 1 USD は 約 ${data.rates.JPY.toFixed(2)} JPY です。`;
    }
  },

  async convertYEN(amount) {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (amount && !isNaN(amount)) {
      const yenAmount = parseFloat(amount);
      const usdAmount = yenAmount / data.rates.JPY;
      return `現在 ${yenAmount} JPY は 約 ${usdAmount.toFixed(2)} USD です。`;
    } else {
      return `現在 1 JPY は 約 ${(1 / data.rates.JPY).toFixed(4)} USD です。`;
    }
  },

  async convertGBP(amount) {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/GBP');
    const data = await response.json();
    
    if (amount && !isNaN(amount)) {
      const gbpAmount = parseFloat(amount);
      const jpyAmount = gbpAmount * data.rates.JPY;
      return `現在 ${gbpAmount} GBP は 約 ${jpyAmount.toFixed(2)} JPY です。`;
    } else {
      return `現在 1 GBP は 約 ${data.rates.JPY.toFixed(2)} JPY です。`;
    }
  }
};