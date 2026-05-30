/**
 * Runtime Command
 * Shows bot uptime and system information
 */

export default {
  name: "runtime",
  aliases: ["uptime", "status"],
  description: "Display bot runtime and system information",
  category: "User Info",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      const uptime = process.uptime();
      const uptimeDays = Math.floor(uptime / 86400);
      const uptimeHours = Math.floor((uptime % 86400) / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);
      const uptimeSeconds = Math.floor(uptime % 60);

      const stats = db.getStats();
      const users = Object.keys(db.data.users).length;
      const groups = Object.keys(db.data.groups).length;

      // Memory usage
      const memUsage = process.memoryUsage();
      const memUsedMB = Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100;
      const memTotalMB = Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100;

      const response = `╭──── *VORTEX-MD RUNTIME* ────╮
│
│ ⏰ *Uptime:*
│    ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s
│
│ 📊 *Statistics:*
│    Messages: ${stats.messagesHandled}
│    Commands: ${stats.commandsExecuted}
│    Users: ${users}
│    Groups: ${groups}
│
│ 💾 *Memory Usage:*
│    ${memUsedMB}MB / ${memTotalMB}MB
│    (${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%)
│
│ 🖥️ *System:*
│    Platform: ${process.platform}
│    Node Version: ${process.version}
│
╰─────────────────────────────╯`;

      await sock.sendMessage(jid, { text: response });

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
