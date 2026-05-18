#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const SERVER = process.env.SERVER || "play.zyranex.fr";
const API_URL = `https://api.mcstatus.io/v2/status/java/${SERVER}`;
const HISTORY_DAYS = 60;
const PLAYERS_MAX_SAMPLES = 600;
const PLAYERS_WINDOW_MS = 24 * 3600 * 1000;
const DATA_PATH = path.join(__dirname, "..", "data", "history.json");

const fetchJson = (url) =>
    new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                if (res.statusCode !== 200) {
                    res.resume();
                    return reject(new Error(`HTTP ${res.statusCode}`));
                }
                let body = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => (body += chunk));
                res.on("end", () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (err) {
                        reject(err);
                    }
                });
            })
            .on("error", reject);
    });

const dayKey = (date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const loadHistory = () => {
    try {
        const raw = fs.readFileSync(DATA_PATH, "utf8");
        const parsed = JSON.parse(raw);
        return {
            uptime:
                parsed && typeof parsed.uptime === "object"
                    ? parsed.uptime
                    : {},
            players: Array.isArray(parsed?.players) ? parsed.players : [],
        };
    } catch {
        return { uptime: {}, players: [] };
    }
};

const saveHistory = (data) => {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(data));
};

const updateUptime = (uptime, online) => {
    const today = dayKey(new Date());
    const entry = uptime[today] || { up: 0, down: 0 };
    if (online) entry.up += 1;
    else entry.down += 1;
    uptime[today] = entry;

    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - HISTORY_DAYS - 5);
    const cutoffKey = dayKey(cutoff);
    Object.keys(uptime).forEach((k) => {
        if (k < cutoffKey) delete uptime[k];
    });

    return uptime;
};

const updatePlayers = (players, online, count, max) => {
    const now = Date.now();

    if (!online) return players;

    const c = Number(count) || 0;
    if (c === 0 && players.length >= 3) {
        let tail = 0;
        for (let i = players.length - 1; i >= 0; i--) {
            if (players[i].count === 0) tail += 1;
            else break;
        }
        if (tail >= 3) return players;
    }

    players.push({ t: now, count: c, max: Number(max) || 0 });

    const cutoff = now - PLAYERS_WINDOW_MS;
    let trimmed = players.filter((s) => s.t >= cutoff);
    if (trimmed.length > PLAYERS_MAX_SAMPLES) {
        trimmed = trimmed.slice(-PLAYERS_MAX_SAMPLES);
    }
    return trimmed;
};

const main = async () => {
    let status;
    try {
        status = await fetchJson(API_URL);
    } catch (err) {
        console.error(`Failed to fetch status: ${err.message}`);
        const history = loadHistory();
        history.uptime = updateUptime(history.uptime, false);
        history.updatedAt = new Date().toISOString();
        saveHistory(history);
        return;
    }

    const online = !!status.online;
    const count = status.players?.online ?? 0;
    const max = status.players?.max ?? 0;

    const history = loadHistory();
    history.uptime = updateUptime(history.uptime, online);
    history.players = updatePlayers(history.players, online, count, max);
    history.updatedAt = new Date().toISOString();

    saveHistory(history);
    console.log(
        `Saved: online=${online}, players=${count}/${max}, uptime_days=${
            Object.keys(history.uptime).length
        }, samples=${history.players.length}`,
    );
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
