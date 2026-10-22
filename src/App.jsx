
import AppHeader from "./components/AppHeader";
import TaskBoard from "./components/TaskBoard";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <AppHeader />

      <main className="app-main">
        <TaskBoard />
      </main>
    </div>
  );
}
