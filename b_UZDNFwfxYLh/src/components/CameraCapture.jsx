import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Camera, X } from "lucide-react"

export function CameraCapture({ label, name, required, onCapture, facingMode = "environment" }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [preview, setPreview] = useState("")
  const [active, setActive] = useState(false)

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } })
    streamRef.current = stream
    videoRef.current.srcObject = stream
    setActive(true)
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setActive(false)
  }

  const capture = () => {
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    const maxWidth = 960
    const scale = Math.min(1, maxWidth / video.videoWidth)
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      const file = new File([blob], `${name}-${Date.now()}.jpg`, { type: "image/jpeg" })
      setPreview(URL.createObjectURL(file))
      onCapture(name, file)
      stopCamera()
    }, "image/jpeg", 0.75)
  }

  useEffect(() => () => stopCamera(), [])

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{label}{required ? " *" : ""}</p>
          <p className="text-xs text-muted-foreground">Open camera and capture live image.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={active ? stopCamera : startCamera}>
          {active ? <X className="mr-1 h-4 w-4" /> : <Camera className="mr-1 h-4 w-4" />}
          {active ? "Close" : "Camera"}
        </Button>
      </div>
      <div className={`relative mt-3 overflow-hidden rounded-md bg-black ${active ? "block" : "hidden"}`}>
        <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
        <Button type="button" onClick={capture} className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary px-6 hover:bg-primary/90">
          Capture
        </Button>
      </div>
      {preview && <img src={preview} alt={label} className="mt-3 aspect-video w-full rounded-md object-cover" />}
    </div>
  )
}
