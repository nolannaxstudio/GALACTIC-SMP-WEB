# ZYRANEX Web

Site vitrine statique du serveur Minecraft **ZYRANEX**.

Le site présente les mini-jeux, les liens communautaires, les crédits, les pages
légales et les informations de sécurité du projet.

## Pages

- `index.html` : page d'accueil, mini-jeux, IP serveur et appel Discord.
- `articles/index.html` : liste des articles et recherche (`/articles/`).
- `articles/detail/index.html` : lecture d'un article via `?slug=...`.
- `credits/index.html` : crédits du projet et contributeurs.
- `404.html` : page affichée lorsqu'une URL n'existe pas.
- `maintenance/index.html` : page d'indisponibilité stylisée.
- `offline/index.html` : page chargée automatiquement lorsque le réseau est coupé.
- `status/index.html` : redirection locale vers le statut public.
- `terms/index.html` : conditions d'utilisation.
- `privacy/index.html` : politique de confidentialité.
- `_redirects` : redirections Netlify pour garder les anciennes URLs `.html`.
- `SECURITY.md` : politique de signalement des failles.
- `docs/articles.md` : guide d'édition des articles.

## Lancement local

Le projet ne nécessite pas de build. Il suffit de servir les fichiers statiques :

```bash
python3 -m http.server 4173
```

Puis ouvrir :

```text
http://localhost:4173/
```

Sur Netlify, `_redirects` garde les anciennes URLs comme `/articles.html` et
les renvoie vers les nouvelles URLs propres comme `/articles/`.

Un service worker (`sw.js`) met en cache la page hors ligne et les assets
essentiels. Après une première visite en ligne, les navigations HTML échouées
affichent automatiquement `/offline/`.

## Structure

```text
.
├── index.html
├── 404.html
├── _redirects
├── sw.js
├── articles/
│   ├── index.html
│   └── detail/
│       └── index.html
├── credits/
│   └── index.html
├── terms/
│   └── index.html
├── privacy/
│   └── index.html
├── maintenance/
│   └── index.html
├── offline/
│   └── index.html
├── status/
│   └── index.html
├── data/
│   └── articles.json
├── admin/
│   ├── config.yml
│   └── index.html
├── SECURITY.md
├── docs/
│   └── articles.md
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── script.js
    └── images/
        ├── brand/
        ├── articles/
        ├── games/
        └── spawn.webp
```

## Mini-jeux affichés

- Cache Cache
- The Bridge
- Pillar of Fortune
- PvP
- PvP Mace
- Freebuild

Les captures des mini-jeux sont rangées dans `assets/images/games/`. L'image
du spawn sert de fond à la section d'accueil.

## Articles

Les articles affichés sur l'accueil, `/articles/` et `/articles/detail/` sont
stockés dans `data/articles.json`.

Pour une édition confortable sans développeur, le dossier `admin/` fournit une
configuration Decap CMS compatible avec Netlify gratuit + Git Gateway. Voir
`docs/articles.md` pour le flux recommandé et les champs disponibles.

## Contribution

Avant de proposer une modification :

- Vérifier le rendu mobile et desktop.
- Garder le style pixel/arcade cohérent avec l'identité ZYRANEX.
- Éviter les liens externes sans `rel="noopener noreferrer"` lorsqu'ils
  s'ouvrent dans un nouvel onglet.
- Ne jamais ajouter de clé API, token ou secret dans le dépôt.

Pour une faille de sécurité, consulter `SECURITY.md` et ne pas ouvrir d'issue
publique.
