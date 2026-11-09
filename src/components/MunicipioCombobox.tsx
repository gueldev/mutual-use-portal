import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { PE_MUNICIPIOS } from "@/lib/pe-municipios";
import { cn } from "@/lib/utils";

export default function MunicipioCombobox({
  value,
  onChange,
  onBlur,
  className,
  label = "Município",
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const term = (open ? query : value).trim().toLowerCase();
  const options = useMemo(
    () => (term ? PE_MUNICIPIOS.filter((m) => m.toLowerCase().includes(term)) : PE_MUNICIPIOS),
    [term],
  );

  return (
    <div ref={boxRef} className="relative">
      <input
        value={open ? query : value}
        onFocus={() => {
          setQuery(value);
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          if (!open) onBlur();
        }}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        placeholder="Ex.: Recife"
        className={className}
        autoComplete="off"
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      {open && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-panel">
          {options.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              Nenhum município encontrado.
            </li>
          ) : (
            options.map((m) => (
              <li key={m}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(m);
                    setOpen(false);
                    onBlur();
                  }}
                  className={cn(
                    "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                    m === value && "bg-secondary font-medium",
                  )}
                >
                  {m}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
