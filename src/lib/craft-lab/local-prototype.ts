import type { CraftDNA } from "@/lib/craft-dna/types";
import type {
  CraftExperiment,
  CraftLabPrototypeResult,
} from "@/lib/craft-lab/types";

const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 900;

/* =========================================================
   COLOUR HELPERS
========================================================= */

function normalizeColour(
  value: string | undefined,
): string {
  const raw = value?.trim();

  if (!raw) {
    return "#7f1d1d";
  }

  const knownColours: Record<string, string> = {
    red: "#b91c1c",
    "deep red": "#7f1d1d",
    crimson: "#991b1b",
    maroon: "#7f1d1d",
    burgundy: "#7f1d1d",
    wine: "#7f1d1d",
    pink: "#db2777",
    rose: "#be123c",
    orange: "#ea580c",
    saffron: "#d97706",
    yellow: "#ca8a04",
    gold: "#c99a2e",
    "golden yellow": "#c99a2e",
    green: "#15803d",
    emerald: "#047857",
    blue: "#1d4ed8",
    navy: "#1e3a8a",
    purple: "#7e22ce",
    violet: "#6d28d9",
    black: "#171717",
    white: "#f8fafc",
    cream: "#f5f0df",
    beige: "#d6c6a5",
    brown: "#78350f",
  };

  const normalized = raw.toLowerCase();

  for (const [name, colour] of Object.entries(
    knownColours,
  )) {
    if (normalized.includes(name)) {
      return colour;
    }
  }

  return "#7f1d1d";
}

function lightenColour(
  hex: string,
  amount = 0.18,
): string {
  const value = hex.replace("#", "");

  if (value.length !== 6) {
    return hex;
  }

  const red = parseInt(
    value.slice(0, 2),
    16,
  );

  const green = parseInt(
    value.slice(2, 4),
    16,
  );

  const blue = parseInt(
    value.slice(4, 6),
    16,
  );

  const mix = (channel: number) =>
    Math.round(
      channel +
        (255 - channel) * amount,
    )
      .toString(16)
      .padStart(2, "0");

  return `#${mix(red)}${mix(green)}${mix(blue)}`;
}

function darkenColour(
  hex: string,
  amount = 0.22,
): string {
  const value = hex.replace("#", "");

  if (value.length !== 6) {
    return hex;
  }

  const red = parseInt(
    value.slice(0, 2),
    16,
  );

  const green = parseInt(
    value.slice(2, 4),
    16,
  );

  const blue = parseInt(
    value.slice(4, 6),
    16,
  );

  const mix = (channel: number) =>
    Math.round(
      channel * (1 - amount),
    )
      .toString(16)
      .padStart(2, "0");

  return `#${mix(red)}${mix(green)}${mix(blue)}`;
}

/* =========================================================
   CANVAS HELPERS
========================================================= */

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(
    radius,
    width / 2,
    height / 2,
  );

  context.beginPath();

  context.moveTo(
    x + safeRadius,
    y,
  );

  context.lineTo(
    x + width - safeRadius,
    y,
  );

  context.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + safeRadius,
  );

  context.lineTo(
    x + width,
    y + height - safeRadius,
  );

  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );

  context.lineTo(
    x + safeRadius,
    y + height,
  );

  context.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - safeRadius,
  );

  context.lineTo(
    x,
    y + safeRadius,
  );

  context.quadraticCurveTo(
    x,
    y,
    x + safeRadius,
    y,
  );

  context.closePath();
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font: string,
  colour: string,
) {
  context.font = font;
  context.fillStyle = colour;
  context.textBaseline = "top";

  const words = text.split(/\s+/);

  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine =
      line.length > 0
        ? `${line} ${word}`
        : word;

    if (
      context.measureText(testLine).width >
        maxWidth &&
      line.length > 0
    ) {
      context.fillText(
        line,
        x,
        currentY,
      );

      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    context.fillText(
      line,
      x,
      currentY,
    );
  }

  return currentY + lineHeight;
}

/* =========================================================
   IMAGE LOADER
========================================================= */

async function loadReferenceImage(
  source: string | undefined,
): Promise<HTMLImageElement | null> {
  if (
    !source ||
    !source.startsWith("data:")
  ) {
    return null;
  }

  return new Promise(
    (resolve) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        resolve(null);

      image.src = source;
    },
  );
}

function drawImageContain(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageRatio =
    image.width / image.height;

  const boxRatio =
    width / height;

  let drawWidth = width;
  let drawHeight = height;

  if (imageRatio > boxRatio) {
    drawHeight =
      width / imageRatio;
  } else {
    drawWidth =
      height * imageRatio;
  }

  const drawX =
    x + (width - drawWidth) / 2;

  const drawY =
    y + (height - drawHeight) / 2;

  context.save();

  roundedRect(
    context,
    x,
    y,
    width,
    height,
    28,
  );

  context.clip();

  context.fillStyle =
    "#f8fafc";

  context.fillRect(
    x,
    y,
    width,
    height,
  );

  context.drawImage(
    image,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );

  context.restore();
}

/* =========================================================
   SAREE PROTOTYPE
========================================================= */

function drawSareeConcept(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  primaryColour: string,
  secondaryColour: string,
  experiment: CraftExperiment,
) {
  const bodyX =
    x + width * 0.16;

  const bodyY =
    y + height * 0.08;

  const bodyWidth =
    width * 0.68;

  const bodyHeight =
    height * 0.72;

  const gradient =
    context.createLinearGradient(
      bodyX,
      bodyY,
      bodyX + bodyWidth,
      bodyY + bodyHeight,
    );

  gradient.addColorStop(
    0,
    lightenColour(
      primaryColour,
      0.12,
    ),
  );

  gradient.addColorStop(
    0.48,
    primaryColour,
  );

  gradient.addColorStop(
    1,
    darkenColour(
      primaryColour,
      0.14,
    ),
  );

  context.save();

  /* Main saree body */

  context.fillStyle =
    gradient;

  context.beginPath();

  context.moveTo(
    bodyX + 35,
    bodyY,
  );

  context.lineTo(
    bodyX + bodyWidth - 25,
    bodyY + 5,
  );

  context.lineTo(
    bodyX + bodyWidth,
    bodyY + bodyHeight - 60,
  );

  context.quadraticCurveTo(
    bodyX + bodyWidth * 0.74,
    bodyY + bodyHeight + 20,
    bodyX + bodyWidth * 0.5,
    bodyY + bodyHeight - 15,
  );

  context.quadraticCurveTo(
    bodyX + bodyWidth * 0.22,
    bodyY + bodyHeight + 15,
    bodyX,
    bodyY + bodyHeight - 45,
  );

  context.closePath();

  context.fill();

  /* Silk folds */

  context.strokeStyle =
    lightenColour(
      primaryColour,
      0.28,
    );

  context.lineWidth = 2;

  for (
    let index = 0;
    index < 12;
    index += 1
  ) {
    const foldX =
      bodyX +
      25 +
      index *
        (bodyWidth - 50) /
        12;

    context.beginPath();

    context.moveTo(
      foldX,
      bodyY + 20,
    );

    context.quadraticCurveTo(
      foldX - 18,
      bodyY +
        bodyHeight * 0.45,
      foldX + 4,
      bodyY +
        bodyHeight -
        30,
    );

    context.stroke();
  }

  /* Zari border */

  context.fillStyle =
    secondaryColour;

  context.fillRect(
    bodyX,
    bodyY + bodyHeight - 68,
    bodyWidth,
    38,
  );

  context.fillRect(
    bodyX + bodyWidth - 42,
    bodyY,
    42,
    bodyHeight,
  );

  /* Inner zari line */

  context.strokeStyle =
    "#fff7d6";

  context.lineWidth = 3;

  context.strokeRect(
    bodyX + 9,
    bodyY + bodyHeight - 59,
    bodyWidth - 18,
    20,
  );

  /* Pallu */

  const palluX =
    bodyX +
    bodyWidth * 0.55;

  const palluY =
    bodyY +
    bodyHeight * 0.16;

  const palluWidth =
    bodyWidth * 0.32;

  const palluHeight =
    bodyHeight * 0.58;

  context.fillStyle =
    darkenColour(
      primaryColour,
      0.1,
    );

  context.globalAlpha =
    0.95;

  context.beginPath();

  context.moveTo(
    palluX,
    palluY,
  );

  context.lineTo(
    palluX + palluWidth,
    palluY + 35,
  );

  context.lineTo(
    palluX + palluWidth - 12,
    palluY + palluHeight,
  );

  context.lineTo(
    palluX + 25,
    palluY + palluHeight - 15,
  );

  context.closePath();

  context.fill();

  context.globalAlpha = 1;

  /* Proposed design marker */

  context.strokeStyle =
    "#d97706";

  context.lineWidth = 5;

  context.setLineDash([
    12,
    10,
  ]);

  context.strokeRect(
    palluX - 12,
    palluY - 12,
    palluWidth + 24,
    palluHeight + 24,
  );

  context.setLineDash([]);

  context.restore();

  /* Experiment title */

  roundedRect(
    context,
    x + 28,
    y + height - 92,
    width - 56,
    56,
    18,
  );

  context.fillStyle =
    "#ffffff";

  context.fill();

  context.fillStyle =
    "#334155";

  context.font =
    "600 18px Inter, Arial, sans-serif";

  context.fillText(
    experiment.title,
    x + 48,
    y + height - 74,
  );
}

/* =========================================================
   GENERIC PRODUCT PROTOTYPE
========================================================= */

function drawGenericConcept(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  primaryColour: string,
  experiment: CraftExperiment,
) {
  const cardX =
    x + width * 0.12;

  const cardY =
    y + height * 0.10;

  const cardWidth =
    width * 0.76;

  const cardHeight =
    height * 0.66;

  context.save();

  context.shadowColor =
    "rgba(15, 23, 42, 0.12)";

  context.shadowBlur = 24;

  context.shadowOffsetY = 12;

  roundedRect(
    context,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    30,
  );

  context.fillStyle =
    "#ffffff";

  context.fill();

  context.shadowColor =
    "transparent";

  roundedRect(
    context,
    cardX + 70,
    cardY + 65,
    cardWidth - 140,
    cardHeight - 140,
    24,
  );

  context.fillStyle =
    primaryColour;

  context.fill();

  /* Craft texture */

  context.strokeStyle =
    lightenColour(
      primaryColour,
      0.28,
    );

  context.lineWidth = 2;

  for (
    let index = 0;
    index < 9;
    index += 1
  ) {
    const lineY =
      cardY +
      95 +
      index * 24;

    context.beginPath();

    context.moveTo(
      cardX + 95,
      lineY,
    );

    context.lineTo(
      cardX +
        cardWidth -
        95,
      lineY,
    );

    context.stroke();
  }

  /* Proposed change marker */

  context.strokeStyle =
    "#d97706";

  context.lineWidth = 5;

  context.setLineDash([
    12,
    10,
  ]);

  context.strokeRect(
    cardX + 48,
    cardY + 43,
    cardWidth - 96,
    cardHeight - 96,
  );

  context.setLineDash([]);

  context.restore();

  drawText(
    context,
    experiment.title,
    x + 36,
    y + height - 92,
    width - 72,
    26,
    "600 18px Inter, Arial, sans-serif",
    "#334155",
  );
}

/* =========================================================
   MAIN LOCAL PROTOTYPE ENGINE
========================================================= */

export async function generateLocalCraftLabPrototype(
  experiment: CraftExperiment,
  craftDNA: CraftDNA,
  baseImage?: string,
): Promise<CraftLabPrototypeResult> {
  if (
    typeof document ===
    "undefined"
  ) {
    throw new Error(
      "Craft Lab visual prototype is available in the browser only.",
    );
  }

  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    CANVAS_WIDTH;

  canvas.height =
    CANVAS_HEIGHT;

  const context =
    canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Unable to create the Craft Lab visual prototype canvas.",
    );
  }

  const primaryColour =
    normalizeColour(
      craftDNA.primaryColour.value,
    );

  const secondaryColour =
    normalizeColour(
      craftDNA.secondaryColours.value?.[0] ??
        craftDNA.decoration.value ??
        "gold",
    );

  /* =======================================================
     BACKGROUND
  ======================================================= */

  const background =
    context.createLinearGradient(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );

  background.addColorStop(
    0,
    "#fffdf8",
  );

  background.addColorStop(
    1,
    "#f5efe4",
  );

  context.fillStyle =
    background;

  context.fillRect(
    0,
    0,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  );

  /* =======================================================
     HEADER
  ======================================================= */

  context.fillStyle =
    "#0f172a";

  context.font =
    "700 34px Inter, Arial, sans-serif";

  context.fillText(
    "NAVSHAKTHI CRAFT LAB",
    70,
    70,
  );

  context.fillStyle =
    "#a16207";

  context.font =
    "600 18px Inter, Arial, sans-serif";

  context.fillText(
    "LOCAL VISUAL DESIGN PROTOTYPE",
    70,
    104,
  );

  /* =======================================================
     EXISTING CRAFT PANEL
  ======================================================= */

  const panelY = 145;
  const panelHeight = 625;

  roundedRect(
    context,
    60,
    panelY,
    600,
    panelHeight,
    28,
  );

  context.fillStyle =
    "#ffffff";

  context.fill();

  context.strokeStyle =
    "#e2e8f0";

  context.lineWidth = 2;

  context.stroke();

  context.fillStyle =
    "#475569";

  context.font =
    "600 18px Inter, Arial, sans-serif";

  context.fillText(
    "Existing Craft Reference",
    95,
    panelY + 42,
  );

  const referenceImage =
    await loadReferenceImage(
      baseImage,
    );

  if (referenceImage) {
    drawImageContain(
      context,
      referenceImage,
      95,
      panelY + 70,
      530,
      490,
    );
  } else {
    roundedRect(
      context,
      95,
      panelY + 70,
      530,
      490,
      24,
    );

    context.fillStyle =
      "#f8fafc";

    context.fill();

    context.fillStyle =
      "#64748b";

    context.font =
      "500 18px Inter, Arial, sans-serif";

    context.fillText(
      "Original craft image unavailable",
      190,
      panelY + 305,
    );
  }

  /* =======================================================
     PROPOSED EXPERIMENT PANEL
  ======================================================= */

  roundedRect(
    context,
    700,
    panelY,
    640,
    panelHeight,
    28,
  );

  context.fillStyle =
    "#ffffff";

  context.fill();

  context.strokeStyle =
    "#e2e8f0";

  context.stroke();

  context.fillStyle =
    "#475569";

  context.font =
    "600 18px Inter, Arial, sans-serif";

  context.fillText(
    "Proposed Experiment",
    735,
    panelY + 42,
  );

  const productType =
    craftDNA.productType.value
      .toLowerCase();

  const isSaree =
    productType.includes(
      "saree",
    ) ||
    productType.includes(
      "sari",
    );

  if (isSaree) {
    drawSareeConcept(
      context,
      730,
      panelY + 70,
      580,
      490,
      primaryColour,
      secondaryColour,
      experiment,
    );
  } else {
    drawGenericConcept(
      context,
      730,
      panelY + 70,
      580,
      490,
      primaryColour,
      experiment,
    );
  }

  /* =======================================================
     CRAFT DNA FOOTER
  ======================================================= */

  roundedRect(
    context,
    60,
    805,
    1280,
    55,
    18,
  );

  context.fillStyle =
    "#ecfdf5";

  context.fill();

  context.fillStyle =
    "#047857";

  context.font =
    "600 17px Inter, Arial, sans-serif";

  context.fillText(
    `Craft DNA preserved · ${craftDNA.material.value} · ${craftDNA.primaryColour.value}`,
    88,
    823,
  );

  /* =======================================================
     EXPORT PNG
  ======================================================= */

  const imageDataUrl =
    canvas.toDataURL(
      "image/png",
      0.92,
    );

  return {
    imageDataUrl,

    generatedAt:
      new Date().toISOString(),
  };
}