
import { useEffect, useState } from "react";
import { TASK_STATUS_LIST } from "../utils/commonutils";

const INITIAL_FORM = {
  title: "",
  description: "",
  status: TASK_STATUS_LIST[0],
  priority: "Medium",
  dueDate: "",
  userId: "",
};

export default function TaskForm({ users, onSubmit, onCancel, initialTask }) {
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    ...(initialTask || {}),
    userId: initialTask?.userId?.toString() || "",
  }));
  const [error, setError] = useState("");

  useEffect(() => {
  setForm({
    ...INITIAL_FORM,
    ...(initialTask || {}),
    userId: initialTask?.userId?.toString() || "",
  });
  setError("");
}, [initialTask]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const title = form.title.trim();

    if (title.length < 5 || title.length > 120) {
      setError("Title must be between 5 and 120 characters.");
      return;
    }

    setError("");
    onSubmit({
      ...form,
      title,
      userId: form.userId ? Number(form.userId) : null,
    });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{initialTask ? "Edit task" : "Create task"}</h2>

      <label htmlFor="task-title">Title</label>
      <input
        id="task-title"
        name="title"
        value={form.title}
        onChange={handleChange}
        minLength={5}
        maxLength={120}
        required
      />

      <label htmlFor="task-description">Description</label>
      <textarea
        id="task-description"
        name="description"
        value={form.description}
        onChange={handleChange}
      />

      <label htmlFor="task-status">Status</label>
      <select
        id="task-status"
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        {TASK_STATUS_LIST.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <label htmlFor="task-priority">Priority</label>
      <select
        id="task-priority"
        name="priority"
        value={form.priority}
        onChange={handleChange}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <label htmlFor="task-due-date">Due date</label>
      <input
        id="task-due-date"
        type="date"
        name="dueDate"
        value={form.dueDate}
        onChange={handleChange}
      />

      <label htmlFor="task-assignee">Assignee</label>
      <select
        id="task-assignee"
        name="userId"
        value={form.userId}
        onChange={handleChange}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.firstName} {user.lastName}
          </option>
        ))}
      </select>

      {error && <p role="alert">{error}</p>}

      <div className="task-form__actions">
        <button type="submit">
          {initialTask ? "Save changes" : "Create task"}
        </button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
