const menuToggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector("header");

if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .catch((error) => console.warn("Service worker:", error));
    });
}

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

document.querySelectorAll("[data-reload-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
        window.location.reload();
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

let revealObserver = null;

const addReveal = (el) => {
    if (!el) return;
    el.classList.add("reveal");

    if (!revealObserver) {
        el.classList.add("in-view");
        return;
    }

    revealObserver.observe(el);
};

if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 },
    );
}

document
    .querySelectorAll(
        ".minigame-card, .feature-card, .status-panel, .discord-text, .credit-card, .credits-thanks, .legal-row, .article-search-panel, .article-detail",
    )
    .forEach(addReveal);

const articleLists = document.querySelectorAll("[data-article-list]");
const articleDetail = document.querySelector("[data-article-detail]");
const articleSearch = document.querySelector("[data-article-search]");
const articleCount = document.querySelector("[data-article-count]");
let articlesPromise = null;

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
});

const normalizeText = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const formatArticleDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date à venir";
    return dateFormatter.format(date);
};

const getArticleTimestamp = (article) => {
    const timestamp = new Date(article.date).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getArticleUrl = (article) =>
    `/articles/detail/?slug=${encodeURIComponent(article.slug || "")}`;

const getArticleImage = (article) => article.image || "/assets/images/spawn.webp";

const getArticleImageFit = (article) =>
    article.imageFit === "cover" ? "cover" : "contain";

const getArticleImagePosition = (article) => {
    const position = String(article.imagePosition || "center center").trim();
    return /^[\w\s%.+-]+$/.test(position) ? position : "center center";
};

const getCssUrl = (value) =>
    `url("${String(value).replace(/["\\\n\r]/g, "")}")`;

const applyArticleImage = (media, image, article) => {
    const imageUrl = getArticleImage(article);
    const imageFit = getArticleImageFit(article);
    const imagePosition = getArticleImagePosition(article);

    media.classList.add(`article-image-${imageFit}`);
    media.style.setProperty("--article-image", getCssUrl(imageUrl));
    media.style.setProperty("--article-image-fit", imageFit);
    media.style.setProperty("--article-image-position", imagePosition);
    media.style.setProperty(
        "--article-image-padding",
        imageFit === "cover" ? "0px" : "12px",
    );

    image.src = imageUrl;
    image.alt =
        article.imageAlt ||
        `Illustration de l'article ${article.title || "ZYRANEX"}`;
};

const getArticleParagraphs = (article) => {
    if (Array.isArray(article.content)) {
        return article.content
            .map((item) =>
                typeof item === "string"
                    ? item
                    : item?.paragraph || item?.text || "",
            )
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return String(article.content || "")
        .split(/\n{2,}/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const sortArticles = (articles) =>
    [...articles]
        .filter((article) => article && article.published !== false)
        .sort((a, b) => {
            const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
            if (featuredDiff !== 0) return featuredDiff;
            return getArticleTimestamp(b) - getArticleTimestamp(a);
        });

const fetchArticles = () => {
    if (!articlesPromise) {
        articlesPromise = fetch("/data/articles.json", {
            cache: "no-cache",
            headers: { Accept: "application/json" },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Articles HTTP ${response.status}`);
                }
                return response.json();
            })
            .then((data) => sortArticles(data.articles || []));
    }

    return articlesPromise;
};

const makeEl = (tagName, className, text) => {
    const el = document.createElement(tagName);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
};

const buildArticleSearchText = (article) =>
    normalizeText(
        [
            article.title,
            article.excerpt,
            article.category,
            article.author,
            article.imageAlt,
            ...(getArticleParagraphs(article) || []),
        ].join(" "),
    );

const createArticleCard = (article) => {
    const card = makeEl("article", "article-card");
    if (article.featured) card.classList.add("article-card-featured");
    card.dataset.search = buildArticleSearchText(article);

    const href = getArticleUrl(article);
    const media = makeEl("a", "article-card-media");
    media.href = href;
    media.setAttribute("aria-label", `Lire ${article.title}`);

    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    applyArticleImage(media, image, article);
    media.appendChild(image);

    const content = makeEl("div", "article-card-content");
    const meta = makeEl("div", "article-meta");
    meta.appendChild(makeEl("span", "article-category", article.category || "Annonce"));
    meta.appendChild(makeEl("span", "article-date", formatArticleDate(article.date)));

    const title = makeEl("h3", "article-card-title");
    const titleLink = makeEl("a", "", article.title || "Article sans titre");
    titleLink.href = href;
    title.appendChild(titleLink);

    const excerpt = makeEl(
        "p",
        "article-card-excerpt",
        article.excerpt || "Article ZYRANEX.",
    );

    const foot = makeEl("div", "article-card-foot");
    foot.appendChild(makeEl("span", "article-author", article.author || "Staff ZYRANEX"));
    const cta = makeEl("a", "article-card-link", "CONSULTER");
    cta.href = href;
    foot.appendChild(cta);

    content.appendChild(meta);
    content.appendChild(title);
    content.appendChild(excerpt);
    content.appendChild(foot);

    card.appendChild(media);
    card.appendChild(content);
    addReveal(card);

    return card;
};

const renderArticleEmpty = (container, message) => {
    container.textContent = "";
    container.appendChild(makeEl("div", "article-empty", message));
};

const renderArticleList = (container, articles, query) => {
    const limit = Number(container.dataset.limit || 0);
    const normalizedQuery = normalizeText(query);
    const filtered = normalizedQuery
        ? articles.filter((article) => buildArticleSearchText(article).includes(normalizedQuery))
        : articles;
    const visible = limit > 0 ? filtered.slice(0, limit) : filtered;

    container.textContent = "";

    if (visible.length === 0) {
        renderArticleEmpty(
            container,
            container.dataset.empty || "Aucun article publié pour le moment.",
        );
        return { filtered: filtered.length, visible: 0 };
    }

    visible.forEach((article) => container.appendChild(createArticleCard(article)));
    return { filtered: filtered.length, visible: visible.length };
};

const updateArticleCount = (total, filtered, query) => {
    if (!articleCount) return;

    if (query) {
        articleCount.textContent =
            filtered > 1
                ? `${filtered} articles trouvés`
                : `${filtered} article trouvé`;
        return;
    }

    articleCount.textContent =
        total > 1 ? `${total} articles publiés` : `${total} article publié`;
};

const renderArticleError = (message) => {
    articleLists.forEach((container) => renderArticleEmpty(container, message));
    if (articleDetail) {
        articleDetail.textContent = "";
        articleDetail.appendChild(makeEl("p", "article-empty", message));
    }
    if (articleCount) articleCount.textContent = "Articles indisponibles";
};

const renderArticleNotFound = () => {
    const title = document.querySelector("[data-article-title]");
    const excerpt = document.querySelector("[data-article-excerpt]");
    const kicker = document.querySelector("[data-article-detail-kicker]");

    document.title = "Article introuvable - ZYRANEX";
    if (kicker) kicker.textContent = "// ARTICLE INTROUVABLE";
    if (title) title.textContent = "ARTICLE INTROUVABLE";
    if (excerpt) {
        excerpt.textContent =
            "Cet article n'existe pas ou n'est plus publié sur le site.";
    }

    articleDetail.textContent = "";
    const panel = makeEl("div", "article-missing-panel");
    panel.appendChild(
        makeEl(
            "p",
            "",
            "Le lien pointe vers un article absent du fichier de données.",
        ),
    );

    const actions = makeEl("div", "article-detail-actions");
    const back = makeEl("a", "pix-btn pix-btn-primary", "VOIR LES ARTICLES");
    back.href = "/articles/";
    actions.appendChild(back);
    panel.appendChild(actions);

    articleDetail.appendChild(panel);
};

const renderArticleDetail = (articles) => {
    if (!articleDetail) return;

    const slug = new URLSearchParams(window.location.search).get("slug");
    const article = articles.find((item) => item.slug === slug);

    if (!slug || !article) {
        renderArticleNotFound();
        return;
    }

    const title = document.querySelector("[data-article-title]");
    const excerpt = document.querySelector("[data-article-excerpt]");
    const kicker = document.querySelector("[data-article-detail-kicker]");
    const description = document.querySelector("[data-article-description]");

    document.title = `${article.title} - ZYRANEX`;
    if (description) {
        description.setAttribute("content", article.excerpt || article.title);
    }
    if (kicker) kicker.textContent = `// ${article.category || "ARTICLE"}`;
    if (title) title.textContent = article.title || "Article ZYRANEX";
    if (excerpt) excerpt.textContent = article.excerpt || "";

    articleDetail.textContent = "";

    const meta = makeEl("div", "article-detail-meta");
    meta.appendChild(makeEl("span", "article-category", article.category || "Annonce"));
    meta.appendChild(makeEl("span", "article-date", formatArticleDate(article.date)));
    meta.appendChild(makeEl("span", "article-author", article.author || "Staff ZYRANEX"));

    const media = makeEl("div", "article-detail-media");
    const image = document.createElement("img");
    image.loading = "eager";
    image.decoding = "async";
    applyArticleImage(media, image, article);
    media.appendChild(image);

    const body = makeEl("div", "article-detail-body");
    getArticleParagraphs(article).forEach((paragraph) => {
        body.appendChild(makeEl("p", "", paragraph));
    });

    const actions = makeEl("div", "article-detail-actions");
    const back = makeEl("a", "pix-btn", "RETOUR AUX ARTICLES");
    back.href = "/articles/";
    actions.appendChild(back);

    articleDetail.appendChild(meta);
    articleDetail.appendChild(media);
    articleDetail.appendChild(body);
    articleDetail.appendChild(actions);
};

const initArticles = () => {
    if (!articleLists.length && !articleDetail) return;

    fetchArticles()
        .then((articles) => {
            const renderLists = () => {
                const query = articleSearch ? articleSearch.value.trim() : "";
                let filtered = articles.length;

                articleLists.forEach((container) => {
                    const result = renderArticleList(container, articles, query);
                    filtered = result.filtered;
                });

                updateArticleCount(articles.length, filtered, query);
            };

            renderLists();
            renderArticleDetail(articles);

            if (articleSearch) {
                articleSearch.addEventListener("input", renderLists);
            }
        })
        .catch((error) => {
            console.warn("Articles:", error);
            renderArticleError("Impossible de charger les articles.");
        });
};

initArticles();
