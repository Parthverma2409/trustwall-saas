# Time-Off Compliance SaaS Plan (India)

## Understanding Summary
- SaaS for founders/owners in India to manage time-off compliance and reporting.
- Built-in platform with manual entry plus CSV imports.
- Must-haves: compliance report export (PDF/Excel) and employee self-service balance view.
- Reports include balances + accruals, leave taken by month, and policy compliance flags.
- Leave policies are company-defined only in v1 (no legal mapping).
- Pricing: flat monthly fee for up to 25 employees (target INR 2k-5k/month).
- Payments: UPI, cards, netbanking.
- Goal: 4-5 paying companies in 3 months; 99.9% uptime; solo operator.

## Assumptions
- Early sales come from local founder communities.
- Approvals workflow and auto-accrual engine are post-v1.
- Basic security (auth, TLS, access control) is acceptable for launch.
- Support is lightweight and async.

## Decision Log
- Use a phased plan (reporting-only -> self-service -> optional concierge).
  - Alternatives: single-approach MVP (pure SaaS or pure concierge).
  - Rationale: fastest revenue with a path to a scalable product.
- v1 flow: admin CSV upload, policy setup, report generation, optional employee self-service.
  - Alternatives: approvals workflow or auto-accrual engine first.
  - Rationale: reduces build time and supports fast sales.
- Security at basic launch level (auth, TLS, access control).
  - Alternatives: MFA/audit-log requirements from day 1.
  - Rationale: faster time-to-market for initial revenue.

## Final Design
### Phase 0 (Week 1-2): Reporting-Only SaaS
- Admin uploads CSV of employees and leave records.
- System validates data and generates compliance reports.
- Outputs: PDF + Excel with balances, accruals (policy-based), leave by month, and flags for negative balances.
- Pricing: flat fee for up to 25 employees (INR 2k-5k).

### Phase 1 (Week 3-5): Self-Service Balances
- Employees get view-only access to their leave balances.
- Admin can edit balances and upload updated CSVs.
- Reports become always-current snapshots.

### Phase 2 (Week 6-8): Concierge Option
- Optional done-for-you reporting and policy setup as a paid add-on.

### User Flow (v1)
1) Admin signs up -> creates company -> defines leave policy values.
2) Admin uploads CSV (employees + leave records).
3) System validates -> generates reports -> admin downloads PDF/Excel.
4) Employees log in (or use access link) to view balances.

### Architecture (High-Level)
- Web app: admin dashboard for setup, uploads, report downloads.
- Data validation: CSV schema checks and error reporting.
- Report generator: produces PDF + Excel outputs.
- Self-service portal: read-only employee balance view.

### Data Model (High-Level)
- Company: name, plan, timezone, policy settings.
- Employee: id, name, email, status.
- LeavePolicy: per company; types (CL/SL/EL), accrual rates, carry-forward limits.
- LeaveRecord: employee, leave type, date range, days, status.
- Report: generatedAt, reportType, file links.

### Security and Reliability
- Basic auth + role-based access (admin vs employee).
- TLS enforced; data access scoped by company.
- Daily backups; target 99.9% uptime (managed hosting).

### Pricing
- Flat monthly fee: INR 2k-5k for up to 25 employees.
- Concierge add-on: INR 5k-10k/month for managed reporting.

### Go-to-Market
- Primary channel: local founder groups/communities.
- Pitch: "Stop manual leave tracking and get compliance-ready reports in minutes."
- Offer: 7-day trial or first report free.
