// app/cashier/add-transaction/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { getCurrentUser, logout, requireAuth } from "../../lib/auth/auth";
import { addTransaction } from "../../lib/data/data";

export default function AddTransaction() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    fund: "mosque" as "mosque" | "imam",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  // Check auth on component mount
  useEffect(() => {
    if (!requireAuth("cashier")) return;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount greater than 0");
      }

      if (!formData.purpose.trim()) {
        throw new Error("Please enter a purpose for the transaction");
      }

      const transactionData = {
        amount: amount,
        purpose: formData.purpose.trim(),
        fund: formData.fund,
        transaction_date: formData.transaction_date,
      };

      await addTransaction(transactionData);

      // Show success message
      setSuccess("Transaction added successfully!");

      // Reset form
      setFormData({
        amount: "",
        purpose: "",
        fund: "mosque",
        transaction_date: new Date().toISOString().split("T")[0],
      });

      // Auto redirect after 1.5 seconds
      setTimeout(() => {
        router.push("/cashier/transactions");
      }, 1500);
    } catch (error) {
      console.error("Error adding transaction:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add transaction. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/cashier/transactions")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
          <p className="text-gray-600">
            Logged in as{" "}
            <span className="font-semibold text-blue-600">{user?.name}</span>{" "}
            (Cashier)
          </p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              New Transaction
            </h2>
            <p className="text-sm text-gray-500">Add a new financial record</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter the transaction amount
            </p>
          </div>

          {/* Purpose Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose *
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the purpose of this transaction"
              rows={3}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-2">
              Example: Monthly donation from Ahmed Ali, Electricity bill payment
            </p>
          </div>

          {/* Fund Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fund Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, fund: "mosque" })}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${
                    formData.fund === "mosque"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }
                `}
                disabled={isSubmitting}
              >
                <div className="text-lg mb-1">🕌</div>
                <div className="font-medium">Mosque Fund</div>
                <div className="text-xs text-gray-500 mt-1">
                  General expenses
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, fund: "imam" })}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${
                    formData.fund === "imam"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }
                `}
                disabled={isSubmitting}
              >
                <div className="text-lg mb-1">📿</div>
                <div className="font-medium">Imam Fund</div>
                <div className="text-xs text-gray-500 mt-1">
                  Imam-related expenses
                </div>
              </button>
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Date *
            </label>
            <input
              type="date"
              value={formData.transaction_date}
              onChange={(e) =>
                setFormData({ ...formData, transaction_date: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-2">
              Select the date of transaction
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding Transaction...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Add Transaction
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-3">
              This transaction will be visible to all mosque members
            </p>
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-medium text-blue-900 mb-2">
          💡 Tips for adding transactions:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter accurate amounts for proper tracking</li>
          <li>• Describe the purpose clearly for transparency</li>
          <li>• Select the correct fund type</li>
          <li>• Use the actual transaction date</li>
          <li>• All transactions are publicly visible</li>
        </ul>
      </div>
    </div>
  );
}
