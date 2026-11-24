// Shared access to the WxCC Desktop SDK so every widget initialises it the same way.
import { Desktop } from '@wxcc-desktop/sdk';

let ready = null;

export function initDesktop(widgetName, widgetProvider = 'Cisco SE') {
  if (!ready) {
    ready = Desktop.config.init({ widgetName, widgetProvider }).then(() => Desktop);
  }
  return ready;
}

// Contact payloads vary a little by event; pull out the fields widgets usually need.
export function describeContact(msg) {
  const d = (msg && msg.data) || msg || {};
  const i = d.interaction || {};
  const det = i.callAssociatedDetails || {};
  return {
    interactionId: d.interactionId || i.interactionId || '',
    ani: det.ani || det.dn || '',
    channel: i.mediaType || d.mediaType || '',
    raw: msg,
  };
}
