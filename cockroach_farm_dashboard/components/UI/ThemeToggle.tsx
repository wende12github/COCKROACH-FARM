'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const cycleTheme = () => {
    console.log('Current theme:', theme)
    if (theme === 'light') {
      setTheme('dark')
      console.log('Setting to dark')
    } else if (theme === 'dark') {
      setTheme('system')
      console.log('Setting to system')
    } else {
      setTheme('light')
      console.log('Setting to light')
    }
  }

  const getIcon = () => {
    if (theme === 'light') return <Sun size={20} />
    if (theme === 'dark') return <Moon size={20} />
    return <Monitor size={20} />
  }

  return (
    <button
      onClick={cycleTheme}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white rounded-full shadow-xl border-2 border-white dark:border-gray-700 flex items-center justify-center hover:scale-110 transition-all duration-200 hover:shadow-2xl"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </button>
  )
}