## 2024-05-28 - PII Leak in Frontend Form Submission
**Vulnerability:** The application was logging the entire form submission data (which includes user names and email addresses) to the browser console using `console.log('Form submitted:', data);` in `script.js`. Additionally, the HTML inputs lacked `name` attributes and fundamental `maxlength` bounds.
**Learning:** Even though this is a static frontend, logging form entries can result in sensitive Personally Identifiable Information (PII) being exposed to local browser extensions or shoulder-surfed. Missing form input names also means form functionality could be impaired or easily bypassed, and missing size constraints leave the application open to client-side resource exhaustion if someone pastes enormous payloads.
**Prevention:** Avoid logging complete objects directly to the browser console in production code. Always specify basic bounds (like `maxlength`) on all user input fields to perform fundamental client-side validation.

## 2024-05-29 - DOM-based XSS via innerHTML Concatenation
**Vulnerability:** The mobile menu was constructed by concatenating `innerHTML` strings from existing DOM elements (`navMenu.innerHTML + navCta.innerHTML`), introducing DOM-based XSS risks.
**Learning:** String concatenation of DOM elements using `innerHTML` bypasses DOM sanitization and can execute malicious scripts if the source elements contain unsanitized user input.
**Prevention:** Always use safe DOM cloning methods like `cloneNode(true)` and `appendChild()` instead of `innerHTML` when moving or replicating elements within the DOM.
