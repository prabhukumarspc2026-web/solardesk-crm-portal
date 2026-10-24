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
- Team panel: add/update CRM profiles and deactivate accounts (the real login account itself is created in Firebase Auth console).
- CSV export of customer leads; mobile-friendly portal.
- Local sample-data demo when Firebase settings are missing.

**Not included in the starter version:** quotation PDF generator, EB bill image uploads, automatic WhatsApp messages, email alerts, auto-assigning leads, audit-grade financial reporting, server-side reconciliation, automated backups, offline syncing or multi-tenant companies. All financial figures are informational; verify against accounting records.

## Test the demo now

Open `public/index.html` in Chrome. In demo mode sample records are loaded automatically. Use the exit-style icon at the bottom-left to **cycle between Owner, Manager and Salesperson views**. Demo test changes are saved only in browser localStorage. Do **not** enter real customers' personal information in demo mode.

## Publish as an ONLINE portal at a free URL

1. Go to https://console.firebase.google.com and create a project. Keep it on the **Spark (no-cost)** plan.
2. Register a **Web app** in Project settings. Copy the configuration (apiKey, authDomain, projectId, appId) to `public/config.js`, removing the comment markers.
3. In Firebase Console → **Authentication → Sign-in method**, enable **Email/Password**. In Users, **Add user** for the owner, and copy the owner's **UID**.
4. In Firebase Console → **Firestore Database**, create a database using **Standard edition**. Use production security mode; the supplied rules will replace the default rules before inviting users. Choose the database region appropriate for your customers and budget.
5. In Firestore Console, manually create collection `users`, document ID **the exact owner Authentication UID**, with these fields:
   - `name` (string): `Business Owner`
   - `email` (string): `owner@yourcompany.com` (owner login email)
   - `role` (string): `admin`
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
8. Open `https://YOUR-PROJECT-ID.web.app`. Log in with the owner's email/password.
9. To onboard team members: in Firebase Authentication, click **Add user** and copy each UID. In the deployed portal open **Sales Team → Add Team Member**, enter matching UID, name, email, `sales` or `manager`, and active=true. Create 10, 20, or more users as required. Don't enable public account registration.
10. In Firebase Console check Authentication authorized domains for the hosted domain, and monitor usage under Firebase usage & billing.

**Important:** Register the domain in Firebase Authentication if needed. Do not publish customer data until you have verified staff access using separate test accounts and reviewed the Firestore rules in the Firebase Rules Playground or emulator.

## Roles and privacy

| Role | Own leads | All sales/lead records | Assign salespeople | Manage team roles |
|---|---|---|---|---|
| Admin / Owner | Yes | Yes | Yes | Yes |
| Manager | Yes | Yes | Yes | No |
| Salesperson | Yes | No | No | No |

The security rules only allow salespeople to access records with `assignedTo == request.auth.uid`. Manager and admin can read all data. When an admin reassigns a lead in the portal, the app also updates linked quotation, installation, follow-up, and payment records. This sequence is **not atomic**. For important handovers, verify child record access after reassignment; high-volume deployment should move reassignment to a transaction or trusted server.

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
│   └── config.js        Add your project's Firebase config
├── firestore.rules     Security rules (required)
├── firebase.json       Deployment settings
└── README.md           This guide
```

License: You may customize this starter for your friend's company. No third-party CRM subscription is necessary.
