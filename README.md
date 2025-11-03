# 🤖 IOPN Faucet Auto Claim Bot

Bot Telegram untuk auto claim faucet IOPN dengan multiple wallets! Generate ratusan wallet dan auto claim setiap 24 jam! 💰

## ✨ Features

- 🔄 **Auto Claim** - Claim otomatis setiap 24 jam
- 💼 **Multiple Wallets** - Support unlimited wallets
- 🎯 **Auto CAPTCHA Solver** - Solve captcha otomatis
- 📊 **Statistics** - Track total claimed per wallet
- 💾 **Export Keys** - Backup private keys
- 🔔 **Telegram Notifications** - Notif setiap claim berhasil

## 📋 Prerequisites

- Node.js v16 atau lebih baru
- NPM atau Yarn
- Telegram Bot Token ([Cara dapetin](#cara-buat-telegram-bot))

## 🚀 Installation

### 1. Clone atau Download Repository

```bash
# Clone jika punya git
git clone <repo-url>
cd iopn-faucet-bot

# Atau download ZIP lalu extract
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Bot Token

Edit file `bot.js` dan ganti `YOUR_TELEGRAM_BOT_TOKEN`:

```javascript
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; // Ganti ini!
```

### 4. Run Bot

```bash
npm start
```

Bot siap digunakan! 🎉

## 📱 Cara Buat Telegram Bot

1. Buka Telegram, cari **@BotFather**
2. Kirim command `/newbot`
3. Kasih nama bot (contoh: `IOPN Faucet Bot`)
4. Kasih username bot (contoh: `iopn_faucet_bot`)
5. Copy **token** yang dikasih BotFather
6. Paste ke `bot.js`

## 🎮 Cara Pakai

### 1. Start Bot

Buka bot kamu di Telegram, klik **Start** atau ketik:

```
/start
```

### 2. Buat Wallets

Buat 10 wallet baru:

```
/create 10
```

Buat 50 wallet (max per command):

```
/create 50
```

**Tips:** Bikin banyak wallet = dapat banyak IOPN! 💰

### 3. Auto Claim

Bot akan **otomatis claim setiap 24 jam** untuk semua wallet!

Atau claim manual:

```
/claim
```

### 4. Lihat Statistik

```
/stats
```

Output:
```
📊 Statistik Claim

💼 Total Wallets: 50
💰 Total Claimed: 100.00 IOPN
🔢 Total Claims: 50x
📈 Avg per Wallet: 2.00 IOPN
```

### 5. Export Private Keys

```
/export
```

Bot akan kirim file `.txt` berisi semua address & private keys.

**⚠️ PENTING: Simpan file ini dengan AMAN! Jangan share ke siapapun!**

## 📚 Command List

| Command | Fungsi |
|---------|--------|
| `/start` | Mulai bot & lihat welcome message |
| `/create <jumlah>` | Buat wallet baru (max 50) |
| `/list` | Lihat semua wallet |
| `/claim` | Manual claim semua wallet |
| `/info` | Info faucet (balance, status) |
| `/stats` | Statistik total claimed |
| `/export` | Export private keys ke file |
| `/delete <index>` | Hapus wallet (index dari /list) |
| `/help` | Bantuan & tips |

## 💡 Tips & Tricks

### Maksimalkan Profit

1. **Buat Banyak Wallet** - Semakin banyak = semakin banyak IOPN
   ```
   /create 50
   /create 50
   /create 50
   ```

2. **Biarkan Bot Running 24/7** - Auto claim jalan terus
   - Deploy di VPS (DigitalOcean, AWS, etc)
   - Atau pakai PC/Laptop yang selalu nyala

3. **Monitor Statistik** - Cek progress secara berkala
   ```
   /stats
   ```

4. **Backup Private Keys** - Setiap minggu
   ```
   /export
   ```

### Deploy ke VPS (Optional)

Biar bot jalan 24/7 tanpa harus nyalain PC:

```bash
# Install PM2
npm install -g pm2

# Run dengan PM2
pm2 start bot.js --name iopn-bot

# Auto restart on reboot
pm2 startup
pm2 save
```

## 🔧 Troubleshooting

### Bot tidak respond

1. Cek token bot sudah benar
2. Pastikan bot sudah di-start dengan `/start`
3. Restart bot: `npm start`

### Claim gagal

1. Cek faucet masih ada balance: `/info`
2. Tunggu 24 jam dari claim terakhir
3. CAPTCHA mungkin salah (bot retry otomatis)

### File wallets.json hilang

- Semua wallet akan hilang!
- Selalu backup dengan `/export` secara berkala

## ⚠️ Disclaimer

- Bot ini untuk **educational purposes** only
- Gunakan dengan bijak dan sesuai ToS faucet
- Author tidak bertanggung jawab atas penyalahgunaan
- **JANGAN SHARE PRIVATE KEYS** ke siapapun!

## 🤝 Contributing

Ada ide untuk improve bot? Feel free to contribute!

## 📄 License

MIT License - Free to use!

## 💬 Support

Ada pertanyaan? Hubungi [Your Contact]

---

**Happy Claiming! 🚀💰**

Made with ❤️ for IOPN community
