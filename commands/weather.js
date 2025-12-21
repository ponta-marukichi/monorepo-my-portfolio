// ===== commands/weather.js =====
export default {
  name: 'w',
  description: '指定した都市の天気と気温を取得します',
  usage: '!w [都市名]',
  
  async execute(client, channel, tags, message, args) {  
    const city = args.trim();
    if (!city) {
      client.say(channel, '使用方法: !w [都市名]');
      return;
    }

    try {
      const weather = await this.getWeather(city);
      const temperature = await this.getTemperature(city);
      client.say(channel, `${city}の天気: ${weather}, 気温: ${temperature}°C`);
    } catch (error) {
      console.error('天気情報取得エラー:', error);
      client.say(channel, '天気情報を取得できませんでした。');
    }
  },

  async getWeather(city) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data.weather[0].description;
  },

  async getTemperature(city) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data.main.temp;
  }
};