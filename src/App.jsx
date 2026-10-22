
import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader";
import TaskBoard from "./components/TaskBoard";
import { fetchTasks, fetchUsers, mapTasksToUsers } from "./api";
import { PAGINATION_CONFIG } from "./utils/commonutils";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

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

  const totalPages = Math.ceil(
    totalTasks / PAGINATION_CONFIG.PAGE_SIZE
  );

  return (
    <div className="app">
      <AppHeader />

      <main className="app-main">
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
            <TaskBoard tasks={tasks} />

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
