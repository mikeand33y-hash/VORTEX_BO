/**
 * Dice Command
 * Roll a dice and win money
 */

export default {
  name: "dice",
  aliases: ["rolldice", "d6"],
  description: "Roll a dice and win rewards",
  category: "Games",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      let betAmount = parseInt(args[0]) || 100;
      const user = db.getUser(sender);

      // Validation
      if (isNaN(betAmount) || betAmount <= 0) {
        await sock.sendMessage(jid, {
          text: `❌ Usage: ${prefix}dice [amount]\n💡 Default bet: 100`,
        });
        return;
      }

      if (betAmount > user.balance) {
        await sock.sendMessage(jid, {
          text: `❌ Insufficient balance!\n💰 Your balance: $${user.balance}`,
        });
        return;
      }

      // Roll dice
      const playerRoll = Math.floor(Math.random() * 6) + 1;
      const botRoll = Math.floor(Math.random() * 6) + 1;

      let result = "";
      let winnings = 0;

      if (playerRoll > botRoll) {
        winnings = betAmount * 2;
        db.addBalance(sender, betAmount);
        result = `🎲 YOU WON!\n\n🎰 Your Roll: ${playerRoll}\n🤖 Bot Roll: ${botRoll}\n💰 Winnings: $${winnings}\n💵 New Balance: $${user.balance + betAmount}`;
      } else if (playerRoll < botRoll) {
        db.subtractBalance(sender, betAmount);
        result = `😔 YOU LOST!\n\n🎰 Your Roll: ${playerRoll}\n🤖 Bot Roll: ${botRoll}\n💸 Lost: $${betAmount}\n💵 New Balance: $${user.balance - betAmount}`;
      } else {
        result = `🟡 IT'S A TIE!\n\n🎰 Your Roll: ${playerRoll}\n🤖 Bot Roll: ${botRoll}\n💰 Bet Returned: $${betAmount}`;
      }

      await sock.sendMessage(jid, { text: result });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
