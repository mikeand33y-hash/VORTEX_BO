/**
 * VORTEX-MD Settings Configuration
 * This file contains all bot settings and configurations
 */

export const settings = {
  // Bot Information
  botName: "VORTEX-MD",
  botVersion: "1.0.0",
  ownerName: "VORTEX Developer",
  ownerNumber: "2349123456789@s.whatsapp.net", // Replace with your WhatsApp number (must be in E164 format with @s.whatsapp.net)
  
  // Prefix Configuration
  prefix: ".",
  allowedPrefixes: [".", "!", "#", "$", "%"],
  
  // Features Toggle
  features: {
    autoReconnect: true,
    antiCrash: true,
    errorLogging: true,
    pairingCode: true, // Use pairing code instead of QR
    autoTyping: false,
    autoRecording: false,
    readReceipts: true,
  },
  
  // Role Configuration
  roles: {
    owner: ["2349123456789@s.whatsapp.net"], // Add owner numbers
    admin: ["2349123456789@s.whatsapp.net"], // Add admin numbers
    premium: ["2349123456789@s.whatsapp.net"], // Add premium user numbers
  },
  
  // Command Configuration
  commands: {
    enabled: true,
    caseInsensitive: true,
    deleteCommands: false,
    cooldown: 2000, // ms between commands per user
  },
  
  // Database
  database: {
    type: "json",
    path: "./database",
    autoSave: true,
  },
  
  // Session
  session: {
    path: "./sessions",
    useStoreFile: true,
  },
  
  // API Keys (Add your own)
  apiKeys: {
    weather: "YOUR_WEATHER_API_KEY",
    giphy: "YOUR_GIPHY_API_KEY",
    news: "YOUR_NEWS_API_KEY",
    // Add more as needed
  },
  
  // Rate Limiting
  rateLimiting: {
    enabled: true,
    maxRequests: 5,
    timeWindow: 60000, // 1 minute
  },
  
  // Group Settings
  group: {
    maxMembers: 500,
    antiLink: true,
    antiSpam: true,
    antiBot: true,
    antiRaid: true,
    antiDelete: true,
  },
  
  // Messages
  messages: {
    welcome: "Welcome to {groupName}! 🎉",
    goodbye: "Goodbye {memberName}! 👋",
    commandError: "❌ An error occurred while executing this command.",
    noPermission: "❌ You don't have permission to use this command.",
    ownerOnly: "⚠️ This command is for the bot owner only.",
    adminOnly: "⚠️ This command is for group admins only.",
    premiumOnly: "💎 This command is for premium users only.",
  },
  
  // Logging
  logging: {
    enabled: true,
    level: "info", // debug, info, warn, error
    file: "./logs/bot.log",
  },
};

export const emojis = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
  loading: "⏳",
  premium: "💎",
  owner: "👑",
  admin: "🛡️",
  user: "👤",
  heart: "❤️",
  star: "⭐",
  fire: "🔥",
  clock: "🕐",
  money: "💰",
  dice: "🎲",
  cards: "🃏",
};

export const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};
