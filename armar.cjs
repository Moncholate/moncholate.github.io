/* Arma el sitio de redirecciones: una página por dirección antigua y un
   404.html que atrapa cualquier otra ruta bajo ellas. */
const fs = require('fs');
const path = require('path');

/* dirección antigua → nueva. Las rutas de GitHub Pages distinguen mayúsculas:
   /Kachai/ y /kachai/ son direcciones distintas, y solo la nueva es la app. */
const MAPA = {
  Kachai: 'kachai',
  Liveboard: 'liveboard',
  Chasquibox: 'teachers-utility-belt',
};

const script = `
(function () {
  var MAPA = ${JSON.stringify(MAPA)};
  var p = location.pathname;
  for (var viejo in MAPA) {
    if (p === '/' + viejo || p.indexOf('/' + viejo + '/') === 0) {
      var resto = p.slice(viejo.length + 1) || '/';
      location.replace('/' + MAPA[viejo] + resto + location.search + location.hash);
      return;
    }
  }
})();`;

const pagina = (titulo, destino) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<meta name="robots" content="noindex">
${destino ? `<link rel="canonical" href="https://moncholate.github.io/${destino}/">` : ''}
<script>${script}</script>
${destino ? `<meta http-equiv="refresh" content="2; url=/${destino}/">` : ''}
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
for (const [viejo, nuevo] of Object.entries(MAPA)) {
  fs.mkdirSync(path.join(raiz, viejo), { recursive: true });
  fs.writeFileSync(path.join(raiz, viejo, 'index.html'), pagina(`Nueva dirección · ${nuevo}`, nuevo));
}
fs.writeFileSync(path.join(raiz, '404.html'), pagina('No encontrada', null));
/* Sin Jekyll: GitHub Pages sirve los archivos tal cual. */
fs.writeFileSync(path.join(raiz, '.nojekyll'), '');
fs.writeFileSync(path.join(raiz, 'README.md'),
`# moncholate.github.io

Solo redirecciones de direcciones antiguas a las nuevas (en minúscula, porque
las rutas de GitHub Pages distinguen mayúsculas y \`/Kachai/\` no es \`/kachai/\`):

${Object.entries(MAPA).map(([v, n]) => `- \`/${v}/\` → \`/${n}/\``).join('\n')}

Se conserva lo que venga después (\`#/play?pin=…\`). Lo arma \`armar.cjs\`.
`);
console.log('listo');
