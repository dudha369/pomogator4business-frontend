export function isMobileDevice() {
  return (
    Math.min(window.screen.width, window.screen.height) <= 480 &&
    window.devicePixelRatio >= 2 &&
    navigator.maxTouchPoints > 0
  );
}
