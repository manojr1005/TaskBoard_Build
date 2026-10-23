import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader";
import TaskBoard from "./components/TaskBoard";
import { fetchTasks, fetchUsers, mapTasksToUsers, createTask, updateTask, deleteTask } from "./api";
import { PAGINATION_CONFIG } from "./utils/commonutils";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskTable from "./components/TaskTable";
import { DndContext } from "@dnd-kit/core";

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
  // Stores a temporary success or error notification.
  const [toast, setToast] = useState("");

  const [viewMode, setViewMode] = useState("kanban");
  
const [searchTerm, setSearchTerm] = useState(
  () => new URLSearchParams(window.location.search).get("search") || ""
);

const [debouncedSearch, setDebouncedSearch] = useState(
  () => new URLSearchParams(window.location.search)
    .get("search")
    ?.trim()
    .toLowerCase() || ""
);

const [statusFilter, setStatusFilter] = useState(
  () => new URLSearchParams(window.location.search).get("status") || "All"
);

const [priorityFilter, setPriorityFilter] = useState(
  () => new URLSearchParams(window.location.search).get("priority") || "All"
);

const [assigneeFilter, setAssigneeFilter] = useState(
  () => new URLSearchParams(window.location.search).get("assignee") || "All"
);


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


   // Apply the search term after the user pauses typing for 300 ms.
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchTerm]);


  // Update the URL whenever the search or filters change.
useEffect(() => {
  const params = new URLSearchParams();

  if (searchTerm) params.set("search", searchTerm);
  if (statusFilter !== "All") params.set("status", statusFilter);
  if (priorityFilter !== "All") params.set("priority", priorityFilter);
  if (assigneeFilter !== "All") params.set("assignee", assigneeFilter);

  const query = params.toString();

  window.history.replaceState(
    null,
    "",
    query ? `?${query}` : window.location.pathname
  );
}, [searchTerm, statusFilter, priorityFilter, assigneeFilter]);

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
    setToast("Task created successfully.");
  } catch (err) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== newTask.id)
    );
    console.error("Unable to create task:", err);
    setToast("Failed to create task. Changes were rolled back.");
  }

  setShowForm(false);
}


 // Update the task status immediately when it is dropped into another column.
async function handleDragEnd({ active, over }) {
  if (!over) return;

  const task = tasks.find((item) => String(item.id) === String(active.id));
  const newStatus = String(over.id);

  if (!task || task.status === newStatus) return;

  const updatedTask = { ...task, status: newStatus };

  setTasks((currentTasks) =>
    currentTasks.map((item) =>
      String(item.id) === String(active.id) ? updatedTask : item
    )
  );

  try {
    await updateTask(task.id, updatedTask);
  } catch (err) {
    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        String(item.id) === String(active.id) ? task : item
      )
    );
    setToast("Unable to update task status. Changes were rolled back.");
  }
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
    setToast("Task updated successfully.");
  } catch (err) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === oldTask.id ? oldTask : task
      )
    );
    console.error("Unable to update task:", err);
    setToast("Failed to update task. Changes were rolled back.");
  } finally {
    setShowForm(false);
    setEditingTask(null);
  }
}



// Delete the task and show temporary notifications for five seconds.
async function handleDeleteTask(task) {
  setTasks((currentTasks) =>
    currentTasks.filter((item) => item.id !== task.id)
  );
  setDeletedTask(task);
  setToast("");

  try {
    await deleteTask(task.id);
  } catch (err) {
    setTasks((currentTasks) => [task, ...currentTasks]);
    setDeletedTask(null);
    setToast("Failed to delete task. The task was restored.");
    console.error("Unable to delete task:", err);
    return;
  }

  window.setTimeout(() => {
    setDeletedTask((current) =>
      current?.id === task.id ? null : current
    );
    setToast("");
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



 
  // Apply search, status, priority, and assignee filters together.
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(debouncedSearch);

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;

    const matchesAssignee =
      assigneeFilter === "All" ||
      (assigneeFilter === "Unassigned"
        ? !task.userId
        : task.assignee === assigneeFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee
    );
  });

 



  return (
    <div className="app">
      <AppHeader />

      <main className="app-main">

{/* Capture the text the user wants to search for. */}
<div className="task-search">
  <label htmlFor="task-search-input">Search tasks</label>
  <input
    id="task-search-input"
    type="search"
    placeholder="Search by task title..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
  />
</div>



{/* Let users filter tasks by their current status. */}
<div className="task-filter">
  <label htmlFor="status-filter">Filter by status</label>
  <select
    id="status-filter"
    value={statusFilter}
    onChange={(event) => setStatusFilter(event.target.value)}
  >
    <option value="All">All statuses</option>
    <option value="To Do">To Do</option>
    <option value="In Progress">In Progress</option>
    <option value="Done">Done</option>
  </select>
</div>


{/* Let users filter tasks by priority. */}
<div className="task-filter">
  <label htmlFor="priority-filter">Filter by priority</label>
  <select
    id="priority-filter"
    value={priorityFilter}
    onChange={(event) => setPriorityFilter(event.target.value)}
  >
    <option value="All">All priorities</option>
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  </select>
</div>


{/* Let users filter tasks by their assigned person. */}
<div className="task-filter">
  <label htmlFor="assignee-filter">Filter by assignee</label>
  <select
    id="assignee-filter"
    value={assigneeFilter}
    onChange={(event) => setAssigneeFilter(event.target.value)}
  >
    <option value="All">All assignees</option>
    <option value="Unassigned">Unassigned</option>
    {users.map((user) => (
      <option key={user.id} value={`${user.firstName} ${user.lastName}`}>
        {user.firstName} {user.lastName}
      </option>
    ))}
  </select>
</div>








        <button onClick={() => setShowForm(true)}>
  Add Task
</button>

<div className="view-toggle">
  <button
    type="button"
    onClick={() => setViewMode("kanban")}
    aria-pressed={viewMode === "kanban"}
  >
    Kanban View
  </button>

  <button
    type="button"
    onClick={() => setViewMode("table")}
    aria-pressed={viewMode === "table"}
  >
    Table View
  </button>
</div>

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

      {/* Display a notification when a task operation finishes. */}
{toast && (
  <div className="toast" role="status">
    {toast}
    <button type="button" onClick={() => setToast("")}>
      Close
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
            

{/* Connect drag events to the Kanban board. */}
{viewMode === "kanban" ? (
  <DndContext onDragEnd={handleDragEnd}>
    <TaskBoard
       tasks={filteredTasks}
      onEdit={handleEditClick}
      onDelete={handleDeleteTask}
    />
  </DndContext>
) : (
  <TaskTable
     tasks={filteredTasks}
    onEdit={handleEditClick}
    onDelete={handleDeleteTask}
  />
)}



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
