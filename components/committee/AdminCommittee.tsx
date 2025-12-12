// app/admin/committee/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CommitteeMember } from "@/lib/types";
import { Plus, LogOut } from "lucide-react";
import { CommitteeList } from "@/components/committee/CommitteeList";
import { getCurrentUser, logout, requireAuth } from "../../lib/auth/auth";
import {
  addCommitteeMember,
  deleteCommitteeMember,
  getCommitteeMembers,
  updateCommitteeMember,
} from "../../lib/data/data";

export default function AdminCommittee() {
  const router = useRouter();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    designation: "",
    phone: "",
    is_active: true,
  });

  useEffect(() => {
    if (!requireAuth("admin")) return;
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await getCommitteeMembers();
      setMembers(data);
    } catch (error) {
      console.error("Error loading committee members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateCommitteeMember(editingId, formData);
      } else {
        await addCommitteeMember(formData);
      }

      // Reset form
      setFormData({
        name: "",
        image_url: "",
        designation: "",
        phone: "",
        is_active: true,
      });
      setShowForm(false);
      setEditingId(null);
      await loadMembers();

      alert(editingId ? "Member updated!" : "Member added!");
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Error saving member. Please try again.");
    }
  };

  const handleEdit = (member: CommitteeMember) => {
    setFormData({
      name: member.name,
      image_url: member.image_url || "",
      designation: member.designation,
      phone: member.phone || "",
      is_active: member.is_active,
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = async (member: CommitteeMember) => {
    if (!confirm("Are you sure you want to delete this committee member?"))
      return;

    try {
      await deleteCommitteeMember(member.id, member.image_url);
      await loadMembers();
      alert("Member deleted!");
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Error deleting member. Please try again.");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className=" from-purple-600 to-purple-700 rounded-xl shadow-sm p-6 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Committee Management</h1>
            <p className="opacity-90">
              Logged in as <span className="font-semibold">{user?.name}</span>{" "}
              (Admin)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/admin/add-member")}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg"
            >
              <Plus size={16} />
              Add Member
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-lg"
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
              {editingId ? "Edit Committee Member" : "Add New Member"}
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
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., President, Treasurer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use initial letter as avatar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Phone number"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 text-purple-600 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active Member
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700"
              >
                {editingId ? "Update Member" : "Add Member"}
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

      {/* Add Member Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
        >
          <Plus size={20} />
          Add Committee Member
        </button>
      )}

      {/* Committee Members List */}
      <CommitteeList
        members={members}
        showActions={true}
        onEdit={handleEdit}
        onDelete={(member) => handleDelete(member)}
      />
    </div>
  );
}
