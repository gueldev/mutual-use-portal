import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchable = true,
  invalid = false,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-left text-sm transition-colors focus:border-brand focus:outline-none",
          invalid && "border-destructive/60",
        )}
      >
        <span className="flex min-h-6 flex-1 flex-wrap items-center gap-1.5">
          {value.length === 0 ? (
            <span className="text-muted-foreground/70">{placeholder}</span>
          ) : (
            value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[0.68rem] font-semibold text-secondary-foreground"
              >
                {v}
                <X
                  className="size-3 cursor-pointer opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                />
              </span>
            ))
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-panel">
          {searchable && options.length > 6 && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="size-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-muted-foreground">Nenhuma opção.</li>
            )}
            {filtered.map((o) => {
              const active = value.includes(o);
              return (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => toggle(o)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-secondary/60",
                      active && "text-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border border-input",
                        active && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {active && <Check className="size-3" />}
                    </span>
                    {o}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
