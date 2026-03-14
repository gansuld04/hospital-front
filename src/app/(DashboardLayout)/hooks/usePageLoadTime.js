'use client'
import { useEffect, useRef } from 'react'
import { usePathname }       from 'next/navigation'

// ─── usePageLoadTime ──────────────────────────────────────────────────────────
// Route өөрчлөгдөх бүрт хуудасны render time-г хэмжинэ
// Хэрэглээ: хэмжихийг хүссэн component дотроо дуудна
//
// function MyPage() {
//   usePageLoadTime('Dashboard')
//   return <div>...</div>
// }

export function usePageLoadTime(label) {
  const pathname  = usePathname()
  const startTime = useRef(performance.now())

  useEffect(() => {
    // Component mount болоход — render дууссан
    const duration = Math.round(performance.now() - startTime.current)
    const rating   = duration < 300 ? 'FAST' : duration < 1000 ? 'OK' : 'SLOW'
    const color    = rating === 'FAST' ? 'green' : rating === 'OK' ? 'orange' : 'red'

    console.log(
      `%c[PageLoad] ${label || pathname}: ${duration}ms — ${rating}`,
      `color: ${color}; font-weight: bold`
    )

    // Reset next navigation-д зориулж
    startTime.current = performance.now()
  }, [pathname, label])
}

// ─── useComponentRenderTime ───────────────────────────────────────────────────
// Нэг component render хийхэд хэдэн ms зарцуулж байгааг хэмжинэ
// Хэрэглээ:
// function HeavyComponent() {
//   useComponentRenderTime('HeavyComponent')
//   return <div>...</div>
// }

export function useComponentRenderTime(componentName) {
  const renderCount = useRef(0)
  const startTime   = useRef(performance.now())

  useEffect(() => {
    renderCount.current += 1
    const duration = Math.round(performance.now() - startTime.current)

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `%c[Render] ${componentName} #${renderCount.current}: ${duration}ms`,
        `color: ${duration > 100 ? 'red' : 'gray'}; font-size: 11px`
      )
    }

    startTime.current = performance.now()
  })
}