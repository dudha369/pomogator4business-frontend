import { useMemo, useRef, useState, type PointerEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Settings2,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { useLocale } from "../../i18n/LocaleContext";

import "./navbar.css";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

/**
 * Настоящая рефракция (искажение фона линзой) через backdrop-filter:url(#svg)
 * работает только в Chromium: Android, Telegram Desktop (Win/Linux), Chrome.
 * iOS / macOS (WebKit) получают blur + блики, без искажения.
 */
const SUPPORTS_REFRACTION =
  typeof navigator !== "undefined" &&
  /Chrome\/|Chromium\//.test(navigator.userAgent) &&
  !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

/** Карта смещения: по краям линзы пиксели фона сдвигаются, в центре — нет. */
function buildDisplacementMap(w: number, h: number): string {
  const r = h / 2;
  const b = h * 0.24;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs>` +
    `<linearGradient id="x" x1="100%" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient>` +
    `<linearGradient id="y" x1="0" y1="0" x2="0" y2="100%"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#00f"/></linearGradient>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="#000"/>` +
    `<rect width="${w}" height="${h}" rx="${r}" fill="url(#x)"/>` +
    `<rect width="${w}" height="${h}" rx="${r}" fill="url(#y)" style="mix-blend-mode:difference"/>` +
    `<rect x="${b}" y="${b}" width="${w - 2 * b}" height="${h - 2 * b}" rx="${Math.max(r - b, 1)}" fill="hsl(0 0% 50% / .93)" style="filter:blur(${b / 2}px)"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const DRAG_THRESHOLD = 6;

export function NavBar() {
  const { t } = useLocale();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const items: NavItem[] = [
    { to: "/", label: t("nav.commands"), icon: ClipboardList, end: true },
    { to: "/settings", label: t("nav.settings"), icon: Settings2 },
    { to: "/account", label: t("nav.account"), icon: UserRound },
    // Новая вкладка: { to: "/something", label: t("nav.something"), icon: SomeLucideIcon },
  ];
  const n = items.length;

  const activeIndex = Math.max(
    0,
    items.findIndex((i) =>
      i.end ? pathname === i.to : pathname.startsWith(i.to),
    ),
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; startX: number; moved: boolean } | null>(
    null,
  );
  const [pressed, setPressed] = useState(false);
  const [dragPos, setDragPos] = useState<number | null>(null);

  const mapUrl = useMemo(() => buildDisplacementMap(128, 64), []);
  const pos = dragPos ?? activeIndex;
  const visualIndex = Math.round(pos);

  const posFromX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * n - 0.5;
    return Math.min(n - 1, Math.max(0, p));
  };

  const onPointerDown = (e: PointerEvent) => {
    gesture.current = { id: e.pointerId, startX: e.clientX, moved: false };
    setPressed(true);
  };

  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    if (!g.moved) {
      if (Math.abs(e.clientX - g.startX) < DRAG_THRESHOLD) return;
      g.moved = true;
      trackRef.current?.setPointerCapture(g.id);
    }
    setDragPos(posFromX(e.clientX));
  };

  const finish = (e: PointerEvent, commit: boolean) => {
    const g = gesture.current;
    gesture.current = null;
    setPressed(false);
    if (g?.moved) {
      const idx = Math.round(posFromX(e.clientX));
      setDragPos(null);
      if (commit && items[idx] && idx !== activeIndex) {
        navigator.vibrate?.(8);
        navigate(items[idx].to);
      }
    }
  };

  return (
    <nav className="navbar" aria-label="Main">
      {SUPPORTS_REFRACTION && (
        <svg width="0" height="0" className="navbar__defs" aria-hidden="true">
          <filter
            id="navbar-refraction"
            colorInterpolationFilters="sRGB"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <feImage
              href={mapUrl}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="34"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </svg>
      )}

      <div className="navbar__bar">
        {/* Стекло — отдельный слой-сосед, НЕ предок линзы (иначе линза ничего не видит под собой) */}
        <div className="navbar__glass" />

        <div
          ref={trackRef}
          className="navbar__track"
          style={{ "--n": n, "--pos": pos } as React.CSSProperties}
          data-pressed={pressed || undefined}
          data-dragging={dragPos !== null || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => finish(e, true)}
          onPointerCancel={(e) => finish(e, false)}
        >
          <span
            className="navbar__lens"
            style={
              SUPPORTS_REFRACTION
                ? {
                  backdropFilter:
                    "url(#navbar-refraction) blur(1.5px) saturate(1.7) brightness(1.1)",
                }
                : undefined
            }
          />

          {items.map((item, i) => {
            const Icon = item.icon;
            const active = i === visualIndex;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                draggable={false}
                className="navbar__item"
                data-active={active || undefined}
              >
                <Icon size={24} strokeWidth={active ? 2.4 : 2} />
                <span className="navbar__label">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}