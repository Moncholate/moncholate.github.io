# moncholate.github.io

Solo redirecciones de direcciones antiguas a las nuevas (en minúscula, porque
las rutas de GitHub Pages distinguen mayúsculas y `/Kachai/` no es `/kachai/`):

- `/Kachai/` → `/kachai/`
- `/Liveboard/` → `/liveboard/`
- `/Chasquibox/` → `/teachers-toolbox/` · con service worker de retiro
- `/teachers-utility-belt/` → `/teachers-toolbox/` · con service worker de retiro
- `/Grammar-HUB/` → `/grammar-hub/` · con service worker de retiro
- `/GramMaster/` → `/grammaster/` · con service worker de retiro
- `/DesGramatizador/` → `/desgramatizador/` · con service worker de retiro
- `/Question-Lab/` → `/question-lab/` · con service worker de retiro

Se conserva lo que venga después (`#/play?pin=…`). Donde la app tuvo modo sin
internet, `<antigua>/sw.js` es un worker de RETIRO: cuando el navegador revisa
si el worker viejo cambió, recibe este, que se da de baja y recarga la ventana.
Lo arma `armar.cjs`: `node armar.cjs`, y commit + push.

Una app nueva debe nacer con el repo en minúscula; si alguna vez se renombra,
se agrega aquí.
