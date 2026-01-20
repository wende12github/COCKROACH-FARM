'use client';

import Header from '@/components/Header';
import EnvironmentMetrics from '@/components/Dashboard/EnvironmentMetrics';
import DeviceControls from '@/components/Dashboard/DeviceControls';
import { PopulationAnalytics } from '@/components/Dashboard/PopulationAnalytics';
import { WasteIntake } from '@/components/Dashboard/WasteTracking';
import Alerts from '@/components/Dashboard/Alerts';
import MonthlySummary from '@/components/Dashboard/MonthlySummary';
import { SensorAnalytics } from '@/components/Dashboard/SensorAnalytics';
import { SensorDataAnalytics } from '@/components/Dashboard/SensorDataAnalytics';

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 mb-8">
          <EnvironmentMetrics />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-1 mb-6">
          <DeviceControls />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* <SensorAnalytics /> */}
          <SensorDataAnalytics />
          <WasteIntake />
        </div>
        <div>
          <Alerts />
        </div>
        <div className='m-1'>
          <MonthlySummary />
        </div>
      </main>
    </div>
  );
}
