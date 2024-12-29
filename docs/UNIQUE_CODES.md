# Sistema de Códigos Únicos - Documentación

## Descripción General
El sistema de códigos únicos permite generar, validar y gestionar códigos asociados a premios en la aplicación Ruleta. Cada código es único y está vinculado a un premio específico, con un período de validez determinado.

## Arquitectura

### Modelos
- `UniqueCode`: Representa un código único en la base de datos
  - `code`: String único que identifica el código
  - `prizeId`: ID del premio asociado
  - `createdAt`: Fecha de creación
  - `expiresAt`: Fecha de expiración
  - `isUsed`: Estado de uso
  - `usedAt`: Fecha de uso
  - `usedBy`: Usuario que usó el código

### Servicios

#### uniqueCodeService
- `generateCode(prizeId: number)`: Genera un nuevo código único
- `validateCode(code: string)`: Valida si un código es válido
- `useCode(code: string, userId: string)`: Marca un código como usado
- `listCodes(options: ListCodesOptions)`: Lista códigos con filtros y paginación

### API Endpoints

#### POST /api/codes/generate
Genera un nuevo código único
```typescript
Request:
{
  prizeId: number;
}

Response:
{
  success: boolean;
  data?: {
    code: string;
    expiresAt: string;
  };
  error?: string;
}
```

#### GET /api/codes/:code/validate
Valida un código existente
```typescript
Response:
{
  success: boolean;
  data?: {
    isValid: boolean;
    prizeId?: number;
  };
  error?: string;
}
```

#### POST /api/codes/:code/use
Marca un código como usado
```typescript
Request:
{
  userId: string;
}

Response:
{
  success: boolean;
  data?: {
    code: string;
    prizeId: number;
    usedAt: string;
  };
  error?: string;
}
```

#### GET /api/codes
Lista códigos con filtros
```typescript
Query Parameters:
- page: number
- prizeId?: number
- isUsed?: boolean

Response:
{
  success: boolean;
  data?: {
    codes: UniqueCode[];
    totalPages: number;
  };
  error?: string;
}
```

## Componentes de UI

### CodeDetails
Muestra los detalles de un código individual
- Estado del código (válido/usado/expirado)
- Tiempo restante hasta expiración
- Información de uso
- Botón para usar el código

### CodesList
Lista y gestiona múltiples códigos
- Paginación
- Filtros por premio
- Filtros por estado
- Vista en grid
- Estados de carga y error

## Integración con Premios

### PrizesList
- Botón "Ver Códigos" en cada premio
- Modal para mostrar códigos asociados
- Filtrado automático de códigos válidos
- Actualización automática al usar códigos

## Seguridad
- Autenticación JWT requerida para endpoints sensibles
- Rate limiting para prevenir abuso
- Validación de datos en backend
- Sanitización de inputs
- Manejo seguro de errores

## Mejores Prácticas
1. **Generación de Códigos**
   - Usar caracteres fáciles de leer
   - Evitar caracteres ambiguos (0/O, 1/l)
   - Longitud mínima de 8 caracteres
   - Incluir checksum para validación

2. **Validación**
   - Verificar estado antes de uso
   - Validar fechas de expiración
   - Comprobar asociación con premio
   - Validar permisos de usuario

3. **UI/UX**
   - Feedback inmediato al usuario
   - Mensajes de error claros
   - Confirmaciones de acciones importantes
   - Diseño responsive
   - Accesibilidad

## Mantenimiento
1. **Monitoreo**
   - Tasa de uso de códigos
   - Errores de validación
   - Intentos de uso inválidos
   - Rendimiento del sistema

2. **Limpieza**
   - Eliminar códigos expirados
   - Archivar códigos usados
   - Mantener logs relevantes

## Pruebas
- Tests unitarios para servicios
- Tests de integración para API
- Tests de componentes UI
- Tests end-to-end
- Tests de seguridad

## Rendimiento
- Índices en base de datos
- Caché de validaciones
- Paginación eficiente
- Lazy loading de componentes
- Optimización de consultas

## Futuras Mejoras
1. Exportación de códigos a CSV/Excel
2. Estadísticas y análisis de uso
3. Sistema de notificaciones
4. Personalización de códigos
5. Integración con sistema de recompensas
