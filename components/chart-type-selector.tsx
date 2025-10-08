"use client"

import { Button } from "@/components/ui/button"
import { BarChart, CandlestickChart, LineChart, TrendingUp } from "lucide-react"

interface ChartTypeSelectorProps {
  selectedType: "line" | "candle" | "bar" | "area"
  onTypeChange: (type: "line" | "candle" | "bar" | "area") => void
}

export function ChartTypeSelector({ selectedType, onTypeChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`text-gray-400 ${selectedType === "line" ? "bg-gray-700" : ""}`}
        onClick={() => onTypeChange("line")}
      >
        <TrendingUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`text-gray-400 ${selectedType === "candle" ? "bg-gray-700" : ""}`}
        onClick={() => onTypeChange("candle")}
      >
        <CandlestickChart className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`text-gray-400 ${selectedType === "bar" ? "bg-gray-700" : ""}`}
        onClick={() => onTypeChange("bar")}
      >
        <BarChart className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`text-gray-400 ${selectedType === "area" ? "bg-gray-700" : ""}`}
        onClick={() => onTypeChange("area")}
      >
        <LineChart className="h-4 w-4" />
      </Button>
    </div>
  )
}
