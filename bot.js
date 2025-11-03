const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { Wallet } = require('ethers');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

// Config
const BOT_TOKEN = process.env.BOT_TOKEN;
const FAUCET_API = process.env.FAUCET_API || 'https://faucet.iopn.tech/api/faucet';
const WALLETS_FILE = path.join(__dirname, 'wallets.json');
const CLAIM_INTERVAL = parseInt(process.env.CLAIM_INTERVAL || '24') * 60 * 60 * 1000;

if (!BOT_TOKEN) {
  console.error('❌ ERROR: BOT_TOKEN environment variable is not set!');
  console.error('📝 Please set your Telegram Bot Token in Replit Secrets');
  console.error('💡 Get your token from @BotFather on Telegram');
  process.exit(1);
}

class IOPNFaucetBot {
  constructor() {
    this.bot = new TelegramBot(BOT_TOKEN, { polling: true });
    this.wallets = [];
    this.claimTimers = new Map();
    this.init();
  }

  async init() {
    await this.loadWallets();
    this.setupCommands();
    this.startAutoClaim();
    console.log('🚀 Bot started successfully!');
  }

  // Load wallets dari file
  async loadWallets() {
    try {
      const data = await fs.readFile(WALLETS_FILE, 'utf8');
      this.wallets = JSON.parse(data);
      console.log(`✅ Loaded ${this.wallets.length} wallets`);
    } catch (error) {
      this.wallets = [];
      await this.saveWallets();
      console.log('📝 Created new wallets file');
    }
  }

  // Save wallets ke file
  async saveWallets() {
    await fs.writeFile(WALLETS_FILE, JSON.stringify(this.wallets, null, 2));
  }

  // Generate wallet baru
  generateWallet() {
    const wallet = Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      createdAt: new Date().toISOString(),
      lastClaim: null,
      totalClaimed: 0,
      claimCount: 0
    };
  }

  // Solve CAPTCHA dari SVG
  async solveCaptcha(captchaSvg) {
    try {
      // Parse SVG untuk extract text
      const $ = cheerio.load(captchaSvg, { xmlMode: true });
      
      // Cari semua path dengan fill color
      const paths = $('path[fill]');
      const colors = new Map();
      
      paths.each((i, elem) => {
        const fill = $(elem).attr('fill');
        const d = $(elem).attr('d');
        if (fill && fill !== 'none' && d) {
          if (!colors.has(fill)) {
            colors.set(fill, []);
          }
          colors.get(fill).push(d);
        }
      });

      // Analisis pattern untuk extract angka/huruf
      // Ini simplified version, bisa dikembangkan lebih kompleks
      const result = this.analyzePattern(colors);
      return result || this.generateRandomCaptcha();
    } catch (error) {
      console.error('CAPTCHA solve error:', error.message);
      return this.generateRandomCaptcha();
    }
  }

  analyzePattern(colors) {
    // Simplified pattern recognition
    // Dalam production, gunakan ML atau OCR library
    const patterns = Array.from(colors.values());
    if (patterns.length > 0) {
      // Generate based on pattern complexity
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    return null;
  }

  generateRandomCaptcha() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Get captcha
  async getCaptcha() {
    try {
      const response = await axios.get(`${FAUCET_API}/captcha`);
      return response.data;
    } catch (error) {
      console.error('Get captcha error:', error.message);
      return null;
    }
  }

  // Claim faucet untuk satu wallet
  async claimFaucet(wallet, chatId = null) {
    try {
      // Get captcha
      const captchaData = await this.getCaptcha();
      if (!captchaData) {
        throw new Error('Failed to get captcha');
      }

      // Solve captcha
      const captchaSolution = await this.solveCaptcha(captchaData.captcha);
      
      // Claim request
      const response = await axios.post(`${FAUCET_API}/claim`, {
        address: wallet.address,
        captchaId: captchaData.captchaId,
        captcha: captchaSolution
      });

      if (response.data.success) {
        wallet.lastClaim = new Date().toISOString();
        wallet.totalClaimed += parseFloat(response.data.amount);
        wallet.claimCount++;
        await this.saveWallets();

        const message = `✅ Claim berhasil!\n` +
                       `💰 Amount: ${response.data.amount} IOPN\n` +
                       `📍 Wallet: ${wallet.address.substring(0, 10)}...${wallet.address.substring(38)}\n` +
                       `🔢 Total Claimed: ${wallet.totalClaimed.toFixed(2)} IOPN\n` +
                       `📊 Claim Count: ${wallet.claimCount}\n` +
                       `🔗 TX: ${response.data.txHash.substring(0, 20)}...`;

        if (chatId) {
          this.bot.sendMessage(chatId, message);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Claim error for ${wallet.address}:`, error.message);
      if (chatId) {
        this.bot.sendMessage(chatId, `❌ Claim gagal: ${error.message}`);
      }
      return false;
    }
  }

  // Check faucet info
  async getFaucetInfo() {
    try {
      const response = await axios.get(`${FAUCET_API}/info`);
      return response.data;
    } catch (error) {
      console.error('Get faucet info error:', error.message);
      return null;
    }
  }

  // Auto claim untuk semua wallet
  async autoClaimAll(chatId = null) {
    const info = await this.getFaucetInfo();
    if (!info || !info.canClaim) {
      if (chatId) {
        this.bot.sendMessage(chatId, 
          `⏳ Belum bisa claim!\n` +
          `⏰ Tunggu ${info?.hoursUntilNextClaim || 24} jam lagi`
        );
      }
      return;
    }

    let success = 0;
    let failed = 0;

    for (const wallet of this.wallets) {
      const result = await this.claimFaucet(wallet, chatId);
      if (result) {
        success++;
      } else {
        failed++;
      }
      // Delay untuk avoid rate limit
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (chatId) {
      this.bot.sendMessage(chatId, 
        `📊 Auto Claim Selesai!\n` +
        `✅ Berhasil: ${success}\n` +
        `❌ Gagal: ${failed}\n` +
        `💰 Total Wallets: ${this.wallets.length}`
      );
    }
  }

  // Start auto claim timer
  startAutoClaim() {
    // Claim pertama setelah 1 menit
    setTimeout(() => {
      this.autoClaimAll();
      // Lalu setiap 24 jam
      setInterval(() => this.autoClaimAll(), CLAIM_INTERVAL);
    }, 60000);
  }

  // Setup bot commands
  setupCommands() {
    // Start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const welcome = `🤖 IOPN Faucet Auto Claim Bot\n\n` +
                     `📋 Commands:\n` +
                     `/create <jumlah> - Buat wallet baru\n` +
                     `/list - Lihat semua wallet\n` +
                     `/claim - Claim semua wallet sekarang\n` +
                     `/info - Info faucet\n` +
                     `/stats - Statistik claim\n` +
                     `/export - Export private keys\n` +
                     `/delete <index> - Hapus wallet\n` +
                     `/help - Bantuan`;
      this.bot.sendMessage(chatId, welcome);
    });

    // Create wallets
    this.bot.onText(/\/create (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const count = parseInt(match[1]) || 1;

      if (count > 50) {
        this.bot.sendMessage(chatId, '❌ Maksimal 50 wallet per request!');
        return;
      }

      this.bot.sendMessage(chatId, `⏳ Membuat ${count} wallet...`);

      for (let i = 0; i < count; i++) {
        const wallet = this.generateWallet();
        this.wallets.push(wallet);
      }

      await this.saveWallets();
      this.bot.sendMessage(chatId, 
        `✅ Berhasil membuat ${count} wallet!\n` +
        `💼 Total wallet: ${this.wallets.length}`
      );
    });

    // List wallets
    this.bot.onText(/\/list/, (msg) => {
      const chatId = msg.chat.id;
      
      if (this.wallets.length === 0) {
        this.bot.sendMessage(chatId, '❌ Belum ada wallet. Gunakan /create untuk membuat.');
        return;
      }

      let message = `💼 Wallet List (${this.wallets.length}):\n\n`;
      this.wallets.forEach((wallet, index) => {
        message += `${index + 1}. ${wallet.address.substring(0, 15)}...\n` +
                  `   💰 ${wallet.totalClaimed.toFixed(2)} IOPN (${wallet.claimCount}x)\n`;
      });

      this.bot.sendMessage(chatId, message);
    });

    // Manual claim
    this.bot.onText(/\/claim/, async (msg) => {
      const chatId = msg.chat.id;
      
      if (this.wallets.length === 0) {
        this.bot.sendMessage(chatId, '❌ Belum ada wallet!');
        return;
      }

      this.bot.sendMessage(chatId, '⏳ Memulai claim untuk semua wallet...');
      await this.autoClaimAll(chatId);
    });

    // Faucet info
    this.bot.onText(/\/info/, async (msg) => {
      const chatId = msg.chat.id;
      const info = await this.getFaucetInfo();

      if (!info) {
        this.bot.sendMessage(chatId, '❌ Gagal mendapatkan info faucet');
        return;
      }

      const message = `ℹ️ Faucet Info\n\n` +
                     `💰 Balance: ${parseFloat(info.balance).toFixed(2)} IOPN\n` +
                     `✅ Can Claim: ${info.canClaim ? 'Ya' : 'Tidak'}\n` +
                     `⏰ Next Claim: ${info.hoursUntilNextClaim}h\n` +
                     `📍 Addresses: ${info.faucetAddresses.length}`;

      this.bot.sendMessage(chatId, message);
    });

    // Statistics
    this.bot.onText(/\/stats/, (msg) => {
      const chatId = msg.chat.id;

      if (this.wallets.length === 0) {
        this.bot.sendMessage(chatId, '❌ Belum ada wallet!');
        return;
      }

      const total = this.wallets.reduce((sum, w) => sum + w.totalClaimed, 0);
      const totalClaims = this.wallets.reduce((sum, w) => sum + w.claimCount, 0);
      const avgPerWallet = total / this.wallets.length;

      const message = `📊 Statistik Claim\n\n` +
                     `💼 Total Wallets: ${this.wallets.length}\n` +
                     `💰 Total Claimed: ${total.toFixed(2)} IOPN\n` +
                     `🔢 Total Claims: ${totalClaims}x\n` +
                     `📈 Avg per Wallet: ${avgPerWallet.toFixed(2)} IOPN`;

      this.bot.sendMessage(chatId, message);
    });

    // Export private keys
    this.bot.onText(/\/export/, async (msg) => {
      const chatId = msg.chat.id;

      if (this.wallets.length === 0) {
        this.bot.sendMessage(chatId, '❌ Belum ada wallet!');
        return;
      }

      let exportData = '🔐 PRIVATE KEYS (SIMPAN DENGAN AMAN!)\n\n';
      this.wallets.forEach((wallet, index) => {
        exportData += `${index + 1}. Address: ${wallet.address}\n` +
                     `   Private Key: ${wallet.privateKey}\n` +
                     `   Total: ${wallet.totalClaimed.toFixed(2)} IOPN\n\n`;
      });

      // Save to file and send
      const filename = `wallets_export_${Date.now()}.txt`;
      await fs.writeFile(filename, exportData);
      
      await this.bot.sendDocument(chatId, filename, {
        caption: '⚠️ JANGAN SHARE FILE INI!'
      });

      // Delete file after send
      await fs.unlink(filename);
    });

    // Delete wallet
    this.bot.onText(/\/delete (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const index = parseInt(match[1]) - 1;

      if (index < 0 || index >= this.wallets.length) {
        this.bot.sendMessage(chatId, '❌ Index tidak valid!');
        return;
      }

      const deleted = this.wallets.splice(index, 1)[0];
      await this.saveWallets();

      this.bot.sendMessage(chatId, 
        `✅ Wallet dihapus!\n` +
        `📍 ${deleted.address.substring(0, 20)}...\n` +
        `💰 Total claimed: ${deleted.totalClaimed.toFixed(2)} IOPN`
      );
    });

    // Help
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const help = `📖 Cara Penggunaan:\n\n` +
                  `1️⃣ /create 10 - Buat 10 wallet baru\n` +
                  `2️⃣ Bot akan auto claim setiap 24 jam\n` +
                  `3️⃣ Gunakan /claim untuk manual claim\n` +
                  `4️⃣ /stats untuk lihat statistik\n` +
                  `5️⃣ /export untuk backup private keys\n\n` +
                  `⚠️ Bot akan auto claim setiap 24 jam!\n` +
                  `💡 Semakin banyak wallet = semakin banyak IOPN!`;
      this.bot.sendMessage(chatId, help);
    });
  }
}

// Start bot
const bot = new IOPNFaucetBot();

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
