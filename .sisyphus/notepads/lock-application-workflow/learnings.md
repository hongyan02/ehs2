# Lock Application Workflow - Learnings

## Wave 1: Infrastructure

### T1: Shared Zod Schema
- Location: `src/lib/schemas/lock-application.ts`
- Based on existing pattern: `server/api/goods/application/controller.ts`
- Must export TypeScript types

### T2: Anonymous Middleware
- Location: `server/middleware/anonymous.ts`
- Pattern from: `server/middleware/auth.ts`
- Rate limit: 10 requests/hour per IP

### T3: DB Schema
- Location: `server/db/schema.ts`
- Tables: lockApplication, lockApplicationDetail, lockApproval, examResult, anonymousToken

## Wave 2: Core Features
- T4: Frontend forms (React Hook Form)
- T5: Backend API
- T6: XState machine

## Wave 3: Approval & Integration
- T7: Multi-level approval API
- T8: Exam result interface
- T9: Approval frontend
- T10: Integration testing
