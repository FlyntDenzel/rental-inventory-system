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
    const customer = await prisma.customer.findUnique({
      where: { id: params.id }
    })
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }
    
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
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
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
      }
    })
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
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
    // Check if customer has any rentals
    const rentals = await prisma.rental.findMany({
      where: { customerId: params.id }
    })
    
    if (rentals.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with existing rentals" },
        { status: 400 }
      )
    }
    
    await prisma.customer.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
