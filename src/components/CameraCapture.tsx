import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, StopCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  isAnalyzing: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Please check permissions.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(base64);
      }
    }
  }, [onCapture]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {!isActive ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-slate-400">
          <Camera size={48} className="opacity-20" />
          <button
            onClick={startCamera}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-all transform hover:scale-105 active:scale-95"
          >
            Start Monitoring
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4">
            <button
              onClick={captureFrame}
              disabled={isAnalyzing}
              className={cn(
                "p-4 rounded-full shadow-lg transition-all transform active:scale-90",
                isAnalyzing ? "bg-slate-700 cursor-not-allowed" : "bg-white hover:bg-indigo-50 text-indigo-600"
              )}
            >
              {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Camera size={24} />}
            </button>
            <button
              onClick={stopCamera}
              className="p-4 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-full backdrop-blur-md transition-all"
            >
              <StopCircle size={24} />
            </button>
          </div>

          {isAnalyzing && (
            <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[2px] flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-white font-medium text-sm drop-shadow-md">Analyzing Attention...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
