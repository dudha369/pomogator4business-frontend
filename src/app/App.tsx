import { BrowserRouter, Route, Routes } from "react-router-dom";

import { NavBar } from "@/shared/ui/NavBar/NavBar";
import { LocaleProvider } from "@/i18n";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AccountPage } from "@/features/account/AccountPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { CommandsPage } from "@/features/commands/CommandsPage";

export function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
