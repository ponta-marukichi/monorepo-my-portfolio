// ===== utils/commandLoader.js =====
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands() {
  const commands = new Map();
  const commandsPath = path.join(__dirname, '../commands');
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const fileURL = pathToFileURL(filePath).href;
    const command = await import(fileURL);
    
    if (command.default && command.default.name && command.default.execute) {
      // メインのコマンド名を登録
      commands.set(command.default.name, command.default);
      console.log(`コマンド "${command.default.name}" を読み込みました`);
      
      // エイリアスも同じコマンドオブジェクトで登録
      if (command.default.aliases && Array.isArray(command.default.aliases)) {
        for (const alias of command.default.aliases) {
          commands.set(alias, command.default);
          console.log(`  エイリアス "${alias}" を登録しました`);
        }
      }
    }
  }
  
  return commands;
}