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
        const taskId = data.id;

        const taskList = document.getElementById("taskList");

        const task = document.createElement("p");
        task.textContent =
            "📚 " + subject +
            " — 📌 " + taskText +
            " — 📅 " + deadline;

        const completeButton = document.createElement("button");
        completeButton.textContent = "✅ Complete";

        completeButton.onclick = function() {
    fetch("/complete_task/" + taskId, {
        method: "PUT"
    })
    .then(response => response.json())
    .then(data => {
        task.style.textDecoration = "line-through";
        completeButton.disabled = true;

        alert(data.message);
    });
};

        task.appendChild(completeButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️ Delete";

        deleteButton.onclick = function() {
            fetch("/delete_task/" + taskId, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
                task.remove();

                document.getElementById("taskCount").textContent =
                    "Total Tasks: " + taskList.children.length;

                alert(data.message);
            });
        };

        task.appendChild(deleteButton);

        taskList.appendChild(task);

        document.getElementById("taskCount").textContent =
            "Total Tasks: " + taskList.children.length;

        input.value = "";
        subjectInput.value = "";
        deadlineInput.value = "";
    });
}


function clearTasks() {
    const taskList = document.getElementById("taskList");
    const taskCount = document.getElementById("taskCount");

    fetch("/clear_tasks", {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        taskList.innerHTML = "";
        taskCount.textContent = "Total Tasks: 0";

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
        taskTextElement.style.textDecoration = "line-through";
        completeButton.disabled = true;

        alert(data.message);
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
                        task.remove();

                        document.getElementById("taskCount").textContent =
                            "Total Tasks: " + taskList.children.length;

                        alert(data.message);
                    });
                };

                task.appendChild(deleteButton);
                if (completed === 1) {
    taskTextElement.style.textDecoration = "line-through";
    completeButton.disabled = true;
}

                taskList.appendChild(task);
            });

            document.getElementById("taskCount").textContent =
                "Total Tasks: " + taskList.children.length;
        })
        .catch(error => {
            console.error("Error loading tasks:", error);
        });
}

loadTasks();