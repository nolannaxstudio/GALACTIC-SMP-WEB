const menuToggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector("header");

const closeMenu = () => {
    if (!siteHeader || !menuToggle) return;
    siteHeader.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
};

if (siteHeader) {
    let lastScrollY = window.scrollY || 0;
    let ticking = false;
    const SHOW_BELOW = 80;
    const DELTA = 6;

    const updateHeaderVisibility = () => {
        const current = window.scrollY || 0;
        const diff = current - lastScrollY;

        if (current < SHOW_BELOW) {
            siteHeader.classList.remove("is-hidden");
        } else if (diff > DELTA) {
            if (siteHeader.classList.contains("menu-open")) closeMenu();
            siteHeader.classList.add("is-hidden");
        } else if (diff < -DELTA) {
            siteHeader.classList.remove("is-hidden");
        }

        lastScrollY = current;
        ticking = false;
    };

    window.addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                requestAnimationFrame(updateHeaderVisibility);
                ticking = true;
            }
        },
        { passive: true },
    );
}

if (menuToggle && siteHeader) {
    menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = siteHeader.classList.toggle("menu-open");
        menuToggle.setAttribute("aria-expanded", String(open));
    });

    document.querySelectorAll("nav a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (e) => {
        if (!siteHeader.classList.contains("menu-open")) return;
        if (!siteHeader.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (id.length > 1) {
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    });
});

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;

const currentPage = (() => {
    const path = window.location.pathname.split("/").pop();
    return path || "index.html";
})();

const isInternalPageLink = (link) => {
    if (!link) return false;
    if (link.target === "_blank") return false;
    if (link.hasAttribute("download")) return false;
    const href = link.getAttribute("href");
    if (!href) return false;
    if (href.startsWith("#")) return false;
    if (/^[a-z]+:/i.test(href) && !href.startsWith(window.location.origin)) {
        return false;
    }
    return /\.html(?:[?#].*)?$/.test(href);
};

document.querySelectorAll("a[href]").forEach((link) => {
    if (!isInternalPageLink(link)) return;

    const href = link.getAttribute("href");
    const targetPage = href.split(/[?#]/)[0];
    if (targetPage === currentPage) return;

    link.addEventListener("click", (e) => {
        if (
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
        ) {
            return;
        }
        if (prefersReducedMotion) return;

        e.preventDefault();
        document.body.classList.add("is-leaving");

        const go = () => {
            window.location.href = href;
        };

        let navigated = false;
        const safeGo = () => {
            if (navigated) return;
            navigated = true;
            go();
        };

        const onEnd = (ev) => {
            if (ev.target !== document.querySelector("main")) return;
            safeGo();
        };

        const main = document.querySelector("main");
        if (main) {
            main.addEventListener("animationend", onEnd, { once: true });
        }

        setTimeout(safeGo, 380);
    });
});

window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
        document.body.classList.remove("is-leaving");
    }
});

const missingPath = document.querySelector("[data-missing-path]");
if (missingPath) {
    const requestedPath = `${window.location.pathname}${window.location.search}`;
    missingPath.textContent =
        requestedPath && !/\/404\.html$/.test(window.location.pathname)
            ? requestedPath
            : "lien inconnu";
}

document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const value = btn.dataset.copy;
        try {
            await navigator.clipboard.writeText(value);
            const original = btn.textContent;
            btn.textContent = "COPIE !";
            btn.classList.add("copied");
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove("copied");
            }, 1400);
        } catch {
            btn.textContent = "ERREUR";
            setTimeout(() => {
                btn.textContent = "COPIER";
            }, 1400);
        }
    });
});

const kicker = document.querySelector(".kicker");
if (kicker) {
    const fullText = kicker.textContent.trim();
    kicker.textContent = "";

    const textNode = document.createTextNode("");
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.textContent = "_";
    kicker.appendChild(textNode);
    kicker.appendChild(caret);

    let i = 0;
    const typeNext = () => {
        if (i <= fullText.length) {
            textNode.nodeValue = fullText.slice(0, i);
            i++;
            setTimeout(typeNext, 45);
        }
    };
    setTimeout(typeNext, 200);
}

const revealTargets = document.querySelectorAll(
    ".minigame-card, .feature-card, .status-panel, .discord-text, .credit-card, .credits-thanks, .legal-row",
);
revealTargets.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                io.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 },
);

revealTargets.forEach((el) => io.observe(el));
