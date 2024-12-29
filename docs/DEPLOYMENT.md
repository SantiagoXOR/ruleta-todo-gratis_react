# Guía de Despliegue 🚀

## Ambientes

### 1. Desarrollo Local
```bash
npm run dev
```

### 2. Staging
```bash
npm run build:staging
npm run preview
```

### 3. Producción
```bash
npm run build
```

## Variables de Entorno

### Desarrollo
```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
VITE_ANALYTICS_ID=dev-analytics
```

### Staging
```env
VITE_API_URL=https://staging-api.example.com
VITE_ENV=staging
VITE_ANALYTICS_ID=staging-analytics
```

### Producción
```env
VITE_API_URL=https://api.example.com
VITE_ENV=production
VITE_ANALYTICS_ID=prod-analytics
```

## Proceso de CI/CD

### GitHub Actions

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run lint
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
```

## Checklist de Despliegue

### Pre-deploy
- [ ] Tests pasan
- [ ] Build exitoso
- [ ] Variables de entorno configuradas
- [ ] Assets optimizados
- [ ] Performance auditada

### Post-deploy
- [ ] Verificar funcionalidad principal
- [ ] Monitorear errores
- [ ] Verificar analytics
- [ ] Backup si necesario

## Monitoreo

### Herramientas
- Logs: CloudWatch/LogRocket
- Performance: Lighthouse
- Errores: Sentry
- Analytics: Google Analytics

### Métricas Clave
- Tiempo de carga
- FCP (First Contentful Paint)
- TTI (Time to Interactive)
- Error rate
- User engagement

## Rollback

### Proceso
1. Identificar versión estable anterior
2. Ejecutar rollback en CI/CD
3. Verificar funcionalidad
4. Notificar stakeholders

### Comandos
```bash
# Revertir último deploy
git revert HEAD
git push origin main

# O usar herramienta de CI/CD
# [comandos específicos del sistema de CI/CD]
```

## Optimización

### Performance
- Comprimir assets
- Lazy loading
- Code splitting
- Cache estratégico

### SEO
- Meta tags
- Sitemap
- robots.txt
- Performance móvil
