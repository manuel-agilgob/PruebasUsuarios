

describe('Inicia Tramite desde el portal de ciudadano', () => {
    
    let testData;
    let ciudadano;
    let tramite;
    let funcionario;

    before(() => { 
        // Carga los datos del archivo de datos para utilizarlos en el test
        // ciudadano almacena los datos de cualquier Ciudadano en el archivo de datos

        const ciudadanoEnv = Cypress.env('ciudadano');
        const tramiteEnv = Cypress.env('tramite');
        const testDataEnv = Cypress.env('testData');
        const funcionarioEnv = Cypress.env('funcionario');

        cy.log(`CIUDADANO ENV : ${ciudadanoEnv}`)
        cy.log(`TRAMITE ENV : ${tramiteEnv}`)
        cy.log(`TESTDATA ENV FILE: ${testDataEnv}`)
        cy.log(`FUNCIONARIO ENV : ${funcionario}`)

        cy.fixture(testDataEnv).then((data) => {
            testData = data;
        });

        cy.fixture('ciudadanos').then((data) => {
            ciudadano = data[ciudadanoEnv];
        });

        cy.fixture('tramites').then((data) => {
            tramite = data[tramiteEnv];
        });

        cy.fixture('funcionarios').then((data) => {
            funcionario = data[funcionarioEnv];
        })

    });

    beforeEach(() => {
        cy.screenshot('CONFIGS')
        cy.visit(testData.ciudadanoURL);
        cy.loginCiudadano(ciudadano.email, ciudadano.password);
    });
    
    context('Inicia un tramite y concluye la creacion', () => {
        it('Inicia un trámite y concluye la creacion', () => {
            // Ir a tramites disponibles
            cy.get('.principal-nav  ul').as('menuPrincipal');
            cy.get('@menuPrincipal').contains('Trámites disponibles').click();
    
            // Verifica que existan trámites disponibles
            cy.get('.procedure-card').should('have.length.greaterThan', 0);
    
            // Buscar un trámite
            cy.get('#searcher').type(tramite.nombre);
            cy.get('i.ti-search')
                .parent()
                .should('be.visible')
                .and('be.enabled')
                .click();

            cy.get('.procedure-card').filter(`:contains("${tramite.nombre}")`).first().as('tramite');
            cy.get('@tramite').contains('button', 'Ir al trámite').click();

            // Iniciar tramite
            cy.contains('button', 'Iniciar trámite')
                .should('be.visible')
                .and('be.enabled')
                .click();

            // Formulario que se parametriza desde el archivo de datos 
            cy.llenarSelect('Partido Judicial', tramite.partidoJudicial);
            cy.llenarSelect('Materia', tramite.materia);
            cy.llenarSelect('Clave del tipo de juicio', tramite.claveTipoJuicio);
            cy.llenarSelect('Tipo de Vía', tramite.tipoVia);


            cy.llenarSelect('Elige el regimén del Actor o Promovente', tramite.regimenActor);
            
            // REPRESENTANTE LEGAL PARA EL ACTOR
            cy.llenarSelect('¿Existe representante legal para el actor?', tramite.representanteLegal);
            if(tramite.representanteLegal === 'Sí') {
                const representante = tramite.representante;
                cy.get('inputForm\.apellido_paternor').type(representante.apellidoPaterno);
                cy.get('#inputForm\.apellido_maternom').type(representante.apellidoMaterno);
                cy.get('#inputForm\.nombre_ss').type(representante.nombre);
                cy.get('#inputForm\.correo_electronico_representante').type(representante.email);
            }
            cy.screenshot()

            // ABOGADO PATRONO PARA EL ACTOR
            cy.llenarSelect('¿Existe abogado patrono para el actor?', tramite.abogadoPatrono);
            if(tramite.abogadoPatrono === 'Sí') {
                const abogado = tramite.abogado;
                cy.get('#inputForm\.apellido_paternoa').type(abogado.apellidoPaterno);
                cy.get('#inputForm\.apellido_maternoa').type(abogado.apellidoMaterno);
                cy.get('#inputForm\.nombre_abogado1').type(abogado.nombre);
                cy.get('#inputForm\.correo_electronico_abogado_patrono_actor').type(abogado.email);
            }
            cy.screenshot()

            // FIRMA
            cy.get('button').contains('Agregar Firma').click()
            cy.cargarArchivoFirel(ciudadano.archivoFirel, ciudadano.passwordFirel);
            cy.cargarDocumento('Agregar Archivo', testData.documentoPDF)
            cy.wait(5000)
            cy.contains('button', 'Firmar').should('be.visible').and('be.enabled').click();
            cy.screenshot()

            // DEMANDADO
            cy.llenarSelect('Para este caso, ¿Es necesario agregar demandado?', tramite.agregarDemandado);
            if(tramite.agregarDemandado === 'Sí') {
                const demandado = tramite.demandado;
                cy.llenarSelect('¿El demandado es persona física o moral?', demandado.regimen);
                cy.get('#inputForm\.apellido_paternod').type(demandado.apellidoPaterno);
                cy.get('#inputForm\.apellido_maternod').type(demandado.apellidoMaterno);
                cy.get('#inputForm\.nombre_sd').type(demandado.nombre);
                cy.get('#inputForm\.correo_electronico_del_demandado').type(demandado.email);

            }
            cy.screenshot()


            if(tramite.subirAnexo){
                cy.contains('b', ' Agregar Campo para subir anexos').click()
                cy.llenarSelectModal('* Tipo de documento:', tramite.anexos.tipoDocumento)
                cy.get('input[placeholder="Agrega una etiqueta para identificar este documento"]')
                    .type(tramite.anexos.etiqueta);
                cy.cargarDocumento('* Selecciona el archivo a subir', ciudadano.documentoIdentificacion)
                cy.wait(2000)
                cy.contains('.modal-content button', 'Agregar').click()

            }
            cy.screenshot()

            // cy.contains('button', 'Siguiente').click(); 
            // cy.contains('button', 'Confirmar', {timeout:15000}).click();

        })
    })

})

