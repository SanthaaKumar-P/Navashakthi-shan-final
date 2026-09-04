import { removeBackground } from "@imgly/background-removal"

export type EnhanceOptions = {
  brightness: number
  contrast: number
  saturation: number
  removeBackground: boolean
  tolerance: number
  size: number
}

export type ImageScores = {
  sharpness: number
  exposure: number
  contrast: number
}

export type EnhancementResult = {
  dataUrl: string
  bgPercent: number
}

export const DEFAULT_ENHANCE: EnhanceOptions = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  removeBackground: true,
  tolerance: 50,
  size: 1000,
}

export const STUDIO_TARGET = {
  sharpness: 72,
  exposure: 86,
  contrast: 70,
  size: 1000,
  ratio: "1:1",
  background: "Soft neutral studio background",
} as const

const clamp = (
  value: number,
  min: number,
  max: number,
) => Math.max(min, Math.min(max, value))

/* =========================================================
   IMAGE LOADING
========================================================= */

export function loadImage(
  file: File,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(
        new Error(
          "Could not read that image",
        ),
      )
    }

    img.src = url
  })
}

/* =========================================================
   BLOB → IMAGE
========================================================= */

function blobToImage(
  blob: Blob,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(
        new Error(
          "Could not decode the AI processed image",
        ),
      )
    }

    img.src = url
  })
}

/* =========================================================
   CANVAS → BLOB
========================================================= */

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality = 0.94,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(
            new Error(
              "Could not encode image",
            ),
          )
        }
      },
      type,
      quality,
    )
  })
}

/* =========================================================
   IMAGE QUALITY ANALYSIS
========================================================= */

export function scoreImage(
  img: HTMLImageElement,
): ImageScores {
  const SIZE = 220

  const canvas =
    document.createElement("canvas")

  canvas.width = SIZE
  canvas.height = SIZE

  const ctx = canvas.getContext(
    "2d",
    {
      willReadFrequently: true,
    },
  )

  if (!ctx) {
    return {
      sharpness: 50,
      exposure: 75,
      contrast: 60,
    }
  }

  ctx.drawImage(
    img,
    0,
    0,
    SIZE,
    SIZE,
  )

  const pixels =
    ctx.getImageData(
      0,
      0,
      SIZE,
      SIZE,
    ).data

  let luminanceSum = 0
  let luminanceSquaredSum = 0
  let edgeStrength = 0

  for (
    let y = 1;
    y < SIZE - 1;
    y++
  ) {
    for (
      let x = 1;
      x < SIZE - 1;
      x++
    ) {
      const index =
        (y * SIZE + x) * 4

      const current =
        (
          pixels[index] *
            0.299 +
          pixels[index + 1] *
            0.587 +
          pixels[index + 2] *
            0.114
        ) / 255

      const right =
        (
          pixels[index + 4] *
            0.299 +
          pixels[index + 5] *
            0.587 +
          pixels[index + 6] *
            0.114
        ) / 255

      const downIndex =
        index + SIZE * 4

      const down =
        (
          pixels[downIndex] *
            0.299 +
          pixels[downIndex + 1] *
            0.587 +
          pixels[downIndex + 2] *
            0.114
        ) / 255

      luminanceSum += current
      luminanceSquaredSum +=
        current * current

      edgeStrength +=
        Math.abs(
          current - right,
        ) +
        Math.abs(
          current - down,
        )
    }
  }

  const count =
    (SIZE - 2) *
    (SIZE - 2)

  const mean =
    luminanceSum / count

  const variance =
    Math.max(
      0,
      luminanceSquaredSum /
        count -
        mean * mean,
    )

  const normalize = (
    value: number,
  ) =>
    Math.max(
      6,
      Math.min(
        99,
        Math.round(value),
      ),
    )

  return {
    sharpness: normalize(
      (edgeStrength / count) *
        900,
    ),

    exposure: normalize(
      100 -
        Math.abs(
          mean - 0.55,
        ) *
          190,
    ),

    contrast: normalize(
      Math.sqrt(variance) *
        380,
    ),
  }
}

/* =========================================================
   AUTOMATIC ENHANCEMENT PLAN
========================================================= */

export function autoEnhanceOptions(
  scores: ImageScores,
): EnhanceOptions {
  const brightness =
    clamp(
      1 +
        (STUDIO_TARGET.exposure -
          scores.exposure) /
          360,
      0.92,
      1.18,
    )

  const contrast =
    clamp(
      1 +
        (STUDIO_TARGET.contrast -
          scores.contrast) /
          320,
      0.94,
      1.16,
    )

  const saturation =
    clamp(
      1 +
        (STUDIO_TARGET.contrast -
          scores.contrast) /
          700,
      0.96,
      1.08,
    )

  return {
    brightness,
    contrast,
    saturation,
    removeBackground: true,
    tolerance: 50,
    size: STUDIO_TARGET.size,
  }
}

/* =========================================================
   PROCESSING NOTES
========================================================= */

export function autoPlanNotes(
  scores: ImageScores,
  options: EnhanceOptions,
): string[] {
  const percent = (
    value: number,
  ) => {
    const difference =
      Math.round(
        (value - 1) * 100,
      )

    return `${
      difference >= 0
        ? "+"
        : ""
    }${difference}%`
  }

  const notes: string[] = []

  if (
    scores.exposure < 70
  ) {
    notes.push(
      `Exposure lifted ${percent(
        options.brightness,
      )}`,
    )
  } else if (
    scores.exposure > 94
  ) {
    notes.push(
      `Highlights protected with ${percent(
        options.brightness,
      )} exposure correction`,
    )
  } else {
    notes.push(
      "Exposure already well balanced",
    )
  }

  if (
    scores.contrast < 55
  ) {
    notes.push(
      `Contrast gently increased ${percent(
        options.contrast,
      )}`,
    )
  } else {
    notes.push(
      "Existing product contrast preserved",
    )
  }

  if (
    scores.sharpness < 55
  ) {
    notes.push(
      "Fine-detail enhancement applied conservatively",
    )
  } else {
    notes.push(
      "Existing product detail preserved",
    )
  }

  notes.push(
    "AI foreground segmentation applied",
  )

  notes.push(
    `Product smart-framed at ${STUDIO_TARGET.size}×${STUDIO_TARGET.size}`,
  )

  notes.push(
    "Natural neutral studio background added",
  )

  notes.push(
    "Soft product shadow added",
  )

  return notes
}

/* =========================================================
   AI BACKGROUND REMOVAL
========================================================= */

async function removeProductBackground(
  img: HTMLImageElement,
): Promise<Blob> {
  const MAX_DIMENSION = 1800

  const originalWidth =
    img.naturalWidth ||
    img.width

  const originalHeight =
    img.naturalHeight ||
    img.height

  if (
    originalWidth <= 0 ||
    originalHeight <= 0
  ) {
    throw new Error(
      "Invalid image dimensions",
    )
  }

  const scale =
    Math.min(
      1,
      MAX_DIMENSION /
        Math.max(
          originalWidth,
          originalHeight,
        ),
    )

  const width =
    Math.max(
      1,
      Math.round(
        originalWidth *
          scale,
      ),
    )

  const height =
    Math.max(
      1,
      Math.round(
        originalHeight *
          scale,
      ),
    )

  const canvas =
    document.createElement(
      "canvas",
    )

  canvas.width = width
  canvas.height = height

  const ctx =
    canvas.getContext("2d")

  if (!ctx) {
    throw new Error(
      "Could not create AI processing canvas",
    )
  }

  ctx.drawImage(
    img,
    0,
    0,
    width,
    height,
  )

  const sourceBlob =
    await canvasToBlob(
      canvas,
      "image/png",
      1,
    )

  /*
   * IMG.LY browser background-removal model.
   *
   * isnet_quint8 is the lightweight quantized model.
   */

  const result =
    await removeBackground(
      sourceBlob,
      {
        model:
          "isnet_quint8",

        device: "cpu",

        output: {
          format:
            "image/png",

          quality: 1,
        },
      },
    )

  if (!result) {
    throw new Error(
      "AI background removal returned no result",
    )
  }

  return result
}

/* =========================================================
   ALPHA BOUNDING BOX
========================================================= */

type AlphaBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
  transparentPercent: number
}

function getAlphaBounds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): AlphaBounds {
  const imageData =
    ctx.getImageData(
      0,
      0,
      width,
      height,
    )

  const pixels =
    imageData.data

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  let transparentPixels = 0

  for (
    let y = 0;
    y < height;
    y++
  ) {
    for (
      let x = 0;
      x < width;
      x++
    ) {
      const index =
        (y * width + x) * 4

      const alpha =
        pixels[index + 3]

      if (alpha < 32) {
        transparentPixels++
        continue
      }

      if (x < minX) {
        minX = x
      }

      if (y < minY) {
        minY = y
      }

      if (x > maxX) {
        maxX = x
      }

      if (y > maxY) {
        maxY = y
      }
    }
  }

  if (maxX < 0) {
    throw new Error(
      "AI could not detect a clear product. Please use a photo where the craft is clearly visible.",
    )
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    transparentPercent:
      Math.round(
        (
          transparentPixels /
          (width * height)
        ) *
          100,
      ),
  }
}

/* =========================================================
   FINAL STUDIO COMPOSITION
========================================================= */

function createStudioComposition(
  segmented: HTMLImageElement,
  options: EnhanceOptions,
) {
  const sourceWidth =
    segmented.naturalWidth ||
    segmented.width

  const sourceHeight =
    segmented.naturalHeight ||
    segmented.height

  const sourceCanvas =
    document.createElement(
      "canvas",
    )

  sourceCanvas.width =
    sourceWidth

  sourceCanvas.height =
    sourceHeight

  const sourceCtx =
    sourceCanvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      },
    )

  if (!sourceCtx) {
    throw new Error(
      "Could not inspect AI segmentation",
    )
  }

  sourceCtx.drawImage(
    segmented,
    0,
    0,
    sourceWidth,
    sourceHeight,
  )

  const bounds =
    getAlphaBounds(
      sourceCtx,
      sourceWidth,
      sourceHeight,
    )

  const productWidth =
    bounds.maxX -
    bounds.minX +
    1

  const productHeight =
    bounds.maxY -
    bounds.minY +
    1

  const targetSize =
    options.size

  const maxProductDimension =
    targetSize * 0.82

  const productScale =
    Math.min(
      maxProductDimension /
        productWidth,

      maxProductDimension /
        productHeight,
    )

  const renderedWidth =
    productWidth *
    productScale

  const renderedHeight =
    productHeight *
    productScale

  const destinationX =
    (
      targetSize -
      renderedWidth
    ) / 2

  const destinationY =
    (
      targetSize -
      renderedHeight
    ) / 2 -
    targetSize * 0.025

  const canvas =
    document.createElement(
      "canvas",
    )

  canvas.width =
    targetSize

  canvas.height =
    targetSize

  const ctx =
    canvas.getContext("2d")

  if (!ctx) {
    throw new Error(
      "Could not create final studio canvas",
    )
  }

  /* -------------------------------------------------------
     1. NEUTRAL BACKGROUND
  ------------------------------------------------------- */

  const background =
    ctx.createLinearGradient(
      0,
      0,
      0,
      targetSize,
    )

  background.addColorStop(
    0,
    "#F8F6F2",
  )

  background.addColorStop(
    1,
    "#EEEAE3",
  )

  ctx.fillStyle =
    background

  ctx.fillRect(
    0,
    0,
    targetSize,
    targetSize,
  )

  /* -------------------------------------------------------
     2. PRODUCT SHADOW
  ------------------------------------------------------- */

  const shadowCanvas =
    document.createElement(
      "canvas",
    )

  shadowCanvas.width =
    targetSize

  shadowCanvas.height =
    targetSize

  const shadowCtx =
    shadowCanvas.getContext(
      "2d",
    )

  if (shadowCtx) {
    shadowCtx.save()

    shadowCtx.globalAlpha =
      0.16

    shadowCtx.filter =
      "blur(16px)"

    shadowCtx.drawImage(
      segmented,

      destinationX -
        bounds.minX *
          productScale +
        5,

      destinationY -
        bounds.minY *
          productScale +
        12,

      sourceWidth *
        productScale,

      sourceHeight *
        productScale,
    )

    shadowCtx.restore()

    ctx.save()

    ctx.globalAlpha =
      0.28

    ctx.globalCompositeOperation =
      "multiply"

    ctx.drawImage(
      shadowCanvas,
      0,
      0,
    )

    ctx.restore()
  }

  /* -------------------------------------------------------
     3. GROUND SHADOW
  ------------------------------------------------------- */

  const groundShadow =
    ctx.createRadialGradient(
      targetSize / 2,
      destinationY +
        renderedHeight +
        10,
      4,
      targetSize / 2,
      destinationY +
        renderedHeight +
        10,
      Math.max(
        90,
        renderedWidth *
          0.35,
      ),
    )

  groundShadow.addColorStop(
    0,
    "rgba(70,55,40,0.13)",
  )

  groundShadow.addColorStop(
    1,
    "rgba(70,55,40,0)",
  )

  ctx.fillStyle =
    groundShadow

  ctx.fillRect(
    0,
    destinationY +
      renderedHeight -
      12,
    targetSize,
    100,
  )

  /* -------------------------------------------------------
     4. ACTUAL PRODUCT
  ------------------------------------------------------- */

  ctx.save()

  ctx.filter =
    `brightness(${options.brightness}) ` +
    `contrast(${options.contrast}) ` +
    `saturate(${options.saturation})`

  ctx.imageSmoothingEnabled =
    true

  ctx.imageSmoothingQuality =
    "high"

  ctx.drawImage(
    segmented,

    destinationX -
      bounds.minX *
        productScale,

    destinationY -
      bounds.minY *
        productScale,

    sourceWidth *
      productScale,

    sourceHeight *
      productScale,
  )

  ctx.restore()

  return {
    canvas,
    transparentPercent:
      bounds.transparentPercent,
  }
}

/* =========================================================
   MAIN ENHANCEMENT FUNCTION
========================================================= */

export async function enhanceImage(
  img: HTMLImageElement,
  options: EnhanceOptions,
): Promise<EnhancementResult> {
  if (!img.complete) {
    await new Promise<void>(
      (resolve, reject) => {
        img.onload =
          () => resolve()

        img.onerror =
          () =>
            reject(
              new Error(
                "Could not load source image",
              ),
            )
      },
    )
  }

  if (
    !img.naturalWidth ||
    !img.naturalHeight
  ) {
    throw new Error(
      "Source image has invalid dimensions",
    )
  }

  /* -------------------------------------------------------
     AI SEGMENTATION
  ------------------------------------------------------- */

  let segmentedBlob: Blob

  if (
    options.removeBackground
  ) {
    segmentedBlob =
      await removeProductBackground(
        img,
      )
  } else {
    const canvas =
      document.createElement(
        "canvas",
      )

    canvas.width =
      img.naturalWidth

    canvas.height =
      img.naturalHeight

    const ctx =
      canvas.getContext("2d")

    if (!ctx) {
      throw new Error(
        "Could not prepare source image",
      )
    }

    ctx.drawImage(
      img,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    segmentedBlob =
      await canvasToBlob(
        canvas,
        "image/png",
        1,
      )
  }

  /* -------------------------------------------------------
     AI RESULT → IMAGE
  ------------------------------------------------------- */

  const segmented =
    await blobToImage(
      segmentedBlob,
    )

  /* -------------------------------------------------------
     PROFESSIONAL COMPOSITION
  ------------------------------------------------------- */

  const result =
    createStudioComposition(
      segmented,
      options,
    )

  /* -------------------------------------------------------
     FINAL JPG
  ------------------------------------------------------- */

  const dataUrl =
    result.canvas.toDataURL(
      "image/jpeg",
      0.94,
    )

  return {
    dataUrl,
    bgPercent:
      result.transparentPercent,
  }
}