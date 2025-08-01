import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

const Modal = ({
  open = false,
  onOpenChange,
  title = "",
  description = "",
  children,
  footer,
  size = "default", // sm, default, lg, xl, full
  variant = "dialog", // dialog, sheet
  loading = false,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  showConfirm = true,
  confirmVariant = "default",
  cancelVariant = "outline",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
  contentClassName = "",
  headerClassName = "",
  footerClassName = "",
  showCloseButton = true,
  preventClose = false,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleOpenChange = (newOpen) => {
    if (preventClose && newOpen === false) {
      return;
    }
    onOpenChange?.(newOpen);
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleOpenChange(false);
  };

  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    full: "max-w-full",
  };

  const sheetSizeClasses = {
    sm: "w-[300px]",
    default: "w-[400px]",
    lg: "w-[500px]",
    xl: "w-[600px]",
    "2xl": "w-[700px]",
    "3xl": "w-[800px]",
    "4xl": "w-[900px]",
    "5xl": "w-[1000px]",
    "6xl": "w-[1100px]",
    full: "w-full",
  };

  const renderFooter = () => {
    if (footer) {
      return footer;
    }

    if (!showConfirm && !showCancel) {
      return null;
    }

    return (
      <div
        className={`flex items-center justify-end space-x-2 ${footerClassName}`}
      >
        {showCancel && (
          <Button
            variant={cancelVariant}
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        {showConfirm && (
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        )}
      </div>
    );
  };

  const renderHeader = () => (
    <div className={`flex items-center justify-between ${headerClassName}`}>
      <div className="flex-1">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {showCloseButton && !preventClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className={`${sheetSizeClasses[size]} ${contentClassName}`}
        >
          <SheetHeader className={headerClassName}>
            {renderHeader()}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">{children}</div>
          {renderFooter() && (
            <SheetFooter className={footerClassName}>
              {renderFooter()}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${sizeClasses[size]} ${contentClassName}`}
        onPointerDownOutside={
          closeOnOverlayClick ? undefined : (e) => e.preventDefault()
        }
        onEscapeKeyDown={closeOnEscape ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader className={headerClassName}>
          {renderHeader()}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">{children}</div>
        {renderFooter() && (
          <DialogFooter className={footerClassName}>
            {renderFooter()}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Convenience components for common modal types
export const ConfirmModal = ({
  open,
  onOpenChange,
  title = "Confirm Action",
  description = "Are you sure you want to perform this action?",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "destructive",
  loading = false,
  ...props
}) => (
  <Modal
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={description}
    onConfirm={onConfirm}
    onCancel={onCancel}
    confirmText={confirmText}
    cancelText={cancelText}
    confirmVariant={confirmVariant}
    loading={loading}
    size="sm"
    {...props}
  />
);

export const AlertModal = ({
  open,
  onOpenChange,
  title = "Alert",
  description,
  onConfirm,
  confirmText = "OK",
  variant = "default",
  ...props
}) => (
  <Modal
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={description}
    onConfirm={onConfirm}
    confirmText={confirmText}
    confirmVariant={variant}
    showCancel={false}
    size="sm"
    {...props}
  />
);

export const FormModal = ({
  open,
  onOpenChange,
  title = "Form",
  description = "",
  children,
  onConfirm,
  onCancel,
  confirmText = "Save",
  cancelText = "Cancel",
  loading = false,
  size = "lg",
  ...props
}) => (
  <Modal
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={description}
    onConfirm={onConfirm}
    onCancel={onCancel}
    confirmText={confirmText}
    cancelText={cancelText}
    loading={loading}
    size={size}
    {...props}
  >
    {children}
  </Modal>
);

export default Modal;
