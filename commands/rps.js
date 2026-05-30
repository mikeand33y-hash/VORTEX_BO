/**
 * Rock Paper Scissors Command
 * Play RPS against the bot
 */

export default {
  name: "rps",
  aliases: ["rockpaperscissors", "play"],
  description: "Play rock paper scissors with the bot",
  category: "Games",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      if (args.length < 2) {
        await sock.sendMessage(jid, {
          text: `❌ Usage: ${prefix}rps <rock|paper|scissors> [amount]\n💡 Default bet: 100`,
        });
        return;
      }

      const choices = ["rock", "paper", "scissors", "r", "p", "s"];
      const userChoice = args[0].toLowerCase();

      if (!choices.includes(userChoice)) {
        await sock.sendMessage(jid, {
          text: `❌ Choose: rock, paper, or scissors`,
        });
        return;
      }

      let betAmount = parseInt(args[1]) || 100;
      const user = db.getUser(sender);

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

      const optionMap = { r: "rock", p: "paper", s: "scissors" };
      const playerChoice = optionMap[userChoice] || userChoice;
      const botChoice = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];

      let result_text = "";
      let winnings = 0;

      if (playerChoice === botChoice) {
        result_text = `🟡 IT'S A TIE!\n\n✋ You: ${playerChoice.toUpperCase()}\n✋ Bot: ${botChoice.toUpperCase()}\n💰 Bet Returned: $${betAmount}`;
      } else if (
        (playerChoice === "rock" && botChoice === "scissors") ||
        (playerChoice === "paper" && botChoice === "rock") ||
        (playerChoice === "scissors" && botChoice === "paper")
      ) {
        db.addBalance(sender, betAmount);
        result_text = `🎉 YOU WON!\n\n✋ You: ${playerChoice.toUpperCase()}\n✋ Bot: ${botChoice.toUpperCase()}\n💰 Winnings: $${betAmount * 2}\n💵 New Balance: $${user.balance + betAmount}`;
      } else {
        db.subtractBalance(sender, betAmount);
        result_text = `😔 YOU LOST!\n\n✋ You: ${playerChoice.toUpperCase()}\n✋ Bot: ${botChoice.toUpperCase()}\n💸 Lost: $${betAmount}\n💵 New Balance: $${user.balance - betAmount}`;
      }

      await sock.sendMessage(jid, { text: result_text });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
