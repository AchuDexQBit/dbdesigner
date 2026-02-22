import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@douyinfe/semi-ui";
import { api } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dexqbit-theme min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="DexQBit"
            className="mx-auto mb-4 h-14 w-auto object-contain"
          />
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--dexqbit-text)" }}
          >
            DexQBit DB Designer
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--dexqbit-text-muted)" }}
          >
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="semi-form-vertical">
            <div className="semi-form-field">
              <label className="semi-form-field-label" htmlFor="login-email">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                disabled={loading}
                className="w-full"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            <div className="semi-form-field mt-4">
              <label className="semi-form-field-label" htmlFor="login-password">
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                disabled={loading}
                className="w-full"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            {error && (
              <div
                id="login-error"
                className="mt-4 py-2 px-3 rounded-lg text-sm text-red-300 bg-red-500/20 border border-red-400/40"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button
              theme="solid"
              block
              loading={loading}
              disabled={loading}
              htmlType="submit"
              className="mt-6"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
