/**
 * Coinflip Command
 * Flip a coin and predict heads or tails
 */

export default {
  name: "coinflip",
  aliases: ["coin", "flip"],
  description: "Flip a coin and win money",
  category: "Games",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      if (args.length < 2) {
        await sock.sendMessage(jid, {
          text: `❌ Usage: ${prefix}coinflip <heads|tails> [amount]\n💡 Default bet: 100`,
        });
        return;
      }

      const prediction = args[0].toLowerCase();
      let betAmount = parseInt(args[1]) || 100;
      const user = db.getUser(sender);

      // Validation
      if (!["heads", "tails", "h", "t"].includes(prediction)) {
        await sock.sendMessage(jid, {
          text: `❌ Choose: heads or tails`,
        });
        return;
      }

      if (isNaN(betAmount) || betAmount <= 0) {
        await sock.sendMessage(jid, {
          text: `❌ Invalid bet amount`,
        });
        return;
      }

      if (betAmount > user.balance) {
        await sock.sendMessage(jid, {
          text: `❌ Insufficient balance!\n💰 Your balance: $${user.balance}`,
        });
        return;
      }

      // Flip coin
      const result = Math.random() < 0.5 ? "heads" : "tails";
      const playerPrediction = prediction === "h" ? "heads" : prediction === "t" ? "tails" : prediction;

      let message_text = "";

      if (playerPrediction === result) {
        db.addBalance(sender, betAmount);
        message_text = `🎉 YOU WON!\n\n🪙 Coin: ${result.toUpperCase()}\n🎯 Your Pick: ${playerPrediction.toUpperCase()}\n💰 Winnings: $${betAmount * 2}\n💵 New Balance: $${user.balance + betAmount}`;
      } else {
        db.subtractBalance(sender, betAmount);
        message_text = `😔 YOU LOST!\n\n🪙 Coin: ${result.toUpperCase()}\n🎯 Your Pick: ${playerPrediction.toUpperCase()}\n💸 Lost: $${betAmount}\n💵 New Balance: $${user.balance - betAmount}`;
      }

      await sock.sendMessage(jid, { text: message_text });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
