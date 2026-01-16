'use client'

import { PopulationAnalytics } from "@/components/Dashboard/PopulationAnalytics";

export default function PopulationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Environmental Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor temperature and humidity trends for optimal farming conditions
        </p>
      </div>
      <PopulationAnalytics />
    </div>
  )
}
