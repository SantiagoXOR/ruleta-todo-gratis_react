describe('Gestión de Códigos', () => {
  beforeEach(() => {
    // Interceptar llamadas a la API
    cy.intercept('GET', '/api/codes/statistics*', { fixture: 'codeStatistics.json' }).as('getStats');
    cy.intercept('GET', '/api/codes*', { fixture: 'codesList.json' }).as('getCodes');
    cy.intercept('POST', '/api/codes/export', { fixture: 'codesExport.json' }).as('exportCodes');
    cy.intercept('POST', '/api/codes/generate', { fixture: 'codeGenerate.json' }).as('generateCode');
    
    // Visitar la página de gestión de códigos
    cy.visit('/admin/codes');
  });

  describe('Estadísticas de Códigos', () => {
    it('muestra las estadísticas correctamente', () => {
      // Verificar que se carguen las estadísticas
      cy.wait('@getStats');
      
      // Verificar los elementos de estadísticas
      cy.get('[data-testid="total-codes"]').should('be.visible');
      cy.get('[data-testid="used-codes"]').should('be.visible');
      cy.get('[data-testid="expired-codes"]').should('be.visible');
      
      // Verificar los gráficos
      cy.get('[data-testid="usage-chart"]').should('be.visible');
      cy.get('[data-testid="distribution-chart"]').should('be.visible');
    });

    it('permite cambiar el rango de tiempo', () => {
      // Cambiar a vista mensual
      cy.get('[data-testid="time-range-month"]').click();
      cy.wait('@getStats');
      
      // Verificar que se actualizaron las estadísticas
      cy.get('[data-testid="total-codes"]').should('contain', '150');
      
      // Cambiar a vista anual
      cy.get('[data-testid="time-range-year"]').click();
      cy.wait('@getStats');
      
      // Verificar actualización
      cy.get('[data-testid="total-codes"]').should('contain', '500');
    });

    it('maneja errores de carga', () => {
      // Simular error en la API
      cy.intercept('GET', '/api/codes/statistics*', {
        statusCode: 500,
        body: { error: 'Error al cargar estadísticas' }
      }).as('getStatsError');
      
      cy.visit('/admin/codes');
      cy.wait('@getStatsError');
      
      // Verificar mensaje de error
      cy.get('[data-testid="error-message"]').should('be.visible');
      
      // Verificar botón de reintentar
      cy.get('[data-testid="retry-button"]').should('be.visible').click();
      cy.wait('@getStatsError');
    });
  });

  describe('Exportación de Códigos', () => {
    it('permite exportar códigos en diferentes formatos', () => {
      // Abrir modal de exportación
      cy.get('[data-testid="export-button"]').click();
      
      // Seleccionar formato CSV
      cy.get('[data-testid="format-csv"]').click();
      
      // Seleccionar rango de fechas
      cy.get('[data-testid="date-range"]').select('month');
      
      // Marcar opciones
      cy.get('[data-testid="include-used"]').check();
      cy.get('[data-testid="include-expired"]').check();
      
      // Iniciar exportación
      cy.get('[data-testid="start-export"]').click();
      cy.wait('@exportCodes');
      
      // Verificar descarga
      cy.get('[data-testid="download-link"]').should('be.visible');
    });

    it('muestra progreso de exportación', () => {
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="start-export"]').click();
      
      // Verificar indicador de progreso
      cy.get('[data-testid="export-progress"]').should('be.visible');
      cy.get('[data-testid="progress-bar"]').should('exist');
    });

    it('maneja errores de exportación', () => {
      // Simular error en exportación
      cy.intercept('POST', '/api/codes/export', {
        statusCode: 500,
        body: { error: 'Error al exportar códigos' }
      }).as('exportError');
      
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="start-export"]').click();
      cy.wait('@exportError');
      
      // Verificar mensaje de error
      cy.get('[data-testid="export-error"]').should('be.visible');
    });
  });

  describe('Generación de Códigos', () => {
    it('permite generar nuevos códigos', () => {
      // Abrir modal de generación
      cy.get('[data-testid="generate-button"]').click();
      
      // Seleccionar premio
      cy.get('[data-testid="prize-select"]').select('1');
      
      // Generar código
      cy.get('[data-testid="generate-code"]').click();
      cy.wait('@generateCode');
      
      // Verificar código generado
      cy.get('[data-testid="generated-code"]').should('be.visible');
    });

    it('valida campos requeridos', () => {
      cy.get('[data-testid="generate-button"]').click();
      cy.get('[data-testid="generate-code"]').click();
      
      // Verificar mensaje de error
      cy.get('[data-testid="prize-error"]').should('be.visible');
    });

    it('muestra confirmación de generación exitosa', () => {
      cy.get('[data-testid="generate-button"]').click();
      cy.get('[data-testid="prize-select"]').select('1');
      cy.get('[data-testid="generate-code"]').click();
      
      // Verificar notificación
      cy.get('[data-testid="success-notification"]').should('be.visible');
    });
  });

  describe('Integración de Componentes', () => {
    it('actualiza estadísticas después de generar código', () => {
      // Generar nuevo código
      cy.get('[data-testid="generate-button"]').click();
      cy.get('[data-testid="prize-select"]').select('1');
      cy.get('[data-testid="generate-code"]').click();
      cy.wait('@generateCode');
      
      // Verificar actualización de estadísticas
      cy.wait('@getStats');
      cy.get('[data-testid="total-codes"]').should('contain', '101');
    });

    it('refresca lista después de exportar', () => {
      // Realizar exportación
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="start-export"]').click();
      cy.wait('@exportCodes');
      
      // Verificar actualización de lista
      cy.wait('@getCodes');
      cy.get('[data-testid="codes-list"]').should('be.visible');
    });

    it('mantiene estado de filtros al navegar', () => {
      // Aplicar filtros
      cy.get('[data-testid="time-range-month"]').click();
      cy.get('[data-testid="status-filter"]').select('used');
      
      // Navegar a otra página y volver
      cy.visit('/admin/prizes');
      cy.visit('/admin/codes');
      
      // Verificar que se mantienen los filtros
      cy.get('[data-testid="time-range-month"]').should('have.class', 'active');
      cy.get('[data-testid="status-filter"]').should('have.value', 'used');
    });
  });

  describe('Rendimiento', () => {
    it('carga datos de forma eficiente', () => {
      // Verificar tiempo de carga inicial
      cy.window().then((win) => {
        const performance = win.performance;
        const navigationStart = performance.timing.navigationStart;
        const loadEventEnd = performance.timing.loadEventEnd;
        
        expect(loadEventEnd - navigationStart).to.be.lessThan(3000);
      });
    });

    it('implementa paginación correctamente', () => {
      // Cargar más códigos
      cy.get('[data-testid="load-more"]').click();
      cy.wait('@getCodes');
      
      // Verificar que se agregaron nuevos códigos
      cy.get('[data-testid="code-item"]').should('have.length.greaterThan', 10);
    });

    it('utiliza caché efectivamente', () => {
      // Primera carga
      cy.wait('@getStats');
      
      // Cambiar filtro
      cy.get('[data-testid="time-range-month"]').click();
      
      // Verificar que no se hace nueva petición
      cy.get('@getStats.all').should('have.length', 1);
    });
  });
});
