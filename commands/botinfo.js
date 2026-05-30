/**
 * Bot Info Command
 * Displays detailed bot information and stats
 */

import { settings } from "../settings.js";

export default {
  name: "botinfo",
  aliases: ["info", "about"],
  description: "Display comprehensive bot information",
  category: "User Info",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      const stats = db.getStats();
      const users = Object.keys(db.data.users).length;
      const groups = Object.keys(db.data.groups).length;
      const commands = 10; // Update this with actual command count

      const response = `╭───── *${settings.botName}* ─────╮
│
│ 🤖 *Bot Information*
│
│ 📛 Name: ${settings.botName}
│ 📌 Version: ${settings.botVersion}
│ 👤 Owner: ${settings.ownerName}
│ 🏠 Prefix: ${settings.prefix}
│
│ 📊 *Statistics*
│
│ 👥 Users: ${users}
│ 👨‍👩‍👧‍👦 Groups: ${groups}
│ 🎮 Commands: ${commands}
│ 💬 Messages: ${stats.messagesHandled}
│ ⚙️ Executed: ${stats.commandsExecuted}
│
│ 🛠️ *Features*
│
│ ✅ Auto Reconnect
│ ✅ Anti Crash
│ ✅ Role System
│ ✅ Economy System
│ ✅ Premium System
│ ✅ JSON Database
│
│ 📡 *Connection Status*
│ 🟢 Online & Active
│
╰──────────────────────╯`;

      await sock.sendMessage(jid, { text: response });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
