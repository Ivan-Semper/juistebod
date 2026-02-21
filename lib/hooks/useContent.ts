import { useState, useEffect, useCallback } from 'react'

export function useContent() {
  const [contentMap, setContentMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success) setContentMap(data.data)
      })
      .catch(() => {})
  }, [])

  const c = useCallback(
    (key: string, fallback: string): string => {
      return contentMap[key] ?? fallback
    },
    [contentMap]
  )

  return c
}
