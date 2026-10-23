
import { useDraggable } from "@dnd-kit/core";
import { TASK_STATUS_LIST } from "../utils/commonutils";

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: String(task.id),
    });

  const cardStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={cardStyle}
      className={`task-card ${isDragging ? "task-card--dragging" : ""}`}
    >
      {/* Use the card title as the drag handle and keep action buttons separate. */}
      <h3
        className="task-card__title"
        {...listeners}
        {...attributes}
        style={{ cursor: "grab", touchAction: "none" }}
      >
        {task.title}
      </h3>

      <p className="task-card__description">
        {task.description || "No description provided"}
      </p>

      <div className="task-card__footer">
        <span className="task-card__priority">{task.priority}</span>
        <span className="task-card__assignee">
          {task.assignee || "Unassigned"}
        </span>
      </div>

      {/* Provide a keyboard-accessible alternative to dragging tasks. */}
<label>
  Change status
  <select
    aria-label={`Change status for ${task.title}`}
    value={task.status}
    onChange={(event) => onStatusChange(task, event.target.value)}
  >
    {TASK_STATUS_LIST.map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
</label>

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
