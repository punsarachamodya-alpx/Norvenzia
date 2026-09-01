/* Live disruption monitor: a real MapLibre GL JS map (WebGL, pan/zoom) on
   CARTO's free "dark-matter" vector basemap -- self-hosted MapLibre build,
   but the basemap itself (style.json + vector tiles + glyphs + sprite) is
   intentionally NOT self-hosted: it's fetched client-side from
   *.basemaps.cartocdn.com (allowed via a named CSP exception in server.js),
   because self-drawing coastlines/borders/graticule ourselves was the
   thing being replaced. No API token is required for this basemap, but its
   attribution is required and stays on (see the AttributionControl below).
   Shipping lanes are real, static maritime geography (persistent sea
   corridors don't change minute to minute) loaded from
   public/geo/shipping-lanes.geojson -- see public/geo/README.md for
   source/license. Disruption events are our own live data, added as a
   GeoJSON source/layer on top. Polls the same-origin /live/data proxy for
   updates -- MIS's real address is never sent to the browser. */
(function () {
  'use strict';

  if (typeof maplibregl === 'undefined') return;

  var CARTO_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
  var POLL_INTERVAL_MS = 15000;

  // "Stale" here means MIS resolved a real-world eventDate (GDELT-reported)
  // that sits well before this event's own firstSeenAt (our own ingest
  // timestamp) -- exactly the symptom described in
  // massifyx-intelligence's RUNBOOK.md ("Live feed data quality"): an event
  // getting stamped with a fresh ingest time even though the underlying
  // incident was weeks/months old. A gap of a few days is normal and
  // expected (a still-developing story can take several days of follow-on
  // coverage before GDELT/MIS settle on a canonical date); a full week or
  // more is well past ordinary reporting lag, so 7 days is the threshold
  // below -- generous enough to not cry wolf on routine lag, tight enough
  // to still catch a real recurrence of the original bug. This doubles as
  // an ongoing sanity check that the backend fix is holding, not just a
  // feature.
  var STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

  // A status-style ramp (severity behaves like a threat level, not a
  // generic magnitude). Never the only channel: every marker/popup also
  // carries a numeric label and a text tooltip/summary. Matches the
  // dataviz-skill-validated ramp already used for the feed badges below.
  var SEVERITY_COLORS = {
    1: '#22c55e',
    2: '#84cc16',
    3: '#fbbf24',
    4: '#f97316',
    5: '#ef4444',
  };

  var root = document.getElementById('live-globe');
  var feedList = document.querySelector('.live-feed__list');
  var feedSearchInput = document.getElementById('live-feed-search');
  var feedSortSelect = document.getElementById('live-feed-sort');
  var feedCountEl = document.querySelector('[data-role="feed-count"]');
  var statsEl = document.querySelector('[data-role="live-stats"]');
  var updatedEl = root ? root.querySelector('[data-role="last-updated"]') : null;
  var dataEl = document.getElementById('live-initial-data');
  var vesselsEl = document.getElementById('live-initial-vessels');
  // Opt-in map-level filter controls (views/live.ejs). Entirely separate
  // from feedSearchInput/feedSortSelect above -- those only ever affect
  // the feed list, never the map.
  var mapFilterChips = Array.prototype.slice.call(document.querySelectorAll('.live-map-filters__chip'));
  var mapFilterStatusRow = document.querySelector('[data-role="map-filter-status-row"]');
  var mapFilterStatusText = document.querySelector('[data-role="map-filter-status-text"]');
  var mapFilterClearBtn = document.querySelector('[data-role="map-filter-clear"]');
  if (!root || !dataEl) return;

  function parseJsonIsland(el) {
    try {
      return JSON.parse((el && el.textContent) || '[]');
    } catch (e) {
      return [];
    }
  }

  var events = parseJsonIsland(dataEl);
  var vessels = vesselsEl ? parseJsonIsland(vesselsEl) : [];

  function severityColor(sev) {
    return SEVERITY_COLORS[sev] || '#94a3b8';
  }

  // item.eventDate is a "YYYY-MM-DD" real-world date (or null) -- parsed as
  // UTC midnight and formatted in UTC so a viewer west of UTC never sees it
  // roll back a day (new Date('2026-07-15') is UTC midnight per spec, but
  // toLocaleDateString() without an explicit timeZone renders in the
  // browser's *local* zone, which would print "Jul 14" for a negative UTC
  // offset). Returns '' for null/missing/malformed -- callers must treat
  // that as "omit," never render "Invalid Date."
  function formatEventDate(dateStr) {
    if (typeof dateStr !== 'string' || !dateStr) return '';
    var ms = Date.parse(dateStr + 'T00:00:00Z');
    if (!Number.isFinite(ms)) return '';
    return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  // See STALE_THRESHOLD_MS above for the 7-day reasoning. Both dates must
  // actually parse -- an unknown/malformed eventDate or firstSeenAt means
  // "no opinion," never a false-positive badge.
  function isStaleEvent(eventDateStr, firstSeenAtStr) {
    if (typeof eventDateStr !== 'string' || !eventDateStr) return false;
    if (typeof firstSeenAtStr !== 'string' || !firstSeenAtStr) return false;
    var eventMs = Date.parse(eventDateStr + 'T00:00:00Z');
    var firstSeenMs = Date.parse(firstSeenAtStr);
    if (!Number.isFinite(eventMs) || !Number.isFinite(firstSeenMs)) return false;
    return (firstSeenMs - eventMs) > STALE_THRESHOLD_MS;
  }

  // The MIS API contract (lib/misContract.js) emits an integer severity
  // 1-5 and a fixed category enum -- "score" here is derived purely for
  // circle-radius scaling; it is not an MIS-provided field and nothing
  // invents facts MIS didn't assert.
  function toEventsGeoJSON(items) {
    return {
      type: 'FeatureCollection',
      features: items
        .filter(function (item) { return Number.isFinite(item.lat) && Number.isFinite(item.lon); })
        .map(function (item) {
          return {
            type: 'Feature',
            id: item.id,
            geometry: { type: 'Point', coordinates: [item.lon, item.lat] },
            properties: {
              id: item.id,
              // title/lat/lon aren't used by the base popup below, but War
              // Room's "Investigate" action (live-warroom.js) needs them to
              // build its investigation request -- carried here so that
              // module never has to re-derive them from the raw feed.
              title: typeof item.title === 'string' ? item.title : item.summary,
              severity: item.severity,
              category: item.category,
              location: item.location,
              summary: item.summary,
              sourceUrl: typeof item.sourceUrl === 'string' ? item.sourceUrl : '',
              score: item.severity * 20,
              lat: item.lat,
              lon: item.lon,
              // Renamed from a former property also called "eventDate" that
              // actually held our own firstSeenAt/lastUpdatedAt ingest
              // bookkeeping, not a real event date -- same fallback, just
              // honestly named now that the real thing exists below.
              reportedAt: typeof item.firstSeenAt === 'string' ? item.firstSeenAt : (typeof item.lastUpdatedAt === 'string' ? item.lastUpdatedAt : ''),
              // The *real* eventDate: MIS/GDELT's real-world "YYYY-MM-DD"
              // date this incident actually happened on, independent of
              // when we first saw it. null when MIS couldn't resolve one --
              // every reader must handle that (formatEventDate/isStaleEvent
              // above already do). Used by the popup's "Occurred" line/stale
              // badge and forwarded as War Room's investigation eventDate.
              eventDate: typeof item.eventDate === 'string' ? item.eventDate : null,
              // Raw first-seen ingest timestamp (distinct from the
              // firstSeenAt/lastUpdatedAt *merge* in reportedAt above) so
              // isStaleEvent() always compares against the actual
              // first-seen moment, not whichever fallback reportedAt chose.
              firstSeenAt: typeof item.firstSeenAt === 'string' ? item.firstSeenAt : '',
            },
          };
        }),
    };
  }

  maplibregl.setWorkerUrl('/js/vendor/maplibre-gl-csp-worker.js');

  // Atlantic/Europe-leaning framing (not a bare equirectangular [0,0]) so
  // the map reads as a deliberately composed section of the page rather
  // than the whole planet shrunk to fit -- paired with the max-height cap
  // in styles.css (.world-map).
  var map = new maplibregl.Map({
    container: root,
    style: CARTO_STYLE_URL,
    center: [10, 35],
    zoom: 1.75,
    minZoom: 1.3,
    maxZoom: 6,
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    renderWorldCopies: false,
  });

  map.touchZoomRotate.disableRotation();

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  // CARTO's basemap is free but requires attribution -- kept on and
  // undisturbed, just moved out from under our own bottom-right legend.
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

  // ---------------------------------------------------- clustering tuning
  //
  // The map only ever zooms across [minZoom, maxZoom] = [1.3, 6] (set in
  // the constructor above) -- a "regional glance" range, never
  // street-level. MIS's real GDELT ingestion was only just unbroken after
  // ~4 weeks of silently producing nothing, so this map has essentially
  // never been exercised with real, steady event volume -- nobody yet
  // knows whether a given moment holds 5 events or 500. These two numbers
  // are therefore a deliberate judgment call tuned for that uncertainty,
  // not a measured constant assuming toy-scale data:
  //
  // - clusterMaxZoom is set one level below the map's own maxZoom (6), so
  //   the very top of the zoom range is a guaranteed, deterministic escape
  //   hatch: zoom all the way in and every event always renders as its own
  //   dot, no matter how tight real-world density gets. Above this zoom,
  //   clustering is off entirely.
  // - clusterRadius is wider than MapLibre's own default (50px) because
  //   this map box is physically small on screen (max-height: 60vh,
  //   min-height: 320px -- see .world-map in styles.css) while still
  //   framing the whole globe by default (zoom 1.75, Atlantic/Europe
  //   framing). At that scale a 50px radius still leaves same-region
  //   disruptions (e.g. several Red Sea/Suez incidents reported within a
  //   day of each other) rendered as overlapping, hard-to-read dots rather
  //   than one legible cluster -- 60px clusters a bit more eagerly to
  //   compensate for the small canvas.
  var CLUSTER_MAX_ZOOM = 5;
  var CLUSTER_RADIUS = 60;
  // Fly-to target for feed-driven navigation (focusEventOnMap below): one
  // zoom level above CLUSTER_MAX_ZOOM, capped at the map's own maxZoom.
  // Flying here guarantees the target event has already left clustering
  // range, so it always renders as its own dot instead of possibly landing
  // back inside a cluster bubble the click can't see into.
  var FOCUS_ZOOM = Math.min(CLUSTER_MAX_ZOOM + 1, map.getMaxZoom());

  // --------------------------------------------------------------- popup

  // Wider than a bare severity/summary popup would need on its own --
  // War Room's investigate section (live-warroom.js) can render tables and
  // citations, which need more room than 260px. .warroom-results also
  // scrolls internally past a height cap, so this stays a popup, not a
  // full panel takeover, even for a long result.
  var popup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, className: 'world-map__popup', maxWidth: '360px' });

  function buildEventPopupContent(props) {
    var wrap = document.createElement('div');

    var severity = document.createElement('strong');
    severity.className = 'world-map__popup-severity';
    severity.style.color = severityColor(props.severity);
    severity.textContent = 'Severity ' + props.severity;
    wrap.appendChild(severity);

    var meta = document.createElement('div');
    meta.className = 'world-map__popup-meta';
    meta.textContent = props.category + ' — ' + props.location;
    wrap.appendChild(meta);

    // Real-world event date, distinct from "reported"/"last updated" --
    // omitted entirely when MIS couldn't resolve one (props.eventDate is
    // null), never rendered as "null" or "Invalid Date".
    var occurredLabel = formatEventDate(props.eventDate);
    if (occurredLabel) {
      var occurred = document.createElement('div');
      occurred.className = 'world-map__popup-occurred';
      occurred.textContent = 'Occurred ' + occurredLabel;
      if (isStaleEvent(props.eventDate, props.firstSeenAt)) {
        var staleBadge = document.createElement('span');
        staleBadge.className = 'world-map__popup-stale';
        staleBadge.textContent = 'Reported late';
        staleBadge.title = 'First reported to us well after the real event date.';
        occurred.appendChild(document.createTextNode(' '));
        occurred.appendChild(staleBadge);
      }
      wrap.appendChild(occurred);
    }

    var summary = document.createElement('p');
    summary.className = 'world-map__popup-summary';
    summary.textContent = props.summary;
    wrap.appendChild(summary);

    if (props.sourceUrl && /^https?:\/\//i.test(props.sourceUrl)) {
      var link = document.createElement('a');
      link.className = 'world-map__popup-source';
      link.href = props.sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Source';
      wrap.appendChild(link);
    }

    // War Room's "Investigate" action (public/js/live-warroom.js) -- a
    // separate, optional script. If it failed to load for any reason the
    // popup above still works exactly as before; this is additive, never
    // load-bearing for the base map/feed.
    if (window.NorvenziaWarroom) {
      wrap.appendChild(window.NorvenziaWarroom.buildSection(props));
    }

    return wrap;
  }

  function openEventPopup(feature) {
    popup.setLngLat(feature.geometry.coordinates).setDOMContent(buildEventPopupContent(feature.properties)).addTo(map);
  }

  // ------------------------------------------------------- map-level filter
  //
  // Opt-in, map-only filtering (views/live.ejs renders the category/
  // severity chips; wiring is below). Entirely separate from
  // feedSearchQuery/feedSortMode further down, which only ever affect the
  // feed *list* -- these two Sets drive what the *map* actually draws.
  // Both start empty, i.e. "no filter, show every event": the map's
  // default behavior is unchanged unless a visitor deliberately presses a
  // chip.
  var mapFilterCategories = new Set();
  var mapFilterSeverities = new Set();

  function isMapFilterActive() {
    return mapFilterCategories.size > 0 || mapFilterSeverities.size > 0;
  }

  function passesMapFilter(item) {
    if (mapFilterCategories.size > 0 && !mapFilterCategories.has(item.category)) return false;
    if (mapFilterSeverities.size > 0 && !mapFilterSeverities.has(item.severity)) return false;
    return true;
  }

  function getMapFilteredEvents() {
    return isMapFilterActive() ? events.filter(passesMapFilter) : events;
  }

  // Filtering is applied at the *data* level -- filtering the events array
  // itself before it becomes a GeoJSON collection -- rather than via a
  // layer-level setFilter(). That distinction matters specifically because
  // of clustering: MapLibre (via supercluster under the hood) computes
  // each cluster's point_count from whatever data the source was last
  // given via setData(); a layer-level filter only hides already-clustered
  // render output, so a filtered-out event would still silently inflate a
  // nearby cluster's count -- exactly the "looks like data vanished, or
  // worse, looks like it didn't" failure this feature needs to avoid.
  // Re-supplying a smaller collection via setData() makes clustering
  // itself recompute over just the visible subset, so point_count always
  // matches what's actually being shown, for both the clustered and
  // unclustered layers alike (they all read from this one source).
  function updateMapFilterStatus(shownCount, totalCount) {
    if (!mapFilterStatusRow || !mapFilterStatusText) return;
    if (!isMapFilterActive()) {
      mapFilterStatusRow.hidden = true;
      return;
    }
    mapFilterStatusRow.hidden = false;
    mapFilterStatusText.textContent = 'Showing ' + shownCount + ' of ' + totalCount +
      (totalCount === 1 ? ' disruption on the map' : ' disruptions on the map');
  }

  mapFilterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var type = chip.dataset.filterType;
      var nextActive = chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', String(nextActive));

      var targetSet = type === 'severity' ? mapFilterSeverities : mapFilterCategories;
      var value = type === 'severity' ? Number(chip.dataset.filterValue) : chip.dataset.filterValue;
      if (nextActive) targetSet.add(value); else targetSet.delete(value);

      renderEventLayers();
    });
  });

  if (mapFilterClearBtn) {
    mapFilterClearBtn.addEventListener('click', function () {
      mapFilterCategories.clear();
      mapFilterSeverities.clear();
      mapFilterChips.forEach(function (chip) { chip.setAttribute('aria-pressed', 'false'); });
      renderEventLayers();
    });
  }

  // ---------------------------------------------------- event/lane layers

  var hoveredEventId = null;

  function renderEventLayers() {
    var filteredEvents = getMapFilteredEvents();
    var collection = toEventsGeoJSON(filteredEvents);
    updateMapFilterStatus(filteredEvents.length, events.length);

    var source = map.getSource('events');
    if (source) {
      source.setData(collection);
      return;
    }

    // promoteId lets MapLibre key feature-state (used for the hover
    // highlight below) by our own stable event id -- meaningful only for
    // unclustered points; cluster pseudo-features get their own
    // synthetic cluster_id from supercluster and never carry feature
    // state. cluster/clusterMaxZoom/clusterRadius: see the CLUSTER_*
    // constants above for the reasoning behind these specific numbers.
    map.addSource('events', {
      type: 'geojson',
      data: collection,
      promoteId: 'id',
      cluster: true,
      clusterMaxZoom: CLUSTER_MAX_ZOOM,
      clusterRadius: CLUSTER_RADIUS,
    });

    var severityColorExpression = [
      'match', ['get', 'severity'],
      1, SEVERITY_COLORS[1],
      2, SEVERITY_COLORS[2],
      3, SEVERITY_COLORS[3],
      4, SEVERITY_COLORS[4],
      5, SEVERITY_COLORS[5],
      '#94a3b8',
    ];
    var hovered = ['boolean', ['feature-state', 'hover'], false];
    // Cluster pseudo-features carry no severity/score properties of their
    // own (only point_count/point_count_abbreviated/cluster_id) -- without
    // this filter, the severity/score expressions above would evaluate
    // against missing data for every cluster feature rendered through
    // these two layers. These layers keep exactly the pre-clustering
    // individual-event look; only which features they draw has changed.
    var unclusteredFilter = ['!', ['has', 'point_count']];

    map.addLayer({
      id: 'events-glow',
      type: 'circle',
      source: 'events',
      filter: unclusteredFilter,
      paint: {
        'circle-color': severityColorExpression,
        'circle-radius': ['interpolate', ['linear'], ['get', 'score'], 20, 12, 100, 26],
        'circle-opacity': 0.18,
        'circle-blur': 0.6,
      },
    });

    map.addLayer({
      id: 'events-dots',
      type: 'circle',
      source: 'events',
      filter: unclusteredFilter,
      paint: {
        'circle-color': severityColorExpression,
        'circle-radius': [
          '+',
          ['interpolate', ['linear'], ['get', 'score'], 20, 5, 100, 13],
          ['case', hovered, 3, 0],
        ],
        'circle-stroke-width': ['case', hovered, 2.5, 1.5],
        'circle-stroke-color': ['case', hovered, '#ffffff', '#0a1628'],
      },
    });

    // Cluster circle + count label -- MapLibre's standard step-by-
    // point_count pattern. Colored on its own slate/navy scale, never
    // SEVERITY_COLORS: a cluster can (and, at real volume, likely will)
    // mix events of different severities, so reusing the severity ramp
    // here would falsely imply a single severity reading for the whole
    // group -- two different kinds of fact never share one visual channel
    // on this map (same principle as the vessel markers elsewhere in this
    // file). Three buckets (<10 / 10-49 / 50+) are deliberately wide given
    // the real-volume uncertainty described above: fine whether a given
    // cluster ends up holding 3 events or 300.
    map.addLayer({
      id: 'events-clusters',
      type: 'circle',
      source: 'events',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          '#5b7699',
          10, '#3a5a82',
          50, '#1c3a63',
        ],
        'circle-radius': [
          'step', ['get', 'point_count'],
          16,
          10, 22,
          50, 30,
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': 'rgba(255, 255, 255, 0.35)',
      },
    });

    map.addLayer({
      id: 'events-cluster-count',
      type: 'symbol',
      source: 'events',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        // Confirmed present in CARTO dark-matter's own style.json glyph
        // stack (it ships this exact fallback pair for its own labels),
        // not a guess -- an unavailable font name would silently render no
        // text at all.
        'text-font': ['Open Sans Bold', 'Noto Sans Regular'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });

    map.on('mousemove', 'events-dots', function (e) {
      map.getCanvas().style.cursor = 'pointer';
      var feature = e.features && e.features[0];
      if (!feature) return;
      if (hoveredEventId !== null && hoveredEventId !== feature.id) {
        map.setFeatureState({ source: 'events', id: hoveredEventId }, { hover: false });
      }
      hoveredEventId = feature.id;
      map.setFeatureState({ source: 'events', id: hoveredEventId }, { hover: true });
    });
    map.on('mouseleave', 'events-dots', function () {
      map.getCanvas().style.cursor = '';
      if (hoveredEventId !== null) {
        map.setFeatureState({ source: 'events', id: hoveredEventId }, { hover: false });
      }
      hoveredEventId = null;
    });
    map.on('click', 'events-dots', function (e) {
      var feature = e.features && e.features[0];
      if (feature) openEventPopup(feature);
    });

    // Clicking a cluster zooms toward it rather than doing nothing or
    // opening an ambiguous popup for a mixed group of events --
    // getClusterExpansionZoom queries supercluster (via the source) for
    // the exact zoom at which this specific cluster's own points stop
    // being grouped together, so the zoom-in always lands precisely where
    // the cluster actually resolves rather than an arbitrary "+1 zoom"
    // guess. This vendored MapLibre GL JS build (v4.7.1) resolves this as
    // a Promise, not the older callback(err, zoom) shape -- verified by
    // reading the actual bundle in public/js/vendor/maplibre-gl-csp.js
    // rather than assumed.
    map.on('mouseenter', 'events-clusters', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'events-clusters', function () {
      map.getCanvas().style.cursor = '';
    });
    map.on('click', 'events-clusters', function (e) {
      var feature = e.features && e.features[0];
      if (!feature) return;
      var clusterId = feature.properties.cluster_id;
      map.getSource('events').getClusterExpansionZoom(clusterId).then(function (zoom) {
        map.easeTo({ center: feature.geometry.coordinates, zoom: zoom });
      }).catch(function () {
        // The cluster may have already changed shape (a poll landed, or
        // the filter changed) by the time this resolves -- fail quietly
        // rather than throwing an unhandled rejection.
      });
    });
  }

  function renderLaneLayer() {
    if (map.getSource('lanes')) return;
    map.addSource('lanes', { type: 'geojson', data: '/geo/shipping-lanes.geojson' });
    // Real, static maritime corridors -- texture, not subject. Thin,
    // low-opacity, muted (not the site's vivid cyan/severity hues) and
    // deliberately unanimated: this is persistent geography, not a live
    // feed, and looks it. No per-lane width variation either -- the
    // source dataset carries no real traffic-volume figure to scale by,
    // and inventing one would be exactly the "looks real but isn't" trap
    // this is meant to avoid.
    map.addLayer({
      id: 'lanes',
      type: 'line',
      source: 'lanes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#5b7699',
        'line-width': 0.9,
        'line-opacity': 0.32,
      },
    }, 'events-glow');
  }

  map.on('load', function () {
    // events-glow/events-dots must exist before lanes is inserted "before"
    // events-glow, to land the required bottom-to-top stack: basemap ->
    // lanes -> event glow -> event dots.
    renderEventLayers();
    renderLaneLayer();
  });

  // -------------------------------------------------------------- vessels
  // Vessels stay as MapLibre DOM Markers (not a native layer): a heading
  // arrow needs per-marker rotation, and there's no icon/sprite asset to
  // drive a symbol layer with. Distinct shape (arrow) and hue (cyan) from
  // the disruption circles -- two different entities never share one
  // visual channel.

  var vesselTooltip = document.createElement('div');
  vesselTooltip.className = 'world-map__tooltip';
  vesselTooltip.hidden = true;
  root.appendChild(vesselTooltip);

  function hideVesselTooltip() {
    vesselTooltip.hidden = true;
  }

  function showVesselTooltip(anchorEl, vessel) {
    vesselTooltip.innerHTML = '';
    var name = document.createElement('strong');
    name.className = 'world-map__tooltip-severity';
    name.textContent = vessel.shipName || 'Unnamed vessel';
    var meta = document.createElement('div');
    meta.className = 'world-map__tooltip-meta';
    var bits = ['MMSI ' + vessel.mmsi];
    if (Number.isFinite(vessel.speedKnots)) bits.push(vessel.speedKnots.toFixed(1) + ' kn');
    meta.textContent = bits.join(' — ');
    vesselTooltip.appendChild(name);
    vesselTooltip.appendChild(meta);
    vesselTooltip.hidden = false;
    positionVesselTooltip(anchorEl);
  }

  function positionVesselTooltip(anchorEl) {
    var anchorRect = anchorEl.getBoundingClientRect();
    var rootRect = root.getBoundingClientRect();
    vesselTooltip.style.left = anchorRect.left - rootRect.left + anchorEl.offsetWidth / 2 + 'px';
    vesselTooltip.style.top = anchorRect.top - rootRect.top + 'px';
  }

  var vesselMarkers = [];

  function clearMarkers(list) {
    list.forEach(function (marker) { marker.remove(); });
    list.length = 0;
  }

  function renderVesselMarkers() {
    clearMarkers(vesselMarkers);
    vessels
      .filter(function (v) { return Number.isFinite(v.lat) && Number.isFinite(v.lon); })
      .forEach(function (vessel) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'world-map__vessel';
        el.title = (vessel.shipName || 'Unnamed vessel') + ' — MMSI ' + vessel.mmsi;

        el.addEventListener('mouseenter', function () { showVesselTooltip(el, vessel); });
        el.addEventListener('focus', function () { showVesselTooltip(el, vessel); });
        el.addEventListener('mouseleave', hideVesselTooltip);
        el.addEventListener('blur', hideVesselTooltip);

        var marker = new maplibregl.Marker({ element: el, anchor: 'center', rotationAlignment: 'map' })
          .setLngLat([vessel.lon, vessel.lat])
          .setRotation(Number.isFinite(vessel.headingDeg) ? vessel.headingDeg : 0)
          .addTo(map);
        vesselMarkers.push(marker);
      });
  }

  map.on('load', function () {
    renderVesselMarkers();
  });

  // ----------------------------------------------------------------- feed

  function findEventById(id) {
    for (var i = 0; i < events.length; i++) {
      if (events[i].id === id) return events[i];
    }
    return null;
  }

  // Clicking (or Enter/Space-ing) a feed item flies the map to it and
  // opens the same popup a direct map click would -- the list and the map
  // are two views over the same data, so they stay cross-linked. Flies to
  // FOCUS_ZOOM specifically (not just "some closer zoom") so the target
  // event is always above CLUSTER_MAX_ZOOM and therefore guaranteed to
  // render as its own dot, never left grouped inside a cluster bubble a
  // single feed click can't see into. Note this is independent of the
  // map's own opt-in filter (mapFilterCategories/mapFilterSeverities
  // above): the feed list is always the full, unfiltered set, so if a map
  // filter is currently active and happens to exclude this event, the dot
  // itself won't be there even after flying in -- the popup still opens
  // (it's built straight from the feed's own data, not from the rendered
  // map layer), and the ever-visible "Showing X of Y" status makes it
  // clear why no marker appeared, rather than this looking like a bug.
  function focusEventOnMap(id) {
    var event = findEventById(id);
    if (!event || !Number.isFinite(event.lat) || !Number.isFinite(event.lon)) return;
    map.flyTo({ center: [event.lon, event.lat], zoom: Math.max(map.getZoom(), FOCUS_ZOOM), essential: true });
    var geoJsonEvent = toEventsGeoJSON([event]).features[0];
    openEventPopup(geoJsonEvent);
  }

  if (feedList) {
    feedList.addEventListener('click', function (e) {
      if (e.target.closest('.live-feed__source')) return; // let the source link behave normally
      var item = e.target.closest('.live-feed__item');
      if (item && item.dataset.eventId) focusEventOnMap(item.dataset.eventId);
    });
    feedList.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var item = e.target.closest('.live-feed__item');
      if (!item || !item.dataset.eventId) return;
      e.preventDefault();
      focusEventOnMap(item.dataset.eventId);
    });
  }

  // Search/sort apply only to the feed *list* -- the map's own default is
  // still to show every event regardless (mapFilterCategories/
  // mapFilterSeverities above start empty and only ever change via an
  // explicit chip press), so filtering the list is a reading convenience,
  // never a way to accidentally hide real data from the map itself.
  var feedSearchQuery = '';
  var feedSortMode = 'newest';

  function eventTimestamp(e) {
    var raw = typeof e.lastUpdatedAt === 'string' ? e.lastUpdatedAt : (typeof e.firstSeenAt === 'string' ? e.firstSeenAt : '');
    var ms = raw ? Date.parse(raw) : NaN;
    return Number.isFinite(ms) ? ms : 0;
  }

  function matchesSearch(e, query) {
    if (!query) return true;
    var haystack = [e.summary, e.location, e.category].filter(Boolean).join(' ').toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  // 'event-date' sort mode: the real GDELT-reported eventDate ("YYYY-MM-DD",
  // parsed as UTC midnight) when MIS resolved one. Fallback rule: an event
  // with no real eventDate falls back to eventTimestamp() (our own
  // lastUpdatedAt/firstSeenAt ingest bookkeeping) rather than being sorted
  // to one arbitrary end of the list -- "we don't know the real date" is
  // not the same claim as "this just happened" or "this is ancient," so it
  // sorts by whatever timestamp we *do* have instead of a sentinel value.
  function eventDateSortValue(e) {
    var ms = typeof e.eventDate === 'string' && e.eventDate ? Date.parse(e.eventDate + 'T00:00:00Z') : NaN;
    return Number.isFinite(ms) ? ms : eventTimestamp(e);
  }

  function getVisibleFeedEvents() {
    var query = feedSearchQuery.trim().toLowerCase();
    var list = events.filter(function (e) { return matchesSearch(e, query); });

    list.sort(function (a, b) {
      if (feedSortMode === 'severity-desc') return b.severity - a.severity;
      if (feedSortMode === 'severity-asc') return a.severity - b.severity;
      if (feedSortMode === 'event-date') return eventDateSortValue(b) - eventDateSortValue(a);
      return eventTimestamp(b) - eventTimestamp(a); // 'newest' (default)
    });

    return list;
  }

  function updateFeedCount(shown, total) {
    if (!feedCountEl) return;
    feedCountEl.textContent = shown === total
      ? shown + (shown === 1 ? ' disruption' : ' disruptions')
      : shown + ' of ' + total + (total === 1 ? ' disruption' : ' disruptions') + ' shown';
  }

  if (feedSearchInput) {
    feedSearchInput.addEventListener('input', function () {
      feedSearchQuery = feedSearchInput.value;
      renderFeed();
    });
  }
  if (feedSortSelect) {
    feedSortSelect.addEventListener('change', function () {
      feedSortMode = feedSortSelect.value;
      renderFeed();
    });
  }

  // At-a-glance category/severity breakdown, computed purely from the
  // `events` array already in memory -- never a new request, so MIS's real
  // address still never reaches the browser (see this file's header
  // comment). Deliberately uses the *full* `events` list, not the
  // search-filtered feed: this answers "what's happening right now
  // globally," not "what's currently on screen after I typed in the search
  // box." Called from renderFeed() below so it refreshes on every poll()
  // too, not just on first load.
  function renderStatsStrip() {
    if (!statsEl) return;
    statsEl.innerHTML = '';

    if (events.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'live-stats__empty';
      empty.textContent = 'No active disruptions to summarize.';
      statsEl.appendChild(empty);
      return;
    }

    var categoryCounts = {};
    var severityCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    events.forEach(function (e) {
      var cat = typeof e.category === 'string' && e.category ? e.category : 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      if (severityCounts[e.severity] !== undefined) severityCounts[e.severity] += 1;
    });

    // Highest-count category first -- "glanceable" means leading with
    // what's actually dominant right now, not a fixed enum order.
    var categories = Object.keys(categoryCounts).sort(function (a, b) {
      return categoryCounts[b] - categoryCounts[a] || a.localeCompare(b);
    });

    var categoryGroup = document.createElement('div');
    categoryGroup.className = 'live-stats__group';
    categoryGroup.setAttribute('aria-label', 'Disruptions by category');
    var categoryHeading = document.createElement('h3');
    categoryHeading.className = 'live-stats__heading';
    categoryHeading.textContent = 'By category';
    categoryGroup.appendChild(categoryHeading);
    var categoryList = document.createElement('ul');
    categoryList.className = 'live-stats__categories';
    categories.forEach(function (cat) {
      var li = document.createElement('li');
      // Full "count category" text per item -- never relies on the CSS
      // separator glyph alone for meaning (that's purely decorative).
      li.textContent = categoryCounts[cat] + ' ' + cat;
      categoryList.appendChild(li);
    });
    categoryGroup.appendChild(categoryList);
    statsEl.appendChild(categoryGroup);

    var severityGroup = document.createElement('div');
    severityGroup.className = 'live-stats__group';
    severityGroup.setAttribute('aria-label', 'Disruptions by severity');
    var severityHeading = document.createElement('h3');
    severityHeading.className = 'live-stats__heading';
    severityHeading.textContent = 'By severity';
    severityGroup.appendChild(severityHeading);
    var severityList = document.createElement('ul');
    severityList.className = 'live-stats__severity';
    var maxSeverityCount = Math.max.apply(null, [1, severityCounts[1], severityCounts[2], severityCounts[3], severityCounts[4], severityCounts[5]]);
    [1, 2, 3, 4, 5].forEach(function (sev) {
      var count = severityCounts[sev];
      if (count === 0) return; // skip bands with nothing active rather than padding the strip with empty rows

      var li = document.createElement('li');
      li.className = 'live-stats__severity-row';

      // Reuses SEVERITY_COLORS -- the same ramp as the map/feed/legend, not
      // a second color scale. The swatch is aria-hidden: the bar's length
      // and the text label right after it both already carry the real
      // information, so color here is decorative reinforcement only.
      var swatch = document.createElement('span');
      swatch.className = 'live-stats__severity-swatch';
      swatch.style.background = severityColor(sev);
      swatch.setAttribute('aria-hidden', 'true');
      li.appendChild(swatch);

      var track = document.createElement('span');
      track.className = 'live-stats__severity-track';
      track.setAttribute('aria-hidden', 'true');
      var fill = document.createElement('span');
      fill.className = 'live-stats__severity-fill';
      fill.style.width = Math.round((count / maxSeverityCount) * 100) + '%';
      fill.style.background = severityColor(sev);
      track.appendChild(fill);
      li.appendChild(track);

      var text = document.createElement('span');
      text.className = 'live-stats__severity-text';
      text.textContent = 'Severity ' + sev + ' — ' + count + (count === 1 ? ' disruption' : ' disruptions');
      li.appendChild(text);

      severityList.appendChild(li);
    });
    severityGroup.appendChild(severityList);
    statsEl.appendChild(severityGroup);
  }

  function renderFeed() {
    renderStatsStrip();
    if (!feedList) return;
    var visible = getVisibleFeedEvents();
    updateFeedCount(visible.length, events.length);
    feedList.innerHTML = '';
    visible.forEach(function (e) {
      var li = document.createElement('li');
      li.className = 'live-feed__item';
      li.dataset.eventId = e.id;
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', 'Show this disruption on the map');

      var sev = document.createElement('span');
      sev.className = 'live-feed__severity live-feed__severity--' + e.severity;
      sev.textContent = String(e.severity);

      var cat = document.createElement('span');
      cat.className = 'live-feed__category';
      cat.textContent = e.category;

      var loc = document.createElement('span');
      loc.className = 'live-feed__location';
      loc.textContent = e.location;

      li.appendChild(sev);
      li.appendChild(cat);
      li.appendChild(loc);

      // Real event date, distinct from "reported"/"last updated" -- omitted
      // entirely when MIS couldn't resolve one (e.eventDate is null/absent),
      // never rendered as "null" or "Invalid Date".
      var occurredLabel = formatEventDate(e.eventDate);
      if (occurredLabel) {
        var occurred = document.createElement('span');
        occurred.className = 'live-feed__occurred';
        occurred.textContent = 'Occurred ' + occurredLabel;
        if (isStaleEvent(e.eventDate, e.firstSeenAt)) {
          var staleBadge = document.createElement('span');
          staleBadge.className = 'live-feed__stale-badge';
          staleBadge.textContent = 'Reported late';
          staleBadge.title = 'First reported to us well after the real event date.';
          occurred.appendChild(document.createTextNode(' '));
          occurred.appendChild(staleBadge);
        }
        li.appendChild(occurred);
      }

      var summary = document.createElement('p');
      summary.className = 'live-feed__summary';
      summary.textContent = e.summary;
      li.appendChild(summary);

      if (typeof e.sourceUrl === 'string' && /^https?:\/\//i.test(e.sourceUrl)) {
        var link = document.createElement('a');
        link.className = 'live-feed__source';
        link.href = e.sourceUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Source';
        li.appendChild(link);
      }

      feedList.appendChild(li);
    });
  }

  function updateStatusLine() {
    if (!updatedEl) return;
    var count = events.length;
    var noun = count === 1 ? 'active disruption' : 'active disruptions';
    updatedEl.textContent = count + ' ' + noun + ' · Last updated ' + new Date().toLocaleTimeString();
  }

  updateStatusLine();
  renderFeed(); // populate the feed count immediately, don't wait for the first poll

  function poll() {
    fetch('/live/data')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        vessels = Array.isArray(data.vessels) ? data.vessels : [];
        renderVesselMarkers();
        if (data.available) {
          events = data.events;
          renderEventLayers();
          renderFeed();
        }
        updateStatusLine();
      })
      .catch(function () {
        // A transient poll failure just keeps showing the last-known data.
      });
  }

  setInterval(poll, POLL_INTERVAL_MS);

  // ------------------------------------------------- War Room screenshot slider
  // A bare CSS scroll-snap strip already works with zero JS (swipe/scroll/
  // drag); these buttons are a progressive enhancement on top, not
  // load-bearing for the carousel to function.
  var sliderTrack = document.getElementById('warroom-slider-track');
  if (sliderTrack) {
    var prevBtn = document.querySelector('.warroom-slider__nav--prev');
    var nextBtn = document.querySelector('.warroom-slider__nav--next');
    var scrollByOneSlide = function (direction) {
      var slide = sliderTrack.querySelector('.warroom-slider__slide');
      var amount = slide ? slide.getBoundingClientRect().width + 14 : sliderTrack.clientWidth;
      sliderTrack.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };
    if (prevBtn) prevBtn.addEventListener('click', function () { scrollByOneSlide(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollByOneSlide(1); });
  }
})();
