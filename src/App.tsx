import { BrowserRouter, Route, Routes } from "react-router-dom";

import { NavBar } from "./components/NavBar";
import { LocaleProvider } from "./i18n/LocaleContext";
import { AccountPage } from "./pages/AccountPage";
import { CommandsPage } from "./pages/CommandsPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <div className="app-shell">
          <div className="app-shell__content">
            <Routes>
              <Route element={<CommandsPage />} path="/" />
              <Route element={<SettingsPage />} path="/settings" />
              <Route element={<AccountPage />} path="/account" />
            </Routes>
          </div>
          <NavBar />
        </div>
      </BrowserRouter>
    </LocaleProvider>
  );
}
