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
    const item = await prisma.inventoryItem.findUnique({
      where: { id: params.id }
    })
    
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
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
    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        quantity: body.quantity,
        availableQty: body.availableQty,
        pricePerDay: body.pricePerDay,
        pricePerWeek: body.pricePerWeek,
        status: body.status,
      }
    })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
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
    // Check if item is used in any rentals
    const rentalItems = await prisma.rentalItem.findMany({
      where: { itemId: params.id }
    })
    
    if (rentalItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete item that has been used in rentals" },
        { status: 400 }
      )
    }
    
    await prisma.inventoryItem.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
