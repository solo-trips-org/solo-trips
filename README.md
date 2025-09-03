# 🚀 Monorepo Starter (Express + React Native + Next.js + Python AI)

This repository is a **pnpm-based monorepo** that contains multiple apps and services:

- **Backend** → Express.js REST API  
- **App** → React Native (Expo) mobile application  
- **Dashboard** → Next.js (TypeScript) web dashboard  
- **AI** → Python-based machine learning/AI modules  

All projects share a single **pnpm workspace** and **lockfile** for consistent dependency management.

---

## 📂 Project Structure

```
/monorepo
  /backend        # Express API
  /app            # React Native (Expo) app
  /dashboard      # Next.js web dashboard
  /ai             # Python AI modules
  package.json    # root package manager file
  pnpm-lock.yaml  # single lockfile for all node projects
  pnpm-workspace.yaml
  .gitignore
```

---

## 🛠️ Tech Stack

- **Backend** → Node.js, Express  
- **Mobile App** → React Native (Expo, TypeScript)  
- **Dashboard** → Next.js (App Router, TypeScript)  
- **AI** → Python (NumPy, Pandas, ML/DL frameworks)  
- **Package Manager** → [pnpm](https://pnpm.io)  
- **Workspace** → Single lockfile, modular project setup  

---

## 🚀 Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/your-username/monorepo.git
cd monorepo
```

### 2. Install dependencies
```sh
pnpm install
```

> This installs dependencies for all Node.js projects (`backend`, `dashboard`, `app`).

### 3. Run projects

#### Backend (Express API)
```sh
cd backend
pnpm dev
```

#### Dashboard (Next.js)
```sh
cd dashboard
pnpm dev
```
Dashboard runs at: [http://localhost:3000](http://localhost:3000)

#### Mobile App (React Native / Expo)
```sh
cd app
pnpm start
```
Then open in Expo Go (iOS/Android) or run in emulator.

#### AI Modules (Python)
```sh
cd ai
python -m venv .venv
source .venv/bin/activate   # (Linux/macOS)
.venv\Scripts\activate      # (Windows)

pip install -r requirements.txt
```

---

## 📦 Package Management

- Uses a **single `pnpm-lock.yaml`** for deterministic installs.  
- Each project has its own `package.json`.  
- Shared dependencies can be hoisted to the root if needed.  

---

## 📝 Scripts

At the root, you can run:
```sh
pnpm install     # install all deps
pnpm -r dev      # run "dev" script in all packages
pnpm -r lint     # run lint across all packages
```

---

## 📄 .gitignore Strategy

- **Root `.gitignore`** → OS files, IDE configs, logs, lockfiles not in use.  
- **Per-project `.gitignore`** → language-specific ignores (Node, Python, React Native).  

---

## 🔮 Future Improvements

- Add shared package for API clients & types  
- Setup CI/CD pipelines for each project  
- Dockerize backend + AI modules  
- Deploy dashboard to Vercel / mobile app to app stores  

---

## 📜 License
MIT © 2025 Your Name
