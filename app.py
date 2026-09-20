from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)


def init_db():
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            task TEXT NOT NULL,
            deadline TEXT,
            completed INTEGER DEFAULT 0
        )
    """)

    conn.commit()
    conn.close()


init_db()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/add_task", methods=["POST"])
def add_task():
    data = request.json

    subject = data["subject"]
    task = data["task"]
    deadline = data["deadline"]

    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO tasks (subject, task, deadline)
        VALUES (?, ?, ?)
        """,
        (subject, task, deadline)
    )

    conn.commit()

    task_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "message": "Task saved successfully!",
        "id": task_id
    })


@app.route("/get_tasks")
def get_tasks():
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, subject, task, deadline, completed
        FROM tasks
        """
    )

    tasks = cursor.fetchall()

    conn.close()

    return jsonify(tasks)


@app.route("/delete_task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM tasks WHERE id = ?",
        (task_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Task deleted successfully!"
    })


@app.route("/complete_task/<int:task_id>", methods=["PUT"])
def complete_task(task_id):
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET completed = 1
        WHERE id = ?
        """,
        (task_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Task completed successfully!"
    })


@app.route("/clear_tasks", methods=["DELETE"])
def clear_tasks():
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM tasks")

    conn.commit()
    conn.close()

    return jsonify({
        "message": "All tasks deleted successfully!"
    })


if __name__ == "__main__":
    app.run(debug=True)