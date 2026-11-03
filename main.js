/* ==========================================================
   HOUSE OF GEOSMIN — behaviour (theme toggle, project pop-up, etc.)
   You rarely need to edit this file.
   The only thing here you may change: the WhatsApp number below,
   and the rotating messages in the hero.
   ========================================================== */
(function () {
  "use strict";

  var WA_NUMBER = "918884942593"; // country code + number, no + or spaces

  // Rotating one-liners under the hero title. Add, remove or change freely.
  var LINES = [
    "Bengaluru is building differently, and it's starting right here in HSR Layout.",
    "Somewhere in HSR Layout, a foundation is being poured the right way.",
    "Fewer surprises. Cleaner sites. Better buildings. That's the plan.",
    "The city's skyline is changing, one thoughtful site at a time.",
    "Less dust, more design. HSR Layout is where we're laying the first brick."
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- dark / light theme ---------- */
  var root = document.documentElement;
  var meta = $('meta[name="theme-color"]');
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (meta) meta.setAttribute("content", t === "dark" ? "#0d0504" : "#fbf6f1");
  }
  var saved = null;
  try { saved = localStorage.getItem("hog-theme"); } catch (e) {}
  applyTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("#toggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("hog-theme", next); } catch (e) {}
  });

  /* ---------- mobile menu ---------- */
  var nav = $("nav");
  $("#menuBtn").addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    this.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$(".nav-links a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); });
  });

  /* ---------- rotating hero message ---------- */
  var tickerText = $("#tickerText");
  var ticker = $("#ticker");
  var li = 0;
  if (tickerText && LINES.length > 1) {
    setInterval(function () {
      ticker.classList.add("fade");
      setTimeout(function () {
        li = (li + 1) % LINES.length;
        tickerText.textContent = LINES[li];
        ticker.classList.remove("fade");
      }, 600);
    }, 5500);
  }

  /* ---------- scroll reveal + number count-up ---------- */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        if (en.target.hasAttribute("data-count")) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
  }
  function observe(el) {
    if (io) io.observe(el); else el.classList.add("in");
  }
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  $$(".reveal").forEach(observe);
  $$("[data-count]").forEach(observe);

  /* ---------- helpers: images with a safe placeholder ---------- */
  var MARK = '<svg class="mark" viewBox="0 300 1240 1180" aria-hidden="true"><use href="#logo-art"/></svg>';
  function placeholder(label) {
    var d = document.createElement("div");
    d.className = "ph";
    d.innerHTML = MARK + "<span>" + (label || "Photo coming soon") + "</span>";
    return d;
  }
  function makeImg(src, alt) {
    if (!src) return placeholder();
    var img = new Image();
    img.alt = alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = function () {
      if (img.parentNode) img.parentNode.replaceChild(placeholder(), img);
    };
    img.src = src;
    return img;
  }

  /* ---------- projects grid ---------- */
  var projects = (window.PROJECTS || []).filter(function (p) { return p && p.name; });
  var grid = $("#pgrid");

  function photosOf(p) {
    var arr = (p.photos && p.photos.length) ? p.photos.slice() : [];
    if (!arr.length && p.cover) arr.push(p.cover);
    return arr;
  }

  if (grid) {
    if (!projects.length) {
      grid.outerHTML = '<p class="empty">Projects coming soon.</p>';
    } else {
      projects.forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pcard glass reveal";
        b.setAttribute("aria-label", "Open project: " + p.name);

        var media = document.createElement("div");
        media.className = "pmedia";
        media.appendChild(makeImg(p.cover || photosOf(p)[0], p.name));

        var info = document.createElement("div");
        info.className = "pinfo";
        var h = document.createElement("h3");
        h.textContent = p.name;
        var sub = document.createElement("p");
        sub.textContent = [p.location, p.type].filter(Boolean).join(" · ");
        info.appendChild(h);
        info.appendChild(sub);

        b.appendChild(media);
        b.appendChild(info);
        b.addEventListener("click", function () { openProject(i, b); });
        grid.appendChild(b);
        observe(b);
      });
    }
  }

  /* ---------- project pop-up ---------- */
  var modal = $("#modal");
  var stage = $("#mStage");
  var imgBox = $("#mImg");
  var thumbs = $("#mThumbs");
  var countEl = $("#mCount");
  var prevBtn = $("#mPrev");
  var nextBtn = $("#mNext");
  var closeBtn = $("#mClose");
  var cur = 0, photos = [], lastFocus = null, curProject = null;

  function showPhoto(n) {
    if (!photos.length) {
      imgBox.innerHTML = "";
      imgBox.appendChild(placeholder());
      countEl.hidden = true;
      prevBtn.hidden = nextBtn.hidden = true;
      return;
    }
    cur = (n + photos.length) % photos.length;
    var el = makeImg(photos[cur], curProject.name + " – photo " + (cur + 1));
    el.removeAttribute("loading");
    imgBox.innerHTML = "";
    imgBox.appendChild(el);
    countEl.textContent = (cur + 1) + " / " + photos.length;
    countEl.hidden = photos.length < 2;
    $$("button", thumbs).forEach(function (t, i) { t.classList.toggle("on", i === cur); });
    var multi = photos.length > 1;
    prevBtn.hidden = nextBtn.hidden = !multi;
  }

  function openProject(i, trigger) {
    curProject = projects[i];
    photos = photosOf(curProject);
    lastFocus = trigger || document.activeElement;

    $("#mLoc").textContent = curProject.location || "";
    $("#mTitle").textContent = curProject.name;
    $("#mAbout").textContent = curProject.about || "";

    var facts = $("#mFacts");
    facts.innerHTML = "";
    [["Type", curProject.type, true], ["Area", curProject.area], ["Year", curProject.year],
     ["Duration", curProject.duration], ["Scope", curProject.scope, true]].forEach(function (f) {
      if (!f[1]) return;
      var d = document.createElement("div");
      if (f[2]) d.className = "wide";
      var dt = document.createElement("dt"); dt.textContent = f[0];
      var dd = document.createElement("dd"); dd.textContent = f[1];
      d.appendChild(dt); d.appendChild(dd);
      facts.appendChild(d);
    });

    thumbs.innerHTML = "";
    photos.forEach(function (src, k) {
      var tb = document.createElement("button");
      tb.type = "button";
      tb.setAttribute("aria-label", "Show photo " + (k + 1));
      tb.appendChild(makeImg(src, ""));
      tb.addEventListener("click", function () { showPhoto(k); });
      thumbs.appendChild(tb);
    });
    thumbs.hidden = photos.length < 2;

    var msg = "Hi House of Geosmin, I saw your project \"" + curProject.name + "\" and would like to talk about something similar.";
    $("#mCta").href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);

    modal.hidden = false;
    document.body.classList.add("locked");
    imgBox.innerHTML = "";
    showPhoto(0);
    requestAnimationFrame(function () { modal.classList.add("open"); });
    $(".m-info", modal).scrollTop = 0;
    setTimeout(function () { closeBtn.focus(); }, 60);
  }

  function closeProject() {
    modal.classList.remove("open");
    document.body.classList.remove("locked");
    setTimeout(function () { modal.hidden = true; imgBox.innerHTML = ""; }, reduce ? 0 : 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$("[data-close]", modal).forEach(function (el) { el.addEventListener("click", closeProject); });
  prevBtn.addEventListener("click", function () { showPhoto(cur - 1); });
  nextBtn.addEventListener("click", function () { showPhoto(cur + 1); });

  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") closeProject();
    else if (e.key === "ArrowLeft") showPhoto(cur - 1);
    else if (e.key === "ArrowRight") showPhoto(cur + 1);
    else if (e.key === "Tab") {
      var f = $$('button:not([hidden]), a[href]', modal).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe left/right on phones
  var sx = null;
  stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) showPhoto(cur + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });

  /* ---------- footer year ---------- */
  var yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
