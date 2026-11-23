/* Lógica de la invitación. Los datos editables están en config.js. */
(() => {
  'use strict';
  const config = window.INVITACION || {};
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => { const node = $(id); if (node) node.textContent = value; };
  const filled = (value) => typeof value === 'string' && value.trim().length > 0;

  // Música: se reproduce solo después de que el invitado abre la invitación.
  const audio = $('backgroundAudio');
  const musicWidget = $('musicWidget');
  const musicToggle = $('musicToggle');
  const musicLabel = $('musicLabel');
  const musicEnabled = filled(config.musicaArchivo);
  const setMusicState = (playing) => {
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Pausar música de fondo' : 'Activar música de fondo');
    musicLabel.textContent = playing ? 'Pausar música' : 'Activar música';
    musicWidget.classList.toggle('is-playing', playing);
  };
  const playMusic = () => {
    if (!musicEnabled) return;
    const attempt = audio.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(() => setMusicState(true)).catch(() => setMusicState(false));
    }
  };
  if (musicEnabled) {
    audio.src = config.musicaArchivo;
    audio.volume = Math.min(1, Math.max(0, Number(config.volumenMusica) || 0.23));
    musicWidget.hidden = false;
    musicToggle.addEventListener('click', () => {
      if (audio.paused) playMusic();
      else { audio.pause(); setMusicState(false); }
    });
    audio.addEventListener('error', () => { musicWidget.hidden = true; });
  }

  // Portada: solo se abre mediante una interacción real del invitado.
  $('openInvite').addEventListener('click', () => {
    if (config.musicaAlAbrir !== false) playMusic();
    $('intro').classList.add('hidden');
    $('intro').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('intro-open');
    $('mainContent').setAttribute('tabindex', '-1');
    $('mainContent').focus({ preventScroll: true });
  });

  // La invitación no inventa fotografías: se muestran las que se configuren.
  const attachPhoto = (url, imgId, placeholderId) => {
    if (!filled(url)) return;
    const img = $(imgId);
    const placeholder = $(placeholderId);
    img.addEventListener('load', () => {
      img.hidden = false;
      placeholder.hidden = true;
      if (imgId === 'couplePhoto') $('coupleFrame').classList.add('has-photo');
    });
    img.addEventListener('error', () => {
      img.hidden = true;
      placeholder.hidden = false;
    });
    img.src = url;
  };
  attachPhoto(config.fotoPareja, 'couplePhoto', 'couplePlaceholder');
  attachPhoto(config.fotoEcografia, 'babyUltrasound', 'ultrasoundPlaceholder');

  // Registro de votos: sitio estático + Google Apps Script + Google Sheets.
  // La respuesta del POST es opaca por las restricciones CORS de Apps Script.
  // Un GET con JSONP verifica el ID de esta operación antes de indicar «guardado».
  const WEB_APP = String(config.googleSheetsWebAppUrl || '').trim();
  const configured = /^https:\/\/script\.google\.com\/macros\/s\/[^/?#]+\/exec(?:\?.*)?$/.test(WEB_APP);
  const VOTE_ID_KEY = 'karen_francisco_voter_id_v2';
  const VOTE_DATA_KEY = 'karen_francisco_vote_data_v2';
  const readLocal = (key) => { try { return localStorage.getItem(key) || ''; } catch { return ''; } };
  const writeLocal = (key, value) => { try { localStorage.setItem(key, value); } catch { /* almacenamiento opcional */ } };
  const uuid = () => (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 16)}`);
  let voterId = readLocal(VOTE_ID_KEY);
  if (!voterId) { voterId = uuid(); writeLocal(VOTE_ID_KEY, voterId); }
  let currentVote = '';
  let registered = false;
  const nameInput = $('voterName');
  const saveButton = $('saveVote');
  let previous = {};
  try { previous = JSON.parse(readLocal(VOTE_DATA_KEY) || '{}'); } catch { previous = {}; }
  if (previous?.name) nameInput.value = String(previous.name).slice(0, 60);
  if (['Niño', 'Niña'].includes(previous?.vote)) currentVote = previous.vote;
  registered = Boolean(previous?.confirmed && configured && previous?.endpoint === WEB_APP);
  const whatsappNumber = String(config.whatsapp || '').replace(/\D/g, '');
  const updateVote = () => {
    document.querySelectorAll('[data-vote]').forEach((button) => {
      const selected = button.dataset.vote === currentVote;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('selected', selected);
    });
    saveButton.disabled = !configured || !currentVote || nameInput.value.trim().length < 2;
  };
  const setVoteStatus = (message) => setText('voteFeedback', message);
  const showSuccess = (isRemote) => {
    $('votingForm').hidden = true;
    $('voteSuccess').hidden = false;
    setText('successMessage', isRemote
      ? `${nameInput.value.trim()}, tu predicción quedó registrada. ¡Gracias por compartir nuestra alegría!`
      : `${nameInput.value.trim()}, guardamos tu elección solamente en este navegador. Falta conectar Google Sheets.`);
    setVoteStatus(isRemote ? '¡Tu voto está guardado! ♡' : 'Vista previa: voto guardado solo en este dispositivo.');
    setText('votePrivacy', isRemote
      ? 'Tu voto está en nuestra hoja privada. No publicamos resultados antes de la revelación.'
      : 'El propietario debe configurar Google Sheets para recibir los votos de todos los invitados.');
    rainConfetti(48);
  };
  const rainConfetti = (count) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = $('confettiLayer');
    const colors = ['#bdcdb7', '#e8baca', '#efdbb4', '#bfdce9', '#ffffff', '#b9ab94'];
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'vote-confetti';
      particle.style.left = `${Math.random() * 98}%`;
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.setProperty('--dur', `${1.7 + Math.random() * 1.45}s`);
      particle.style.setProperty('--drift', `${Math.round(Math.random() * 230 - 115)}px`);
      particle.style.setProperty('--fall', `${Math.max(530, layer.getBoundingClientRect().height + 20)}px`);
      particle.style.setProperty('--rot', `${Math.round(180 + Math.random() * 560)}deg`);
      particle.style.animationDelay = `${Math.random() * 0.45}s`;
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
      fragment.appendChild(particle);
    }
    layer.appendChild(fragment);
  };
  const checkSubmission = (submissionId) => new Promise((resolve, reject) => {
    // JSONP solo devuelve {ok,saved}, nunca datos privados ni totales.
    const callbackName = `_checkVote_${Math.random().toString(36).slice(2, 11)}`;
    const scriptNode = document.createElement('script');
    const timeout = setTimeout(() => { cleanup(); reject(new Error('No se recibió confirmación de Google Sheets')); }, 12000);
    const cleanup = () => { clearTimeout(timeout); scriptNode.remove(); delete window[callbackName]; };
    window[callbackName] = (payload) => { cleanup(); resolve(Boolean(payload?.ok && payload?.saved)); };
    scriptNode.onerror = () => { cleanup(); reject(new Error('No se pudo consultar Google Sheets')); };
    const query = new URLSearchParams({ action:'check', voteId:voterId, submissionId, callback:callbackName, t:String(Date.now()) });
    scriptNode.src = `${WEB_APP}?${query}`;
    document.head.appendChild(scriptNode);
  });
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const verifyWithRetries = async (submissionId) => {
    let lastError = null;
    for (let i = 0; i < 4; i++) {
      try {
        if (await checkSubmission(submissionId)) return true;
      } catch (err) { lastError = err; }
      if (i < 3) await wait(900 + i * 950);
    }
    if (lastError) throw lastError;
    return false;
  };
  document.querySelectorAll('[data-vote]').forEach((button) => button.addEventListener('click', () => {
    currentVote = button.dataset.vote;
    button.classList.remove('vote-pop');
    void button.offsetWidth;
    button.classList.add('vote-pop');
    updateVote();
    setVoteStatus(`¡${currentVote}! Ahora guarda tu predicción. ♡`);
    rainConfetti(16);
  }));
  nameInput.addEventListener('input', updateVote);
  $('editVote').addEventListener('click', () => {
    $('voteSuccess').hidden = true;
    $('votingForm').hidden = false;
    updateVote();
    setVoteStatus('Puedes cambiar tu predicción y guardarla de nuevo.');
  });
  saveButton.addEventListener('click', async () => {
    const guestName = nameInput.value.trim().replace(/\s+/g, ' ');
    if (guestName.length < 2) { nameInput.focus(); setVoteStatus('Escribe tu nombre (al menos dos letras) para registrar el voto.'); return; }
    if (!['Niño','Niña'].includes(currentVote)) return;
    nameInput.value = guestName;
    saveButton.disabled = true;
    saveButton.textContent = 'Guardando tu predicción…';
    setVoteStatus(configured ? 'Enviando tu voto a Google Sheets…' : 'Guardando en este dispositivo (modo demostración)…');
    if (!configured) {
      setVoteStatus('El registro aún no está activado: falta publicar Google Apps Script y configurar su URL /exec.');
      saveButton.textContent = 'Guardar mi predicción ♡';
      updateVote();
      return;
    }
    const submissionId = uuid();
    try {
      // POST sencillo sin preflight CORS; no se considera confirmado hasta verificar GET.
      const body = new URLSearchParams({ guestName, prediction:currentVote, voteId:voterId, submissionId });
      await fetch(WEB_APP, { method:'POST', mode:'no-cors', body, redirect:'follow', keepalive:false });
      const saved = await verifyWithRetries(submissionId);
      if (!saved) throw new Error('No se pudo confirmar el guardado del voto');
      registered = true;
      writeLocal(VOTE_DATA_KEY, JSON.stringify({ name:guestName, vote:currentVote, confirmed:true, endpoint:WEB_APP, submissionId }));
      showSuccess(true);
    } catch (error) {
      console.warn('Voto sin confirmar:', error);
      registered = false;
      setVoteStatus('No se pudo confirmar el registro. Revisa tu conexión y vuelve a intentarlo.');
      setText('votePrivacy', 'No se muestra como guardado hasta que Google Sheets confirme que recibió el voto.');
    } finally {
      saveButton.textContent = 'Guardar mi predicción ♡';
      updateVote();
    }
  });
  updateVote();
  if (registered) {
    $('votingForm').hidden = true;
    $('voteSuccess').hidden = false;
    setText('successMessage', `${nameInput.value.trim()}, tu predicción se guardó anteriormente. ¡Gracias por participar!`);
    setVoteStatus('Tu predicción ya quedó registrada en este dispositivo.');
  } else if (!configured) {
    setText('votePrivacy', 'La votación aún no está habilitada. Solo el organizador debe activar la conexión con Google Sheets.');
    setVoteStatus('Votación pendiente de activación.');
  }

  const parents = filled(config.padres) ? config.padres : 'Nuestra familia';
  setText('introParents', `Con cariño, ${parents}`);
  setText('parentsHero', parents);
  setText('parentsFooter', parents);
  if (filled(config.mensaje)) setText('introMessage', config.mensaje);
  document.title = `${config.titulo || 'Baby Shower & Revelación'} | ${parents}`;

  setText('babyTime', filled(config.horaBabyShower) ? `Hora: ${config.horaBabyShower}` : `Te esperamos desde las ${config.horaInicio || '16:30'}`);
  setText('revealTime', filled(config.horaRevelacion) ? `Hora: ${config.horaRevelacion}` : '¡La sorpresa será durante la celebración!');

  // Fechas en hora de Bolivia, para que no cambie el día según el navegador.
  let eventDate = null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(config.fecha || '')) {
    const parts = config.fecha.split('-').map(Number);
    const iso = `${config.fecha}T${/^\d{2}:\d{2}$/.test(config.horaInicio || '') ? config.horaInicio : '00:00'}:00${config.zonaHoraria || '-04:00'}`;
    const candidate = new Date(iso);
    // Comprueba fecha estrictamente, evitando normalizar días imposibles.
    if (!Number.isNaN(candidate.getTime()) && parts[1] >= 1 && parts[1] <= 12 && parts[2] >= 1 && parts[2] <= new Date(Date.UTC(parts[0], parts[1], 0)).getUTCDate()) {
      eventDate = candidate;
      const displayDate = new Date(`${config.fecha}T12:00:00-04:00`);
      const fmt = (options) => new Intl.DateTimeFormat('es-BO', { ...options, timeZone: 'America/La_Paz' }).format(displayDate);
      setText('dateWeekday', fmt({ weekday: 'long' }).toLocaleUpperCase('es'));
      setText('dateNumber', String(parts[2]).padStart(2, '0'));
      setText('dateMonth', `${fmt({ month: 'long' }).toUpperCase()} · ${parts[0]}`);
      setText('mainTime', filled(config.horaInicio) ? `Desde las ${config.horaInicio}` : 'Horario por confirmar');
    }
  }

  if (eventDate && filled(config.horaInicio)) {
    $('countdownWrap').hidden = false;
    const pad = (num) => String(num).padStart(2, '0');
    const updateCountdown = () => {
      const delta = Math.max(0, eventDate.getTime() - Date.now());
      const secs = Math.floor(delta / 1000);
      setText('days', pad(Math.floor(secs / 86400)));
      setText('hours', pad(Math.floor((secs % 86400) / 3600)));
      setText('minutes', pad(Math.floor((secs % 3600) / 60)));
      setText('seconds', pad(secs % 60));
      if (delta <= 0) { document.querySelector('.countdown-caption').textContent = '¡LLEGÓ EL GRAN DÍA!'; return true; }
      return false;
    };
    if (!updateCountdown()) {
      const ticker = setInterval(() => { if (updateCountdown()) clearInterval(ticker); }, 1000);
    }
  }

  if (filled(config.lugar)) setText('venueName', config.lugar);
  if (filled(config.direccion)) setText('venueAddress', config.direccion);
  if (filled(config.mapaUrl) && /^https:\/\//i.test(config.mapaUrl)) {
    $('mapsButton').href = config.mapaUrl;
    $('mapsButton').hidden = false;
  }
  // Mostramos el mapa real del lugar junto al botón de navegación.
  if (filled(config.mapaEmbedUrl)) {
    try {
      const embed = new URL(config.mapaEmbedUrl);
      if (embed.protocol === 'https:' && ['www.google.com', 'maps.google.com'].includes(embed.hostname)) {
        $('locationMap').src = embed.href;
        $('locationMapPanel').hidden = false;
      }
    } catch { /* Dejar oculto el marco si la URL no es válida. */ }
  }

  if (config.mostrarRegalos === false) {
    $('giftSection').hidden = true;
  } else if (filled(config.regalos)) {
    setText('giftMessage', config.regalos);
  }
  if (filled(config.vestimenta)) {
    setText('dressCode', config.vestimenta);
    $('dressCodeWrap').hidden = false;
  }
  const number = (config.whatsapp || '').replace(/\D/g, '');
  if (number.length >= 10) {
    const hint = filled(config.confirmarAntes)
      ? `Confirma tu asistencia hasta el ${config.confirmarAntes}.`
      : 'Confirma tu asistencia y celebremos juntos.';
    setText('rsvpHint', hint);
    $('rsvpForm').hidden = false;
    $('rsvpForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const name = $('guestName').value.trim();
      if (!name) { $('guestName').focus(); return; }
      const prediction = currentVote ? ` Mi predicción es: ¡${currentVote}!` : '';
      const msg = `¡Hola! Soy ${name} y confirmo mi asistencia a la revelación de género y baby shower. 🎈${prediction}`;
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    });
  }
})();
