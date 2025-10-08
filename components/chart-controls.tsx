"use client"

import { Button } from "@/components/ui/button"
import { BarChart2, ChevronDown, Maximize2, Settings } from "lucide-react"

interface ChartControlsProps {
  selectedInterval: string
  onIntervalChange: (interval: string) => void
  onToggleIndicators: () => void
}

export function ChartControls({ selectedInterval, onIntervalChange, onToggleIndicators }: ChartControlsProps) {
  const intervals = ["1m", "30m", "1h", "D"]

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {intervals.map((interval) => (
          <Button
            key={interval}
            variant="ghost"
            size="sm"
            className={`px-3 rounded-none text-gray-600 hover:text-gray-900 ${
              selectedInterval === interval ? "text-blue-600 border-b-2 border-blue-600" : ""
            }`}
            onClick={() => onIntervalChange(interval)}
          >
            {interval}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="px-3 text-gray-600 hover:text-gray-900">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="sm" onClick={onToggleIndicators} className="text-gray-600 hover:text-gray-900">
          <BarChart2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
