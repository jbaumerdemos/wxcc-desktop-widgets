// Thin wrapper around the browser Notification API (OS-level toasts, visible when the
// browser is minimised, unlike the Desktop's own fireGeneral*Notification calls).

export const supported = () => typeof Notification !== 'undefined';
export const permission = () => (supported() ? Notification.permission : 'unsupported');

// Must be called from a user gesture in most browsers.
export async function requestPermission() {
  if (!supported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return Notification.permission;
  }
}

export function toast(title, { body = '', tag, requireInteraction = true, onClick } = {}) {
  if (permission() !== 'granted') return null;
  const n = new Notification(title, { body, tag, requireInteraction, renotify: !!tag });
  n.onclick = () => {
    try { window.focus(); } catch (e) { /* ignore */ }
    n.close();
    if (onClick) onClick();
  };
  return n;
}

// True when an agent would not see an in-page alert.
export function pageNotVisible() {
  return document.hidden || !document.hasFocus();
}
