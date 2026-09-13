(function () {
  "use strict";

  // Small cosmetic icon map. This is NOT a source of truth for which
  // categories or URLs exist — that always comes from sitemap.html.
  // Any category without an entry here just falls back to a generic icon.
  var ICONS = {
    "getting-started": "📘",
    length: "📏",
    area: "📐",
    volume: "📦",
    weight: "⚖️",
    temperature: "🌡️",
    speed: "🏎️",
    pressure: "🎚️",
    energy: "🔋",
    digital: "💾",
    electricity: "⚡",
    time: "⏱️",
    astronomy: "🌌",
    agriculture: "🌾",
    currency: "💱",
    density: "🧪",
    power: "🔌",
    frequency: "📶",
    "flow-rate": "🚿",
    "fuel-economy": "⛽",
    radiation: "☢️",
    scientific: "🔬",
    torque: "🔧",
    force: "🧲",
    angle: "📐",
    chemistry: "⚗️",
    cooking: "🍳",
    engineering: "⚙️"
  };
  var DEFAULT_ICON = "🔁";

  // Headings that appear in the sitemap's page-card grid but are not
  // unit-conversion categories (they're link groupings for the rest of
  // the site) and must never become filter/nav chips.
  var NON_CATEGORY_HEADINGS = {
    "main pages": true,
    guides: true,
    "trust and legal": true
  };

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("guidesGrid");
    var searchInput = document.getElementById("guidesSearch");
    var chipsWrap = document.getElementById("guidesChips");
    var resultCount = document.getElementById("guidesResultCount");
    var emptyState = document.getElementById("guidesEmpty");
    var emptyTitle = document.getElementById("guidesEmptyTitle");
    var emptyLink = document.getElementById("guidesEmptyLink");

    if (!grid || !chipsWrap) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".guide-card"));
    var activeChip = "all";
    var query = "";

    // Categories that already have written guides on this page. These
    // come straight from the DOM (data-category / badge text), not from
    // the sitemap, since "Getting Started" is guides-only taxonomy.
    var localLabels = {};
    cards.forEach(function (card) {
      var slug = card.dataset.category;
      if (!slug) return;
      if (!localLabels[slug]) {
        var badge = card.querySelector(".guide-card-badge");
        localLabels[slug] = badge ? badge.textContent.trim() : titleCase(slug);
      }
    });
    var localSlugs = Object.keys(localLabels);

    function titleCase(str) {
      return String(str)
        .toLowerCase()
        .replace(/(^|\s|-)\S/g, function (c) {
          return c.toUpperCase();
        });
    }

    function slugFromUrl(url) {
      try {
        var path = new URL(url, window.location.href).pathname;
        var parts = path.split("/").filter(Boolean);
        return parts.length ? parts[0].toLowerCase() : null;
      } catch (e) {
        return null;
      }
    }

    // Parse sitemap.html (fetched separately as raw text) and pull out
    // one {slug, label, url} entry per real category landing page. The
    // first link inside each category's card is always that category's
    // own landing page (e.g. ".../agriculture/"), which is exactly what
    // the chips should link to.
    //
    // sitemap.html lists every individual conversion route (hundreds of
    // thousands of links), so it's tens of megabytes. Parsing it into a
    // full DOM just to read ~30 category headings is far too expensive —
    // instead we scan the raw text with a narrow, anchored regex that
    // only looks at each category card's heading and its very first
    // link, without ever touching the rest of that card's contents.
    var CARD_PATTERN = /<section class="page-card"><div class="sitemap-card-head"><h2>([^<]*)<\/h2><\/div><div class="sitemap-card-scroll"><ul class="sitemap-links"><li><a href="([^"]*)"/g;

    function parseSitemapCategories(html) {
      var found = {};
      var match;
      CARD_PATTERN.lastIndex = 0;
      while ((match = CARD_PATTERN.exec(html)) !== null) {
        var rawName = match[1].trim();
        if (!rawName || NON_CATEGORY_HEADINGS[rawName.toLowerCase()]) continue;

        var href = match[2];
        var slug = slugFromUrl(href);
        if (!slug) continue;

        found[slug] = {
          slug: slug,
          label: titleCase(rawName),
          url: new URL(href, window.location.href).href
        };
      }
      return found;
    }

    // Build the chip row: "All", then every local-only category (e.g.
    // Getting Started), then every category confirmed by sitemap.html —
    // alphabetically, so newly added categories just slot in automatically.
    function renderChips(sitemapCategories) {
      var seen = {};
      var orderedSlugs = [];

      localSlugs.forEach(function (slug) {
        if (!sitemapCategories[slug] && !seen[slug]) {
          seen[slug] = true;
          orderedSlugs.push(slug);
        }
      });

      Object.keys(sitemapCategories)
        .sort(function (a, b) {
          return sitemapCategories[a].label.localeCompare(sitemapCategories[b].label);
        })
        .forEach(function (slug) {
          if (!seen[slug]) {
            seen[slug] = true;
            orderedSlugs.push(slug);
          }
        });

      // Rebuild every chip except "All" so the chip row always reflects
      // exactly what's true right now — nothing manually maintained.
      Array.prototype.slice
        .call(chipsWrap.querySelectorAll('.guide-chip:not([data-chip="all"])'))
        .forEach(function (el) {
          el.remove();
        });

      // Note: orderedSlugs is built only from localSlugs (has written
      // guides) and sitemapCategories (confirmed real landing page), so
      // every slug reaching this loop is known-real one way or the
      // other. A category we have no record of anywhere (no guides, not
      // in sitemap.html) is never in this list at all — we don't
      // fabricate a "Soon" chip for something we can't confirm exists,
      // since that would mean hardcoding its name. applyFilters() still
      // supports a data-soon="1" chip below as a defensive no-op, in
      // case a future static chip is ever added by hand.
      orderedSlugs.forEach(function (slug) {
        var hasGuides = localSlugs.indexOf(slug) !== -1;
        var sitemapEntry = sitemapCategories[slug];
        var label = (sitemapEntry && sitemapEntry.label) || localLabels[slug] || titleCase(slug);
        var icon = ICONS[slug] || DEFAULT_ICON;
        var el;

        if (hasGuides) {
          // Already has written guides on this page: keep the familiar
          // filter behavior, never a "Soon" badge.
          el = document.createElement("button");
          el.type = "button";
          el.className = "guide-chip";
          el.dataset.chip = slug;
          el.setAttribute("aria-pressed", "false");
          el.textContent = icon + " " + label;
        } else {
          // No guides written yet, but sitemap.html confirms the real
          // category landing page exists: link straight to it, no "Soon".
          el = document.createElement("a");
          el.className = "guide-chip guide-chip--link";
          el.href = sitemapEntry.url;
          el.dataset.chip = slug;
          el.textContent = icon + " " + label;
        }

        chipsWrap.appendChild(el);
      });
    }

    function applyFilters() {
      var chip = chipsWrap.querySelector('.guide-chip[data-soon="1"].is-active');
      var isSoon = !!chip;
      var visibleCount = 0;

      if (isSoon) {
        // A genuinely nonexistent category: no real URL to send people
        // to, so point them back at the full sitemap instead of guessing.
        cards.forEach(function (card) {
          card.hidden = true;
        });
        var label = chip.textContent.replace(/Soon\s*$/i, "").trim();
        emptyTitle.textContent = "New " + label + " guides are coming soon.";
        emptyLink.textContent = "Browse all categories \u2192";
        emptyLink.href = "sitemap.html";
        emptyState.hidden = false;
        resultCount.textContent = "";
        return;
      }

      cards.forEach(function (card) {
        var matchesCategory = activeChip === "all" || card.dataset.category === activeChip;
        var matchesQuery = !query || (card.dataset.search || "").indexOf(query) !== -1;
        var visible = matchesCategory && matchesQuery;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      emptyState.hidden = visibleCount !== 0;
      if (visibleCount === 0) {
        emptyTitle.textContent = "No guides matched your search.";
        emptyLink.textContent = "Clear filters \u2192";
        emptyLink.href = "#";
      }

      if (query) {
        resultCount.textContent = visibleCount + (visibleCount === 1 ? " guide" : " guides") + " match \u201c" + query + "\u201d";
      } else {
        resultCount.textContent = visibleCount + (visibleCount === 1 ? " guide" : " guides");
      }
    }

    chipsWrap.addEventListener("click", function (event) {
      var chip = event.target.closest(".guide-chip");
      if (!chip) return;

      // Real navigation chips (confirmed sitemap landing pages with no
      // guides yet) are plain links — let the browser navigate normally.
      if (chip.tagName === "A") return;

      var current = chipsWrap.querySelector(".guide-chip.is-active");
      if (current) {
        current.classList.remove("is-active");
        current.setAttribute("aria-pressed", "false");
      }
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      activeChip = chip.dataset.chip;
      applyFilters();
    });

    emptyState.addEventListener("click", function (event) {
      var link = event.target.closest("#guidesEmptyLink");
      if (!link || link.getAttribute("href") !== "#") return;
      event.preventDefault();
      var allChip = chipsWrap.querySelector('.guide-chip[data-chip="all"]');
      if (allChip) allChip.click();
      if (searchInput) {
        searchInput.value = "";
        query = "";
      }
      applyFilters();
    });

    if (searchInput) {
      var debounceTimer = null;
      searchInput.addEventListener("input", function () {
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(function () {
          query = searchInput.value.trim().toLowerCase();
          applyFilters();
        }, 120);
      });
    }

    // Sitemap.html is the single source of truth for which category
    // landing pages exist. Fetch + parse it, then (re)build the chip row.
    // If this fails for any reason (offline, blocked, etc.) we fall back
    // to the static chips already in the page — which only ever include
    // categories that genuinely have written guides — so nothing
    // incorrect is shown either way.
    fetch("sitemap.html")
      .then(function (response) {
        if (!response.ok) throw new Error("sitemap.html request failed: " + response.status);
        return response.text();
      })
      .then(function (html) {
        var sitemapCategories = parseSitemapCategories(html);
        renderChips(sitemapCategories);
        applyFilters();
      })
      .catch(function (err) {
        console.warn("Could not load sitemap.html to build category chips:", err);
        applyFilters();
      });

    applyFilters();
  });
})();
