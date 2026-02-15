# Rental Inventory Management System

A comprehensive web-based platform for managing rental inventory, customers, bookings, and finances. Built with Next.js, Prisma, PostgreSQL, and shadcn/ui.

## Features

### 🔐 Role-Based Access Control
- **Admin**: Full access to all features including financial reports
- **Staff**: Access to inventory, rentals, and customers (no finance access)

### 📦 Inventory Management
- Add, view, and manage rental items
- Track available quantities
- Categorize items (Canopy, Chair, Table, Decoration, Other)
- Set daily and weekly pricing
- Monitor item status (Available, Rented, Maintenance, Damaged)

### 🛒 Rental Management
- Create new rental orders
- Select customers and items
- Set rental periods
- Calculate total amounts automatically
- Track rental status (Pending, Active, Completed, Cancelled)
- View rental history

### 👥 Customer Management
- Store customer information
- Track contact details
- View customer rental history

### 💰 Finance Dashboard (Admin Only)
- View total revenue
- Monitor monthly revenue
- Track pending payments
- View payment history
- Financial summaries and reports

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone or extract the project**

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rental_inventory?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

Replace `username`, `password`, and database details with your PostgreSQL credentials.

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run db:seed
```

5. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Login Credentials

After seeding the database, use these credentials:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Staff Account:**
- Email: `staff@example.com`
- Password: `staff123`

## Project Structure

```
rental-inventory-system/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── inventory/    # Inventory CRUD
│   │   ├── rentals/      # Rentals CRUD
│   │   ├── customers/    # Customers CRUD
│   │   ├── payments/     # Payments CRUD
│   │   └── finance/      # Financial reports
│   ├── dashboard/        # Main application pages
│   │   ├── inventory/    # Inventory management
│   │   ├── rentals/      # Rental management
│   │   ├── customers/    # Customer management
│   │   └── finance/      # Finance dashboard (admin only)
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   └── providers/        # Context providers
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeder
└── types/                # TypeScript type definitions
```

## Database Schema

### Key Models:
- **User**: Staff and admin users
- **InventoryItem**: Rental items with pricing and availability
- **Customer**: Customer information
- **Rental**: Rental orders with items
- **RentalItem**: Line items in rentals
- **Payment**: Payment records

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Inventory
- `GET /api/inventory` - List all items
- `POST /api/inventory` - Create new item

### Rentals
- `GET /api/rentals` - List all rentals
- `POST /api/rentals` - Create new rental

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer

### Payments (Admin Only)
- `GET /api/payments` - List all payments
- `POST /api/payments` - Record new payment

### Finance (Admin Only)
- `GET /api/finance/stats` - Get financial statistics

## Features by Role

### Staff Members Can:
✅ View and manage inventory
✅ Create and view rentals
✅ Add and view customers
✅ Record payments
❌ View financial reports and analytics

### Administrators Can:
✅ Everything staff can do
✅ View financial dashboard
✅ Access payment history
✅ View revenue reports
✅ Monitor business metrics

## Customization

### Adding New Item Categories
Edit `prisma/schema.prisma`:
```prisma
enum ItemCategory {
  CANOPY
  CHAIR
  TABLE
  DECORATION
  YOUR_NEW_CATEGORY
  OTHER
}
```

Then run: `npx prisma migrate dev`

### Changing Theme Colors
Edit `tailwind.config.js` and `app/globals.css` to customize the color scheme.

## Production Deployment

1. **Build the application**
```bash
npm run build
```

2. **Set production environment variables** with secure values

3. **Run migrations on production database**
```bash
npx prisma migrate deploy
```

4. **Start the production server**
```bash
npm start
```

## Database Management

### View database in Prisma Studio
```bash
npx prisma studio
```

### Create a new migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset database (WARNING: deletes all data)
```bash
npx prisma migrate reset
```

## Troubleshooting

### Database connection issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists

### Authentication issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Build errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Ensure all dependencies are installed

## Support

For issues or questions, please check:
1. Database connection is working
2. All environment variables are set
3. Dependencies are properly installed
4. Prisma client is generated

## License

This project is provided as-is for use in your rental business operations.
