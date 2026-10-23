
import { API_CONFIG, PAGINATION_CONFIG } from "./utils/commonutils";

async function request(endpoint, options = {}, chaosMode = false) {
  // Simulate network latency when Chaos Mode is enabled.
  if (chaosMode) {
    await new Promise((resolve) =>
      setTimeout(resolve, API_CONFIG.CHAOS_DELAY_MS)
    );
  }


    // Simulate random failures for write requests in Chaos Mode.
  if (
    chaosMode &&
    ["POST", "PUT", "DELETE"].includes(options.method) &&
    Math.random() < API_CONFIG.CHAOS_FAILURE_RATE
  ) {
    throw new Error("Chaos Mode: Simulated API failure.");
  }

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


  // Pass the Chaos Mode setting into the update request.
  export async function updateTask(id, task, chaosMode = false) {
    return request(`/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo: task.title,
        completed: task.status === "Done",
        userId: task.userId,
      }),
    }, chaosMode);
  }



  // Pass the Chaos Mode setting into the delete request.
  export async function deleteTask(id, chaosMode = false) {
    return request(`/todos/${id}`, {
      method: "DELETE",
    }, chaosMode);
}
