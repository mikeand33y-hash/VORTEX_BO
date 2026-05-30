/**
 * Command Handler System
 * Manages loading and executing commands
 */

import { readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { settings, colors } from "../settings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commandsDir = join(__dirname, "..", "commands");

export class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.cooldowns = new Map();
  }

  async loadCommands() {
    try {
      const files = readdirSync(commandsDir).filter((file) =>
        file.endsWith(".js")
      );

      for (const file of files) {
        try {
          const command = await import(join(commandsDir, file));
          const cmd = command.default;

          if (!cmd.name) {
            console.log(
              `${colors.yellow}⚠️  Skipping ${file}: No name property${colors.reset}`
            );
            continue;
          }

          this.commands.set(cmd.name.toLowerCase(), cmd);

          // Register aliases
          if (cmd.aliases && Array.isArray(cmd.aliases)) {
            cmd.aliases.forEach((alias) => {
              this.aliases.set(alias.toLowerCase(), cmd.name.toLowerCase());
            });
          }

          console.log(
            `${colors.green}✓${colors.reset} Loaded command: ${colors.cyan}${cmd.name}${colors.reset}`
          );
        } catch (error) {
          console.log(
            `${colors.red}✗${colors.reset} Error loading ${file}: ${error.message}`
          );
        }
      }

      console.log(
        `${colors.green}✓ Total commands loaded: ${this.commands.size}${colors.reset}`
      );
    } catch (error) {
      console.error("Error loading commands:", error);
    }
  }

  async handle(sock, message, text, sender, jid, isGroup, db) {
    const prefix = text.charAt(0);

    // Check if message starts with valid prefix
    if (!settings.allowedPrefixes.includes(prefix)) {
      return;
    }

    // Extract command and args
    const args = text.slice(1).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Resolve alias or get command
    let cmd = this.commands.get(commandName);
    if (!cmd) {
      const aliasedCommand = this.aliases.get(commandName);
      cmd = aliasedCommand ? this.commands.get(aliasedCommand) : null;
    }

    if (!cmd) {
      return; // Command not found
    }

    // Check role permissions
    const userRole = this.getUserRole(sender, isGroup, sock, jid);

    if (cmd.role === "owner" && userRole !== "owner") {
      await sock.sendMessage(jid, {
        text: `${settings.messages.ownerOnly}`,
      });
      return;
    }

    if (
      cmd.role === "admin" &&
      userRole !== "owner" &&
      userRole !== "admin" &&
      !isGroupAdmin(jid, sender, sock, isGroup)
    ) {
      await sock.sendMessage(jid, {
        text: `${settings.messages.adminOnly}`,
      });
      return;
    }

    if (cmd.role === "premium" && userRole === "user") {
      await sock.sendMessage(jid, {
        text: `${settings.messages.premiumOnly}`,
      });
      return;
    }

    // Check group only commands
    if (cmd.groupOnly && !isGroup) {
      await sock.sendMessage(jid, {
        text: "❌ This command can only be used in groups.",
      });
      return;
    }

    // Check private only commands
    if (cmd.privateOnly && isGroup) {
      await sock.sendMessage(jid, {
        text: "❌ This command can only be used in private chats.",
      });
      return;
    }

    // Cooldown check
    if (!this.checkCooldown(sender, commandName)) {
      await sock.sendMessage(jid, {
        text: `⏳ Please wait before using this command again.`,
      });
      return;
    }

    try {
      // Execute command
      await cmd.execute({
        sock,
        message,
        args,
        text,
        sender,
        jid,
        isGroup,
        db,
        prefix,
      });
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);

      if (settings.features.antiCrash) {
        await sock.sendMessage(jid, {
          text: `${settings.messages.commandError}\n\nError: ${error.message}`,
        });
      } else {
        throw error;
      }
    }
  }

  getUserRole(sender, isGroup, sock, jid) {
    if (settings.roles.owner.includes(sender)) return "owner";
    if (settings.roles.admin.includes(sender)) return "admin";
    if (settings.roles.premium.includes(sender)) return "premium";
    return "user";
  }

  checkCooldown(userId, commandName) {
    const key = `${userId}_${commandName}`;
    const now = Date.now();
    const cooldownTime = this.cooldowns.get(key);

    if (cooldownTime && now - cooldownTime < settings.commands.cooldown) {
      return false;
    }

    this.cooldowns.set(key, now);
    return true;
  }
}

async function isGroupAdmin(jid, sender, sock, isGroup) {
  if (!isGroup) return false;

  try {
    const groupMetadata = await sock.groupMetadata(jid);
    const admin = groupMetadata.participants.find(
      (p) => p.id === sender && p.admin
    );
    return !!admin;
  } catch (error) {
    return false;
  }
}
