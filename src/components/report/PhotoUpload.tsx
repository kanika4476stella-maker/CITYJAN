"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Image as ImageIcon, CheckCircle } from "lucide-react";
import Image from "next/image";

interface PhotoUploadProps {
  value: string | null;           // base64 or Storage URL
  onChange: (dataUrl: string | null) => void;
  maxSizeMb?: number;
}

export default function PhotoUpload({
  value,
  onChange,
  maxSizeMb = 5,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/jpg") {
        setError("Please select an image file (JPG, PNG).");
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File too large. Max size is ${maxSizeMb}MB.`);
        return;
      }

      setCompressing(true);
      try {
        const dataUrl = await compressImage(file, 1200, 0.82);
        onChange(dataUrl);
      } catch {
        setError("Failed to process image. Please try another file.");
      } finally {
        setCompressing(false);
      }
    },
    [onChange, maxSizeMb]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg, image/png, image/jpg"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="photo-upload-input"
      />

      <AnimatePresence mode="wait">
        {value ? (
          /* ── Preview ─────────────────────────────────────────────── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-2xl overflow-hidden border border-green-200 shadow-sm group"
          >
            <div className="relative w-full h-52">
              <Image
                src={value}
                alt="Report photo"
                fill
                className="object-cover"
                unoptimized // base64 images can't be optimized by Next
              />
            </div>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors"
              >
                <Camera className="w-4 h-4" /> Change
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" /> Remove
              </button>
            </div>

            {/* Success badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-green-600 text-xs font-semibold px-2.5 py-1.5 rounded-full shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              Photo added
            </div>
          </motion.div>
        ) : (
          /* ── Drop zone ───────────────────────────────────────────── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragging(false)}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
              dragging
                ? "border-accent bg-accent/8 scale-[1.01]"
                : "border-primary/20 bg-background hover:border-accent/40 hover:bg-accent/4"
            }`}
          >
            {compressing ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin border-[3px]" />
                <p className="text-sm text-primary/50">Compressing image…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-4 px-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    dragging ? "bg-accent/15" : "bg-primary/6"
                  }`}
                >
                  {dragging ? (
                    <Upload className="w-7 h-7 text-accent" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-primary/30" />
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-primary/70">
                    {dragging ? "Release to upload" : "Drag & drop a photo here"}
                  </p>
                  <p className="text-xs text-primary/40 mt-0.5">or choose an option below</p>
                </div>

                <div className="flex gap-2 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      // Camera capture
                      if (inputRef.current) {
                        inputRef.current.setAttribute("capture", "environment");
                        inputRef.current.click();
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary/8 hover:bg-primary/14 text-primary/70 font-medium text-sm py-2.5 rounded-xl transition-colors"
                  >
                    <Camera className="w-4 h-4" /> Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.removeAttribute("capture");
                        inputRef.current.click();
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary/8 hover:bg-primary/14 text-primary/70 font-medium text-sm py-2.5 rounded-xl transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Gallery
                  </button>
                </div>
                <p className="text-xs text-primary/25">Max {maxSizeMb}MB · JPG, PNG</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/** Compress an image to a max width maintaining aspect ratio */
async function compressImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
