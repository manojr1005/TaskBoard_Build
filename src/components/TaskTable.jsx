
export default function TaskTable({ tasks = [], onEdit, onDelete }) {
  return (
    <div className="task-table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Render one table row for each task. */}
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.status}</td>
              <td>{task.priority}</td>
              <td>{task.assignee || "Unassigned"}</td>
              <td>
                <button type="button" onClick={() => onEdit(task)}>
                  Edit
                </button>
                <button type="button" onClick={() => onDelete(task)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan="5">No tasks found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
