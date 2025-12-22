'use client'

import Chambers from '@/components/chambers/Chambers'

export default function ChambersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-500 tracking-tight">Chamber Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and control all rearing chambers
        </p>
      </div>
      <Chambers />
    </div>
  )
}
