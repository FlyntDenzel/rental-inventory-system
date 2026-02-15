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
    const items = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        quantity: body.quantity,
        availableQty: body.quantity,
        pricePerDay: body.pricePerDay,
        pricePerWeek: body.pricePerWeek,
        status: body.status || 'AVAILABLE',
      }
    })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
