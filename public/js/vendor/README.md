# Vendored third-party assets

`maplibre-gl-csp.js` + `maplibre-gl-csp-worker.js` — [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js)
v4.7.1, BSD-3-Clause. This is the library's own **CSP-safe build**
variant (no `eval`/`new Function`, no blob-URL workers), which is why it
needs two files: the main bundle and a separately self-hosted worker
script, registered via `maplibregl.setWorkerUrl(...)` before creating a
Map. Self-hosted (not loaded from a CDN or any tile provider) so `/live`
runs under the site's `script-src 'self'` CSP with zero exceptions and
zero external network requests — no API token, no tile server, no font
glyphs (this map renders no text labels, so `glyphs`/`sprite` are omitted
from the style entirely).

`public/css/vendor/maplibre-gl.css` is the matching stylesheet, same
version/license.

`d3.v7.min.js` — [D3](https://d3js.org) v7.9.0, ISC license. Official UMD
bundle (exposes a global `d3`), unmodified, downloaded from
`unpkg.com/d3@7.9.0/dist/d3.min.js`. Used by the Sweden Trade Intelligence
scrollytelling story (`public/js/story.js`) for the sticky-graphic
transitions (enter/update/exit) that page's narrative depends on.

`three.r143.min.js` + `three-r143-postprocessing.js` — [three.js](https://threejs.org)
r0.143.0, MIT. The official UMD build (global `THREE`), unmodified, plus the
matching non-module add-ons from `examples/js/` (CopyShader,
LuminosityHighPassShader, EffectComposer, MaskPass, ShaderPass, RenderPass,
UnrealBloomPass) concatenated in dependency order into one file. Loaded as plain
scripts, not ES modules, so they run under `script-src 'self'` with no importmap.
Used only by the homepage hero globe (`public/js/hero-globe.js`).

`lenis.min.js` — [Lenis](https://lenis.darkroom.engineering) v1.3.23, MIT. Official
UMD build (global `Lenis`), unmodified. Used by `public/js/smooth-scroll.js`
on every page except `/intelligence`.
