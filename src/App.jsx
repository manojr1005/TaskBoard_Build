import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader";
import TaskBoard from "./components/TaskBoard";
import { fetchTasks, fetchUsers, mapTasksToUsers, createTask, updateTask, deleteTask } from "./api";
import { PAGINATION_CONFIG } from "./utils/commonutils";
import "./App.css";
import TaskForm from "./components/TaskForm";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null);
  const [deletedTask, setDeletedTask] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setLoading(true);
      setError("");

      try {
        const [todosData, usersData] = await Promise.all([
          fetchTasks(
            PAGINATION_CONFIG.PAGE_SIZE,
            currentPage * PAGINATION_CONFIG.PAGE_SIZE
          ),
          fetchUsers(),
        ]);

        if (cancelled) return;

        setTasks(mapTasksToUsers(todosData.todos, usersData.users));
        setUsers(usersData.users);
        setTotalTasks(todosData.total);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load tasks.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [currentPage, retryCount]);

  // Create a task and add it to the board.
async function handleCreateTask(taskData) {
  const newTask = {
    ...taskData,
    id: `local-${Date.now()}`,
    assignee:
      users.find((user) => user.id === taskData.userId)
        ? `${users.find((user) => user.id === taskData.userId).firstName} ${users.find((user) => user.id === taskData.userId).lastName}`
        : "Unassigned",
    avatar:
      users.find((user) => user.id === taskData.userId)?.image || "",
    completed: taskData.status === "Done",
  };

  setTasks((currentTasks) => [newTask, ...currentTasks]);

  try {
    await createTask(taskData);
  } catch (err) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== newTask.id)
    );
    console.error("Unable to create task:", err);
  }

  setShowForm(false);
}

// Update a task immediately and restore its old values if the API fails.
async function handleUpdateTask(taskData) {
  const oldTask = editingTask;
  const user = users.find((item) => item.id === taskData.userId);

  const updatedTask = {
    ...oldTask,
    ...taskData,
    id: oldTask.id,
    assignee: user ? `${user.firstName} ${user.lastName}` : "Unassigned",
    avatar: user?.image || "",
    completed: taskData.status === "Done",
  };

  setTasks((currentTasks) =>
    currentTasks.map((task) =>
      task.id === oldTask.id ? updatedTask : task
    )
  );

  try {
    await updateTask(oldTask.id, taskData);
  } catch (err) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === oldTask.id ? oldTask : task
      )
    );
    console.error("Unable to update task:", err);
  } finally {
    setShowForm(false);
    setEditingTask(null);
  }
}



// Delete the task and allow undo for five seconds.
async function handleDeleteTask(task) {
  setTasks((currentTasks) =>
    currentTasks.filter((item) => item.id !== task.id)
  );
  setDeletedTask(task);

  try {
    await deleteTask(task.id);
  } catch (err) {
    setTasks((currentTasks) => [task, ...currentTasks]);
    setDeletedTask(null);
    console.error("Unable to delete task:", err);
    return;
  }

  window.setTimeout(() => {
    setDeletedTask((current) =>
      current?.id === task.id ? null : current
    );
  }, 5000);
}


// Restore the task deleted most recently.
function handleUndoDelete() {
  if (!deletedTask) return;

  setTasks((currentTasks) => {
    const alreadyExists = currentTasks.some(
      (task) => task.id === deletedTask.id
    );

    return alreadyExists
      ? currentTasks
      : [deletedTask, ...currentTasks];
  });

  setDeletedTask(null);
}

// Opens the form with the selected task's existing values.
function handleEditClick(task) {
  setEditingTask(task);
  setShowForm(true);
}

  const totalPages = Math.ceil(
    totalTasks / PAGINATION_CONFIG.PAGE_SIZE
  );

  return (
    <div className="app">
      <AppHeader />

      <main className="app-main">
        <button onClick={() => setShowForm(true)}>
  Add Task
</button>

{showForm && (
  <TaskForm
    users={users}
    initialTask={editingTask}
    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
    onCancel={() => {
      setShowForm(false);
      setEditingTask(null);
    }}
  />
)}

{/* Show Undo when a task has been deleted. */}
{deletedTask && (
  <div role="status" className="undo-notice">
    <span>Task deleted: {deletedTask.title}</span>
    <button type="button" onClick={handleUndoDelete}>
      Undo
    </button>
  </div>
)}


        {loading && <p role="status">Loading tasks...</p>}

        {!loading && error && (
          <div role="alert">
            <p>{error}</p>
            <button onClick={() => setRetryCount((count) => count + 1)}>
            Retry
            </button>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <p>No tasks found.</p>
        )}

        {!loading && !error && tasks.length > 0 && (
          <>
            <TaskBoard tasks={tasks} onEdit={handleEditClick} onDelete={handleDeleteTask} />

            <nav className="pagination" aria-label="Task pages">
              <button
                disabled={currentPage === 0 || loading}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>

              <span>
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                disabled={currentPage + 1 >= totalPages || loading}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </nav>
          </>
        )}
      </main>
    </div>
  );
}
