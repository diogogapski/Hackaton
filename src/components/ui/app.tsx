// Primitivas visuais das áreas logadas/testes, no estilo HACKIF (fundo escuro, neon, mono).
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function PageHeader({ tag, title, description, actions }: { tag: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-foreground/10 pb-6">
      <div>
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent">{`// ${tag}`}</p>
        <h1 className="mt-2 font-display text-[2rem] font-semibold uppercase leading-none tracking-[-0.02em] md:text-[2.4rem]">
          {title}
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-[0.95rem] text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cx("border border-foreground/10 bg-foreground/[0.02] p-5 md:p-6", className)}>
      {title || actions ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title ? (
            <h2 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.06em] text-foreground">{title}</h2>
          ) : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap px-5 font-sans text-[0.8rem] font-bold uppercase tracking-[0.03em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-accent !text-[#050706] hover:bg-foreground",
        variant === "ghost" && "border border-foreground/20 bg-transparent text-foreground hover:border-accent hover:text-accent",
        variant === "danger" && "border border-if-red/60 bg-transparent text-if-red hover:bg-if-red hover:text-foreground",
        className,
      )}
    />
  );
}

const campoBase =
  "w-full border border-foreground/15 bg-background px-3 py-2.5 text-[0.92rem] text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-accent";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-foreground/60">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[0.75rem] text-muted">{hint}</span> : null}
    </label>
  );
}

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={cx(campoBase, props.className)} />;

export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea rows={4} {...props} className={cx(campoBase, "resize-y", props.className)} />
);

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={cx(campoBase, props.className)} />;

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-foreground/85">
      <input type="checkbox" {...props} className="h-4 w-4 accent-[#b6ff00]" />
      {label}
    </label>
  );
}

const tons = {
  neutro: "border-foreground/20 text-foreground/70",
  ok: "border-accent/50 text-accent",
  alerta: "border-yellow-400/50 text-yellow-300",
  erro: "border-if-red/60 text-if-red",
} as const;

export function Badge({ children, tone = "neutro" }: { children: ReactNode; tone?: keyof typeof tons }) {
  return (
    <span className={cx("inline-flex items-center border px-2 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.06em]", tons[tone])}>
      {children}
    </span>
  );
}

export function Alert({ tone = "erro", title, lines }: { tone?: "erro" | "ok"; title: string; lines?: string[] }) {
  return (
    <div className={cx("border-l-2 px-4 py-3 text-[0.9rem]", tone === "erro" ? "border-if-red bg-if-red/10" : "border-accent bg-accent/10")}>
      <p className="font-semibold">{title}</p>
      {lines?.length ? (
        <ul className="mt-1 list-disc pl-5 text-[0.85rem] text-foreground/80">
          {lines.map((l) => <li key={l}>{l}</li>)}
        </ul>
      ) : null}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-foreground/15 px-4 py-8 text-center font-mono text-[0.8rem] uppercase tracking-[0.06em] text-muted">{children}</p>;
}

export function Loading() {
  return <p className="font-mono text-[0.8rem] uppercase tracking-[0.08em] text-accent/80">carregando…</p>;
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="border border-foreground/10 p-4">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className="mt-2 font-display text-[2rem] font-semibold leading-none text-foreground">{value}</p>
      {sub ? <div className="mt-2 text-[0.78rem] text-muted">{sub}</div> : null}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.88rem]">
        <thead>
          <tr className="border-b border-foreground/15">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-foreground/50">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-foreground/8 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top">{children}</tbody>
      </table>
    </div>
  );
}

export const formatarData = (valor?: string | null) =>
  valor ? new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

/** ISO -> valor de <input type="datetime-local"> no fuso local. */
export function paraInputData(valor?: string | null) {
  if (!valor) return "";
  const d = new Date(valor);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export const deInputData = (valor: string) => (valor ? new Date(valor).toISOString() : null);
