/**
 * VORTEX-MD - Advanced WhatsApp Multi-Device Bot
 * Main Entry Point
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import readline from "readline";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";

import { settings, colors } from "./settings.js";
import { CommandHandler } from "./lib/commandHandler.js";
import { Database } from "./lib/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create required directories
const dirs = ["sessions", "database", "logs", "temp", "media"];
dirs.forEach((dir) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

// Logger
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      singleLine: false,
      ignore: "hostname",
      translateTime: "HH:MM:ss Z",
    },
  },
});

const log = (message, type = "info") => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;

  switch (type) {
    case "success":
      console.log(`${colors.green}${prefix} ✅ ${message}${colors.reset}`);
      break;
    case "error":
      console.log(`${colors.red}${prefix} ❌ ${message}${colors.reset}`);
      break;
    case "warning":
      console.log(`${colors.yellow}${prefix} ⚠️  ${message}${colors.reset}`);
      break;
    case "info":
      console.log(`${colors.cyan}${prefix} ℹ️  ${message}${colors.reset}`);
      break;
    case "debug":
      console.log(`${colors.magenta}${prefix} 🐛 ${message}${colors.reset}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
};

// Pairing Code Input
const input = (prompt) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(prompt, resolve);
    rl.close();
  });

// Main Bot Class
class VortexBot {
  constructor() {
    this.sock = null;
    this.commandHandler = null;
    this.database = null;
    this.store = null;
    this.isConnected = false;
  }

  async initialize() {
    log("Initializing VORTEX-MD Bot...", "info");

    try {
      // Initialize Database
      this.database = new Database();
      this.database.init();
      log("Database initialized", "success");

      // Initialize Command Handler
      this.commandHandler = new CommandHandler();
      await this.commandHandler.loadCommands();
      log(`Loaded ${this.commandHandler.commands.size} commands`, "success");

      // Initialize Socket
      await this.startSocket();
    } catch (error) {
      log(`Initialization error: ${error.message}`, "error");
      process.exit(1);
    }
  }

  async startSocket() {
    const { state, saveCreds } = await useMultiFileAuthState(
      settings.session.path
    );

    this.sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: !settings.features.pairingCode,
      browser: ["VORTEX-MD", "Safari", "1.0.0"],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      emitOwnEventsFlag: true,
      generateHighQualityLinkPreview: true,
      // Message retries
      maxMsgsInWaChatHistoryServer: 0,
      retryRequestDelayMs: 6000,
      transactionOpts: {
        maxRetries: 6,
        delayMs: 100,
      },
    });

    // Pairing Code Login
    if (settings.features.pairingCode && !state.creds.me) {
      const phoneNumber = await input("Enter your WhatsApp number (with country code, e.g., 2349123456789): ");
      const pairingCode = await this.sock.requestPairingCode(phoneNumber);
      log(`Your pairing code: ${pairingCode}", "info");
    }

    // Connection Events
    this.sock.ev.on("connection.update", (update) =>
      this.handleConnectionUpdate(update)
    );
    this.sock.ev.on("creds.update", saveCreds);
    this.sock.ev.on("messages.upsert", (m) => this.handleMessages(m));

    // Auto-reconnect on disconnect
    if (settings.features.autoReconnect) {
      this.sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (
          connection === "close" &&
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
        ) {
          log("Reconnecting in 5 seconds...", "warning");
          setTimeout(() => this.startSocket(), 5000);
        }
      });
    }
  }

  handleConnectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      log("QR code generated", "info");
    }

    if (connection === "connecting") {
      log("Connecting to WhatsApp...", "info");
    }

    if (connection === "open") {
      this.isConnected = true;
      const jid = this.sock.user.id;
      const number = jidNormalizedUser(jid).split("@")[0];
      log(`Bot connected successfully! (${number})", "success");
      log(`${colors.green}${settings.botName} is online${colors.reset}", "success");
    }

    if (connection === "close") {
      this.isConnected = false;
      const reason =
        new Boom(lastDisconnect?.error)?.output?.statusCode ===
        DisconnectReason.loggedOut
          ? "Logged out"
          : "Connection lost";

      log(`Bot disconnected: ${reason}", "error");

      if (
        new Boom(lastDisconnect?.error)?.output?.statusCode ===
        DisconnectReason.loggedOut
      ) {
        log("Session expired. Please log in again.", "warning");
      } else if (settings.features.autoReconnect) {
        log("Auto-reconnecting in 5 seconds...", "info");
        setTimeout(() => this.startSocket(), 5000);
      }
    }
  }

  async handleMessages(m) {
    try {
      if (!this.isConnected || !m.messages || m.messages.length === 0) return;

      const message = m.messages[0];

      // Ignore if no message key
      if (!message.key) return;

      // Ignore bot's own messages
      if (message.key.fromMe) return;

      // Ignore status updates
      if (message.key.remoteJid === "status@broadcast") return;

      const jid = message.key.remoteJid;
      const isGroup = jid.endsWith("@g.us");
      const sender = jidNormalizedUser(message.key.participant || jid);
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";

      if (!text || text.length === 0) return;

      // Anti-crash wrapper
      try {
        await this.commandHandler.handle(
          this.sock,
          message,
          text,
          sender,
          jid,
          isGroup,
          this.database
        );
      } catch (error) {
        if (settings.features.antiCrash) {
          log(
            `Command error (anti-crash protected): ${error.message}",
            "error"
          );
          await this.sock.sendMessage(jid, {
            text: `${settings.messages.commandError}\n\nError: ${error.message}`,
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      log(`Message handler error: ${error.message}", "error");
      if (settings.features.errorLogging) {
        console.error(error);
      }
    }
  }
}

// Start Bot
const bot = new VortexBot();
bot.initialize().catch((error) => {
  log(`Fatal error: ${error.message}", "error");
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
  log("Bot shutting down...", "warning");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("Bot terminated", "warning");
  process.exit(0);
});

// Unhandled errors
process.on("unhandledRejection", (error) => {
  log(`Unhandled Rejection: ${error}", "error");
});

process.on("uncaughtException", (error) => {
  log(`Uncaught Exception: ${error}", "error");
});
