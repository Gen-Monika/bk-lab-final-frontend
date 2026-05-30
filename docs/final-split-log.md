# Final Split Frontend Log

Date: 2026-05-30

## Summary

Created the separated frontend repository for the final BlueKing SaaS project. The frontend reuses the verified UI from `bk-lab4` and calls the Django backend through configurable API prefixes.

## Changes

- Added a dependency-free Node.js static server for BlueKing Node module deployment.
- Converted the BKVision dashboard, CMDB host manager, and JOB log backup pages from Django templates to standalone HTML pages.
- Moved visual theme assets, desktop pet images, and Help guide screenshots into the frontend repository.
- Added runtime backend API detection through `BK_BACKEND_API_PREFIX`, BlueKing path inference, and a browser-saved Backend settings button.
- Added optional BKVision iframe URL configuration through environment variable or browser runtime setting.
- Preserved the paged Help guides, archive controls, draggable desktop pet, and background selectors.

## Verification Targets

- `npm run check`
- Open `/`, `/hosts/`, and `/jobs/` from the Node server.
