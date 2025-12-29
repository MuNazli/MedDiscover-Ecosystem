# MedDiscover M01 - Lead Intake MVP

Patient registration and lead intake system for medical tourism platform.

## Database Migrations

### Local Development
```bash
npm run db:migrate:dev
```

### Production/CI
```bash
npm run db:migrate:prod
```

## Windows Build Note (EPERM .next/trace)
If `npm run build` fails with `EPERM` on `.next/trace`, stop any running Node/Next processes, then run:

PowerShell (Admin):
```
Remove-Item -Recurse -Force .next
npm run build
```
