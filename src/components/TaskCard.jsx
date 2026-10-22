
export default function TaskCard({ task }) {
  return (
    <article className="task-card">
      <h3 className="task-card__title">{task.title}</h3>

      <p className="task-card__description">
        {task.description || "No description provided"}
      </p>

      <div className="task-card__footer">
        <span className="task-card__priority">
          {task.priority}
        </span>

        <span className="task-card__assignee">
          {task.assignee || "Unassigned"}
        </span>
      </div>
    </article>
  );
}
