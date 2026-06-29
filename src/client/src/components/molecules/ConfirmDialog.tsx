import { Button, Modal } from "@heroui/react";

type ConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
};

/** Reusable destructive-action confirmation modal. */
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  isLoading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            {description ? (
              <Modal.Body>
                <p className="text-sm text-muted">{description}</p>
              </Modal.Body>
            ) : null}
            <Modal.Footer className="flex justify-end gap-2">
              <Button variant="ghost" onPress={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isDisabled={isLoading}
                onPress={onConfirm}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
