(function () {
    const identity = window.netlifyIdentity;
    if (!identity) return;

    const authHashPattern =
        /(?:^|[&#])(invite_token|confirmation_token|recovery_token|access_token|error)=/;
    const hasAuthHash = authHashPattern.test(window.location.hash);
    const adminUrl = "/admin/";
    let callbackStarted = false;

    const isAdminPage = () =>
        window.location.pathname === "/admin/" ||
        window.location.pathname === "/admin/index.html";

    const redirectToAdmin = () => {
        if (isAdminPage()) return;
        window.location.assign(adminUrl);
    };

    const openIdentityFlow = () => {
        if (!hasAuthHash || callbackStarted) return;

        callbackStarted = true;

        try {
            const result =
                typeof identity.handleAuthCallback === "function"
                    ? identity.handleAuthCallback()
                    : typeof identity.open === "function"
                      ? identity.open()
                      : null;

            if (result && typeof result.catch === "function") {
                result.catch((error) => {
                    callbackStarted = false;
                    console.error("Netlify Identity callback failed:", error);
                    if (typeof identity.open === "function") {
                        identity.open();
                    }
                });
            }
        } catch (error) {
            callbackStarted = false;
            console.error("Netlify Identity callback failed:", error);
            if (typeof identity.open === "function") {
                identity.open();
            }
        }
    };

    const handleAuthenticatedUser = () => {
        if (hasAuthHash || isAdminPage()) {
            redirectToAdmin();
        }
    };

    if (typeof identity.on === "function") {
        identity.on("init", (user) => {
            openIdentityFlow();
            if (user) handleAuthenticatedUser();
        });
        identity.on("login", handleAuthenticatedUser);
    }

    if (hasAuthHash) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", openIdentityFlow, {
                once: true,
            });
        } else {
            window.setTimeout(openIdentityFlow, 0);
        }
    }
})();
