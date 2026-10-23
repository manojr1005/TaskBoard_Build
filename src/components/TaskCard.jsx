
import { useDraggable } from "@dnd-kit/core";

export default function TaskCard({ task, onEdit, onDelete }) {
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
