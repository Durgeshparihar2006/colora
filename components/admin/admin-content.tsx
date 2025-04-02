import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GamesContent from "./games-content"
import PaymentVerification from "./payment-verification"
import WithdrawalRequests from "./withdrawal-requests"
import AddMoneyRequests from "./add-money-requests"
import TransactionsContent from "./transactions-content"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  Receipt, 
  Settings,
  Wallet,
  CreditCard,
  ArrowDownLeft,
  CircleDollarSign
} from "lucide-react"
import { Card } from "@/components/ui/card"

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState("games")
  const [activePage, setActivePage] = useState("dashboard")

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "addmoney", label: "Add Money", icon: Wallet },
    { id: "withdrawals", label: "Withdrawals", icon: ArrowDownLeft },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant={activePage === item.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActivePage(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {activePage === "games" && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="games">Game Management</TabsTrigger>
                <TabsTrigger value="addmoney">Add Money Requests</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>
              <TabsContent value="games">
                <GamesContent />
              </TabsContent>
              <TabsContent value="addmoney">
                <AddMoneyRequests />
              </TabsContent>
              <TabsContent value="withdrawals">
                <WithdrawalRequests />
              </TabsContent>
              <TabsContent value="payments">
                <PaymentVerification />
              </TabsContent>
            </Tabs>
          )}
          {activePage === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <CircleDollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold">₹0</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <Gamepad2 className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Bets</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Active Users</p>
                      <p className="text-2xl font-bold">1</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          {activePage === "users" && (
            <div className="text-2xl font-bold">Users Management</div>
          )}
          {activePage === "addmoney" && (
            <AddMoneyRequests />
          )}
          {activePage === "withdrawals" && (
            <WithdrawalRequests />
          )}
          {activePage === "transactions" && (
            <TransactionsContent />
          )}
          {activePage === "settings" && (
            <div className="text-2xl font-bold">Settings</div>
          )}
        </div>
      </div>
    </div>
  )
} 