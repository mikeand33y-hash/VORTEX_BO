/**
 * Guess Number Command
 * Guess a number between 1-100
 */

export default {
  name: "guess",
  aliases: ["guessnumber", "number"],
  description: "Guess a number and win rewards",
  category: "Games",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      if (args.length < 2) {
        await sock.sendMessage(jid, {
          text: `❌ Usage: ${prefix}guess <1-100> [bet]\n💡 Default bet: 100`,
        });
        return;
      }

      const guess = parseInt(args[0]);
      let betAmount = parseInt(args[1]) || 100;
      const user = db.getUser(sender);

      // Validation
      if (isNaN(guess) || guess < 1 || guess > 100) {
        await sock.sendMessage(jid, {
          text: `❌ Please guess a number between 1-100`,
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

      // Generate random number
      const secret = Math.floor(Math.random() * 100) + 1;
      let result_msg = "";

      if (guess === secret) {
        db.addBalance(sender, betAmount * 10);
        result_msg = `🎉 JACKPOT! YOU GUESSED IT!\n\n🎯 Your Guess: ${guess}\n🔮 Secret: ${secret}\n💰 Prize: $${betAmount * 10}\n💵 New Balance: $${user.balance + betAmount * 10}`;
      } else if (Math.abs(guess - secret) <= 5) {
        db.addBalance(sender, betAmount * 2);
        result_msg = `🎊 VERY CLOSE!\n\n🎯 Your Guess: ${guess}\n🔮 Secret: ${secret}\n💰 Prize: $${betAmount * 2}\n💵 New Balance: $${user.balance + betAmount * 2}`;
      } else if (Math.abs(guess - secret) <= 20) {
        db.addBalance(sender, Math.floor(betAmount * 1.5));
        result_msg = `😊 CLOSE!\n\n🎯 Your Guess: ${guess}\n🔮 Secret: ${secret}\n💰 Prize: $${Math.floor(betAmount * 1.5)}\n💵 New Balance: $${user.balance + Math.floor(betAmount * 1.5)}`;
      } else {
        db.subtractBalance(sender, betAmount);
        result_msg = `😔 WRONG!\n\n🎯 Your Guess: ${guess}\n🔮 Secret: ${secret}\n💸 Lost: $${betAmount}\n💵 New Balance: $${user.balance - betAmount}`;
      }

      await sock.sendMessage(jid, { text: result_msg });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
