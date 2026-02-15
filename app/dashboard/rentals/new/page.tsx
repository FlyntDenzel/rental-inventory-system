"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, ArrowLeft } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  availableQty: number
  pricePerDay: number
  pricePerWeek: number | null
}

interface Customer {
  id: string
  name: string
  phone: string
}

interface RentalItem {
  itemId: string
  itemName: string
  quantity: number
  pricePerUnit: number
  subtotal: number
}

export default function NewRentalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [deposit, setDeposit] = useState(0)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchItems()
    fetchCustomers()
  }, [])

  const fetchItems = async () => {
    const response = await fetch("/api/inventory")
    const data = await response.json()
    setItems(data.filter((item: InventoryItem) => item.availableQty > 0))
  }

  const fetchCustomers = async () => {
    const response = await fetch("/api/customers")
    const data = await response.json()
    setCustomers(data)
  }

  const addRentalItem = () => {
    if (items.length === 0) return
    const firstItem = items[0]
    setRentalItems([
      ...rentalItems,
      {
        itemId: firstItem.id,
        itemName: firstItem.name,
        quantity: 1,
        pricePerUnit: firstItem.pricePerDay,
        subtotal: firstItem.pricePerDay,
      },
    ])
  }

  const updateRentalItem = (index: number, field: string, value: any) => {
    const updated = [...rentalItems]
    const item = updated[index]
    
    if (field === 'itemId') {
      const selectedItem = items.find(i => i.id === value)
      if (selectedItem) {
        item.itemId = value
        item.itemName = selectedItem.name
        item.pricePerUnit = selectedItem.pricePerDay
        item.subtotal = item.quantity * selectedItem.pricePerDay
      }
    } else if (field === 'quantity') {
      item.quantity = parseInt(value)
      item.subtotal = item.quantity * item.pricePerUnit
    } else if (field === 'pricePerUnit') {
      item.pricePerUnit = parseFloat(value)
      item.subtotal = item.quantity * item.pricePerUnit
    }
    
    setRentalItems(updated)
  }

  const removeRentalItem = (index: number) => {
    setRentalItems(rentalItems.filter((_, i) => i !== index))
  }

  const getTotalAmount = () => {
    return rentalItems.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      })
      return
    }
    
    if (rentalItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer,
          startDate,
          endDate,
          totalAmount: getTotalAmount(),
          deposit,
          notes,
          items: rentalItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            subtotal: item.subtotal,
          })),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rental created successfully",
        })
        router.push("/dashboard/rentals")
      } else {
        throw new Error("Failed to create rental")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create rental",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Rental</h1>
          <p className="text-gray-600 mt-1">Create a new rental order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rental Period</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rental Items</CardTitle>
            <Button type="button" variant="outline" onClick={addRentalItem} disabled={items.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {rentalItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items added yet. Click "Add Item" to get started.
              </div>
            ) : (
              rentalItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-end border-b pb-4 last:border-0">
                  <div className="flex-1 space-y-2">
                    <Label>Item</Label>
                    <Select
                      value={item.itemId}
                      onValueChange={(value) => updateRentalItem(index, 'itemId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((invItem) => (
                          <SelectItem key={invItem.id} value={invItem.id}>
                            {invItem.name} (Available: {invItem.availableQty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateRentalItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Price/Unit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.pricePerUnit}
                      onChange={(e) => updateRentalItem(index, 'pricePerUnit', e.target.value)}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Subtotal</Label>
                    <Input value={item.subtotal.toFixed(2)} disabled />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeRentalItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
            {rentalItems.length > 0 && (
              <div className="flex justify-end text-xl font-bold pt-4 border-t">
                Total: ${getTotalAmount().toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit Amount</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                min="0"
                value={deposit}
                onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Create Rental</Button>
        </div>
      </form>
    </div>
  )
}
