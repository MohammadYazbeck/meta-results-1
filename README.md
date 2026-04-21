# Meta Ads Spend Dashboard

Small Next.js starter for a Meta Marketing API dashboard focused on campaign spend.

## What is included

- Server-side Meta API integration
- `GET /api/meta/insights` endpoint
- Date-filtered dashboard page
- Dynamic `/:campaignId` detail page with ad set and ad drill-down
- Persistent per-campaign total paid input stored in `data/campaign-budgets.json`
- Mock fallback data when sample credentials are still in use
- Spend summary cards, daily chart, and campaign table

## Environment

Create `.env.local` and replace the sample values:

```env
META_ACCESS_TOKEN=replace_with_your_long_lived_access_token
META_AD_ACCOUNT_ID=act_123456789
META_API_VERSION=v25.0
ACCOUNT_CURRENCY=AED
DISPLAY_CURRENCY=USD
ACCOUNT_TO_DISPLAY_RATE=0.272294
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace_with_strong_password
ADMIN_SESSION_SECRET=replace_with_long_random_secret
```

Use a Meta Marketing API system user token for real dashboard usage. Short-lived developer tokens from Explorer or the app console will expire and break live reporting.
Spend from Meta is treated as account currency and converted into the dashboard display currency before totals are shown. Payments entered by the admin should use the dashboard display currency.
The app is protected by static admin credentials from the environment. All dashboard pages require login.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API

Example:

```txt
/api/meta/insights?start=2026-04-01&end=2026-04-14
```

The route returns aggregated daily and campaign spend data suitable for the dashboard.

## Campaign detail workflow

- Click any campaign in the overview table to open `/:campaignId`
- Add incremental payments for that campaign
- The app calculates `current wallet = sum(payments) - total spent`
- The detail screen expands campaign data into ad sets, then ads under each ad set

Messages and followers are derived from Meta `actions` values when matching action types are available in the response.
