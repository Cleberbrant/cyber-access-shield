import { cn } from "@/lib/utils";

interface LogoProps {
  /** Tamanho do símbolo em px */
  size?: number;
  /** "mark" = só o símbolo; "full" = símbolo + wordmark */
  variant?: "mark" | "full";
  className?: string;
}

/**
 * Logo CyberAccessShield — escudo facetado com traço de circuito/check
 * em gradiente ciano → violeta. Única fonte da marca no app.
 */
export function LogoMark({ size = 28, className }: Omit<LogoProps, "variant">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cas-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="55%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Escudo facetado (hexágono alongado com ponta inferior) */}
      <path
        d="M16 2.5 L27 7 V15.5 C27 22.5 22.5 27.5 16 29.5 C9.5 27.5 5 22.5 5 15.5 V7 Z"
        stroke="url(#cas-grad)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Traço circuito + check */}
      <path
        d="M10.5 16.5 L14 20 L21.5 11.5"
        stroke="url(#cas-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Nó de circuito */}
      <circle cx="21.5" cy="11.5" r="1.6" fill="url(#cas-grad)" />
    </svg>
  );
}

export function Logo({ size = 28, variant = "full", className }: LogoProps) {
  if (variant === "mark") {
    return <LogoMark size={size} className={className} />;
  }
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className="font-display font-semibold tracking-tight leading-none">
        <span className="text-foreground">CyberAccess</span>
        <span className="cyber-text-gradient">Shield</span>
      </span>
    </span>
  );
}
