import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function NavBar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/todos", label: "Todos" },
  ];

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center gap-6">
          <div className="font-semibold">Calendar Todo</div>
          
          <div className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  location === link.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
