import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rentals = await prisma.rental.findMany({
      include: {
        customer: true,
        rentalItems: {
          include: {
            item: true
          }
        },
        payments: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(rentals)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rentals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Generate rental number
    const rentalNumber = `RNT-${Date.now()}`
    
    // Create rental with items
    const rental = await prisma.rental.create({
      data: {
        rentalNumber,
        customerId: body.customerId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalAmount: body.totalAmount,
        deposit: body.deposit || 0,
        status: body.status || 'PENDING',
        notes: body.notes,
        createdById: session.user.id,
        rentalItems: {
          create: body.items.map((item: any) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        customer: true,
        rentalItems: {
          include: {
            item: true
          }
        }
      }
    })
    
    // Update inventory quantities
    for (const item of body.items) {
      await prisma.inventoryItem.update({
        where: { id: item.itemId },
        data: {
          availableQty: {
            decrement: item.quantity
          }
        }
      })
    }
    
    return NextResponse.json(rental)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create rental" }, { status: 500 })
  }
}
