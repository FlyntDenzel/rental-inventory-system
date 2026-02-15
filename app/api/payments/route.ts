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
    const payments = await prisma.payment.findMany({
      include: {
        rental: {
          include: {
            customer: true
          }
        },
        recordedBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const payment = await prisma.payment.create({
      data: {
        rentalId: body.rentalId,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentStatus || 'PAID',
        transactionId: body.transactionId,
        notes: body.notes,
        recordedById: session.user.id,
      },
      include: {
        rental: true
      }
    })
    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
