const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is Online!'));
app.listen(3000, () => console.log('Server ready!'));

const mineflayer = require('mineflayer');
const config = require('./config.json');

function createBot() {
  const bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: config.botUsername,
    auth: 'offline',
    version: false,
    checkTimeoutInterval: 60000, // Tăng thời gian chờ phản hồi lên 60s
  });
  
  let movementPhase = 0;
  const STEP_INTERVAL = 1500;
  const JUMP_DURATION = 500;

  bot.on('spawn', () => {
    setTimeout(() => {
      bot.setControlState('sneak', true);
      console.log(`✅ ${config.botUsername} is Ready!`);
    }, 3000);
    
    // Bắt đầu vòng lặp di chuyển
    const moveInterval = setInterval(() => {
      if (!bot.entity) return;
      
      switch (movementPhase) {
        case 0:
          bot.setControlState('forward', true);
          bot.setControlState('back', false);
          bot.setControlState('jump', false);
          break;
        case 1:
          bot.setControlState('forward', false);
          bot.setControlState('back', true);
          bot.setControlState('jump', false);
          break;
        case 2:
          bot.setControlState('forward', false);
          bot.setControlState('back', false);
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), JUMP_DURATION);
          break;
        default:
          bot.setControlState('forward', false);
          bot.setControlState('back', false);
          bot.setControlState('jump', false);
      }
      movementPhase = (movementPhase + 1) % 4;
    }, STEP_INTERVAL);

    // Dừng vòng lặp khi bot văng để tránh lỗi chồng chéo
    bot.once('end', () => clearInterval(moveInterval));
  });

  bot.on('error', (err) => console.error('⚠️ Error:', err));

  bot.on('end', () => {
    console.log('⛔️ Bot Disconnected! Đang kết nối lại sau 10 giây...');
    setTimeout(createBot, 10000); // Tự động vào lại sau 10s
  });
}

// Chạy hàm khởi tạo bot lần đầu
createBot();
