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
    <div
      className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]"
      role="status"
      aria-live="polite"
    >
      {showToast && (
        <div className="bg-popover text-popover-foreground px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 motion-reduce:animate-none border border-border">
          {isUpdating ? (
            <RefreshCw className="h-4 w-4 text-primary animate-spin motion-reduce:animate-none shrink-0" />
          ) : isOffline ? (
            <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : (
            <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage}</span>
          {!isUpdating && (
            <button
              type="button"
              onClick={close}
              className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
              aria-label={t.close}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {isOffline && !showToast && (
        <div className="bg-amber-50 text-amber-950 dark:bg-amber-950/90 dark:text-amber-100 px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 border border-amber-300/80 dark:border-amber-800/70">
          <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{t.offlineMode}</span>
        </div>
      )}
    </div>
  );
}
