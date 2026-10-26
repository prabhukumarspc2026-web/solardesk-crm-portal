# SolarDesk — Free Solar Sales Online Portal

A responsive, ready-to-deploy solar sales web app built for 10+ salespeople. **No paid CRM subscription is required** when operating within Firebase Spark plan quotas.

## What is included

- Owner/manager overview with sales pipeline, due follow-ups, deal value, and salesperson performance.
- Salespeople can see **only leads and records assigned to them**, enforced by Cloud Firestore Security Rules (not merely by hiding buttons).
- Lead entry: customer/mobile/city, category, solar capacity in kWp, monthly EB bill, source, pipeline stage, due follow-up and notes.
- Follow-up schedule, notes, completed/pending status, overdue flags.
- Quotation proposals with on-grid/hybrid/off-grid, kWp, ₹ amount, expiry and status. An **Accepted** quotation marks its lead as Won.
- Installation progress: material, structure, panels, wiring, testing, commissioning, handover.
- Collections: invoice milestone, amount, pending/received status.
- Separate Sales Team and Project Team directories. Business Managers manage both; Sales Managers manage Sales Persons; Project Managers manage Project Executives. Team managers can add or deactivate members only in their own team.
- Google sign-in through Firebase Authentication, alongside email/password sign-in; top-right account button opens the user's profile.
- CSV export of customer leads; mobile-friendly portal.
- Local sample-data demo when Firebase settings are missing.

**Not included in the starter version:** quotation PDF generator, EB bill image uploads, automatic WhatsApp messages, email alerts, auto-assigning leads, audit-grade financial reporting, server-side reconciliation, automated backups, offline syncing or multi-tenant companies. All financial figures are informational; verify against accounting records.

## Test the demo now

For a customer demo, open `http://localhost:8000/?demo=1` locally or add `?demo=1` to the deployed portal URL. This always uses sample data and skips Firebase sign-in, even when live Firebase is configured. Changes are saved in a separate browser-only demo workspace; use **Reset demo** in the banner to restore the sample data. Use the exit-style icon at the bottom-left to cycle through Business Manager, Sales Manager, Project Manager, Sales Person, and Project Executive views. Do **not** enter real customers' personal information in demo mode.

## Publish as an ONLINE portal at a free URL

1. Go to https://console.firebase.google.com and create a project. Keep it on the **Spark (no-cost)** plan.
2. Register a **Web app** in Project settings. Copy the configuration (apiKey, authDomain, projectId, appId) to `public/config.js`, removing the comment markers.
3. In Firebase Console → **Authentication → Sign-in method**, enable **Google** and/or **Email/Password**. Add your production hostname under **Authentication → Settings → Authorized domains**.
4. In Firebase Console → **Firestore Database**, create a database using **Standard edition**. Choose the database region appropriate for your customers and budget. Do not enable public access.
5. Create the owner account in Firebase Authentication (or complete Google sign-in once to create it) and copy the owner's **UID**. In Firestore Console, manually create collection `users`, document ID **the exact owner Authentication UID**, with these fields:
   - `name` (string): `Business Owner`
   - `email` (string): `owner@yourcompany.com` (owner login email)
   - `role` (string): `admin` (Business Manager)
   - `active` (boolean): `true`
   **Never create user profiles as public documents or enable open write/read rules.** The first admin profile is created directly in Firebase console because client-side rules intentionally prohibit self-promoting to admin.
6. Set company name in `public/config.js` using `window.SOLARCRM_COMPANY_NAME`.
7. Use a computer with Node.js, then run from this extracted project directory:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add
   firebase deploy --only hosting,firestore:rules
   ```

   If the CLI says no project is active, run `firebase use --add` and select your project. You can also use Google Cloud Shell when available.
8. Open `https://YOUR-PROJECT-ID.web.app`. Sign in with the owner's Google account or email/password. The rules allow a signed-in user to read their own profile; they deny access to CRM records unless that profile is active.
9. To onboard team members: have each person complete Google sign-in (or create an email/password user in Firebase Authentication), then copy their UID from Firebase Authentication. A Business Manager adds Sales Managers (`manager`) or Sales Persons (`sales`) under **Sales Team**, and Project Managers (`project_manager`) or Project Executives (`project_executive`) under **Project Team**. Sales Managers can add/deactivate Sales Persons; Project Managers can add/deactivate Project Executives. Enter the matching UID, name, email, role, and active status. Don't enable public account registration.
10. In Firebase Console check Authentication authorized domains for the hosted domain, and monitor usage under Firebase usage & billing.

**Important:** Register the domain in Firebase Authentication if needed. Do not publish customer data until you have verified staff access using separate test accounts and reviewed the Firestore rules in the Firebase Rules Playground or emulator.

## Roles and privacy

| Role | CRM record access | Team access |
|---|---|---|
| Business Manager (`admin`) | All records | Manage Sales and Project teams |
| Sales Manager (`manager`) | All records | Manage Sales Persons |
| Project Manager (`project_manager`) | All records | Manage Project Executives |
| Sales Person (`sales`) | Assigned records only | No team management |
| Project Executive (`project_executive`) | Assigned records only | No team management |

The security rules only allow Sales Persons and Project Executives to access records with `assignedTo == request.auth.uid`. Business Managers and both manager roles can read all CRM records. User-profile rules enforce that Sales Managers can only manage Sales Person profiles and Project Managers can only manage Project Executive profiles. When a manager reassigns a lead in the portal, the app also updates linked quotation, installation, follow-up, and payment records. This sequence is **not atomic**. For important handovers, verify child record access after reassignment; high-volume deployment should move reassignment to a transaction or trusted server.

The supplied `firestore.rules` allow signed-in users to read their own profile, restrict user-profile reads and changes by team role, and scope member CRM record access to assigned records. A rules file in this repository does not change Firebase Console rules until it is deployed. Deploy with `firebase deploy --only firestore:rules` after creating the initial Business Manager profile; do not replace the rules with public read/write access.

**Security caveat:** Client-side and Firestore validation are starter-level. Before production use with sensitive customer records, add schema validation, access audits, dependable backups, and rate limiting. Restrict sign-in to provisioned accounts; Firebase Authentication itself is not a complete CRM user lifecycle management interface.

## Free-plan conditions

Firebase Spark provides free Firebase Hosting, standard Email/Password Authentication and Cloud Firestore within quotas. As of Oct 2026, standard Cloud Firestore free quota includes **50,000 reads/day, 20,000 writes/day and 1 GiB storage**. Quotas and terms may change. When Spark quota is exceeded, Firebase may temporarily disable that product until quotas reset or the project is upgraded; it is not unlimited. Some services (for example Cloud Storage image uploads) may require paid billing. This starter stores text data only.

Official docs: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans | https://firebase.google.com/docs/hosting/quickstart | https://firebase.google.com/docs/firestore/pricing | https://firebase.google.com/docs/firestore/solutions/role-based-access

## Folder layout

```
solar-crm-portal/
├── public/
│   ├── index.html       App layout
│   ├── styles.css       Responsive styling
│   ├── app.js           CRM logic, demo + Firebase
│   └── config.js        Add Firebase config and set the company name
├── firestore.rules     Security rules (required)
├── firebase.json       Deployment settings
└── README.md           This guide
```

License: You may customize this starter for your friend's company. No third-party CRM subscription is necessary.
