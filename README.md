# ImactFlow - Application de Consolidation des Bilans Carbone

Application SaaS permettant aux réseaux d'entreprises de consolider et visualiser leurs bilans carbone.

## Fonctionnalités

- Import de données de bilans carbone (Excel/CSV)
- Consolidation automatique par catégories (scope 1, 2, 3)
- Visualisation via diagrammes de Sankey interactifs
- Export des données consolidées

## Prérequis

- Node.js (v14+)
- npm ou yarn
- Compte Supabase

## Installation

1. Cloner le repository
```bash
git clone [repository-url]
cd ImactFlow
```

2. Installer les dépendances
```bash
npm install
cd client && npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Remplir les variables dans le fichier .env

4. Lancer l'application en développement
```bash
npm run dev:full
```

## Structure du Projet

```
ImactFlow/
├── client/               # Frontend Vue.js
├── server/               # Backend Node.js
│   ├── config/          # Configuration
│   ├── controllers/     # Contrôleurs
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes API
│   └── utils/          # Utilitaires
├── tests/               # Tests
└── README.md
```

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request
