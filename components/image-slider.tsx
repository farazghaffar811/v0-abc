"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ImageSliderProps {
  images: string[]
  className?: string
}

export function ImageSlider({ images, className = "" }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext()
    }, 3000) // Change slide every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [currentIndex, goToNext, images.length]) // Added goToNext to dependencies

  return (
    <div className={`relative w-full h-[200px] ${className}`}>
      <div className="absolute top-0 left-0 w-full h-full">
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Slide ${currentIndex + 1}`}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <button onClick={goToPrevious} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/50 rounded-full p-2">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/50 rounded-full p-2">
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}
