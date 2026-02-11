import React from "react";
import { toast as sonnerToast, ExternalToast } from "sonner";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "info";
  action?: React.ReactNode;
} & ExternalToast;

// Define the type for our wrapper function that also includes Sonner's methods
type ToastWrapper = ((props: string | ToastProps) => string | number) & typeof sonnerToast;

const toast = ((props: string | ToastProps) => {
  if (typeof props === "string") return sonnerToast(props);

  const { title, description, variant, ...rest } = props;

  if (variant === "destructive") {
    return sonnerToast.error(title, { description, ...rest });
  }

  if (variant === "success") {
    return sonnerToast.success(title, { description, ...rest });
  }

  if (variant === "info") {
    return sonnerToast.info(title, { description, ...rest });
  }

  return sonnerToast(title, { description, ...rest });
}) as ToastWrapper;

// Attach all Sonner methods to the wrapper
Object.assign(toast, sonnerToast);

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };
