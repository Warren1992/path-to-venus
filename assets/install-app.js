/* Path to Venus mobile installation. No trackers, no external dependencies. */
(() => {
  'use strict';
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => {
        // Site remains usable if the browser or network does not support offline mode.
      });
    });
  }
  let installPrompt = null;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    document.querySelectorAll('[data-install-app]').forEach(el => { el.hidden = true; });
  });
  function helpDialog() {
    let dialog = document.querySelector('#ptv-install-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'ptv-install-dialog';
      dialog.className = 'ptv-install-dialog';
      dialog.innerHTML = '<div class="ptv-install-dialog-inner"><button class="ptv-dialog-close" type="button" aria-label="Close installation instructions">×</button><h2>Install Path to Venus</h2><p class="ptv-install-copy"></p><button class="shop-outline-btn ptv-dialog-done" type="button">Got it</button></div>';
      document.body.append(dialog);
      dialog.querySelector('.ptv-dialog-close').addEventListener('click', () => dialog.close());
      dialog.querySelector('.ptv-dialog-done').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    }
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const msg = ios
      ? 'In Safari, tap Share, then Add to Home Screen, then Add. If that option is not visible, open this website in Safari first.'
      : 'In Chrome or Samsung Internet, open the browser menu and choose Install app or Add to Home screen, then confirm. The option may not appear until your browser has visited the site.';
    dialog.querySelector('.ptv-install-copy').textContent = msg;
    if (dialog.showModal) dialog.showModal();
    else window.alert(msg);
  }
  document.addEventListener('click', async e => {
    const button = e.target.closest('[data-install-app]');
    if (!button) return;
    e.preventDefault();
    if (standalone()) return;
    if (installPrompt) {
      const event = installPrompt;
      installPrompt = null;
      try { await event.prompt(); await event.userChoice; }
      catch { helpDialog(); }
    } else helpDialog();
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (standalone()) {
      document.querySelectorAll('[data-install-app]').forEach(el => el.hidden = true);
      return;
    }
    const footer = document.querySelector('.footer');
    if (footer) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ptv-footer-install';
      button.setAttribute('data-install-app', '');
      button.textContent = '↓ Install Path to Venus on your phone';
      footer.append(button);
    }
  });
})();
