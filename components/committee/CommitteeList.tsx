// components/committee/CommitteeList.tsx
"use client";

import { CommitteeMember } from "@/lib/types";
import { Phone } from "lucide-react";

interface CommitteeListProps {
  members: CommitteeMember[];
  limit?: number;
  showActions?: boolean;
  onEdit?: (member: CommitteeMember) => void;
  onDelete?: (member: CommitteeMember) => void; // Changed from (id: string)
}

export function CommitteeList({
  members,
  limit = 4,
  showActions = false,
  onEdit,
  onDelete,
}: CommitteeListProps) {
  const displayedMembers = limit ? members.slice(0, limit) : members;

  // Function to handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
    const parent = e.currentTarget.parentElement;
    if (parent) {
      const initialSpan = document.createElement("span");
      const memberName = e.currentTarget.alt || "";
      initialSpan.className = "text-xl font-bold text-purple-700";
      initialSpan.textContent = memberName.charAt(0).toUpperCase();
      parent.appendChild(initialSpan);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {displayedMembers.map((member) => (
        <div
          key={member.id}
          className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            {/* Member Image or Initial */}
            <div className="w-16 h-16 mb-3 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              {member.image_url ? (
                <img
                  src={member.image_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <span className="text-xl font-bold text-purple-700">
                  {member.name.charAt(0)}
                </span>
              )}
            </div>

            <h4 className="font-semibold text-gray-900">{member.name}</h4>
            <p className="text-sm text-blue-600 font-medium mt-1">
              {member.designation}
            </p>

            {member.phone && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Phone size={12} />
                {member.phone}
              </div>
            )}

            {/* Action Buttons */}
            {showActions && onEdit && onDelete && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onEdit(member)}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(member)} // Pass the entire member object
                  className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
