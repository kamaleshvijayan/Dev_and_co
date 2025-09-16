import { useRef, useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'

type Detection = {
  id: string
  filename: string
  severity: 'No Crack' | 'Minor' | 'Medium' | 'Severe' | 'Critical'
  zone: string
  timestamp: string
  confidence?: number
  mlModel?: string
}

type MLModelConfig = {
  endpoint: string
  apiKey?: string
  modelName: string
  isActive: boolean
}

type Props = { onLogout: () => void }

const severities: Detection['severity'][] = ['No Crack', 'Minor', 'Medium', 'Severe', 'Critical']
const zones = ['North', 'South', 'East', 'West', 'Central']

export default function DroneModule({ onLogout }: Props) {
  const [images, setImages] = useState<string[]>([])
  const [activities, setActivities] = useState<Detection[]>([])
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [mlConfig, setMlConfig] = useState<MLModelConfig>({
    endpoint: 'http://localhost:8000/api/analyze',
    modelName: 'Crack Detection Model v1.0',
    isActive: false
  })

  const fileRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const addActivity = (filename: string, mlResult?: { severity: Detection['severity'], confidence: number, modelName: string }) => {
    const severity = mlResult?.severity || severities[Math.floor(Math.random() * severities.length)]
    const zone = zones[Math.floor(Math.random() * zones.length)] + `-${Math.floor(Math.random()*5)+1}`
    const timestamp = new Date().toLocaleString()
    const id = crypto.randomUUID()
    const d: Detection = { 
      id, 
      filename, 
      severity, 
      zone, 
      timestamp,
      confidence: mlResult?.confidence,
      mlModel: mlResult?.modelName
    }
    setActivities((a) => [d, ...a])
  }

  // Get available cameras
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(videoDevices)
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId)
      }
    } catch (error) {
      console.error('Error getting cameras:', error)
    }
  }

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null)
      
      // Get available cameras first
      await getAvailableCameras()
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280, min: 640 }, 
          height: { ideal: 720, min: 480 },
          facingMode: selectedCamera ? undefined : { ideal: 'environment' },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setCameraStream(stream)
      setIsCameraActive(true)
      
      // Ensure video element is properly set up
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        
        // Add event listeners to ensure video loads
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
        }
        videoRef.current.oncanplay = () => {
          console.log('Video can play')
        }
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e)
          setCameraError('Video playback error')
        }
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error)
      setCameraError(error.message)
      
      // Try fallback without specific device
      if (selectedCamera) {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          })
          setCameraStream(fallbackStream)
          setIsCameraActive(true)
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream
            await videoRef.current.play()
          }
          setCameraError(null)
        } catch (fallbackError) {
          console.error('Fallback camera error:', fallbackError)
        }
      }
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
      setIsCameraActive(false)
    }
  }

  // ML Model Integration
  const analyzeImageWithML = async (imageData: string): Promise<{ severity: Detection['severity'], confidence: number, modelName: string } | null> => {
    if (!mlConfig.isActive || !mlConfig.endpoint) {
      return null
    }

    try {
      setIsAnalyzing(true)
      
      // Convert base64 to blob
      const response = await fetch(imageData)
      const blob = await response.blob()
      
      const formData = new FormData()
      formData.append('image', blob, 'camera_capture.jpg')
      
      const mlResponse = await fetch(mlConfig.endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          ...(mlConfig.apiKey && { 'Authorization': `Bearer ${mlConfig.apiKey}` })
        }
      })

      if (!mlResponse.ok) {
        throw new Error(`ML API error: ${mlResponse.status}`)
      }

      const result = await mlResponse.json()
      
      // Map ML model output to our severity levels
      const severityMap: Record<string, Detection['severity']> = {
        'no_crack': 'No Crack',
        'minor': 'Minor',
        'medium': 'Medium',
        'severe': 'Severe',
        'critical': 'Critical'
      }

      return {
        severity: severityMap[result.severity] || 'No Crack',
        confidence: result.confidence || 0.85,
        modelName: mlConfig.modelName
      }
    } catch (error) {
      console.error('ML Analysis error:', error)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0)
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // Add to images
    setImages(prev => [imageData, ...prev])
    
    // Analyze with ML model
    const mlResult = await analyzeImageWithML(imageData)
    
    // Add to activity log
    addActivity(`Camera Capture ${new Date().toLocaleTimeString()}`, mlResult)
  }

  // Load available cameras on mount
  useEffect(() => {
    getAvailableCameras()
  }, [])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.isArray(files) ? files : Array.from(files)
    if (list.length === 0) return
    const previews: string[] = []
    for (const f of list) {
      previews.push(URL.createObjectURL(f))
      addActivity((f as File).name || 'image')
    }
    setImages((prev) => [...previews, ...prev])
    fileRef.current && (fileRef.current.value = '')
  }

  // Drag and drop
  const [dragOver, setDragOver] = useState(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const badgeTone = (s: Detection['severity']) => s === 'No Crack' ? 'ok' : s === 'Minor' || s === 'Medium' ? 'warn' : 'crit' as const

  // Lightbox state

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🚁 Drone Image Detect</h1>
            <p className="subtle">Live camera feed and ML-powered crack detection</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[340px,1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader title="ML Model Config" subtitle="Connect your model" />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs subtle mb-1">API Endpoint</label>
                  <input 
                    value={mlConfig.endpoint} 
                    onChange={(e) => setMlConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="http://localhost:8000/api/analyze"
                    className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs subtle mb-1">API Key (optional)</label>
                  <input 
                    value={mlConfig.apiKey || ''} 
                    onChange={(e) => setMlConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Your API key"
                    className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable ML Analysis</span>
                  <button
                    onClick={() => setMlConfig(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      mlConfig.isActive ? 'bg-indigo-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      mlConfig.isActive ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-sm text-indigo-400">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    Analyzing with ML model...
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Activity" subtitle="Latest detections" />
              <ul className="space-y-2 max-h-[360px] overflow-auto pr-2">
                {activities.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white/90">{a.filename}</p>
                      <p className="text-xs subtle">{a.zone} • {a.timestamp}</p>
                      {a.confidence && (
                        <p className="text-xs text-indigo-400">Confidence: {(a.confidence * 100).toFixed(1)}%</p>
                      )}
                      {a.mlModel && (
                        <p className="text-xs text-green-400">ML: {a.mlModel}</p>
                      )}
                    </div>
                    <Badge tone={badgeTone(a.severity)}>{a.severity}</Badge>
                  </li>
                ))}
                {activities.length === 0 && <p className="subtle text-sm">No detections yet</p>}
              </ul>
            </Card>

          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader title="Live Camera Feed" subtitle="Real-time crack detection" />
              <div className="space-y-4">
                {!isCameraActive ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-white/70 mb-4">Start drone camera to begin live analysis</p>
                    
                    {availableCameras.length > 1 && (
                      <div className="mb-4">
                        <label className="block text-sm text-white/70 mb-2">Select Camera:</label>
                        <select
                          value={selectedCamera}
                          onChange={(e) => setSelectedCamera(e.target.value)}
                          className="w-full max-w-xs mx-auto rounded bg-slate-700 border border-slate-600 px-3 py-2 text-white text-sm"
                        >
                          {availableCameras.map((camera) => (
                            <option key={camera.deviceId} value={camera.deviceId}>
                              {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {cameraError && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">Camera Error: {cameraError}</p>
                        <p className="text-red-300 text-xs mt-1">Please check camera permissions and try again</p>
                      </div>
                    )}
                    
                    <Button onClick={startCamera} className="bg-indigo-600 hover:bg-indigo-700">
                      🚁 Start Drone Camera
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        controls={false}
                        className="w-full h-64 bg-black rounded-lg object-cover"
                        style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={captureAndAnalyze}
                          disabled={isAnalyzing}
                          className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-full transition-colors"
                          title="Capture & Analyze"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </button>
                        <button
                          onClick={stopCamera}
                          className="p-2 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
                          title="Stop Camera"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        🔴 LIVE
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={captureAndAnalyze} 
                        disabled={isAnalyzing}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Capture & Analyze'}
                      </Button>
                      <Button 
                        onClick={stopCamera}
                        variant="ghost"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Stop Camera
                      </Button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </Card>

            <Card>
              <CardHeader title="Previews" subtitle="Recent uploads" />
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((src, i) => (
                  <button key={i} onClick={()=>setLightboxSrc(src)} className="relative overflow-hidden rounded-xl border border-white/10 focus:outline-indigo-500">
                    <img src={src} className="w-full h-40 object-cover" />
                  </button>
                ))}
                {images.length === 0 && <p className="subtle text-sm">No images yet</p>}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {lightboxSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-6" onClick={()=>setLightboxSrc(null)}>
          <img src={lightboxSrc} className="max-h-[85vh] max-w-[90vw] rounded-xl border border-white/20" />
        </div>
      )}
    </Layout>
  )
}
