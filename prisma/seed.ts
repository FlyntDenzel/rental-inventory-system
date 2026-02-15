import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const adminPassword = await hash('admin123', 10)
  const staffPassword = await hash('staff123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      name: 'Staff Member',
      password: staffPassword,
      role: 'STAFF',
    },
  })

  console.log('✅ Created users:', { admin: admin.email, staff: staff.email })

  // Create inventory items
  const canopy = await prisma.inventoryItem.create({
    data: {
      name: 'White Event Canopy 10x10',
      category: 'CANOPY',
      description: 'Large white canopy for outdoor events',
      quantity: 10,
      availableQty: 10,
      pricePerDay: 50.00,
      pricePerWeek: 300.00,
      status: 'AVAILABLE',
    },
  })

  const chair = await prisma.inventoryItem.create({
    data: {
      name: 'Folding Chair',
      category: 'CHAIR',
      description: 'Standard folding chair',
      quantity: 100,
      availableQty: 100,
      pricePerDay: 2.50,
      pricePerWeek: 15.00,
      status: 'AVAILABLE',
    },
  })

  const table = await prisma.inventoryItem.create({
    data: {
      name: 'Round Banquet Table',
      category: 'TABLE',
      description: '60-inch round table',
      quantity: 20,
      availableQty: 20,
      pricePerDay: 15.00,
      pricePerWeek: 90.00,
      status: 'AVAILABLE',
    },
  })

  const decoration = await prisma.inventoryItem.create({
    data: {
      name: 'LED String Lights',
      category: 'DECORATION',
      description: 'Warm white LED string lights, 50ft',
      quantity: 15,
      availableQty: 15,
      pricePerDay: 10.00,
      pricePerWeek: 50.00,
      status: 'AVAILABLE',
    },
  })

  console.log('✅ Created inventory items')

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      address: '456 Oak Ave, Town, State 54321',
    },
  })

  console.log('✅ Created customers')

  // Create a sample rental
  const rental = await prisma.rental.create({
    data: {
      rentalNumber: `RNT-${Date.now()}`,
      customerId: customer1.id,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-03'),
      totalAmount: 315.00,
      deposit: 50.00,
      status: 'COMPLETED',
      notes: 'Wedding event',
      createdById: staff.id,
      rentalItems: {
        create: [
          {
            itemId: canopy.id,
            quantity: 2,
            pricePerUnit: 50.00,
            subtotal: 100.00,
          },
          {
            itemId: chair.id,
            quantity: 50,
            pricePerUnit: 2.50,
            subtotal: 125.00,
          },
          {
            itemId: table.id,
            quantity: 6,
            pricePerUnit: 15.00,
            subtotal: 90.00,
          },
        ],
      },
    },
  })

  // Create a payment for the rental
  await prisma.payment.create({
    data: {
      rentalId: rental.id,
      amount: 315.00,
      paymentMethod: 'Cash',
      paymentStatus: 'PAID',
      recordedById: staff.id,
    },
  })

  console.log('✅ Created sample rental and payment')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
