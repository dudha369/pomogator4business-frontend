/**
 * Карта смещения для feDisplacementMap — «профиль» линзы-пилюли.
 *
 * В центре пиксели не смещаются (серый 128/128), у кромки смещаются внутрь
 * (содержимое у края «растягивается» — эффект выпуклой линзы). Чем ближе к
 * границе пилюли, тем сильнее смещение, к центру спадает до нуля.
 *
 * Рисуем через canvas, а не SVG data-URI: feImage с SVG-картинкой не вычисляет
 * CSS-свойства (blur, mix-blend-mode), а растр — работает везде одинаково.
 */
export function buildLensMap(w: number, h: number, bezel: number): string | null {
  const dpr = 2;
  const cw = Math.max(1, Math.round(w * dpr));
  const ch = Math.max(1, Math.round(h * dpr));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const img = ctx.createImageData(cw, ch);
  const r = ch / 2; // радиус скругления пилюли (в px карты)
  const b = bezel * dpr;
  const x0 = r; // ось пилюли: отрезок (x0, r) — (x1, r)
  const x1 = cw - r;

  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      // ближайшая точка на оси пилюли
      const cx = Math.min(x1, Math.max(x0, x + 0.5));
      const dx = cx - (x + 0.5);
      const dy = r - (y + 0.5);
      const dist = Math.hypot(dx, dy);
      const depth = r - dist; // расстояние внутрь от кромки
      let vx = 0;
      let vy = 0;
      if (dist > 1e-6 && depth < b) {
        const t = Math.max(0, depth) / b;
        const mag = (1 - t) * (1 - t);
        vx = (dx / dist) * mag; // направление «к оси» = внутрь
        vy = (dy / dist) * mag;
      }
      const i = (y * cw + x) * 4;
      img.data[i] = Math.round(128 + vx * 127);
      img.data[i + 1] = Math.round(128 + vy * 127);
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}