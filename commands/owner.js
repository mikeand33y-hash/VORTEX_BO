/**
 * Owner Command
 * Shows owner information
 */

import { settings } from "../settings.js";

export default {
  name: "owner",
  aliases: ["creator", "dev", "developer"],
  description: "Display owner information",
  category: "User Info",
  role: "user",
  groupOnly: false,
  privateOnly: false,

  async execute({ sock, message, args, text, sender, jid, isGroup, db, prefix }) {
    try {
      const ownerNumber = settings.ownerNumber.replace("@s.whatsapp.net", "");
      const ownerName = settings.ownerName;

      const response = `╭─── *VORTEX-MD OWNER* ───╮
│
│ 👤 *Name:* ${ownerName}
│ 📱 *Number:* +${ownerNumber}
│ 🤖 *Bot:* ${settings.botName}
│ 📌 *Version:* ${settings.botVersion}
│ 
│ *To contact owner:*
│ .request <message>
│
╰──────────────────────╯`;

      const buttonMessage = {
        text: response,
        buttons: [
          {
            buttonId: `.request Hi owner`,
            buttonText: { displayText: "Contact Owner" },
            type: 1,
          },
        ],
        headerType: 1,
      };

      await sock.sendMessage(jid, buttonMessage);

      db.incrementStats("commandsExecuted");
    } catch (error) {
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`,
      });
    }
  },
};
