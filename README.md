# CialloLab Final Frontend

Separated Node.js frontend module for the BlueKing SaaS final project. The Django API backend lives in `bk-lab-final-backend`.

## Features

- BKVision behavior analytics homepage with embedded dashboard support.
- CMDB host manager page.
- JOB log search and backup console.
- Paged Help guides for the analytics, CMDB, and JOB workflows.
- Reused visual themes and draggable desktop pet interaction from the previous labs.
- Runtime backend configuration through `BK_BACKEND_API_PREFIX` or the in-page `Backend` button.

## Runtime Configuration

The frontend looks for the backend API prefix in this order:

1. Browser local setting saved by the `Backend` button.
2. `BK_BACKEND_API_PREFIX` injected into the Node module environment.
3. Automatic inference from the BlueKing module path, where `stag--<app>-frontend` maps to `stag--<app>`.
4. Local fallback: `http://127.0.0.1:8005`.

Optional BKVision iframe URL can be provided by `BKVISION_DASHBOARD_URL` or the same `Backend` button.

The backend module root returns a JSON health response by design. Public pages avoid server-side HTML placeholders, and visual assets are resolved from the loaded runtime script path so they can survive platform URL rewrites. If the frontend opens but API data does not load, use the `Backend` button to set the deployed backend URL, then refresh the page.

## Local Development

```powershell
npm start
```

Then open:

- `http://127.0.0.1:5000/`
- `http://127.0.0.1:5000/hosts/`
- `http://127.0.0.1:5000/jobs/`

For local API integration, start the backend on `127.0.0.1:8005` or set the backend URL through the page button.

## Checks

```powershell
npm run check
```
