# Guía de Contribución 🤝

## Proceso de Desarrollo

### 1. Flujo de Trabajo Git

#### Branches
- `main`: Código en producción
- `develop`: Branch principal de desarrollo
- `feature/*`: Nuevas características
- `bugfix/*`: Correcciones de bugs
- `hotfix/*`: Correcciones urgentes para producción

#### Commits
Seguimos la convención de [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[alcance opcional]: <descripción>

[cuerpo opcional]

[nota de pie opcional]
```

Tipos de commit:
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

### 2. Pull Requests

#### Proceso
1. Crear branch desde `develop`
2. Implementar cambios
3. Asegurar que los tests pasan
4. Crear PR a `develop`
5. Esperar revisión
6. Mergear después de aprobación

#### Template de PR
```markdown
## Descripción
[Descripción clara del cambio]

## Tipo de Cambio
- [ ] Nueva característica
- [ ] Corrección de bug
- [ ] Mejora de performance
- [ ] Refactorización
- [ ] Documentación

## Tests
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests e2e (si aplica)

## Screenshots
[Si aplica]

## Checklist
- [ ] He testeado los cambios localmente
- [ ] He actualizado la documentación
- [ ] He añadido tests necesarios
```

## Estándares de Código

### 1. TypeScript
- Usar tipos explícitos
- No usar `any`
- Documentar interfaces públicas
- Usar enums para valores fijos

### 2. React
- Componentes funcionales
- Hooks personalizados para lógica reutilizable
- Props tipadas
- Evitar prop drilling

### 3. Estilos
- Styled Components
- BEM para clases CSS
- Variables CSS para temas
- Mobile-first approach

### 4. Testing
- Jest + React Testing Library
- Coverage mínimo: 80%
- Tests unitarios para lógica
- Tests de integración para componentes

## Setup Local

1. **Clonar Repositorio**
```bash
git clone [URL-del-repo]
cd ruleta-new
```

2. **Instalar Dependencias**
```bash
npm install
```

3. **Variables de Entorno**
```bash
cp .env.example .env
```

4. **Verificar Setup**
```bash
npm run test
npm run dev
```

## Recursos Útiles

- [Documentación de React](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
