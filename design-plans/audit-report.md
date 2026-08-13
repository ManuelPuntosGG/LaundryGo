# Audit Report — Schedule Surface

## Design language

- Audited surface: Schedule pickup flow (`/schedule` route) — Steps 1-4 in `frontend/src/pages/Schedule.tsx`
- Design sources: `frontend/src/index.css` (Tailwind v4 `@theme` tokens), `frontend/src/components/ui/{Button,Card,Input}.tsx` (component variants), `frontend/public/locales/{en,es}/common.json` (i18n labels)
- Documented decisions: Glass-morphism design system with blue primary palette; i18n via `react-i18next` with `en`/`es` locales
- Governing owners and consumers: `index.css` owns tokens; `Button/Card/Input` own component variants; `locales/*` own labels; `Schedule.tsx` consumes all
- Explicit exceptions: None documented

## Findings

| # | Problem | Evidence | Proposed change | Scope | Confidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Step 4 (Review & Confirm) uses hardcoded English strings instead of i18n translations | Steps 1-3 use `t()` for all labels (e.g., `t('schedule.title')`, `t('schedule.date')`). Step 4 at lines 397, 402, 406, 412, 418 uses literal strings: `"Review & Confirm"`, `"Pickup Date"`, `"Time Slot"`, `"Service"`, `"Order Details"`. The `schedule` namespace in `en/common.json` and `es/common.json` has no keys for these labels. | Add 5 translation keys (`schedule.reviewTitle`, `schedule.pickupDate`, `schedule.timeSlot`, `schedule.service`, `schedule.orderDetailsLabel`) to both locale files, then replace hardcoded strings with `t()` calls in Schedule.tsx. | `Schedule.tsx`, `en/common.json`, `es/common.json` | High |

## Improve first

Finding 1 is the only surviving candidate. It has the strongest evidence: a direct contradiction between the i18n pattern used in Steps 1-3 vs the hardcoded strings in Step 4, with a deterministic correction. The fix is low-cost and prevents broken translations when the Spanish locale is loaded.
