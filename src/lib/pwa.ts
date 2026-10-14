/**
 * PWA 服务工具模块
 * 提供主动检查更新和获取 Service Worker 状态的工具方法
 */

export type UpdateCheckResult = 'updated' | 'latest' | 'unsupported' | 'error';

/**
 * 主动向服务器检查 PWA 是否有新版本
 */
export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return 'unsupported';
    }

    // 触发 Service Worker 向服务器比对最新脚本
    await registration.update();

    // 如果已有正在安装或等待接管的 Service Worker，说明发现了新版本
    if (registration.installing || registration.waiting) {
      return 'updated';
    }

    // 稍作等待以确保异步状态就绪
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (registration.installing || registration.waiting) {
      return 'updated';
    }

    return 'latest';
  } catch (error) {
    console.error('检查更新失败:', error);
    return 'error';
  }
}
