import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  title?: string;
  message?: string;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  setOpen,
  title = "Are you sure?",
  message = "Do you really want to perform this action?",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-gray-600 mt-2 mb-4">{message}</p>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="min-w-[80px]"
          >
            No
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 min-w-[80px]"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
