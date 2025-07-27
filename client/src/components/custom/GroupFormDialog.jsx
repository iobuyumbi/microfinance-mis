import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GroupForm from "./GroupForm";

export default function GroupFormDialog({
  open,
  onOpenChange,
  editingGroup,
  onSubmit,
  onCancel,
  loading,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingGroup ? "Edit Group" : "New Group"}</DialogTitle>
          <DialogDescription>
            {editingGroup
              ? "Update group information below."
              : "Fill in the group information below."}
          </DialogDescription>
        </DialogHeader>
        <GroupForm
          initialValues={editingGroup || {}}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
