import {
  useCallback,
  useEffect,
  useState,
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

import { useLocale } from "../../i18n/LocaleContext";
import { haptic } from "../../telegram/haptics";
import { buildLensMap } from "./lensMap";

import "./navbar.css";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

/*
 * ───────────────────────────── Как это устроено ─────────────────────────────
 *
 * iOS 26 «жидкое стекло» в WKWebView (Telegram на iPhone) НЕ умеет
 * backdrop-filter: url(#svg) — Safari молча рисует пустоту. Поэтому реальная
 * рефракция фона тут невозможна, и все «библиотеки liquid glass» для веба
 * на iOS откатываются к простому блюру.
 *
 * Зато главное, что делает линза в iOS 26 таб-баре — она УВЕЛИЧИВАЕТ собственное
 * содержимое (иконку и подпись) и красит его акцентом. Это воспроизводится
 * без SVG-фильтров, и работает одинаково в Safari/Chromium:
 *
 *   track
 *   ├─ capsule        — плоская «пилюля» выбранной вкладки (в покое)
 *   ├─ row (base)     — настоящие NavLink'и
 *   └─ lens           — ПРОЗРАЧНАЯ линза: ни заливки, ни бликов, только кромка
 *        ├─ clip      — SVG-фильтр искажения (смещение + дисперсия RGB)
 *        │   └─ zoom  — КОПИЯ row, увеличенная в MAGNIFY раз вокруг центра линзы
 *        │              и сдвинутая так, чтобы совпадать с оригиналом
 *        └─ ::after   — кромка-«полумесяцы» сверху/снизу с радужной каймой
 *
 * Движение — пружины (rAF), а не CSS-transition: так у линзы есть настоящая
 * скорость, по которой она растягивается «как капля» при быстром движении,
 * и инерция/перелёт при отпускании. Всё пишется прямо в style.transform
 * (без ререндеров React на каждый кадр).
 */

const BULGE_X = 8; // насколько линза шире вкладки с каждой стороны, px
const BULGE_Y = 8; // насколько линза выше/ниже трека с каждой стороны, px (= --nav-bulge-y)
const CAPSULE_INSET_X = 2; // отступ плоской пилюли от границ вкладки, px
const MAGNIFY = 1.12; // увеличение содержимого внутри линзы
const DRAG_THRESHOLD = 6; // px, после которых касание считается протяжкой

/**
 * Искажение содержимого линзы (SVG-фильтр на копии вкладок).
 * Если на каком-то устройстве фильтр ведёт себя странно — поставь false:
 * линза останется прозрачной, с кромкой и увеличением, но без искажения.
 */
const LENS_WARP = true;
const WARP_BEZEL = 15; // ширина зоны искажения у кромки, px
const WARP_SCALE = [22, 20, 18] as const; // сила смещения для R/G/B (разница = дисперсия)

// Пружины: k — жёсткость, c — демпфирование
const SPRING_X = { k: 280, c: 25 };
const SPRING_L = { k: 300, c: 21 }; // ζ≈0.6: линза при нажатии «выпрыгивает» с небольшим перелётом
const SPRING_L_RELEASE = { k: 170, c: 24 }; // мягче: стекло дольше остаётся видимым, оседая в пилюлю
const SPRING_Q = { k: 240, c: 15 }; // «сплющивание» при отпускании (ζ≈0.5)
const RELEASE_SQUASH = 5; // импульс сплющивания: линза на миг шире и ниже, потом оседает в пилюлю
const STRETCH_PER_TAB_PER_SEC = 0.015; // растяжение линзы от скорости
const STRETCH_MAX = 0.14;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

type Phys = {
  x: number; // позиция линзы в «вкладках» (0..n-1, дробная)
  vx: number;
  tx: number; // целевая позиция
  l: number; // «надутость» линзы 0..1 (0 = плоская пилюля, 1 = стекло)
  vl: number;
  q: number; // «сплющивание» (импульс при отпускании)
  vq: number;
  holding: boolean; // палец на панели
  travelling: boolean; // линза в пути к вкладке (после отпускания)
  raf: number | null;
  last: number;
  trackW: number;
  trackH: number;
  tabW: number;
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

  const trackRef = useRef<HTMLDivElement>(null);
  const capsuleRef = useRef<HTMLSpanElement>(null);
  const lensRef = useRef<HTMLSpanElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const baseItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const filterRef = useRef<SVGFilterElement>(null);
  const mapImgRef = useRef<SVGFEImageElement>(null);
  const [warp, setWarp] = useState(false);

  const phys = useRef<Phys>({
    x: activeIndex,
    vx: 0,
    tx: activeIndex,
    l: 0,
    vl: 0,
    q: 0,
    vq: 0,
    holding: false,
    travelling: false,
    raf: null,
    last: 0,
    trackW: 0,
    trackH: 0,
    tabW: 0,
  });
  const gesture = useRef<{
    startX: number;
    moved: boolean;
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

  /** Записывает текущее физическое состояние в DOM. */
  const render = useCallback(() => {
    const p = phys.current;
    const lens = lensRef.current;
    const zoom = zoomRef.current;
    const capsule = capsuleRef.current;
    if (!lens || !zoom || !capsule || !p.tabW) return;

    const { tabW, trackH } = p;
    const L = p.l;
    const lensW = tabW + BULGE_X * 2;
    const lensH = trackH + BULGE_Y * 2;
    const lx = p.x * tabW + (tabW - lensW) / 2; // левый край линзы в координатах трека

    // Растяжение «каплей» по скорости: шире и ниже при быстром движении
    const stretch = Math.min(
      Math.abs(p.vx) * STRETCH_PER_TAB_PER_SEC,
      STRETCH_MAX,
    );
    // Линза «надувается» из размера плоской пилюли до полного размера
    const rx = (tabW - CAPSULE_INSET_X * 2) / lensW;
    const ry = trackH / lensH;
    // q — «сплющивание» при отпускании: на миг шире и ниже, потом оседает
    const sx = (rx + (1 - rx) * L) * (1 + stretch + 0.55 * p.q);
    const sy = (ry + (1 - ry) * L) * (1 - stretch * 0.5 - 0.8 * p.q);

    const lensOpacity = clamp(L * 1.8, 0, 1);
    lens.style.transform = `translate3d(${lx}px,0,0) scale(${sx},${sy})`;
    lens.style.opacity = String(lensOpacity);
    // скрытая линза не должна гонять SVG-фильтр каждый кадр
    lens.style.visibility = lensOpacity < 0.01 ? "hidden" : "visible";

    // Содержимое линзы: увеличение вокруг центра линзы, компенсируя её
    // собственное масштабирование — иконки растут, но не «плывут» от растяжения.
    const k = 1 + (MAGNIFY - 1) * clamp(L, 0, 1.2);
    zoom.style.transformOrigin = `${lx + lensW / 2}px ${trackH / 2}px`;
    zoom.style.transform = `translate3d(${-lx}px,0,0) scale(${k / sx},${k / sy})`;

    // Плоская пилюля уступает место линзе
    capsule.style.transform = `translate3d(${p.x * tabW}px,0,0)`;
    capsule.style.opacity = String(clamp(1 - L * 1.6, 0, 1));

    // Оригинальные иконки гаснут там, где их закрывает линза — иначе
    // увеличенная копия накладывалась бы на оригинал («двоение»).
    const lensCx = lx + lensW / 2;
    const halfItem = 34; // примерная половина ширины иконки+подписи
    const Lc = clamp(L * 1.6, 0, 1);
    baseItemRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = Math.abs((i + 0.5) * tabW - lensCx);
      const cover = clamp((lensW / 2 + halfItem - d) / (halfItem * 2), 0, 1);
      el.style.opacity = Lc > 0.001 ? String(1 - cover * Lc) : "";
    });
  }, []);

  const step = useCallback(
    (now: number) => {
      const p = phys.current;
      const dt = Math.min((now - p.last) / 1000, 1 / 30);
      p.last = now;

      if (reducedMotion.current) {
        p.x = p.tx;
        p.vx = 0;
        p.l = 0;
        p.vl = 0;
        p.q = 0;
        p.vq = 0;
        render();
        p.raf = null;
        return;
      }

      // Линза «в пути», пока она заметно не доехала (с гистерезисом, чтобы
      // небольшой перелёт пружины не включал её обратно)
      if (p.travelling && Math.abs(p.tx - p.x) < 0.04 && Math.abs(p.vx) < 0.3) {
        p.travelling = false;
      }
      const lt = p.holding || p.travelling ? 1 : 0;

      p.vx += (-SPRING_X.k * (p.x - p.tx) - SPRING_X.c * p.vx) * dt;
      p.x += p.vx * dt;
      const sl = lt === 1 ? SPRING_L : SPRING_L_RELEASE;
      p.vl += (-sl.k * (p.l - lt) - sl.c * p.vl) * dt;
      p.l += p.vl * dt;
      p.vq += (-SPRING_Q.k * p.q - SPRING_Q.c * p.vq) * dt;
      p.q += p.vq * dt;
      render();

      const settled =
        !p.holding &&
        !p.travelling &&
        Math.abs(p.tx - p.x) < 0.0005 &&
        Math.abs(p.vx) < 0.001 &&
        Math.abs(p.l - lt) < 0.002 &&
        Math.abs(p.vl) < 0.01 &&
        Math.abs(p.q) < 0.001 &&
        Math.abs(p.vq) < 0.01;
      if (settled) {
        p.x = p.tx;
        p.vx = 0;
        p.l = lt;
        p.vl = 0;
        p.q = 0;
        p.vq = 0;
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
      if (Math.abs(tx - p.x) > 0.01) p.travelling = true;
      kick();
    },
    [kick],
  );

  // Измерения трека: размеры линзы/клона задаём в px один раз (и при ресайзе)
  useLayoutEffect(() => {
    const track = trackRef.current;
    const lens = lensRef.current;
    const zoom = zoomRef.current;
    if (!track || !lens || !zoom) return;

    const measure = () => {
      const p = phys.current;
      p.trackW = track.clientWidth;
      p.trackH = track.clientHeight;
      p.tabW = p.trackW / n;
      lens.style.width = `${p.tabW + BULGE_X * 2}px`;
      lens.style.height = `${p.trackH + BULGE_Y * 2}px`;
      zoom.style.width = `${p.trackW}px`;
      zoom.style.height = `${p.trackH}px`;
      zoom.style.top = `${BULGE_Y}px`;

      // Фильтр искажения: область и карта смещения под реальный размер линзы
      const lw = p.tabW + BULGE_X * 2;
      const lh = p.trackH + BULGE_Y * 2;
      const filter = filterRef.current;
      const img = mapImgRef.current;
      if (LENS_WARP && filter && img && lw > 0 && lh > 0) {
        const url = buildLensMap(lw, lh, WARP_BEZEL);
        if (url) {
          const set = (el: Element, k: string, v: string) =>
            el.setAttribute(k, v);
          set(filter, "width", String(lw));
          set(filter, "height", String(lh));
          set(img, "width", String(lw));
          set(img, "height", String(lh));
          set(img, "href", url);
          img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);
          setWarp(true);
        }
      }
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [n, render]);

  // Маршрут сменился (жест, клавиатура или программно) — пружиним к нему
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
    gesture.current = {
      startX: e.clientX,
      moved: false,
      downIdx: idx,
      lastIdx: idx,
    };
    phys.current.holding = true;
    haptic.impact("light");
    // Линза «наплывает» от текущей вкладки к той, где коснулись
    setTarget(idx);
  };

  const onPointerMove = (e: PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    if (!g.moved && Math.abs(e.clientX - g.startX) >= DRAG_THRESHOLD) {
      g.moved = true;
    }
    if (!g.moved) return;
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
    if (p.l > 0.3) p.vq = RELEASE_SQUASH; // линза «оседает» с сочным сплющиванием
    if (!g || !commit) {
      setTarget(activeRef.current);
      return;
    }
    const idx = g.moved ? Math.round(posFromX(e.clientX)) : g.downIdx;
    setTarget(idx); // линза доезжает до вкладки и «сдувается» в пилюлю
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
          <Icon size={24} strokeWidth={1.7} />
          <span className="navbar__label">{item.label}</span>
        </>
      );
      if (zoom) {
        return (
          <span key={item.to} className="navbar__item">
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
          ref={(el) => {
            baseItemRefs.current[i] = el;
          }}
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
    <nav className="navbar" aria-label="Main" data-warp={warp || undefined}>
      {LENS_WARP && (
        <svg width="0" height="0" className="navbar__defs" aria-hidden="true">
          {/*
            Искажение содержимого линзы: три смещения (R/G/B) с чуть разной
            силой по одной карте. У центра они совпадают и цвета складываются
            обратно, у кромки расходятся — настоящая радужная кайма на самих
            иконках и тексте, а не нарисованная градиентом.
            Размеры/карту выставляет measure() в useLayoutEffect.
          */}
          <filter
            ref={filterRef}
            id="navbar-lens-warp"
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="160"
            height="76"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              ref={mapImgRef}
              x="0"
              y="0"
              width="160"
              height="76"
              preserveAspectRatio="none"
              result="map"
            />
            {(["R", "G", "B"] as const).map((ch, i) => (
              <feDisplacementMap
                key={ch}
                in="SourceGraphic"
                in2="map"
                scale={WARP_SCALE[i]}
                xChannelSelector="R"
                yChannelSelector="G"
                result={`d${ch}`}
              />
            ))}
            <feColorMatrix
              in="dR"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="cR"
            />
            <feColorMatrix
              in="dG"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="cG"
            />
            <feColorMatrix
              in="dB"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="cB"
            />
            <feBlend in="cR" in2="cG" mode="screen" result="rg" />
            <feBlend in="rg" in2="cB" mode="screen" />
          </filter>
        </svg>
      )}
      <div className="navbar__bar">
        {/* Стекло панели — отдельный слой-сосед, не предок линзы */}
        <div className="navbar__glass" />

        <div
          ref={trackRef}
          className="navbar__track"
          style={{ "--n": n } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => finish(e, true)}
          onPointerCancel={(e) => finish(e, false)}
        >
          {/* Плоская пилюля выбранной вкладки (в покое) */}
          <span ref={capsuleRef} className="navbar__capsule" />

          <div className="navbar__row">{renderItems(false)}</div>

          {/* Стеклянная линза с увеличенной копией вкладок внутри */}
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