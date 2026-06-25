(function () {
  window.__glamdPwaInstall = window.__glamdPwaInstall || { deferred: null };
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window.__glamdPwaInstall.deferred = e;
    window.dispatchEvent(new Event("glamd-pwa-install-ready"));
  });
})();
