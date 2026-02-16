import React from "react";

export function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

export function Card(props: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cx("rounded-3xl bg-white/90 backdrop-blur border border-black/5 shadow-sm", props.className)}>
      {props.children}
    </div>
  );
}

export function CardHeader(props: React.PropsWithChildren<{ className?: string; title: string; subtitle?: string }>) {
  return (
    <div className={cx("px-6 pt-6", props.className)}>
      <div className="text-lg font-semibold text-black">{props.title}</div>
      {props.subtitle ? <div className="mt-1 text-sm text-black/60">{props.subtitle}</div> : null}
      {props.children}
    </div>
  );
}

export function CardBody(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cx("px-6 pb-6 pt-4", props.className)}>{props.children}</div>;
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" },
) {
  const v = props.variant || "primary";
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const cls =
    v === "primary"
      ? "bg-emerald-700 text-white hover:bg-emerald-800"
      : v === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-transparent text-black/70 hover:bg-black/5";
  return <button {...props} className={cx(base, cls, props.className)} />;
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string },
) {
  return (
    <label className="block">
      {props.label ? <div className="mb-1 text-xs font-medium text-black/70">{props.label}</div> : null}
      <input
        {...props}
        className={cx(
          "w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200",
          props.className,
        )}
      />
      {props.hint ? <div className="mt-1 text-xs text-black/50">{props.hint}</div> : null}
      {props.error ? <div className="mt-1 text-xs text-red-600">{props.error}</div> : null}
    </label>
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string },
) {
  return (
    <label className="block">
      {props.label ? <div className="mb-1 text-xs font-medium text-black/70">{props.label}</div> : null}
      <textarea
        {...props}
        className={cx(
          "w-full min-h-[140px] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200",
          props.className,
        )}
      />
      {props.hint ? <div className="mt-1 text-xs text-black/50">{props.hint}</div> : null}
      {props.error ? <div className="mt-1 text-xs text-red-600">{props.error}</div> : null}
    </label>
  );
}

export function Badge({ children, tone }: { children: React.ReactNode; tone?: "ok" | "warn" | "muted" | "danger" }) {
  const t = tone || "muted";
  const cls =
    t === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : t === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : t === "danger"
      ? "bg-red-50 text-red-700 border-red-100"
      : "bg-black/5 text-black/60 border-black/10";
  return <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs", cls)}>{children}</span>;
}

export function Divider() {
  return <div className="h-px w-full bg-black/5" />;
}

export function Modal({
  open,
  title,
  children,
  onClose,
  actions,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-lg border border-black/10">
          <div className="px-6 pt-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">{title}</div>
              <div className="mt-1 text-sm text-black/60">Confirm your action</div>
            </div>
            <button className="rounded-xl px-2 py-1 text-black/50 hover:bg-black/5" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="px-6 py-4">{children}</div>
          {actions ? <div className="px-6 pb-6 flex justify-end gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
