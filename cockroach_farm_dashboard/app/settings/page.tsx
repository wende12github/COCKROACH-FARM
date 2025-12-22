'use client'

import Settings from '@/components/settings/page'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-green-500 font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your cockroach farm dashboard
        </p>
      </div>
      <Settings />
    </div>
  )
}
