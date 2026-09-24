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
 * Настоящая рефракция (искажение фона стеклом) через backdrop-filter:url(#svg)
 * работает только в Chromium (Android, Telegram Desktop Win/Linux, Chrome).
 * WebKit (iOS/macOS) получает чистое стекло: blur + насыщенность, без искажения —
 * так делает и сам iOS 26 в WKWebView.
 */
const SUPPORTS_REFRACTION =
  typeof navigator !== "undefined" &&
  /Chrome\/|Chromium\//.test(navigator.userAgent) &&
  !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

/**
 * Карта смещения для feDisplacementMap: по краям линзы пиксели фона сдвигаются,
 * в центре — нет. Область фильтра (x/y/width/height ниже, в JSX) намеренно
 * шире самой карты — иначе Chromium обрезает размытый край карты, и это видно
 * как мигающий/"недогруженный" пиксельный шов во время движения (частый
 * артефакт на Android).
 */
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
  // pressIndex: вкладка под пальцем — стекло появляется здесь сразу при касании
  const [pressIndex, setPressIndex] = useState<number | null>(null);
  // dragPos: дробная позиция во время протяжки пальцем
  const [dragPos, setDragPos] = useState<number | null>(null);
  const pressed = pressIndex !== null;

  const mapUrl = useMemo(() => buildDisplacementMap(160, 96), []);
  const pos = dragPos ?? pressIndex ?? activeIndex;
  const visualIndex = Math.round(pos);

  const posFromX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * n - 0.5;
    return Math.min(n - 1, Math.max(0, p));
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    trackRef.current?.setPointerCapture(e.pointerId);
    gesture.current = { id: e.pointerId, startX: e.clientX, moved: false };
    setPressIndex(Math.round(posFromX(e.clientX)));
  };

  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    if (!g.moved && Math.abs(e.clientX - g.startX) >= DRAG_THRESHOLD) {
      g.moved = true;
    }
    if (g.moved) setDragPos(posFromX(e.clientX));
  };

  const finish = (e: PointerEvent, commit: boolean) => {
    const g = gesture.current;
    gesture.current = null;
    setPressIndex(null);
    setDragPos(null);
    if (!g || !commit) return;
    const idx = Math.round(posFromX(e.clientX));
    if (items[idx] && idx !== activeIndex) {
      navigator.vibrate?.(8);
      navigate(items[idx].to); // страница меняется только при отпускании
    }
  };

  return (
    <nav className="navbar" aria-label="Main">
      {SUPPORTS_REFRACTION && (
        <svg width="0" height="0" className="navbar__defs" aria-hidden="true">
          <filter
            id="navbar-refraction"
            colorInterpolationFilters="sRGB"
            x="-40%"
            y="-90%"
            width="180%"
            height="280%"
          >
            <feImage
              href={mapUrl}
              x="-40%"
              y="-90%"
              width="180%"
              height="280%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </svg>
      )}

      <div className="navbar__bar">
        {/* Стекло панели — отдельный слой-сосед, не предок линзы */}
        <div className="navbar__glass" />

        <div
          ref={trackRef}
          className="navbar__track"
          style={{ "--n": n, "--pos": pos } as React.CSSProperties}
          data-pressed={pressed || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => finish(e, true)}
          onPointerCancel={(e) => finish(e, false)}
        >
          {/*
            Цветное свечение вокруг стекла (как в оригинале). Едет и меняет
            размер через transform/width — без backdrop-filter, поэтому
            анимировать его дёшево и без побочных артефактов.
          */}
          <span className="navbar__glow" data-pressed={pressed || undefined} />

          {/*
            Сама "линза": статичный на весь трек слой с backdrop-filter.
            Никогда не двигается и не меняется в размере — иначе Chromium
            на Android/десктопе даёт швы и "плавающий" фон во время анимации.
            Видимый кусок под текущей вкладкой вырезается через clip-path —
            это дешёвая операция композитора, а не пересчёт фильтра.
          */}
          <span
            className="navbar__lens"
            data-pressed={pressed || undefined}
            style={
              SUPPORTS_REFRACTION
                ? {
                  backdropFilter:
                    "url(#navbar-refraction) saturate(1.7) brightness(1.12)",
                }
                : undefined
            }
          />

          {/* Тонкая яркая кромка стекла поверх линзы — тоже не использует backdrop-filter */}
          <span className="navbar__rim" data-pressed={pressed || undefined} />

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
                onClick={(e) => {
                  // мышь/тач обрабатываются жестом; клавиатура (detail 0) — обычной ссылкой
                  if (e.detail !== 0) e.preventDefault();
                }}
              >
                <Icon size={21} strokeWidth={1.7} />
                <span className="navbar__label">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}