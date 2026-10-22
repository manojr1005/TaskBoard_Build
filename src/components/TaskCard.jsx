
export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <article className="task-card">
      <h3 className="task-card__title">{task.title}</h3>

      <p className="task-card__description">
        {task.description || "No description provided"}
      </p>

      <div className="task-card__footer">
        <span className="task-card__priority">{task.priority}</span>
        <span className="task-card__assignee">
          {task.assignee || "Unassigned"}
        </span>
      </div>

      {/* Send the selected task to the appropriate parent handler. */}
      <div className="task-card__actions">
        <button type="button" onClick={() => onEdit(task)}>
          Edit
        </button>

        <button type="button" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </article>
  );
}
