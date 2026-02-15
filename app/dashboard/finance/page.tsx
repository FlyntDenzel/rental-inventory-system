"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, TrendingUp, CreditCard, Clock, Calendar } from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  paymentStatus: string
  transactionId: string | null
  notes: string | null
  createdAt: string
  rental: {
    rentalNumber: string
    customer: {
      name: string
    }
  }
  recordedBy: {
    name: string
  }
}

interface FinanceStats {
  totalRevenue: number
  pendingAmount: number
  activeRentalsCount: number
  monthlyRevenue: number
}

interface MonthlyData {
  month: string
  revenue: number
  rentals: number
}

interface CategoryData {
  name: string
  value: number
}

export default function FinancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    pendingAmount: 0,
    activeRentalsCount: 0,
    monthlyRevenue: 0,
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [paymentMethodData, setPaymentMethodData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      toast({
        title: "Access Denied",
        description: "Only administrators can access financial information",
        variant: "destructive",
      })
      router.push("/dashboard/inventory")
    } else if (status === "authenticated") {
      fetchFinanceData()
    }
  }, [status, session, router, toast])

  const fetchFinanceData = async () => {
    try {
      const [paymentsRes, statsRes, rentalsRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/finance/stats"),
        fetch("/api/rentals"),
      ])

      if (paymentsRes.ok && statsRes.ok && rentalsRes.ok) {
        const paymentsData = await paymentsRes.json()
        const statsData = await statsRes.json()
        const rentalsData = await rentalsRes.json()
        
        setPayments(paymentsData)
        setStats(statsData)
        
        processMonthlyData(paymentsData, rentalsData)
        processPaymentMethodData(paymentsData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const processMonthlyData = (payments: Payment[], rentals: any[]) => {
    const last6Months = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthIndex = date.getMonth()
      const year = date.getFullYear()
      
      const monthRevenue = payments
        .filter(p => {
          const paymentDate = new Date(p.createdAt)
          return paymentDate.getMonth() === monthIndex && 
                 paymentDate.getFullYear() === year &&
                 p.paymentStatus === 'PAID'
        })
        .reduce((sum, p) => sum + p.amount, 0)
      
      const monthRentals = rentals
        .filter(r => {
          const rentalDate = new Date(r.createdAt)
          return rentalDate.getMonth() === monthIndex && rentalDate.getFullYear() === year
        }).length
      
      last6Months.push({
        month: monthNames[monthIndex],
        revenue: monthRevenue,
        rentals: monthRentals,
      })
    }
    
    setMonthlyData(last6Months)
  }

  const processPaymentMethodData = (payments: Payment[]) => {
    const methodCounts: { [key: string]: number } = {}
    
    payments
      .filter(p => p.paymentStatus === 'PAID')
      .forEach(p => {
        methodCounts[p.paymentMethod] = (methodCounts[p.paymentMethod] || 0) + p.amount
      })
    
    const data = Object.entries(methodCounts).map(([name, value]) => ({
      name,
      value,
    }))
    
    setPaymentMethodData(data)
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  if (loading || status === "loading") {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-600 mt-1">Revenue analytics and payment tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-purple-100">Total Revenue</CardDescription>
            <DollarSign className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-sm text-purple-100 mt-1">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-blue-100">Monthly Revenue</CardDescription>
            <TrendingUp className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-sm text-blue-100 mt-1">Current month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-orange-100">Pending Payments</CardDescription>
            <Clock className="h-5 w-5 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.pendingAmount)}
            </div>
            <p className="text-sm text-orange-100 mt-1">Outstanding balance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-green-100">Active Rentals</CardDescription>
            <CreditCard className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.activeRentalsCount}
            </div>
            <p className="text-sm text-green-100 mt-1">Currently ongoing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Revenue Trend (Last 6 Months)
            </CardTitle>
            <CardDescription>Monthly revenue and rental count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Revenue') return [formatCurrency(value), 'Revenue']
                    return [value, 'Rentals']
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="rentals" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Rentals"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Methods
            </CardTitle>
            <CardDescription>Revenue by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Monthly Performance
          </CardTitle>
          <CardDescription>Revenue comparison across months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#8b5cf6" 
                radius={[8, 8, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Rental #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No payments recorded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.slice(0, 10).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell className="font-medium">
                        {payment.rental.rentalNumber}
                      </TableCell>
                      <TableCell>{payment.rental.customer.name}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {payment.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                          payment.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                          payment.paymentStatus === 'REFUNDED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payment.recordedBy.name}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Key financial metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600 font-medium">Total Revenue (All Time)</span>
                <span className="font-bold text-lg text-purple-600">{formatCurrency(stats.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600 font-medium">Current Month Revenue</span>
                <span className="font-bold text-lg text-blue-600">{formatCurrency(stats.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600 font-medium">Average Transaction</span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(payments.length > 0 ? stats.totalRevenue / payments.length : 0)}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600 font-medium">Outstanding Payments</span>
                <span className="font-bold text-lg text-orange-600">{formatCurrency(stats.pendingAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600 font-medium">Active Rentals</span>
                <span className="font-bold text-lg text-indigo-600">{stats.activeRentalsCount}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600 font-medium">Total Transactions</span>
                <span className="font-bold text-lg text-gray-700">{payments.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
