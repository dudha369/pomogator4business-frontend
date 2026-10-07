import { BrowserRouter, Route, Routes } from "react-router-dom";

import { NavBar } from "@/shared/ui/NavBar/NavBar";
import { TelegramController } from "@/shared/telegram/TelegramController";
import { LocaleProvider } from "@/i18n";
import { ColorSchemeProvider } from "./providers/ColorSchemeProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AccountPage } from "@/features/account/AccountPage";
import { ArchivePage } from "@/features/archive/ArchivePage";
import { CommandsPage } from "@/features/commands/CommandsPage";
import { HomePage } from "@/features/home/HomePage";
import { SettingsPage } from "@/features/settings/SettingsPage";

export function App() {
  return (
    <ThemeProvider>
      <ColorSchemeProvider>
        <LocaleProvider>
          <BrowserRouter>
            <TelegramController />
            <div className="app-shell">
              <div className="app-shell__content">
                <Routes>
                  <Route element={<HomePage />} path="/" />
                  <Route element={<CommandsPage />} path="/commands" />
                  <Route element={<ArchivePage />} path="/archive" />
                  <Route element={<SettingsPage />} path="/settings" />
                  <Route element={<AccountPage />} path="/account" />
                </Routes>
              </div>
              <NavBar />
            </div>
          </BrowserRouter>
        </LocaleProvider>
      </ColorSchemeProvider>
    </ThemeProvider>
  );
}
