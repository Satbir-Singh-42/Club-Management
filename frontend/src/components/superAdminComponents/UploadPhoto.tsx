import React, { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UploadPhotoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File) => void
}

export function UploadPhoto({ open, onOpenChange, onUpload }: UploadPhotoProps) {
  const [dragActive, setDragActive] = useState(false)

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0])
      onOpenChange(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Profile Photo</DialogTitle>
        </DialogHeader>
        <div
          className={`relative grid h-40 w-full place-items-center rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
            dragActive ? "border-primary bg-secondary/20" : "border-border"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="grid place-items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop your photo here, or click to select
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

