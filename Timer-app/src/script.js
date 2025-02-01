let taskId = 0;
let tasksData = [];

document.getElementById('addTaskBtn').addEventListener('click', addTask);

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const timeInput = document.getElementById('timeInput');

  const taskName = taskInput.value.trim();
  const timeAllocatedHours = parseInt(timeInput.value);

  if (!taskName || isNaN(timeAllocatedHours) || timeAllocatedHours <= 0) {
    alert("Please enter a valid task name and time.");
    return;
  }

  const timeAllocated = timeAllocatedHours * 3600; // convert hours to seconds
  taskId++;
  const newTask = {
    id: taskId,
    name: taskName,
    timeAllocated: timeAllocated,
    timeRemaining: timeAllocated
  };

  tasksData.push(newTask);
  saveTasks();

  renderTask(newTask);

  taskInput.value = "";
  timeInput.value = "";
}

function renderTask(task) {
  const currentTaskId = task.id;
  const taskDiv = document.createElement('div');
  taskDiv.classList.add('task');
  taskDiv.id = `task-${currentTaskId}`;
  taskDiv.innerHTML = `
    <div class="task-info">
      <h3>${task.name}</h3>
      <div class="timerDisplay" id="timer-${currentTaskId}">Time remaining: ${formatTime(task.timeRemaining)}</div>
    </div>
    <div class="task-actions">
      <button class="startStopBtn" id="btn-${currentTaskId}">Start</button>
      <button class="resetBtn" id="reset-${currentTaskId}">Reset</button>
      <button class="deleteBtn" id="delete-${currentTaskId}">Delete</button>
      <div class="status" id="status-${currentTaskId}"></div>
    </div>
  `;

  document.getElementById('taskList').appendChild(taskDiv);

  const startStopBtn = document.getElementById(`btn-${currentTaskId}`);
  const resetBtn = document.getElementById(`reset-${currentTaskId}`);
  const deleteBtn = document.getElementById(`delete-${currentTaskId}`);
  const statusDiv = document.getElementById(`status-${currentTaskId}`);

  let timeRemaining = task.timeRemaining;
  let timerInterval = null;
  let isRunning = false;

  // Updates the task's time in the global tasksData and localStorage
  function updateTaskTime(newTime) {
    task.timeRemaining = newTime;
    saveTasks();
  }

  // Start/Stop functionality
  startStopBtn.addEventListener('click', function () {
    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
      startStopBtn.textContent = 'Start';
      if (timeRemaining < 0) {
        statusDiv.textContent = `Time exceeded by: ${formatTime(Math.abs(timeRemaining))}`;
      }
    } else {
      startStopBtn.textContent = 'Stop';
      statusDiv.textContent = '';
      isRunning = true;
      timerInterval = setInterval(function () {
        if (timeRemaining > 0) {
          timeRemaining--;
          document.getElementById(`timer-${currentTaskId}`).textContent = `Time remaining: ${formatTime(timeRemaining)}`;
          updateTaskTime(timeRemaining);
        } else {
          timeRemaining--;
          document.getElementById(`timer-${currentTaskId}`).textContent = `Time exceeded by: ${formatTime(Math.abs(timeRemaining))}`;
          updateTaskTime(timeRemaining);
        }
      }, 1000);
    }
  });

  // Reset functionality: stops the timer and resets the timeRemaining to the original allocated time
  resetBtn.addEventListener('click', function () {
    clearInterval(timerInterval);
    isRunning = false;
    startStopBtn.textContent = 'Start';
    timeRemaining = task.timeAllocated;
    document.getElementById(`timer-${currentTaskId}`).textContent = `Time remaining: ${formatTime(timeRemaining)}`;
    statusDiv.textContent = '';
    updateTaskTime(timeRemaining);
  });

  // Delete functionality: stops the timer, removes the task from the DOM and from localStorage
  deleteBtn.addEventListener('click', function () {
    clearInterval(timerInterval);
    document.getElementById(`task-${currentTaskId}`).remove();
    tasksData = tasksData.filter(t => t.id !== currentTaskId);
    saveTasks();
  });
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  return `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${sec < 10 ? '0' : ''}${sec}`;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasksData));
}

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasksData = JSON.parse(savedTasks);
    if (tasksData.length > 0) {
      taskId = Math.max(...tasksData.map(t => t.id));
    }
    tasksData.forEach(task => {
      renderTask(task);
    });
  }
}

// Load tasks when the page is loaded
loadTasks(); 