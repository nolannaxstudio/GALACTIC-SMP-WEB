(() => {
    const SERVER = "play.zyranex.fr";
    const API = `https://api.mcstatus.io/v2/status/java/${SERVER}`;
    const REFRESH_MS = 2000;

    const normalize = (raw) => {
        const players = raw.players || {};
        const list = Array.isArray(players.list) ? players.list : [];
        return {
            online: !!raw.online,
            players: {
                online: players.online ?? 0,
                max: players.max ?? 0,
                list: list.map((p) => ({
                    name:
                        p.name_clean ||
                        p.name_raw ||
                        p.name ||
                        (typeof p === "string" ? p : "?"),
                    uuid: p.uuid || null,
                })),
            },
        };
    };

    const chipDot = document.getElementById("status-chip-dot");
    const chipText = document.getElementById("status-chip-text");
    const stateDot = document.getElementById("state-dot");
    const stateText = document.getElementById("state-text");
    const stateFoot = document.getElementById("state-foot");
    const playersCurrent = document.getElementById("players-current");
    const playersMax = document.getElementById("players-max");
    const playersBar = document.getElementById("players-bar");
    const playersFoot = document.getElementById("players-foot");
    const pingText = document.getElementById("ping-text");
    const pingFoot = document.getElementById("ping-foot");
    const playersList = document.getElementById("players-list");
    const playersEmpty = document.getElementById("players-empty");
    const refreshBtn = document.getElementById("refresh-btn");
    const updatedText = document.getElementById("status-updated");
    const uptimeBars = document.getElementById("uptime-bars");
    const uptimePercent = document.getElementById("uptime-percent");
    const uptimeSummary = document.getElementById("uptime-summary");

    const HISTORY_KEY = "zyranex_uptime_history_v1";
    const HISTORY_DAYS = 60;

    const PLAYERS_KEY = "zyranex_players_history_v1";
    const PLAYERS_MAX_SAMPLES = 80;
    const PLAYERS_WINDOW_MS = 24 * 3600 * 1000;
    const PLAYERS_MIN_INTERVAL_MS = 15 * 1000;
    const SVG_NS = "http://www.w3.org/2000/svg";

    let timer = null;

    const clearChildren = (node) => {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    };

    const setText = (el, value) => {
        if (!el) return;
        const v = String(value);
        if (el.textContent !== v) el.textContent = v;
    };

    const setStyle = (el, prop, value) => {
        if (!el) return;
        if (el.style[prop] !== value) el.style[prop] = value;
    };

    let lastOnlineState = null;

    const setOnlineUI = (online) => {
        if (online === lastOnlineState) return;
        lastOnlineState = online;
        if (online) {
            setStyle(chipDot, "background", "var(--ok)");
            setStyle(chipDot, "boxShadow", "0 0 8px var(--ok)");
            setText(chipText, "SERVEUR EN LIGNE");
            stateDot.classList.remove("dot-warn", "dot-err");
            setText(stateText, "EN LIGNE");
            setStyle(stateText, "color", "var(--ok)");
            setText(stateFoot, "Serveur accessible");
        } else {
            setStyle(chipDot, "background", "var(--err)");
            setStyle(chipDot, "boxShadow", "0 0 8px var(--err)");
            setText(chipText, "SERVEUR HORS LIGNE");
            stateDot.classList.add("dot-err");
            setText(stateText, "HORS LIGNE");
            setStyle(stateText, "color", "var(--err)");
            setText(stateFoot, "Serveur injoignable");
        }
    };

    const playerModal = document.getElementById("player-modal");
    const playerModalOverlay = document.getElementById(
        "player-modal-overlay",
    );
    const playerModalClose = document.getElementById("player-modal-close");
    const playerModalAvatar = document.getElementById("player-modal-avatar");
    const playerModalName = document.getElementById("player-modal-name");
    const playerLinkNamemc = document.getElementById("player-link-namemc");
    const playerLinkCrafty = document.getElementById("player-link-crafty");

    const namemcUrl = (name, uuid) =>
        uuid
            ? `https://fr.namemc.com/profile/${uuid}`
            : `https://fr.namemc.com/profile/${encodeURIComponent(name)}`;

    const craftyUrl = (name, uuid) =>
        uuid
            ? `https://crafty.gg/players/${uuid}`
            : `https://crafty.gg/players/${encodeURIComponent(name)}`;

    const avatarUrl = (name, uuid, size) => {
        const id = uuid || encodeURIComponent(name);
        return `https://mc-heads.net/avatar/${id}/${size}`;
    };

    const openPlayerModal = (name, uuid) => {
        if (!playerModal) return;
        const src = avatarUrl(name, uuid, 96);
        playerModalAvatar.onerror = () => {
            playerModalAvatar.onerror = null;
            playerModalAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(
                name,
            )}/96`;
        };
        playerModalAvatar.src = src;
        playerModalAvatar.alt = name;
        setText(playerModalName, name);
        playerLinkNamemc.href = namemcUrl(name, uuid);
        playerLinkCrafty.href = craftyUrl(name, uuid);
        playerModal.hidden = false;
        document.body.style.overflow = "hidden";
    };

    const closePlayerModal = () => {
        if (!playerModal) return;
        playerModal.hidden = true;
        document.body.style.overflow = "";
    };

    if (playerModal) {
        playerModalOverlay.addEventListener("click", closePlayerModal);
        playerModalClose.addEventListener("click", closePlayerModal);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !playerModal.hidden) {
                closePlayerModal();
            }
        });
    }

    let lastPlayersKey = null;
    const renderPlayers = (players) => {
        const list = (players && players.list) || [];
        const key = list
            .map((p) =>
                typeof p === "string" ? p : `${p.uuid || ""}|${p.name || ""}`,
            )
            .sort()
            .join("§");
        if (key === lastPlayersKey) return;
        lastPlayersKey = key;
        clearChildren(playersList);
        if (list.length === 0) {
            playersEmpty.style.display = "block";
            playersList.style.display = "none";
            return;
        }
        playersEmpty.style.display = "none";
        playersList.style.display = "grid";
        list.forEach((p) => {
            const name = typeof p === "string" ? p : p.name || "?";
            const uuid = typeof p === "object" && p.uuid ? p.uuid : null;
            const li = document.createElement("li");
            li.className = "player-chip";
            li.setAttribute("role", "button");
            li.setAttribute("tabindex", "0");
            li.setAttribute(
                "aria-label",
                `Ouvrir les profils de ${name}`,
            );
            const avatar = document.createElement("img");
            avatar.className = "player-avatar";
            avatar.alt = name;
            avatar.loading = "lazy";
            avatar.src = avatarUrl(name, uuid, 48);
            const label = document.createElement("span");
            label.className = "player-name";
            label.textContent = name;
            li.appendChild(avatar);
            li.appendChild(label);

            const open = () => openPlayerModal(name, uuid);
            li.addEventListener("click", open);
            li.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                }
            });

            playersList.appendChild(li);
        });
    };

    const loadHistory = () => {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    };

    const saveHistory = (h) => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
        } catch {
            /* quota or disabled */
        }
    };

    const dayKey = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    let cachedHistory = null;
    let pendingHistorySave = null;
    const HISTORY_SAVE_DEBOUNCE_MS = 5000;

    const recordStatusToHistory = (online) => {
        if (cachedHistory === null) cachedHistory = loadHistory();
        const today = dayKey(new Date());
        const entry = cachedHistory[today] || { up: 0, down: 0 };
        if (online) entry.up += 1;
        else entry.down += 1;
        cachedHistory[today] = entry;

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - HISTORY_DAYS - 5);
        const cutoffKey = dayKey(cutoff);
        Object.keys(cachedHistory).forEach((k) => {
            if (k < cutoffKey) delete cachedHistory[k];
        });

        if (pendingHistorySave) clearTimeout(pendingHistorySave);
        pendingHistorySave = setTimeout(() => {
            saveHistory(cachedHistory);
            pendingHistorySave = null;
        }, HISTORY_SAVE_DEBOUNCE_MS);

        return cachedHistory;
    };

    window.addEventListener("pagehide", () => {
        if (pendingHistorySave && cachedHistory) {
            clearTimeout(pendingHistorySave);
            saveHistory(cachedHistory);
            pendingHistorySave = null;
        }
    });

    const classifyDay = (entry) => {
        if (!entry) return { cls: "unknown", pct: null };
        const total = entry.up + entry.down;
        if (total === 0) return { cls: "unknown", pct: null };
        const pct = (entry.up / total) * 100;
        let cls = "err";
        if (pct >= 99) cls = "ok";
        else if (pct >= 80) cls = "warn";
        return { cls, pct };
    };

    const formatDayLabel = (date) => {
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    let uptimeBuilt = false;
    let uptimeBarRefs = [];

    const buildUptimeBars = (days) => {
        clearChildren(uptimeBars);
        uptimeBarRefs = [];
        days.forEach((_d, idx) => {
            const bar = document.createElement("div");
            bar.className = "uptime-bar uptime-bar-unknown";
            if (idx === days.length - 1) {
                bar.classList.add("uptime-bar-today");
            }
            bar.style.animationDelay = `${Math.min(idx * 8, 600)}ms`;
            const tip = document.createElement("span");
            tip.className = "uptime-bar-tooltip";
            bar.appendChild(tip);
            uptimeBars.appendChild(bar);
            uptimeBarRefs.push({ el: bar, tip, cls: "unknown", tipText: "" });
        });
        uptimeBuilt = true;
    };

    const renderUptime = (history) => {
        const days = [];
        for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            days.push(d);
        }

        if (!uptimeBuilt || uptimeBarRefs.length !== days.length) {
            buildUptimeBars(days);
        }

        let totalUp = 0;
        let totalChecks = 0;
        let daysWithData = 0;

        days.forEach((d, idx) => {
            const ref = uptimeBarRefs[idx];
            const key = dayKey(d);
            const entry = history[key];
            const { cls, pct } = classifyDay(entry);
            if (entry && entry.up + entry.down > 0) {
                totalUp += entry.up;
                totalChecks += entry.up + entry.down;
                daysWithData += 1;
            }

            if (ref.cls !== cls) {
                ref.el.classList.remove(
                    "uptime-bar-ok",
                    "uptime-bar-warn",
                    "uptime-bar-err",
                    "uptime-bar-unknown",
                );
                ref.el.classList.add(`uptime-bar-${cls}`);
                ref.cls = cls;
            }

            let state = "Pas de données";
            if (pct !== null) {
                if (cls === "ok") state = `En ligne (${pct.toFixed(1)}%)`;
                else if (cls === "warn")
                    state = `Dégradé (${pct.toFixed(1)}%)`;
                else state = `Hors ligne (${pct.toFixed(1)}%)`;
            }
            const tipText = `${formatDayLabel(d).toUpperCase()} — ${state}`;
            if (ref.tipText !== tipText) {
                ref.tip.textContent = tipText;
                ref.tipText = tipText;
            }
        });

        if (totalChecks > 0) {
            const pct = (totalUp / totalChecks) * 100;
            setText(uptimePercent, pct.toFixed(2));
            setText(
                uptimeSummary,
                `${daysWithData} JOUR${daysWithData > 1 ? "S" : ""} SUIVI${
                    daysWithData > 1 ? "S" : ""
                }`,
            );
        } else {
            setText(uptimePercent, "—");
            setText(uptimeSummary, "PAS ENCORE D'HISTORIQUE");
        }
    };

    const formatTime = (date) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
            date.getSeconds(),
        )}`;
    };

    const formatHM = (date) => {
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const loadPlayersHistory = () => {
        try {
            const raw = localStorage.getItem(PLAYERS_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    };

    const savePlayersHistory = (arr) => {
        try {
            localStorage.setItem(PLAYERS_KEY, JSON.stringify(arr));
        } catch {
            /* ignore */
        }
    };

    const PLAYERS_ZERO_TAIL_LIMIT = 3;

    const recordPlayersSample = (count, max) => {
        let history = loadPlayersHistory();
        const now = Date.now();
        const last = history[history.length - 1];
        if (last && now - last.t < PLAYERS_MIN_INTERVAL_MS) {
            return history;
        }
        const c = Number(count) || 0;
        if (c === 0) {
            let trailingZeros = 0;
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].count === 0) trailingZeros++;
                else break;
            }
            if (trailingZeros >= PLAYERS_ZERO_TAIL_LIMIT) {
                return history;
            }
        }
        history.push({
            t: now,
            count: c,
            max: Number(max) || 0,
        });
        const cutoff = now - PLAYERS_WINDOW_MS;
        history = history.filter((s) => s.t >= cutoff);
        if (history.length > PLAYERS_MAX_SAMPLES) {
            history = history.slice(-PLAYERS_MAX_SAMPLES);
        }
        savePlayersHistory(history);
        return history;
    };

    const chartCurrent = document.getElementById("chart-current");
    const chartPeak = document.getElementById("chart-peak");
    const chartAvg = document.getElementById("chart-avg");
    const chartEmpty = document.getElementById("chart-empty");
    const chartSvg = document.getElementById("chart-svg");
    const chartScroller = document.getElementById("chart-scroller");
    const chartGrid = document.getElementById("chart-grid");
    const chartArea = document.getElementById("chart-area");
    const chartLine = document.getElementById("chart-line");
    const chartPoints = document.getElementById("chart-points");
    const chartFootFrom = document.getElementById("chart-foot-from");
    const chartFootTo = document.getElementById("chart-foot-to");

    const MIN_PX_PER_SAMPLE = 32;
    const CHART_H = 180;
    const chartTooltip = document.getElementById("chart-tooltip");
    const chartWrap = chartTooltip
        ? chartTooltip.parentElement
        : null;

    const showChartTooltip = (rect, timeStr, count) => {
        if (!chartTooltip || !chartWrap) return;
        const wrapBox = chartWrap.getBoundingClientRect();
        const pointBox = rect.getBoundingClientRect();
        const x = pointBox.left + pointBox.width / 2 - wrapBox.left;
        const y = pointBox.top - wrapBox.top;
        chartTooltip.style.left = `${x}px`;
        chartTooltip.style.top = `${y}px`;
        const label = `${count} joueur${count > 1 ? "s" : ""}`;
        chartTooltip.textContent = "";
        const timeEl = document.createElement("span");
        timeEl.className = "chart-tooltip-time";
        timeEl.textContent = timeStr;
        const sepEl = document.createElement("span");
        sepEl.className = "chart-tooltip-sep";
        sepEl.textContent = "//";
        const countEl = document.createElement("span");
        countEl.textContent = label;
        chartTooltip.appendChild(timeEl);
        chartTooltip.appendChild(sepEl);
        chartTooltip.appendChild(countEl);
        chartTooltip.classList.add("visible");
    };

    const hideChartTooltip = () => {
        if (chartTooltip) chartTooltip.classList.remove("visible");
    };

    if (chartScroller) {
        chartScroller.addEventListener("scroll", hideChartTooltip, {
            passive: true,
        });
    }

    let lastChartKey = null;
    let chartFirstRender = true;

    const isChartAtEnd = () => {
        if (!chartScroller) return true;
        const threshold = 32;
        return (
            chartScroller.scrollLeft + chartScroller.clientWidth >=
            chartScroller.scrollWidth - threshold
        );
    };

    const scrollChartToEnd = () => {
        if (!chartScroller) return;
        chartScroller.scrollLeft = chartScroller.scrollWidth;
    };

    const renderPlayersChart = (samples) => {
        const key = samples.map((s) => `${s.t}:${s.count}`).join(",");
        if (key === lastChartKey) return;
        lastChartKey = key;

        const wasAtEnd = chartFirstRender || isChartAtEnd();

        if (samples.length === 0) {
            setText(chartCurrent, "—");
            setText(chartPeak, "—");
            setText(chartAvg, "—");
            setText(
                chartEmpty,
                "Pas encore assez de données. Reviens dans quelques instants.",
            );
            chartEmpty.style.display = "block";
            chartLine.setAttribute("d", "");
            chartArea.setAttribute("d", "");
            clearChildren(chartPoints);
            clearChildren(chartGrid);
            setText(chartFootFrom, "—");
            return;
        }

        const counts = samples.map((s) => s.count);
        const cur = counts[counts.length - 1];
        const peak = Math.max(...counts);
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

        setText(chartCurrent, cur);
        setText(chartPeak, peak);
        setText(chartAvg, avg.toFixed(1));

        if (samples.length === 1) {
            chartEmpty.style.display = "block";
            setText(
                chartEmpty,
                "Premier relevé enregistré. Le graphique apparaîtra au prochain.",
            );
            chartLine.setAttribute("d", "");
            chartArea.setAttribute("d", "");
            clearChildren(chartPoints);
            clearChildren(chartGrid);
            setText(chartFootFrom, formatHM(new Date(samples[0].t)));
            return;
        }

        chartEmpty.style.display = "none";

        const padL = 18;
        const padR = 18;
        const padT = 16;
        const padB = 16;
        const H = CHART_H;
        const containerW = chartScroller
            ? chartScroller.clientWidth
            : 600;
        const dataW = samples.length * MIN_PX_PER_SAMPLE;
        const W = Math.max(containerW, dataW + padL + padR);
        const plotW = W - padL - padR;
        const plotH = H - padT - padB;

        chartSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        chartSvg.setAttribute("width", W);
        chartSvg.setAttribute("height", H);

        const yMax = Math.max(peak, 1) * 1.25 + 1;

        const xOf = (i) =>
            padL + (i / Math.max(1, samples.length - 1)) * plotW;
        const yOf = (v) => padT + plotH - (v / yMax) * plotH;

        let lineD = "";
        samples.forEach((s, i) => {
            const x = xOf(i).toFixed(2);
            const y = yOf(s.count).toFixed(2);
            lineD += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
        });
        chartLine.setAttribute("d", lineD);

        const baseline = (padT + plotH).toFixed(2);
        const firstX = xOf(0).toFixed(2);
        const lastX = xOf(samples.length - 1).toFixed(2);
        let areaD = `M ${firstX},${baseline}`;
        samples.forEach((s, i) => {
            areaD += ` L ${xOf(i).toFixed(2)},${yOf(s.count).toFixed(2)}`;
        });
        areaD += ` L ${lastX},${baseline} Z`;
        chartArea.setAttribute("d", areaD);

        clearChildren(chartGrid);
        for (let i = 0; i <= 4; i++) {
            const y = padT + (i / 4) * plotH;
            const ln = document.createElementNS(SVG_NS, "line");
            ln.setAttribute("x1", padL);
            ln.setAttribute("x2", W - padR);
            ln.setAttribute("y1", y);
            ln.setAttribute("y2", y);
            chartGrid.appendChild(ln);
        }

        hideChartTooltip();
        clearChildren(chartPoints);
        const POINT_SIZE = 10;
        const half = POINT_SIZE / 2;
        samples.forEach((s, i) => {
            const rect = document.createElementNS(SVG_NS, "rect");
            const x = xOf(i) - half;
            const y = yOf(s.count) - half;
            rect.setAttribute("x", x.toFixed(2));
            rect.setAttribute("y", y.toFixed(2));
            rect.setAttribute("width", POINT_SIZE);
            rect.setAttribute("height", POINT_SIZE);
            rect.setAttribute("rx", 2);
            rect.setAttribute("class", "chart-point");
            const timeStr = formatHM(new Date(s.t));
            const count = s.count;
            rect.addEventListener("mouseenter", () =>
                showChartTooltip(rect, timeStr, count),
            );
            rect.addEventListener("mouseleave", hideChartTooltip);
            chartPoints.appendChild(rect);
        });

        setText(chartFootFrom, formatHM(new Date(samples[0].t)));
        setText(chartFootTo, "MAINTENANT");

        if (wasAtEnd) {
            requestAnimationFrame(scrollChartToEnd);
            chartFirstRender = false;
        }
    };

    const fetchStatus = async () => {
        const start = performance.now();
        try {
            const res = await fetch(API, { cache: "no-store" });
            const raw = await res.json();
            const data = normalize(raw);
            const elapsed = Math.round(performance.now() - start);

            const online = data.online;
            setOnlineUI(online);
            const history = recordStatusToHistory(online);
            renderUptime(history);

            if (online) {
                const cur = data.players?.online ?? 0;
                const max = data.players?.max ?? 0;
                setText(playersCurrent, cur);
                setText(playersMax, max);
                const pct = max > 0 ? Math.min(100, (cur / max) * 100) : 0;
                setStyle(playersBar, "width", `${pct}%`);
                setText(
                    playersFoot,
                    cur === 0
                        ? "Aucun joueur connecté"
                        : cur === 1
                          ? "1 joueur connecté"
                          : `${cur} joueurs connectés`,
                );

                setText(pingText, elapsed);
                setText(
                    pingFoot,
                    elapsed < 150
                        ? "Excellente connexion"
                        : elapsed < 400
                          ? "Connexion correcte"
                          : "Connexion lente",
                );

                renderPlayers(data.players);

                const samples = recordPlayersSample(cur, max);
                renderPlayersChart(samples);
            } else {
                setText(playersCurrent, "0");
                setText(playersMax, "—");
                setStyle(playersBar, "width", "0%");
                setText(playersFoot, "Serveur indisponible");
                setText(pingText, "—");
                setText(pingFoot, "Aucune réponse");
                renderPlayers({ list: [] });
            }
        } catch (err) {
            setOnlineUI(false);
            setText(stateFoot, "Erreur réseau");
            renderPlayers({ list: [] });
        } finally {
            setText(
                updatedText,
                `Dernière mise à jour : ${formatTime(new Date())}`,
            );
        }
    };

    const scheduleNext = () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            await fetchStatus();
            scheduleNext();
        }, REFRESH_MS);
    };

    const copyIpBtn = document.getElementById("copy-ip-btn");
    if (copyIpBtn) {
        copyIpBtn.addEventListener("click", async () => {
            const value = copyIpBtn.dataset.copy;
            const original = copyIpBtn.textContent.trim();
            try {
                await navigator.clipboard.writeText(value);
                copyIpBtn.textContent = "COPIE !";
            } catch {
                copyIpBtn.textContent = "ERREUR";
            }
            setTimeout(() => {
                copyIpBtn.textContent = original;
            }, 1400);
        });
    }

    refreshBtn.addEventListener("click", async () => {
        refreshBtn.disabled = true;
        const orig = refreshBtn.textContent;
        refreshBtn.textContent = "CHARGEMENT...";
        await fetchStatus();
        refreshBtn.textContent = orig;
        refreshBtn.disabled = false;
        scheduleNext();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            fetchStatus();
            scheduleNext();
        } else {
            clearTimeout(timer);
        }
    });

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            lastChartKey = null;
            renderPlayersChart(loadPlayersHistory());
        }, 180);
    });

    renderUptime(loadHistory());
    renderPlayersChart(loadPlayersHistory());
    fetchStatus().then(scheduleNext);
})();
