import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import {
  ClipboardList,
  Settings2,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { useLocale } from "../../i18n/LocaleContext";

import "@sohumsuthar/liquid-glass/css/liquid-glass-core.css";
import "@sohumsuthar/liquid-glass/css/liquid-glass-nav.css";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export function NavBar() {
  const { t } = useLocale();

  const items: NavItem[] = [
    {
      to: "/",
      label: t("nav.commands"),
      icon: ClipboardList,
      end: true,
    },
    {
      to: "/settings",
      label: t("nav.settings"),
      icon: Settings2,
    },
    {
      to: "/account",
      label: t("nav.account"),
      icon: UserRound,
    },

    // Добавить новую кнопку теперь можно просто так:
    // {
    //   to: "/something",
    //   label: t("nav.something"),
    //   icon: SomeLucideIcon,
    // },
  ];

  return (
    <nav className="navbar">
      <div className="liquid-glass lg-navbar lg-regular">
        <div className="liquid-glass-effect" />
        <div className="liquid-glass-tint" />
        <div className="liquid-glass-shine" />

        <div className="liquid-glass-content navbar__content">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `navbar__item ${isActive ? "navbar__item--active" : ""}`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;

                return (
                  <motion.span
                    className="navbar__button"
                    whileTap={{ scale: 0.86 }}
                    transition={{
                      type: "spring",
                      stiffness: 700,
                      damping: 32,
                      mass: 0.55,
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active"
                        className="navbar__active-pill"
                        transition={{
                          type: "spring",
                          stiffness: 430,
                          damping: 32,
                          mass: 0.7,
                        }}
                      />
                    )}

                    <span className="navbar__icon">
                      <Icon
                        size={21}
                        strokeWidth={isActive ? 2.4 : 2}
                      />
                    </span>

                    <span className="navbar__label">
                      {item.label}
                    </span>
                  </motion.span>
                );
              }}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}