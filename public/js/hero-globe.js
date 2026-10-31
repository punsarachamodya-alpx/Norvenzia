'use strict';

// Homepage hero globe.
//
// A navy wireframe-style globe drawn from real data already in the repo:
//   - the 14 shipping lanes in /geo/shipping-lanes.geojson (real maritime
//     corridors, the same set the /intelligence map uses), and
//   - ping markers at real hub cities: Colombo (the delivery hub) and the
//     client markets the site names, with arcs running from Colombo to each.
// No continents are drawn: there is no land dataset in the repo, and a
// procedural stand-in would put Colombo in the ocean. The lanes and graticule
// outline the world well enough on their own.
//
// Needs the vendored three r0.143 UMD build plus its postprocessing add-ons
// (public/js/vendor/). Loaded as a plain script so it runs under the site's
// script-src 'self' policy with no importmap. If WebGL (or the libs) is
// missing, this does nothing and the photographic hero is left exactly as is.
(function () {
  var canvas = document.querySelector('[data-hero-globe]');
  if (!canvas || !window.THREE || !THREE.EffectComposer || !THREE.UnrealBloomPass) return;
  if (navigator.connection && navigator.connection.saveData) return;

  var hero = canvas.parentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    return;
  }

  // Palette follows the site tokens (navy family + --color-accent #2f6fed).
  var C = {
    glow: new THREE.Vector3(0.18, 0.435, 0.93),   // --color-accent, for the atmosphere
    rim: new THREE.Vector3(0.65, 0.75, 0.81),     // --mist
    lane: new THREE.Vector3(0.45, 0.65, 1.0),
    marker: new THREE.Vector3(0.85, 0.92, 1.0)
  };
  var R = 2.1;

  var PR = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(PR);
  renderer.setClearColor(0x000000, 1);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  var rig = new THREE.Group();          // position / scale (scroll + layout)
  var globe = new THREE.Group();        // tilt + spin
  globe.rotation.z = 0.38;
  rig.add(globe);
  scene.add(rig);

  var sun = new THREE.Vector3(-0.55, 0.4, 0.75).normalize();

  // lat/lon (degrees) → point on a sphere; lon 0 faces +z
  function toVec(lat, lon, r) {
    var phi = lat * Math.PI / 180, lam = lon * Math.PI / 180;
    return new THREE.Vector3(r * Math.cos(phi) * Math.sin(lam), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(lam));
  }

  /* ---- globe body: dark navy, lit side, graticule, fresnel rim ---- */
  var bodyMat = new THREE.ShaderMaterial({
    uniforms: { uSun: { value: sun }, uRim: { value: C.rim } },
    vertexShader: [
      'varying vec3 vP; varying vec3 vN; varying vec3 vW;',
      'void main(){',
      '  vP = normalize(position);',
      '  vN = normalize(mat3(modelMatrix) * normal);',
      '  vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;',
      '  gl_Position = projectionMatrix * viewMatrix * w;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uSun, uRim; varying vec3 vP; varying vec3 vN; varying vec3 vW;',
      'void main(){',
      '  vec3 N = normalize(vN), V = normalize(cameraPosition - vW);',
      '  float lit = dot(N, normalize(uSun));',
      '  vec3 col = mix(vec3(0.006, 0.016, 0.042), vec3(0.016, 0.05, 0.12), smoothstep(-0.25, 0.95, lit));',
      '  float lon = atan(vP.x, vP.z), lat = asin(clamp(vP.y, -1.0, 1.0));',
      '  float gl = abs(fract(lon / 0.34906585 + 0.5) - 0.5);',   // every 20 degrees
      '  float gt = abs(fract(lat / 0.34906585 + 0.5) - 0.5);',
      '  float grid = max(smoothstep(0.016, 0.0, gl) * (1.0 - smoothstep(1.2, 1.45, abs(lat))), smoothstep(0.016, 0.0, gt));',
      '  col += vec3(0.16, 0.34, 0.66) * grid * (0.08 + 0.14 * smoothstep(-0.3, 0.9, lit));',
      '  float f = pow(1.0 - max(dot(N, V), 0.0), 2.6);',
      '  col += uRim * f * (0.2 + 0.8 * smoothstep(-0.4, 0.8, lit)) * 0.45;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  });
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), bodyMat));

  /* ---- atmosphere halo ---- */
  var haloMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: C.glow }, uSun: { value: sun } },
    vertexShader: [
      'varying vec3 vNV; varying vec3 vNW;',
      'void main(){ vNV = normalize(normalMatrix * normal); vNW = normalize(mat3(modelMatrix) * normal);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor, uSun; varying vec3 vNV; varying vec3 vNW;',
      'void main(){',
      '  float k = clamp(-vNV.z, 0.0, 1.0);',
      '  float i = pow(smoothstep(0.0, 0.58, k), 2.2);',
      '  float side = 0.45 + 0.55 * smoothstep(-0.6, 0.8, dot(vNW, normalize(uSun)));',
      '  gl_FragColor = vec4(uColor * i * 0.32 * side, 1.0);',
      '}'
    ].join('\n')
  });
  var halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.2, 64, 48), haloMat);
  halo.renderOrder = 1;
  globe.add(halo);

  /* ---- drifting motes ---- */
  var MOTES = 110;
  var moteSeed = new Float32Array(MOTES * 4);
  for (var m = 0; m < MOTES; m++) {
    moteSeed[m * 4] = Math.random();
    moteSeed[m * 4 + 1] = Math.random();
    moteSeed[m * 4 + 2] = Math.random();
    moteSeed[m * 4 + 3] = R * (1.12 + Math.random() * 0.8);
  }
  var moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MOTES * 3), 3));
  moteGeo.setAttribute('aSeed', new THREE.BufferAttribute(moteSeed, 4));
  var moteMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: PR }, uColor: { value: C.rim } },
    vertexShader: [
      'attribute vec4 aSeed; uniform float uTime, uPx; varying float vA;',
      'void main(){',
      '  float a = aSeed.x * 6.2831853 + uTime * (0.03 + aSeed.y * 0.07);',
      '  float ph = acos(2.0 * aSeed.z - 1.0);',
      '  vec3 p = aSeed.w * vec3(sin(ph) * cos(a), cos(ph) + 0.04 * sin(uTime * 0.4 + aSeed.x * 20.0), sin(ph) * sin(a));',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = 5.0 * uPx * (8.0 / -mv.z) * (0.4 + aSeed.y * 0.8);',
      '  vA = 0.2 + 0.5 * (0.5 + 0.5 * sin(uTime * (0.5 + aSeed.y) + aSeed.x * 40.0));',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor; varying float vA;',
      'void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = pow(clamp(1.0 - r, 0.0, 1.0), 2.0) * vA;',
      '  gl_FragColor = vec4(uColor * a, a); }'
    ].join('\n')
  });
  var motes = new THREE.Points(moteGeo, moteMat);
  motes.frustumCulled = false;
  globe.add(motes);

  /* ---- hubs ---- */
  // Colombo is where delivery runs from; the rest are the markets the site
  // names (EU/Sweden, Norway, UK, Australia, New Zealand, US).
  var HUBS = [
    { name: 'Colombo',     lat: 6.93,   lon: 79.85,   hub: true },
    { name: 'Stockholm',   lat: 59.33,  lon: 18.07 },
    { name: 'Rotterdam',   lat: 51.92,  lon: 4.48 },
    { name: 'Oslo',        lat: 59.91,  lon: 10.75 },
    { name: 'London',      lat: 51.51,  lon: -0.13 },
    { name: 'New York',    lat: 40.71,  lon: -74.0 },
    { name: 'Los Angeles', lat: 34.05,  lon: -118.24 },
    { name: 'Sydney',      lat: -33.87, lon: 151.21 },
    { name: 'Auckland',    lat: -36.85, lon: 174.76 }
  ];

  var mPos = new Float32Array(HUBS.length * 3), mSeed = new Float32Array(HUBS.length), mSize = new Float32Array(HUBS.length);
  HUBS.forEach(function (h, i) {
    toVec(h.lat, h.lon, R * 1.012).toArray(mPos, i * 3);
    mSeed[i] = (i * 0.137) % 1;
    mSize[i] = h.hub ? 1.9 : 1.0;
  });
  var mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  mGeo.setAttribute('aSeed', new THREE.BufferAttribute(mSeed, 1));
  mGeo.setAttribute('aSize', new THREE.BufferAttribute(mSize, 1));
  var markerMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: PR }, uScale: { value: 1 }, uColor: { value: C.marker } },
    vertexShader: [
      'attribute float aSeed, aSize; uniform float uTime, uPx, uScale; varying float vPh, vFace, vBig;',
      'void main(){',
      '  vPh = fract(uTime * 0.18 + aSeed); vBig = step(1.5, aSize);',
      '  vec4 w = modelMatrix * vec4(position, 1.0);',
      '  vFace = smoothstep(0.02, 0.2, dot(normalize(w.xyz - modelMatrix[3].xyz), normalize(cameraPosition - w.xyz)));',
      '  vec4 mv = viewMatrix * w; gl_Position = projectionMatrix * mv;',
      '  gl_PointSize = 34.0 * uPx * aSize * (8.0 / -mv.z) * pow(uScale, 0.7);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor; varying float vPh, vFace, vBig;',
      'void main(){',
      '  float r = length(gl_PointCoord - 0.5) * 2.0;',
      '  float core = smoothstep(0.2, 0.06, r);',
      '  float ring = smoothstep(0.09, 0.0, abs(r - vPh)) * (1.0 - vPh);',
      '  float a = (core + ring * 0.85 + vBig * smoothstep(0.5, 0.0, r) * 0.25) * vFace;',
      '  if (a < 0.01) discard;',
      '  gl_FragColor = vec4(uColor * a, a);',
      '}'
    ].join('\n')
  });
  var markers = new THREE.Points(mGeo, markerMat);
  markers.frustumCulled = false;
  globe.add(markers);

  /* ---- lanes + arcs: one LineSegments with a travelling pulse ---- */
  var linePos = [], lineD = [], lineSeed = [], lineK = [];
  var seedCounter = 0;
  function addPolyline(pts, strength) {
    var seed = (seedCounter++ * 0.173) % 1, d = 0;
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], seg = a.distanceTo(b);
      linePos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      lineD.push(d, d + seg); d += seg;
      lineSeed.push(seed, seed);
      lineK.push(strength, strength);
    }
  }
  // densify so a long hop follows the surface instead of cutting through the globe
  function onSphere(lat, lon, r, out, prev) {
    var p = toVec(lat, lon, r);
    if (prev) {
      var ang = prev.angleTo(p), n = Math.ceil(ang / 0.03);
      for (var s = 1; s < n; s++) out.push(prev.clone().lerp(p, s / n).setLength(r));
    }
    out.push(p);
    return p;
  }

  // Colombo → each market, as a lifted great-circle arc
  var colombo = toVec(HUBS[0].lat, HUBS[0].lon, 1);
  HUBS.slice(1).forEach(function (h) {
    var end = toVec(h.lat, h.lon, 1), pts = [], N = 72;
    var ang = colombo.angleTo(end);
    var axis = new THREE.Vector3().crossVectors(colombo, end).normalize();
    for (var i = 0; i <= N; i++) {
      var t = i / N;
      var v = colombo.clone().applyAxisAngle(axis, ang * t);
      pts.push(v.setLength(R * (1.012 + Math.sin(Math.PI * t) * 0.07 * Math.min(1, ang / 1.2 + 0.25))));
    }
    addPolyline(pts, 1.15);
  });

  var linesMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: C.lane } },
    vertexShader: [
      'attribute float aD, aSeed, aK; uniform float uTime; varying float vD, vSeed, vK; varying float vFace;',
      'void main(){',
      '  vD = aD; vSeed = aSeed; vK = aK;',
      '  vec4 w = modelMatrix * vec4(position, 1.0);',
      '  vFace = smoothstep(-0.05, 0.15, dot(normalize(w.xyz - modelMatrix[3].xyz), normalize(cameraPosition - w.xyz)));',
      '  gl_Position = projectionMatrix * viewMatrix * w;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor; uniform float uTime; varying float vD, vSeed, vK; varying float vFace;',
      'void main(){',
      '  float w = fract(vD * 0.32 - uTime * 0.09 + vSeed);',
      '  float pulse = pow(smoothstep(0.72, 1.0, w), 2.0);',
      '  float a = (0.38 + 1.2 * pulse) * vK * vFace;',
      '  gl_FragColor = vec4(uColor * a, a);',
      '}'
    ].join('\n')
  });
  var linesGeo = new THREE.BufferGeometry();
  var lines = new THREE.LineSegments(linesGeo, linesMat);
  lines.frustumCulled = false;
  globe.add(lines);

  function commitLines() {
    linesGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePos), 3));
    linesGeo.setAttribute('aD', new THREE.BufferAttribute(new Float32Array(lineD), 1));
    linesGeo.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(lineSeed), 1));
    linesGeo.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(lineK), 1));
  }
  commitLines();

  // Real shipping lanes (static GeoJSON, same file the /intelligence map uses)
  fetch('/geo/shipping-lanes.geojson', { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (gj) {
      if (!gj || !gj.features) return;
      gj.features.forEach(function (f) {
        var g = f.geometry; if (!g) return;
        var lines2 = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
        lines2.forEach(function (coords) {
          var pts = [], prev = null;
          coords.forEach(function (c) { prev = onSphere(c[1], c[0], R * 1.004, pts, prev); });
          if (pts.length > 1) addPolyline(pts, 0.75);
        });
      });
      commitLines();
      if (reduced) draw(performance.now());
    })
    .catch(function () { /* arcs + graticule still render without the lanes */ });

  /* ---- composer: scene + bloom, then straight to screen ---- */
  var composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  var bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), 0.4, 0.6, 0.02);
  composer.addPass(bloom);
  composer.addPass(new THREE.ShaderPass(THREE.CopyShader));

  /* ---- layout ---- */
  var W = 1, H = 1, aspect = 1, narrow = false;
  function resize() {
    var r = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    aspect = W / H; narrow = aspect < 1.0 || W < 760;
    renderer.setSize(W, H, false);
    composer.setSize(W, H);
    camera.aspect = aspect; camera.updateProjectionMatrix();
    if (reduced) draw(performance.now());
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero); else window.addEventListener('resize', resize);
  resize();

  var halfH = Math.tan(20 * Math.PI / 180) * 8;
  var startRot = -HUBS[0].lon * Math.PI / 180 + 0.35;      // open on the Colombo side of the world
  var tStart = 0, spin = 0, last = 0, visible = true;

  function draw(now) {
    if (!tStart) tStart = now;
    var t = (now - tStart) / 1000;
    var dt = Math.min((now - (last || now)) / 1000, 0.1); last = now;
    if (!reduced) spin += dt * 0.07;

    // scroll: as the hero leaves the viewport the globe drifts up and eases out
    var p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, H)));
    var scale = narrow ? 0.92 : 0.95;
    var x = narrow ? 0 : Math.min(halfH * aspect * 0.5, 4.6);
    var y = (narrow ? -halfH * 0.18 : 0) + p * 0.9;
    rig.position.set(x, y, 0);
    rig.scale.setScalar(scale * (1 - p * 0.15));
    globe.rotation.y = startRot + spin + p * 0.9;

    bodyMat.uniforms.uSun.value.copy(sun);
    linesMat.uniforms.uTime.value = t + (reduced ? 4 : 0);
    markerMat.uniforms.uTime.value = t + (reduced ? 4 : 0);
    markerMat.uniforms.uScale.value = scale;
    moteMat.uniforms.uTime.value = t;
    bloom.strength = narrow ? 0.35 : 0.4;
    composer.render(dt);
  }

  function loop(now) {
    if (!visible) return;
    draw(now);
    requestAnimationFrame(loop);
  }

  // only spend GPU time while the hero is actually on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var v = entries[0].isIntersecting;
      if (v && !visible && !reduced) { visible = true; last = 0; requestAnimationFrame(loop); }
      visible = v;
    }, { threshold: 0 }).observe(hero);
  }

  canvas.classList.add('is-ready');
  hero.classList.add('hero--globe');
  if (reduced) { draw(performance.now()); } else { requestAnimationFrame(loop); }
})();
