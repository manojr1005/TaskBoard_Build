
import { TASK_STATUS_LIST } from "../utils/commonutils";
import TaskCard from "./TaskCard";

export default function TaskBoard({ tasks = [] }) {
  return (
    <section className="task-board" aria-label="Task board">
      {TASK_STATUS_LIST.map((status) => {
        const statusTasks = tasks.filter(
          (task) => task.status === status
        );

        return (
          <div className="task-column" key={status}>
            <h2 className="task-column__title">
              {status}
              <span className="task-column__count">
                {statusTasks.length}
              </span>
            </h2>

            <div className="task-column__content">
              {statusTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}

              {statusTasks.length === 0 && (
                <p className="task-column__empty">
                  No tasks in this column
                </p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
