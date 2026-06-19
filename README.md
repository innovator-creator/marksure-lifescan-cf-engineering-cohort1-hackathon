# MarkSure LifeScan

**Tagline:** Scan. Verify. Stay Safe.

MarkSure LifeScan is a product verification and safety intelligence platform that helps users verify the authenticity of medicines, cosmetics, and food products. Users can search by name, scan barcodes/QR codes, or upload photos for OCR identification. The platform uses a rule-based Trust Score Engine (0–100) to provide safety verdicts: Safe / Warning / Dangerous / Unknown.

## Features

- **Multi-Modal Product Lookup**: Search by name, barcode/QR scan, or photo upload with OCR
- **Trust Score Engine**: Deterministic scoring system based on multiple factors
- **External API Integration**: Open Food Facts, Open Beauty Facts, openFDA NDC, UPC Database
- **Community Reporting**: Users can report suspicious products with image uploads
- **Admin Dashboard**: Product management, report review, and alert management
- **Safety Alerts**: FDA recall integration and admin-created alerts
- **Educational Content**: Authenticity guides and expiry information per category

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- API keys for external services (optional but recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd marksure-lifescan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OFF_USER_AGENT=MarkSureLifeScan/1.0
OCRSPACE_API_KEY=your_ocrspace_api_key
UPC_LOOKUP_API_KEY=your_upc_lookup_api_key
```

5. Run database migrations:
```bash
# Apply the migration in Supabase SQL Editor or use the CLI
# File: supabase/migrations/001_initial_schema.sql
```

6. Seed the database:
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (for admin operations) |
| `OFF_USER_AGENT` | Yes | User agent for Open Food Facts API |
| `OCRSPACE_API_KEY` | Optional | API key for OCR.space image recognition |
| `UPC_LOOKUP_API_KEY` | Optional | API key for UPC Database lookup |

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration from `supabase/migrations/001_initial_schema.sql`
3. Create a storage bucket named `report-images` with public read access
4. Create an admin user in Supabase Authentication

### Running the Seed Script

```bash
npm run seed
```

This will populate the database with sample products across all categories and statuses for testing.

## API Source Attributions

This project uses the following external APIs:

- **Open Food Facts**: Product data for food items (https://world.openfoodfacts.org/)
- **Open Beauty Facts**: Product data for cosmetics (https://world.openbeautyfacts.org/)
- **openFDA NDC Directory**: Medicine information (https://open.fda.gov/)
- **openFDA Drug Enforcement**: FDA recall data (https://open.fda.gov/)
- **UPC Database**: Product barcode lookup (https://www.upcdatabase.com/)
- **OCR.space**: Image text recognition (https://ocr.space/)

## Trust Score System

The Trust Score Engine calculates a score from 0–100 based on:

### Positive Factors
- +40: Verified by authority
- +25: Found in MarkSure database
- +10: Valid barcode/QR format
- +15: No community reports

### Negative Factors
- -10 per community report
- -25: Invalid batch number
- -40: Not found in MarkSure database (external source)

### Verdict Bands
- **80–100**: Safe
- **50–79**: Warning
- **20–49**: Dangerous
- **0–19**: Unknown

## Project Structure

```
marksure-lifescan/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── product/           # Product pages
│   ├── report/            # Report submission
│   ├── scan/              # Barcode scanner
│   └── identify/          # Image identification
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── product/          # Product-specific components
│   ├── report/           # Report form components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── constants/        # Constants and enums
│   ├── content/          # Static content
│   ├── db/               # Database helpers
│   ├── integrations/     # External API integrations
│   ├── storage/          # Storage helpers
│   ├── supabase/         # Supabase client
│   ├── trust-score/      # Trust score calculation
│   └── types/            # TypeScript types
├── scripts/               # Utility scripts
│   ├── seed.ts          # Database seeding
│   └── cache-openfda-recalls.ts
└── supabase/             # Database migrations
```

## Admin Dashboard

Access the admin dashboard at `/admin` after creating an admin user in Supabase Authentication.

Features:
- Product CRUD operations
- Report review and management
- Alert creation and management
- Trust score adjustments

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Hackathon Pitch

MarkSure LifeScan addresses the critical problem of counterfeit and unsafe products in the market, particularly in developing regions where regulatory oversight may be limited. By combining multiple verification methods (name search, barcode scanning, and OCR photo identification) with a transparent trust score system, we empower consumers to make informed decisions about product safety.

The platform leverages existing open data sources (Open Food Facts, openFDA) while building a community-driven database of verified products. The admin dashboard enables authorities and trusted organizations to maintain product information and issue safety alerts.

**Target Users**: Consumers, pharmacists, health workers, and regulatory bodies
**Impact**: Reduced exposure to counterfeit medicines, unsafe cosmetics, and contaminated food products
**Scalability**: Cloud-native architecture with serverless deployment

## License

This project is built for the CF Engineering Cohort 1 Hackathon.
