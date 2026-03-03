## 2026-03-03 - Replaced Scroll Event Listener with IntersectionObserver
**Learning:** Attaching a `scroll` event listener that queries the DOM (`querySelectorAll`) and calculates element positions (`getBoundingClientRect()`) causes severe layout thrashing and main thread blocking, specifically on scrolling interactions.
**Action:** Replace expensive `scroll` event listeners with `IntersectionObserver` for visibility tracking and animations to offload work to the browser and prevent layout thrashing.
