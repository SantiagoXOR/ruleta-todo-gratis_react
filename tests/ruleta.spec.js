import { test, expect } from '@playwright/test';

test.describe('Ruleta de Premios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
  });

  test('debe mostrar la página principal con todos los elementos', async ({ page }) => {
    // Verificar que el título esté presente
    await expect(page.getByText('TODO GRATIS')).toBeVisible();

    // Verificar que el logo esté presente
    await expect(page.getByAltText('PINTEMAS')).toBeVisible();

    // Verificar que el subtítulo esté presente
    await expect(page.getByText('¡Participá y ganá premios increíbles!')).toBeVisible();

    // Verificar que el botón de girar esté presente
    await expect(page.locator('.wheel__center')).toBeVisible();
  });

  test('debe mostrar la ruleta con sectores de colores', async ({ page }) => {
    // Verificar que la ruleta esté presente
    const wheel = page.locator('.wheel');
    await expect(wheel).toBeVisible();
    
    // Verificar que tiene el estilo de fondo con colores
    const wheelStyles = await wheel.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.background;
    });
    
    // Verificar que contiene conic-gradient (sectores de colores)
    expect(wheelStyles).toContain('conic-gradient');
  });

  test('debe mostrar todos los premios en la lista', async ({ page }) => {
    // Verificar el título de premios
    await expect(page.getByText('Premios Disponibles')).toBeVisible();

    // Verificar que se muestran algunos premios principales
    await expect(page.locator('.prize-name').filter({ hasText: 'KIT DE PINTURA' })).toBeVisible();
    await expect(page.locator('.prize-name').filter({ hasText: 'BONO EXTRA' })).toBeVisible();
    await expect(page.locator('.prize-name').filter({ hasText: 'REGALO SORPRESA' })).toBeVisible();
  });

  test('debe mostrar las bases y condiciones', async ({ page }) => {
    // Verificar el título de bases y condiciones
    await expect(page.getByText('Bases y Condiciones')).toBeVisible();

    // Verificar algunas condiciones específicas
    await expect(page.getByText('Un giro por persona por día')).toBeVisible();
    await expect(page.getByText('Los códigos tienen una validez de 24 horas')).toBeVisible();
    await expect(page.getByText('Promoción exclusiva para clientes PINTEMAS')).toBeVisible();
  });

  test('debe permitir girar la ruleta y mostrar el premio', async ({ page }) => {
    // Hacer clic en el botón de girar
    const spinButton = page.locator('.wheel__center');
    await spinButton.click();

    // Esperar a que termine la animación (5 segundos + margen)
    await page.waitForTimeout(6000);

    // Verificar que aparece el modal de premio
    await expect(page.getByText('¡FELICITACIONES!')).toBeVisible();

    // Verificar que se muestra un código de premio
    const prizeCode = page.locator('.prize-code');
    await expect(prizeCode).toBeVisible();

    // Verificar que el código tiene el formato correcto (XXX-XX-X)
    const codeText = await prizeCode.textContent();
    expect(codeText).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]$/);

    // Verificar que están los botones de acción
    await expect(page.getByText('COMPARTIR EN WHATSAPP')).toBeVisible();
    await expect(page.getByText('ENTENDIDO')).toBeVisible();
  });

  test('debe cerrar el modal de premio al hacer clic en ENTENDIDO', async ({ page }) => {
    // Girar la ruleta
    await page.locator('.wheel__center').click();

    // Esperar a que aparezca el modal
    await page.waitForTimeout(6000);
    await expect(page.getByText('¡FELICITACIONES!')).toBeVisible();

    // Cerrar el modal
    await page.getByText('ENTENDIDO').click();

    // Verificar que el modal se cerró
    await expect(page.getByText('¡FELICITACIONES!')).not.toBeVisible();

    // Verificar que el botón de girar está habilitado nuevamente
    await expect(page.locator('.wheel__center')).toBeEnabled();
  });

  test('debe tener el puntero triangular visible', async ({ page }) => {
    // Verificar que el puntero está presente
    const pointer = page.locator('.wheel__pointer');
    await expect(pointer).toBeVisible();

    // Verificar que está posicionado correctamente
    const pointerStyles = await pointer.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        position: styles.position,
        top: styles.top
      };
    });

    expect(pointerStyles.position).toBe('absolute');
    // El top debe ser negativo para estar en la parte superior
    expect(pointerStyles.top).toContain('-');
  });

  test('debe ser responsive en pantallas pequeñas', async ({ page }) => {
    // Cambiar a tamaño móvil
    await page.setViewportSize({ width: 375, height: 667 });

    // Verificar que los elementos principales siguen siendo visibles
    await expect(page.getByText('TODO GRATIS')).toBeVisible();
    await expect(page.locator('.wheel__center')).toBeVisible();
    await expect(page.locator('.wheel')).toBeVisible();
  });
});
