// app/admin/add-member/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UserPlus,
  Phone,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { getCurrentUser, logout, requireAuth } from "../../lib/auth/auth";
import {
  addCommitteeMember,
  getImagePreviewUrl,
  revokeImagePreviewUrl,
} from "../../lib/data/data";

export default function AddCommitteeMember() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    phone: "",
    is_active: true,
  });

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Designation options
  const designationOptions = [
    "President",
    "Vice President",
    "Secretary",
    "Treasurer",
    "Joint Secretary",
    "Member",
    "Advisor",
  ];

  // Check auth on component mount
  useEffect(() => {
    if (!requireAuth("admin")) return;
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        revokeImagePreviewUrl(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    setError("");

    // Create preview
    const previewUrl = getImagePreviewUrl(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      revokeImagePreviewUrl(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    setIsUploadingImage(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error("Please enter member name");
      }

      if (!formData.designation.trim()) {
        throw new Error("Please select a designation");
      }

      const memberData = {
        name: formData.name.trim(),
        designation: formData.designation,
        phone: formData.phone.trim() || undefined,
        is_active: formData.is_active,
      };

      setIsUploadingImage(true);
      await addCommitteeMember(memberData, imageFile || undefined);
      setIsUploadingImage(false);

      // Show success message
      setSuccess("Committee member added successfully!");

      // Reset form
      setFormData({
        name: "",
        designation: "",
        phone: "",
        is_active: true,
      });

      // Clear image
      handleRemoveImage();

      // Auto redirect after 1.5 seconds
      setTimeout(() => {
        router.push("/admin/committee");
      }, 1500);
    } catch (error) {
      console.error("Error adding committee member:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add committee member. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-sm p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/admin/committee")}
            className="flex items-center gap-2 text-white/90 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <button
            onClick={handleLogout}
            className="text-sm text-white/90 hover:text-white"
          >
            Logout
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Add Committee Member</h1>
          <p className="opacity-90">
            Logged in as <span className="font-semibold">{user?.name}</span>{" "}
            (Admin)
          </p>
        </div>
      </div>

      {/* Add Member Form */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <UserPlus size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              New Committee Member
            </h2>
            <p className="text-sm text-gray-500">Add a new committee member</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter full name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Designation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation *
            </label>
            <select
              value={formData.designation}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
              disabled={isSubmitting}
            >
              <option value="">Select designation</option>
              {designationOptions.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <ImageIcon size={16} />
                Profile Photo (Optional)
              </span>
            </label>

            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-purple-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Click image to change
                  </p>
                </div>
              )}

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                  transition-all hover:border-purple-400 hover:bg-purple-50
                  ${imagePreview ? "hidden" : "border-gray-300"}
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Upload size={24} className="text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG (Max 5MB)
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Leave empty to use initial letter
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Phone size={16} />
                Phone Number (Optional)
              </span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="10-digit mobile number"
              maxLength={10}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-2">
              Mobile number will be visible to public
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
              disabled={isSubmitting}
            />
            <label htmlFor="is_active" className="ml-3 text-sm text-gray-700">
              <div className="font-medium">Active Member</div>
              <p className="text-gray-500">Uncheck to add as inactive member</p>
            </label>
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
              disabled={isSubmitting || isUploadingImage}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isUploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isUploadingImage ? "Uploading Image..." : "Adding Member..."}
                </>
              ) : (
                <>
                  <Save size={20} />
                  Add Committee Member
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-3">
              This member will be visible in the committee section
            </p>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-gray-900 mb-4">Member Preview</h3>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col items-center text-center">
            {/* Preview Image/Initial */}
            <div className="w-20 h-20 mb-4 overflow-hidden rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : formData.name ? (
                <span className="text-2xl font-bold text-purple-700">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="text-2xl font-bold text-purple-700">?</span>
              )}
            </div>

            <h4 className="font-semibold text-gray-900 text-lg">
              {formData.name || "Member Name"}
            </h4>

            {formData.designation && (
              <p className="text-purple-600 font-medium mt-1">
                {formData.designation}
              </p>
            )}

            {formData.phone && (
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <Phone size={14} />
                <span>+91 {formData.phone}</span>
              </div>
            )}

            <div className="mt-3">
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  formData.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {formData.is_active ? "Active Member" : "Inactive Member"}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          This is how the member will appear on the website
        </p>
      </div>
    </div>
  );
}
