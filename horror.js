"use strict";

// 末尾のホラー演出。文言や待ち時間はここで変更できます。
const KAGARI_HORROR = {
  enabled: true,
  delay: 1000,
  entry: "00｜ここまで来た人",
  greeting: "あぁ、君はちゃんと来れたんだ。",
  message: "まだ、帰らないよね。",
};

(() => {
  const marker = document.getElementById("horror-marker");
  const dialog = document.getElementById("horror-dialog");
  if (!KAGARI_HORROR.enabled || !marker || !dialog || !window.IntersectionObserver
      || typeof dialog.showModal !== "function") return;
  // データの読込に失敗した時や、項目がない時には演出を出しません。
  if (!document.querySelector("#phenomena .card")) return;

  const close = document.getElementById("horror-close");
  const search = document.getElementById("search");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let used = false;
  let reached = false;
  let timer = null;
  let previousFocus = null;

  document.getElementById("horror-entry").textContent = KAGARI_HORROR.entry;
  document.getElementById("horror-greeting").textContent = KAGARI_HORROR.greeting;
  document.getElementById("horror-message").textContent = KAGARI_HORROR.message;

  function cancelPending() {
    if (timer !== null) { clearTimeout(timer); timer = null; }
  }

  function maybeStart() {
    if (used || !reached || timer !== null || window.scrollY < 80 || search?.value.trim()) return;
    timer = setTimeout(() => {
      timer = null;
      if (used || !reached || search?.value.trim() || document.hidden) return;
      used = true;
      observer.disconnect();
      window.removeEventListener("scroll", maybeStart);
      previousFocus = document.activeElement;
      marker.textContent = "……まだ、一件残っています。";
      document.body.classList.add("horror-open");
      dialog.classList.toggle("horror-still", reduceMotion);
      dialog.showModal();
      close.focus({ preventScroll: true });
    }, KAGARI_HORROR.delay);
  }

  const observer = new IntersectionObserver(entries => {
    reached = entries.some(entry => entry.isIntersecting);
    if (reached) maybeStart();
    else cancelPending();
  }, { threshold: 0.5 });
  observer.observe(marker);
  window.addEventListener("scroll", maybeStart, { passive: true });
  search?.addEventListener("input", () => { cancelPending(); if (!search.value.trim()) maybeStart(); });
  document.addEventListener("visibilitychange", () => { cancelPending(); if (!document.hidden) maybeStart(); });

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.body.classList.remove("horror-open");
    marker.textContent = "ここは、人を選ぶ家。";
    if (previousFocus && previousFocus !== document.body && document.contains(previousFocus)) {
      previousFocus.focus({ preventScroll: true });
    }
  });
})();
