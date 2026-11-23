# Invitación Baby Shower y revelación — Karen & Francisco

## Estado de integración

El proyecto web **ya contiene el enlace de Apps Script** facilitado por los organizadores y está preparado para enviar votos a su implementación publicada.

- Hoja de cálculo destino: https://docs.google.com/spreadsheets/d/1z5aRWKcbPhElHbH5veRp9y9qfASS-pMsEekhc0mzHok/edit
- Web app de recepción: https://script.google.com/macros/s/AKfycbypLYUMfVmhAPf0-T0-UUeAYck72-CfTa0O9oAksT6eZ7HInwNXTxJsp86X33kp95iSpw/exec
- Código servidor para comparación o restauración: `google-apps-script/Code.gs`
- **La recepción real no se pudo comprobar desde este entorno.** No se hicieron votos de prueba. Antes de compartir la invitación, valida con un voto propio que aparezca en `Votos` y en `Resumen`.

## Cómo funciona la votación

1. El invitado abre la invitación, escribe su nombre y elige Niño o Niña.
2. Al pulsar **Guardar mi predicción**, el navegador hace POST a la URL `/exec` configurada en `config.js`.
3. El script debe registrar o actualizar una fila en `Votos` según el identificador de ese navegador.
4. El navegador consulta al mismo script con un identificador de envío y **solo muestra el mensaje de éxito si el script confirma el registro**.
5. `Resumen` muestra los totales para quien tiene acceso a la hoja. No se publican los resultados en la invitación.

El sitio no necesita un servidor propio. Apps Script es el servicio gestionado por Google que procesa las solicitudes; no es correcto decir que no hay ningún backend. El identificador evita duplicar votos por navegador, no por persona; se puede votar otra vez desde otro dispositivo o modo incógnito.

## Publicar la invitación

Copia `index.html`, `config.js`, `script.js`, `styles.css` y `assets/` en la raíz del repositorio que publique GitHub Pages, o en cualquier alojamiento estático HTTPS.

**No es necesario publicar el código Apps Script incluido en esta carpeta:** se proporciona para comprobar o actualizar el despliegue. **No publiques la hoja de cálculo como accesible a todos**, solo la aplicación web de Apps Script debe admitir las solicitudes públicas.

## Antes de compartir: prueba funcional real

1. Abre el sitio publicado (no una vista previa que bloquee solicitudes a Google).
2. Entra con un nombre de prueba de al menos dos letras y vota. Espera a ver «¡Tu voto está guardado!».
3. En la hoja, comprueba que apareció en `Votos` y aumentó el conteo correspondiente en `Resumen`.
4. Regresa a la invitación, pulsa **Modificar predicción** y guarda la opción contraria: debe actualizar **la misma fila**, no agregar una nueva, siempre que uses el mismo navegador.
5. Si se desea borrar la fila de prueba, elimínala manualmente de `Votos`.
6. Si no confirma el voto, asegúrate de que el proyecto Apps Script desplegado tiene exactamente las funciones `doPost`, `doGet` y `prepararHoja` del archivo `Code.gs`, que `prepararHoja` se ejecutó y que la aplicación web usa **Ejecutar como Yo** y **Acceso Cualquier persona**. Si cambiaste el script después de publicar, crea una nueva versión desde **Implementar > Administrar implementaciones**; la dirección `/exec` puede mantenerse.

## Contenido y personalización

- Fecha suministrada: **21 de noviembre de 2026, 16:30**, Comarca JC, Montero, Santa Cruz, Bolivia. Nota: a fecha de esta entrega, el evento ya ocurrió; no se modifica la fecha sin instrucción.
- Ilustración preferida: `assets/ilustracion-bebe.webp`.
- Música original con activación al abrir la invitación: `assets/melodia-original.mp3`.
- Google Maps: vista previa integrada y enlace para llegar.
- Animaciones de selección y confeti de agradecimiento.
- WhatsApp de confirmación: campo opcional sin número configurado.

Los ajustes generales están en `config.js`. La URL `/exec` ya está completa allí; **no tienes que volver a pegarla**.

## Pestañas en tu Google Sheets

`Votos`: Fecha de voto | Invitado | Predicción | Identificador de navegador | Último envío.

`Resumen`: Niño | Niña | Total, con fórmulas.

Las pestañas deben existir después de ejecutar `prepararHoja()` en el Apps Script original.

## Pruebas automatizadas locales

Ejecuta `node verificar-proyecto.js` para comprobar la configuración y sintaxis. Estas pruebas **no** registran votos reales, por diseño.
