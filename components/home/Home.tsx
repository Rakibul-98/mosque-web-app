// app/page.tsx
import { CommitteeList } from "@/components/committee/CommitteeList";
import {
  getCommitteeMembers,
  getDashboardStats,
  getRecentTransactions,
} from "../../lib/data/data";
import { TransactionList } from "../transaction/TransactionList";

export default async function Home() {
  const [stats, transactions, committee] = await Promise.all([
    getDashboardStats(),
    getRecentTransactions(5),
    getCommitteeMembers(),
  ]);

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {process.env.MOSQUE_NAME || "Masjid Al-Hidayah"}
        </h1>
        <p className="text-gray-600">Financial Transparency Portal</p>
      </div>

      {/* Total Balance div */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium mb-1">Total Balance</h2>
            <p className="text-sm opacity-90">Combined funds (Mosque + Imam)</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tracking-tight">
              ₹{stats.total_balance.toLocaleString("en-IN")}
            </div>
            <p className="text-sm opacity-90 mt-1">Available Funds</p>
          </div>
        </div>

        {/* Fund Breakdown */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm opacity-90">Mosque Fund</p>
            <p className="text-lg font-semibold">
              ₹{stats.mosque_balance.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm opacity-90">Imam Fund</p>
            <p className="text-lg font-semibold">
              ₹{stats.imam_balance.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 text-center">
          <div className="text-green-600 text-2xl mb-2">💰</div>
          <h3 className="font-medium text-gray-900">Total Transactions</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {stats.total_transactions}
          </p>
          <p className="text-sm text-gray-500 mt-1">All time records</p>
        </div>

        <div className="p-4 text-center">
          <div className="text-purple-600 text-2xl mb-2">👥</div>
          <h3 className="font-medium text-gray-900">Committee Members</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {committee.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Active members</p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <section id="transactions" className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Transactions
          </h2>
          <a
            href="/transactions"
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            View All →
          </a>
        </div>
        <TransactionList transactions={transactions} />
      </section>

      {/* Committee Members Section */}
      <section id="committee" className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Committee Members</h2>
          <a
            href="/committee"
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            View All →
          </a>
        </div>
        <CommitteeList members={committee} />
      </section>

      {/* Login Section */}
      <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Authorized Access</h3>
        <p className="text-gray-600 text-sm mb-4">
          Cashiers and Admins can log in for additional access
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Cashier Login
          </a>
          <a
            href="/login?role=admin"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
          >
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
