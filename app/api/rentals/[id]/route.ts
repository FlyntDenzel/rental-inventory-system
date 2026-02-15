import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rental = await prisma.rental.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        rentalItems: {
          include: {
            item: true
          }
        },
        payments: true,
      }
    })
    
    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }
    
    return NextResponse.json(rental)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rental" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const rental = await prisma.rental.update({
      where: { id: params.id },
      data: {
        status: body.status,
        returnDate: body.returnDate ? new Date(body.returnDate) : null,
        notes: body.notes,
      },
      include: {
        customer: true,
        rentalItems: {
          include: {
            item: true
          }
        },
        payments: true,
      }
    })
    
    // If status changed to COMPLETED, return items to inventory
    if (body.status === 'COMPLETED' && body.returnItems) {
      for (const item of rental.rentalItems) {
        await prisma.inventoryItem.update({
          where: { id: item.itemId },
          data: {
            availableQty: {
              increment: item.quantity
            }
          }
        })
      }
    }
    
    return NextResponse.json(rental)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update rental" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get rental with items
    const rental = await prisma.rental.findUnique({
      where: { id: params.id },
      include: {
        rentalItems: true,
        payments: true,
      }
    })
    
    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }
    
    // Check if rental has payments
    if (rental.payments.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete rental with existing payments. Cancel it instead." },
        { status: 400 }
      )
    }
    
    // Return items to inventory
    for (const item of rental.rentalItems) {
      await prisma.inventoryItem.update({
        where: { id: item.itemId },
        data: {
          availableQty: {
            increment: item.quantity
          }
        }
      })
    }
    
    // Delete rental (cascade will delete rental items)
    await prisma.rental.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete rental" }, { status: 500 })
  }
}
