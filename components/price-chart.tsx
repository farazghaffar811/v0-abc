"use client"

import { useEffect, useRef, useState } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"
import "chartjs-adapter-date-fns"
import { enUS } from "date-fns/locale"

Chart.register(...registerables)

interface PriceChartProps {
  data: Array<{
    time: number
    value: number
  }>
  height?: number
}

export function PriceChart({ data, height = 300 }: PriceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [chartContainer, setChartContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (chartContainer && chartRef.current && data.length > 0) {
      const ctx = chartRef.current.getContext("2d")

      if (ctx) {
        const chartConfig: ChartConfiguration = {
          type: "line",
          data: {
            datasets: [
              {
                label: "Price",
                data: data.map((d) => ({ x: d.time, y: d.value })),
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
                fill: false,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "minute",
                  displayFormats: {
                    minute: "HH:mm:ss",
                  },
                },
                title: {
                  display: true,
                  text: "Time",
                },
                adapters: {
                  date: {
                    locale: enUS,
                  },
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Price (USDT)",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            animation: {
              duration: 0,
            },
          },
        }

        if (chartInstance.current) {
          chartInstance.current.data = chartConfig.data
          chartInstance.current.options = chartConfig.options
          chartInstance.current.update("none")
        } else {
          chartInstance.current = new Chart(ctx, chartConfig)
        }
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [data, chartContainer])

  return (
    <div ref={setChartContainer} style={{ height: `${height}px`, width: "100%" }}>
      {chartContainer && <canvas ref={chartRef} />}
    </div>
  )
}
