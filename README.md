# Tom's on Web

Tom's on Web est un projet universitaire réalisé dans le cadre du concours GamesOnWeb. Il réunit actuellement trois jeux différents : Keep It Alive, Miage Surfers et un Puissance 4.

## Accès au projet

Le projet est accessible via l'URL suivante :
[Tom's on Web](https://toms-on-web.vercel.app/)

Pour travailler en local pendant le développement :

1. Installer les dépendances à la racine du projet avec `npm install`
2. Créer un fichier `.env` à la racine du backend avec les variables d'environnement nécessaires :

   * MONGO_URI=...
   * JWT_SECRET=...
3. Lancer le projet avec `npm run dev`

Ce mode démarre le front-end et le back-end.

## Organisation du dépôt

* `frontend/` : application React, pages, contexte d’authentification et de scores, composants d’interface, jeux
* `backend/` : API d’authentification, stockage des scores et connexion MongoDB
* `frontend/src/lib/games/` : les différents jeux, chacun dans son propre dossier
* `frontend/src/lib/contexts/` : contexte d’authentification et de scores
* `frontend/src/pages/` : pages principales du site (accueil, connexion, jeux, scores)

## Fonctionnalités principales

* lancement des jeux depuis une landing page commune
* inscription, connexion et déconnexion des joueurs
* sauvegarde des scores en base de données
* affichage du meilleur score global et du record personnel

## Répartition du travail dans le groupe

Voici la répartition réelle des tâches entre les membres du groupe :

* **Tom BALLESTER** : création du site web, développement de Keep It Alive
* **Tom COURGENAY** : développement de Puissance 4, ajustements sur le scoring du site, rédaction de ce README et réalisation de la vidéo de présentation
* **Francesca PAPP** : développement de Miage Surfers et rédaction du rapport

### Pourcentage de travail fourni

Répartition estimée :

* Tom BALLESTER : 40 %
* Tom COURGENAY : 30 %
* Francesca PAPP : 30 %

Cette répartition nous semble assez représentative du travail global, même si certaines tâches (tests, corrections de bugs, ajustements) ont été faites un peu par tout le monde à différents moments du projet.

## Difficultés rencontrées et solutions

La principale difficulté a été d’intégrer plusieurs jeux dans une seule application sans casser le fonctionnement global du site. Chaque jeu avait sa propre logique (lancement, affichage, scoring), et au début, certaines modifications dans un jeu pouvaient impacter les autres.

Concernant le Puissance 4, on a eu des difficultés à gérer correctement le score. Au départ, on essayait d’utiliser un seul score pour tout (affichage + sauvegarde), mais cela posait des problèmes : le score pouvait être enregistré au mauvais moment ou ne pas correspondre à la fin réelle d’une partie ou carrement ne pas être stocké. Après plusieurs essais, on a décidé de regarder le score à chaque fin de manche et de la donner au back si nécessaire, plutôt que de le faire à chaque changement d’état du jeu.

Pour Miage Surfers, on a eu un bug qui faisait planter tout le site. Après debug, on s’est rendu compte que ça venait d’une mauvaise utilisation de BabylonJS (import et initialisation). On a testé plusieurs solutions avant de corriger en utilisant une importation ES6 plus classique qui a résolu le problème.

## Justification des choix

Nous avons choisi de proposer trois jeux avec trois technologies differentes (canvas, DOM et BabylonJS) alors que nous avions deux autres jeux en canvas de disponibles. Nous avons voulu proposer des jeux assez différents afin d’avoir un projet varié. On a aussi voulu essayer des jeux avec des objéctifs différents : un jeu de survie (Keep It Alive), un jeu de score (Miage Surfers) et un jeu de stratégie (Puissance 4).

## Bilan personnel du groupe

Sur ce projet nous avons tout les 3 eu une V1 d'une landing page mais avons décidé de garder celui de Tom qu'il a ensuite perfectionner. Puis nous avons développé chacun de notre côté nos jeux respectifs. Sur la dernière semaine, nous avons tous travaillé ensemble pour intégrer les jeux dans le site, corriger les bugs et finaliser le projet. C'est ce qui a été le plus compliqué, car il fallait faire cohabiter plusieurs jeux dans un même site tout en gardant une navigation simple et un système de scores cohérent.

Au final, Tom'sOnWeb reste à notre avis une réussite pour chacun en découvrant de nouvelles technologie ou au moins une nouvelles manière de les utiliser.

## Vidéos de présentation
Voici la vidéo de présentation de Tom's on Web : [YouTube](https://youtu.be/wP61flIaLPo)