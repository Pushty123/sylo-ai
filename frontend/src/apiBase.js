// Base URL for the FastAPI backend.
// A localhost address only works on the laptop itself; on a phone it would point at the phone,
// so in that case use the same origin and let the Vite proxy forward the call to the laptop.
const configured=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
const isLocalUrl=/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(configured);
const onLaptop=['localhost','127.0.0.1'].includes(window.location.hostname);
export const API=configured&&!(isLocalUrl&&!onLaptop)?configured:'';
