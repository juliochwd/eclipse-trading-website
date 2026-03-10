## 2024-05-24 - IntersectionObserver instead of scroll event
**Learning:** Found a severe performance bottleneck where `window.addEventListener('scroll')` was executing `querySelectorAll` and `getBoundingClientRect` on every scroll tick. This layout thrashing was causing significant main-thread blocking.
**Action:** Replaced scroll event listeners and manual bounding client checks with `IntersectionObserver` which is handled asynchronously by the browser, completely eliminating the main-thread blocking during scroll.
