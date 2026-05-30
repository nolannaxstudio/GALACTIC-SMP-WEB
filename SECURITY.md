# Politique de sécurité

Merci de contribuer à la sécurité de **ZYRANEX**. Ce document explique comment
signaler une faille, ce qui est dans le périmètre du site, et ce à quoi vous
pouvez vous attendre en retour.

## Versions supportées

Seule la version déployée à partir de la branche `main` est activement
maintenue. Les forks, anciennes branches et copies non officielles ne reçoivent
pas de correctifs de sécurité.

| Branche | Supportée |
| ------- | --------- |
| `main`  | Oui       |
| autres  | Non       |

## Signaler une vulnérabilité

**Ne créez pas d'issue publique** pour une faille de sécurité.

Privilégiez l'un de ces canaux confidentiels :

1. **GitHub Security Advisories** (recommandé) : onglet
   `Security -> Report a vulnerability` du dépôt, si l'option est disponible.
2. **Discord** : message privé à un membre du staff sur le serveur officiel :
   <https://discord.gg/rf8AcQwdMJ>

Incluez dans votre rapport :

- Une description claire du problème et de son impact.
- Les étapes précises pour le reproduire (URL, navigateur, payload, action).
- Une preuve de concept si possible (capture, log, snippet minimal).
- Les fichiers ou pages concernés.
- Votre proposition de correctif si vous en avez une.

Merci de ne pas exploiter une faille au-delà de ce qui est nécessaire pour la
démontrer. Ne tentez pas de supprimer, modifier, voler ou publier des données.

## Délais indicatifs

| Étape                         | Délai indicatif   |
| ----------------------------- | ----------------- |
| Accusé de réception           | 72 h              |
| Première évaluation           | 7 jours           |
| Correctif selon la sévérité   | 7 à 30 jours      |
| Publication coordonnée        | après déploiement |

Nous communiquons publiquement sur une faille uniquement après le déploiement du
correctif, et avec votre accord pour le crédit.

## Périmètre actuel

Le projet est un site statique HTML/CSS/JS pour **ZYRANEX**. Les éléments
suivants entrent dans le périmètre :

- Pages publiques du site : `index.html`, `credits.html`, `maintenance.html`,
  `offline.html`, `status.html`, `terms.html`, `privacy.html`.
- Feuilles de style et scripts client : `styles.css`, `script.js`, `sw.js`.
- Assets du site : logos, favicons et images servies avec le site.
- Navigation, menu mobile, transitions, liens d'ancrage et bouton de copie de
  l'IP serveur.
- Liens externes intégrés depuis le site (Discord, statut externe, polices
  Google Fonts).
- Documents publics liés aux conditions, à la confidentialité et à la sécurité.

### Exemples de vulnérabilités recherchées

- **XSS / injection DOM** si du contenu dynamique est ajouté ou mal échappé.
- **Tabnabbing** ou lien externe dangereux (`target="_blank"` sans protection).
- **Redirection trompeuse** ou remplacement malveillant d'un lien officiel.
- **Fuite d'informations sensibles** dans le code, l'historique Git ou les
  fichiers statiques.
- **Usage dangereux du presse-papiers** ou comportement trompeur autour du
  bouton de copie.
- **Dépendance ou ressource tierce compromise** lorsqu'elle est contrôlée par le
  projet.
- **Workflow ou script de déploiement vulnérable** si une automatisation est
  ajoutée au dépôt à l'avenir.

## Hors périmètre

Les éléments suivants ne sont pas considérés comme des vulnérabilités de ce
dépôt :

- Vulnérabilités du serveur Minecraft lui-même, à signaler directement au staff
  via Discord.
- Vulnérabilités de Discord, du service de statut externe, de Google Fonts ou de
  GitHub Pages.
- Problèmes UX, fautes d'orthographe, bugs visuels ou suggestions de contenu.
- Attaques volumétriques, spam, déni de service réseau ou rate-limiting côté
  services tiers.
- Vulnérabilités exigeant un accès physique à la machine de l'utilisateur, un
  compte déjà compromis ou une extension de navigateur malveillante.
- Manque de headers HTTP contrôlés par l'hébergeur, sauf si le correctif peut
  être appliqué directement dans ce dépôt.

## Bonnes pratiques pour les contributeurs

Si vous contribuez au projet :

- Ne committez jamais de clés API, tokens, mots de passe ou variables
  d'environnement sensibles.
- Évitez `innerHTML` pour afficher des données externes. Préférez `textContent`
  et des attributs explicitement contrôlés.
- Ajoutez `rel="noopener noreferrer"` sur les liens externes ouverts dans un
  nouvel onglet.
- Gardez les URLs officielles faciles à relire lors des revues.
- Testez les pages modifiées sur mobile et desktop avant de proposer une
  modification.
- Si des dépendances, workflows ou APIs sont ajoutés plus tard, limitez leurs
  permissions et documentez leur rôle.

## Reconnaissance

Les personnes ayant signalé des failles de manière responsable pourront être
mentionnées dans les crédits du site, sauf demande contraire de leur part.

---

Dernière mise à jour : 2026-05-23
