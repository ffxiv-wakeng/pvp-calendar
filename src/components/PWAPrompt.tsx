import { useRegisterSW } from 'virtual:pwa-register/react';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';

export function PWAPrompt() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      setToastMessage('应用已准备好离线使用');
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setShowToast(false);
  };

  if (!showToast && !isOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showToast && (
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5">
          {isOffline ? (
            <WifiOff className="h-5 w-5 text-yellow-400" />
          ) : (
            <Wifi className="h-5 w-5 text-green-400" />
          )}
          <span className="text-sm">{toastMessage}</span>
          <button
            onClick={close}
            className="ml-2 hover:bg-gray-700 rounded p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {isOffline && !showToast && (
        <div className="bg-yellow-900/90 text-yellow-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <WifiOff className="h-5 w-5" />
          <span className="text-sm">离线模式</span>
        </div>
      )}
    </div>
  );
}
