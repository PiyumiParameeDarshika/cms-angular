# CMS Angular Frontend

Angular 19 admin portal for the Complaint Management System API.

## Tech Stack
- **Angular 19** — standalone components, signals, functional guards
- **Bootstrap 5.3** + custom SCSS — professional admin UI
- **Bootstrap Icons** — icon set
- **TypeScript 5.6**

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Setup
```bash
npm install
npm start
```
App runs at **http://localhost:4200**

### Build for production
```bash
npm run build
```

### Run checks
```bash
npm run test
npm run lint
```

## Windows PowerShell fix (`*.ps1 is not digitally signed`)
If you see errors like `npm.ps1 cannot be loaded` or `ng.ps1 cannot be loaded`, PowerShell is blocking script execution.

Use one of these options:

1. **Use CMD shims directly (quickest, no policy change):**
```powershell
npm.cmd install
npm.cmd start
npx.cmd ng serve
```

2. **Allow local scripts for current user (recommended for dev machines):**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Then restart PowerShell and run:
```powershell
npm install
npm start
```

3. **Temporary bypass for current shell only:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## Project Structure

```
src/app/
├── core/
│   ├── guards/         authGuard, roleGuard
│   ├── interceptors/   authInterceptor (JWT + 401 handling)
│   ├── models/         TypeScript interfaces for all API types
│   └── services/       AuthService, ComplaintService, ClientService...
├── layout/
│   ├── shell/          Main app shell with sidebar + topbar
│   ├── sidebar/        Collapsible nav with role-based menu items
│   └── topbar/         Header with user info and quick actions
├── features/
│   ├── auth/           Login page
│   ├── dashboard/      KPI cards, status bars
│   ├── complaints/     List, form, detail (assign/escalate/resolve)
│   ├── clients/        List, form, detail
│   ├── users/          List, form, profile
│   ├── categories/     Categories + SLA policies
│   └── reports/        Reports & analytics
└── shared/
    └── components/     Unauthorized page
```

## Environment Config

Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: '/api/v1'
};
```

## Role-Based Access
| Route | Admin | Supervisor | Agent | Client |
|---|---|---|---|---|
| /dashboard | ✅ | ✅ | ✅ | ✅ |
| /complaints | ✅ | ✅ | ✅ | ✅ |
| /complaints/new | ✅ | ✅ | ✅ | ❌ |
| /clients | ✅ | ✅ | ✅ | ✅ |
| /clients/new | ✅ | ✅ | ❌ | ❌ |
| /users | ✅ | ❌ | ❌ | ❌ |
| /categories | ✅ | ✅ | ❌ | ❌ |
| /reports | ✅ | ✅ | ❌ | ❌ |

## Default Login
- Email: `admin@cms.com`
- Password: `Admin@123` *(change after first login)*

## CORS
Make sure the CMS API has CORS enabled for `http://localhost:4200`.
