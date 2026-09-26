import { jsPDF } from 'jspdf'

// A plain, print-friendly palette — no per-theme colours, since jsPDF can't
// read CSS custom properties. Kept deliberately restrained: this is meant
// to read as a personal list, not a branded poster.
const COLOR_TEXT = [40, 36, 48]
const COLOR_TEXT_MUTED = [128, 120, 134]
const COLOR_DIVIDER = [225, 218, 224]
const COLOR_COVER_FALLBACK_BG = [242, 238, 240]
// Permanent Yunori World rule: rating stars are always this warm gold,
// matching --color-rating-star in the app's CSS.
const COLOR_RATING_GOLD = [203, 161, 53]
const COLOR_BRAND = [150, 140, 154]

const PAGE_MARGIN = 50
const PAGE_WIDTH = 595.28 // A4 in pt
const PAGE_HEIGHT = 841.89
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2
const FOOTER_HEIGHT = 34

const COVER_WIDTH = 46
const COVER_HEIGHT = 64
const COVER_TEXT_GAP = 16
const TEXT_X = PAGE_MARGIN + COVER_WIDTH + COVER_TEXT_GAP
const TEXT_WIDTH = CONTENT_WIDTH - COVER_WIDTH - COVER_TEXT_GAP

const TITLE_LINE_HEIGHT = 15
const DESCRIPTION_LINE_HEIGHT = 12

// Unicode symbols such as ★ are not part of the standard PDF fonts' WinAnsi
// encoding and render as corrupted glyphs, so rating stars are drawn as a
// small vector shape instead of a text character.
function starPoints(cx, cy, outerR, innerR) {
  const step = Math.PI / 5
  const points = []
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = -Math.PI / 2 + i * step
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  return points
}

function drawStar(doc, cx, cy, outerR, filled) {
  const points = starPoints(cx, cy, outerR, outerR * 0.42)
  const deltas = []
  for (let i = 1; i < points.length; i += 1) {
    deltas.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]])
  }
  deltas.push([points[0][0] - points[points.length - 1][0], points[0][1] - points[points.length - 1][1]])

  if (filled) {
    doc.setFillColor(...COLOR_RATING_GOLD)
    doc.lines(deltas, points[0][0], points[0][1], [1, 1], 'F', true)
  } else {
    doc.setDrawColor(...COLOR_TEXT_MUTED)
    doc.setLineWidth(0.5)
    doc.lines(deltas, points[0][0], points[0][1], [1, 1], 'S', true)
  }
}

/** A simple row of five small stars — no colour flourishes beyond the one
 * permanent gold rating colour. */
function drawRatingStars(doc, x, y, rating) {
  const spacing = 9
  for (let i = 0; i < 5; i += 1) {
    drawStar(doc, x + i * spacing + 3.5, y - 3, 3.5, i < rating)
  }
  return spacing * 5
}

/**
 * Loads a remote cover image and normalises it to a JPEG data URL so it can
 * be embedded regardless of its original format. Resolves to null (never
 * throws) if the image can't be loaded or the canvas is cross-origin
 * tainted — callers fall back to a plain placeholder in that case rather
 * than leaving a broken image or failing the whole export.
 */
function loadCoverImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      } catch (err) {
        console.error('Failed to process anime cover for PDF export:', err)
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function drawCoverPlaceholder(doc, x, y) {
  doc.setFillColor(...COLOR_COVER_FALLBACK_BG)
  doc.roundedRect(x, y, COVER_WIDTH, COVER_HEIGHT, 3, 3, 'F')
}

function drawCover(doc, coverDataUrl, x, y) {
  if (!coverDataUrl) {
    drawCoverPlaceholder(doc, x, y)
    return
  }

  try {
    doc.addImage(coverDataUrl, 'JPEG', x, y, COVER_WIDTH, COVER_HEIGHT)
  } catch (err) {
    console.error('Failed to embed anime cover in PDF export:', err)
    drawCoverPlaceholder(doc, x, y)
  }
}

function buildMetaText(entry) {
  const parts = [entry.status || 'Want to Watch']
  if (entry.category) parts.push(entry.category)
  return parts.join('  ·  ')
}

/** Measures a row's full height (cover, title, meta, and description when
 * present) so the caller can decide whether it fits on the current page
 * before drawing anything — this is what keeps a single entry from being
 * split across a page break. */
function measureRow(doc, entry) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  const titleLines = doc.splitTextToSize(entry.title, TEXT_WIDTH)
  const titleHeight = titleLines.length * TITLE_LINE_HEIGHT

  const metaHeight = 16

  const trimmedDescription = entry.description?.trim()
  let descriptionLines = []
  let descriptionHeight = 0
  if (trimmedDescription) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    descriptionLines = doc.splitTextToSize(trimmedDescription, TEXT_WIDTH)
    descriptionHeight = 6 + descriptionLines.length * DESCRIPTION_LINE_HEIGHT
  }

  const textBlockHeight = titleHeight + metaHeight + descriptionHeight
  const rowHeight = Math.max(COVER_HEIGHT, textBlockHeight)
  const spacingAfter = 18 // gap + divider

  return { height: rowHeight + spacingAfter, titleLines, descriptionLines }
}

function drawRow(doc, entry, topY, titleLines, descriptionLines, coverDataUrl) {
  drawCover(doc, coverDataUrl, PAGE_MARGIN, topY)

  let textY = topY + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COLOR_TEXT)
  titleLines.forEach((line, i) => {
    doc.text(line, TEXT_X, textY + i * TITLE_LINE_HEIGHT)
  })
  textY += titleLines.length * TITLE_LINE_HEIGHT + 2

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...COLOR_TEXT_MUTED)
  const metaText = buildMetaText(entry)
  doc.text(metaText, TEXT_X, textY)

  if (entry.rating != null) {
    const metaWidth = doc.getTextWidth(metaText)
    drawRatingStars(doc, TEXT_X + metaWidth + 10, textY, entry.rating)
  }
  textY += 14

  if (descriptionLines.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_TEXT_MUTED)
    descriptionLines.forEach((line, i) => {
      doc.text(line, TEXT_X, textY + i * DESCRIPTION_LINE_HEIGHT)
    })
    textY += descriptionLines.length * DESCRIPTION_LINE_HEIGHT
  }

  const rowBottom = Math.max(topY + COVER_HEIGHT, textY)
  const dividerY = rowBottom + 9
  doc.setDrawColor(...COLOR_DIVIDER)
  doc.setLineWidth(0.75)
  doc.line(PAGE_MARGIN, dividerY, PAGE_WIDTH - PAGE_MARGIN, dividerY)
}

/** Small, understated wordmark used at the top of every page — present but
 * not the focal point of the page. */
function drawBrandMark(doc, y) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_BRAND)
  doc.text('YUNORI', PAGE_WIDTH - PAGE_MARGIN, y, { align: 'right', charSpace: 1.2 })
}

/** Running header used at the top of continuation pages (page 2+). */
function drawContinuationHeader(doc) {
  drawBrandMark(doc, 36)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_TEXT)
  doc.text('MY ANIME', PAGE_MARGIN, 40)

  doc.setDrawColor(...COLOR_DIVIDER)
  doc.setLineWidth(0.75)
  doc.line(PAGE_MARGIN, 52, PAGE_WIDTH - PAGE_MARGIN, 52)

  return 76
}

function ensureRowSpace(doc, cursorY, neededHeight) {
  if (cursorY + neededHeight <= PAGE_HEIGHT - FOOTER_HEIGHT) {
    return cursorY
  }
  doc.addPage()
  return drawContinuationHeader(doc)
}

/**
 * Builds and downloads a plain, personal-list-style PDF of the given anime
 * entries. Entries are expected to already be the exact list/order the
 * caller wants exported (e.g. the user's currently filtered/sorted My Anime
 * view). Cover images, ratings, statuses, and descriptions are read
 * directly from each entry — nothing is invented, and an entry's
 * description line is only shown when the user actually wrote one.
 */
export async function exportCollectionToPdf({ entries, username, isFiltered }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  // Cover images are loaded up front so the layout pass below can measure
  // and draw each row synchronously; a failed/missing image simply falls
  // back to a plain placeholder rather than blocking the export.
  const coverImages = await Promise.all(entries.map((entry) => loadCoverImage(entry.cover_image)))

  // --- Header -------------------------------------------------------
  drawBrandMark(doc, 40)

  let cursorY = 56
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...COLOR_TEXT)
  doc.text('MY ANIME', PAGE_MARGIN, cursorY)

  if (username) {
    cursorY += 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(...COLOR_TEXT_MUTED)
    doc.text(`${username}'s Anime List`, PAGE_MARGIN, cursorY)
  }

  cursorY += 18
  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const entryCountLabel = `${entries.length} anime`
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_TEXT_MUTED)
  doc.text(
    isFiltered ? `${entryCountLabel} · ${generatedOn} · filtered view` : `${entryCountLabel} · ${generatedOn}`,
    PAGE_MARGIN,
    cursorY,
  )

  cursorY += 16
  doc.setDrawColor(...COLOR_DIVIDER)
  doc.setLineWidth(0.75)
  doc.line(PAGE_MARGIN, cursorY, PAGE_WIDTH - PAGE_MARGIN, cursorY)
  cursorY += 26

  // --- Entries list ----------------------------------------------------
  if (entries.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.setTextColor(...COLOR_TEXT_MUTED)
    doc.text('No anime to show yet.', PAGE_MARGIN, cursorY)
  } else {
    entries.forEach((entry, index) => {
      const { height, titleLines, descriptionLines } = measureRow(doc, entry)
      cursorY = ensureRowSpace(doc, cursorY, height)
      drawRow(doc, entry, cursorY, titleLines, descriptionLines, coverImages[index])
      cursorY += height
    })
  }

  // --- Footer / page numbers --------------------------------------------
  const totalPages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_TEXT_MUTED)
    doc.text(`Page ${page} of ${totalPages}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 18, { align: 'center' })
  }

  const filenameDate = new Date().toISOString().slice(0, 10)
  doc.save(`My-Anime-List-${filenameDate}.pdf`)
}
