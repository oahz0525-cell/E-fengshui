/**
 * iOS 自带 Safari：同一机型上往往比 Chrome（CriOS）更易因 backdrop-blur / 重滤镜掉帧。
 * 在 `html` 上打标，由 `index.css` 降级毛玻璃与部分滤镜（不改布局）。
 */
export function enableWebKitMobileLiteMode(): void {
  if (typeof document === "undefined") return;
  const ua = navigator.userAgent;
  const iPadOsDesktopUa = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isAppleTouchDevice = /iPad|iPhone|iPod/.test(ua) || iPadOsDesktopUa;
  if (!isAppleTouchDevice) return;

  const isThirdPartyIosBrowser =
    /CriOS|FxiOS|EdgiOS|OPiOS|QQBrowser|MetaSr|MicroMessenger/.test(ua);
  if (isThirdPartyIosBrowser) return;

  if (!/Safari/.test(ua)) return;

  document.documentElement.setAttribute("data-webkit-mobile-lite", "");
}
