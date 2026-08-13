import { Facebook, Instagram, Linkedin } from "lucide-react";

/* Ícono personalizado para TikTok */
const TikTokIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.29-2.61.64-5.27 2.5-7.01 1.48-1.37 3.48-2.12 5.51-2.08.15 0 .3.01.45.02v4.11c-.34-.05-.68-.07-1.02-.05-.98.02-1.94.39-2.67 1.05-.85.74-1.34 1.83-1.31 2.97.02 1.17.55 2.28 1.45 2.96.91.69 2.1 1.01 3.23.87 1.12-.13 2.13-.78 2.69-1.74.45-.77.67-1.67.65-2.57V.02z" />
  </svg>
);

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61592660801838&locale=es_LA",
    icon: Facebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/voltguard.pe/",
    icon: Instagram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/voltguard-peru/about/",
    icon: Linkedin,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@voltguard.pe?lang=es",
    icon: TikTokIcon,
  },
];

const FooterComponent = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row lg:px-8">
        
        {/* DERECHOS RESERVADOS */}
        <p className="order-2 md:order-1">
          © {new Date().getFullYear()} Voltguard · Todos los derechos reservados.
        </p>

        {/* REDES SOCIALES (fb, X, ig, yt, in, tk) */}
        <div className="order-1 flex items-center gap-1.5 md:order-2">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.name}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-[#0797d5]"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>

        {/* BRAND / LOGO */}
        <div className="order-3 flex items-center gap-2">
          <img
            src="/voltguard.png"
            alt="Voltguard"
            className="size-7 object-contain"
          />
          <span className="font-semibold text-slate-700">Voltguard</span>
        </div>

      </div>
    </footer>
  );
};

export default FooterComponent;