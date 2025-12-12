// lib/data.ts
import { supabase, getAuthClient, STORAGE_BUCKET } from "../../supabase";
import { CommitteeMember, DashboardStats, Transaction } from "../types";

async function getFundBalance(fund: "imam" | "mosque"): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount")
      .eq("fund", fund);

    if (error) throw error;

    return data?.reduce((sum, t) => sum + t.amount, 0) || 0;
  } catch (error) {
    console.error(`Error fetching ${fund} balance:`, error);
    return 0;
  }
}

export async function uploadCommitteeMemberImage(
  file: File,
  memberId: string
): Promise<string> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error("Image size should be less than 5MB");
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${memberId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function deleteCommitteeMemberImage(imageUrl: string) {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [mosqueBalance, imamBalance, allTransactions] = await Promise.all([
      getFundBalance("mosque"),
      getFundBalance("imam"),
      getRecentTransactions(1000), // Get all transactions for stats
    ]);

    // Calculate income/expense (simplified - in real app, you might have type field)
    // For now, all are considered as positive amounts (income)
    // You might want to add a 'type' field later if needed

    return {
      mosque_balance: mosqueBalance,
      imam_balance: imamBalance,
      total_balance: mosqueBalance + imamBalance,
      mosque_income: mosqueBalance, // All are income for now
      mosque_expense: 0, // No expenses in current structure
      imam_income: imamBalance, // All are income for now
      imam_expense: 0, // No expenses in current structure
      total_transactions: allTransactions.length,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      mosque_balance: 0,
      imam_balance: 0,
      total_balance: 0,
      mosque_income: 0,
      mosque_expense: 0,
      imam_income: 0,
      imam_expense: 0,
      total_transactions: 0,
    };
  }
}

export async function getRecentTransactions(
  limit: number = 10
): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
                *,
                user:users(name)
            `
      )
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((t) => ({
        id: t.id,
        amount: t.amount,
        purpose: t.purpose,
        fund: t.fund,
        transaction_date: t.transaction_date,
        created_at: t.created_at,
        created_by: t.created_by,
        created_by_name: t.user?.name || "Unknown",
      })) || []
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function getCommitteeMembers(): Promise<CommitteeMember[]> {
  try {
    const { data, error } = await supabase
      .from("committee_members")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching committee members:", error);
    return [];
  }
}

export async function addTransaction(
  transaction: Omit<
    Transaction,
    "id" | "created_at" | "created_by" | "created_by_name"
  >
) {
  try {
    const authClient = getAuthClient();
    const userId = localStorage.getItem("user_id");

    if (!userId) throw new Error("Not authenticated");

    const { data, error } = await authClient
      .from("transactions")
      .insert({
        amount: transaction.amount,
        purpose: transaction.purpose,
        fund: transaction.fund,
        transaction_date: transaction.transaction_date,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
}

export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
) {
  try {
    const authClient = getAuthClient();
    const userId = localStorage.getItem("user_id");

    if (!userId) throw new Error("Not authenticated");

    const { data, error } = await authClient
      .from("transactions")
      .update({
        amount: updates.amount,
        purpose: updates.purpose,
        fund: updates.fund,
        transaction_date: updates.transaction_date,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
}

export async function deleteTransaction(id: string) {
  try {
    const authClient = getAuthClient();
    const userId = localStorage.getItem("user_id");

    if (!userId) throw new Error("Not authenticated");

    const { error } = await authClient
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}

export async function addCommitteeMember(
  member: Omit<CommitteeMember, "id" | "created_at">,
  imageFile?: File
) {
  try {
    const authClient = getAuthClient();
    const userId = localStorage.getItem("user_id");

    if (!userId) throw new Error("Not authenticated");

    let imageUrl: string | undefined = undefined;

    // If image file is provided, upload it
    if (imageFile) {
      // First create a temporary ID for the upload
      const tempId = `temp-${Date.now()}`;
      imageUrl = await uploadCommitteeMemberImage(imageFile, tempId);
    }

    // Insert committee member
    const { data, error } = await authClient
      .from("committee_members")
      .insert({
        name: member.name,
        image_url: imageUrl,
        designation: member.designation,
        phone: member.phone,
        is_active: member.is_active,
      })
      .select()
      .single();

    if (error) {
      // If there was an error and we uploaded an image, delete it
      if (imageUrl) {
        await deleteCommitteeMemberImage(imageUrl).catch(console.error);
      }
      throw error;
    }

    // If we have an image and the insert was successful, update the filename with actual member ID
    if (imageFile && imageUrl && data) {
      try {
        // Extract old filename from URL
        const oldUrlParts = imageUrl.split("/");
        const oldFileName = oldUrlParts[oldUrlParts.length - 1];
        const fileExt = oldFileName.split(".").pop();
        const newFileName = `${data.id}-${Date.now()}.${fileExt}`;

        // Copy to new filename with member ID
        const { error: copyError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .copy(oldFileName, newFileName);

        if (!copyError) {
          // Get new public URL
          const {
            data: { publicUrl: newImageUrl },
          } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(newFileName);

          // Update committee member with new image URL
          await authClient
            .from("committee_members")
            .update({ image_url: newImageUrl })
            .eq("id", data.id);

          // Delete old temporary file
          await deleteCommitteeMemberImage(imageUrl);

          // Update return data with new image URL
          data.image_url = newImageUrl;
        }
      } catch (imageError) {
        console.error("Error updating image filename:", imageError);
        // Continue with original image URL if renaming fails
      }
    }

    return data;
  } catch (error) {
    console.error("Error adding committee member:", error);
    throw error;
  }
}

export async function updateCommitteeMember(
  id: string,
  updates: Partial<CommitteeMember>,
  imageFile?: File
) {
  try {
    const authClient = getAuthClient();
    const userId = localStorage.getItem("user_id");

    if (!userId) throw new Error("Not authenticated");

    // If new image file is provided
    if (imageFile) {
      // Upload new image
      const newImageUrl = await uploadCommitteeMemberImage(imageFile, id);

      // Delete old image if exists
      if (updates.image_url) {
        await deleteCommitteeMemberImage(updates.image_url).catch(
          console.error
        );
      }

      // Update with new image URL
      updates.image_url = newImageUrl;
    }

    const { data, error } = await authClient
      .from("committee_members")
      .update({
        name: updates.name,
        image_url: updates.image_url,
        designation: updates.designation,
        phone: updates.phone,
        is_active: updates.is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating committee member:", error);
    throw error;
  }
}

export async function deleteCommitteeMember(id: string, imageUrl?: string) {
  try {
    const authClient = getAuthClient();
    const userId = localStorage.getItem("user_id");

    if (!userId) throw new Error("Not authenticated");

    // Delete associated image if exists
    if (imageUrl) {
      await deleteCommitteeMemberImage(imageUrl).catch(console.error);
    }

    const { error } = await authClient
      .from("committee_members")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting committee member:", error);
    throw error;
  }
}

export function getImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeImagePreviewUrl(url: string) {
  URL.revokeObjectURL(url);
}
