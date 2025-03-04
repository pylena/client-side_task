document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const taskInput = document.getElementById("task-input");
    const addTaskBtn = document.getElementById("add-task");
    const filterSelect = document.getElementById("filter");
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    // Fetch tasks from API if not in localStorage
    if (!tasks.length) {
      fetch("https://jsonplaceholder.typicode.com/todos?_limit=10")
        .then((response) => response.json())
        .then((data) => {
          tasks = data;
          localStorage.setItem("tasks", JSON.stringify(tasks));
          renderTasks();
        });
    } else {
      renderTasks();
    }
  
    // 1: Render 
    function renderTasks() {
      taskList.innerHTML = "";
      const filteredTasks = tasks.filter((task) => {
        if (filterSelect.value === "completed") return task.completed;
        if (filterSelect.value === "pending") return !task.completed;
        return true;
      });
      filteredTasks.forEach((task) => createTaskElement(task));
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  
    // 2: ADD
    function createTaskElement(task) {
      const li = document.createElement("li");
      li.draggable = true;
      li.dataset.id = task.id;
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""}>
        <span contenteditable>${task.title}</span>
        <button class="delete">Delete</button>
      `;
      li.querySelector("input").addEventListener("change", () => toggleCompletion(task.id));
      li.querySelector(".delete").addEventListener("click", () => deleteTask(task.id));
      li.querySelector("span").addEventListener("blur", (e) => updateTask(task.id, e.target.innerText));
      li.addEventListener("dragstart", handleDragStart);
      li.addEventListener("dragover", (e) => e.preventDefault());
      li.addEventListener("drop", handleDrop);
      taskList.appendChild(li);
    }
  
    // Add task
    addTaskBtn.addEventListener("click", () => {
      const title = taskInput.value.trim();
      if (title.length < 5) return alert("Task must be at least 5 characters long.");
      const newTask = { id: Date.now(), title, completed: false };
      tasks.push(newTask);
      taskInput.value = "";
      renderTasks();
    });
  
    // Update 
    function updateTask(id, newTitle) {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        task.title = newTitle;
        renderTasks();
      }
    }
  
    // Delete 
    function deleteTask(id) {
      tasks = tasks.filter((task) => task.id !== id);
      renderTasks();
    }
  
    //  COMPLATE
    function toggleCompletion(id) {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        task.completed = !task.completed;
        renderTasks();
      }
    }
  
    
    let draggedItemId;
  
    function handleDragStart(e) {
      draggedItemId = e.target.dataset.id;
      e.dataTransfer.setData("text/plain", draggedItemId);
    }
  
    function handleDrop(e) {
      const draggedId = Number(e.dataTransfer.getData("text/plain"));
      const droppedId = Number(e.target.dataset.id);
      const draggedIndex = tasks.findIndex((task) => task.id === draggedId);
      const droppedIndex = tasks.findIndex((task) => task.id === droppedId);
      const [draggedTask] = tasks.splice(draggedIndex, 1);
      tasks.splice(droppedIndex, 0, draggedTask);
      renderTasks();
    }
  
    // Filter tasks
    filterSelect.addEventListener("change", renderTasks);
  
    renderTasks();
  });
  