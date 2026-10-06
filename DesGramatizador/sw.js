/* Service worker de retiro: la app se mudó (ver README del repo). */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil(self.registration.unregister().then(function () {
    return self.clients.matchAll({ type: 'window' });
  }).then(function (ventanas) {
    ventanas.forEach(function (v) { v.navigate(v.url); });
  }));
});
