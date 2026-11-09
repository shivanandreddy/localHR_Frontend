import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import API from '../services/api';
import { Webhook } from 'lucide-react';

export default function Punch() {
  const videoRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // 'in' or 'out'
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

  const handleKioskAction = async (actionType) => {
    setLoadingAction(actionType);
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

      const endpoint = actionType === 'in' ? '/api/attendance/auto-punch-in' : '/api/attendance/auto-punch-out';
      const response = await API.post(endpoint, payload);
      
      setStatusMessage(response.data.message);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-800 p-6 my-6 transition-colors">
      
      {/* Header Section with Icon & Title */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center justify-center p-3   rounded-2xl text-blue-600 dark:text-blue-400 mb-1">
          <Webhook size={40} strokeWidth={2.5} className='animate-spin' />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">LocalHR Attendance</h2>
        <p className="text-md sm:text-sm text-blue-500 dark:text-blue-400">
          Position your face in the frame and select your action
        </p>
      </div>

      {/* Camera Preview Frame */}
      <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden shadow-inner mb-6 flex items-center justify-center border border-slate-800">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100"
        />
        <div className="absolute inset-0 border-4 border-dashed border-blue-400/70 rounded-full m-8 pointer-events-none flex items-center justify-center">
          <span className="text-white text-xs bg-slate-900/90 px-3 py-1.5 rounded-full font-medium shadow">
            {modelsLoaded ? "Align Face in Frame" : "Loading AI Models..."}
          </span>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs sm:text-sm border border-blue-200 dark:border-blue-800 font-medium">
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs sm:text-sm border border-rose-200 dark:border-rose-800 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleKioskAction('in')}
          disabled={loadingAction !== null || !modelsLoaded}
          className="py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 font-semibold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center space-x-2"
        >
          {loadingAction === 'in' ? (
            <span>Verifying...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Punch In</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleKioskAction('out')}
          disabled={loadingAction !== null || !modelsLoaded}
          className="py-3.5 px-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white disabled:opacity-50 font-semibold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center space-x-2"
        >
          {loadingAction === 'out' ? (
            <span>Verifying...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Punch Out</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}