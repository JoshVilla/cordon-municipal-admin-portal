"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ZoomIn, X } from "lucide-react"

interface ZoomableImageProps {
  src: string
  alt: string
  className?: string
}

export default function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const el = overlayRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setScale((s) => Math.min(Math.max(0.25, s - e.deltaY * 0.005), 8))
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }

  const handleClose = () => {
    setOpen(false)
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setDragging(false)
  }

  return (
    <>
      <div
        className={`relative group cursor-zoom-in ${className ?? ''}`}
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="text-white w-8 h-8" />
        </div>
      </div>

      {open && typeof window !== 'undefined' && createPortal(
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={src}
            alt={alt}
            draggable={false}
            onMouseDown={handleMouseDown}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: dragging ? 'none' : 'transform 0.08s ease-out',
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              userSelect: 'none',
            }}
          />

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40 pointer-events-none select-none">
            Scroll to zoom · Drag to pan · Esc to close
          </p>
        </div>,
        document.body
      )}
    </>
  )
}
