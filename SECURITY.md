# Politique de sécurité

Merci de contribuer à la sécurité de **ZYRANEX**. Ce document explique comment
signaler une faille et ce à quoi vous pouvez vous attendre en retour.

## Versions supportées

Seule la version déployée à partir de la branche `main` est activement
maintenue. Les forks et anciennes branches ne reçoivent pas de correctifs.

| Branche | Supportée |
| ------- | --------- |
| `main`  | ✅        |
| autres  | ❌        |

## Signaler une vulnérabilité

**Ne créez pas d'issue publique** pour une faille de sécurité.

Privilégiez l'un de ces canaux confidentiels :

1. **GitHub Security Advisories** (recommandé) — onglet
   `Security → Report a vulnerability` du dépôt. Le rapport reste privé tant
   qu'il n'est pas publié.
2. **Discord** — message privé à un membre du staff sur le serveur officiel :
   <https://discord.gg/rf8AcQwdMJ>

Incluez dans votre rapport :

- Une description claire du problème et son impact.
- Les étapes précises pour le reproduire (URL, payload, navigateur…).
- Une preuve de concept si possible (capture, log, snippet).
- Votre proposition de correctif si vous en avez une.

### Délais

| Étape                          | Délai indicatif       |
| ------------------------------ | --------------------- |
| Accusé de réception            | 72 h                  |
| Première évaluation            | 7 jours               |
| Correctif (selon la sévérité)  | 7 à 30 jours          |
| Publication coordonnée         | après déploiement     |

Nous communiquons publiquement sur la faille **uniquement après** que le
correctif soit déployé en production, et avec votre accord pour le crédit.

## Périmètre

Le projet est un site statique (HTML/CSS/JS) servi par **GitHub Pages**, avec
un workflow GitHub Actions qui agrège l'état du serveur Minecraft via une API
publique. Les éléments suivants entrent dans le périmètre :

- Code source du site (`*.html`, `*.css`, `*.js`).
- Workflow GitHub Actions (`.github/workflows/`) et script associé
  (`scripts/update-history.js`).
- Données générées dans `data/history.json`.
- Gestion des données locales du navigateur (`localStorage`).
- Liens externes intégrés (NameMC, Crafty.gg, Discord).

### Exemples de vulnérabilités recherchées

- **XSS** via données externes (pseudos de joueurs, MOTD, etc.).
- **Injection** dans le workflow GitHub Actions (commandes shell, paramètres
  non échappés).
- **Fuite d'informations sensibles** (clés API, secrets, tokens) dans le code
  ou les commits.
- **Atteinte à l'intégrité** du fichier `data/history.json` via une
  manipulation côté client.
- **CSRF / clickjacking** sur des fonctionnalités sensibles.
- **Dépendances** avec vulnérabilité connue (CVE).

## Hors périmètre

Les éléments suivants **ne sont pas considérés** comme des vulnérabilités du
projet :

- Vulnérabilités du serveur Minecraft lui-même (à signaler directement au
  staff du serveur via Discord).
- Bugs d'affichage, problèmes UX ou fautes d'orthographe (utilisez les
  issues GitHub publiques).
- Comportements des APIs tierces utilisées (`api.mcstatus.io`,
  `mc-heads.net`) : signalez-les directement aux fournisseurs concernés.
- Volumes de requêtes ou rate-limiting côté API tierce.
- Vulnérabilités exigeant un accès physique à la machine de l'utilisateur ou
  un compte déjà compromis.
- Attaques nécessitant des conditions irréalistes (versions de navigateur
  non maintenues, extensions malveillantes, etc.).
- Manque de headers HTTP qui sont contrôlés par GitHub Pages (le projet ne
  peut pas les modifier).

## Bonnes pratiques pour les contributeurs

Si vous contribuez au projet :

- **Ne committez jamais** de clés API, tokens, mots de passe ou variables
  d'environnement sensibles. Utilisez les `secrets` de GitHub Actions.
- **Échappez systématiquement** toute donnée externe injectée dans le DOM :
  privilégiez `textContent` à `innerHTML`.
- **Validez** toute entrée provenant d'une API externe avant de la stocker
  ou l'afficher.
- **Limitez les permissions** des workflows GitHub Actions au strict
  nécessaire (`permissions:` explicite).
- **Mettez à jour** régulièrement les dépendances et les actions GitHub
  (`@v4`, etc.).

## Reconnaissance

Les personnes ayant signalé des failles de manière responsable seront
mentionnées dans le fichier `CREDITS` ou la section dédiée du site, sauf
demande contraire de leur part.

---

Dernière mise à jour : 2026-05-18
