/**
 * Daily Command
 * Claim daily rewards
 */

export default {
  name: "daily",
  aliases: ["dailyreward", "reward"],
  description: "Claim your daily reward",
  category: "Economy",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      const user = db.getUser(sender);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Check if already claimed today
      if (user.lastDaily && now - user.lastDaily < oneDayMs) {
        const timeLeft = oneDayMs - (now - user.lastDaily);
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

        await sock.sendMessage(jid, {
          text: `⏳ You already claimed your daily reward!\n\n⏰ Come back in ${hours}h ${minutes}m`,
        });
        return;
      }

      // Calculate reward (base + premium bonus)
      const baseReward = 1000;
      const premiumBonus = user.premium ? 500 : 0;
      const totalReward = baseReward + premiumBonus;

      // Add reward
      db.addBalance(sender, totalReward);
      db.updateUser(sender, { lastDaily: now });

      const response = `🎁 *Daily Reward Claimed!*\n\n💰 Base Reward: $${baseReward}\n${user.premium ? `💎 Premium Bonus: $${premiumBonus}\n` : ""}💵 Total: $${totalReward}\n\n💸 New Balance: $${user.balance + totalReward}\n\n⏰ Next claim: 24 hours`;

      await sock.sendMessage(jid, { text: response });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
