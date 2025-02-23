# Swifty Companion

Swifty Companion est un projet de l'école 42 qui consiste à créer une application mobile permettant d'afficher les informations d'un utilisateur de l'intranet 42 via l'API publique de l'école. Ce projet vise à renforcer les compétences en développement mobile en utilisant le langage de son choix, react native pour ma part.


## Fonctionnement

- Recherche d'un utilisateur via son login 42.

- Affichage des informations détaillées de l'utilisateur :

  - Nom, prénom, campus.

  - Niveau et cursus suivi.

  - Projets réalisés avec leur statut (validé, en cours, échoué).

  - Compétences et leur niveau d'acquisition.

  - Informations sur la coalition et l'évolution dans l'école.

- Gestion et affichage des erreurs (utilisateur introuvable, problème de connexion API, etc.).
  

## Technologies utilisées

- React native : Langage principal pour le développement iOS et android.
  
- Expo : Outil open-source qui facilite la création d'applications mobiles avec React Native, en offrant des outils intégrés pour tester et déployer.

- TypeScript : Superset de JavaScript qui ajoute des types statiques, aidant à éviter les erreurs et à rendre le code plus fiable et maintenable.

- i18n : Processus permettant de préparer les applications pour un support multilingue, facilitant la gestion des traductions et des formats régionaux.

- API 42 : Interface permettant d'interagir avec la plateforme éducative 42, offrant l'accès aux données des étudiants, projets et services associés.


## API 42

L'application utilise l'API publique de l'école 42 pour récupérer les informations des étudiants. Voici les étapes pour obtenir les clés API :

- Connectez-vous à l'intranet 42.

- Créez une nouvelle application OAuth.

- Récupérez votre client_id et client_secret.

- Configurez ces clés dans l'application.

- Faire une requete pour obtenir un token OAUTH
  

## Bonus

- Ajout de l'actualisation du token de l'API 42 quand celui-ci expire
