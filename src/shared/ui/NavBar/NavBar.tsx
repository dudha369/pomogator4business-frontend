import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Settings2,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { useLocale } from "@/i18n/LocaleContext";
import { haptic } from "../../telegram/haptics";

import "./navbar.css";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

/*
 * ═══════════════════ РАЗМЕРЫ (pt = css px), замерены по фото ═══════════════════
 * Фото: iPhone 428pt @3x → px/3 = pt. Эталон для 3 вкладок — Telegram.
 *
 *                              Telegram    Find My     здесь
 *  панель: высота                 63          59          63   (TRACK_H + 2×3.5)
 *  панель: ширина (3 вкладки)    318          —         n×102 + 2×5.7
 *  ячейка / капсула в покое      102.7       102(4 tab)   102 × 56
 *  линза при удержании        121.7 × 75    123 × 71     (102+2×8)×1.026 × (56+2×8)×1.055
 *  панель при удержании         +6% h       +5% h        ×1.026 / ×1.055
 *  растяжение линзы при тапе     ×1.31       ×1.45       ×1.36 (пружины краёв)
 *  кольцо линзы: тап / удержание  ~4          ~4 / ~9      4 → 9.6
 *  увеличение содержимого        ×1.19       ×1.20        ×1.20 (при тапе ×1.15)
 *
 * ═════════════════════════════════ УСТРОЙСТВО ═════════════════════════════════
 * В WKWebView (Telegram на iPhone) нет ни backdrop-filter: url(#svg), ни
 * надёжных SVG-фильтров, поэтому настоящую рефракцию фона сделать нельзя.
 * Вместо неё повторяем то, что видно на нативе:
 *   • линза — стекло: прозрачная, чуть светлее панели, тонкий тёмный контур;
 *   • внутри — УВЕЛИЧЕННАЯ копия вкладок (DOM-клон, чёткий текст);
 *   • по кромке — «кольцо»: плоские тёмные полосы сверху/снизу со светлой
 *     линией по внутреннему краю, светлые дуги на торцах, радужные блики;
 *   • оригинальные вкладки под линзой ВЫРЕЗАЮТСЯ clip-path'ом (не гасим!),
 *     поэтому «призраков» нет;
 *   • вся панель при удержании масштабируется одним transform'ом — контуры
 *     капсулы, линзы и панели не расходятся.
 *
 * Движение — пружины в rAF. Края линзы (левый/правый) — две отдельные
 * пружины: передний жёсткий, задний мягкий → растяжение «каплей» без
 * scaleX-хаков. Тап — плоская растянутая линза; выпуклость (кольцо + рост
 * панели) включается только при реальном удержании или протяжке.
 */

const TRACK_H = 56; // высота капсулы = высота трека (синхронно с --nav-track-h)
const BULGE = 8; // насколько линза выше/шире капсулы с каждой стороны при удержании
const RING_TAP = 4; // толщина кольца в тапе
const RING_HOLD = 9.6; // толщина кольца при удержании
const MAGNIFY_TAP = 0.15; // доля увеличения содержимого при тапе
const MAGNIFY_HOLD = 0.2; // …и при удержании
const HOLD_DELAY = 130; // мс: дольше — удержание, не тап
const DRAG_THRESHOLD = 6; // px до начала протяжки
const INFLATE_X = 0.026; // рост панели при удержании
const INFLATE_Y = 0.055;

// Пружины: k — жёсткость, c — демпфирование
const EDGE_LEAD = { k: 560, c: 38 }; // передний край линзы
const EDGE_TRAIL = { k: 170, c: 21 }; // задний край (отстаёт → растяжение)
const SPRING_B = { k: 260, c: 23 }; // выпуклость (удержание)
const SPRING_G = { k: 520, c: 38 }; // капсула ↔ стеклянная линза
const SPRING_U = { k: 230, c: 22 }; // «надувание» панели

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const f2 = (v: number) => Math.round(v * 100) / 100;

type Phys = {
  a: number; // левый край линзы, px в координатах трека
  c: number; // правый край
  va: number;
  vc: number;
  tx: number; // целевая позиция в «вкладках» (дробная при протяжке)
  b: number; // выпуклость 0..1
  vb: number;
  g: number; // стекло 0..1
  vg: number;
  u: number; // надутость панели 0..1
  vu: number;
  holding: boolean;
  holdStart: number;
  moved: boolean;
  travelling: boolean;
  raf: number | null;
  last: number;
  trackW: number;
  cell: number;
};

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
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const capsuleRef = useRef<HTMLSpanElement>(null);
  const lensRef = useRef<HTMLSpanElement>(null);

  const phys = useRef<Phys>({
    a: activeIndex,
    c: activeIndex + 1,
    va: 0,
    vc: 0,
    tx: activeIndex,
    b: 0,
    vb: 0,
    g: 0,
    vg: 0,
    u: 0,
    vu: 0,
    holding: false,
    holdStart: 0,
    moved: false,
    travelling: false,
    raf: null,
    last: 0,
    trackW: 0,
    cell: 0,
  });
  const gesture = useRef<{
    startX: number;
    downIdx: number;
    lastIdx: number;
  } | null>(null);

  const reducedMotion = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const apply = () => (reducedMotion.current = mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /** Записывает физическое состояние в DOM (без ререндеров React). */
  const render = useCallback(() => {
    const p = phys.current;
    const lens = lensRef.current;
    const zoom = zoomRef.current;
    const row = rowRef.current;
    const capsule = capsuleRef.current;
    const bar = barRef.current;
    if (!lens || !zoom || !row || !capsule || !bar || !p.cell) return;

    const g = clamp(p.g, 0, 1);
    const b = clamp(p.b, 0, 1);
    const W = Math.max(1, p.c - p.a);
    const top = -BULGE * b;
    const H = TRACK_H + 2 * BULGE * b;
    const visible = g > 0.004 || b > 0.004;

    // панель целиком «надувается» одним transform'ом
    bar.style.transform =
      p.u > 0.001
        ? `scale(${f2(1 + INFLATE_X * p.u)},${f2(1 + INFLATE_Y * p.u)})`
        : "";

    // плоская капсула
    capsule.style.width = `${W}px`;
    capsule.style.transform = `translate3d(${p.a}px,0,0)`;
    capsule.style.opacity = String(clamp(1 - g * 2, 0, 1));

    if (!visible) {
      lens.style.visibility = "hidden";
      row.style.clipPath = "";
      (row.style as CSSStyleDeclaration & { webkitClipPath: string }).webkitClipPath = "";
      return;
    }

    // линза
    lens.style.visibility = "visible";
    lens.style.width = `${W}px`;
    lens.style.height = `${H}px`;
    lens.style.transform = `translate3d(${p.a}px,${top}px,0)`;
    lens.style.setProperty("--g", String(f2(g)));
    lens.style.setProperty(
      "--ring",
      `${f2(RING_TAP + (RING_HOLD - RING_TAP) * b)}px`,
    );

    // увеличенная копия вкладок: масштаб вокруг центра линзы, совмещена с оригиналом
    const k = 1 + MAGNIFY_TAP * g + (MAGNIFY_HOLD - MAGNIFY_TAP) * b;
    zoom.style.top = `${f2(BULGE * b)}px`;
    zoom.style.transformOrigin = `${f2(p.a + W / 2)}px ${TRACK_H / 2}px`;
    zoom.style.transform = `translate3d(${f2(-p.a)}px,0,0) scale(${f2(k * 1000) / 1000})`;

    // вырезаем место линзы из оригинальных вкладок (evenodd: большой прямоугольник минус пилюля)
    const r = H / 2;
    const x0 = f2(p.a + r);
    const x1 = f2(p.a + W - r);
    const y0 = f2(top);
    const y1 = f2(top + H);
    const path =
      `path(evenodd,"M-200 -200H2000V2000H-200Z` +
      `M${x0} ${y0}H${x1}A${f2(r)} ${f2(r)} 0 0 1 ${x1} ${y1}H${x0}` +
      `A${f2(r)} ${f2(r)} 0 0 1 ${x0} ${y0}Z")`;
    row.style.clipPath = path;
    (row.style as CSSStyleDeclaration & { webkitClipPath: string }).webkitClipPath = path;
  }, []);

  const step = useCallback(
    (now: number) => {
      const p = phys.current;
      const dt = Math.min((now - p.last) / 1000, 1 / 30);
      p.last = now;
      const cell = p.cell;
      const tc = (p.tx + 0.5) * cell;

      if (reducedMotion.current) {
        p.a = tc - cell / 2;
        p.c = tc + cell / 2;
        p.va = p.vc = 0;
        p.b = p.g = p.u = 0;
        p.vb = p.vg = p.vu = 0;
        p.travelling = false;
        render();
        p.raf = null;
        return;
      }

      const center = (p.a + p.c) / 2;
      if (
        p.travelling &&
        !p.holding &&
        Math.abs(tc - center) < 0.8 &&
        Math.abs(p.va) < 8 &&
        Math.abs(p.vc) < 8
      ) {
        p.travelling = false;
      }

      // выпуклость — только при реальном удержании/протяжке, не при тапе
      const wantB =
        p.holding && (p.moved || now - p.holdStart >= HOLD_DELAY) ? 1 : 0;
      // стекло — пока линза едет или выпуклая; нажатие на уже выбранную вкладку
      // без удержания ничего не рисует
      const wantG = p.travelling || p.b > 0.02 ? 1 : 0;

      p.vb += (-SPRING_B.k * (p.b - wantB) - SPRING_B.c * p.vb) * dt;
      p.b += p.vb * dt;
      p.vg += (-SPRING_G.k * (p.g - wantG) - SPRING_G.c * p.vg) * dt;
      p.g += p.vg * dt;
      p.vu += (-SPRING_U.k * (p.u - wantB) - SPRING_U.c * p.vu) * dt;
      p.u += p.vu * dt;

      // края линзы: передний — жёсткий, задний — мягкий
      const half = cell / 2 + BULGE * clamp(p.b, 0, 1);
      const tA = tc - half;
      const tC = tc + half;
      const dir = tc >= center ? 1 : -1;
      const sa = dir > 0 ? EDGE_TRAIL : EDGE_LEAD;
      const sc = dir > 0 ? EDGE_LEAD : EDGE_TRAIL;
      p.va += (-sa.k * (p.a - tA) - sa.c * p.va) * dt;
      p.a += p.va * dt;
      p.vc += (-sc.k * (p.c - tC) - sc.c * p.vc) * dt;
      p.c += p.vc * dt;
      render();

      const settled =
        !p.holding &&
        !p.travelling &&
        Math.abs(p.a - tA) < 0.05 &&
        Math.abs(p.c - tC) < 0.05 &&
        Math.abs(p.va) < 0.2 &&
        Math.abs(p.vc) < 0.2 &&
        Math.abs(p.b) < 0.003 &&
        Math.abs(p.vb) < 0.02 &&
        Math.abs(p.g) < 0.003 &&
        Math.abs(p.vg) < 0.02 &&
        Math.abs(p.u) < 0.003 &&
        Math.abs(p.vu) < 0.02;
      if (settled) {
        p.a = tA;
        p.c = tC;
        p.va = p.vc = 0;
        p.b = p.g = p.u = 0;
        p.vb = p.vg = p.vu = 0;
        render();
        p.raf = null;
        return;
      }
      p.raf = requestAnimationFrame(step);
    },
    [render],
  );

  const kick = useCallback(() => {
    const p = phys.current;
    if (p.raf !== null) return;
    p.last = performance.now();
    p.raf = requestAnimationFrame(step);
  }, [step]);

  const setTarget = useCallback(
    (tx: number) => {
      const p = phys.current;
      p.tx = tx;
      const center = (p.a + p.c) / 2;
      if (Math.abs((tx + 0.5) * p.cell - center) > 1) p.travelling = true;
      kick();
    },
    [kick],
  );

  // Измерения трека
  useLayoutEffect(() => {
    const track = trackRef.current;
    const zoom = zoomRef.current;
    if (!track || !zoom) return;
    const measure = () => {
      const p = phys.current;
      const oldCell = p.cell;
      p.trackW = track.clientWidth;
      p.cell = p.trackW / n;
      zoom.style.width = `${p.trackW}px`;
      zoom.style.height = `${TRACK_H}px`;
      if (oldCell > 0) {
        const k = p.cell / oldCell;
        p.a *= k;
        p.c *= k;
        p.va *= k;
        p.vc *= k;
      } else {
        const tc = (p.tx + 0.5) * p.cell;
        p.a = tc - p.cell / 2;
        p.c = tc + p.cell / 2;
      }
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [n, render]);

  // Маршрут сменился — пружиним к нему
  useEffect(() => {
    if (!phys.current.holding) setTarget(activeIndex);
  }, [activeIndex, setTarget]);

  useEffect(
    () => () => {
      const p = phys.current;
      if (p.raf !== null) cancelAnimationFrame(p.raf);
      p.raf = null;
    },
    [],
  );

  const posFromX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * n - 0.5;
    return clamp(p, 0, n - 1);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    trackRef.current?.setPointerCapture(e.pointerId);
    const idx = Math.round(posFromX(e.clientX));
    gesture.current = { startX: e.clientX, downIdx: idx, lastIdx: idx };
    const p = phys.current;
    p.holding = true;
    p.moved = false;
    p.holdStart = performance.now();
    haptic.impact("light");
    setTarget(idx);
  };

  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const p = phys.current;
    if (!p.moved && Math.abs(e.clientX - g.startX) >= DRAG_THRESHOLD) {
      p.moved = true;
    }
    if (!p.moved) return;
    const pos = posFromX(e.clientX);
    setTarget(pos); // линза следует за пальцем непрерывно
    const idx = Math.round(pos);
    if (idx !== g.lastIdx) {
      g.lastIdx = idx;
      haptic.selection();
    }
  };

  const finish = (e: PointerEvent, commit: boolean) => {
    const g = gesture.current;
    gesture.current = null;
    const p = phys.current;
    p.holding = false;
    if (!g || !commit) {
      setTarget(activeRef.current);
      return;
    }
    const idx = p.moved ? Math.round(posFromX(e.clientX)) : g.downIdx;
    setTarget(idx); // линза доезжает до вкладки и «сдувается» в капсулу
    if (items[idx] && idx !== activeRef.current) {
      haptic.selection();
      navigate(items[idx].to); // страница меняется только при отпускании
    }
  };

  const renderItems = (zoom: boolean) =>
    items.map((item, i) => {
      const Icon = item.icon;
      const inner = (
        <>
          <Icon size={30} strokeWidth={1.75} />
          <span className="navbar__label">{item.label}</span>
        </>
      );
      if (zoom) {
        return (
          <span
            key={item.to}
            className="navbar__item"
            data-active={i === activeIndex || undefined}
          >
            {inner}
          </span>
        );
      }
      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          draggable={false}
          className="navbar__item"
          data-active={i === activeIndex || undefined}
          onClick={(e) => {
            // мышь/тач обрабатываются жестом; клавиатура (detail 0) — обычной ссылкой
            if (e.detail !== 0) e.preventDefault();
          }}
        >
          {inner}
        </NavLink>
      );
    });

  return (
    <nav
      className="navbar"
      aria-label="Main"
      style={{ "--n": n } as CSSProperties}
    >
      <div ref={barRef} className="navbar__bar">
        {/* стекло панели — сосед, а не предок линзы */}
        <div className="navbar__glass" />

        <div
          ref={trackRef}
          className="navbar__track"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => finish(e, true)}
          onPointerCancel={(e) => finish(e, false)}
        >
          <span ref={capsuleRef} className="navbar__capsule" />

          <div ref={rowRef} className="navbar__row">
            {renderItems(false)}
          </div>

          {/* Линза: ::before — стекло и контур, .clip — увеличенная копия, ::after — кольцо */}
          <span ref={lensRef} className="navbar__lens" aria-hidden="true">
            <span className="navbar__lens-clip">
              <div ref={zoomRef} className="navbar__row navbar__row--zoom">
                {renderItems(true)}
              </div>
            </span>
          </span>
        </div>
      </div>
    </nav>
  );
}