import { FileText } from "lucide-react"

export function NoData() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-gray-400">
      <FileText className="h-12 w-12 mb-2" />
      <p>No data available</p>
    </div>
  )
}
