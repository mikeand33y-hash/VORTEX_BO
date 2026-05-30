/**
 * Wallet Command
 * Check balance and wallet information
 */

export default {
  name: "wallet",
  aliases: ["balance", "money"],
  description: "Check your wallet balance",
  category: "Economy",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      const user = db.getUser(sender);
      const topUsers = db.getTopUsers(5, "balance");
      const userRank = topUsers.findIndex((u) => u.jid === sender) + 1 || "N/A";

      let balanceBar = "";
      const barLength = 10;
      const maxBalance = 50000;
      const filledBars = Math.round((user.balance / maxBalance) * barLength);
      balanceBar = "█".repeat(filledBars) + "░".repeat(barLength - filledBars);

      const response = `╭──── *YOUR WALLET* ────╮
│
│ 💰 *Balance:* $${user.balance}
│ 📊 *Progress:*
│ ${balanceBar}
│ (${Math.round((user.balance / maxBalance) * 100)}%)
│
│ 🏅 *Rank:* #${userRank}
│ ⭐ *Experience:* ${user.experience} XP
│ 💎 *Premium:* ${user.premium ? "✅ Yes" : "❌ No"}
│
│ *Commands:*
│ ${user.premium ? "🔓" : "🔒"} .daily - Get daily reward
│ 🔗 .pay @user amount - Send money
│ 📈 .leaderboard - See top balances
│
╰─────────────────────╯`;

      await sock.sendMessage(jid, { text: response });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
