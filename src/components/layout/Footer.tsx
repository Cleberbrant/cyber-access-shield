
export function Footer() {
  return (
    <footer className="border-t py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CyberAccessShield. Todos os direitos reservados.
        </p>
        <p className="text-xs text-muted-foreground">
          Plataforma de avaliação segura para ambientes EAD
        </p>
      </div>
    </footer>
  );
}
