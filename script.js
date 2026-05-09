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
    ".block, .status-panel, .discord-text, .widget-frame, .credit-card, .credits-thanks",
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
