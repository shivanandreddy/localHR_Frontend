// src/utils/deviceIdentifier.js
export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('shiftSync_deviceId');
  if (!deviceId) {
    // Generate a secure random unique ID
    deviceId = 'device_' + crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('shiftSync_deviceId', deviceId);
  }
  return deviceId;
};