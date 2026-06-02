# Guide articles ZYRANEX

Le site reste statique: aucune base de données ni serveur payant n'est
nécessaire. Les articles sont lus depuis `data/articles.json`, puis affichés par
`assets/js/script.js` sur la page d'accueil, `/articles/` et
`/articles/detail/?slug=...`.

## Modifier sans toucher au code

Option recommandée pour un client non-développeur:

1. Héberger le site gratuitement sur Netlify avec le dépôt GitHub du projet.
2. Activer Netlify Identity et Git Gateway.
3. Inviter la personne qui doit gérer le site.
4. Aller sur `/admin/`.
5. Modifier la collection "Articles", puis publier.

Decap CMS écrit alors dans `data/articles.json` et range les images envoyées
dans `assets/images/articles/`.

## Ajouter une image

Dans `/admin/`, ouvrir un article puis utiliser le champ `Image`. L'image est
envoyée dans `assets/images/articles/` automatiquement.

Pour un rendu propre:

- garder `Image entière avec fond flouté` pour les captures Minecraft, logos ou
  images qui ne doivent pas être coupées;
- choisir `Recadrer pour remplir le cadre` pour une image large qui peut être
  coupée sans perdre d'information;
- ajuster `Position de l'image` si le sujet est trop haut ou trop bas, par
  exemple `top center`, `center center` ou `50% 35%`.

## Modifier depuis GitHub

Si le site reste sur GitHub Pages, la personne peut aussi ouvrir
`data/articles.json` depuis l'interface GitHub, cliquer sur "Edit", modifier les
champs, puis valider. Ce n'est pas aussi confortable qu'un vrai panneau admin,
mais le site reste totalement gratuit.

## Champs d'un article

- `published`: afficher ou masquer l'article.
- `featured`: le faire remonter en premier.
- `title`: titre visible.
- `slug`: identifiant dans l'URL, par exemple `nouveau-mode-pvp`.
- `date`: date au format `YYYY-MM-DD`.
- `author`: auteur affiché.
- `category`: étiquette de classement.
- `image`: chemin de l'image.
- `imageAlt`: description courte de l'image.
- `imageFit`: `contain` garde l'image entière avec un fond flouté; `cover`
  recadre pour remplir le cadre.
- `imagePosition`: point focal de l'image, par exemple `center center`,
  `top center` ou `50% 35%`.
- `excerpt`: court résumé pour les cartes.
- `content`: liste de paragraphes de l'article.

Un site purement statique ne peut pas enregistrer des changements directement
dans l'hébergement depuis le navigateur. Il faut donc passer par GitHub, Decap
CMS, ou une source externe gratuite comme Google Sheets.
