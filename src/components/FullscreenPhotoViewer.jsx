import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Pencil, ZoomIn, ZoomOut } from 'lucide-react'

const FullscreenPhotoViewer = ({ 
    isOpen, 
    onClose, 
    photoUrl, 
    userName, 
    onEditPhoto 
}) => {
    const [scale, setScale] = useState(1)
    const [isClosing, setIsClosing] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setScale(1)
            setIsClosing(false)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleClose = () => {
        setIsClosing(true)
        setTimeout(() => {
            onClose()
            setIsClosing(false)
        }, 200)
    }

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.5, 3))
    }

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.5, 1))
    }

    const handleEditClick = () => {
        handleClose()
        setTimeout(() => {
            onEditPhoto?.()
        }, 250)
    }

    if (!isOpen) return null

    // Use portal to render at document root, ensuring it's above all other content
    return createPortal(
        <div 
            className={`fixed inset-0 z-[9999] bg-black flex flex-col transition-opacity duration-200 ${
                isClosing ? 'opacity-0' : 'opacity-100'
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
                <button
                    onClick={handleClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-6 h-6 text-white" />
                </button>
                
                <span className="text-white font-medium text-lg">
                    {userName || 'Profile Photo'}
                </span>

                <button
                    onClick={handleEditClick}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Edit photo"
                >
                    <Pencil className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Photo Container */}
            <div 
                className="flex-1 flex items-center justify-center p-4 overflow-hidden"
                onClick={handleClose}
            >
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-full max-h-full"
                    style={{
                        transform: `scale(${scale})`,
                        transition: 'transform 0.2s ease-out'
                    }}
                >
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={userName || 'Profile'}
                            className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
                            draggable={false}
                        />
                    ) : (
                        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-8xl font-bold shadow-2xl">
                            {userName?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
                <button
                    onClick={handleZoomOut}
                    disabled={scale <= 1}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Zoom out"
                >
                    <ZoomOut className="w-6 h-6 text-white" />
                </button>
                
                <span className="text-white/70 text-sm min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                </span>
                
                <button
                    onClick={handleZoomIn}
                    disabled={scale >= 3}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Zoom in"
                >
                    <ZoomIn className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>,
        document.body
    )
}

export default FullscreenPhotoViewer
