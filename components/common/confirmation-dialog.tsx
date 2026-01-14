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
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-[#7661d3] to-[#3d326d] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              {title}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 pt-2">
          <p className="text-gray-600 mb-6 font-medium leading-relaxed">
            {message}
          </p>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-w-[80px] rounded-lg border-gray-200"
            >
              No
            </Button>

            <Button
              className="bg-red-500 hover:bg-red-600 min-w-[80px] rounded-lg border-none shadow-red-100"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
