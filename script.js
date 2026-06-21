/* =========================================================
   Onion Trace — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav: scrolled state ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var burger = document.getElementById("burger");
  var links = document.querySelector(".nav__links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Reveal on scroll ---- */
  var revealTargets = document.querySelectorAll(
    ".section__head, .card, .sol, .problem__band, .impact__copy, .metric, .member, .cta__inner"
  );
  revealTargets.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 70 + "ms";
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Animated counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var start = 0, dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---- Hero dot-grid + radar pings ---- */
  var canvas = document.getElementById("net");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var w, h, dpr;
    var GAP = 74;          // grid spacing
    var dots = [];         // grid points
    var rings = [];        // static rings around chosen dots
    var pings = [];        // animated expanding rings
    var NAVY = "20,38,68";
    var ORANGE = "255,83,0";
    var lastPing = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      dots = []; rings = []; pings = [];
      var cols = Math.max(4, Math.floor((w - 20) / GAP));
      var rows = Math.max(3, Math.floor((h - 20) / GAP));
      var ox = (w - (cols - 1) * GAP) / 2;
      var oy = (h - (rows - 1) * GAP) / 2;

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          // orange accents cluster toward the right edge
          var orange = c >= cols - 3 && Math.random() < 0.45;
          dots.push({ x: ox + c * GAP, y: oy + r * GAP, orange: orange });
        }
      }

      // a few static rings (radar look); one big ring on the right
      var rightDots = dots.filter(function (d) { return d.x > w * 0.6; });
      if (rightDots.length) {
        var big = rightDots[Math.floor(Math.random() * rightDots.length)];
        big.orange = true; big.big = true;
        rings.push({ x: big.x, y: big.y, r: GAP * 1.6 });
      }
      for (var k = 0; k < 2 && dots.length; k++) {
        var d = dots[Math.floor(Math.random() * dots.length)];
        d.orange = true; d.ringed = true;
        rings.push({ x: d.x, y: d.y, r: GAP * 0.34 });
      }
    }

    function spawnPing(ts) {
      if (reduce) return;
      if (ts - lastPing < 1500) return;
      lastPing = ts;
      var d = dots[Math.floor(Math.random() * dots.length)];
      pings.push({ x: d.x, y: d.y, r: 4, a: 0.55 });
    }

    function draw(ts) {
      ctx.clearRect(0, 0, w, h);

      // static rings
      for (var i = 0; i < rings.length; i++) {
        var rg = rings[i];
        ctx.strokeStyle = "rgba(" + ORANGE + ",.45)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // animated pings
      for (var p = pings.length - 1; p >= 0; p--) {
        var pg = pings[p];
        pg.r += 0.9; pg.a -= 0.006;
        if (pg.a <= 0) { pings.splice(p, 1); continue; }
        ctx.strokeStyle = "rgba(" + ORANGE + "," + pg.a + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pg.x, pg.y, pg.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // dots
      for (var k = 0; k < dots.length; k++) {
        var d = dots[k];
        var rad = d.big ? 6 : d.ringed ? 3.2 : 2.4;
        ctx.fillStyle = d.orange ? "rgba(" + ORANGE + ",.95)" : "rgba(" + NAVY + ",.5)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      spawnPing(ts || 0);
      requestAnimationFrame(draw);
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(init, 200);
    });
    init();
    requestAnimationFrame(draw);
  }
})();
