import React, { useRef, useState, useEffect, useContext } from 'react';
import * as faceapi from 'face-api.js';
import API from '../services/api';
import { Webhook, LogIn, LogOut, Loader2, UserLock } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function Punch() {
  const videoRef = useRef(null);
  const { theme, toggleTheme, accent, setAccent, currentAccent } = useContext(ThemeContext);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const accents = [
    { value: 'blue', color: 'bg-blue-600' },
    { value: 'orange', color: 'bg-orange-600' },
    { value: 'emerald', color: 'bg-emerald-600' },
    { value: 'violet', color: 'bg-violet-600' },
  ];

  useEffect(() => {
    let activeStream = null;

    const loadModelsAndCamera = async () => {
      try {
        setErrorMessage(null);

        const MODEL_URL =
          'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });

        activeStream = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setErrorMessage('Camera initialization failed: ' + err.message);
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
        reject(new Error('Geolocation not supported.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          () =>
            reject(
              new Error('GPS location required for kiosk verification.')
            ),
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      }
    });
  };

  const handleKioskAction = async (actionType) => {
    setLoadingAction(actionType);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      if (!videoRef.current) throw new Error('Camera stream not ready.');

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error(
          'No face detected. Please position your face inside the frame.'
        );
      }

      const liveDescriptor = Array.from(detection.descriptor);
      const coords = await getCoordinates();

      const payload = {
        liveFaceDescriptor: liveDescriptor,
        userLat: Number(coords.lat),
        userLng: Number(coords.lng),
        clientDeviceId:
          localStorage.getItem('shiftSync_deviceId') || 'kiosk-device',
      };

      const endpoint =
        actionType === 'in'
          ? '/api/attendance/auto-punch-in'
          : '/api/attendance/auto-punch-out';

      const response = await API.post(endpoint, payload);

      setStatusMessage(response.data.message);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center px-3 py-6 sm:px-6 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
  

      <div className="w-full max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative flex items-center justify-center">
              <Webhook
                size={34}
                strokeWidth={2.5}
                className={`${currentAccent.text} animate-spin`}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              <span className={currentAccent.text}>Esmart</span>HR
            </h1>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
            Attendance 
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Select your attendance action.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-center">

          {/* Camera Section */}
          <div className="w-full">
            <div className="relative w-full aspect-square max-w-[400px] mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Face Alignment Guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[65%] h-[75%] border-2 border-dashed border-cyan-400/80 rounded-[48%] flex items-end justify-center">
                  <span className="mb-3 text-[10px] sm:text-xs text-white bg-slate-950/80 px-3 py-1.5 rounded-full font-semibold shadow-lg">
                    {modelsLoaded
                      ? 'Align Face in Frame'
                      : 'Loading AI Models...'}
                  </span>
                </div>
              </div>

              {/* Camera Bottom Status */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-center text-xs text-white font-medium">
                  Face Recognition Enabled
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Actions */}
          <div className="w-full flex flex-col justify-center">

            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 text-center">
                Mark Your Attendance
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
                Face verification and GPS location are required.
              </p>
            </div>

            {/* Status Messages */}
            {statusMessage && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm font-medium break-words">
                {statusMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-sm font-medium break-words">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Punch In */}
              <button
                onClick={() => handleKioskAction('in')}
                disabled={loadingAction !== null || !modelsLoaded}
                className={`flex-1 min-h-[52px] px-5 py-3 ${currentAccent.primary} hover:opacity-90 active:scale-[0.98] text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base`}
              >
                {loadingAction === 'in' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Punch In
                  </>
                )}
              </button>

              {/* Punch Out */}
              <button
                onClick={() => handleKioskAction('out')}
                disabled={loadingAction !== null || !modelsLoaded}
                className="flex-1 min-h-[52px] px-5 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-[0.98] text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loadingAction === 'out' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    Punch Out
                  </>
                )}
              </button>
            </div>
            
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full min-h-[52px] px-5 py-3 mt-3 bg-slate-700 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <UserLock size={18} />
              Login
            </button>

            <p className="text-center text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-4">
              Secure attendance powered by face recognition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}