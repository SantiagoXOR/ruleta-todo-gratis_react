import React, { useState, useEffect } from "react";
import { PaintRoller, Clock, MapPin, Phone, Percent, CreditCard, Sparkles, MessageCircle } from "lucide-react";

// Brand helpers - Usando colores exactos de Pintemas
const brand = {
  purple: "#811468",
  yellow: "#ffe200",
  dark: "#1C1C1C",
  light: "#F5F5F5",
};


// Aceptar cualquier componente de ícono (compatibilidad con lucide-react)
type IconType = React.ComponentType<any>;

const Badge: React.FC<{ icon?: IconType; children: React.ReactNode; color?: "purple" | "yellow" }> = ({ icon: Icon, children, color = "purple" }) => (
  <span
    className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm font-semibold shadow-sm whitespace-nowrap select-none transition-all ${
      color === "purple"
        ? "bg-pintemas-purple text-pintemas-yellow"
        : "bg-pintemas-yellow text-pintemas-purple"
    }`}
  >
    {Icon && <Icon size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />}
    <span className="leading-none">{children}</span>
  </span>
);

const Card: React.FC<{ title: string; desc: string; icon: IconType }> = ({ title, desc, icon: Icon }) => (
  <div className="rounded-xl sm:rounded-2xl bg-white/90 shadow-sm ring-1 ring-black/5 p-4 sm:p-5 hover:shadow-md transition-all">
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-pintemas-yellow text-pintemas-purple flex-shrink-0">
        <Icon size={18} className="sm:w-5 sm:h-5" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-pintemas-purple leading-tight">{title}</h3>
    </div>
    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

// Componente para el badge de horarios animado
const AnimatedScheduleBadge: React.FC = () => {
  const schedules = [
    "Horario de corrido",
    "Lun-Vie: 7:30 a 21:00",
    "Sáb: 8:30-13:30 y 17-21",
    "Feriados: 8-13:30 y 17-20"
  ];

  const schedulesDesktop = [
    "Horario de corrido",
    "Lunes a Viernes: 7:30 a 21:00",
    "Sábados: 8:30 a 13:30 y 17:00 a 21:00",
    "Feriados: 8:00 a 13:30 y 17:00 a 20:00"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % schedules.length);
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, [schedules.length]);

  return (
    <span
      className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 min-h-[32px] sm:min-h-[36px] md:min-h-[40px] text-xs sm:text-sm font-semibold shadow-sm select-none transition-all bg-pintemas-purple text-pintemas-yellow max-w-[200px] sm:max-w-none overflow-hidden"
    >
      <Clock size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" strokeWidth={2.5} />
      <span className="leading-none transition-all duration-500 ease-in-out truncate">
        <span className="sm:hidden">{schedules[currentIndex]}</span>
        <span className="hidden sm:inline">{schedulesDesktop[currentIndex]}</span>
      </span>
    </span>
  );
};

export default function PintemasLanding() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur bg-pintemas-yellow/95 border-b border-pintemas-purple/20 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo SVG */}
            <div className="flex-shrink-0">
              <img
                src="/logo1.svg"
                alt="Pinturerías Pintemas"
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
              />
            </div>

            {/* Badge de horarios animado - Responsive */}
            <div className="flex-shrink-0">
              <AnimatedScheduleBadge />
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-white via-purple-50/30 to-yellow-50/30">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-y-6 lg:gap-12 items-center">
            {/* Content - Mobile first, optimized hierarchy */}
            <div className="text-center lg:text-left space-y-4 lg:space-y-6">
              {/* Title - More aggressive mobile typography */}
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-pintemas-purple">
                ¡Animate a renovar tu hogar!
              </h1>

              {/* Badges first on mobile for immediate value prop */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 order-1 lg:order-2">
                <Badge icon={CreditCard}>12 cuotas sin interés</Badge>
                <Badge icon={CreditCard} color="yellow">6 cuotas sin interés</Badge>
                <Badge icon={Percent}>Promos todo el año</Badge>
              </div>

              {/* Description - Compact on mobile */}
              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 order-2 lg:order-1">
                Colores cálidos que abrigan, inspiran y transforman. Asesoramiento real, productos técnicos
                y cuotas sin interés.
              </p>

              {/* Action buttons - Accessible height */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start order-3">
                <a
                  href="https://wa.me/5493547637630"
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 sm:px-5 py-3 min-h-[44px] font-semibold shadow-md bg-pintemas-purple text-pintemas-yellow hover:bg-pintemas-purple-dark transition-colors w-full sm:w-auto"
                >
                  <Phone size={16} className="sm:w-[18px] sm:h-[18px]" /> Escribinos por WhatsApp
                </a>
                <a
                  href="https://maps.google.com/?q=España 375, Alta Gracia"
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 sm:px-5 py-3 min-h-[44px] font-semibold border border-pintemas-purple text-pintemas-purple hover:bg-pintemas-purple hover:text-white transition-colors w-full sm:w-auto"
                >
                  <MapPin size={16} className="sm:w-[18px] sm:h-[18px]" /> España 375 – Alta Gracia
                </a>
              </div>
            </div>

            {/* Image - Compact on mobile, show after content hierarchy */}
            <div className="order-last lg:order-last">
              <div className="rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden ring-1 ring-black/10 shadow-lg">
                <div className="aspect-[5/3] sm:aspect-[4/3] w-full bg-gradient-to-br from-gray-200 to-gray-100 grid grid-cols-2">
                  <div className="p-3 sm:p-4 lg:p-6 flex flex-col justify-end bg-gray-200">
                    <span className="text-gray-500 text-xs sm:text-sm font-medium">Antes</span>
                    <div className="h-16 sm:h-20 lg:h-28 rounded-lg sm:rounded-xl bg-gray-300 mt-1 sm:mt-2" />
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6 flex flex-col justify-end bg-orange-400">
                    <span className="text-white/90 text-xs sm:text-sm font-medium">Después</span>
                    <div className="h-16 sm:h-20 lg:h-28 rounded-lg sm:rounded-xl bg-white/20 mt-1 sm:mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS / SOLUCIONES */}
      <section className="py-6 sm:py-12 lg:py-16 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="px-4 mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-pintemas-purple text-center lg:text-left">
              Soluciones rápidas, resultados prolijos
            </h2>
          </div>

          {/* Mobile: Horizontal scroll with snap, Desktop: Grid */}
          <div className="lg:px-4">
            {/* Mobile horizontal scroll */}
            <div className="flex lg:hidden overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-2 scrollbar-hide">
              <div className="flex-none w-72 snap-start">
                <Card icon={PaintRoller} title="Microcemento" desc="Acabado continuo y durable. Ideal para renovar sin obra pesada." />
              </div>
              <div className="flex-none w-72 snap-start">
                <Card icon={PaintRoller} title="Base niveladora" desc="Prepara y empareja superficies para un pintado profesional." />
              </div>
              <div className="flex-none w-72 snap-start">
                <Card icon={PaintRoller} title="Enduidos & masillas" desc="Repará grietas y roturas con terminación lisa y pareja." />
              </div>
              <div className="flex-none w-72 snap-start">
                <Card icon={PaintRoller} title="Antihumedad" desc="Protección e impermeabilización para paredes y techos." />
              </div>
            </div>

            {/* Desktop grid */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
              <Card icon={PaintRoller} title="Microcemento" desc="Acabado continuo y durable. Ideal para renovar sin obra pesada." />
              <Card icon={PaintRoller} title="Base niveladora" desc="Prepara y empareja superficies para un pintado profesional." />
              <Card icon={PaintRoller} title="Enduidos & masillas" desc="Repará grietas y roturas con terminación lisa y pareja." />
              <Card icon={PaintRoller} title="Antihumedad" desc="Protección e impermeabilización para paredes y techos." />
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADOS / PROMOS */}
      <section className="py-6 sm:py-12 lg:py-16 bg-pintemas-purple text-pintemas-yellow">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-4 lg:gap-6 text-center lg:text-left">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold">Pagalo fácil</h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3">
              <Badge icon={CreditCard} color="yellow">12 cuotas sin interés</Badge>
              <Badge icon={CreditCard} color="yellow">6 cuotas sin interés</Badge>
              <Badge icon={Sparkles} color="yellow">Banco Hipotecario</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* HORARIOS & UBICACIÓN */}
      <section className="py-6 sm:py-12 lg:py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-8 items-start">
            {/* Horarios */}
            <div className="rounded-xl sm:rounded-2xl ring-1 ring-black/5 p-4 sm:p-6 bg-neutral-50">
              <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-pintemas-purple">Estamos abiertos</h4>
              <ul className="space-y-2 sm:space-y-3 text-neutral-700 text-sm sm:text-base">
                <li className="flex items-start sm:items-center gap-2">
                  <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-pintemas-purple mt-0.5 sm:mt-0 flex-shrink-0" />
                  <span>Lunes a Viernes: <b className="ml-1">7:30 a 21:00</b></span>
                </li>
                <li className="flex items-start sm:items-center gap-2">
                  <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-pintemas-purple mt-0.5 sm:mt-0 flex-shrink-0" />
                  <span>Sábados: <b className="ml-1">8:30 a 13:30 y 17:00 a 21:00</b></span>
                </li>
                <li className="flex items-start sm:items-center gap-2">
                  <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-pintemas-purple mt-0.5 sm:mt-0 flex-shrink-0" />
                  <span>Feriados: <b className="ml-1">8:00 a 13:30 y 17:00 a 20:00</b></span>
                </li>
              </ul>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-2">
                <Badge icon={Clock}>Horario de corrido</Badge>
                <Badge icon={Sparkles}>¡No dormimos la siesta!</Badge>
              </div>
            </div>

            {/* Mapa con iframe optimizado */}
            <div className="rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-black/10 bg-neutral-200">
              <div className="h-48 sm:h-64 lg:h-72 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.8234567890123!2d-64.4321!3d-31.6543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDM5JzE1LjUiUyA2NMKwMjUnNTUuNiJX!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Pintemas - España 375, Alta Gracia"
                />
              </div>
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 bg-pintemas-purple text-pintemas-yellow">
                <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                  <MapPin size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                  España 375 – Alta Gracia
                </div>
                <a
                  href="https://maps.google.com/?q=España 375, Alta Gracia"
                  target="_blank"
                  className="inline-flex items-center gap-1 underline font-semibold text-pintemas-yellow text-sm sm:text-base hover:text-pintemas-yellow/80 transition-colors min-h-[44px] px-2"
                  rel="noopener noreferrer"
                >
                  Cómo llegar
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-6 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h4 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 lg:mb-8 text-pintemas-purple text-center lg:text-left">
            Preguntas frecuentes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <Card icon={MessageCircle} title="¿Asesoran proyectos?" desc="Sí, te ayudamos a elegir productos y colores según tu necesidad y presupuesto." />
            <Card icon={CreditCard} title="¿Qué medios de pago?" desc="Tarjetas, transferencias y cuotas sin interés según banco y promo vigente." />
            <Card icon={PaintRoller} title="¿Hay retiro en tienda?" desc="Sí, comprás por WhatsApp y retirás en España 375 o coordinamos envío." />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 lg:gap-6 text-center lg:text-left">
            {/* Logo en footer */}
            <div className="flex items-center gap-4 order-1">
              <img
                src="/logo1.svg"
                alt="Pinturerías Pintemas"
                className="h-6 sm:h-8 w-auto"
              />
              <div className="text-xs sm:text-sm text-neutral-600">
                © {new Date().getFullYear()} — Siempre ofertas
              </div>
            </div>

            {/* Badges de contacto */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2 sm:gap-3 order-2">
              <Badge icon={MessageCircle}>+54 9 3547 63-7630</Badge>
              <Badge icon={MapPin} color="yellow">España 375 – Alta Gracia</Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* CTA FLOTANTE WHATSAPP - Solo mobile */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <a
          href="https://wa.me/5493547637630"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle size={24} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

