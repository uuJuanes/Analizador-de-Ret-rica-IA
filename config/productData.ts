export interface Product {
    name: string;
    details: string;
}

export interface ProductCategory {
    categoryName: string;
    products: Product[];
}

export const bancolombiaProductData: ProductCategory[] = [
    {
        categoryName: "Cuentas",
        products: [
            {
                name: "Cuenta de Ahorros",
                details: `
Es un producto que se puede abrir fácilmente por internet, permitiendo mover el dinero y realizar retiros donde se desee. Bancolombia ofrece diferentes planes para sus cuentas de ahorro.

*   **Características Generales:**
    *   **Apertura:** Se puede abrir en línea o en una oficina física.
        *   **En línea:** Requiere RUT (para independientes) o cédula (para empleados). Los pasos incluyen elegir un plan, tomar una foto de la cédula, completar datos personales, verificar y firmar, elegir el medio de entrega de la Tarjeta Débito y crear una clave. La activación de la tarjeta se realiza una vez recibida.
        *   **En oficina:** Se visita una sucursal física, se elige el plan, se presenta el documento de identidad y el RUT (si aplica). Un asesor acompaña el proceso y activa la Tarjeta Débito. Ciudadanos extranjeros deben acercarse a una sucursal física para asesoría.
    *   **Manejo de dinero:** Permite mover el dinero entre bancos gratis con "Tus llaves" (para entidades de Redeban S.A.), con un límite de hasta $3 millones al día. Las transferencias por Nequi son gratuitas.
    *   **Tarjeta Débito:** Se envía la tarjeta a casa y se activa por internet. Permite compras sin costos adicionales, tanto con tarjeta física como virtual, dentro y fuera del país.
        *   **Tiempos de entrega:** Varían según el tipo de tarjeta. Para cambio de Tarjeta Débito Maestro a Mastercard por la web, es de 4 a 8 días hábiles. Las tarjetas pre-expedidas solicitadas en sucursal se entregan de inmediato; si se piden por la web con domicilio, el tiempo estimado es de 1 día hábil. Las tarjetas con realce se entregan de 4 a 8 días hábiles en la sucursal informada. Las tarjetas Mastercard Débito Preferencial Black o Negocios tienen servicio de entrega certificada en 4 a 8 días hábiles, incluyendo sábados.
    *   **Cobertura:** Más de 500 sucursales físicas, más de 5.000 cajeros y más de 28.000 corresponsales.
    *   **Beneficios adicionales:** Envío de plata gratis a través de Transferencias con Código QR a cuentas Bancolombia. Permite separar el dinero en "Bolsillos" y organizar gastos con "Día a Día". Se puede pagar con Billetera Móvil, código QR o Sticker Bancolombia.
    *   **Exención del 4x1.000 (GMF):** Se puede marcar una cuenta de ahorros para que no se cobre el Gravamen a los Movimientos Financieros (4x1.000), siempre y cuando no se tenga otra cuenta marcada en el sistema financiero. Los pensionados pueden tener hasta 3 cuentas sin este cobro. La marcación se solicita en la Sucursal Telefónica o en una Sucursal Física. Aunque esté marcada, si se superan los topes legales de retiros, se cobra el impuesto. Las transferencias entre cuentas Bancolombia del mismo titular o Fondos de Inversión a nombre del titular no generan cobro del 4x1.000.
    *   **Seguridad:** Se recomienda cuidar la información personal (usuario, clave, número de tarjeta, fechas de vencimiento, código de seguridad), descargar aplicaciones solo de tiendas oficiales, destruir tarjetas anteriores al renovar, reportar mensajes o enlaces sospechosos de phishing, y estar alerta en cajeros, cubriendo la clave y no aceptando ayuda de desconocidos.
*   **Términos y Condiciones (Tasas y Rendimientos):**
    *   Rendimiento del **0.05% E.A.** (Efectivo Anual).
    *   Los abonos se liquidan y abonan diariamente, reflejándose al realizar un retiro o consignación a la cuenta.
    *   Retención en la fuente sobre los intereses generados del 7%.
    *   Sin restricciones de saldo.
*   **Planes Específicos:**
    *   **Plan Cero:** Costo: $0 / Mes. Beneficios: Mueve el dinero sin cuotas fijas. Transferencias por Nequi y con Llaves ($0, hasta $3 millones al día). Costo de retiros: $2.600 por cada retiro en cajeros y corresponsales. Costo de transferencias a otros bancos: $7.300 + Iva por cada transferencia.
    *   **Plan Oro:** Costo: $14.200 / Mes. Beneficios: Retiros ilimitados en cajeros y corresponsales bancarios Bancolombia ($0 extra). 3 transferencias a cuentas de otros bancos incluidas por mes (extra: $7.300 + Iva). Ideal para quienes desean retirar sin límites y transferir a otros bancos.
    *   **Plan Plata:** Costo: $8.990 / Mes. Beneficios: 4 retiros en cajeros y corresponsales bancarios Bancolombia incluidos por mes (extra: $2.600). Costo de transferencias a otros bancos: $7.300 + Iva por cada transferencia. Ideal para quienes retiran cada 8 días.
    *   **Plan Bronce:** Costo: $5.990 / Mes. Beneficios: 2 retiros en cajeros y corresponsales bancarios Bancolombia incluidos por mes (extra: $2.600). Costo de transferencias a otros bancos: $7.300 + Iva por cada transferencia. Ideal para quienes retiran en la quincena y usan QR el resto del mes.
    *   **Cambio de plan:** Se puede realizar las veces que se quiera al mes entre planes de pensión o convenios de nómina, y una vez al mes entre planes tradicionales. Se puede hacer a través de la página web, Sucursal Telefónica o en una Sucursal Física.
`
            },
            {
                name: "Cuenta Nómina",
                details: `
Una cuenta para recibir el salario, ahorrar y acceder a beneficios.

*   **Características:**
    *   **Apertura 100% digital:** Desde el celular.
    *   **Cuota de manejo:** Desde $0, según el convenio con la empresa.
    *   **Sin monto de apertura y saldo desde $0**.
    *   **Tarjeta Débito:** Se puede pagar en el sistema de transporte público de la ciudad. Llega al lugar elegido, el domicilio es gratis.
    *   **Transacciones:** Transferencias sin costo a Nequi y cuentas Bancolombia.
    *   Se requiere conocer el NIT de la empresa para consultar los detalles del convenio.
*   **Beneficios:**
    *   **Financiación de vivienda:** Tasa más baja, con 1% de descuento sobre la tasa de interés pactada.
    *   **Tu360Compras:** 10% de descuento en todas las categorías.
    *   **Créditos a medida:** Acceso a créditos de Libranza o Libre Inversión con tasas de interés más bajas.
    *   **Tarjetas de Crédito:** Posibilidad de exoneración del primer año de cuota de manejo para tarjetas de crédito nuevas (MasterCard, Visa o American Express tradicionales), además de acumular Puntos Colombia.
    *   **Tarjeta Débito:** Descuentos en comercios como Éxito, Farmatodo, Cabify, Mercado Libre y Tostao.
    *   **Bolsillos:** Permite separar el dinero para diferentes metas.
*   **Términos y Condiciones (Tasas y Rendimientos):**
    *   Rendimiento del **0.05% E.A.** para todo monto.
    *   Retención en la fuente del 7% sobre los intereses.
    *   La cuenta de nómina puede ser exenta de gravamen de movimiento financiero (4x1.000).
`
            },
            {
                name: "Cuenta Pensión",
                details: `
Permite recibir el pago de la pensión directamente y ahorrar sin necesidad de desplazarse a una sucursal.

*   **Características:**
    *   **Protegida por seguro Fogafín**.
    *   **Monto de apertura $0** y **cuota de manejo $0**.
    *   **No permite débitos automáticos, ni recibir giros y remesas internacionales**.
    *   **Tarjeta Débito:** Llega a domicilio gratis.
*   **Beneficios:**
    *   **Crédito Libranza:** Acceso a crédito con tasa diferencial si la entidad pagadora tiene convenio con Bancolombia.
    *   **Inversión Virtual:** Permite guardar ahorros y recibir rentabilidad fija.
    *   **Transacciones y retiros:** Gratuitos e ilimitados en canales Bancolombia.
*   **Términos y Condiciones (Tasas y Rendimientos):**
    *   Rendimiento del **0.05% E.A.**.
    *   Retención en la fuente del 7% sobre los intereses.
    *   **Exención del 4x1.000 (GMF):** Puede estar exenta del GMF hasta ciertos topes (350 UVT o 41 UVT dependiendo de otras cuentas).
`
            },
            {
                name: "Cuentas Corrientes",
                details: `Ofrecen la opción de chequera para solventar las necesidades de liquidez del día a día. Bancolombia es uno de los mayores proveedores de cuentas corrientes. También existe una cuenta corriente para campañas políticas.`
            },
            {
                name: "Banconautas",
                details: `Es una cuenta diseñada para que los niños aprendan a ahorrar de forma divertida.`
            },
            {
                name: "Cuenta Preferencial",
                details: `Una cuenta de ahorros que ofrece tasas especiales.`
            },
            {
                name: "Cuenta AFC (Ahorro para Fomento a la Construcción)",
                details: `Ofrece beneficios tributarios al momento de comprar vivienda propia.`
            },
            {
                name: "Cuenta de Ahorro Programado",
                details: `Permite ahorrar para cumplir requisitos y postularse a subsidios de vivienda del gobierno.`
            }
        ]
    },
    {
        categoryName: "Créditos",
        products: [
            {
                name: "Crédito de Libranza para Empleados",
                details: `
Un crédito con tasa fija que se descuenta mensualmente del sueldo, mediante convenio con la empresa, sin necesidad de fiadores.

*   **Características:**
    *   **Monto de desembolso:** Desde $1.000.000.
    *   **Edad:** Entre 18 y 74 años.
    *   **Ingresos:** Mínimo 1 SMMLV.
    *   **Pagos:** La cuota se debita mensualmente del sueldo.
*   **Beneficios:**
    *   **Tasas más bajas:** Se pueden reducir los intereses al adquirir el Seguro Empleado Protegido.
    *   **Seguros:** Incluye seguro de vida y el Seguro Empleado Protegido (cubre hasta 6 cuotas por desempleo).
    *   **Abonos o cancelación anticipada:** Permitido en cualquier momento.
*   **Términos y Condiciones (Tasas y Seguros):**
    *   **Tasa Fija:** Mes Vencido desde 0.86% hasta 1.89% (E.A. desde 10.82% hasta 25.15%).
    *   **Tasa Variable:** IBR (NAMV) + Puntos (E.A. desde 9.36% hasta 25.15%).
    *   **Seguro de vida:** Obligatorio, con asistencias médicas.
    *   **Seguro de empleado protegido:** Voluntario, cubre desempleo y enfermedades graves.
`
            },
            {
                name: "Crédito de Libranza para Pensionados Protección",
                details: `
Dirigido a pensionados de Protección para invertir en planes aplazados.

*   **Características:**
    *   **Monto de desembolso:** Desde $1 millón.
    *   **Ingresos:** Mínimo 1 SMMLV.
    *   **Plazo:** Hasta 120 meses.
    *   **Cuota fija:** Incluye abonos a capital, intereses y seguro de vida deudor.
*   **Términos y Condiciones (Tasas y Seguros):**
    *   **Tasas de Interés:** Mes vencido desde 1.19% hasta 1.87% (E.A. desde 15.25% hasta 24.90%).
    *   **Seguro:** Seguro de vida deudor obligatorio.
`
            },
            {
                name: "Compra de Cartera Bancolombia (Créditos de Consumo)",
                details: `
Permite mejorar las condiciones financieras consolidando deudas con tasas de interés más competitivas.

*   **Características:**
    *   **Edad:** Entre 18 y 84 años.
    *   **Ingresos:** Desde $1 millón.
*   **Beneficios:**
    *   **Sin costos adicionales:** Estudio de crédito sin costo, sin cuota de manejo.
    *   **Menor tasa de interés:** Respecto al crédito de libre inversión.
*   **Términos y Condiciones (Tasas):**
    *   **Libre Inversión:** Fija (M.V. 0.97%-1.89%).
    *   **Libranza Empleados:** Fija (M.V. 0.76%-1.89%).
`
            },
            {
                name: "Crédito de Vivienda (Hipotecario)",
                details: `
Permite disfrutar de una casa o apartamento pagando cuotas mensuales. Aplica para compra, construcción o remodelación.

*   **Características:**
    *   **Tipos de vivienda:** Nueva o usada, urbana, valor mínimo de 40 SMMLV.
    *   **Financiación:** Hasta el 80% para VIP y VIS, hasta el 70% para No VIS.
    *   **Ingresos:** Desde 1 SMMLV, se pueden sumar ingresos familiares.
    *   **Plazos:** 5-20 años en pesos, hasta 30 años en UVR.
*   **Beneficios:**
    *   **Avalúo y estudio gratuitos.**
    *   **Carta de aprobación:** Validez de hasta 18 meses.
    *   **Descuento por nómina:** 1% de descuento sobre la tasa de interés.
    *   **Beneficios tributarios:** Disminución de la base gravable.
*   **Términos y Condiciones (Tasas y Seguros):**
    *   **Tasas en UVR:** VIS: UVR + 6.50% E.A., NO VIS: UVR + 8.00% E.A.
    *   **Tasas en pesos:** VIS y NO VIS: 11.00% E.A.
    *   **Seguros:** Obligatorios de incendio y terremoto, y seguro de vida deudor.
`
            },
            {
                name: "Créditos para Vehículo",
                details: `Bancolombia ofrece financiación para la compra de vehículos nuevos o usados, motos de bajo o alto cilindraje, bicicletas y patinetas (incluyendo eléctricas).`
            },
            {
                name: "Crédito Educativo",
                details: `Permite financiar estudios profesionales (pregrados, posgrados y cursos) en Colombia o en el exterior.`
            },
            {
                name: "Crédito Productivo",
                details: `Financia materia prima, maquinaria y activos para negocios de microempresarios e independientes.`
            },
            {
                name: "Otros Créditos Empresariales/Gubernamentales",
                details: `Incluye líneas de crédito como Bancoldex, Findeter, Credipago, Cartera ordinaria, Agrofácil y Finagro para diversos sectores.`
            }
        ]
    },
    {
        categoryName: "Inversiones",
        products: [
            {
                name: "Fiduexcedentes",
                details: `
Fondo de inversión para administrar recursos y excedentes de liquidez sin pacto de permanencia.

*   **Características:**
    *   **Gestión:** Estilo de gestión activo.
    *   **Rendimientos:** Variables, según el comportamiento diario del mercado.
    *   **Montos mínimos:** Apertura $50.000, adiciones $1, retiros parciales $1.
*   **Beneficios:**
    *   **Dinero a tu alcance:** Inversión disponible y a la vista.
    *   **Diversificación del riesgo:** Acceso a un portafolio diversificado de renta fija.
*   **Términos y Condiciones:**
    *   **Comisión de administración:** 1.50% nominal anual.
    *   **Riesgos:** Sujeto a riesgo de mercado y de crédito.
    *   **Aspectos tributarios:** Retención en la fuente entre 3.5% y 7% para renta fija.
`
            },
            {
                name: "Fiducuenta",
                details: `Opción de inversión a corto plazo, manteniendo el dinero disponible para el manejo de liquidez.`
            },
            {
                name: "Plan Semilla",
                details: `Permite invertir periódicamente para alcanzar sueños de mediano y largo plazo. El monto mínimo es de $50.000 a un plazo de 12 meses.`
            },
            {
                name: "Inversión Virtual (para Cuentas Pensión)",
                details: `Permite guardar ahorros y recibir una rentabilidad fija. Se elige plazo, monto y periodicidad de pago de intereses.`
            },
            {
                name: "Otros Fondos de Inversión Colectiva",
                details: `Incluye Fondos de Renta Fija (Fidurenta, Renta fija Plazo), Fondos Balanceados (Renta Futuro, Renta Balanceado), Fondos de Renta Variable (Renta acciones Latam), y Fondos Alternativos o Inmobiliarios.`
            }
        ]
    },
    {
        categoryName: "Tarjetas",
        products: [
            {
                name: "Tarjetas Débito",
                details: `Se envían al domicilio del cliente y se activan por internet. Permiten comprar sin costos adicionales, ya sea de forma física o virtual, dentro y fuera del país. Los planes de cuenta de ahorros también incluyen beneficios y costos asociados a los retiros con la tarjeta débito.`
            },
            {
                name: "Tarjetas de Crédito",
                details: `Permiten pagar, comprar y acumular puntos. Bancolombia ofrece un comparador de tarjetas de crédito. Es posible extender el plazo para pagar la deuda de la tarjeta. Las cuentas de nómina pueden ofrecer el primer año sin cuota de manejo en tarjetas de crédito nuevas.`
            }
        ]
    },
    {
        categoryName: "Seguros",
        products: [
            {
                name: "Seguro de vida deudor",
                details: `Es obligatorio para la mayoría de los créditos y cubre el saldo de la deuda en caso de fallecimiento o incapacidad total y permanente.`
            },
            {
                name: "Empleado o Independiente Protegido",
                details: `Es un seguro voluntario que asegura el pago de algunas cuotas del crédito en caso de eventualidades como pérdida de empleo, incapacidad temporal o diagnóstico de enfermedad grave.`
            },
            {
                name: "Seguro de incendio y terremoto",
                details: `Disponible para créditos de vivienda, protege el inmueble contra incendios, terremotos y otros riesgos.`
            }
        ]
    },
    {
        categoryName: "Leasing",
        products: [
            {
                name: "Leasing Habitacional no familiar",
                details: `Una opción de arriendo con la posibilidad de adquirir la vivienda posteriormente. Permite sumar los ingresos de hasta 3 personas.`
            },
            {
                name: "Leasing Financiero para Vehículo",
                details: `Primero se arrienda el vehículo, luego puede ser propiedad del cliente.`
            },
            {
                name: "Leasing Inmobiliario Bancolombia",
                details: `Proporciona recursos para la compra de locales, bodegas, oficinas, consultorios, etc.`
            }
        ]
    }
];
