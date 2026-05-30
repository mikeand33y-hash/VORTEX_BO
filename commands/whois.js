/**
 * Whois Command
 * Get information about a specific user
 */

export default {
  name: "whois",
  aliases: ["userinfo", "info"],
  description: "Get information about a user",
  category: "User Info",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      let targetUser = sender;

      // Check if replying to a message
      if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        targetUser = message.message.extendedTextMessage.contextInfo.participant;
      }
      // Check if user provided a number
      else if (args[0]) {
        targetUser = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;
      }

      const user = db.getUser(targetUser);
      const warnings = db.getWarns(targetUser);
      const accountAge = Math.floor((Date.now() - user.joinedAt) / (1000 * 60 * 60 * 24));

      let roleEmoji = "👤";
      if (user.role === "owner") roleEmoji = "👑";
      else if (user.role === "admin") roleEmoji = "🛡️";
      else if (user.role === "premium") roleEmoji = "💎";

      const response = `╭────── *USER INFO* ──────╮
│
│ ${roleEmoji} *Role:* ${user.role.toUpperCase()}
│ ${user.premium ? "💎" : "👤"} *Status:* ${user.premium ? "Premium" : "Regular"}
│ 📱 *JID:* ${targetUser}
│
│ 💰 *Balance:* $${user.balance}
│ ⭐ *Experience:* ${user.experience} XP
│ 📊 *Commands Used:* ${user.commandsUsed}
│ ⚠️ *Warnings:* ${user.warns}
│
│ 📅 *Member Since:* ${accountAge} days ago
│
╰────────────────────────╯`;

      await sock.sendMessage(jid, { text: response });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
