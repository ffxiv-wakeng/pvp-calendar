import ReactGA from 'react-ga4';

export const GA_MEASUREMENT_ID = 'G-2XSEGD1MD1';

/**
 * 初始化 Google Analytics
 */
export function initAnalytics() {
  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gtagOptions: {
      send_page_view: false, // 由路由监听组件统一管理页面浏览上报，避免重复上报
    },
  });
}

/**
 * 上报页面浏览
 */
export function trackPageView(path: string) {
  ReactGA.send({ hitType: 'pageview', page: path });
}

/**
 * 上报自定义事件
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

export { ReactGA };
