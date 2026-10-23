
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import App from "./App";
import * as api from "./api";

vi.mock("./api", () => ({
  fetchTasks: vi.fn(),
  fetchUsers: vi.fn(),
  mapTasksToUsers: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock("./components/TaskBoard", () => ({
  default: ({ tasks, onEdit }) => (
    <div>
      {tasks.map((task) => (
        <button key={task.id} onClick={() => onEdit(task)}>
          {task.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("./components/TaskTable", () => ({
  default: () => <div>Task table</div>,
}));

const originalTask = {
  id: 1,
  title: "Original task title",
  description: "",
  status: "To Do",
  priority: "Medium",
  dueDate: "",
  userId: null,
  assignee: "Unassigned",
  avatar: "",
  completed: false,
};

const highPriorityTask = {
  ...originalTask,
  id: 2,
  title: "High priority task",
  priority: "High",
};

beforeEach(() => {
  window.history.replaceState(null, "", "/");

  api.fetchTasks.mockResolvedValue({
    todos: [originalTask, highPriorityTask],
    total: 2,
  });
  api.fetchUsers.mockResolvedValue({ users: [] });
  api.mapTasksToUsers.mockReturnValue([originalTask, highPriorityTask]);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Optimistic update rollback", () => {
  it("restores the original title when the update API fails", async () => {
    api.updateTask.mockRejectedValue(new Error("Network error"));

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Original task title" })
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated task title" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "Original task title" })
      ).toBeTruthy();
    });

    expect(
      screen.queryByRole("button", { name: "Updated task title" })
    ).toBeNull();
  });
});

describe("Priority filter", () => {
  it("shows only tasks matching the selected priority", async () => {
    render(<App />);

    await screen.findByRole("button", { name: "Original task title" });

    fireEvent.change(screen.getByLabelText("Filter by priority"), {
      target: { value: "High" },
    });

    expect(
      screen.getByRole("button", { name: "High priority task" })
    ).toBeTruthy();

    expect(
      screen.queryByRole("button", { name: "Original task title" })
    ).toBeNull();
  });
});
