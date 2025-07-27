import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import UserForm from "./UserForm";

export default function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  onSubmit,
  onCancel,
  loading,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingUser ? "Edit User" : "New User"}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Update user information below."
              : "Fill in the user information below."}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          initialValues={editingUser || {}}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
