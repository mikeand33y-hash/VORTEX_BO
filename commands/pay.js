/**
 * Pay Command
 * Send money to another user
 */

export default {
  name: "pay",
  aliases: ["send", "transfer"],
  description: "Send money to another user",
  category: "Economy",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      if (args.length < 2) {
        await sock.sendMessage(jid, {
          text: `❌ Usage: ${prefix}pay @user <amount>`,
        });
        return;
      }

      let targetUser = args[0];
      if (!targetUser.includes("@")) {
        targetUser = targetUser.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      }

      const amount = parseInt(args[1]);

      // Validation
      if (isNaN(amount) || amount <= 0) {
        await sock.sendMessage(jid, {
          text: "❌ Amount must be a positive number",
        });
        return;
      }

      if (targetUser === sender) {
        await sock.sendMessage(jid, {
          text: "❌ You cannot pay yourself!",
        });
        return;
      }

      const senderUser = db.getUser(sender);
      if (senderUser.balance < amount) {
        await sock.sendMessage(jid, {
          text: `❌ Insufficient balance!\n💰 Your balance: $${senderUser.balance}`,
        });
        return;
      }

      // Process transfer
      db.subtractBalance(sender, amount);
      db.addBalance(targetUser, amount);

      const response = `✅ *Transfer Successful*\n\n💸 Amount: $${amount}\n📤 Sent to: ${targetUser}\n💰 New Balance: $${senderUser.balance - amount}`;

      await sock.sendMessage(jid, { text: response });

      // Notify recipient
      try {
        await sock.sendMessage(targetUser, {
          text: `🔔 *You received money!*\n\n💰 Amount: $${amount}\n📥 From: ${sender}\n💵 New Balance: $${senderUser.balance + amount}`,
        });
      } catch (e) {
        // Silently fail if recipient is not available
      }

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
