# Kanban Board – Pure TypeScript

A Kanban task board built with **pure TypeScript** — no React, Vite, or any bundler.

## Features

- TypeScript only → compile with `tsc` → JavaScript in the browser
- No frameworks (no React, no Vue)
- No Vite or Webpack
- Auto-save to `localStorage`
- Modern UI (Tailwind CSS)
- Responsive layout
- Add, edit, delete, and move tasks across columns (To Do / In Progress / Completed)

## Getting Started

### 1. Install TypeScript

```bash
npm install -g typescript
```

Or locally:

```bash
npm install --save-dev typescript
```

### 2. Compile TypeScript to JavaScript

```bash
tsc
```

This generates `dist/app.js` from `src/app.ts`.

### 3. Run the Project

- Open `index.html` in your browser, or
- Use a local server:

```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000`

Or with Python:

```bash
python -m http.server 8000
```

## Project Structure

```
kanban-ts-main/
├── index.html
├── src/
│   ├── app.ts
│   └── style.css
├── dist/
│   └── app.js
├── tsconfig.json
└── README.md
```

## tsconfig.json Overview

- `outDir: "./dist"` → compiled JS goes to `dist`
- `rootDir: "./src"` → source files in `src`
- `target: "ES2020"` and `module: "ES2020"`

## How It Works

1. Edit code in `src/app.ts`
2. Run: `tsc`
3. The page loads the script: `<script src="dist/app.js"></script>`

## Usage

| Action        | How to do it                                      |
|---------------|---------------------------------------------------|
| Add task      | Click the **+** button in the header              |
| Move task     | Use To Do / Start / Complete buttons on the card |
| Edit task     | Click the pencil icon on the card                 |
| Delete task   | Click the trash icon on the card                  |

## Useful Commands

```bash
tsc              # compile once
tsc --watch      # compile on file changes
```

## Dependencies

No runtime dependencies — only TypeScript is needed for compilation (`tsc`).

## 👨‍💻 Author

<div align="center">

### **Eng. Yasien Ahmed Elkelany**

💼 **Backend .NET Developer** | **Angular Frontend Developer**  
🏢 **General Authority for Investment**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yasien-ahmed-b8ab41325)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:yasienahmed607@gmail.com)

[🔗 LinkedIn Profile](https://www.linkedin.com/in/yasien-ahmed-b8ab41325) | [📧 Email](mailto:yasienahmed607@gmail.com)

</div>

---

<div align="center">

**Made with ❤️ by Eng. Yasien Ahmed Elkelany**

⭐ Star this repo if you find it helpful!

</div>
