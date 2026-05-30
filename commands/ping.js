/**
 * Ping Command
 * Shows bot response time and connection status
 */

export default {
  name: "ping",
  aliases: ["p", "latency"],
  description: "Check bot response time and connection status",
  category: "User Info",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      // Send initial message to measure latency
      const timestamp = Date.now();
      const msg = await sock.sendMessage(jid, {
        text: "⏳ Pinging...",
      });

      // Calculate latency
      const latency = Date.now() - timestamp;

      // Get bot stats
      const stats = db.getStats();
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);
      const uptimeSeconds = Math.floor(uptime % 60);

      // Determine status color
      let status = "🟢 Excellent";
      if (latency > 100 && latency <= 200) status = "🟡 Good";
      else if (latency > 200 && latency <= 500) status = "🟠 Fair";
      else if (latency > 500) status = "🔴 Slow";

      const response = `╭─── *VORTEX-MD PING* ───╮
│
│ 📊 *Latency:* ${latency}ms
│ 📈 *Status:* ${status}
│ ⏰ *Uptime:* ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s
│ 💬 *Messages:* ${stats.messagesHandled}
│ 🎮 *Commands Executed:* ${stats.commandsExecuted}
│ 🔗 *Connection:* Connected ✅
│
╰──────────────────────╯`;

      // Edit the message with actual results
      await sock.sendMessage(jid, { text: response }, { quoted: msg });

      // Increment stats
      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
