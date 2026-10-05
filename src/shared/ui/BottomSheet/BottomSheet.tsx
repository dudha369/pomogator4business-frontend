import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import "./bottomsheet.css";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Дистанция в px, на которую нужно утянуть лист вниз, чтобы он закрылся. */
  dismissThreshold?: number;
}

const DISMISS_THRESHOLD_DEFAULT = 120;
/** px/ms — резкий свайп закрывает лист даже если не дотянули до dismissThreshold. */
const VELOCITY_DISMISS = 0.6;
const CLOSE_ANIMATION_MS = 220;

export function BottomSheet({
                              open,
                              onClose,
                              children,
                              dismissThreshold = DISMISS_THRESHOLD_DEFAULT,
                            }: Props) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; lastT: number; dragging: boolean } | null>(null);

  // Монтируем/размонтируем с задержкой, чтобы успела доиграть анимация закрытия,
  // а не пропадала мгновенно одновременно с закрытием.
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const timer = setTimeout(() => setMounted(false), CLOSE_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, onClose]);

  const resetDrag = useCallback(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheet.style.transition = "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)";
    sheet.style.transform = "translateY(0)";
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { startY: e.clientY, lastT: performance.now(), dragging: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d?.dragging) return;
    const dy = Math.max(0, e.clientY - d.startY);
    d.lastT = performance.now();
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transition = "none";
      sheet.style.transform = `translateY(${dy}px)`;
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dy = Math.max(0, e.clientY - d.startY);
    const dt = Math.max(1, performance.now() - d.lastT);
    const velocity = dy / dt;
    if (dy > dismissThreshold || velocity > VELOCITY_DISMISS) {
      onClose();
    } else {
      resetDrag();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`sheet-backdrop ${closing ? "sheet-backdrop--closing" : "sheet-backdrop--open"}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className={`sheet ${closing ? "sheet--closing" : "sheet--open"}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="sheet__handle-zone"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="sheet__handle" />
        </div>
        <div className="sheet__content">{children}</div>
      </div>
    </div>,
    document.body
  );
}