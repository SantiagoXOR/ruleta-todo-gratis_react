# Ruleta Todo Gratis 

Una ruleta interactiva desarrollada con React y TypeScript que ofrece una experiencia de juego emocionante y premios.

## Características

- Ruleta interactiva con animación suave
- Sistema de premios con caducidad
- Gestión de premios ganados y reclamados
- Efectos visuales de celebración
- Diseño responsive y moderno
- Sistema de caché para optimizar rendimiento
- Manejo robusto de errores
- Integración con backend REST API
- Pruebas automatizadas completas

## Tecnologías Utilizadas

- React 18.2.0
- TypeScript
- Vite
- Axios para llamadas API
- Styled Components
- Canvas Confetti
- React Icons
- Vitest + Testing Library
- LocalStorage para caché

## Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn
- Servidor backend corriendo en `http://localhost:3000` (o configurar `VITE_API_URL`)

## Instalación

1. Clonar el repositorio
```bash
git clone [URL-del-repositorio]
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
# Crear archivo .env
VITE_API_URL=http://localhost:3000/api
```

4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── api/              # Llamadas a la API
├── components/       # Componentes React
│   ├── __tests__/   # Tests de componentes
│   └── ...
├── services/        # Lógica de negocio
├── styles/          # Estilos CSS
├── types/           # Definiciones de TypeScript
└── utils/           # Utilidades y helpers
```

## Testing

El proyecto incluye tests unitarios y de integración:

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura de tests
npm run test:coverage
```

## Componentes Principales

### PrizesList
- Muestra los premios disponibles y reclamados
- Maneja la reclamación de premios
- Muestra tiempo restante para reclamar
- Actualización automática cada minuto
- Estados de carga y error

### Wheel
- Animación suave de giro
- Selección aleatoria de premios
- Efectos de celebración
- Integración con sistema de premios

## Servicios

### Prize Service
- Gestión de premios ganados
- Sistema de caché para optimizar rendimiento
- Verificación de validez de premios
- Manejo de reclamaciones

### API Integration
- Endpoints RESTful
- Manejo robusto de errores
- Tipos de respuesta tipados
- Reintentos automáticos

## Seguridad

- Validación de datos en cliente y servidor
- Protección contra reclamaciones duplicadas
- Manejo seguro de tokens y sesiones
- Sanitización de datos de entrada

## Próximas Mejoras

- [ ] Sistema de estadísticas
- [ ] Animaciones mejoradas
- [ ] Sistema de notificaciones
- [ ] Modo offline
- [ ] PWA support

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles
