import { useRegisterSW } from 'virtual:pwa-register/react';
import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, X, RefreshCw } from 'lucide-react';
import { useSettingsContext } from '@/contexts/useSettingsContext';

export function PWAPrompt() {
  const { t } = useSettingsContext();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, r) {
      if (r) {
        registrationRef.current = r;
        // 注册成功后，延迟 3 秒静默执行一次更新检测
        setTimeout(() => {
          r.update().catch(() => {});
        }, 3000);
      }
    },
    onRegisterError(error) {
      console.warn('Service Worker 注册失败:', error);
    },
    onNeedReload() {
      // 核心更新触发点：新版本 Service Worker 已安装并激活接管
      setIsUpdating(true);
      setToastMessage(t.updateFound);
      setShowToast(true);
      // 延迟 1.2 秒平滑重载页面，让用户看到更新反馈并载入最新代码
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    },
  });

  // 离线就绪提示
  useEffect(() => {
    if (offlineReady) {
      setToastMessage(t.offlineReady);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady, t.offlineReady]);

  // 双重保障：若触发 needRefresh 状态，自动调用更新
  useEffect(() => {
    if (needRefresh) {
      setIsUpdating(true);
      setToastMessage(t.updateFound);
      setShowToast(true);
      updateServiceWorker(true);
    }
  }, [needRefresh, t.updateFound, updateServiceWorker]);

  // 主动检查机制：定时检查、切回前台检查、联网恢复检查
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const reg = registrationRef.current || (await navigator.serviceWorker?.getRegistration());
        if (reg) {
          await reg.update();
        }
      } catch (err) {
        console.warn('检查更新异常:', err);
      }
    };

    // 1. 每 60 分钟自动在后台检查一次服务器是否有新版本
    const checkInterval = setInterval(checkUpdates, 60 * 60 * 1000);

    // 2. 页面可见性改变（从手机后台切回、电脑锁屏恢复等）时立即检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUpdates();
      }
    };

    // 3. 网络从离线变为在线时立即检查
    const handleOnline = () => {
      setIsOffline(false);
      checkUpdates();
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    setIsOffline(!navigator.onLine);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const close = () => {
    if (isUpdating) return; // 正在重载更新时不响应手动关闭
    setOfflineReady(false);
    setNeedRefresh(false);
    setShowToast(false);
  };

  if (!showToast && !isOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showToast && (
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 border border-gray-700/50">
          {isUpdating ? (
            <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
          ) : isOffline ? (
            <WifiOff className="h-5 w-5 text-yellow-400" />
          ) : (
            <Wifi className="h-5 w-5 text-green-400" />
          )}
          <span className="text-sm font-medium">{toastMessage}</span>
          {!isUpdating && (
            <button
              onClick={close}
              className="ml-2 hover:bg-gray-700 rounded p-1 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {isOffline && !showToast && (
        <div className="bg-yellow-900/90 text-yellow-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-yellow-800/50">
          <WifiOff className="h-5 w-5" />
          <span className="text-sm font-medium">{t.offlineMode}</span>
        </div>
      )}
    </div>
  );
}
