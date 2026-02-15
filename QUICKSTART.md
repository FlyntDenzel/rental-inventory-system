# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
Copy `.env.example` to `.env` and update your database connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rental_inventory"
NEXTAUTH_SECRET="generate-a-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 3: Setup Database
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### Step 4: Run the Application
```bash
npm run dev
```

Visit http://localhost:3000

### Step 5: Login
Use these demo credentials:

**Admin (Full Access):**
- Email: admin@example.com
- Password: admin123

**Staff (No Finance Access):**
- Email: staff@example.com
- Password: staff123

## 📋 What You Can Do

### As Staff:
1. Go to **Inventory** - Add items like canopies, chairs, tables
2. Go to **Customers** - Add your customers
3. Go to **Rentals** → New Rental - Create rental orders
4. View all rentals and track status

### As Admin:
- Everything above, PLUS
- Go to **Finance** - View revenue, payments, and financial reports

## 🔧 Common Commands

```bash
# Start development server
npm run dev

# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed sample data again
npm run db:seed
```

## 💡 Tips

1. **Categories**: Items can be categorized as Canopy, Chair, Table, Decoration, or Other
2. **Pricing**: Set both daily and weekly prices for flexibility
3. **Inventory Tracking**: System automatically tracks available quantities when items are rented
4. **Role Security**: Finance page is only accessible to ADMIN users

## 🐛 Troubleshooting

**Can't connect to database?**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in .env
- Ensure the database exists

**Login not working?**
- Run `npm run db:seed` to create demo users
- Clear browser cookies
- Check NEXTAUTH_SECRET is set in .env

**Build errors?**
```bash
rm -rf .next node_modules
npm install
```

## 📚 Next Steps

1. Change the default passwords in production
2. Add your own inventory items
3. Customize categories in prisma/schema.prisma
4. Adjust pricing and business rules as needed
5. Deploy to production (Vercel, Railway, etc.)

Happy renting! 🎉
