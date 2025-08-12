# 🚀 Swifty Companion

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-51.0.28-black?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=for-the-badge)

**Une application mobile moderne pour explorer le profil des étudiants de l'école 42**

[📱 Fonctionnalités](#-fonctionnalités) • [🛠️ Technologies](#️-technologies) • [🚀 Installation](#-installation) • [📖 Utilisation](#-utilisation) • [🔑 Configuration API](#-configuration-api) • [🎯 Bonus](#-bonus)

</div>

---

## 📱 Fonctionnalités

### 🔍 **Recherche Intelligente**
- Recherche instantanée d'étudiants par login 42
- Interface intuitive et responsive
- Gestion des erreurs en temps réel

### 👤 **Profil Complet**
- **Informations personnelles** : Nom, prénom, campus
- **Cursus académique** : Niveau actuel et progression
- **Projets réalisés** : Statut détaillé (validé ✅, en cours 🔄, échoué ❌)
- **Compétences** : Niveaux d'acquisition avec visualisation
- **Coalition** : Informations sur l'évolution dans l'école

### 🌍 **Support Multilingue**
- Interface internationalisée avec i18n
- Support de multiples langues
- Formats régionaux adaptés

### 📊 **Visualisations Avancées**
- Graphiques interactifs pour les compétences
- Parallax scrolling pour une expérience immersive
- Animations fluides et transitions élégantes

## 🛠️ Technologies

### **Frontend Mobile**
- **React Native 0.74.5** - Framework cross-platform
- **Expo 51.0.28** - Outils de développement et déploiement
- **TypeScript 5.3.3** - Typage statique pour la fiabilité

### **UI/UX**
- **React Navigation** - Navigation native fluide
- **React Native Reanimated** - Animations performantes
- **React Native Chart Kit** - Visualisations de données
- **Expo Vector Icons** - Icônes natives

### **Gestion d'État & API**
- **Axios** - Client HTTP robuste
- **AsyncStorage** - Stockage local persistant
- **i18next** - Internationalisation complète

### **Développement**
- **Jest** - Tests unitaires
- **ESLint** - Qualité du code
- **Babel** - Transpilation moderne

## 🚀 Installation

### **Prérequis**
- Node.js 18+ 
- npm ou yarn
- Expo CLI
- iOS Simulator (macOS) ou Android Studio

### **Installation Rapide**

```bash
# Cloner le repository
git clone https://github.com/votre-username/swifty-companion.git
cd swifty-companion

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

### **Scripts Disponibles**

```bash
npm start          # Démarrer Expo
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Lancer sur le web
npm test           # Exécuter les tests
npm run lint       # Vérifier la qualité du code
```

## 📖 Utilisation

### **1. Recherche d'Étudiant**
- Lancez l'application
- Entrez le login 42 de l'étudiant recherché
- Appuyez sur "Rechercher"

### **2. Exploration du Profil**
- **Onglet Profil** : Informations personnelles et académiques
- **Onglet Projets** : Détail des projets avec statuts
- **Onglet Compétences** : Visualisation des niveaux
- **Onglet Coalition** : Évolution dans l'école

### **3. Navigation Intuitive**
- Swipe entre les sections
- Tap pour développer les détails
- Pull-to-refresh pour actualiser

## 🔑 Configuration API

### **Obtention des Clés API 42**

1. **Connexion à l'Intranet**
   - Connectez-vous à [intra.42.fr](https://intra.42.fr)

2. **Création d'Application OAuth**
   - Allez dans "Profile" → "Settings" → "API"
   - Cliquez sur "New Application"
   - Remplissez les informations requises

3. **Récupération des Clés**
   - Copiez votre `client_id`
   - Copiez votre `client_secret`

4. **Configuration dans l'App**
   - Créez un fichier `.env` à la racine
   - Ajoutez vos clés :

```env
CLIENT_ID=votre_client_id
CLIENT_SECRET=votre_client_secret
```

### **Gestion des Tokens**
- **Authentification automatique** OAuth2
- **Renouvellement automatique** des tokens expirés
- **Stockage sécurisé** des informations d'authentification

## 🎯 Bonus

### **Fonctionnalités Avancées**
- ✅ **Actualisation automatique** des tokens API 42
- ✅ **Gestion intelligente** des erreurs réseau
- ✅ **Interface adaptative** pour tous les écrans
- ✅ **Performance optimisée** avec React Native 0.74.5
- ✅ **Tests automatisés** avec Jest
- ✅ **Linting strict** pour la qualité du code

### **Architecture Moderne**
- **Expo Router** pour la navigation
- **Hooks personnalisés** pour la logique métier
- **Composants réutilisables** et testables
- **Gestion d'état** optimisée
- **Support TypeScript** complet

## 📱 Captures d'Écran

<img width="300" alt="Capture d’écran 2025-08-12 à 12 04 15" src="https://github.com/user-attachments/assets/8308a012-e524-4cd3-a3e4-b66bb4904fa4" />
<img width="300" alt="Capture d’écran 2025-08-12 à 12 31 03" src="https://github.com/user-attachments/assets/dd584e8a-49bc-4858-bc6f-b6732a787c74" />
<img width="300" alt="Capture d’écran 2025-08-12 à 12 31 18" src="https://github.com/user-attachments/assets/0c0b4816-a677-4c36-ab90-98bc40d0f015" />
<img width="300" alt="Capture d’écran 2025-08-12 à 12 31 30" src="https://github.com/user-attachments/assets/3694747e-4473-40b7-ad2d-5a6f92d646c3" />
<img width="300" alt="Capture d’écran 2025-08-12 à 12 31 40" src="https://github.com/user-attachments/assets/32e7faff-069e-43de-b090-236399e589f9" />


---

<div align="center">


[⬆️ Retour en haut](#-swifty-companion)

</div>
