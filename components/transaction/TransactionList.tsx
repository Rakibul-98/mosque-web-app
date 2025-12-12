// components/transactions/TransactionList.tsx
"use client";

import { Transaction } from "@/lib/types";

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
  showActions?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionList({
  transactions,
  limit = 5,
  showActions = false,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const displayedTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-3">
      {displayedTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No transactions recorded yet
        </div>
      ) : (
        displayedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.fund === "mosque"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {transaction.fund === "mosque"
                      ? "Mosque Fund"
                      : "Imam Fund"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(transaction.transaction_date)}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mt-2">
                  {transaction.purpose}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Recorded by {transaction.created_by_name}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-gray-900">
                  ₹{transaction.amount.toLocaleString("en-IN")}
                </div>

                {/* Action Buttons */}
                {showActions && onEdit && onDelete && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
