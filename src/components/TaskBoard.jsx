
import { useDroppable } from "@dnd-kit/core";
import { TASK_STATUS_LIST } from "../utils/commonutils";
import TaskCard from "./TaskCard";

function TaskColumn({ status, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`task-column ${isOver ? "task-column--over" : ""}`}
    >
      <h2 className="task-column__title">
        {status}
        <span className="task-column__count">{tasks.length}</span>
      </h2>

      <div className="task-column__content">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <p className="task-column__empty">No tasks in this column</p>
        )}
      </div>
    </div>
  );
}

export default function TaskBoard({ tasks = [], onEdit, onDelete }) {
  return (
    <section className="task-board" aria-label="Task board">
      {/* Register each status column as a separate drop target. */}
      {TASK_STATUS_LIST.map((status) => (
        <TaskColumn
          key={status}
          status={status}
          tasks={tasks.filter((task) => task.status === status)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
