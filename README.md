# My Solar Desk — Free Solar Sales Online Portal

A responsive, ready-to-deploy solar sales web app built for 10+ salespeople. **No paid CRM subscription is required** when operating within Firebase Spark plan quotas.

## What is included

- Public sales homepage for solar EPC and installation teams, with no-registration demo access and a separate team sign-in. Optional sales email, WhatsApp and 20-minute booking links appear on the homepage and demo when configured.
- Public pricing page with proposed Starter, Business and Scale plans, annual rates, plan limits, onboarding details, add-on rates, and the five-customer Business launch offer. These are recommendations to validate, not competitor benchmarks; applicable taxes are additional.
- The sample workspace uses a clearly fictional company name and an illustrative, non-zero GST quotation. Confirm actual product-specific tax and subsidy settings before sharing or issuing quotations. No customer testimonials are invented.
- Owner/manager overview with sales pipeline, due follow-ups, deal value, and salesperson performance.
- Salespeople can see **only leads and records assigned to them**, enforced by Cloud Firestore Security Rules (not merely by hiding buttons).
- Lead entry: customer/mobile/city, category, solar capacity in kWp, monthly EB bill, source, pipeline stage, due follow-up and notes.
- Eight-stage solar pipeline: New, Contacted, Survey Scheduled, Quote Sent, Negotiation, Won, Lost and Junk. Existing stage names are normalized as records load.
- Mobile-ready site-survey records for roof area, shading, DISCOM connection, technician notes and photo URLs.
- Read-only audit history for leads, quotations, follow-ups, collections and installations: normal record creation records saved fields, and each changed field is retained with its previous and updated value, actor and timestamp. Bulk-imported leads receive one "Record imported" event to keep writes bounded; subsequent edits use normal field-level history. Open a record's Edit/Update details to view its timeline and append comments; history entries cannot be edited or deleted and follow Firestore record permissions.
- Follow-up schedule, notes, completed/pending status, overdue flags.
- Catalog-based solar quotations with product/GST defaults, taxable value, CGST/SGST calculation, PM Surya Ghar central subsidy estimate, manually entered state subsidy and customer net amount. Browser print can save quotations as PDF. Subsidy estimates must be checked against current scheme eligibility and state rules.
- Ten-step project checklist from material procurement through DISCOM inspection, net-meter installation, subsidy disbursement and handover.
- PM Surya Ghar application tracker with status/date tracking and dashboard alerts for applications open over 45 days.
- Customer loan status tracking from application through sanction and disbursement.
- Shared inventory catalog with low-stock thresholds and stock receipt/issue movements linked to projects. Firebase stock movements use a transaction to prevent issuing more than available stock.
- Collections with milestone amounts and a printable GST invoice template. Verify statutory invoice fields and tax treatment with your accountant before issuing.
- After-sales AMC renewals and service-ticket tracking for inverter, panel, wiring and net-meter issues.
- Sales-source, pipeline-conversion and collections reports with CSV export.
- Dashboard indicators for due follow-ups, stuck subsidy applications, AMC renewals, surveys and open service tickets.
- Separate Sales Team and Project Team directories. Business Managers manage both; Sales Managers manage Sales Persons; Project Managers manage Project Executives. Team managers can add or deactivate members only in their own team.
- Google sign-in through Firebase Authentication, alongside email/password sign-in; top-right account button opens the user's profile.
- CSV export and bulk lead import. From the Leads page, download the Excel-compatible CSV template, fill it in Excel, upload it, edit and validate the paginated preview, then confirm before saving. Firebase imports support up to 20,000 leads per file, write in resumable chunks, and create one audit event per imported lead. Each imported lead is assigned to the signed-in user. Demo mode is limited to 500 leads per file because its data is stored in browser storage.
- Collection tables show 50 records per page, and the import preview shows 100 rows per page. Firebase records are fetched in cursor-based batches without the previous 1,000-record collection cap. The current client loads all matching records into memory at sign-in; larger workspaces should plan for increased startup time and read usage.
- Mobile-friendly portal.
- Local sample-data demo when Firebase settings are missing.

**Integrations not configured:** actual email/WhatsApp delivery, automated scheduled reminders, direct photo/file upload, DISCOM rule integrations, online subsidy submission, lender integrations and accounting exports. Site survey photo URLs may be recorded. Print templates do not replace accountant-reviewed GST invoices. All financial figures are informational; verify against current scheme rules and accounting records.

## Test the demo now

For a customer demo, open `http://localhost:8000/?demo=1` locally or add `?demo=1` to the deployed portal URL. To preview global administration with fictional data, open `http://localhost:8000/?demo=1&role=super_admin`. These URLs always use sample data and skip Firebase sign-in, even when live Firebase is configured. Changes are saved in a separate browser-only demo workspace; use **Reset demo** in the banner to restore the sample data. Use the exit-style icon at the bottom-left to cycle through company roles. Do **not** enter real customers' personal information in demo mode.

## Publish as an ONLINE portal at a free URL

1. Go to https://console.firebase.google.com and create a project. Keep it on the **Spark (no-cost)** plan.
2. Register a **Web app** in Project settings. Copy the configuration (apiKey, authDomain, projectId, appId) to `public/config.js`, removing the comment markers.
3. In Firebase Console → **Authentication → Sign-in method**, enable **Google** and/or **Email/Password**. Add your production hostname under **Authentication → Settings → Authorized domains**.
4. In Firebase Console → **Firestore Database**, create a database using **Standard edition**. Choose the database region appropriate for your customers and budget. Do not enable public access.
5. Create the owner account in Firebase Authentication and copy the owner's **UID**. Before deploying the new rules, create collection `users`, document ID **the exact owner Authentication UID**, with these fields:
   - `name` (string): `Admin`
   - `email` (string): `owner@yourcompany.com` (owner login email)
   - `role` (string): `admin` (Business Manager)
   - `active` (boolean): `true`
   **Never create user profiles as public documents or enable open write/read rules.** This initial admin profile is created directly in Firebase Console because client-side rules intentionally prohibit self-promoting to admin.
6. Set your company name in `public/config.js` using `window.SOLARCRM_COMPANY_NAME`. The public homepage is the default entry point; team members use **Log in**, and prospects can open **Try live demo** without registering. The pricing page presents the recommended Starter (₹2,999/month; ₹29,990/year, up to 3 users), Business (₹4,999/month; ₹49,990/year, up to 5 users), and Scale (₹8,999/month; ₹89,990/year, up to 15 users) prices. Annual billing is 12 months for the price of 10. Standard one-time onboarding is ₹4,999 for Starter, ₹9,999 for Business, and from ₹19,999 for Scale. The proposed launch offer for the first five customers is Business at ₹3,999/month for the first 12 months plus ₹4,999 onboarding, followed by the stated ₹4,999/month renewal rate. Offer a 14-day assisted trial and state the renewal price before signup. These are launch prices to validate, not market benchmarks; applicable taxes are additional. Review the pricing section for package limits, included Business onboarding, and optional service rates. Optional sales links can be set in `public/config.js`:
   - `window.SOLARCRM_SALES_EMAIL`: email address for sales enquiries.
   - `window.SOLARCRM_WHATSAPP_NUMBER`: WhatsApp number with country code (digits only, for example `919876543210`).
   - `window.SOLARCRM_DEMO_BOOKING_URL`: HTTPS link to your booking calendar.

   Leave a link blank until you have a real destination. No customer testimonials are invented. The sample company and customer data are fictional; sample GST and subsidy figures are illustrative, so confirm product-specific tax treatment and current eligibility before sharing a quote.
7. Migrate the current single-company database before deploying the tenant rules. Back up Firestore first. The migration utility assumes all existing top-level CRM data belongs to this one company; do not use it to merge existing multi-company data. Install its dependency, authenticate Google Cloud Application Default Credentials for the Firebase project, then run a dry run and review the counts:

   ```bash
   npm install
   gcloud auth application-default login
   gcloud config set project YOUR-PROJECT-ID
   npm run migrate:tenant-data -- --tenant-id your-company --company-name "Your Company" --plan business
   ```

   Once the dry run is correct, apply it:

   ```bash
   npm run migrate:tenant-data -- --tenant-id your-company --company-name "Your Company" --plan business --apply
   ```

   The tenant ID becomes the `workspaces/{tenantId}` document ID. The migration adds tenant IDs to tenant user profiles and CRM records, initializes the workspace and active-user count, tags history entries, copies inventory products to the shared quotation catalog, removes legacy seat-change user IDs from workspace metadata, and detaches any `super_admin` profile from the company and its seat count. It stops if it finds documents already assigned to a different tenant. This is a one-company legacy migration; do not run it again after creating additional workspaces.
   You may use a local service-account JSON file instead of Application Default Credentials with `--service-account C:\secure\path\service-account.json`. Keep that file outside the repository and never commit it.
   After migration, create a separate Firebase Authentication account for the global Super Admin. Create its `users/{uid}` profile with `name`, `email`, `role: "super_admin"`, and `active: true`; do not set `tenantId`. Create this profile only through Firebase Console or a trusted Admin SDK process. Tenant admins cannot assign this role, and the global Super Admin is not counted against any company's user seats. Super Admins can read and manage company metadata and can select a company workspace to access its users and CRM data. Treat this role as fully privileged across every tenant.
8. Install or use Firebase CLI, select the same project with `firebase use --add`, and deploy the rules and site:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only hosting,firestore:rules
   ```

   **Do not deploy the new Firestore rules until migration has completed.** The rules deny access to documents without a matching tenant ID and workspace.
9. Open `https://YOUR-PROJECT-ID.web.app` and sign in as the Super Admin. Use the company selector to access a company's dashboard, leads, team, reports, and other CRM records. The **Subscription** page can update each company's plan, suspend/reactivate workspaces, and create an empty workspace. To onboard a company, first create its owner's Firebase Authentication account, then enter the exact UID and account details in the form. The workspace, metadata directory entry, and tenant Admin profile are created together; CRM data is not copied. The app does not verify payment, so use plan controls only for administrator-managed subscriptions.
10. To onboard team members: create each login in Firebase Authentication and copy its UID. A Business Manager adds Sales Managers (`manager`) or Sales Persons (`sales`) under **Sales Team**, and Project Managers (`project_manager`) or Project Executives (`project_executive`) under **Project Team**. Sales Managers can add/deactivate Sales Persons; Project Managers can add/deactivate Project Executives. Enter the matching UID, name, email, role, and active status. All active roles count toward the plan's seat limit; downgrades preserve existing users but block new activations until the count is under the limit. Don't enable public account registration.
11. In Firebase Console check Authentication authorized domains for the hosted domain, and monitor usage under Firebase usage & billing.

**Important:** Register the domain in Firebase Authentication if needed. Do not publish customer data until you have verified staff access using separate test accounts and reviewed the Firestore rules in the Firebase Rules Playground or emulator.

## Roles and privacy

| Role | CRM record access | Team access |
|---|---|---|
| Super Admin (`super_admin`) | All companies' CRM and user data, one selected workspace at a time | Manage all workspace plans/status, teams, records, and onboarding |
| Business Manager (`admin`) | All records in their own tenant | Manage Sales and Project teams |
| Sales Manager (`manager`) | All records | Manage Sales Persons |
| Project Manager (`project_manager`) | All records | Manage Project Executives |
| Sales Person (`sales`) | Assigned records only | No team management |
| Project Executive (`project_executive`) | Assigned records only | No team management |

| Plan | Active users | Included CRM features |
|---|---:|---|
| Starter | 3 | Leads, follow-ups, quotations and basic surveys/projects; shared product catalog |
| Business | 5 | Starter plus collections, subsidy tracking and customer loans |
| Scale | 15 | Business plus inventory/stock movements, after-sales and advanced reports |

Every tenant user and CRM record is bound to one tenant workspace. A global Super Admin profile has no `tenantId`; Firestore rules grant it access across all workspaces, tenant users, and CRM collections. The app requires the Super Admin to select a workspace and scopes CRM operations to that company, while allowing every plan feature regardless of the company's tier. Tenant user queries and record rules continue to enforce workspace isolation, plan feature access, role permissions, and transactional seat-count changes for company users. Existing active users remain active after a downgrade; the app and rules prevent additional activations by company users while the workspace is over its new seat limit. The Super Admin can manage company subscription tiers; no payment integration verifies subscriptions. The product catalog is separate from inventory so all tiers can quote products without accessing Scale-only stock records.

The security rules only allow Sales Persons and Project Executives to access records with `assignedTo == request.auth.uid`. Business Managers and both manager roles can read all records in their own tenant. User-profile rules enforce that Sales Managers can only manage Sales Person profiles and Project Managers can only manage Project Executive profiles. When a manager reassigns a lead in the portal, the app also updates linked quotation, installation, follow-up, and payment records. This sequence is **not atomic**. For important handovers, verify child record access after reassignment; high-volume deployment should move reassignment to a transaction or trusted server.

The supplied `firestore.rules` allow signed-in users to read their own profile, restrict tenant user-profile reads and changes by team role, enforce tenant and plan boundaries, and scope member CRM record access to assigned records. Global Super Admins can read and manage all company workspaces, tenant user profiles, and CRM collections; this role must only be granted to a trusted administrator. Regular company users remain restricted to their tenant and role. Workspace documents contain tenant operational metadata; seat-change user IDs are stored in a tenant-only internal document. The `tenantDirectory` contains approved company metadata used by global subscription management. A rules file in this repository does not change Firebase Console rules until it is deployed. Complete the documented data migration before deploying these rules; do not replace them with public read/write access.

Run the Firestore security-rule tests locally with Java 21+ and Firebase CLI:

```bash
firebase emulators:exec --only firestore --project demo-solardesk "npm run test:rules"
```

**Security caveat:** Client-side and Firestore validation are starter-level. The Super Admin can access every tenant, so provision that role only to trusted administrators, use strong credentials, and enable multi-factor authentication where available. Before production use with sensitive customer records, add schema validation, access audits, dependable backups, and rate limiting. Restrict sign-in to provisioned accounts; Firebase Authentication itself is not a complete CRM user lifecycle management interface.

## Free-plan conditions

Firebase Spark provides free Firebase Hosting, standard Email/Password Authentication and Cloud Firestore within quotas. As of Oct 2026, standard Cloud Firestore free quota includes **50,000 reads/day, 20,000 writes/day and 1 GiB storage**. Quotas and terms may change. A 20,000-lead import creates at least 40,000 writes because each lead and its audit event are separate documents; therefore, a full import requires sufficient remaining quota across multiple quota periods or a billing-enabled Firebase plan. Imports stopped by a quota or network error can be resumed from the still-open import preview; keep that browser tab open while resuming. When Spark quota is exceeded, Firebase may temporarily disable that product until quotas reset or the project is upgraded; it is not unlimited. Some services (for example Cloud Storage image uploads) may require paid billing. This starter stores text data only.

Official docs: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans | https://firebase.google.com/docs/hosting/quickstart | https://firebase.google.com/docs/firestore/pricing | https://firebase.google.com/docs/firestore/solutions/role-based-access

## Folder layout

```
solar-crm-portal/
├── public/
│   ├── index.html       App layout
│   ├── styles.css       Responsive styling
│   ├── landing.css      Public sales homepage styling
│   ├── app.js           CRM logic, demo + Firebase
│   └── config.js        Add Firebase config and set the company name
├── firestore.rules     Security rules (required)
├── firebase.json       Deployment settings
└── README.md           This guide
```

License: You may customize this starter for your friend's company. No third-party CRM subscription is necessary.
