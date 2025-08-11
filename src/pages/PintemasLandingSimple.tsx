import React from "react";
import { MessageCircle, MapPin, Clock, PaintRoller } from "lucide-react";

// Colores de marca Pintemas
const colors = {
  purple: "#811468",
  yellow: "#ffe200",
};

// Estilos inline para compatibilidad total
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    backgroundColor: colors.yellow,
    borderBottom: `1px solid ${colors.purple}`,
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    height: '40px',
    width: 'auto',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: colors.purple,
    color: colors.yellow,
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  hero: {
    background: `linear-gradient(135deg, ${colors.yellow} 0%, #fff433 100%)`,
    padding: '4rem 1rem',
    textAlign: 'center' as const,
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: colors.purple,
    marginBottom: '2rem',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#4a5568',
    marginBottom: '2rem',
    maxWidth: '600px',
    margin: '0 auto 2rem auto',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    alignItems: 'center',
    marginTop: '2rem',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: colors.purple,
    color: colors.yellow,
    padding: '1rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'white',
    color: colors.purple,
    padding: '1rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    border: `2px solid ${colors.purple}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  section: {
    padding: '3rem 1rem',
    backgroundColor: 'white',
  },
  sectionContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: colors.purple,
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  card: {
    backgroundColor: '#f7fafc',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center' as const,
    border: `1px solid #e2e8f0`,
  },
  cardIcon: {
    color: colors.purple,
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: colors.purple,
    marginBottom: '0.5rem',
  },
  cardDesc: {
    color: '#4a5568',
    fontSize: '0.875rem',
  },
  footer: {
    backgroundColor: '#f7fafc',
    padding: '2rem 1rem',
    borderTop: '1px solid #e2e8f0',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  floatingWhatsApp: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    backgroundColor: '#25d366',
    color: 'white',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
  },
};

export default function PintemasLandingSimple() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <img 
            src="/logo1.svg" 
            alt="Pinturerías Pintemas" 
            style={styles.logo}
          />
          <div style={styles.badge}>
            <Clock size={16} />
            Lun-Vie 8-12 y 16-20 | Sáb 8-12
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            ¡Animate a renovar tu hogar!
          </h1>
          <p style={styles.subtitle}>
            Colores cálidos que abrigan, inspiran y transforman. 
            Asesoramiento real, productos técnicos y cuotas sin interés.
          </p>
          
          <div style={styles.buttonContainer}>
            <a 
              href="https://wa.me/5493547637630" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.primaryButton}
            >
              <MessageCircle size={20} />
              Escribinos por WhatsApp
            </a>
            
            <a 
              href="https://maps.google.com/?q=España+375,+Alta+Gracia,+Córdoba" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.secondaryButton}
            >
              <MapPin size={20} />
              España 375 – Alta Gracia
            </a>
          </div>
        </div>
      </section>

      {/* Productos Section */}
      <section style={styles.section}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Nuestros Productos</h2>
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardIcon}>
                <PaintRoller size={40} />
              </div>
              <h3 style={styles.cardTitle}>Pinturas</h3>
              <p style={styles.cardDesc}>
                Látex, esmaltes, antióxidos y más. Todas las marcas y colores.
              </p>
            </div>
            <div style={styles.card}>
              <div style={styles.cardIcon}>
                <PaintRoller size={40} />
              </div>
              <h3 style={styles.cardTitle}>Herramientas</h3>
              <p style={styles.cardDesc}>
                Pinceles, rodillos, brochas y todo lo que necesitás.
              </p>
            </div>
            <div style={styles.card}>
              <div style={styles.cardIcon}>
                <PaintRoller size={40} />
              </div>
              <h3 style={styles.cardTitle}>Asesoramiento</h3>
              <p style={styles.cardDesc}>
                Te ayudamos a elegir productos y colores según tu proyecto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={{ color: '#4a5568', fontSize: '0.875rem' }}>
            © 2024 Pinturerías Pintemas — Siempre ofertas
          </p>
          <p style={{ color: '#4a5568', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            España 375, Alta Gracia | +54 9 3547 63-7630
          </p>
        </div>
      </footer>

      {/* WhatsApp Flotante */}
      <a 
        href="https://wa.me/5493547637630" 
        target="_blank" 
        rel="noopener noreferrer"
        style={styles.floatingWhatsApp}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
}
