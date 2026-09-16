import { jsPDF } from 'jspdf'

// A restrained, kawaii-journal PDF palette. Fixed values (not read from CSS
// custom properties, which jsPDF cannot see) — a clean starting point that
// can be refined later.
const COLOR_BG_WHITE = [255, 255, 255]
const COLOR_TEXT = [46, 41, 58] // dark navy/charcoal
const COLOR_TEXT_MUTED = [142, 132, 152]
const COLOR_PINK = [243, 184, 203]
const COLOR_PINK_DARK = [176, 92, 130]
const COLOR_LAVENDER = [214, 203, 238]
const COLOR_DIVIDER = [236, 223, 232]

const PAGE_MARGIN = 50
const PAGE_WIDTH = 595.28 // A4 in pt
const PAGE_HEIGHT = 841.89
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2
const FOOTER_HEIGHT = 30
const LIST_TEXT_X = PAGE_MARGIN + 16
const LIST_TEXT_WIDTH = CONTENT_WIDTH - 16

// Unicode symbols such as ★ ♥ ♡ are NOT part of the standard PDF fonts'
// WinAnsi encoding and render as corrupted glyphs. Every star/heart/dot in
// this document is therefore drawn as a small vector shape instead of a
// text character — this is deliberate, not an oversight.

function drawDot(doc, cx, cy, radius, color) {
  doc.setFillColor(...color)
  doc.circle(cx, cy, radius, 'F')
}

function drawHeart(doc, cx, cy, size, color) {
  const r = size * 0.3
  const topCy = cy - r * 0.3
  doc.setFillColor(...color)
  doc.circle(cx - r, topCy, r, 'F')
  doc.circle(cx + r, topCy, r, 'F')
  doc.triangle(cx - size * 0.5, topCy, cx + size * 0.5, topCy, cx, cy + size * 0.5, 'F')
}

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

function drawStar(doc, cx, cy, outerR, filled, color) {
  const points = starPoints(cx, cy, outerR, outerR * 0.42)
  const deltas = []
  for (let i = 1; i < points.length; i += 1) {
    deltas.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]])
  }
  deltas.push([points[0][0] - points[points.length - 1][0], points[0][1] - points[points.length - 1][1]])

  if (filled) {
    doc.setFillColor(...color)
    doc.lines(deltas, points[0][0], points[0][1], [1, 1], 'F', true)
  } else {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.6)
    doc.lines(deltas, points[0][0], points[0][1], [1, 1], 'S', true)
  }
}

/** Small four-point sparkle mark, drawn with two crossed diamonds. */
function drawSparkle(doc, cx, cy, size, color) {
  doc.setFillColor(...color)
  doc.triangle(cx, cy - size, cx + size * 0.35, cy, cx, cy + size, 'F')
  doc.triangle(cx, cy - size, cx - size * 0.35, cy, cx, cy + size, 'F')
  doc.triangle(cx - size, cy, cx, cy - size * 0.35, cx + size, cy, 'F')
  doc.triangle(cx - size, cy, cx, cy + size * 0.35, cx + size, cy, 'F')
}

function drawRatingStars(doc, x, y, rating) {
  const spacing = 9
  for (let i = 0; i < 5; i += 1) {
    drawStar(doc, x + i * spacing + 4, y - 3, 4, i < rating, COLOR_PINK_DARK)
  }
  return spacing * 5
}

function drawDottedDivider(doc, x, y, width, color) {
  const dotGap = 5
  const count = Math.floor(width / dotGap)
  doc.setFillColor(...color)
  for (let i = 0; i < count; i += 1) {
    doc.circle(x + i * dotGap, y, 0.5, 'F')
  }
}

function drawMiniFlourish(doc, centerX, y) {
  drawHeart(doc, centerX - 14, y, 6, COLOR_PINK)
  drawDot(doc, centerX, y, 1.6, COLOR_LAVENDER)
  drawHeart(doc, centerX + 14, y, 6, COLOR_PINK)
}

function fillPageBackground(doc) {
  doc.setFillColor(...COLOR_BG_WHITE)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')
}

function drawCornerSparkles(doc) {
  drawSparkle(doc, PAGE_MARGIN - 22, 34, 5, COLOR_LAVENDER)
  drawSparkle(doc, PAGE_WIDTH - PAGE_MARGIN + 22, 34, 5, COLOR_PINK)
}

/** Small running header used at the top of continuation pages (page 2+). */
function drawContinuationHeader(doc) {
  fillPageBackground(doc)
  drawCornerSparkles(doc)

  doc.setFont('helvetica', 'bolditalic')
  doc.setFontSize(13)
  doc.setTextColor(...COLOR_PINK_DARK)
  doc.text('YourAnime', PAGE_MARGIN, 40)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_TEXT_MUTED)
  doc.text('Anime Collection (continued)', PAGE_WIDTH - PAGE_MARGIN, 40, { align: 'right' })

  drawDottedDivider(doc, PAGE_MARGIN, 50, CONTENT_WIDTH, COLOR_DIVIDER)

  return 72
}

function ensureRowSpace(doc, cursorY, neededHeight) {
  if (cursorY + neededHeight <= PAGE_HEIGHT - FOOTER_HEIGHT) {
    return cursorY
  }
  doc.addPage()
  return drawContinuationHeader(doc)
}

function computeStats(entries) {
  return {
    total: entries.length,
    watching: entries.filter((entry) => entry.status === 'Watching').length,
    completed: entries.filter((entry) => entry.status === 'Completed').length,
    wantToWatch: entries.filter((entry) => entry.status === 'Want to Watch').length,
    dropped: entries.filter((entry) => entry.status === 'Dropped').length,
    favourites: entries.filter((entry) => entry.favourite).length,
  }
}

function buildMetaText(entry) {
  const parts = [entry.status || 'Want to Watch']
  if (entry.category) parts.push(entry.category)
  return parts.join('  ·  ')
}

/** Measures a row's height and pre-computes wrapped title lines, so the
 * caller can decide whether it fits before drawing anything. */
function measureRow(doc, entry) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  const titleLines = doc.splitTextToSize(entry.title, LIST_TEXT_WIDTH)

  const titleHeight = titleLines.length * 14
  const metaHeight = 16
  const spacingAfter = 10

  return { height: titleHeight + metaHeight + spacingAfter, titleLines }
}

function drawRow(doc, entry, x, y, titleLines) {
  const markerCy = y - 3

  if (entry.favourite) {
    drawHeart(doc, x + 5, markerCy, 8, COLOR_PINK_DARK)
  } else {
    drawDot(doc, x + 5, markerCy, 2.2, COLOR_LAVENDER)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLOR_TEXT)
  doc.text(titleLines, LIST_TEXT_X, y)

  const metaY = y + titleLines.length * 14
  const metaText = buildMetaText(entry)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_TEXT_MUTED)
  doc.text(metaText, LIST_TEXT_X, metaY)

  if (entry.rating != null) {
    const metaWidth = doc.getTextWidth(metaText)
    drawRatingStars(doc, LIST_TEXT_X + metaWidth + 10, metaY, entry.rating)
  }

  const dividerY = metaY + 10
  drawDottedDivider(doc, LIST_TEXT_X, dividerY, LIST_TEXT_WIDTH, COLOR_DIVIDER)
}

/**
 * Builds and downloads a cute, list-style PDF of the given anime entries —
 * a personal collection journal rather than a formal report. Entries are
 * expected to already be the exact list/order the caller wants exported
 * (e.g. the user's currently filtered/sorted My Anime view). Cover images
 * are intentionally not included, keeping the page a fast, scannable list
 * rather than a catalogue, and sidestepping any cross-origin image issues.
 */
export async function exportCollectionToPdf({ entries, username, isFiltered }) {
  const stats = computeStats(entries)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  fillPageBackground(doc)
  drawCornerSparkles(doc)

  // --- Header -------------------------------------------------------
  const centerX = PAGE_WIDTH / 2
  let cursorY = 66

  doc.setFont('helvetica', 'bolditalic')
  doc.setFontSize(28)
  doc.setTextColor(...COLOR_PINK_DARK)
  doc.text('YourAnime', centerX, cursorY, { align: 'center' })

  cursorY += 20
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10.5)
  doc.setTextColor(...COLOR_TEXT_MUTED)
  const tagline = 'Your anime. Your journey. Your way.'
  doc.text(tagline, centerX, cursorY, { align: 'center' })
  const taglineWidth = doc.getTextWidth(tagline)
  drawHeart(doc, centerX + taglineWidth / 2 + 10, cursorY - 3, 7, COLOR_PINK_DARK)

  cursorY += 24
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...COLOR_TEXT)
  doc.text(username ? `${username}'s Anime Collection` : 'My Anime Collection', centerX, cursorY, {
    align: 'center',
  })

  cursorY += 16
  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_TEXT_MUTED)
  doc.text(
    isFiltered ? `Generated ${generatedOn} · showing your filtered view` : `Generated ${generatedOn}`,
    centerX,
    cursorY,
    { align: 'center' },
  )

  // --- Subtle summary line -------------------------------------------
  cursorY += 22
  const summaryText = [
    `${stats.total} anime`,
    `${stats.watching} watching`,
    `${stats.completed} completed`,
    `${stats.wantToWatch} want to watch`,
    `${stats.dropped} dropped`,
    `${stats.favourites} favourites`,
  ].join('  ·  ')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...COLOR_TEXT)
  const summaryLines = doc.splitTextToSize(summaryText, CONTENT_WIDTH)
  summaryLines.forEach((line) => {
    doc.text(line, centerX, cursorY, { align: 'center' })
    cursorY += 13
  })

  cursorY += 8
  drawMiniFlourish(doc, centerX, cursorY)
  cursorY += 22

  // --- Entries list ----------------------------------------------------
  if (entries.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10.5)
    doc.setTextColor(...COLOR_TEXT_MUTED)
    doc.text('No anime to show yet.', centerX, cursorY, { align: 'center' })
  } else {
    entries.forEach((entry) => {
      const { height, titleLines } = measureRow(doc, entry)
      cursorY = ensureRowSpace(doc, cursorY, height)
      drawRow(doc, entry, PAGE_MARGIN, cursorY, titleLines)
      cursorY += height
    })
  }

  // --- Footer / page numbers --------------------------------------------
  const totalPages = doc.internal.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    drawDot(doc, PAGE_WIDTH / 2 - 26, PAGE_HEIGHT - 22, 1.4, COLOR_PINK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_TEXT_MUTED)
    doc.text(`Page ${page} of ${totalPages}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 18, { align: 'center' })
    drawDot(doc, PAGE_WIDTH / 2 + 26, PAGE_HEIGHT - 22, 1.4, COLOR_PINK)
  }

  const filenameDate = new Date().toISOString().slice(0, 10)
  doc.save(`YourAnime-Collection-${filenameDate}.pdf`)
}
