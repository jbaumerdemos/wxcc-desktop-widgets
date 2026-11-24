# wxcc-desktop-widgets

Custom widgets for the Webex Contact Center Agent Desktop. Each file in `src/widgets/` is bundled into its own self-contained file in `dist/` (Desktop SDK included), which a desktop layout loads through its `"script"` URL.

Not a Cisco product. Demo widgets, provided as is.

```
npm install
npm run build      # -> dist/<widget>.js
```

`dist/` is committed so jsDelivr can serve it. Tag a new version after each change (for example `v1.0.1`) and point the layout at that tag. A tag is cached by the CDN, so never reuse one.

## Layout of this repo
- `src/lib/sdk.js`: shared `initDesktop()` and `describeContact()` helpers.
- `src/lib/notify.js`: browser `Notification` wrapper (`toast`, `requestPermission`, `pageNotVisible`).
- `src/widgets/*.js`: one custom element per file.

## Widgets

### call-ended-notifier (headless)
An operating-system toast when a contact ends (for example the caller hangs up) while the Desktop is minimized or in the background. The Desktop's own `fireGeneral*Notification` calls only draw inside the page, so they are not seen when the browser is minimized. The browser `Notification` API is.

Add it to the layout's headless area (`agent.area.headless.widgets`) and add its area and row:

```json
"call-ended-notifier": {
  "comp": "call-ended-notifier",
  "script": "https://cdn.jsdelivr.net/gh/jbaumerdemos/wxcc-desktop-widgets@v1.0.0/dist/call-ended-notifier.js",
  "attributes": { "title": "Caller disconnected", "onlyHidden": "true" }
}
```

Attributes (WxCC lowercases them):

| Attribute | Default | Meaning |
|---|---|---|
| `title` | Caller disconnected | Toast title |
| `onlyhidden` | true | Only toast when the page is hidden or unfocused. `false` = always toast |
| `showbutton` | true | Show an "Enable call-ended alerts" button when permission is undecided |

The toast text ends with "Click to return to Webex Contact Center". Clicking it focuses the Desktop tab. Custom action buttons are not possible, because browsers only allow them on service-worker notifications, and a widget cannot register a service worker for the Desktop's origin.

**Requirements and behavior**
- The browser must allow notifications for the Desktop's origin (`Notification.permission` must be `granted`). If it is not, the console says so.
- Windows Focus Assist or Do Not Disturb can hide the toast.
- It listens for `eAgentContactEnded`, which also fires when the agent ends the call. It does not tell the two apart.
- The console logs each decision with the prefix `[call-ended-notifier]`: `skipped: page is visible and focused`, `no toast: Notification.permission = …`, or `showing toast`.

**Status.** Tested on a live Desktop: the event fires, and the toast appears when the window is minimized. The event payload fields (`interactionId`, caller number) are read from `msg.data.interaction.callAssociatedDetails`; check them against your payload, which is logged as `raw`.

## Adding another widget
1. Create `src/widgets/my-widget.js` that calls `customElements.define('my-widget', …)` and uses `initDesktop('my-widget')`.
2. `npm run build`, commit `dist/`, tag a version.
3. Add it to the layout with `comp: "my-widget"` and a jsDelivr script URL.

See also [verint-embedded-crm](https://github.com/jbaumerdemos/verint-embedded-crm) and [wxcc-widget-manager](https://github.com/jbaumerdemos/wxcc-widget-manager).
