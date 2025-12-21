'use client'

import ReportsPage from '@/components/reports/ReportsPage'

export default function ReportsPageRoute() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-green-500 font-bold tracking-tight">Reports & Logs</h1>
        <p className="text-muted-foreground mt-2">
          Generate and view comprehensive farm reports and activity logs
        </p>
      </div>
      <ReportsPage />
    </div>
  )
}
