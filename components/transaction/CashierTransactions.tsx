// app/cashier/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { Plus, LogOut } from "lucide-react";
import { getCurrentUser, logout, requireAuth } from "../../lib/auth/auth";
import {
  addTransaction,
  deleteTransaction,
  getRecentTransactions,
  updateTransaction,
} from "../../lib/data/data";
import { TransactionList } from "./TransactionList";
import { useRouter } from "next/navigation";

export default function CashierTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    fund: "mosque" as "mosque" | "imam",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  // Check auth on mount
  useEffect(() => {
    if (requireAuth("cashier")) {
      setIsAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!requireAuth("cashier")) return;
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentTransactions(50);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingId) {
        await updateTransaction(editingId, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      // Reset form
      setFormData({
        amount: "",
        purpose: "",
        fund: "mosque",
        transaction_date: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      setEditingId(null);
      await loadTransactions();

      alert(editingId ? "Transaction updated!" : "Transaction added!");
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Error saving transaction. Please try again.");
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      amount: transaction.amount.toString(),
      purpose: transaction.purpose,
      fund: transaction.fund,
      transaction_date: transaction.transaction_date.split("T")[0],
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await deleteTransaction(id);
      await loadTransactions();
      alert("Transaction deleted!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Error deleting transaction. Please try again.");
    }
  };

  const handleLogout = () => {
    logout();
  };

  const user = getCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">
              Logged in as{" "}
              <span className="font-semibold text-blue-600">{user?.name}</span>{" "}
              (Cashier)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/cashier/add-transaction")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add New
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Transaction" : "Add New Transaction"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fund
                </label>
                <select
                  value={formData.fund}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fund: e.target.value as "mosque" | "imam",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mosque">Mosque Fund</option>
                  <option value="imam">Imam Fund</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter purpose"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                {editingId ? "Update" : "Add Transaction"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Transaction Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          Add New Transaction
        </button>
      )}

      {/* Transactions List */}
      <TransactionList
        transactions={transactions}
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
