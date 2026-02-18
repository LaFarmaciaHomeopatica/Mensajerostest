# Sistema de Gestión de Mensajeros - Logística LFH
## Presentación de Proyecto

---

**Fecha:** 6 de febrero de 2026  
**Elaborado por:** Carlos Arevalo

---

## Sobre este Proyecto

He desarrollado un sistema web para la gestión operativa de mensajeros y de cumplimiento de normativas. Este proyecto fue realizado en base a las necesidades manifestadas por parte del personal y de otras identificadas por mi, el proyecto fue desarrollado por iniciativa personal, en tiempo fuera del horario laboral, con el objetivo de aportar una mejora significativa a los procesos de la empresa.

El sistema ya se encuentra listo para su implementación, en caso de ser aprobado el proyecto, me comprometo a realizar la implementación tan pronto como sea posible, esto incluye la migración de datos, configuración del servidor, capacitación de usuarios y puesta en marcha.

---

## Funcionalidades

| Módulo | Funciones |
|--------|-----------|
| **Centro de Control (Dashboard)** | Vista en tiempo real del estado de mensajeros por sede (en ruta, almorzando, disponible). Filtro por nombre/placa. Generación de archivos de despacho Excel necesario para la sincronización con Beetrack. |
| **Portal del Mensajero** | Ingreso mediante placa del vehiculo. Menú de autogestión. Consulta de turnos asignados, acceso a reportes de inspecciones, limpiezas, almuerzos y fin de turno. |
| **Inspecciones Preoperacionales** | Checklist digital configurable. Preguntas por categoría (documentos, seguridad, mecánica). Campo de observaciones. |
| **Reportes de Limpieza** | Captura de fotografías como evidencia. Compresión automática de imágenes. Historial por mensajero. |
| **Control de Almuerzos** | Registro de inicio de almuerzo. Cálculo automático de hora de retorno, aplicable a toda el personal de operaciones|
| **Gestión de Turnos** | Asignación de horarios por día y sede. Marcación de ausencias. Vista de próximos turnos y consulta de turnos pasados|
| **Reporte de Fin de Turno** | Registro de finalización de jornada. Bloqueo de nuevas actividades después de reportar, alertas posible pagos de horas extras |
| **Trámites Internos** | Creación y seguimiento de guías (cobros, regalos, sobres, etc). Sincronización con Beetrack.|
| **Analytics y Métricas** | Estadísticas de cumplimiento (inspecciones, limpiezas, almuerzos, fin de turno). Comparativo con períodos anteriores. Exportación a Excel. |
| **Reportes Consolidados** | Historial de inspecciones, limpiezas y almuerzos. Filtros por fecha y mensajero. |
| **Gestión de Usuarios** | Roles diferenciados (Administrador, Líder, Mensajero, Regente, Trámites). Control de acceso por rol. |
| **Gestión de Mensajeros** | Alta/baja de mensajeros. Asignación de sede. Estado activo/inactivo. |


---

## Impacto Operativo

| Área | Mejora |
|------|--------|
| **Despachos** | Consulta instantánea del estado de mensajeros (antes: llamadas, ahora: tiempo real) |
| **Despachos** | Generación automática de archivos de despacho para Beetrack. Reducción de errores. |
| **Despachos** | Asignación de rutas más ágil al ver quién está disponible al instante. |
| **Regencia** | Consolidación automática de reportes de inspecciones y limpieza. Quién cumple y quién no. |
| **Regencia** | Evidencia fotográfica de limpiezas disponible al instante. Historial por mensajero. |
| **Regencia** | Alertas visuales de inspecciones con fallas mecánicas o de seguridad. |
| **Administración** | Trazabilidad total. Registro digital con fecha y hora de cada actividad. |
| **Administración** | Métricas de cumplimiento para toma de decisiones. Exportación a Excel. |
| **Administración** | Identificación de posibles horas extras gracias a los reportes de fin de turno. |
| **Trámites** | Seguimiento centralizado de guías (cobros, regalos, sobres). Sincronización con Beetrack. |
| **Mensajeros** | Autogestión desde el celular: turnos, reportes, almuerzos, todo en un solo lugar. |
| **Mensajeros** | Consulta de turnos sin necesidad de preguntar. Claridad en horarios y sedes. |
| **General** | Eliminación total de formatos en papel. Ahorro en impresiones. |

---

## Consideraciones

- Un desarrollo externo requeriría semanas de levantamiento de requerimientos para entender la operación.
- El conocimiento del negocio ya está incorporado en el sistema, lo cual reduce significativamente tiempos de ajuste.
- El sistema está listo para implementar.
- Incluye soporte y ajustes por parte del desarrollador (yo).

---

## Propuesta de Valor

Este sistema representa una oportunidad para la empresa de:

1. **Modernizar la operación** con herramientas digitales sin inversión en desarrollo externo.
2. **Mejorar el control y seguimiento** de la flota de mensajeros en tiempo real.
3. **Garantizar cumplimiento normativo** con registros de inspecciones y limpiezas documentados.
4. **Optimizar tiempos** en todas las áreas: despachos, regencia, administración y trámites.

---

## Capturas de Pantalla del Sistema

### Centro de Control (Dashboard)
![Dashboard - Vista principal](images/Screenshot%20From%202026-02-07%2011-00-02.png)

### Horarios
![Turnos de los mensajeros](images/Screenshot%20From%202026-02-07%2011-00-10.png)

### Seguimiento Preoperacional
![Portal - Preoperacional](images/Screenshot%20From%202026-02-07%2011-00-20.png)

### Seguimiento Limpieza
![Portal - Limpieza](images/Screenshot%20From%202026-02-07%2011-00-28.png)

### Seguimiento Turnos Almuerzo

![Portal - Consulta de turnos de almuerzo](images/Screenshot%20From%202026-02-07%2011-00-37.png)

### Consolidado (Analisis general)
![Portal - Consolidado](images/Screenshot%20From%202026-02-07%2011-00-43.png)

### Gestión de Trámites
![Portal - Tramites](images/Screenshot%20From%202026-02-07%2011-00-49.png)

### Dashboard Cumplimiento
![Dashboard - 1](images/Screenshot%20From%202026-02-07%2011-01-05.png)

![Dashboard - 2](images/Screenshot%20From%202026-02-07%2011-01-11.png)

### Gestión de Mensajeros
![Mensajeros - CRUD](images/Screenshot%20From%202026-02-07%2011-01-19.png)

### Gestión de Usuarios

![Usuarios - Gestión](images/Screenshot%20From%202026-02-07%2011-01-26.png)

### Portal Mensajeros
![Portal Mensajeros - Ingreso](images/Screenshot%20From%202026-02-07%2011-01-55.png)

![Portal Mensajeros - Menu Principal](images/Screenshot%20From%202026-02-07%2011-02-02.png)

![Portal Mensajeros - Turnos](images/Screenshot%20From%202026-02-07%2011-02-09.png)

![Portal Mensajeros - Preoperacional](images/Screenshot%20From%202026-02-07%2011-02-17.png)

![Portal Mensajeros - Limpieza](images/Screenshot%20From%202026-02-07%2011-02-40.png)

![Portal Mensajeros - Almuerzo](images/Screenshot%20From%202026-02-07%2011-02-47.png)

![Portal Mensajeros - Fin turno](images/Screenshot%20From%202026-02-07%2011-02-54.png)

---

## Nota Final

Presento este proyecto como un aporte adicional a mis funciones regulares, desarrollado con el compromiso de contribuir al crecimiento de la empresa. 

Quedo a disposición para cualquier consulta, demostración del sistema, o para conversar sobre el reconocimiento que la empresa considere apropiado por este aporte.

---

*Atentamente,*  
**Carlos Arevalo**
*Coordinador de Abastecimiento*

