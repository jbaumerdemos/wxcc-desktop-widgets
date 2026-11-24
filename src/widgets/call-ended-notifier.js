// <call-ended-notifier>: headless widget that raises an OS toast when a contact ends
// (e.g. the caller hangs up) while the Desktop is minimised or in the background.
//
// Layout attributes (WxCC passes them lowercased; getAttribute is case-insensitive):
//   title        toast title            (default "Caller disconnected")
//   onlyhidden   "true" (default) = only toast when the page is hidden/unfocused
//   showbutton   "true" (default) = show a small "Enable alerts" button if permission is undecided
import { initDesktop, describeContact } from '../lib/sdk.js';
import { permission, requestPermission, toast, pageNotVisible, supported } from '../lib/notify.js';

const EVENTS = ['eAgentContactEnded']; // verify on a live call; add e.g. 'eAgentContactWrappedUp' if needed

class CallEndedNotifier extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._off = [];
  }

  attr(name, dflt) {
    const v = (this.getAttribute(name) || '').trim();
    return v ? v : dflt;
  }

  async connectedCallback() {
    this.renderButton();
    try {
      const desktop = await initDesktop('call-ended-notifier');
      for (const ev of EVENTS) {
        const handler = (msg) => this.onEnded(ev, msg);
        desktop.agentContact.addEventListener(ev, handler);
        this._off.push(() => desktop.agentContact.removeEventListener(ev, handler));
      }
    } catch (e) {
      console.error('[call-ended-notifier] SDK init failed', e);
    }
  }

  disconnectedCallback() {
    this._off.forEach((f) => f());
    this._off = [];
  }

  onEnded(ev, msg) {
    const c = describeContact(msg);
    console.log('[call-ended-notifier]', ev, c.interactionId, c.ani);
    if (this.attr('onlyhidden', 'true') !== 'false' && !pageNotVisible()) {
      console.log('[call-ended-notifier] skipped: page is visible and focused (set onlyHidden=false to always toast)');
      return;
    }
    if (permission() !== 'granted') {
      console.warn('[call-ended-notifier] no toast: Notification.permission =', permission(),
        '- allow notifications for this site (lock icon > Site settings) or click "Enable call-ended alerts"');
      this.renderButton();
      return;
    }
    console.log('[call-ended-notifier] showing toast');
    toast(this.attr('title', 'Caller disconnected'), {
      body: (c.ani ? `Contact from ${c.ani} has ended.` : 'The contact has ended.') + ' Click to return to Webex Contact Center.',
      tag: c.interactionId || 'call-ended',
    });
  }

  renderButton() {
    // The element is headless, so render nothing unless permission still has to be asked for.
    const needs = supported() && permission() === 'default' && this.attr('showbutton', 'true') !== 'false';
    this.shadowRoot.innerHTML = needs
      ? '<button style="font:12px sans-serif;padding:4px 8px;cursor:pointer">Enable call-ended alerts</button>'
      : '';
    const b = this.shadowRoot.querySelector('button');
    if (b) b.onclick = async () => { await requestPermission(); this.renderButton(); };
  }
}

if (!customElements.get('call-ended-notifier')) customElements.define('call-ended-notifier', CallEndedNotifier);
