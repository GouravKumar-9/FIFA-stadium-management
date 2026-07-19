# TESTING.md — StadiumSense AI Testing Framework

We implement automated testing across both backend and frontend layers to verify our security filters, routing computations, and WCAG accessibility standards.

## 1. Test Architecture

The testing layout is divided into:
- **Backend API & Unit tests**: Written using `Vitest` and `Supertest`. Tested endpoints, rate limiters, validation schemas, and role filters.
- **Frontend UI & Accessibility tests**: Written using `Vitest`, `@testing-library/react`, `jsdom`, and `axe-core`. Verified layout mounts, role transitions, language attributes, and ARIA violations.

---

## 2. Running the Test Suites

Ensure you have installed the packages in both directories before running tests.

### A. Run Backend API Tests
1. Navigate to the backend directory or run from the root prefix:
   ```bash
   cd backend
   npm run test
   ```
2. What is tested:
   - LLM client fallback and prompt sanitization filter.
   - Dynamic translation responses in fallback mode.
   - Route path coordinates (asserting wheelchair/stroller routes do not contain stairs).
   - Validation schema errors on faulty inputs.
   - Role boundaries (blocking unauthorized access to crowd metrics and incidents lists).

### B. Run Frontend UI & Accessibility Tests
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm run test
   ```
2. What is tested:
   - Main interface rendering (branding and primary sidebar links).
   - Document `lang` sync changes when language toggle is triggered.
   - Access locks (blocking Fan role from accessing Organizer/Staff views).
   - **Automated Accessibility Scan**: Renders the complete application layout and runs a comprehensive `axe-core` scan, asserting zero critical or serious WCAG 2.1 AA violations.

---

## 3. Test Coverage & Output Summary

Our tests target critical operational pathways:
1. **Security Filters**: Validates sanitization strips script injections.
2. **Access Control**: Validates token authentication checks.
3. **Accessibility**: Automated tests check tag hierarchies, aria roles, and focus selectors.
4. **Resiliency**: Confirms fallback databases handle Gemini API downtime without dropping application availability.
