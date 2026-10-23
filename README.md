
# Task Board

A Trello-style task management application built with React and JavaScript.

## Features

- Kanban board with To Do, In Progress, and Done columns
- Drag-and-drop tasks and a table view
- Create, edit, and delete tasks
- Task title validation (5–120 characters)
- Priority, due date, and user assignment
- Search with debounce and status, priority, and assignee filters
- Filter state synchronized with URL parameters
- Server-side pagination using limit and skip
- Loading, empty, and error states
- Optimistic updates with rollback and error notifications
- Undo delete for 5 seconds
- Chaos Mode for simulated latency and write failures
- Generate 5,000 client-side tasks for stress testing
- Keyboard alternative for changing task status
- Automated tests for form validation, rollback, and filtering

## Tech Stack

- React and JavaScript — UI and application logic
- Vite — development server and production builds
- CSS — styling and responsive layout
- DummyJSON — task and user API
- @dnd-kit/core — drag-and-drop interaction
- Vitest and React Testing Library — automated tests
- Local component state — UI state management

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

## Architecture

- `src/App.jsx` — application state, filtering, pagination, CRUD operations, and view switching
- `src/api.js` — API requests, user mapping, and Chaos Mode behavior
- `src/utils/commonutils.js` — shared configuration and task status values
- `src/components/` — reusable UI components, task form, Kanban board, and table
- `src/components/TaskForm.test.jsx` — form validation tests
- `src/App.test.jsx` — optimistic rollback and filter tests

## Data Consistency and Trade-offs

Task changes are shown optimistically so the interface responds immediately. If a write request fails, the application restores the previous state and displays an error notification.

DummyJSON simulates write operations; changes are not permanently saved on its server. Priority and due date are managed by the frontend. Therefore, refreshing the application may reset changes or frontend-only fields.

Chaos Mode adds artificial latency and randomly fails approximately 20% of write requests to help demonstrate error handling.

The stress-test feature generates 5,000 tasks in the browser and is intended for testing UI performance.
