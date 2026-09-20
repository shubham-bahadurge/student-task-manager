function addTask() {
    const input = document.querySelector("input[placeholder='Enter your task']");
    const subjectInput = document.getElementById("subject");
    const deadlineInput = document.getElementById("deadline");

    const taskText = input.value;
    const subject = subjectInput.value;
    const deadline = deadlineInput.value;

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    fetch("/add_task", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            subject: subject,
            task: taskText,
            deadline: deadline
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadTasks();

        input.value = "";
        subjectInput.value = "";
        deadlineInput.value = "";
    });
}


function clearTasks() {
    const taskList = document.getElementById("taskList");

    fetch("/clear_tasks", {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        taskList.innerHTML = "";

        document.getElementById("taskCount").textContent =
            "Total Tasks: 0";

        document.getElementById("completedCount").textContent =
            "Completed: 0";

        alert(data.message);
    });
}


function loadTasks() {
    fetch("/get_tasks")
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById("taskList");

            taskList.innerHTML = "";

            tasks.forEach(taskData => {
                const taskId = taskData[0];
                const subject = taskData[1];
                const taskText = taskData[2];
                const deadline = taskData[3];
                const completed = taskData[4];

                const task = document.createElement("p");

                const taskTextElement = document.createElement("span");

                taskTextElement.textContent =
                    "📚 " + subject +
                    " — 📌 " + taskText +
                    " — 📅 " + deadline;

                task.appendChild(taskTextElement);


                // Complete button
                const completeButton = document.createElement("button");
                completeButton.textContent = "✅ Complete";

                completeButton.onclick = function() {
                    fetch("/complete_task/" + taskId, {
                        method: "PUT"
                    })
                    .then(response => response.json())
                    .then(data => {
                        taskTextElement.style.textDecoration =
                            "line-through";

                        completeButton.disabled = true;

                        alert(data.message);

                        loadTasks();
                    });
                };

                task.appendChild(completeButton);


                // Delete button
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "🗑️ Delete";

                deleteButton.onclick = function() {
                    fetch("/delete_task/" + taskId, {
                        method: "DELETE"
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);

                        loadTasks();
                    });
                };

                task.appendChild(deleteButton);


                // Show completed task
                if (completed === 1) {
                    taskTextElement.style.textDecoration =
                        "line-through";

                    completeButton.disabled = true;
                }

                taskList.appendChild(task);
            });


            // Task counter
            document.getElementById("taskCount").textContent =
                "Total Tasks: " + tasks.length;


            // Completed counter
            const completedTasks =
                tasks.filter(task => task[4] === 1).length;

            document.getElementById("completedCount").textContent =
                "Completed: " + completedTasks;


            // Empty task message
            if (tasks.length === 0) {
                taskList.innerHTML =
                    "<p>No tasks yet. Add your first task! 📚</p>";
            }
        })
        .catch(error => {
            console.error("Error loading tasks:", error);
        });
}


loadTasks();
function filterTasks() {
    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const statusFilter =
        document.getElementById("statusFilter").value;

    const taskItems =
        document.querySelectorAll("#taskList p");

    taskItems.forEach(item => {
        const taskText = item.textContent.toLowerCase();

        const isCompleted =
            item.querySelector("button").disabled;

        const matchesSearch =
            taskText.includes(searchText);

        let matchesStatus = true;

        if (statusFilter === "completed") {
            matchesStatus = isCompleted;
        }

        if (statusFilter === "pending") {
            matchesStatus = !isCompleted;
        }

        if (matchesSearch && matchesStatus) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    });
}