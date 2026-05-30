/**
 * Profile Command
 * Shows user profile and statistics
 */

export default {
  name: "profile",
  aliases: ["me", "myprofile", "stats"],
  description: "View your profile and statistics",
  category: "User Info",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      const user = db.getUser(sender);
      const warnings = db.getWarns(sender);
      const accountAge = Math.floor((Date.now() - user.joinedAt) / (1000 * 60 * 60 * 24));

      let roleEmoji = "👤";
      if (user.role === "owner") roleEmoji = "👑";
      else if (user.role === "admin") roleEmoji = "🛡️";
      else if (user.role === "premium") roleEmoji = "💎";

      const response = `╭────── *YOUR PROFILE* ──────╮
│
│ ${roleEmoji} *Role:* ${user.role.toUpperCase()}
│ ${user.premium ? "💎" : "👤"} *Status:* ${user.premium ? "Premium" : "Regular"}
│
│ 💰 *Balance:* $${user.balance}
│ ⭐ *Experience:* ${user.experience} XP
│ 📊 *Commands Used:* ${user.commandsUsed}
│ ⚠️ *Warnings:* ${user.warns}/${warnings.length > 0 ? "3" : "0"}
│
│ 📅 *Account Info*
│ 📆 Joined: ${accountAge} days ago
│
│ *Recent Warnings:*
${warnings.slice(0, 3).map((w, i) => `│ ${i + 1}. ${w.reason}`).join("\n") || "│ No warnings"}
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
