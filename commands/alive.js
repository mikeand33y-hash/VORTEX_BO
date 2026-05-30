/**
 * Alive Command
 * Confirms bot is operational
 */

import { settings } from "../settings.js";

export default {
  name: "alive",
  aliases: ["hi", "hello", "hey"],
  description: "Check if bot is alive and operational",
  category: "User Info",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);

      const messages = [
        `🟢 *${settings.botName} is Alive!*\n✅ All systems operational\n⏰ Uptime: ${uptimeHours}h ${uptimeMinutes}m`,
        `👋 *Hey there!* I'm ${settings.botName} and I'm online!\n🔧 Ready to help you out\n💫 Status: Active`,
        `⚡ *Bot is running smoothly!*\n✨ Version: ${settings.botVersion}\n📱 Ready to serve you`,
        `🎉 *Yep, I'm here!*\n💼 ${settings.botName} is working perfectly\n🚀 Let's go!`,
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      await sock.sendMessage(jid, {
        text: randomMessage,
      });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
