# IOPN Faucet Auto Claim Bot

## Overview
This is a Telegram bot that automatically claims IOPN tokens from a faucet for multiple wallets. The bot supports creating unlimited wallets, auto-claiming every 24 hours, solving CAPTCHAs, and exporting private keys.

## Project Type
- **Platform**: Node.js Telegram Bot
- **Language**: JavaScript (Node.js v20)
- **Main File**: `bot.js`
- **Package Manager**: npm

## Recent Changes (November 3, 2025)
- **GitHub Import Setup**: Configured project to run in Replit environment
- **File Rename**: Renamed `index,js` to `bot.js` to match package.json entry point
- **Environment Variables**: Updated bot to read configuration from `.env` file using dotenv
- **Security**: Moved BOT_TOKEN to environment variables (no hardcoded tokens)
- **Dependencies**: Installed Node.js v20 and all required npm packages
- **Workflow**: Configured "IOPN Bot" workflow to run `npm start` as console application
- **Documentation**: Added Replit-specific setup instructions to README

## Project Architecture

### Dependencies
- `node-telegram-bot-api`: Telegram Bot API integration
- `axios`: HTTP client for API requests
- `ethers`: Ethereum wallet generation and management
- `cheerio`: HTML/SVG parsing for CAPTCHA solving
- `dotenv`: Environment variable management

### Key Files
- `bot.js`: Main bot application with all commands and auto-claim logic
- `.env`: Environment configuration (BOT_TOKEN, FAUCET_API, etc.)
- `wallets.json`: Persistent storage for generated wallets (auto-created)
- `package.json`: npm project configuration
- `README.md`: User documentation with setup instructions

### Environment Variables
- `BOT_TOKEN`: Telegram bot token from @BotFather (required)
- `FAUCET_API`: IOPN faucet API URL (default: https://faucet.iopn.tech/api/faucet)
- `CLAIM_INTERVAL`: Auto-claim interval in hours (default: 24)
- `CLAIM_DELAY`: Delay between claims in seconds (default: 5)

### Bot Commands
- `/start`: Welcome message and command list
- `/create <count>`: Generate new wallets (max 50 per command)
- `/list`: View all wallets with balances
- `/claim`: Manually trigger claim for all wallets
- `/info`: Get faucet information (balance, status)
- `/stats`: View statistics (total claimed, claim count)
- `/export`: Export private keys to text file
- `/delete <index>`: Remove a specific wallet
- `/help`: Usage instructions

### Features
- **Auto-Claim**: Automatically claims from faucet every 24 hours
- **Multiple Wallets**: Supports unlimited wallet generation
- **CAPTCHA Solver**: Attempts to solve SVG-based CAPTCHAs
- **Statistics Tracking**: Tracks total claimed and claim count per wallet
- **Private Key Export**: Backup functionality for wallet private keys
- **Telegram Notifications**: Real-time notifications for successful claims

## Running the Bot

### In Replit
1. Ensure `BOT_TOKEN` is set in `.env` file
2. Click **Run** button or press `Ctrl + Enter`
3. Bot will start automatically and run in console

### Commands
- **Start**: Click Run button (executes `npm start`)
- **View Logs**: Check console output for bot status

## User Preferences
- Bot should remain running 24/7 for auto-claim functionality
- All sensitive data (BOT_TOKEN, private keys) should be kept secure
- Wallet data persists in `wallets.json` file

## Technical Notes
- Bot uses polling mode to receive Telegram updates
- Auto-claim starts 1 minute after bot startup, then every 24 hours
- Rate limiting: 5-second delay between wallet claims
- Wallets are generated using ethers.js cryptographic random
- CAPTCHA solving is simplified (may need ML/OCR for better accuracy)

## Setup Status
✅ Project successfully configured and running in Replit
✅ All dependencies installed
✅ Workflow configured (IOPN Bot)
✅ Bot started successfully
