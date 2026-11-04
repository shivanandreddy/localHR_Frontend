import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import API from '../services/api';

export default function EmployeeForm() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    shiftStart: '09:00',
    shiftEnd: '18:00',
    basicSalary: '',
    latitude: '',
    longitude: '',
    allowedRadiusMeters: 75,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 1. Load Face-API models and automatically fetch current GPS location on mount
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

    // Automatically grab GPS coordinates on page load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.warn("Auto GPS location fetch failed: " + error.message);
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Get or generate device ID for initial binding
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('shiftSync_deviceId');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
      localStorage.setItem('shiftSync_deviceId', deviceId);
    }
    return deviceId;
  };

  // Capture face descriptor vector from the live video stream
  const handleCaptureFace = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!videoRef.current || !modelsLoaded) {
      setErrorMessage("AI models or camera are not ready yet.");
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setErrorMessage("No face detected. Please position your face clearly inside the camera frame.");
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);
      setFaceDescriptor(descriptorArray);
      setFaceCaptured(true);
      setSuccessMessage("Face biometrics captured successfully!");
    } catch (err) {
      setErrorMessage("Face capture failed: " + err.message);
    }
  };

  // Manual fallback re-capture GPS button
  const handleCaptureLocation = () => {
    setErrorMessage(null);
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setSuccessMessage("Current GPS location re-captured successfully!");
      },
      (error) => {
        setErrorMessage("Unable to retrieve location: " + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!faceCaptured || !faceDescriptor || faceDescriptor.length === 0) {
      setErrorMessage("Please capture the employee's face biometrics before submitting.");
      setLoading(false);
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setErrorMessage("GPS coordinates are missing. Please allow location access.");
      setLoading(false);
      return;
    }

    try {
      const boundDeviceId = getDeviceId();
      const payload = {
        ...formData,
        basicSalary: Number(formData.basicSalary),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        allowedRadiusMeters: Number(formData.allowedRadiusMeters),
        faceDescriptor,
        boundDeviceId,
      };

      await API.post('/api/employees', payload);
      
      setSuccessMessage('Employee registered successfully with Face ID and GPS Geofencing!');
      
      // Reset form and capture states while keeping auto-fetched location
      setFormData((prev) => ({
        ...prev,
        name: '',
        email: '',
        password: '',
        basicSalary: '',
      }));
      setFaceCaptured(false);
      setFaceDescriptor([]);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to register employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Registration</h1>
          <p className="text-sm text-gray-500">Onboard staff, register face biometrics, and configure work location & shift</p>
        </div>
        <button
          onClick={() => window.location.href = '/employees'}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          &larr; Back to List
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="font-bold text-emerald-600">&times;</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold text-rose-600">&times;</button>
        </div>
      )}

      {/* Registration Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@shiftsync.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Initial Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">System Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Face Biometric Capture Section */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Face Biometric Registration</label>
          <div className="flex flex-col items-center bg-slate-900 p-4 rounded-2xl space-y-3">
            <div className="relative w-48 h-48 bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-full m-4 pointer-events-none flex items-center justify-center">
                <span className="text-white text-[10px] bg-slate-900/80 px-2 py-0.5 rounded">
                  {modelsLoaded ? (faceCaptured ? "Face Captured ✓" : "Align Face") : "Loading AI..."}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCaptureFace}
              disabled={!modelsLoaded}
              className={`px-4 py-2 text-xs font-semibold rounded-xl shadow transition-colors ${
                faceCaptured 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {faceCaptured ? 'Recapture Face Biometrics' : 'Capture Face Biometrics'}
            </button>
            {faceCaptured && (
              <span className="text-xs text-emerald-400 font-medium">✓ 128-d Face Descriptor Ready</span>
            )}
          </div>
        </div>

        {/* GPS Geofence Location Section */}
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Work Geofence Location (Auto-Detected)</label>
            <button
              type="button"
              onClick={handleCaptureLocation}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Refresh GPS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                required
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Auto-detecting..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                required
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Auto-detecting..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Allowed Radius (Meters)</label>
            <input
              type="number"
              name="allowedRadiusMeters"
              required
              value={formData.allowedRadiusMeters}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Shift Hours Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Shift Start Time</label>
            <input
              type="time"
              name="shiftStart"
              required
              value={formData.shiftStart}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Shift End Time</label>
            <input
              type="time"
              name="shiftEnd"
              required
              value={formData.shiftEnd}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Basic Salary */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Basic Salary (₹)</label>
          <input
            type="number"
            name="basicSalary"
            required
            value={formData.basicSalary}
            onChange={handleChange}
            placeholder="e.g. 45000"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !faceCaptured}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Registering Employee...' : 'Save & Register Employee'}
          </button>
        </div>

      </form>

    </div>
  );
}