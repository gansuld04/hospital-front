'use client'
import { useReportWebVitals } from 'next/web-vitals'

// Metric-ийн утгын үнэлгээ
const getRating = (name, value) => {
  const thresholds = {
    LCP:  { good: 2500,  poor: 4000  },  // Largest Contentful Paint (ms)
    FID:  { good: 100,   poor: 300   },  // First Input Delay (ms)
    CLS:  { good: 0.1,   poor: 0.25  },  // Cumulative Layout Shift (score)
    FCP:  { good: 1800,  poor: 3000  },  // First Contentful Paint (ms)
    TTFB: { good: 800,   poor: 1800  },  // Time to First Byte (ms)
    INP:  { good: 200,   poor: 500   },  // Interaction to Next Paint (ms)
  }
  const t = thresholds[name]
  if (!t) return 'unknown'
  if (value <= t.good) return 'good'
  if (value <= t.poor) return 'needs-improvement'
  return 'poor'
}

const COLORS = {
  good:               '\x1b[32m',  // green
  'needs-improvement':'\x1b[33m',  // yellow
  poor:               '\x1b[31m',  // red
  reset:              '\x1b[0m',
}

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const rating = getRating(metric.name, metric.value)
    const unit   = metric.name === 'CLS' ? '' : 'ms'
    const val    = metric.name === 'CLS'
      ? metric.value.toFixed(4)
      : Math.round(metric.value)

    // Console-д өнгөтэй гаргана
    const color = COLORS[rating] || ''
    console.log(
      `%c[Web Vitals] ${metric.name}: ${val}${unit} — ${rating.toUpperCase()}`,
      `color: ${rating === 'good' ? 'green' : rating === 'poor' ? 'red' : 'orange'}; font-weight: bold`
    )

    // Сервер рүү илгээх (optional)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      navigator.sendBeacon(
        process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
        JSON.stringify({
          name:   metric.name,
          value:  metric.value,
          rating,
          id:     metric.id,
          page:   window.location.pathname,
          ts:     Date.now(),
        })
      )
    }
  })

  return null  // UI render хийхгүй
}