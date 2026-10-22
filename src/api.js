
import { API_CONFIG, PAGINATION_CONFIG } from "./utils/commonutils";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${endpoint}`,
    options
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchTasks(
  limit = PAGINATION_CONFIG.PAGE_SIZE,
  skip = PAGINATION_CONFIG.INITIAL_SKIP
) {
  return request(
    `${API_CONFIG.TODOS_ENDPOINT}?limit=${limit}&skip=${skip}`
  );
}

export async function fetchUsers() {
  return request(
    `${API_CONFIG.USERS_ENDPOINT}?limit=0&select=firstName,lastName,image`
  );
}


export function mapTasksToUsers(todos, users) {
  const usersById = new Map(
    users.map((user) => [user.id, user])
  );

  return todos.map((todo) => {
    const user = usersById.get(todo.userId);

    return {
      id: todo.id,
      title: todo.todo,
      description: "",
      status: todo.completed ? "Done" : "To Do",
      priority: "Medium",
      dueDate: "",
      userId: todo.userId,
      assignee: user
        ? `${user.firstName} ${user.lastName}`
        : "Unassigned",
      avatar: user?.image || "",
      completed: todo.completed,
    };
  });
}



export async function createTask(task) {
  return request("/todos/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      todo: task.title,
      completed: task.status === "Done",
      userId: task.userId,
    }),
  });
}

export async function updateTask(id, task) {
  return request(`/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      todo: task.title,
      completed: task.status === "Done",
      userId: task.userId,
    }),
  });
}

export async function deleteTask(id) {
  return request(`/todos/${id}`, {
    method: "DELETE",
  });
}
