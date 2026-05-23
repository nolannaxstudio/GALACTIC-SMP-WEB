# ZYRANEX Web

Site vitrine statique du serveur Minecraft **ZYRANEX**.

Le site présente les mini-jeux, les liens communautaires, les crédits, les pages
légales et les informations de sécurité du projet.

## Pages

- `index.html` : page d'accueil, mini-jeux, IP serveur et appel Discord.
- `credits.html` : crédits du projet et contributeurs.
- `maintenance.html` : page d'indisponibilité stylisée.
- `status.html` : redirection vers le statut public.
- `terms.html` : conditions d'utilisation.
- `privacy.html` : politique de confidentialité.
- `SECURITY.md` : politique de signalement des failles.

## Lancement local

Le projet ne nécessite pas de build. Il suffit de servir les fichiers statiques :

```bash
python3 -m http.server 4173
```

Puis ouvrir :

```text
http://localhost:4173/index.html
```

## Structure

```text
.
├── index.html
├── credits.html
├── maintenance.html
├── status.html
├── terms.html
├── privacy.html
├── styles.css
├── script.js
├── SECURITY.md
└── assets image/logo
```

## Mini-jeux affichés

- Cache Cache
- Spleef
- Pillar of Fortune
- PvP
- PvP Mace
- Freebuild

Les cartes de mini-jeux utilisent actuellement des placeholders d'image. Les
captures ou visuels finaux pourront remplacer ces emplacements plus tard.

## Contribution

Avant de proposer une modification :

- Vérifier le rendu mobile et desktop.
- Garder le style pixel/arcade cohérent avec l'identité ZYRANEX.
- Eviter les liens externes sans `rel="noopener noreferrer"` lorsqu'ils
  s'ouvrent dans un nouvel onglet.
- Ne jamais ajouter de clé API, token ou secret dans le dépôt.

Pour une faille de sécurité, consulter `SECURITY.md` et ne pas ouvrir d'issue
publique.
