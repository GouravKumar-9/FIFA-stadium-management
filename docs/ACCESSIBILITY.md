# ACCESSIBILITY.md — StadiumSense AI WCAG Compliance

StadiumSense AI is built around WCAG 2.1 AA accessibility guidelines as a fundamental core criteria, not a post-build enhancement.

## 1. Implemented WCAG 2.1 AA Compliance Features

### A. Non-Text Content (Contrast & Patterns)
- **Heatmaps & Density Indicators**: We never rely on color alone (e.g. Red, Yellow, Green) to represent crowd density. Every gate details card contains:
  - Textual status badges (`Congested`, `Heavy Flow`, `Clear`).
  - Density numbers (`86%`, `49%`).
  - **Diagonal Striped Patterns**: Critical status bars include a custom overlay pattern so color-blind users can instantly distinguish congestion hotspots.

### B. Keyboard Navigability & Visual Focus
- **Visible Focus Indicator**: Standard browser focus outlines are preserved and enhanced inside [index.css](file:///d:/FIFA2/frontend/src/index.css) using a high-contrast blue focus ring (`outline: 2px solid #3b82f6` with offset).
- **Logical Tab Index**: All interactive elements (select boxes, inputs, buttons) reside in natural source code order, matching sequential keyboard traversal. Non-interactive direction tables include explicit `tabIndex={0}` to allow keyboard focus and scroll.

### C. Screen Reader Integration
- **Semantic HTML**: Standard structure layouts (`nav`, `header`, `main`, `footer`) are used.
- **ARIA Labels**: Interactive buttons such as the voice recorder, role selectors, and SVG paths include detailed `aria-label` tags for descriptive screen-reader translation.
- **Textual Wayfinding**: The interactive SVG map is coupled with a plain-text directions queue. Screen readers read the step-by-step path (e.g. "Take elevator EL-B to Concourse Level 2") sequentially without needing to parse coordinate map paths.

### D. Language & Locale Dynamic Updates
- **Document Language sync**: When the user switches language in the header (e.g., from English to Arabic), the app updates the root HTML element attribute:
  ```javascript
  document.documentElement.lang = selectedLanguage;
  ```
  This signals screen-readers to immediately switch speech pronunciation profiles, preventing garbled screen-reader output.

---

## 2. Post-Hackathon Accessibility Enhancements Roadmap

To further exceed WCAG 2.1 AA standards in a production deployment, we would implement:
1. **Live Sign-Language Avatars**: Integrate real-time sign language avatars translating announcements and Concierge responses for deaf visitors.
2. **Audio Induction Loops**: Synchronize with stadium hardware to broadcast speech-to-text audio streams directly to assistive hearing devices.
3. **Tactile Wayfinding Maps**: Integrate physical Braille terminal maps located at Gates A-D that coordinate with the App's GPS navigation.
