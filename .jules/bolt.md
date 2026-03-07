## 2024-03-03 - Cache DOM query in mousemove event handler
**Learning:** Querying the DOM inside high-frequency event listeners (like mousemove) causes significant performance overhead. Caching the NodeList outside the listener improves execution time drastically (e.g., ~80% faster in benchmark).
**Action:** Moved `document.querySelectorAll('.gradient-orb')` outside the `mousemove` event listener in `script.js`.

## 2024-05-15 - Replace Scroll Event Listeners with IntersectionObserver
**Learning:** Using `window.addEventListener('scroll', ...)` for scroll animations triggers high-frequency calculations (like `getBoundingClientRect()`) which can lead to layout thrashing and high main-thread usage. The existing approach re-queried elements and their bounds continuously on every scroll event.
**Action:** Replaced scroll event listeners with `IntersectionObserver` to trigger scroll animations. It moves calculation off the main thread and improves rendering performance and scrolling smoothness.
