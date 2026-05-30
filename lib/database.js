/**
 * JSON Database System
 * Manages all bot data persistence
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "database");

export class Database {
  constructor() {
    this.data = {
      users: {},
      groups: {},
      economy: {},
      warns: {},
      settings: {},
      premium: [],
      blocked: [],
      stats: {
        messagesHandled: 0,
        commandsExecuted: 0,
        uptime: 0,
      },
    };
  }

  init() {
    if (!existsSync(dbPath)) {
      mkdirSync(dbPath, { recursive: true });
    }

    this.load();
  }

  load() {
    try {
      const filePath = join(dbPath, "database.json");
      if (existsSync(filePath)) {
        const raw = readFileSync(filePath, "utf-8");
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (error) {
      console.error("Error loading database:", error);
    }
  }

  save() {
    try {
      const filePath = join(dbPath, "database.json");
      writeFileSync(filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving database:", error);
    }
  }

  // User Methods
  getUser(jid) {
    if (!this.data.users[jid]) {
      this.data.users[jid] = {
        jid,
        username: "",
        role: "user",
        balance: 0,
        experience: 0,
        warns: 0,
        premium: false,
        premiumExpiry: null,
        joinedAt: Date.now(),
        commandsUsed: 0,
        lastDaily: null,
      };
      this.save();
    }
    return this.data.users[jid];
  }

  updateUser(jid, updates) {
    const user = this.getUser(jid);
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // Economy Methods
  addBalance(jid, amount) {
    const user = this.getUser(jid);
    user.balance += amount;
    this.save();
    return user.balance;
  }

  subtractBalance(jid, amount) {
    const user = this.getUser(jid);
    user.balance = Math.max(0, user.balance - amount);
    this.save();
    return user.balance;
  }

  getBalance(jid) {
    return this.getUser(jid).balance;
  }

  // Warn System
  addWarn(jid, reason = "No reason") {
    if (!this.data.warns[jid]) {
      this.data.warns[jid] = [];
    }

    this.data.warns[jid].push({
      reason,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(7),
    });

    const user = this.getUser(jid);
    user.warns = this.data.warns[jid].length;
    this.save();
    return this.data.warns[jid].length;
  }

  getWarns(jid) {
    return this.data.warns[jid] || [];
  }

  clearWarns(jid) {
    this.data.warns[jid] = [];
    const user = this.getUser(jid);
    user.warns = 0;
    this.save();
  }

  // Group Methods
  getGroup(jid) {
    if (!this.data.groups[jid]) {
      this.data.groups[jid] = {
        jid,
        name: "",
        admins: [],
        members: [],
        settings: {
          antiLink: true,
          antiSpam: true,
          antiBot: true,
          welcome: true,
          goodbye: true,
          muted: false,
        },
        createdAt: Date.now(),
      };
      this.save();
    }
    return this.data.groups[jid];
  }

  updateGroup(jid, updates) {
    const group = this.getGroup(jid);
    Object.assign(group, updates);
    this.save();
    return group;
  }

  updateGroupSettings(jid, settings) {
    const group = this.getGroup(jid);
    group.settings = { ...group.settings, ...settings };
    this.save();
    return group;
  }

  // Premium Methods
  addPremium(jid, days = 30) {
    const user = this.getUser(jid);
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    user.premium = true;
    user.premiumExpiry = expiry;

    if (!this.data.premium.includes(jid)) {
      this.data.premium.push(jid);
    }

    this.save();
    return expiry;
  }

  removePremium(jid) {
    const user = this.getUser(jid);
    user.premium = false;
    user.premiumExpiry = null;
    this.data.premium = this.data.premium.filter((id) => id !== jid);
    this.save();
  }

  isPremium(jid) {
    const user = this.getUser(jid);
    if (user.premium && user.premiumExpiry) {
      if (user.premiumExpiry > Date.now()) {
        return true;
      } else {
        this.removePremium(jid);
        return false;
      }
    }
    return false;
  }

  // Block Methods
  blockUser(jid) {
    if (!this.data.blocked.includes(jid)) {
      this.data.blocked.push(jid);
      this.save();
    }
  }

  unblockUser(jid) {
    this.data.blocked = this.data.blocked.filter((id) => id !== jid);
    this.save();
  }

  isBlocked(jid) {
    return this.data.blocked.includes(jid);
  }

  // Stats Methods
  incrementStats(stat) {
    if (this.data.stats[stat] !== undefined) {
      this.data.stats[stat]++;
      this.save();
    }
  }

  getStats() {
    return this.data.stats;
  }

  // Leaderboard Methods
  getTopUsers(limit = 10, stat = "balance") {
    return Object.values(this.data.users)
      .sort((a, b) => b[stat] - a[stat])
      .slice(0, limit)
      .map((user, index) => ({
        rank: index + 1,
        ...user,
      }));
  }

  // Backup Methods
  backup() {
    const backupPath = join(dbPath, `backup_${Date.now()}.json`);
    writeFileSync(backupPath, JSON.stringify(this.data, null, 2), "utf-8");
    return backupPath;
  }

  // Settings Methods
  getSetting(key) {
    return this.data.settings[key];
  }

  setSetting(key, value) {
    this.data.settings[key] = value;
    this.save();
  }
}
