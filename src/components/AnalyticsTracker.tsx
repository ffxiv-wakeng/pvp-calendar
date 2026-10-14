import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

/**
 * 监听路由与 Hash 变化并自动上报 Google Analytics 页面浏览
 */
export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const page = location.pathname + location.search + location.hash;
    trackPageView(page || '/');
  }, [location]);

  return null;
}
