function addTask() {

    const subjectInput =
        document.getElementById("subject");

    const taskInput =
        document.getElementById("taskInput");

    const deadlineInput =
        document.getElementById("deadline");


    const subject =
        subjectInput.value.trim();

    const taskText =
        taskInput.value.trim();

    const deadline =
        deadlineInput.value;


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

        subjectInput.value = "";

        taskInput.value = "";

        deadlineInput.value = "";

        loadTasks();

    })

    .catch(error => {

        console.error(
            "Error adding task:",
            error
        );

    });
}



function clearTasks() {

    if (!confirm("Delete all tasks?")) {

        return;
    }


    fetch("/clear_tasks", {

        method: "DELETE"

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        loadTasks();

    })

    .catch(error => {

        console.error(
            "Error clearing tasks:",
            error
        );

    });
}



function loadTasks() {

    fetch("/get_tasks")

        .then(response => response.json())

        .then(tasks => {

            const taskList =
                document.getElementById("taskList");


            taskList.innerHTML = "";


            tasks.forEach(taskData => {

                const taskId =
                    taskData[0];

                const subject =
                    taskData[1];

                const taskText =
                    taskData[2];

                const deadline =
                    taskData[3];

                const completed =
                    taskData[4];


                const task =
                    document.createElement("p");


                const taskTextElement =
                    document.createElement("span");


                /*
                    Deadline Status
                */

                let deadlineStatus = "";


                if (deadline) {

                    const today =
                        new Date()
                            .toISOString()
                            .split("T")[0];


                    if (deadline < today) {

                        deadlineStatus =
                            " 🔴 Overdue";

                    } else {

                        deadlineStatus =
                            " 🟢 Upcoming";

                    }

                }


                /*
                    Task Text
                */

                taskTextElement.textContent =
                    "📚 " + subject +
                    " — 📌 " + taskText +
                    " — 📅 " + deadline +
                    deadlineStatus;


                task.appendChild(
                    taskTextElement
                );


                /*
                    Complete Button
                */

                const completeButton =
                    document.createElement("button");


                completeButton.textContent =
                    "✅ Complete";


                completeButton.onclick =
                    function () {

                        fetch(
                            "/complete_task/" +
                            taskId,
                            {
                                method: "PUT"
                            }
                        )

                        .then(response =>
                            response.json()
                        )

                        .then(data => {

                            alert(data.message);

                            loadTasks();

                        });

                    };


                task.appendChild(
                    completeButton
                );


                /*
                    Delete Button
                */

                const deleteButton =
                    document.createElement("button");


                deleteButton.textContent =
                    "🗑️ Delete";


                deleteButton.onclick =
                    function () {

                        fetch(
                            "/delete_task/" +
                            taskId,
                            {
                                method: "DELETE"
                            }
                        )

                        .then(response =>
                            response.json()
                        )

                        .then(data => {

                            alert(data.message);

                            loadTasks();

                        });

                    };


                task.appendChild(
                    deleteButton
                );


                /*
                    Show Completed Task
                */

                if (completed === 1) {

                    taskTextElement.style.textDecoration =
                        "line-through";


                    completeButton.disabled =
                        true;

                }


                taskList.appendChild(task);

            });


            /*
                Total Task Counter
            */

            document.getElementById(
                "taskCount"
            ).textContent =
                "Total Tasks: " +
                tasks.length;


            /*
                Completed Counter
            */

            const completedTasks =
                tasks.filter(
                    task => task[4] === 1
                ).length;


            document.getElementById(
                "completedCount"
            ).textContent =
                "Completed: " +
                completedTasks;


            /*
                Empty Task Message
            */

            if (tasks.length === 0) {

                taskList.innerHTML =
                    "<p class='empty-message'>" +
                    "No tasks yet. Add your first task! 📚" +
                    "</p>";

            }


            /*
                Apply Search / Filter
            */

            filterTasks();

        })

        .catch(error => {

            console.error(
                "Error loading tasks:",
                error
            );

        });

}



function filterTasks() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const searchText =
        searchInput.value.toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const taskItems =
        document.querySelectorAll(
            "#taskList p"
        );


    taskItems.forEach(item => {

        /*
            Don't hide empty message
        */

        if (
            item.classList.contains(
                "empty-message"
            )
        ) {

            return;

        }


        const taskText =
            item.textContent.toLowerCase();


        /*
            First button = Complete button
        */

        const completeButton =
            item.querySelector("button");


        const isCompleted =
            completeButton.disabled;


        /*
            Search condition
        */

        const matchesSearch =
            taskText.includes(
                searchText
            );


        /*
            Status condition
        */

        let matchesStatus = true;


        if (
            selectedStatus ===
            "completed"
        ) {

            matchesStatus =
                isCompleted;

        }


        if (
            selectedStatus ===
            "pending"
        ) {

            matchesStatus =
                !isCompleted;

        }


        /*
            Show / Hide task
        */

        if (
            matchesSearch &&
            matchesStatus
        ) {

            item.style.display =
                "";

        } else {

            item.style.display =
                "none";

        }

    });

}



loadTasks();