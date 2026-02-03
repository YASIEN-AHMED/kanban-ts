export enum Status {
  ToDo = "todo",
  InProgress = "in-progress",
  Completed = "completed",
}

const VALIDATION = {
  title: {
    minLength: 3,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
};

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
}

interface ColumnConfig {
  id: Status;
  title: string;
  icon: string;
}

class StorageWrapper {
  private storageKey: string;

  constructor(key: string) {
    this.storageKey = key;
  }

  save(data: Task[]): void {
    try {
      const str = JSON.stringify(data);
      localStorage.setItem(this.storageKey, str);
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  load(): Task[] | null {
    try {
      const str = localStorage.getItem(this.storageKey);
      return str === null ? null : (JSON.parse(str) as Task[]);
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}

const STORAGE_KEY = "kanban-tasks";

const COLUMNS: ColumnConfig[] = [
  {
    id: Status.ToDo,
    title: "To Do",
    icon: "fa-solid fa-clipboard-list",
  },
  {
    id: Status.InProgress,
    title: "In Progress",
    icon: "fa-solid fa-spinner",
  },
  {
    id: Status.Completed,
    title: "Completed",
    icon: "fa-solid fa-circle-check",
  },
];

const CONSTS = {
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
  WEEK_DAYS: 7,
  DUE_SOON_DAYS: 2,
  NOTIFICATION_DURATION: 3000,
  FADE_OUT_DURATION: 300,
};

function getById<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return el as T;
}

interface FormPayload {
  title: string;
  description: string;
  dueDate: string;
  priority: Task["priority"];
}

export class KanbanApp {
  private tasks: Task[] = [];
  private storage: StorageWrapper;
  private editingTaskId: string | null = null;

  private formElement: HTMLFormElement;
  private titleInput: HTMLInputElement;
  private descriptionInput: HTMLTextAreaElement;
  private dueDateInput: HTMLInputElement;
  private prioritySelect: HTMLSelectElement;
  private columnsContainer: HTMLDivElement;
  private modalOverlay: HTMLDivElement;
  private addTaskBtn: HTMLButtonElement;
  private closeModalBtn: HTMLButtonElement;
  private cancelBtn: HTMLButtonElement;
  private charCount: HTMLParagraphElement;
  private modalTitle: HTMLElement;
  private modalIcon: HTMLElement;
  private submitBtn: HTMLButtonElement;
  private submitBtnText: HTMLSpanElement;
  private titleError: HTMLParagraphElement;
  private dateError: HTMLParagraphElement;
  private descriptionError: HTMLParagraphElement;

  constructor() {
    this.storage = new StorageWrapper(STORAGE_KEY);

    this.formElement = getById<HTMLFormElement>("task-form");
    this.titleInput = getById<HTMLInputElement>("task-title");
    this.descriptionInput = getById<HTMLTextAreaElement>("task-description");
    this.dueDateInput = getById<HTMLInputElement>("task-due-date");
    this.prioritySelect = getById<HTMLSelectElement>("task-priority");
    this.columnsContainer = getById<HTMLDivElement>("columns-container");
    this.modalOverlay = getById<HTMLDivElement>("modal-overlay");
    this.addTaskBtn = getById<HTMLButtonElement>("add-task-btn");
    this.closeModalBtn = getById<HTMLButtonElement>("close-modal-btn");
    this.cancelBtn = getById<HTMLButtonElement>("cancel-btn");
    this.charCount = getById<HTMLParagraphElement>("char-count");
    this.modalTitle = getById<HTMLElement>("modal-title");
    this.modalIcon = getById<HTMLElement>("modal-icon");
    this.submitBtn = getById<HTMLButtonElement>("submit-btn");
    this.submitBtnText = getById<HTMLSpanElement>("submit-btn-text");
    this.titleError = getById<HTMLParagraphElement>("title-error");
    this.dateError = getById<HTMLParagraphElement>("date-error");
    this.descriptionError = getById<HTMLParagraphElement>("description-error");

    this.loadTasks();
    this.bindEvents();
    this.render();
  }

  private loadTasks(): void {
    const loaded = this.storage.load();
    this.tasks = loaded ?? [];
  }

  private saveTasks(): void {
    this.storage.save(this.tasks);
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private addTask(data: FormPayload): void {
    const task: Task = {
      id: this.generateId(),
      title: data.title.trim(),
      description: data.description.trim(),
      status: Status.ToDo,
      priority: data.priority,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    this.saveTasks();
    this.render();
  }

  private updateTaskStatus(taskId: string, status: Status): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      this.saveTasks();
      this.render();
    }
  }

  private deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveTasks();
    this.render();
  }

  private updateTask(taskId: string, data: FormPayload): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.title = data.title.trim();
      task.description = data.description.trim();
      task.priority = data.priority;
      task.dueDate = data.dueDate;
      this.saveTasks();
      this.render();
    }
  }

  private getTaskById(taskId: string): Task | undefined {
    return this.tasks.find((t) => t.id === taskId);
  }

  private getTasksByStatus(status: Status): Task[] {
    return this.tasks.filter((t) => t.status === status);
  }

  private bindEvents(): void {
    this.addTaskBtn.addEventListener("click", () => this.openModal());
    this.closeModalBtn.addEventListener("click", () => this.closeModal());
    this.cancelBtn.addEventListener("click", () => this.closeModal());

    this.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.modalOverlay) {
        this.closeModal();
      }
    });

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && !this.modalOverlay.classList.contains("hidden")) {
        this.closeModal();
      }
    });

    this.descriptionInput.addEventListener("input", () => {
      const len = this.descriptionInput.value.length;
      this.charCount.textContent = `${len}/${VALIDATION.description.maxLength}`;
      if (len > VALIDATION.description.maxLength) {
        this.charCount.classList.add("text-red-500");
        this.charCount.classList.remove("text-slate-400");
      } else {
        this.charCount.classList.remove("text-red-500");
        this.charCount.classList.add("text-slate-400");
      }
    });

    this.titleInput.addEventListener("input", () => {
      this.clearFieldError(this.titleInput, this.titleError);
    });

    this.dueDateInput.addEventListener("input", () => {
      this.clearFieldError(this.dueDateInput, this.dateError);
    });

    this.formElement.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    this.columnsContainer.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains("status-btn")) {
        const taskId = target.dataset.taskId;
        const status = target.dataset.status as Status | undefined;
        if (taskId && status) {
          this.updateTaskStatus(taskId, status);
        }
      }

      if (target.classList.contains("delete-btn")) {
        const taskId = target.dataset.taskId;
        if (taskId) {
          this.deleteTask(taskId);
        }
      }

      if (target.classList.contains("edit-btn")) {
        const taskId = target.dataset.taskId;
        if (taskId) {
          this.openEditModal(taskId);
        }
      }
    });
  }

  private openModal(): void {
    this.editingTaskId = null;
    this.setModalMode("add");
    this.modalOverlay.classList.remove("hidden");
    this.modalOverlay.classList.add("flex");
    document.body.style.overflow = "hidden";
    this.titleInput.focus();
  }

  private openEditModal(taskId: string): void {
    const task = this.getTaskById(taskId);
    if (!task) {
      return;
    }

    this.editingTaskId = taskId;
    this.setModalMode("edit");

    this.titleInput.value = task.title;
    this.descriptionInput.value = task.description;
    this.dueDateInput.value = task.dueDate;
    this.prioritySelect.value = task.priority;
    this.charCount.textContent = `${task.description.length}/${VALIDATION.description.maxLength}`;

    this.modalOverlay.classList.remove("hidden");
    this.modalOverlay.classList.add("flex");
    document.body.style.overflow = "hidden";
    this.titleInput.focus();
  }

  private setModalMode(mode: "add" | "edit"): void {
    if (mode === "add") {
      this.modalTitle.textContent = "Create New Task";
      this.modalIcon.className = "fa-solid fa-plus-circle text-indigo-500";
      this.submitBtnText.textContent = "Add Task";
      const icon = this.submitBtn.querySelector("i");
      if (icon) {
        icon.classList.replace("fa-save", "fa-plus");
      }
    } else {
      this.modalTitle.textContent = "Edit Task";
      this.modalIcon.className = "fa-solid fa-pen-to-square text-indigo-500";
      this.submitBtnText.textContent = "Save Changes";
      const icon = this.submitBtn.querySelector("i");
      if (icon) {
        icon.classList.replace("fa-plus", "fa-save");
      }
    }
  }

  private closeModal(): void {
    this.editingTaskId = null;
    this.modalOverlay.classList.add("hidden");
    this.modalOverlay.classList.remove("flex");
    document.body.style.overflow = "";
    this.formElement.reset();
    this.charCount.textContent = `0/${VALIDATION.description.maxLength}`;
    this.clearAllErrors();
  }

  private validateForm(): boolean {
    let valid = true;
    this.clearAllErrors();

    const title = this.titleInput.value.trim();
    if (!title) {
      this.showFieldError(this.titleInput, this.titleError, "Task title is required");
      valid = false;
    } else if (title.length < VALIDATION.title.minLength) {
      this.showFieldError(
        this.titleInput,
        this.titleError,
        `Title must be at least ${VALIDATION.title.minLength} characters`,
      );
      valid = false;
    } else if (title.length > VALIDATION.title.maxLength) {
      this.showFieldError(
        this.titleInput,
        this.titleError,
        `Title must be less than ${VALIDATION.title.maxLength} characters`,
      );
      valid = false;
    }

    const due = this.dueDateInput.value;
    if (due) {
      const dueDate = new Date(due);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        this.showFieldError(
          this.dueDateInput,
          this.dateError,
          "Due date cannot be in the past",
        );
        valid = false;
      }
    }

    if (this.descriptionInput.value.length > VALIDATION.description.maxLength) {
      this.showFieldError(
        this.descriptionInput,
        this.descriptionError,
        `Description must be less than ${VALIDATION.description.maxLength} characters`,
      );
      valid = false;
    }

    return valid;
  }

  private showFieldError(
    input: HTMLInputElement | HTMLTextAreaElement,
    errorEl: HTMLElement,
    message: string,
  ): void {
    input.classList.add("border-red-500", "focus:ring-red-500", "focus:border-red-500");
    input.classList.remove(
      "border-slate-300",
      "focus:ring-indigo-500",
      "focus:border-indigo-500",
    );
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }

  private clearFieldError(
    input: HTMLInputElement | HTMLTextAreaElement,
    errorEl: HTMLElement,
  ): void {
    input.classList.remove("border-red-500", "focus:ring-red-500", "focus:border-red-500");
    input.classList.add("border-slate-300", "focus:ring-indigo-500", "focus:border-indigo-500");
    errorEl.classList.add("hidden");
  }

  private clearAllErrors(): void {
    this.clearFieldError(this.titleInput, this.titleError);
    this.clearFieldError(this.dueDateInput, this.dateError);
    this.clearFieldError(this.descriptionInput, this.descriptionError);
  }

  private handleFormSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const payload: FormPayload = {
      title: this.titleInput.value,
      description: this.descriptionInput.value,
      dueDate: this.dueDateInput.value,
      priority: this.prioritySelect.value as Task["priority"],
    };

    if (this.editingTaskId) {
      this.updateTask(this.editingTaskId, payload);
      this.closeModal();
      this.showNotification("Task updated successfully!", "success");
    } else {
      this.addTask(payload);
      this.closeModal();
      this.showNotification("Task added successfully!", "success");
    }
  }

  private render(): void {
    this.columnsContainer.innerHTML = "";
    COLUMNS.forEach((col) => {
      const colEl = this.createColumnElement(col);
      this.columnsContainer.appendChild(colEl);
    });
  }

  private createColumnElement(col: ColumnConfig): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className =
      "bg-white/60 backdrop-blur-sm rounded-2xl p-5 flex flex-col min-h-[500px] border border-slate-200/50 shadow-sm";
    wrapper.dataset.status = col.id;

    const tasks = this.getTasksByStatus(col.id);

    const styles =
      {
        [Status.ToDo]: {
          icon: "text-slate-500",
          bg: "bg-slate-100",
          border: "border-slate-200",
        },
        [Status.InProgress]: {
          icon: "text-amber-500",
          bg: "bg-amber-50",
          border: "border-amber-200",
        },
        [Status.Completed]: {
          icon: "text-emerald-500",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
        },
      }[col.id];

    wrapper.innerHTML = `
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 ${styles.bg} rounded-xl flex items-center justify-center">
          <i class="${col.icon} ${styles.icon} text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="font-semibold text-slate-800">${col.title}</h2>
          <p class="text-xs text-slate-400">${tasks.length} ${
            tasks.length === 1 ? "task" : "tasks"
          }</p>
        </div>
      </div>
      <div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 -mr-1" id="tasks-${col.id}">
        ${
          tasks.length === 0
            ? `
            <div class="flex flex-col items-center justify-center py-12 text-slate-400">
              <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
              <p class="text-sm">No tasks yet</p>
              <p class="text-xs mt-1">Click + to add one</p>
            </div>`
            : tasks.map((t) => this.createTaskCardHTML(t)).join("")
        }
      </div>
    `;
    return wrapper;
  }

  private createTaskCardHTML(task: Task): string {
    const dueLabel = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "";

    const isOverdue =
      !!task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== Status.Completed;
    const isSoon =
      !!task.dueDate &&
      !isOverdue &&
      this.isDueSoon(task.dueDate) &&
      task.status !== Status.Completed;
    const isDone = task.status === Status.Completed;

    const priorityMap: Record<
      Task["priority"],
      { bg: string; text: string; dot: string; label: string }
    > = {
      high: {
        bg: "bg-red-50",
        text: "text-red-600",
        dot: "bg-red-500",
        label: "High Priority",
      },
      medium: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        dot: "bg-amber-500",
        label: "Medium",
      },
      low: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        dot: "bg-blue-500",
        label: "Low",
      },
    };

    const priority = task.priority ?? "medium";
    const priorityStyle = priorityMap[priority];

    const timeAgo = this.getTimeAgo(task.createdAt);
    const number = this.getTaskNumber(task.id);

    const statusDotColor: Record<Status, string> = {
      [Status.ToDo]: "bg-slate-300",
      [Status.InProgress]: "bg-amber-400",
      [Status.Completed]: "bg-emerald-500",
    };

    return `
      <div class="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 ${
        isOverdue ? "ring-2 ring-red-100 border-red-200" : ""
      } ${isDone ? "opacity-75" : ""}" data-task-id="${task.id}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${statusDotColor[task.status]}"></span>
            <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">#${number}</span>
          </div>
          <div class="flex items-center gap-1 text-slate-400">
            <button class="edit-btn text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors" data-task-id="${task.id}" title="Edit task">
              <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
            </button>
            <button class="delete-btn text-slate-400 hover:text-red-500 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors" data-task-id="${task.id}" title="Delete task">
              <i class="fa-solid fa-trash-can text-xs pointer-events-none"></i>
            </button>
          </div>
        </div>

        <h3 class="font-semibold text-slate-800 mb-2 leading-snug ${
          isDone ? "line-through text-slate-500" : ""
        }">
          ${this.escapeHtml(task.title)}
        </h3>

        ${
          task.description
            ? `
          <p class="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">
            ${this.escapeHtml(task.description)}
          </p>
        `
            : ""
        }

        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span class="${priorityStyle.bg} ${priorityStyle.text} text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
            <span class="w-1.5 h-1.5 rounded-full ${priorityStyle.dot}"></span>
            ${priorityStyle.label}
          </span>
          
          ${
            isOverdue
              ? `
            <span class="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
              <i class="fa-solid fa-triangle-exclamation"></i>
              Overdue
            </span>
          `
              : ""
          }
          
          ${
            isSoon
              ? `
            <span class="bg-orange-100 text-orange-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
              Due Soon
            </span>
          `
              : ""
          }
          
          ${
            isDone
              ? `
            <span class="bg-emerald-100 text-emerald-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
              <i class="fa-solid fa-check"></i>
              Done
            </span>
          `
              : ""
          }
        </div>

        <div class="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-3 border-b border-slate-100">
          ${
            dueLabel
              ? `
            <div class="flex items-center gap-1.5 ${
              isOverdue ? "text-red-500" : isSoon ? "text-orange-500" : ""
            }">
              <i class="fa-regular fa-calendar"></i>
              <span>${dueLabel}</span>
            </div>
          `
              : ""
          }
          <div class="flex items-center gap-1.5" title="Created ${new Date(
            task.createdAt,
          ).toLocaleString()}">
            <i class="fa-regular fa-clock"></i>
            <span>${timeAgo}</span>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2">
          ${this.getStatusButtonsHTML(task)}
        </div>
      </div>
    `;
  }

  private isDueSoon(dateStr: string): boolean {
    const due = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / CONSTS.DAY);
    return diffDays >= 0 && diffDays <= CONSTS.DUE_SOON_DAYS;
  }

  private getTaskNumber(taskId: string): string {
    const index = this.tasks.findIndex((t) => t.id === taskId);
    return String(index + 1).padStart(3, "0");
  }

  private getTimeAgo(dateStr: string): string {
    const created = new Date(dateStr);
    const diff = new Date().getTime() - created.getTime();
    const mins = Math.floor(diff / CONSTS.MINUTE);
    const hours = Math.floor(diff / CONSTS.HOUR);
    const days = Math.floor(diff / CONSTS.DAY);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < CONSTS.WEEK_DAYS) return `${days}d ago`;

    return created.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  private getStatusButtonsHTML(task: Task): string {
    const btns: string[] = [];
    const base =
      "text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95";

    if (task.status !== Status.ToDo) {
      btns.push(`
        <button class="status-btn ${base} bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700" data-task-id="${task.id}" data-status="${Status.ToDo}">
          <i class="fa-solid fa-arrow-rotate-left pointer-events-none"></i> <span class="pointer-events-none">To Do</span>
        </button>
      `);
    }

    if (task.status !== Status.InProgress) {
      btns.push(`
        <button class="status-btn ${base} bg-amber-100 text-amber-700 hover:bg-amber-200" data-task-id="${task.id}" data-status="${Status.InProgress}">
          <i class="fa-solid fa-play pointer-events-none"></i> <span class="pointer-events-none">Start</span>
        </button>
      `);
    }

    if (task.status !== Status.Completed) {
      btns.push(`
        <button class="status-btn ${base} bg-emerald-100 text-emerald-700 hover:bg-emerald-200" data-task-id="${task.id}" data-status="${Status.Completed}">
          <i class="fa-solid fa-check pointer-events-none"></i> <span class="pointer-events-none">Complete</span>
        </button>
      `);
    }

    return btns.join("");
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private showNotification(message: string, type: "success" | "error"): void {
    const existing = document.querySelector<HTMLDivElement>(".notification");
    if (existing) {
      existing.remove();
    }

    const el = document.createElement("div");
    el.className = `notification ${type}`;
    el.textContent = message;
    document.body.appendChild(el);

    setTimeout(() => {
      el.classList.add("fade-out");
      setTimeout(() => el.remove(), CONSTS.FADE_OUT_DURATION);
    }, CONSTS.NOTIFICATION_DURATION);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new KanbanApp();
});
