import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import API from '../services/api';

export default function PunchIn() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let activeStream = null;

    const loadModelsAndCamera = async () => {
      try {
        setErrorMessage(null);
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);

        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        activeStream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setErrorMessage("Camera initialization failed: " + err.message);
      }
    };

    loadModelsAndCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getCoordinates = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported."));
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(new Error("GPS location required for kiosk verification.")),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      }
    });
  };

  const handleAutoPunch = async () => {
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      if (!videoRef.current) throw new Error("Camera stream not ready.");

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error("No face detected. Please position your face inside the frame.");
      }

      const liveDescriptor = Array.from(detection.descriptor);
      const coords = await getCoordinates();

      const payload = {
        liveFaceDescriptor: liveDescriptor,
        userLat: Number(coords.lat),
        userLng: Number(coords.lng),
        clientDeviceId: localStorage.getItem('shiftSync_deviceId') || 'kiosk-device'
      };

      const response = await API.post('/api/attendance/auto-punch-in', payload);
      setStatusMessage(response.data.message);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 my-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Automatic Kiosk Punch-In</h2>
        <p className="text-sm text-gray-500 mt-1">Look at the camera — no login or email required</p>
      </div>

      <div className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden shadow-inner mb-6 flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100"
        />
        <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-full m-8 pointer-events-none flex items-center justify-center">
          <span className="text-white text-xs bg-slate-900/80 px-3 py-1 rounded-full">
            {modelsLoaded ? "Align Face" : "Loading AI..."}
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200">
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleAutoPunch}
        disabled={loading || !modelsLoaded}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl shadow-md transition-colors text-base"
      >
        {loading ? 'Recognizing Face & GPS...' : 'Scan & Punch In'}
      </button>
    </div>
  );
}