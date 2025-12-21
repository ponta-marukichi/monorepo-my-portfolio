import { Client } from 'tmi.js';
import { loadCommands } from './utils/commandLoader.js';
import dotenv from 'dotenv';

dotenv.config();

// Twitch bot configuration
const options = {
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [process.env.TWITCH_CHANNEL]
};

const client = new Client(options);
const commands = await loadCommands();

client.connect();

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  const commandMatch = message.match(/^!(\S+)(.*)$/);
  if (!commandMatch) return;

  const [, commandName, args] = commandMatch;
  const lowerCommandName = commandName.toLowerCase();
  
  console.log(`コマンド検出: "${lowerCommandName}", 引数: "${args.trim()}"`);
  
  const command = commands.get(lowerCommandName);

  if (command) {
    console.log(`コマンド実行: ${command.name}`);
    try {
      await command.execute(client, channel, tags, message.trim(), args.trim(), commands);
    } catch (error) {
      console.error(`コマンド "${commandName}" の実行中にエラーが発生:`, error);
      client.say(channel, 'コマンドの実行中にエラーが発生しました。');
    }
  } else {
    console.log(`コマンドが見つかりません: ${lowerCommandName}`);
  }
});