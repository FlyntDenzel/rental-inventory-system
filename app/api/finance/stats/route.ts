import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get total revenue
    const payments = await prisma.payment.findMany({
      where: {
        paymentStatus: 'PAID'
      }
    })
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

    // Get pending payments
    const pendingRentals = await prisma.rental.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACTIVE']
        }
      },
      include: {
        payments: true
      }
    })
    
    const pendingAmount = pendingRentals.reduce((sum, rental) => {
      const paid = rental.payments.reduce((p, payment) => p + payment.amount, 0)
      return sum + (rental.totalAmount - paid)
    }, 0)

    // Get active rentals count
    const activeRentalsCount = await prisma.rental.count({
      where: {
        status: 'ACTIVE'
      }
    })

    // Get monthly revenue
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: currentMonth
        },
        paymentStatus: 'PAID'
      }
    })
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      totalRevenue,
      pendingAmount,
      activeRentalsCount,
      monthlyRevenue
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
