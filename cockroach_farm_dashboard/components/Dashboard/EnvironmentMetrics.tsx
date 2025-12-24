import { useFirebaseValue } from "@/lib/firebase";
import {
  Thermometer,
  Droplet,
  Cloud,
  Wind
} from "lucide-react";

/* TYPES */
interface MetricConfig {
  label: string;
  icon: React.ReactElement;
  value: number;
  unit: string;
  normalMax: number;
  warningMax: number;
}

/* COMPONENT */
export default function EnvironmentMetrics() {
  const temperature = useFirebaseValue<number>("sensor/temperature") ?? 28.5;
  const humidity = useFirebaseValue<number>("sensor/humidity") ?? 75;
  const co2 = useFirebaseValue<number>("sensor/co2") ?? 800;
  const ammonia = useFirebaseValue<number>("sensor/ammonia") ?? 15;

  const metrics: MetricConfig[] = [
    {
      label: "Temperature",
      icon: <Thermometer className="w-5 h-5" />,
      value: temperature,
      unit: "°C",
      normalMax: 30,
      warningMax: 35
    },
    {
      label: "Humidity",
      icon: <Droplet className="w-5 h-5" />,
      value: humidity,
      unit: "%",
      normalMax: 70,
      warningMax: 85
    },
    {
      label: "CO₂ Level",
      icon: <Cloud className="w-5 h-5" />,
      value: co2,
      unit: "ppm",
      normalMax: 1000,
      warningMax: 2000
    },
    {
      label: "Ammonia Level",
      icon: <Wind className="w-5 h-5" />,
      value: ammonia,
      unit: "ppm",
      normalMax: 10,
      warningMax: 25
    }
  ];

  const getStatus = (value: number, normal: number, warning: number) => {
    if (value <= normal)
      return { label: "Normal", color: "text-green-600", bg: "bg-green-100" };
    if (value <= warning)
      return { label: "Warning", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "Critical", color: "text-red-600", bg: "bg-red-100" };
  };

  return (
    <div className="col-span-1 md:col-span-3 lg:col-span-4">
      {/* Full-width card container */}
      <div className="bg-gry rounded-2xl shadow-lg p-6 md:p-1">
        <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-6">
          Environment Metrics
        </h2>

        {/* Responsive grid for the 4 metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2">
          {metrics.map((metric) => {
            const status = getStatus(
              metric.value,
              metric.normalMax,
              metric.warningMax
            );

            return (
              <div
                key={metric.label}
                className="
                  bg-gray-50
                  hover:scale-105
                  rounded-xl
                  p-5
                  flex
                  flex-col
                  sm:flex-row
                  lg:flex-col
                  xl:flex-row
                  items-center
                  gap-2
                  hover:shadow-md
                  transition-shadow
                  border border-gray-200
                "
              >
                {/* Icon + Value */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`
                      p-3 rounded-full ${status.bg} ${status.color}
                    `}
                  >
                    {metric.icon}
                  </div>
                  <div className="text-center sm:text-left lg:text-center xl:text-left">
                    <h3 className="text-sm font-semibold text-gray-500">
                      {metric.label}
                    </h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {metric.value} <span className="text-lg">{metric.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`
                    text-sm font-semibold px-3 py-1 rounded-full
                    ${status.color} ${status.bg}
                  `}
                >
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}