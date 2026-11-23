/*
  Edita aquí los datos de la invitación.
  Deja una cadena vacía ("") si todavía no tienes ese dato.
*/
window.INVITACION = {
  padres: "Karen & Francisco",
  titulo: "Revelación de género & Baby Shower",
  mensaje: "Una dulce sorpresa está en camino y queremos compartirla contigo.",
  fecha: "2026-11-28",     // Sábado 28 de noviembre de 2026
  horaInicio: "16:30",   // Hora de inicio (Bolivia)
  horaBabyShower: "",      // Aún no se definió un horario distinto al inicio
  horaRevelacion: "",      // La revelación será una sorpresa durante el evento
  lugar: "Comarca JC",    // Nombre que figura en el punto de Google Maps
  direccion: "MQ82+6V5, Montero, Santa Cruz, Bolivia",
  mapaUrl: "https://google.com/maps/place/MQ82%2B6V5+Comarca+JC,+Montero/data=!4m2!3m1!1s0x93ee3f0061131bbf:0x637ced01b6389f47!18m1!1e1?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI2LjQ2LjAYACDXggMqhwEsMTAwODQwMDQ2LDk0MjA3Mzk0LDk0MjA3NTA2LDk0MjA4NTA2LDk0MjE4NjUzLDk0MjI5ODM5LDEwMDg0ODA5NiwxMDA4MjUwMjUsMTAwODA0OTc2LDEwMDgyNzk3NSwxMDA4MzgzNTksMTIxODE2NDYxLDEwMDg0NTkzOCwxMDA4NDc0NDFCAkJP&skid=dc985575-9f73-40a8-a490-0fc70047bbf0&g_st=aw",
  mapaEmbedUrl: "https://maps.google.com/maps?q=MQ82%2B6V5%20Comarca%20JC%2C%20Montero%2C%20Bolivia&z=16&output=embed", // Vista previa interactiva dentro de la invitación
  whatsapp: "",            // Opcional. Número para confirmaciones; el voto va directo a Sheets.
  confirmarAntes: "",      // Opcional: "10 de febrero"
  vestimenta: "",          // Opcional: "Tonos pastel"
  regalos: "Tu presencia es nuestro mejor regalo. Si deseas llevar un detalle para nuestro bebé, lo recibiremos con mucho cariño.",
  mostrarRegalos: true,
  // Fotografías: copia los archivos a la carpeta assets y escribe aquí su ruta.
  // Por ejemplo: "assets/nuestra-foto.jpg" y "assets/ecografia.jpg".
  fotoPareja: "assets/ilustracion-bebe.webp", // Ilustración del bebé como portada; reemplaza por foto de ambos cuando quieras.
  fotoEcografia: "assets/ilustracion-bebe.webp", // Ilustración favorita del bebé, sin aspecto médico.
  // Música instrumental original incluida; se inicia al abrir la invitación.
  musicaArchivo: "assets/melodia-original.mp3",
  musicaAlAbrir: true,
  volumenMusica: 0.23,    // Entre 0 y 1.
  // Hoja destino: https://docs.google.com/spreadsheets/d/1z5aRWKcbPhElHbH5veRp9y9qfASS-pMsEekhc0mzHok/edit
  // Implementación de Apps Script proporcionada por los organizadores.
  // Para mantener la privacidad, el sitio NO consulta resultados ni expone la hoja al público.
  googleSheetsWebAppUrl: "https://script.google.com/macros/s/AKfycbypLYUMfVmhAPf0-T0-UUeAYck72-CfTa0O9oAksT6eZ7HInwNXTxJsp86X33kp95iSpw/exec",
  zonaHoraria: "-04:00"     // Bolivia (UTC-04:00)
};
