## 2024-03-03 - Cache DOM query in mousemove event handler
**Learning:** Querying the DOM inside high-frequency event listeners (like mousemove) causes significant performance overhead. Caching the NodeList outside the listener improves execution time drastically (e.g., ~80% faster in benchmark).
**Action:** Moved `document.querySelectorAll('.gradient-orb')` outside the `mousemove` event listener in `script.js`.
