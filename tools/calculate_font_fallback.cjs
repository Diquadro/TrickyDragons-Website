// npm install --save-dev @capsizecss/metrics
// tools/calculate_font_fallback.cjs
// Script semplice per calcolare i valori di fallback font

const fontMetrics = require(`@capsizecss/metrics/asap`)
const fallbackFontMetrics = require(`@capsizecss/metrics/arial`)

const mainFontAvgWidth = fontMetrics.xWidthAvg / fontMetrics.unitsPerEm
const fallbackFontAvgWidth = fallbackFontMetrics.xWidthAvg / fallbackFontMetrics.unitsPerEm

let sizeAdjust = mainFontAvgWidth / fallbackFontAvgWidth
let ascentOverride = (fontMetrics.ascent / fontMetrics.unitsPerEm) * sizeAdjust
let descentOverride = Math.abs(fontMetrics.descent / fontMetrics.unitsPerEm) * sizeAdjust
let lineGapOverride = (fontMetrics.lineGap / fontMetrics.unitsPerEm) * sizeAdjust

console.log('\n📊 Font Fallback Metrics Calculator')
console.log('=====================================\n')
console.log(`Main Font: ${fontMetrics.familyName}`)
console.log(`Fallback: Arial\n`)
console.log('Calculated Values:')
console.log(`  size-adjust: ${(sizeAdjust * 100).toFixed(2)}%`)
console.log(`  ascent-override: ${(ascentOverride * 100).toFixed(2)}%`)
console.log(`  descent-override: ${(descentOverride * 100).toFixed(2)}%`)
console.log(`  line-gap-override: ${(lineGapOverride * 100).toFixed(2)}%`)

console.log('\n@font-face CSS:')
console.log(`@font-face {
    font-family: '${fontMetrics.familyName} Fallback';
    src: local('Arial');
    size-adjust: ${(sizeAdjust * 100).toFixed(2)}%;
    ascent-override: ${(ascentOverride * 100).toFixed(2)}%;
    descent-override: ${(descentOverride * 100).toFixed(2)}%;
    line-gap-override: ${(lineGapOverride * 100).toFixed(2)}%;
}\n`)
