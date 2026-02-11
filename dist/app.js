"use strict";
var Status;
(function (Status) {
    Status["ToDo"] = "todo";
    Status["InProgress"] = "in-progress";
    Status["Completed"] = "completed";
})(Status || (Status = {}));
const VALIDATION = {
    title: {
        minLength: 3,
        maxLength: 100,
    },
    description: {
        maxLength: 500,
    },
};
class StorageWrapper {
    constructor(key) {
        this.storageKey = key;
    }
    save(data) {
        try {
            const str = JSON.stringify(data);
            localStorage.setItem(this.storageKey, str);
        }
        catch (e) {
            console.error("فشل الحفظ في التخزين المحلي:", e);
        }
    }
    load() {
        try {
            const str = localStorage.getItem(this.storageKey);
            if (str === null) {
                return null;
            }
            return JSON.parse(str);
        }
        catch (e) {
            console.error("فشل القراءة من التخزين المحلي:", e);
            return null;
        }
    }
    clear() {
        localStorage.removeItem(this.storageKey);
    }
}
const STORAGE_KEY = "kanban-tasks";
const COLUMNS = [
    { id: Status.ToDo, title: "To Do", icon: "fa-solid fa-clipboard-list" },
    { id: Status.InProgress, title: "In Progress", icon: "fa-solid fa-spinner" },
    { id: Status.Completed, title: "Completed", icon: "fa-solid fa-circle-check" },
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
function getById(id) {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error("العنصر غير موجود: " + id);
    }
    return el;
}
class KanbanApp {
    constructor() {
        this.tasks = [];
        this.editingTaskId = null;
        this.storage = new StorageWrapper(STORAGE_KEY);
        this.formElement = getById("task-form");
        this.titleInput = getById("task-title");
        this.descriptionInput = getById("task-description");
        this.dueDateInput = getById("task-due-date");
        this.prioritySelect = getById("task-priority");
        this.columnsContainer = getById("columns-container");
        this.modalOverlay = getById("modal-overlay");
        this.addTaskBtn = getById("add-task-btn");
        this.closeModalBtn = getById("close-modal-btn");
        this.cancelBtn = getById("cancel-btn");
        this.charCount = getById("char-count");
        this.modalTitle = getById("modal-title");
        this.modalIcon = getById("modal-icon");
        this.submitBtn = getById("submit-btn");
        this.submitBtnText = getById("submit-btn-text");
        this.titleError = getById("title-error");
        this.dateError = getById("date-error");
        this.descriptionError = getById("description-error");
        this.loadTasks();
        this.bindEvents();
        this.render();
    }
    loadTasks() {
        const loaded = this.storage.load();
        if (loaded === null) {
            this.tasks = [];
        }
        else {
            this.tasks = loaded;
        }
    }
    saveTasks() {
        this.storage.save(this.tasks);
    }
    generateId() {
        const time = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return "task-" + time + "-" + random;
    }
    addTask(data) {
        const newTask = {
            id: this.generateId(),
            title: data.title.trim(),
            description: data.description.trim(),
            status: Status.ToDo,
            priority: data.priority,
            dueDate: data.dueDate,
            createdAt: new Date().toISOString(),
        };
        this.tasks.push(newTask);
        this.saveTasks();
        this.render();
    }
    updateTaskStatus(taskId, status) {
        const task = this.tasks.find(function (t) {
            return t.id === taskId;
        });
        if (task) {
            task.status = status;
            this.saveTasks();
            this.render();
        }
    }
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(function (t) {
            return t.id !== taskId;
        });
        this.saveTasks();
        this.render();
    }
    updateTask(taskId, data) {
        const task = this.tasks.find(function (t) {
            return t.id === taskId;
        });
        if (task) {
            task.title = data.title.trim();
            task.description = data.description.trim();
            task.priority = data.priority;
            task.dueDate = data.dueDate;
            this.saveTasks();
            this.render();
        }
    }
    getTaskById(taskId) {
        return this.tasks.find(function (t) {
            return t.id === taskId;
        });
    }
    getTasksByStatus(status) {
        return this.tasks.filter(function (t) {
            return t.status === status;
        });
    }
    bindEvents() {
        const self = this;
        this.addTaskBtn.addEventListener("click", function () {
            self.openModal();
        });
        this.closeModalBtn.addEventListener("click", function () {
            self.closeModal();
        });
        this.cancelBtn.addEventListener("click", function () {
            self.closeModal();
        });
        this.modalOverlay.addEventListener("click", function (e) {
            if (e.target === self.modalOverlay) {
                self.closeModal();
            }
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                const isOpen = !self.modalOverlay.classList.contains("hidden");
                if (isOpen) {
                    self.closeModal();
                }
            }
        });
        this.descriptionInput.addEventListener("input", function () {
            const len = self.descriptionInput.value.length;
            self.charCount.textContent = len + "/" + VALIDATION.description.maxLength;
            if (len > VALIDATION.description.maxLength) {
                self.charCount.classList.add("text-red-500");
                self.charCount.classList.remove("text-slate-400");
            }
            else {
                self.charCount.classList.remove("text-red-500");
                self.charCount.classList.add("text-slate-400");
            }
        });
        this.titleInput.addEventListener("input", function () {
            self.clearFieldError(self.titleInput, self.titleError);
        });
        this.dueDateInput.addEventListener("input", function () {
            self.clearFieldError(self.dueDateInput, self.dateError);
        });
        this.formElement.addEventListener("submit", function (e) {
            e.preventDefault();
            self.handleFormSubmit();
        });
        this.columnsContainer.addEventListener("click", function (e) {
            const target = e.target;
            if (target.classList.contains("status-btn")) {
                const taskId = target.dataset.taskId;
                const status = target.dataset.status;
                if (taskId && status) {
                    self.updateTaskStatus(taskId, status);
                }
            }
            if (target.classList.contains("delete-btn")) {
                const taskId = target.dataset.taskId;
                if (taskId) {
                    self.deleteTask(taskId);
                }
            }
            if (target.classList.contains("edit-btn")) {
                const taskId = target.dataset.taskId;
                if (taskId) {
                    self.openEditModal(taskId);
                }
            }
        });
    }
    openModal() {
        this.editingTaskId = null;
        this.setModalMode("add");
        this.modalOverlay.classList.remove("hidden");
        this.modalOverlay.classList.add("flex");
        document.body.style.overflow = "hidden";
        this.titleInput.focus();
    }
    openEditModal(taskId) {
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
        this.charCount.textContent =
            task.description.length + "/" + VALIDATION.description.maxLength;
        this.modalOverlay.classList.remove("hidden");
        this.modalOverlay.classList.add("flex");
        document.body.style.overflow = "hidden";
        this.titleInput.focus();
    }
    setModalMode(mode) {
        if (mode === "add") {
            this.modalTitle.textContent = "Create New Task";
            this.modalIcon.className = "fa-solid fa-plus-circle text-indigo-500";
            this.submitBtnText.textContent = "Add Task";
            const icon = this.submitBtn.querySelector("i");
            if (icon) {
                icon.classList.replace("fa-save", "fa-plus");
            }
        }
        else {
            this.modalTitle.textContent = "Edit Task";
            this.modalIcon.className = "fa-solid fa-pen-to-square text-indigo-500";
            this.submitBtnText.textContent = "Save Changes";
            const icon = this.submitBtn.querySelector("i");
            if (icon) {
                icon.classList.replace("fa-plus", "fa-save");
            }
        }
    }
    closeModal() {
        this.editingTaskId = null;
        this.modalOverlay.classList.add("hidden");
        this.modalOverlay.classList.remove("flex");
        document.body.style.overflow = "";
        this.formElement.reset();
        this.charCount.textContent = "0/" + VALIDATION.description.maxLength;
        this.clearAllErrors();
    }
    validateForm() {
        let valid = true;
        this.clearAllErrors();
        const title = this.titleInput.value.trim();
        if (!title) {
            this.showFieldError(this.titleInput, this.titleError, "Task title is required");
            valid = false;
        }
        else if (title.length < VALIDATION.title.minLength) {
            this.showFieldError(this.titleInput, this.titleError, "Title must be at least " + VALIDATION.title.minLength + " characters");
            valid = false;
        }
        else if (title.length > VALIDATION.title.maxLength) {
            this.showFieldError(this.titleInput, this.titleError, "Title must be less than " + VALIDATION.title.maxLength + " characters");
            valid = false;
        }
        const due = this.dueDateInput.value;
        if (due) {
            const dueDate = new Date(due);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dueDate < today) {
                this.showFieldError(this.dueDateInput, this.dateError, "Due date cannot be in the past");
                valid = false;
            }
        }
        if (this.descriptionInput.value.length > VALIDATION.description.maxLength) {
            this.showFieldError(this.descriptionInput, this.descriptionError, "Description must be less than " + VALIDATION.description.maxLength + " characters");
            valid = false;
        }
        return valid;
    }
    showFieldError(input, errorEl, message) {
        input.classList.add("border-red-500", "focus:ring-red-500", "focus:border-red-500");
        input.classList.remove("border-slate-300", "focus:ring-indigo-500", "focus:border-indigo-500");
        errorEl.textContent = message;
        errorEl.classList.remove("hidden");
    }
    clearFieldError(input, errorEl) {
        input.classList.remove("border-red-500", "focus:ring-red-500", "focus:border-red-500");
        input.classList.add("border-slate-300", "focus:ring-indigo-500", "focus:border-indigo-500");
        errorEl.classList.add("hidden");
    }
    clearAllErrors() {
        this.clearFieldError(this.titleInput, this.titleError);
        this.clearFieldError(this.dueDateInput, this.dateError);
        this.clearFieldError(this.descriptionInput, this.descriptionError);
    }
    handleFormSubmit() {
        if (!this.validateForm()) {
            return;
        }
        const payload = {
            title: this.titleInput.value,
            description: this.descriptionInput.value,
            dueDate: this.dueDateInput.value,
            priority: this.prioritySelect.value,
        };
        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, payload);
            this.closeModal();
            this.showNotification("Task updated successfully!", "success");
        }
        else {
            this.addTask(payload);
            this.closeModal();
            this.showNotification("Task added successfully!", "success");
        }
    }
    render() {
        this.columnsContainer.innerHTML = "";
        for (let i = 0; i < COLUMNS.length; i++) {
            const col = COLUMNS[i];
            const colEl = this.createColumnElement(col);
            this.columnsContainer.appendChild(colEl);
        }
    }
    createColumnElement(col) {
        const wrapper = document.createElement("div");
        wrapper.className =
            "bg-white/60 backdrop-blur-sm rounded-2xl p-5 flex flex-col min-h-[500px] border border-slate-200/50 shadow-sm";
        wrapper.dataset.status = col.id;
        const tasks = this.getTasksByStatus(col.id);
        let styles;
        if (col.id === Status.ToDo) {
            styles = { icon: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" };
        }
        else if (col.id === Status.InProgress) {
            styles = { icon: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" };
        }
        else {
            styles = { icon: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" };
        }
        let tasksHtml;
        if (tasks.length === 0) {
            tasksHtml = `
            <div class="flex flex-col items-center justify-center py-12 text-slate-400">
              <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
              <p class="text-sm">No tasks yet</p>
              <p class="text-xs mt-1">Click + to add one</p>
            </div>`;
        }
        else {
            tasksHtml = "";
            for (let i = 0; i < tasks.length; i++) {
                tasksHtml = tasksHtml + this.createTaskCardHTML(tasks[i]);
            }
        }
        const taskWord = tasks.length === 1 ? "task" : "tasks";
        wrapper.innerHTML =
            `
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 ` +
                styles.bg +
                ` rounded-xl flex items-center justify-center">
          <i class="` +
                col.icon +
                ` ` +
                styles.icon +
                ` text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="font-semibold text-slate-800">` +
                col.title +
                `</h2>
          <p class="text-xs text-slate-400">` +
                tasks.length +
                " " +
                taskWord +
                `</p>
        </div>
      </div>
      <div class="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 -mr-1" id="tasks-` +
                col.id +
                `">
        ` +
                tasksHtml +
                `
      </div>
    `;
        return wrapper;
    }
    createTaskCardHTML(task) {
        let dueLabel = "";
        if (task.dueDate) {
            dueLabel = new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
        const now = new Date();
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate !== null && dueDate < now && task.status !== Status.Completed;
        const isSoon = dueDate !== null &&
            !isOverdue &&
            this.isDueSoon(task.dueDate) &&
            task.status !== Status.Completed;
        const isDone = task.status === Status.Completed;
        let priorityStyle;
        if (task.priority === "high") {
            priorityStyle = {
                bg: "bg-red-50",
                text: "text-red-600",
                dot: "bg-red-500",
                label: "High Priority",
            };
        }
        else if (task.priority === "low") {
            priorityStyle = {
                bg: "bg-blue-50",
                text: "text-blue-600",
                dot: "bg-blue-500",
                label: "Low",
            };
        }
        else {
            priorityStyle = {
                bg: "bg-amber-50",
                text: "text-amber-600",
                dot: "bg-amber-500",
                label: "Medium",
            };
        }
        const timeAgo = this.getTimeAgo(task.createdAt);
        const number = this.getTaskNumber(task.id);
        let statusDot = "bg-slate-300";
        if (task.status === Status.InProgress)
            statusDot = "bg-amber-400";
        if (task.status === Status.Completed)
            statusDot = "bg-emerald-500";
        let extraClass = "";
        if (isOverdue)
            extraClass = extraClass + " ring-2 ring-red-100 border-red-200";
        if (isDone)
            extraClass = extraClass + " opacity-75";
        let titleClass = "font-semibold text-slate-800 mb-2 leading-snug";
        if (isDone)
            titleClass = titleClass + " line-through text-slate-500";
        let descriptionHtml = "";
        if (task.description) {
            const safeDesc = this.escapeHtml(task.description);
            descriptionHtml =
                '<p class="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">' +
                    safeDesc +
                    "</p>";
        }
        let overdueHtml = "";
        if (isOverdue) {
            overdueHtml =
                '<span class="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation"></i> Overdue</span>';
        }
        let soonHtml = "";
        if (isSoon) {
            soonHtml =
                '<span class="bg-orange-100 text-orange-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">Due Soon</span>';
        }
        let doneHtml = "";
        if (isDone) {
            doneHtml =
                '<span class="bg-emerald-100 text-emerald-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1"><i class="fa-solid fa-check"></i> Done</span>';
        }
        let dueHtml = "";
        if (dueLabel) {
            let dueClass = "flex items-center gap-1.5";
            if (isOverdue)
                dueClass = dueClass + " text-red-500";
            else if (isSoon)
                dueClass = dueClass + " text-orange-500";
            dueHtml =
                '<div class="' +
                    dueClass +
                    '"><i class="fa-regular fa-calendar"></i><span>' +
                    dueLabel +
                    "</span></div>";
        }
        const statusBtns = this.getStatusButtonsHTML(task);
        const safeTitle = this.escapeHtml(task.title);
        const createdTitle = "Created " + new Date(task.createdAt).toLocaleString();
        return ('<div class="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 ' +
            extraClass +
            '" data-task-id="' +
            task.id +
            '">' +
            '<div class="flex items-center justify-between mb-3">' +
            '<div class="flex items-center gap-2">' +
            '<span class="w-2 h-2 rounded-full ' +
            statusDot +
            '"></span>' +
            '<span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">#' +
            number +
            "</span>" +
            "</div>" +
            '<div class="flex items-center gap-1 text-slate-400">' +
            '<button class="edit-btn text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors" data-task-id="' +
            task.id +
            '" title="Edit task"><i class="fa-solid fa-pen text-xs pointer-events-none"></i></button>' +
            '<button class="delete-btn text-slate-400 hover:text-red-500 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors" data-task-id="' +
            task.id +
            '" title="Delete task"><i class="fa-solid fa-trash-can text-xs pointer-events-none"></i></button>' +
            "</div>" +
            "</div>" +
            "<h3 class=\"" +
            titleClass +
            "\">" +
            safeTitle +
            "</h3>" +
            descriptionHtml +
            '<div class="flex flex-wrap items-center gap-2 mb-4">' +
            '<span class="' +
            priorityStyle.bg +
            " " +
            priorityStyle.text +
            ' text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">' +
            '<span class="w-1.5 h-1.5 rounded-full ' +
            priorityStyle.dot +
            '"></span>' +
            priorityStyle.label +
            "</span>" +
            overdueHtml +
            soonHtml +
            doneHtml +
            "</div>" +
            '<div class="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-3 border-b border-slate-100">' +
            dueHtml +
            '<div class="flex items-center gap-1.5" title="' +
            createdTitle +
            '"><i class="fa-regular fa-clock"></i><span>' +
            timeAgo +
            "</span></div>" +
            "</div>" +
            '<div class="flex flex-wrap gap-2">' +
            statusBtns +
            "</div>" +
            "</div>");
    }
    isDueSoon(dateStr) {
        const due = new Date(dateStr);
        const now = new Date();
        const diffMs = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / CONSTS.DAY);
        return diffDays >= 0 && diffDays <= CONSTS.DUE_SOON_DAYS;
    }
    getTaskNumber(taskId) {
        let index = -1;
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id === taskId) {
                index = i;
                break;
            }
        }
        const num = index + 1;
        return String(num).padStart(3, "0");
    }
    getTimeAgo(dateStr) {
        const created = new Date(dateStr);
        const diff = new Date().getTime() - created.getTime();
        const mins = Math.floor(diff / CONSTS.MINUTE);
        const hours = Math.floor(diff / CONSTS.HOUR);
        const days = Math.floor(diff / CONSTS.DAY);
        if (mins < 1)
            return "Just now";
        if (mins < 60)
            return mins + "m ago";
        if (hours < 24)
            return hours + "h ago";
        if (days < CONSTS.WEEK_DAYS)
            return days + "d ago";
        return created.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    getStatusButtonsHTML(task) {
        const base = "text-[11px] px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95";
        let html = "";
        if (task.status !== Status.ToDo) {
            html =
                html +
                    '<button class="status-btn ' +
                    base +
                    ' bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700" data-task-id="' +
                    task.id +
                    '" data-status="' +
                    Status.ToDo +
                    '"><i class="fa-solid fa-arrow-rotate-left pointer-events-none"></i> <span class="pointer-events-none">To Do</span></button>';
        }
        if (task.status !== Status.InProgress) {
            html =
                html +
                    '<button class="status-btn ' +
                    base +
                    ' bg-amber-100 text-amber-700 hover:bg-amber-200" data-task-id="' +
                    task.id +
                    '" data-status="' +
                    Status.InProgress +
                    '"><i class="fa-solid fa-play pointer-events-none"></i> <span class="pointer-events-none">Start</span></button>';
        }
        if (task.status !== Status.Completed) {
            html =
                html +
                    '<button class="status-btn ' +
                    base +
                    ' bg-emerald-100 text-emerald-700 hover:bg-emerald-200" data-task-id="' +
                    task.id +
                    '" data-status="' +
                    Status.Completed +
                    '"><i class="fa-solid fa-check pointer-events-none"></i> <span class="pointer-events-none">Complete</span></button>';
        }
        return html;
    }
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
    showNotification(message, type) {
        const existing = document.querySelector(".notification");
        if (existing) {
            existing.remove();
        }
        const el = document.createElement("div");
        el.className = "notification " + type;
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => {
            el.classList.add("fade-out");
            setTimeout(function () {
                el.remove();
            }, CONSTS.FADE_OUT_DURATION);
        }, CONSTS.NOTIFICATION_DURATION);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    new KanbanApp();
});
