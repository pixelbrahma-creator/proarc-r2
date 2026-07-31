/**
 * Generic scroll-reveal system, data-attribute driven so page authors
 * never write bespoke GSAP. animations.css defines the pre-animation
 * state for [data-reveal]; this file animates to the resting state.
 *
 *   data-reveal              fade-up (default)
 *   data-reveal="fade"       opacity only
 *   data-reveal="image"      clip-path reveal, for full-bleed media
 *   data-reveal="scale"      scale-down on enter
 *   data-reveal="left/right" slide in from a side
 *   data-reveal-stagger      on a container: staggers direct [data-reveal] children
 *   data-reveal-delay="0.2"  optional per-element delay (seconds)
 */
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealNow(el) {
    el.classList.add("is-revealed");
  }

  // An element already sitting inside the viewport when the page loads
  // (e.g. hero content anchored near the bottom of a 100vh section) can
  // fail a "top 85%" ScrollTrigger forever: scrolling down moves it OUT
  // of view before scrolling up ever would have carried it past that
  // threshold. Anything visible at load reveals immediately instead.
  function isInInitialViewport(el) {
    var rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  if (reduceMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.querySelectorAll("[data-reveal]").forEach(revealNow);
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var staggerGroups = document.querySelectorAll("[data-reveal-stagger]");
    var handled = new Set();

    staggerGroups.forEach(function (group) {
      var items = Array.prototype.slice.call(group.querySelectorAll(":scope > [data-reveal]"));
      items.forEach(function (el) { handled.add(el); });

      function revealGroup() {
        items.forEach(function (el, i) {
          gsap.delayedCall(i * 0.1, function () { revealNow(el); });
        });
      }

      if (isInInitialViewport(group)) {
        revealGroup();
      } else {
        ScrollTrigger.create({ trigger: group, start: "top 82%", once: true, onEnter: revealGroup });
      }
    });

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (handled.has(el)) return;
      var delay = parseFloat(el.getAttribute("data-reveal-delay") || "0");

      function reveal() {
        if (delay) { gsap.delayedCall(delay, function () { revealNow(el); }); }
        else { revealNow(el); }
      }

      if (isInInitialViewport(el)) {
        reveal();
      } else {
        ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: reveal });
      }
    });
  });
})();
