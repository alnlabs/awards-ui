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
    <div
      className="d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)", // ✅ DARK BACKDROP
        zIndex: 1050, // ✅ ABOVE PAGE CONTENT
      }}
    >
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
