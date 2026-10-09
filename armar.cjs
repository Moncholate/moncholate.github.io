/* Arma el sitio de redirecciones: una página por dirección antigua, un
   404.html que atrapa cualquier otra ruta bajo ellas y, donde la app tuvo modo
   sin internet, un service worker de RETIRO.
   Uso: node armar.cjs (desde esta carpeta), y commit + push. */
const fs = require('fs');
const path = require('path');

/* dirección antigua → nueva. Las rutas de GitHub Pages distinguen mayúsculas:
   /Kachai/ y /kachai/ son direcciones distintas, y solo la nueva es la app.
   `sw`: la app tuvo service worker en la dirección antigua. */
const MAPA = {
  Kachai: { nueva: 'kachai' },
  Liveboard: { nueva: 'liveboard' },
  Chasquibox: { nueva: 'teachers-toolbox', sw: true },
  'teachers-utility-belt': { nueva: 'teachers-toolbox', sw: true },
  'Grammar-HUB': { nueva: 'grammar-hub', sw: true },
  GramMaster: { nueva: 'grammaster', sw: true },
  DesGramatizador: { nueva: 'desgramatizador', sw: true },
  'Question-Lab': { nueva: 'question-lab', sw: true },
};
const destinos = Object.fromEntries(Object.entries(MAPA).map(([v, d]) => [v, d.nueva]));

/* Reenvía conservando el resto de la ruta, la consulta y el #hash (el PIN de
   Kachai va ahí). Antes da de baja el service worker de la dirección antigua si
   lo hay: no debe seguir sirviendo la copia vieja. Con tope de tiempo, para que
   un navegador lento no deje a nadie esperando. */
const script = `
(function () {
  var MAPA = ${JSON.stringify(destinos)};
  var p = location.pathname;
  for (var viejo in MAPA) {
    if (p === '/' + viejo || p.indexOf('/' + viejo + '/') === 0) {
      var resto = p.slice(viejo.length + 1) || '/';
      var ir = function () { location.replace('/' + MAPA[viejo] + resto + location.search + location.hash); };
      if (!('serviceWorker' in navigator)) return ir();
      var listo = false, salir = function () { if (!listo) { listo = true; ir(); } };
      setTimeout(salir, 800);
      navigator.serviceWorker.getRegistrations().then(function (rs) {
        return Promise.all(rs.filter(function (r) {
          return new URL(r.scope).pathname.indexOf('/' + viejo + '/') === 0;
        }).map(function (r) { return r.unregister(); }));
      }).then(salir, salir);
      return;
    }
  }
})();`;

/* EL SERVICE WORKER DE RETIRO. Una app instalada con modo sin internet sigue
   abriendo su copia guardada aunque la dirección ya no exista, y algunas
   (Desgramatizador, con workbox) ni siquiera preguntan a la red al abrir: no
   verían nunca la redirección. Pero el navegador sí revisa de vez en cuando si
   el worker cambió, pidiendo <dirección antigua>/sw.js. Recibe este: se
   instala, se da de baja y recarga las ventanas, que ahora sí llegan a la
   redirección. No borra cachés: son del mismo origen que las apps nuevas, y
   cada app ya limpia las suyas. */
const retiro = `/* Service worker de retiro: la app se mudó (ver README del repo). */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil(self.registration.unregister().then(function () {
    return self.clients.matchAll({ type: 'window' });
  }).then(function (ventanas) {
    ventanas.forEach(function (v) { v.navigate(v.url); });
  }));
});
`;

const pagina = (titulo, destino) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<meta name="robots" content="noindex">
${destino ? `<link rel="canonical" href="https://moncholate.github.io/${destino}/">` : ''}
<script>${script}</script>
${destino ? `<noscript><meta http-equiv="refresh" content="0; url=/${destino}/"></noscript>` : ''}
<style>
  body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
  @media (prefers-color-scheme: dark) { body { background: #0f1320; color: #e6e9f2; } a { color: #60a5fa; } }
  main { max-width: 28rem; padding: 1.5rem; text-align: center; }
</style>
</head>
<body>
<main>
  ${destino
    ? `<p>Esta app cambió de dirección. Te llevamos a <a href="/${destino}/">moncholate.github.io/${destino}/</a></p>`
    : `<p>Esta página no existe.</p>`}
</main>
</body>
</html>
`;

const raiz = __dirname;
for (const [viejo, d] of Object.entries(MAPA)) {
  fs.mkdirSync(path.join(raiz, viejo), { recursive: true });
  fs.writeFileSync(path.join(raiz, viejo, 'index.html'), pagina(`Nueva dirección · ${d.nueva}`, d.nueva));
  const sw = path.join(raiz, viejo, 'sw.js');
  if (d.sw) fs.writeFileSync(sw, retiro);
  else if (fs.existsSync(sw)) fs.unlinkSync(sw);
}
fs.writeFileSync(path.join(raiz, '404.html'), pagina('No encontrada', null));
/* Sin Jekyll: GitHub Pages sirve los archivos tal cual. */
fs.writeFileSync(path.join(raiz, '.nojekyll'), '');
fs.writeFileSync(path.join(raiz, 'README.md'),
`# moncholate.github.io

Solo redirecciones de direcciones antiguas a las nuevas (en minúscula, porque
las rutas de GitHub Pages distinguen mayúsculas y \`/Kachai/\` no es \`/kachai/\`):

${Object.entries(MAPA).map(([v, d]) => `- \`/${v}/\` → \`/${d.nueva}/\`${d.sw ? ' · con service worker de retiro' : ''}`).join('\n')}

Se conserva lo que venga después (\`#/play?pin=…\`). Donde la app tuvo modo sin
internet, \`<antigua>/sw.js\` es un worker de RETIRO: cuando el navegador revisa
si el worker viejo cambió, recibe este, que se da de baja y recarga la ventana.
Lo arma \`armar.cjs\`: \`node armar.cjs\`, y commit + push.

Una app nueva debe nacer con el repo en minúscula; si alguna vez se renombra,
se agrega aquí.
`);
console.log('listo');
