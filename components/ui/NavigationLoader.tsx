'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Loader from './Loader'

export default function NavigationLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  // Hide when navigation completes
  useEffect(() => {
    setLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href) return
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (anchor.getAttribute('target') === '_blank') return
      // Only internal navigation
      if (href.startsWith('/') || (!href.startsWith('http') && !href.startsWith('//'))) {
        setLoading(true)
      }
    }

    const handlePopState = () => setLoading(true)

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (!loading) return null
  return <Loader fullscreen />
}
