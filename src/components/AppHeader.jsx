
import { APP_CONFIG } from "../utils/commonutils";

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <h1>{APP_CONFIG.title}</h1>
        <p>{APP_CONFIG.subtitle}</p>
      </div>
    </header>
  );
}
