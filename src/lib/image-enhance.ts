export type EnhanceOptions = {
  brightness: number; // 1 = unchanged
  contrast: number;
  saturation: number;
  removeBackground: boolean;
  tolerance: number; // 0-160
  size: number; // output square px
};

export const DEFAULT_ENHANCE: EnhanceOptions = {
  brightness: 1.08,
  contrast: 1.14,
  saturation: 1.18,
  removeBackground: true,
  tolerance: 62,
  size: 1000,
};

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    img.src = url;
  });
}

/** Corner-sampled background keying + tone correction, exported on a 1:1 white canvas. */
export function enhanceImage(img: HTMLImageElement, opts: EnhanceOptions) {
  const S = opts.size;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  const scale = Math.min(S * 0.86 / img.width, S * 0.86 / img.height);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const dx = Math.round((S - w) / 2);
  const dy = Math.round((S - h) / 2);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, S, S);
  ctx.filter = `brightness(${opts.brightness}) contrast(${opts.contrast}) saturate(${opts.saturation})`;
  ctx.drawImage(img, dx, dy, w, h);
  ctx.filter = "none";

  let bgPercent = 0;
  if (opts.removeBackground) {
    const data = ctx.getImageData(dx, dy, w, h);
    const p = data.data;
    const at = (x: number, y: number) => {
      const i = (y * w + x) * 4;
      return [p[i], p[i + 1], p[i + 2]] as [number, number, number];
    };
    const corners = [at(1, 1), at(w - 2, 1), at(1, h - 2), at(w - 2, h - 2)];
    const key: [number, number, number] = [
      corners.reduce((a, c) => a + c[0], 0) / 4,
      corners.reduce((a, c) => a + c[1], 0) / 4,
      corners.reduce((a, c) => a + c[2], 0) / 4,
    ];
    const tol = opts.tolerance;
    let cleared = 0;
    for (let i = 0; i < p.length; i += 4) {
      const d = Math.abs(p[i] - key[0]) + Math.abs(p[i + 1] - key[1]) + Math.abs(p[i + 2] - key[2]);
      if (d < tol * 3) {
        const t = Math.min(1, 1 - d / (tol * 3) + 0.35);
        p[i] = p[i] + (255 - p[i]) * t;
        p[i + 1] = p[i + 1] + (255 - p[i + 1]) * t;
        p[i + 2] = p[i + 2] + (255 - p[i + 2]) * t;
        cleared++;
      }
    }
    bgPercent = Math.round((cleared / (w * h)) * 100);
    ctx.putImageData(data, dx, dy);
  }

  return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), bgPercent };
}

/** Rough sharpness / exposure scoring used for the quality read-out. */
export function scoreImage(img: HTMLImageElement) {
  const S = 220;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, S, S);
  const p = ctx.getImageData(0, 0, S, S).data;
  let sum = 0;
  let sumSq = 0;
  let edge = 0;
  for (let y = 1; y < S - 1; y++) {
    for (let x = 1; x < S - 1; x++) {
      const i = (y * S + x) * 4;
      const l = (p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114) / 255;
      const r = (p[i + 4] * 0.299 + p[i + 5] * 0.587 + p[i + 6] * 0.114) / 255;
      const d = (p[i + S * 4] * 0.299 + p[i + S * 4 + 1] * 0.587 + p[i + S * 4 + 2] * 0.114) / 255;
      sum += l;
      sumSq += l * l;
      edge += Math.abs(l - r) + Math.abs(l - d);
    }
  }
  const n = (S - 2) * (S - 2);
  const mean = sum / n;
  const variance = Math.max(0, sumSq / n - mean * mean);
  const clamp = (v: number) => Math.max(6, Math.min(99, Math.round(v)));
  return {
    sharpness: clamp((edge / n) * 900),
    exposure: clamp(100 - Math.abs(mean - 0.55) * 190),
    contrast: clamp(Math.sqrt(variance) * 380),
  };
}
