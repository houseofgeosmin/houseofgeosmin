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

  /* ---------- 3D logo: tilt + stars orbiting in and out of it ----------
     Each star follows its own 3D path (circle, flower, figure-eight...). When a star is
     "in front" (z > 0) it is drawn on the front canvas, otherwise on the back canvas
     (behind the logo), so it really seems to pass through the logo.
     Tweak the ORBITS list below to change how many stars there are and how they move. */
  (function () {
    var stage = $("#logoStage"), cb = $("#orbitBack"), cf = $("#orbitFront"), logo = $("#logo3d");
    if (!stage || !cb || !cf || !logo) return;
    var bx = cb.getContext("2d"), fx = cf.getContext("2d");
    var S = 0, dpr = 1;

    function size() {
      var r = cb.getBoundingClientRect();
      S = r.width || 460;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cb.width = cb.height = cf.width = cf.height = Math.round(S * dpr);
    }
    size();
    window.addEventListener("resize", function () { size(); if (reduce) draw(0, 0, 0); });

    var circle = function (t, a) { return [a * Math.cos(t), a * Math.sin(t), 0]; };
    // a = size of the orbit, rx/ry/rz = how it is tilted, w = speed (negative = other way)
    var ORBITS = [
      { a: .60, rx: 1.25, ry: .30,  rz: -.40, w: 1.00, size: 10, col: 0, shape: circle },
      { a: .54, rx: .95,  ry: -.50, rz: .75,  w: -.72, size: 8.5, col: 1,
        shape: function (t, a) { var r = a * (1 + .2 * Math.sin(3 * t)); return [r * Math.cos(t), r * Math.sin(t), 0]; } },   // flower-shaped
      { a: .58, rx: 0,    ry: 0,    rz: .50,  w: 1.25, size: 8.5, col: 2,
        shape: function (t, a) { return [a * Math.sin(t), .5 * a * Math.sin(2 * t), .9 * a * Math.cos(t)]; } },                // figure-eight through the logo
      { a: .44, rx: 1.45, ry: -.80, rz: -.90, w: 1.70, size: 7, col: 0, shape: circle }
    ];
    var COLORS = {
      light: ["#e0401a", "#a81d0b", "#e8892f"],
      dark:  ["#ff8a5c", "#ffd08a", "#ff5a3a"]
    };

    function rot(p, rx, ry, rz) {
      var x = p[0], y = p[1], z = p[2], c, s, t;
      c = Math.cos(rz); s = Math.sin(rz); t = x * c - y * s; y = x * s + y * c; x = t;
      c = Math.cos(rx); s = Math.sin(rx); t = y * c - z * s; z = y * s + z * c; y = t;
      c = Math.cos(ry); s = Math.sin(ry); t = x * c + z * s; z = -x * s + z * c; x = t;
      return [x, y, z];
    }
    function place(o, t, time, lean) {
      var p = rot(o.shape(t, o.a), o.rx + Math.sin(time * .2 + o.a * 9) * .06,
                  o.ry + lean + Math.sin(time * .3) * .12, o.rz + time * .07 * (o.w > 0 ? 1 : -1));
      var k = 1 + .35 * p[2];                       // closer = bigger
      return { x: S / 2 + p[0] * (S / 2) * k, y: S / 2 + p[1] * (S / 2) * k, z: p[2], k: k };
    }
    function star(ctx, x, y, R, spin, color, alpha, glow) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(spin);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = color; ctx.shadowBlur = glow ? R * 3.2 : R;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (var i = 0; i < 8; i++) {
        var rad = (i % 2 ? R * .3 : R), ang = i * Math.PI / 4;
        ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(0, 0, R * .26, 0, 6.2832); ctx.fill();
      ctx.restore();
    }

    function draw(time, lean) {
      var dark = root.getAttribute("data-theme") === "dark";
      var pal = dark ? COLORS.dark : COLORS.light;
      [bx, fx].forEach(function (c) { c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, S, S); c.lineCap = "round"; });
      ORBITS.forEach(function (o, n) {
        var col = pal[o.col], dir = o.w > 0 ? 1 : -1;
        var t0 = time * Math.abs(o.w) * dir + n * 1.7, N = 34, dt = .05 * dir, prev = place(o, t0, time, lean);
        // glowing trail, drawn on whichever canvas the segment is currently on
        for (var i = 1; i <= N; i++) {
          var cur = place(o, t0 - i * dt, time, lean), f = 1 - i / N;
          var ctx = (cur.z + prev.z) / 2 > 0 ? fx : bx;
          ctx.globalAlpha = f * .75 * (cur.z > 0 ? 1 : .6);
          ctx.strokeStyle = col; ctx.lineWidth = Math.max(.8, o.size * .5 * f * cur.k);
          ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(cur.x, cur.y); ctx.stroke();
          prev = cur;
        }
        var h = place(o, t0, time, lean), front = h.z > 0;
        var depthAlpha = .5 + .5 * Math.max(0, Math.min(1, (h.z + .6) / 1.2));
        star(front ? fx : bx, h.x, h.y, o.size * h.k, time * 1.5 + n, col, front ? 1 : depthAlpha, dark);
      });
    }

    // logo tilt: follows the pointer, and gently sways by itself when nobody is moving it
    var tx = 0, ty = 0, cx = 0, cy = 0, lastMove = -1e9, visible = true, startT = null;
    window.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      var nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      var ny = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      tx = Math.max(-1, Math.min(1, nx)) * 26;
      ty = Math.max(-1, Math.min(1, ny)) * -16;
      lastMove = performance.now();
    }, { passive: true });

    function frame(now) {
      if (startT === null) startT = now;
      var time = (now - startT) / 1000;
      if (visible && !document.hidden) {
        var idle = now - lastMove > 2500;
        var gy = idle ? Math.sin(time * .6) * 20 : tx;
        var gx = idle ? Math.cos(time * .45) * 8 : ty;
        cx += (gx - cx) * .06; cy += (gy - cy) * .06;
        logo.style.setProperty("--rx", cx.toFixed(2) + "deg");
        logo.style.setProperty("--ry", cy.toFixed(2) + "deg");
        draw(time, cy * Math.PI / 180 * .5);
      }
      requestAnimationFrame(frame);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(stage);
    }
    if (reduce) {
      logo.style.setProperty("--rx", "-6deg");
      logo.style.setProperty("--ry", "12deg");
      draw(1.2, 0);               // one still frame, no animation
    } else {
      requestAnimationFrame(frame);
    }
  })();

  /* ---------- footer year ---------- */
  var yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
