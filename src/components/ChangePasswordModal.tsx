import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Form, Input, Button } from "@douyinfe/semi-ui";
import { api } from "../api/client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearForm = useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    clearForm();
    onClose();
  }, [clearForm, onClose]);

  const handleSubmit = async () => {
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      window.setTimeout(() => {
        handleClose();
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Change Password"
      visible={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={400}
      closable
      afterClose={clearForm}
      getPopupContainer={() => document.querySelector(".dexqbit-theme") ?? document.body}
      modalContentClass="dexqbit-theme"
      bodyStyle={{ paddingBottom: 24 }}
    >
      <Form
        layout="vertical"
        className="semi-form-vertical"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="semi-form-field" style={{ marginBottom: 16 }}>
          <label className="semi-form-field-label">Current Password</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(v) => setCurrentPassword(String(v ?? ""))}
            placeholder="Current password"
            disabled={loading || success}
            className="mt-1"
          />
        </div>
        <div className="semi-form-field" style={{ marginBottom: 16 }}>
          <label className="semi-form-field-label">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(v) => setNewPassword(String(v ?? ""))}
            placeholder="New password"
            disabled={loading || success}
            className="mt-1"
          />
        </div>
        <div className="semi-form-field" style={{ marginBottom: 16 }}>
          <label className="semi-form-field-label">Confirm New Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(v) => setConfirmPassword(String(v ?? ""))}
            placeholder="Confirm new password"
            disabled={loading || success}
            className="mt-1"
          />
        </div>

        {success && (
          <p
            className="mt-2 mb-2 text-sm text-[var(--semi-color-success)]"
            role="status"
          >
            Password changed successfully
          </p>
        )}
        {error && (
          <p
            className="mt-2 mb-2 text-sm text-[var(--semi-color-danger)]"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button theme="borderless" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            theme="solid"
            loading={loading}
            disabled={success}
            onClick={handleSubmit}
          >
            Change Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
