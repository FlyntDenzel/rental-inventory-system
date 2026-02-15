"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Rental {
  id: string
  rentalNumber: string
  customer: {
    name: string
    phone: string
  }
  startDate: string
  endDate: string
  returnDate: string | null
  totalAmount: number
  deposit: number
  status: string
  rentalItems: Array<{
    quantity: number
    item: {
      name: string
    }
  }>
  payments: Array<{
    amount: number
  }>
  createdBy: {
    name: string
  }
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRental, setEditingRental] = useState<Rental | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editStatus, setEditStatus] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    try {
      const response = await fetch("/api/rentals")
      const data = await response.json()
      setRentals(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rentals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    }
    return colors[status] || colors.PENDING
  }

  const getTotalPaid = (payments: Array<{ amount: number }>) => {
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }

  const openEditDialog = (rental: Rental) => {
    setEditingRental(rental)
    setEditStatus(rental.status)
    setIsEditDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!editingRental) return

    try {
      const response = await fetch(`/api/rentals/${editingRental.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          returnDate: editStatus === 'COMPLETED' ? new Date().toISOString() : null,
          returnItems: editStatus === 'COMPLETED',
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rental status updated successfully",
        })
        fetchRentals()
        setIsEditDialogOpen(false)
        setEditingRental(null)
      } else {
        throw new Error("Failed to update rental")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rental",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string, rentalNumber: string) => {
    if (!confirm(`Are you sure you want to delete rental ${rentalNumber}? This will return items to inventory.`)) {
      return
    }

    try {
      const response = await fetch(`/api/rentals/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rental deleted successfully",
        })
        fetchRentals()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete rental")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete rental",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rentals</h1>
          <p className="text-gray-600 mt-1">Manage rental bookings and orders</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => router.push('/dashboard/rentals/new')}
        >
          <Plus className="h-4 w-4" />
          New Rental
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Rentals</CardDescription>
            <CardTitle className="text-3xl">{rentals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {rentals.filter(r => r.status === 'ACTIVE').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {rentals.filter(r => r.status === 'PENDING').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {rentals.filter(r => r.status === 'COMPLETED').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rentals</CardTitle>
          <CardDescription>Recent rental orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rental #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No rentals found
                    </TableCell>
                  </TableRow>
                ) : (
                  rentals.map((rental) => {
                    const totalPaid = getTotalPaid(rental.payments)
                    const balance = rental.totalAmount - totalPaid
                    
                    return (
                      <TableRow key={rental.id}>
                        <TableCell className="font-medium">{rental.rentalNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rental.customer.name}</div>
                            <div className="text-sm text-gray-500">{rental.customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {rental.rentalItems.map((item, idx) => (
                              <div key={idx}>
                                {item.quantity}x {item.item.name}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(rental.startDate)}</div>
                            <div className="text-gray-500">to {formatDate(rental.endDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(rental.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className={balance > 0 ? 'text-orange-600' : 'text-green-600'}>
                            {formatCurrency(totalPaid)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                            {rental.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {rental.createdBy.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(rental)}
                              title="Update Status"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rental.id, rental.rentalNumber)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Rental"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Rental Status</DialogTitle>
            <DialogDescription>
              Change the status of rental {editingRental?.rentalNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {editStatus === 'COMPLETED' && (
                <p className="text-sm text-muted-foreground">
                  Items will be returned to inventory when marked as completed.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
