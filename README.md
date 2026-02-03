## 🚀 Kanban Board - Task Management & Workflow Planner

A modern web app for managing **tasks** using a **Kanban** board with three columns (To Do / In Progress / Completed), featuring an advanced **task modal** for creating and editing tasks, and **local storage** persistence in the browser.

## ✨ Features

- 🎯 **Kanban Columns**: Organized columns for task status: To Do, In Progress, Completed  
- 🎯 **Task Management**: Add, edit, delete, and move tasks between statuses  
- 🎯 **Task Details**: Title, description, priority, and due date  
- 🎯 **Priority System**: Low / Medium / High priorities with colored badges  
- 🎯 **Status Actions**: Quick buttons to move a task between To Do, In Progress, and Completed  
- 🎯 **Smart Labels**: Highlight overdue tasks and tasks with a near due date  
- 🎯 **Time Ago**: Show time since task creation (Just now, 5m ago, 2h ago, …)  
- 🎯 **Form Validation**: Strong validation for title, description, and due date with clear error messages  
- 🎯 **Notifications**: Success toasts when tasks are added or updated  
- 🎯 **Local Storage**: Persist tasks in `localStorage` so they survive page reloads  
- 🎯 **Modern UI/UX**: Trello‑inspired clean design with polished task cards  
- 🎯 **Responsive Layout**: Works well on different screen sizes

> Note: the app can be extended later with drag & drop, filters, and backend integration.

## 🛠️ Technologies Used

- **HTML5**
- **CSS3** (using a pre‑built Tailwind‑based stylesheet)
- **TypeScript**
- **Vite**
- **Font Awesome**
- **LocalStorage** for client‑side persistence

## 📁 Project Structure

```bash
Kanban-ts/
│
├── index.html               # General static entry page
├── main.ts                  # Optional simple script / bridge
├── style.css                # Imports the compiled design stylesheet
│
└── kanban-ts/               # Main Vite + TypeScript project
    ├── index.html           # Main Kanban page for Vite
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── public/
    │   └── vite.svg
    └── src/
        ├── main.ts          # Kanban logic (classes, events, DOM rendering)
        ├── style.css        # Imports the external compiled CSS
        ├── counter.ts       # Default Vite sample file (mostly unused)
        └── typescript.svg
```

## 🚀 Getting Started

### Prerequisites

- Node.js + npm (any recent version that works with Vite)
- A modern browser (Chrome / Edge / Firefox)

### Run locally (Windows)

This project uses **Vite + TypeScript** and requires npm.

1) Open a terminal in the project folder (for example `D:\Kanban-ts\kanban-ts`):

```bash
cd Kanban-ts/kanban-ts
```

2) Install dependencies (one time only):

```bash
npm install
```

3) Start the development server:

```bash
npm run dev
```

4) Open the browser at the URL printed in the terminal (typically):

- `http://localhost:5173`

> If the design or cards do not appear correctly, use `Ctrl + F5` for a hard refresh and make sure no scripts or fonts are being blocked.

## 📋 Usage

### Managing Tasks

- Click the **+** button in the header to open the modal and create a new task.  
- Fill in:
  - **Task Title** (required – between 3 and 100 characters)
  - **Priority** (Low / Medium / High)
  - **Due Date** (optional, but cannot be in the past)
  - **Description** (optional, up to 500 characters with a live counter)

### Working with the Board

- Each task appears in one of the three columns based on its status.
- Use the status buttons at the bottom of each card to move it:
  - **To Do** to send it back to the backlog.
  - **Start** to move it to In Progress.
  - **Complete** to move it to Completed.
- Use the action buttons:
  - ✏️ **Edit** to open the modal pre‑filled with the task data.
  - 🗑️ **Delete** to remove the task permanently.

### Persistence

- All tasks are stored in `localStorage` under a fixed key, so:
  - Closing and reopening the browser keeps your tasks intact.
  - You can clear them manually by deleting tasks or clearing `localStorage`.

## 🌐 Data & Persistence

- There is no backend at the moment; all data lives in the browser via **LocalStorage**.
- In the future, storage could be moved to:
  - A real API
  - A database
  - Or a synced multi‑device solution

## 🔐 Security Note (Important)

- Since the app is purely client‑side and does not use sensitive keys or a backend:
  - There are no exposed **API keys** in the code.
  - All stored data is local to the user’s machine.
- If you add external APIs later:
  - Keep any secret keys in a backend or serverless function, not in the frontend code.

## 🧪 Testing

- Open DevTools (`F12`) and check:
  - **Console** for any JavaScript / TypeScript errors.
  - **Application → Local Storage** to inspect stored tasks.
- Try:
  - Creating tasks with all fields filled.
  - Using a past date (should trigger validation errors).
  - Typing a long description to test the character counter and validation.
  - Moving tasks between columns using the status buttons.

## 🚀 Deployment

You can deploy this project to any static hosting that supports Vite/SPA builds:

- GitHub Pages
- Netlify
- Vercel
- Any web server (Nginx / Apache / IIS)

> For production, build the app with:

```bash
npm run build
```

Then deploy the contents of the `dist` folder to your hosting provider.

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

