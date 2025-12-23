import { useFirebaseValue } from "@/lib/firebase";
import {
  Thermometer,
  Droplet,
  Cloud,
  Wind
} from "lucide-react";
import { JSX } from "react/jsx-runtime";


/* TYPES */

interface MetricConfig {
  label: string;
  icon: JSX.Element;
  value: number;
  unit: string;
  normalMax: number;
  warningMax: number;
}

/* COMPONENT */

export default function EnvironmentMetrics() {
  const temperature =
    useFirebaseValue<number>("sensor/temperature") ?? 28.5;

  const humidity =
    useFirebaseValue<number>("sensor/humidity") ?? 75;

  const co2 =
    useFirebaseValue<number>("sensor/co2") ?? 800;

  const ammonia =
    useFirebaseValue<number>("sensor/ammonia") ?? 15;

  const metrics: MetricConfig[] = [
    {
      label: "Temperature",
      icon: <Thermometer className="w-5 h-5"/>,
      value: temperature,
      unit: "°C",
      normalMax: 30,
      warningMax: 35
    },
    {
      label: "Humidity",
      icon: <Droplet />,
      value: humidity,
      unit: "%",
      normalMax: 70,
      warningMax: 85
    },
    {
      label: "CO₂ Level",
      icon: <Cloud />,
      value: co2,
      unit: "ppm",
      normalMax: 1000,
      warningMax: 2000
    },
    {
      label: "Ammonia Level",
      icon: <Wind />,
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
    <div >
      <h2 className="text-2xl text-nowrap font-bold text-green-600">Environment Metrics</h2>
      <div className="flex">

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
              bg-white
              rounded-xl
              shadow-md
              p-5
              m-2
              space-x-5
              flex
              flex-grow
              items-center
              hover:shadow-lg
              transition-shadow
            "
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div
                className={`
                  p-3
                  rounded-full
                  ${status.bg}
                  ${status.color}
                `}
              >
                {metric.icon}
              </div>

              <div className="text-nowrap">
                <h3 className="text-sm text-gray-500 font-semibold ">
                  {metric.label}
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  {metric.value} {metric.unit}
                </p>
              </div>
            </div>

            {/* STATUS */}
            <span
              className={`
                text-sm
                font-semibold
                ${status.color}
              `}
            >
              {status.label}
            </span>
          </div>
        );
      })}
      
      </div>
    </div>
  );
}
