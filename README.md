# KLab Reports 🔬

KLab Reports is a state-of-the-art Medical Laboratory Management System designed for precision, speed, and aesthetic excellence. Built as a cross-platform desktop application using Electron and React, it provides a premium experience for managing patients, generating professional medical reports, and tracking laboratory workflows.

## ✨ Key Features

- **Premium High-Contrast UI**: A modern, glassmorphic interface designed with Indigo accents and high-legibility Slate typography.
- **Smart Report Entry**: Real-time validation with automated "Abnormal" range detection (High/Low) to prevent diagnostic errors.
- **Professional PDF Generation**: Instantly generate beautiful, column-wise PDF reports with custom laboratory branding and sharp formatting.
- **Patient Management**: Searchable patient database with autocomplete and history tracking.
- **Integrated Dashboard**: Real-time stats, weekly trends, and usage limits for simplified management.
- **Lite & Pro Tiers**: Built-in support for monthly usage limits and feature-locked Pro functionality.
- **Offline First**: Fast, local SQLite database ensuring reliability even without an internet connection.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Material UI (MUI)
- **Desktop Framework**: Electron
- **Database**: SQLite (via `better-sqlite3`)
- **Styling**: Vanilla CSS & MUI SX System (Premium Theme)
- **Icons**: Material Design Icons
- **PDF Engine**: Playwright/Electron Print-to-PDF

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/muzammilkarimi/klab-reports.git
   cd klab-reports
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

To start the app in development mode:
```bash
npm run electron:dev
```

To build the production app:
```bash
npm run dist
```

## 📂 Project Structure

- `src/`: React frontend source code.
- `electron/`: Main process and Electron configuration.
- `backend/`: API services and database controllers.
- `database/`: SQLite database files and initialization scripts.

## 🛡️ License

Private - Developed for KLab Reports.

---
*Created with ❤️ by the KLab Reports Team*
