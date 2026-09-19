const inputField = document.querySelector("#inputField");
const card = document.querySelector("#card");
const searchBox = document.querySelector("#searchBox");
const taskForm = document.querySelector("#taskForm");
const viewNav = document.querySelector("#viewNav");
let currentView = "inbox";
const viewDetails = {
  inbox: ["Inbox", "Capture ideas and keep moving."],
  today: ["Today", "A clear view of what needs your attention."],
  upcoming: ["Upcoming", "Keep an eye on what is next."],
  completed: ["Completed", "A record of everything you have finished."],
  all: ["All tasks", "Everything in one place."],
};

function getTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem("todo"));
    if (!Array.isArray(storedTasks)) return [];
    return storedTasks.filter(
      (task) =>
        task && typeof task === "object" && typeof task.title === "string",
    );
  } catch (error) {
    return [];
  }
}
function saveTasks(tasks) {
  localStorage.setItem("todo", JSON.stringify(tasks));
}
function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;",
      })[character],
  );
}

function showData() {
  const tasks = getTasks();
  const query = searchBox.value.toLowerCase().trim();
  const visibleTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(query);
    const matchesView =
      currentView === "all" ||
      (currentView === "completed"
        ? task.completed
        : currentView === "inbox"
          ? !task.completed
          : task.view === currentView);
    return matchesSearch && matchesView;
  });
  card.innerHTML = visibleTasks.length
    ? visibleTasks
        .map((task) => {
          const index = tasks.indexOf(task);
          const date = task.createdAt
            ? new Date(task.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            : "Added recently";
          return `<article class="task-item ${task.completed ? "is-complete" : ""}" data-index="${index}"><button class="task-check ${task.completed ? "checked" : ""}" data-action="complete" aria-label="${task.completed ? "Mark incomplete" : "Mark complete"}" title="${task.completed ? "Mark incomplete" : "Mark complete"}"><i class="fa-solid fa-check"></i></button><div class="task-copy"><h2>${escapeHtml(task.title)}</h2><div class="task-meta"><span><i class="fa-regular fa-calendar"></i> ${date}</span><span class="priority"><i class="fa-solid fa-flag"></i> ${task.completed ? "Done" : "Open"}</span></div></div><div class="task-actions"><button data-action="edit" aria-label="Edit ${escapeHtml(task.title)}" title="Edit task"><i class="fa-solid fa-pen"></i></button><button data-action="delete" aria-label="Delete ${escapeHtml(task.title)}" title="Delete task"><i class="fa-solid fa-trash"></i></button></div></article>`;
        })
        .join("")
    : `<div class="empty-state"><span class="empty-icon"><i class="fa-solid fa-check"></i></span><h2>${query ? "No matching tasks" : currentView === "completed" ? "Nothing completed yet" : "Your list is clear"}</h2><p>${query ? "Try a different search term." : "Add a task above and make space for what matters."}</p></div>`;
  document.querySelector("#taskSummary").textContent =
    `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;
  document.querySelector("#inboxCount").textContent = tasks.filter(
    (task) => !task.completed,
  ).length;
  document.querySelector("#allCount").textContent = tasks.length;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = inputField.value.trim();
  if (!title) {
    inputField.focus();
    return;
  }
  const tasks = getTasks();
  tasks.unshift({
    title,
    completed: false,
    view:
      currentView === "today" || currentView === "upcoming"
        ? currentView
        : "inbox",
    createdAt: new Date().toISOString(),
  });
  saveTasks(tasks);
  inputField.value = "";
  showData();
  inputField.focus();
});
searchBox.addEventListener("input", showData);
viewNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  currentView = button.dataset.view;
  document
    .querySelectorAll(".nav-item[data-view]")
    .forEach((item) => item.classList.toggle("active", item === button));
  document.querySelector("#pageTitle").textContent =
    viewDetails[currentView][0];
  document.querySelector("#pageSubtitle").textContent =
    viewDetails[currentView][1];
  showData();
});
card.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const item = button.closest(".task-item");
  const index = Number(item.dataset.index);
  const tasks = getTasks();
  if (button.dataset.action === "delete") tasks.splice(index, 1);
  if (button.dataset.action === "complete")
    tasks[index].completed = !tasks[index].completed;
  if (button.dataset.action === "edit") {
    inputField.value = tasks[index].title;
    tasks.splice(index, 1);
    inputField.focus();
  }
  saveTasks(tasks);
  showData();
});
document.querySelector("#clearCompleted").addEventListener("click", () => {
  saveTasks(getTasks().filter((task) => !task.completed));
  showData();
});
document
  .querySelector("#themeToggle")
  .addEventListener("click", () => document.body.classList.toggle("dark-mode"));
showData();
