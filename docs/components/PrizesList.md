# PrizesList Component

## Descripción
El componente PrizesList es responsable de mostrar y gestionar los premios ganados por el usuario. Muestra una lista de premios disponibles y permite a los usuarios reclamarlos antes de que expiren.

## Características

- Muestra premios disponibles y reclamados
- Actualización automática cada minuto
- Sistema de caché para optimizar rendimiento
- Manejo de estados de carga y error
- Contador de tiempo restante para reclamar
- Animaciones y efectos visuales
- Diseño responsive

## Props

El componente no recibe props ya que utiliza servicios internos para gestionar su estado.

## Estados

```typescript
const [prizes, setPrizes] = useState<Prize[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [claimingPrize, setClaimingPrize] = useState<number | null>(null);
```

## Hooks Utilizados

- `useState`: Gestión del estado local
- `useEffect`: Carga inicial y actualización periódica
- `useCallback`: Optimización de funciones

## Métodos Principales

### loadPrizes
```typescript
const loadPrizes = async () => {
  try {
    setLoading(true);
    setError(null);
    const availablePrizes = await prizeService.getAvailablePrizes();
    setPrizes(availablePrizes);
  } catch (err) {
    setError('Error al cargar los premios. Por favor, intenta nuevamente.');
  } finally {
    setLoading(false);
  }
};
```

### handleClaimPrize
```typescript
const handleClaimPrize = async (prizeId: number) => {
  try {
    setClaimingPrize(prizeId);
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return;
    
    const success = await prizeService.claimPrize(prize.code);
    if (success) {
      await loadPrizes();
    } else {
      setError('No se pudo reclamar el premio.');
    }
  } catch (err) {
    setError('Error al reclamar el premio.');
  } finally {
    setClaimingPrize(null);
  }
};
```

## Estilos

El componente utiliza CSS modules para el estilado. Los principales estilos incluyen:

- Grid responsivo para la lista de premios
- Tarjetas con efectos hover
- Animaciones de carga
- Estados visuales para premios reclamados
- Toast notifications para errores

## Integración con Servicios

### PrizeService
- `getAvailablePrizes`: Obtiene la lista de premios disponibles
- `claimPrize`: Procesa la reclamación de un premio

## Testing

El componente está completamente testeado usando Vitest y Testing Library:

```typescript
describe('PrizesList', () => {
  it('renders loading state initially');
  it('renders prizes after loading');
  it('shows empty state when no prizes available');
  it('handles claim prize successfully');
  it('handles claim prize error');
  it('shows expiration time correctly');
  it('refreshes prizes automatically');
});
```

## Ejemplos de Uso

```tsx
// En App.tsx o cualquier otro componente
import PrizesList from './components/PrizesList';

function App() {
  return (
    <div className="app">
      <PrizesList />
    </div>
  );
}
```

## Consideraciones de Rendimiento

- Implementa caché para reducir llamadas al servidor
- Utiliza memo para optimizar re-renders
- Limpia intervalos y suscripciones
- Maneja estados de carga apropiadamente

## Accesibilidad

- Utiliza roles ARIA apropiados
- Maneja focus correctamente
- Proporciona textos alternativos
- Soporta navegación por teclado

## Mejoras Futuras

- [ ] Añadir filtros por estado del premio
- [ ] Implementar ordenamiento
- [ ] Añadir animaciones de transición
- [ ] Mejorar feedback visual
- [ ] Implementar modo offline
