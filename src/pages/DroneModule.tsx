import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader } from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

type Detection = {
  id: string;
  filename: string;
  severity: 'No Crack' | 'Minor' | 'Medium' | 'Severe' | 'Critical';
  zone: string;
  timestamp: string;
  confidence?: number;
  mlModel?: string;
};

const severities: Detection['severity'][] = ['No Crack', 'Minor', 'Medium', 'Severe', 'Critical'];
const zones = ['North', 'South', 'East', 'West', 'Central'];
const BACKEND_URL = 'http://127.0.0.1:5000'; // The URL of your Flask backend

export default function DroneModule() {
  const [detectedImages, setDetectedImages] = useState<string[]>([]);
  const [activities, setActivities] = useState<Detection[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);


  // Function to start the camera on the backend
  const startCamera = async () => {
    try {
      setCameraError(null);
      const response = await fetch(`${BACKEND_URL}/start_camera`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to start camera on the backend.');
      }
      setIsCameraActive(true);
      console.log('Camera started');
    } catch (error: any) {
      console.error('Error starting camera:', error);
      setCameraError(error.message);
    }
  };

  // Function to stop the camera on the backend
  const stopCamera = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/stop_camera`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to stop camera on the backend.');
      }
      setIsCameraActive(false);
      console.log('Camera stopped');
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  };

  // Function to fetch detected images from the backend
  const fetchDetectedImages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/detected_images`);
      if (!response.ok) {
        throw new Error('Failed to fetch detected images.');
      }
      const images = await response.json();
      setDetectedImages(images);
    } catch (error) {
      console.error('Error fetching detected images:', error);
    }
  };

  // Add new detections to Activity log when detectedImages changes
  useEffect(() => {
    setActivities((prev) => {  
      const known = new Set(prev.map((a) => a.filename));
      const newDetections = detectedImages.filter((img) => !known.has(img)).map((img) => {
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const zone = zones[Math.floor(Math.random() * zones.length)] + `-${Math.floor(Math.random() * 5) + 1}`;
        const timestamp = new Date().toLocaleString();
        const id = crypto.randomUUID();
        return { id, filename: img, severity, zone, timestamp };
      });
      return [...newDetections, ...prev];
    });
  }, [detectedImages]);

  // Always fetch detected images periodically
  useEffect(() => {
    fetchDetectedImages(); // Fetch immediately
    const intervalId = setInterval(fetchDetectedImages, 5000); // Fetch every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (isCameraActive) {
        stopCamera();
      }
    };
  }, []);

  const badgeTone = (s: Detection['severity']) => (s === 'No Crack' ? 'ok' : s === 'Minor' || s === 'Medium' ? 'warn' : 'crit' as const);

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Drone Camera Detect</h1>
            <p className="subtle">Live camera feed and ML-powered crack detection</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[340px,1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader title="Activity" subtitle="Latest detections" />
              <ul className="space-y-2 max-h-[360px] overflow-auto pr-2">
                {activities.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white/90">{a.filename}</p>
                      <p className="text-xs subtle">{a.zone} • {a.timestamp}</p>
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
                    {/* ... (UI for starting camera) ... */}
                    <Button onClick={startCamera} className="bg-indigo-600 hover:bg-indigo-700">
                     Start Drone Camera
                    </Button>
                    {cameraError && (
                      <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">Camera Error: {cameraError}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      {/* This img tag will display the video stream from the backend */}
                      <img
                        src={`${BACKEND_URL}/video_feed`}
                        alt="Live Feed"
                        className="w-full h-auto bg-black rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
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
                    </div>
                    <Button
                      onClick={stopCamera}
                      variant="ghost"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Stop Camera
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Latest Detections" subtitle="Images with detected cracks" />
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {detectedImages.map((imageName, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxSrc(`${BACKEND_URL}/detected_cracks/${imageName}`)}
                    className="relative overflow-hidden rounded-xl border border-white/10 focus:outline-indigo-500"
                  >
                    <img
                      src={`${BACKEND_URL}/detected_cracks/${imageName}`}
                      className="w-full h-40 object-cover"
                      alt={`Detected Crack ${i + 1}`}
                    />
                  </button>
                ))}
                {detectedImages.length === 0 && <p className="subtle text-sm">No detected images yet</p>}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-6"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} className="max-h-[85vh] max-w-[90vw] rounded-xl border border-white/20" alt="Lightbox" />
        </div>
      )}
    </Layout>
  );
}