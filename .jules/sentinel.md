## 2024-05-28 - PII Leak in Frontend Form Submission
**Vulnerability:** The application was logging the entire form submission data (which includes user names and email addresses) to the browser console using `console.log('Form submitted:', data);` in `script.js`. Additionally, the HTML inputs lacked `name` attributes and fundamental `maxlength` bounds.
**Learning:** Even though this is a static frontend, logging form entries can result in sensitive Personally Identifiable Information (PII) being exposed to local browser extensions or shoulder-surfed. Missing form input names also means form functionality could be impaired or easily bypassed, and missing size constraints leave the application open to client-side resource exhaustion if someone pastes enormous payloads.
**Prevention:** Avoid logging complete objects directly to the browser console in production code. Always specify basic bounds (like `maxlength`) on all user input fields to perform fundamental client-side validation.
## 2024-05-28 - DOM-based XSS via innerHTML
**Vulnerability:** The application was using `innerHTML` to directly set dynamic user input and copy elements, potentially allowing malicious scripts to execute (DOM-based XSS).
**Learning:** Using `innerHTML` string concatenation or copying HTML content exposes the application to XSS.
**Prevention:** Always use safe DOM APIs like `cloneNode(true)` and `appendChild` for copying elements, and `textContent` or `document.createTextNode()` for inserting dynamic user input securely.
