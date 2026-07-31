/**
 * Single shared scroll init — Lenis drives smooth scroll, ScrollTrigger
 * is synced to it via one requestAnimationFrame loop. Loaded once per
 * page; every other script (reveals.js, home.js, projects-filter.js)
 * assumes this has already run.
 */
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-ready");

  if (reduceMotion || typeof Lenis === "undefined") {
    window.__lenis = null;
    return;
  }

  var lenis = new Lenis({
    duration: 1.15,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
  });

  window.__lenis = lenis;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    });
  }
})();
