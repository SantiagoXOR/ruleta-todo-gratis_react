import React, { useState, useEffect } from "react";
import { PaintRoller, Clock, MapPin, Phone, Percent, CreditCard, Sparkles, MessageCircle } from "lucide-react";

// Brand helpers - Usando colores exactos de Pintemas
const brand = {
  purple: "#811468",
  yellow: "#ffe200",
  dark: "#1C1C1C",
  light: "#F5F5F5",
};

// Estilos inline para asegurar compatibilidad con Vercel
const styles = {
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 40,
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(255, 226, 0, 0.95)',
    borderBottom: '1px solid rgba(129, 20, 104, 0.2)',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  container: {
    maxWidth: '72rem',
    margin: '0 auto',
    padding: '0 1rem',
  },
  logo: {
    height: '2rem',
    width: 'auto',
  },
  heroSection: {
    background: `linear-gradient(135deg, ${brand.yellow} 0%, #fff433 100%)`,
    padding: '3rem 1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: brand.purple,
    textAlign: 'center' as const,
    marginBottom: '1rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '9999px',
    padding: '0.5rem 1rem',
    backgroundColor: brand.purple,
    color: brand.yellow,
    fontSize: '0.875rem',
    fontWeight: 600,
    margin: '0.25rem',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: brand.purple,
    color: brand.yellow,
    fontSize: '1rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
  },
};


// Aceptar cualquier componente de ícono (compatibilidad con lucide-react)
type IconType = React.ComponentType<any>;

const Badge: React.FC<{ icon?: IconType; children: React.ReactNode; color?: "purple" | "yellow" }> = ({ icon: Icon, children, color = "purple" }) => (
  <span
    style={{
      ...styles.badge,
      backgroundColor: color === "purple" ? brand.purple : brand.yellow,
      color: color === "purple" ? brand.yellow : brand.purple,
    }}
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

// Componente Bento Grid para Hero Mobile
const BentoHeroGrid: React.FC = () => (
  <div className="bento-grid">
    {/* Grid container con CSS Grid */}
    <div
      className="grid gap-3 h-auto min-h-[600px]"
      style={{
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'auto',
        gridTemplateAreas: `
          "title title title"
          "image image badges"
          "image image whatsapp"
          "location location location"
          "description description description"
        `
      }}
    >
      {/* Título principal */}
      <div
        className="rounded-2xl bg-gradient-to-br from-pintemas-yellow to-pintemas-yellow-light p-4 flex items-center justify-center text-center"
        style={{ gridArea: 'title' }}
      >
        <h1 className="text-xl font-extrabold text-pintemas-purple leading-tight">
          ¡Animate a renovar tu hogar!
        </h1>
      </div>

      {/* Imagen principal */}
      <div
        className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative"
        style={{ gridArea: 'image' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-pintemas-purple/10 rounded-full flex items-center justify-center">
            <PaintRoller size={32} className="text-pintemas-purple" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <p className="text-xs font-medium text-pintemas-purple">Asesoramiento personalizado</p>
          </div>
        </div>
      </div>

      {/* Badges de promociones */}
      <div
        className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-3 flex flex-col gap-2 justify-center"
        style={{ gridArea: 'badges' }}
      >
        <div className="text-center">
          <Badge icon={CreditCard}>12 cuotas</Badge>
        </div>
        <div className="text-center">
          <Badge icon={Percent} color="yellow">Promos</Badge>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <div
        className="rounded-2xl bg-pintemas-purple p-3 flex items-center justify-center"
        style={{ gridArea: 'whatsapp' }}
      >
        <a
          href="https://wa.me/5493547637630"
          target="_blank"
          className="flex flex-col items-center gap-1 text-pintemas-yellow text-center w-full"
        >
          <MessageCircle size={20} />
          <span className="text-xs font-semibold">WhatsApp</span>
        </a>
      </div>

      {/* Ubicación */}
      <div
        className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-3 flex items-center justify-center"
        style={{ gridArea: 'location' }}
      >
        <a
          href="https://maps.google.com/?q=España 375, Alta Gracia"
          target="_blank"
          className="flex items-center gap-2 text-pintemas-purple w-full justify-center"
        >
          <MapPin size={16} />
          <span className="text-sm font-semibold">España 375 – Alta Gracia</span>
        </a>
      </div>

      {/* Descripción */}
      <div
        className="rounded-2xl bg-gradient-to-br from-purple-50 to-yellow-50/50 p-4 flex items-center justify-center text-center"
        style={{ gridArea: 'description' }}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          Colores cálidos que abrigan, inspiran y transforman. Asesoramiento real, productos técnicos y cuotas sin interés.
        </p>
      </div>
    </div>
  </div>
);

// Componente Bento Grid para Soluciones Mobile
const BentoSolutionsGrid: React.FC = () => (
  <div
    className="grid gap-3 h-auto"
    style={{
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto',
      gridTemplateAreas: `
        "micro micro base base"
        "micro micro enduido antihumedad"
        "feature feature antihumedad antihumedad"
      `
    }}
  >
    {/* Microcemento - Destacado */}
    <div
      className="rounded-2xl bg-gradient-to-br from-pintemas-purple to-pintemas-purple-dark text-white p-4 flex flex-col justify-between min-h-[140px]"
      style={{ gridArea: 'micro' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-pintemas-yellow text-pintemas-purple">
          <PaintRoller size={16} />
        </div>
        <h3 className="text-sm font-bold">Microcemento</h3>
      </div>
      <p className="text-xs text-white/90 leading-relaxed">
        Acabado continuo y durable. Ideal para renovar sin obra pesada.
      </p>
      <div className="mt-2">
        <span className="inline-flex items-center gap-1 text-xs bg-pintemas-yellow text-pintemas-purple px-2 py-1 rounded-full font-semibold">
          <Sparkles size={10} />
          Destacado
        </span>
      </div>
    </div>

    {/* Base niveladora */}
    <div
      className="rounded-2xl bg-white ring-1 ring-black/5 p-3 flex flex-col justify-between min-h-[100px]"
      style={{ gridArea: 'base' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-pintemas-yellow text-pintemas-purple">
          <PaintRoller size={14} />
        </div>
        <h3 className="text-xs font-semibold text-pintemas-purple">Base niveladora</h3>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        Prepara y empareja superficies para un pintado profesional.
      </p>
    </div>

    {/* Enduidos & masillas */}
    <div
      className="rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 ring-1 ring-yellow-200/50 p-3 flex flex-col justify-between min-h-[100px]"
      style={{ gridArea: 'enduido' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-pintemas-purple text-pintemas-yellow">
          <PaintRoller size={14} />
        </div>
        <h3 className="text-xs font-semibold text-pintemas-purple">Enduidos</h3>
      </div>
      <p className="text-xs text-gray-700 leading-relaxed">
        Repará grietas y roturas con terminación lisa.
      </p>
    </div>

    {/* Antihumedad */}
    <div
      className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-blue-200/50 p-3 flex flex-col justify-between"
      style={{ gridArea: 'antihumedad' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-blue-500 text-white">
          <PaintRoller size={14} />
        </div>
        <h3 className="text-xs font-semibold text-blue-700">Antihumedad</h3>
      </div>
      <p className="text-xs text-blue-600 leading-relaxed">
        Protección e impermeabilización para paredes y techos.
      </p>
    </div>

    {/* Feature adicional */}
    <div
      className="rounded-2xl bg-gradient-to-r from-pintemas-yellow to-pintemas-yellow-light p-3 flex items-center justify-center text-center"
      style={{ gridArea: 'feature' }}
    >
      <div>
        <div className="flex justify-center mb-1">
          <Clock size={16} className="text-pintemas-purple" />
        </div>
        <p className="text-xs font-semibold text-pintemas-purple">
          Asesoramiento personalizado
        </p>
      </div>
    </div>
  </div>
);

// Componente Bento Grid para Contacto y Horarios Mobile
const BentoContactGrid: React.FC = () => (
  <div
    className="grid gap-3 h-auto"
    style={{
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto',
      gridTemplateAreas: `
        "horarios horarios mapa mapa"
        "lunes viernes mapa mapa"
        "sabado feriado mapa mapa"
        "badges badges direccion direccion"
      `
    }}
  >
    {/* Título Horarios */}
    <div
      className="rounded-2xl bg-gradient-to-br from-pintemas-purple to-pintemas-purple-dark text-white p-3 flex items-center justify-center"
      style={{ gridArea: 'horarios' }}
    >
      <div className="text-center">
        <Clock size={20} className="mx-auto mb-1" />
        <h4 className="text-sm font-bold">Estamos abiertos</h4>
      </div>
    </div>

    {/* Lunes a Viernes */}
    <div
      className="rounded-2xl bg-white ring-1 ring-black/5 p-3 flex flex-col justify-center"
      style={{ gridArea: 'lunes' }}
    >
      <div className="text-center">
        <p className="text-xs font-semibold text-pintemas-purple mb-1">Lun-Vie</p>
        <p className="text-xs text-gray-600">7:30 a 21:00</p>
      </div>
    </div>

    {/* Viernes (destacado) */}
    <div
      className="rounded-2xl bg-gradient-to-br from-pintemas-yellow to-pintemas-yellow-light p-3 flex flex-col justify-center"
      style={{ gridArea: 'viernes' }}
    >
      <div className="text-center">
        <p className="text-xs font-semibold text-pintemas-purple mb-1">Sin siesta</p>
        <p className="text-xs text-pintemas-purple">Corrido</p>
      </div>
    </div>

    {/* Sábados */}
    <div
      className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-blue-200/50 p-3 flex flex-col justify-center"
      style={{ gridArea: 'sabado' }}
    >
      <div className="text-center">
        <p className="text-xs font-semibold text-blue-700 mb-1">Sábados</p>
        <p className="text-xs text-blue-600">8:30-13:30</p>
        <p className="text-xs text-blue-600">17:00-21:00</p>
      </div>
    </div>

    {/* Feriados */}
    <div
      className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 ring-1 ring-green-200/50 p-3 flex flex-col justify-center"
      style={{ gridArea: 'feriado' }}
    >
      <div className="text-center">
        <p className="text-xs font-semibold text-green-700 mb-1">Feriados</p>
        <p className="text-xs text-green-600">8:00-13:30</p>
        <p className="text-xs text-green-600">17:00-20:00</p>
      </div>
    </div>

    {/* Mapa */}
    <div
      className="rounded-2xl overflow-hidden ring-1 ring-black/10 bg-neutral-200"
      style={{ gridArea: 'mapa' }}
    >
      <div className="h-32 w-full">
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
    </div>

    {/* Badges */}
    <div
      className="rounded-2xl bg-gradient-to-r from-purple-50 to-yellow-50 p-3 flex items-center justify-center gap-2"
      style={{ gridArea: 'badges' }}
    >
      <Badge icon={Clock}>Horario corrido</Badge>
    </div>

    {/* Dirección */}
    <div
      className="rounded-2xl bg-pintemas-purple text-pintemas-yellow p-3 flex items-center justify-center"
      style={{ gridArea: 'direccion' }}
    >
      <a
        href="https://maps.google.com/?q=España 375, Alta Gracia"
        target="_blank"
        className="flex items-center gap-2 text-center w-full justify-center"
        rel="noopener noreferrer"
      >
        <MapPin size={14} />
        <span className="text-xs font-semibold">España 375 – Alta Gracia</span>
      </a>
    </div>
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

      {/* HERO - BENTO GRID LAYOUT */}
      <section className="relative bg-gradient-to-br from-white via-purple-50/30 to-yellow-50/30">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-12 md:py-16 lg:py-20">
          {/* Desktop: Traditional layout, Mobile: Bento Grid */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-y-6 lg:gap-12 items-center">
            {/* Content - Desktop layout */}
            <div className="text-center lg:text-left space-y-4 lg:space-y-6">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-pintemas-purple">
                ¡Animate a renovar tu hogar!
              </h1>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <Badge icon={CreditCard}>12 cuotas sin interés</Badge>
                <Badge icon={CreditCard} color="yellow">6 cuotas sin interés</Badge>
                <Badge icon={Percent}>Promos todo el año</Badge>
              </div>

              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Colores cálidos que abrigan, inspiran y transforman. Asesoramiento real, productos técnicos
                y cuotas sin interés.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
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

            {/* Hero Images Carousel - Desktop */}
            <div>
              <HeroImageCarousel />
            </div>
          </div>

          {/* Mobile: Bento Grid Layout */}
          <div className="lg:hidden">
            <BentoHeroGrid />
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

          {/* Desktop: Grid layout */}
          <div className="hidden lg:block lg:px-4">
            <div className="lg:grid lg:grid-cols-4 gap-6">
              <Card icon={PaintRoller} title="Microcemento" desc="Acabado continuo y durable. Ideal para renovar sin obra pesada." />
              <Card icon={PaintRoller} title="Base niveladora" desc="Prepara y empareja superficies para un pintado profesional." />
              <Card icon={PaintRoller} title="Enduidos & masillas" desc="Repará grietas y roturas con terminación lisa y pareja." />
              <Card icon={PaintRoller} title="Antihumedad" desc="Protección e impermeabilización para paredes y techos." />
            </div>
          </div>

          {/* Mobile: Bento Grid layout */}
          <div className="lg:hidden px-4">
            <BentoSolutionsGrid />
          </div>
        </div>
      </section>

      {/* MARCAS ARGENTINAS */}
      <section className="py-6 sm:py-12 lg:py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-pintemas-purple text-center mb-6 sm:mb-8 lg:mb-12">
            Trabajamos con las mejores marcas argentinas
          </h3>
          <BrandsCarousel />
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
          {/* Desktop: Layout tradicional */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-y-6 lg:gap-8 items-start">
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

          {/* Mobile: Bento Grid layout */}
          <div className="lg:hidden">
            <BentoContactGrid />
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

// Componente de carrusel de imágenes hero
const HeroImageCarousel: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    {
      src: "/assets/images/hero1.jpg",
      alt: "Interior de Pintemas - Productos de pintura",
      caption: "Amplia variedad de productos"
    },
    {
      src: "/assets/images/hero2.jpg",
      alt: "Tienda Pintemas - Asesoramiento profesional",
      caption: "Asesoramiento personalizado"
    }
  ];

  // Auto-scroll del carrusel de imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Cambia cada 4 segundos

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="group relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden ring-1 ring-black/10 shadow-lg">
      {/* Carrusel de imágenes */}
      <div className="relative aspect-[5/3] sm:aspect-[4/3] w-full overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
            {/* Overlay con gradiente para mejor legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Caption */}
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm sm:text-base font-medium drop-shadow-lg">
                {image.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-white w-6'
                : 'bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Ver imagen ${index + 1}`}
          />
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={() => setCurrentImageIndex(currentImageIndex === 0 ? heroImages.length - 1 : currentImageIndex - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-pintemas-purple p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Imagen anterior"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => setCurrentImageIndex(currentImageIndex === heroImages.length - 1 ? 0 : currentImageIndex + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-pintemas-purple p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label="Imagen siguiente"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// Componente de carrusel de marcas argentinas
const BrandsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Marcas argentinas de pinturerías con logos estilizados
  const brands = [
    {
      name: "Alba",
      logoText: "ALBA",
      colors: { bg: "#1e40af", text: "#ffffff" },
      description: "Pinturas de calidad premium"
    },
    {
      name: "Sherwin Williams",
      logoText: "SW",
      colors: { bg: "#dc2626", text: "#ffffff" },
      description: "Líder mundial en pinturas"
    },
    {
      name: "Sinteplast",
      logoText: "SINTEPLAST",
      colors: { bg: "#059669", text: "#ffffff" },
      description: "Innovación en revestimientos"
    },
    {
      name: "Colorín",
      logoText: "Colorín",
      colors: { bg: "#7c3aed", text: "#fbbf24" },
      description: "Colores que inspiran"
    },
    {
      name: "Tersuave",
      logoText: "TERSUAVE",
      colors: { bg: "#0891b2", text: "#ffffff" },
      description: "Suavidad y durabilidad"
    },
    {
      name: "Pato",
      logoText: "PATO",
      colors: { bg: "#ea580c", text: "#ffffff" },
      description: "Tradición argentina"
    },
    {
      name: "Prestigio",
      logoText: "PRESTIGIO",
      colors: { bg: "#7c2d12", text: "#fbbf24" },
      description: "Calidad superior"
    },
    {
      name: "Latex",
      logoText: "LATEX",
      colors: { bg: "#1f2937", text: "#10b981" },
      description: "Especialistas en látex"
    },
    {
      name: "Cetol",
      logoText: "CETOL",
      colors: { bg: "#92400e", text: "#fbbf24" },
      description: "Protección para maderas"
    },
    {
      name: "Rust-Oleum",
      logoText: "RUST-OLEUM",
      colors: { bg: "#374151", text: "#f97316" },
      description: "Protección anticorrosiva"
    },
    {
      name: "Baucolor",
      logoText: "BAUCOLOR",
      colors: { bg: "#0f766e", text: "#ffffff" },
      description: "Para la construcción"
    },
    {
      name: "Duralex",
      logoText: "DURALEX",
      colors: { bg: "#be123c", text: "#ffffff" },
      description: "Resistencia garantizada"
    }
  ];

  // Auto-scroll del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === brands.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, [brands.length]);

  // Mostrar 4 marcas en desktop, 2 en tablet, 1 en mobile
  const getVisibleBrands = () => {
    const visibleCount = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1;
    const visible = [];

    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % brands.length;
      visible.push(brands[index]);
    }

    return visible;
  };

  const [visibleBrands, setVisibleBrands] = useState(getVisibleBrands());

  useEffect(() => {
    const handleResize = () => {
      setVisibleBrands(getVisibleBrands());
    };

    setVisibleBrands(getVisibleBrands());
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  return (
    <div className="relative overflow-hidden">
      {/* Carrusel */}
      <div className="flex transition-transform duration-500 ease-in-out">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {visibleBrands.map((brand, index) => (
            <div
              key={`${brand.name}-${currentIndex}-${index}`}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-pintemas-purple/20 group"
            >
              <div className="text-center">
                {/* Logo estilizado */}
                <div
                  className="mx-auto mb-4 rounded-lg p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center h-16 sm:h-20"
                  style={{
                    backgroundColor: brand.colors.bg,
                    color: brand.colors.text
                  }}
                >
                  <span className="font-bold text-xs sm:text-sm lg:text-base tracking-wide">
                    {brand.logoText}
                  </span>
                </div>

                {/* Nombre de la marca */}
                <h4 className="font-bold text-pintemas-purple text-base sm:text-lg mb-2">
                  {brand.name}
                </h4>

                {/* Descripción */}
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {brand.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores */}
      <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
        {brands.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-pintemas-purple w-6'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir a marca ${index + 1}`}
          />
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={() => setCurrentIndex(currentIndex === 0 ? brands.length - 1 : currentIndex - 1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 text-pintemas-purple p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
        aria-label="Marca anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => setCurrentIndex(currentIndex === brands.length - 1 ? 0 : currentIndex + 1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 text-pintemas-purple p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
        aria-label="Marca siguiente"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

