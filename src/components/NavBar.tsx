import { NavLink } from "react-router-dom";

import { useLocale } from "../i18n/LocaleContext";

export function NavBar() {
  const { t } = useLocale();

  const items = [
    { to: "/", label: t("nav.commands"), icon: "📋", end: true },
    { to: "/settings", label: t("nav.settings"), icon: "⚙️", end: false },
    { to: "/account", label: t("nav.account"), icon: "👤", end: false },
  ];

  return (
    <nav className="navbar">
      {items.map((item) => (
        <NavLink
          className={({ isActive }) => `navbar__item ${isActive ? "navbar__item--active" : ""}`}
          end={item.end}
          key={item.to}
          to={item.to}
        >
          <span className="navbar__icon">{item.icon}</span>
          <span className="navbar__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
