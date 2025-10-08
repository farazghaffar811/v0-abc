interface DataPoint {
  time: number
  value: number
}

interface SimpleChartProps {
  data: DataPoint[]
  width: number
  height: number
}

export function SimpleChart({ data, width, height }: SimpleChartProps) {
  if (data.length < 2) return <div>Not enough data to display chart</div>

  const margin = { top: 20, right: 20, bottom: 30, left: 50 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const xScale = (i: number) => (i / (data.length - 1)) * chartWidth
  const yScale = (value: number) => {
    const [min, max] = [Math.min(...data.map((d) => d.value)), Math.max(...data.map((d) => d.value))]
    return chartHeight - ((value - min) / (max - min)) * chartHeight
  }

  const line = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(" ")

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        <path d={`M ${line}`} fill="none" stroke="rgb(75, 192, 192)" strokeWidth="2" />
      </g>
    </svg>
  )
}
