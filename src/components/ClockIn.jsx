import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import API from '../services/api';

export default function ClockIn() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Load Face-API Models from CDN and Start Camera
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
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setErrorMessage("Failed to initialize camera or AI models: " + err.message);
      }
    };

    loadModelsAndCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Get or Generate Persistent Device ID
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('shiftSync_deviceId');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
      localStorage.setItem('shiftSync_deviceId', deviceId);
    }
    return deviceId;
  };

  // Real Face Descriptor Extraction using Face-API.js
  const captureFaceDescriptor = async () => {
    if (!videoRef.current) throw new Error("Video stream not ready.");

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error("No face detected. Please center your face inside the overlay.");
    }

    return Array.from(detection.descriptor);
  };

  // Helper to fetch high-accuracy live GPS coordinates
  const getCoordinates = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            reject(new Error("Failed to retrieve precise GPS location. Please ensure location services & permissions are enabled."));
          },
          { 
            enableHighAccuracy: true, // Forces physical GPS hardware lock
            timeout: 20000,           // Gives GPS up to 20 seconds to acquire lock
            maximumAge: 0             // Prevents use of cached location data
          }
        );
      }
    });
  };

  const handleAttendance = async (type) => {
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    if (!modelsLoaded) {
      setErrorMessage("Biometric models are still loading. Please wait.");
      setLoading(false);
      return;
    }

    try {
      const employeeId = localStorage.getItem('employeeId');
      if (!employeeId) {
        throw new Error("No employee session found. Please log in as an employee first.");
      }

      // Capture face biometrics and live GPS coordinates simultaneously
      const [liveDescriptor, coords] = await Promise.all([
        captureFaceDescriptor(),
        getCoordinates()
      ]);

      const clientDeviceId = getDeviceId();

      const payload = {
        employeeId,
        userLat: Number(coords.lat),
        userLng: Number(coords.lng),
        clientDeviceId,
        liveFaceDescriptor: liveDescriptor
      };

      const endpoint = type === 'clock-in' ? '/api/attendance/clock-in' : '/api/attendance/clock-out';
      const response = await API.post(endpoint, payload);

      setStatusMessage(response.data.message);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Attendance verification failed.";
      if (errorMsg.toLowerCase().includes('device')) {
        setErrorMessage("This account is bound to a different mobile device. Contact Admin.");
      } else {
        setErrorMessage(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-4 sm:p-6 my-4">
      
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Biometric Verification</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Facial Recognition & GPS Geofence Check</p>
      </div>

      {/* Camera Preview Container */}
      <div className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden shadow-inner mb-4 flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform -scale-x-100"
        />
        
        {/* Face Oval Overlay Indicator */}
        <div className="absolute inset-0 border-4 border-dashed border-blue-400 border-opacity-60 rounded-full m-8 pointer-events-none flex items-center justify-center">
          <span className="text-white text-xs bg-slate-900 bg-opacity-70 px-3 py-1 rounded-full">
            {modelsLoaded ? "Align Face Here" : "Loading AI Models..."}
          </span>
        </div>
      </div>

      {/* GPS Status Badge */}
      <div className="flex items-center justify-between text-xs text-gray-600 bg-emerald-50 p-3 rounded-lg mb-4 border border-emerald-200">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-emerald-800">GPS Status:</span>
        </div>
        <span className="text-emerald-700 font-medium">High-Accuracy Geofencing Active</span>
      </div>

      {/* Alert Messages */}
      {statusMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center space-x-2">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 text-sm flex items-center space-x-2">
          <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAttendance('clock-in')}
          disabled={loading || !modelsLoaded}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl shadow-md transition-colors text-sm sm:text-base flex justify-center items-center"
        >
          {loading ? 'Verifying...' : 'Clock In'}
        </button>

        <button
          onClick={() => handleAttendance('clock-out')}
          disabled={loading || !modelsLoaded}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-md transition-colors text-sm sm:text-base flex justify-center items-center"
        >
          {loading ? 'Verifying...' : 'Clock Out'}
        </button>
      </div>

    </div>
  );
}