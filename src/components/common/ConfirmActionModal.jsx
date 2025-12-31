import Card from "./Card";
import AppButton from "./AppButton";

export default function ConfirmActionModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}) {
  return (
    <div className="modal-backdrop show d-flex align-items-center justify-content-center">
      <Card style={{ width: 420 }}>
        <h5 className="mb-2">{title}</h5>
        <p className="text-muted">{message}</p>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <AppButton variant="secondary" onClick={onCancel}>
            {cancelText}
          </AppButton>
          <AppButton variant={variant} onClick={onConfirm}>
            {confirmText}
          </AppButton>
        </div>
      </Card>
    </div>
  );
}
