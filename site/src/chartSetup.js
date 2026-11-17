import {
  BarElement, CategoryScale, Chart, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip,
} from 'chart.js'

Chart.register(BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip)

Chart.defaults.color = '#868f97'
Chart.defaults.font.family = '"Inter Variable", Inter, system-ui, sans-serif'
Chart.defaults.font.size = 11
Chart.defaults.borderColor = '#262626'
Chart.defaults.animation.duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700
Chart.defaults.plugins.legend.display = false // custom chips / labels instead
const tt = Chart.defaults.plugins.tooltip
tt.backgroundColor = '#191919'; tt.borderColor = '#525252'; tt.borderWidth = 1
tt.titleColor = '#ffffff'; tt.bodyColor = '#cccccc'; tt.padding = 12; tt.cornerRadius = 10
tt.boxPadding = 6; tt.usePointStyle = true; tt.titleFont = { weight: '600' }

// Thin crosshair on line charts while hovering.
const crosshair = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const a = chart.tooltip?.getActiveElements?.()
    if (chart.config.type !== 'line' || !a || !a.length) return
    const x = a[0].element.x, { top, bottom } = chart.chartArea, ctx = chart.ctx
    ctx.save(); ctx.strokeStyle = '#525252'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); ctx.restore()
  },
}

// Dashed vertical marker at a category label (the 5 Nov CBN effective date).
const eventMarker = {
  id: 'eventMarker',
  afterDatasetsDraw(chart, _args, opts) {
    if (!opts || !opts.label) return
    const idx = chart.data.labels.indexOf(opts.label)
    if (idx < 0) return
    const px = chart.scales.x.getPixelForValue(idx), { top, bottom } = chart.chartArea, ctx = chart.ctx
    ctx.save(); ctx.strokeStyle = '#868f97'; ctx.setLineDash([3, 4]); ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = '#cccccc'; ctx.font = '500 11px "Inter Variable", Inter, sans-serif'
    ctx.fillText(opts.text || '', px + 6, top + 11); ctx.restore()
  },
}
Chart.register(crosshair, eventMarker)
