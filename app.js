(() => {
  const STORAGE_KEY = "genclases_custom_exercises";
  const SAVED_KEY = "genclases_saved_classes";
  const FAV_KEY = "genclases_favorites";
  const HIDDEN_KEY = "genclases_hidden";

  let state = {
    discipline: "pilates",
    modality: null,
    accesorios: [],      // vacío = sin preferencia
    upperFocus: "mixto", // solo aplica con objetivo "tren-superior"
    level: "intermedio",
    duration: 55,
  };

  // ---------- almacenamiento local seguro (modo privado / storage bloqueado) ----------
  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin storage: se pierde al recargar */ }
  }

  // favoritos y "nunca mostrar": listas de ids
  const getFavorites = () => new Set(readJSON(FAV_KEY, []));
  const getHidden = () => new Set(readJSON(HIDDEN_KEY, []));
  function toggleInSet(key, id) {
    const set = new Set(readJSON(key, []));
    set.has(id) ? set.delete(id) : set.add(id);
    writeJSON(key, [...set]);
    return set.has(id);
  }

  let lastRender = null; // { objectiveId, objectiveLabel, populationId, populationLabel, result } de la clase mostrada actualmente

  // ---------- helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const LEVEL_LABELS = { inicial: "Inicial", intermedio: "Intermedio", avanzado: "Avanzado" };

  // los ejercicios propios pasan por el mismo enriquecido que la base (accesorio, posición, patrón, nivel)
  function getCustomExercises() {
    const list = readJSON(STORAGE_KEY, []);
    return Array.isArray(list) ? list.map(ex => window.enrichExercise ? window.enrichExercise(ex) : ex) : [];
  }

  function rawCustomExercises() {
    const list = readJSON(STORAGE_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function saveCustomExercise(ex) {
    const all = rawCustomExercises();
    all.push(ex);
    writeJSON(STORAGE_KEY, all);
    renderMyExercisesList();
  }

  function deleteCustomExercise(id) {
    writeJSON(STORAGE_KEY, rawCustomExercises().filter(ex => ex.id !== id));
    renderMyExercisesList();
  }

  function exportCustomExercises() {
    const data = { app: "generador-de-clases", version: 1, exportedAt: new Date().toISOString(), exercises: rawCustomExercises() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mis-ejercicios-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function importCustomExercises(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const incoming = Array.isArray(parsed) ? parsed : parsed.exercises;
        if (!Array.isArray(incoming)) throw new Error("formato");
        const valid = incoming.filter(ex => ex && ex.name && ex.discipline && ex.moment);
        const current = rawCustomExercises();
        const ids = new Set(current.map(ex => ex.id));
        const added = valid.filter(ex => !ids.has(ex.id));
        writeJSON(STORAGE_KEY, current.concat(added));
        renderMyExercisesList();
        alert(`Importados ${added.length} ejercicios${valid.length - added.length ? ` (${valid.length - added.length} ya estaban)` : ""}.`);
      } catch {
        alert("No pude leer el archivo. Tiene que ser un JSON exportado desde \"Mis ejercicios\".");
      }
    };
    reader.readAsText(file);
  }

  function renderHiddenBox() {
    const box = $("#hidden-exercises-box");
    if (!box) return;
    const hidden = getHidden();
    if (!hidden.size) { box.innerHTML = ""; return; }
    const names = allExercises(true).filter(ex => hidden.has(ex.id)).map(ex => ex.name);
    box.innerHTML = `
      <p class="panel-hint">Ejercicios que marcaste como "no mostrar" (${hidden.size}): ${names.slice(0, 6).join(", ")}${names.length > 6 ? "…" : ""}</p>
      <button type="button" class="btn-mini" id="btn-restore-hidden">↺ Volver a mostrarlos</button>`;
  }

  function renderMyExercisesList() {
    const list = $("#my-exercises-list");
    if (!list) return;
    const mine = getCustomExercises();

    const toggleBtn = $("#toggle-my-exercises");
    if (toggleBtn) toggleBtn.textContent = `🗂️ Mis ejercicios propios (${mine.length})`;

    renderHiddenBox();

    if (!mine.length) {
      list.innerHTML = `<p class="block-empty">Todavía no cargaste ningún ejercicio propio.</p>`;
      return;
    }

    list.innerHTML = mine.map(ex => {
      const discLabel = ex.discipline === "pilates" ? "Pilates" : "Yoga";
      const modLabels = (ex.modality || []).map(id => MODALITIES[ex.discipline]?.find(m => m.id === id)?.label || id).join(", ");
      const levelLabels = `desde ${(LEVEL_LABELS[ex.nivelMin] || ex.nivelMin || "").toLowerCase()}`;
      const blockName = BLOCKS.find(b => b.id === ex.moment)?.name || `Bloque ${ex.moment}`;
      const objLabels = (ex.objective || []).map(id => OBJECTIVES[ex.discipline]?.find(o => o.id === id)?.label || id).join(", ");
      const accLabels = (ex.accesorio || []).map(a => ACCESORIO_LABELS[a] || a).join(", ");
      const metaParts = [discLabel, modLabels, levelLabels, blockName, objLabels, accLabels].filter(Boolean);
      return `
        <div class="saved-class-card">
          <div>
            <strong>${ex.name}</strong>
            <p class="saved-class-meta">${metaParts.join(" · ")}</p>
          </div>
          <div class="saved-class-actions">
            <button type="button" class="btn-mini btn-remove btn-delete-exercise" data-id="${ex.id}">✕ Quitar</button>
          </div>
        </div>`;
    }).join("");
  }

  // includeAll=true ignora el interruptor "Incluir mis ejercicios" (para listados, no para generar)
  function allExercises(includeAll = false) {
    const mine = includeAll || $("#include-mine")?.checked !== false ? getCustomExercises() : [];
    return EXERCISES.concat(mine);
  }

  // ---------- mis clases guardadas ----------
  function getSavedClasses() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    } catch { return []; }
  }

  function persistSavedClasses(list) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  }

  function saveCurrentClass() {
    if (!lastRender) return;
    const saved = getSavedClasses();
    saved.unshift({
      id: "saved-" + Date.now(),
      savedAt: new Date().toISOString(),
      discipline: state.discipline,
      modality: state.modality,
      accesorios: state.accesorios.slice(),
      upperFocus: state.upperFocus,
      level: state.level,
      duration: state.duration,
      render: lastRender,
    });
    persistSavedClasses(saved);
    renderSavedClassesList();

    const btn = $("#btn-save-class");
    if (btn) {
      const original = btn.textContent;
      btn.textContent = "Guardada ✓";
      setTimeout(() => { btn.textContent = original; }, 1500);
    }
  }

  function deleteSavedClass(id) {
    persistSavedClasses(getSavedClasses().filter(e => e.id !== id));
    renderSavedClassesList();
  }

  function openSavedClass(id) {
    const entry = getSavedClasses().find(e => e.id === id);
    if (!entry) return;

    state.discipline = entry.discipline;
    syncDisciplineButtons(state.discipline);
    refreshFormForDiscipline();

    state.modality = entry.modality;
    state.accesorios = Array.isArray(entry.accesorios) ? entry.accesorios.slice() : [];
    state.upperFocus = entry.upperFocus || "mixto";
    state.level = entry.level;
    state.duration = entry.duration;

    $$("#modality-group .pill").forEach(p => p.classList.toggle("is-active", p.dataset.value === state.modality));
    refreshAccesorioPills();
    $$("#level-group .pill").forEach(p => p.classList.toggle("is-active", p.dataset.value === state.level));
    $$("#duration-group .pill").forEach(p => p.classList.toggle("is-active", Number(p.dataset.value) === state.duration));
    $("#objective-select").value = entry.render.objectiveId;
    $("#population-select").value = entry.render.populationId;
    refreshFocusVisibility();

    renderClass(entry.render);
    if (window.innerWidth < 900) {
      $("#output-panel").scrollIntoView({ behavior: "smooth" });
    }
  }

  function getRecentExerciseIds(count) {
    const ids = new Set();
    getSavedClasses().slice(0, count).forEach(entry => {
      entry.render.result.forEach(r => r.exercises.forEach(ex => ids.add(ex.id)));
    });
    return ids;
  }

  function renderSavedClassesList() {
    const list = $("#saved-classes-list");
    if (!list) return;
    const saved = getSavedClasses();

    const toggleBtn = $("#toggle-saved-classes");
    if (toggleBtn) toggleBtn.textContent = `📂 Mis clases guardadas (${saved.length})`;

    if (!saved.length) {
      list.innerHTML = `<p class="block-empty">Todavía no guardaste ninguna clase. Generá una y tocá "☆ Guardar clase".</p>`;
      return;
    }

    list.innerHTML = saved.map(entry => {
      const dateLabel = new Date(entry.savedAt).toLocaleDateString("es-AR", {
        day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
      });
      const discLabel = entry.discipline === "pilates" ? "Pilates" : "Yoga";
      return `
        <div class="saved-class-card">
          <div>
            <strong>${entry.render.objectiveLabel}</strong>
            <p class="saved-class-meta">${discLabel} · ${entry.duration} min · ${dateLabel}</p>
          </div>
          <div class="saved-class-actions">
            <button type="button" class="btn-mini btn-open-saved" data-id="${entry.id}">Abrir</button>
            <button type="button" class="btn-mini btn-remove btn-delete-saved" data-id="${entry.id}">✕</button>
          </div>
        </div>`;
    }).join("");
  }

  // ---------- ilustraciones de posición (genéricas, decorativas) ----------
  function getPositionIcon(position) {
    const p = (position || "").toLowerCase();
    const has = (...words) => words.some(w => p.includes(w));
    const wrap = (inner) => `<svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

    if (has("supino", "decúbito supino", "decubito supino")) {
      return wrap(`<circle cx="8" cy="20" r="3.4"/><path d="M11 20h14"/><path d="M25 20l6-5"/><path d="M25 20l6 3"/>`);
    }
    if (has("prono")) {
      return wrap(`<circle cx="8" cy="14" r="3.4"/><path d="M11 15h15"/><path d="M22 15l5 7"/><path d="M17 15l-3 8"/>`);
    }
    if (has("costado")) {
      return wrap(`<circle cx="9" cy="16" r="3.4"/><path d="M12 17h13"/><path d="M22 17l6 6"/><path d="M17 17l1 8"/>`);
    }
    if (has("cuadrupedia")) {
      return wrap(`<circle cx="9" cy="14" r="3.2"/><path d="M12 15h16"/><path d="M14 15v9"/><path d="M26 15v9"/>`);
    }
    if (has("rodillas")) {
      return wrap(`<circle cx="20" cy="8" r="3.4"/><path d="M20 11v10"/><path d="M20 21l-6 3v6"/><path d="M20 21l6 3v6"/><path d="M20 15l-6 3"/><path d="M20 15l6 3"/>`);
    }
    if (has("sentad")) {
      return wrap(`<circle cx="20" cy="8" r="3.4"/><path d="M20 11v9"/><path d="M20 20l-7 2"/><path d="M20 20l7 2"/><path d="M13 22v6"/><path d="M27 22v6"/>`);
    }
    if (has("pie")) {
      return wrap(`<circle cx="20" cy="7" r="3.4"/><path d="M20 10v13"/><path d="M20 15l-6 4"/><path d="M20 15l6 4"/><path d="M20 23l-4 9"/><path d="M20 23l4 9"/>`);
    }
    return wrap(`<circle cx="20" cy="20" r="10"/><path d="M16 20a4 4 0 0 1 8 0"/>`);
  }

  const IMAGE_FALLBACKS = {
    pilates: {
      supino: "images/exercises/pilates-004.png",
      prono: "images/exercises/pilates-015.png",
      costado: "images/exercises/pilates-036.png",
      cuadrupedia: "images/exercises/pilates-001.png",
      rodillas: "images/exercises/pilates-018.png",
      sentada: "images/exercises/pilates-006.png",
      pie: "images/exercises/pilates-002.png",
      default: "images/exercises/pilates-019.png",
    },
    yoga: {
      supino: "images/exercises/yoga-003.png",
      prono: "images/exercises/yoga-006.png",
      costado: "images/exercises/yoga-007.png",
      cuadrupedia: "images/exercises/yoga-006.png",
      rodillas: "images/exercises/yoga-006.png",
      sentada: "images/exercises/yoga-002.png",
      pie: "images/exercises/yoga-009.png",
      default: "images/exercises/yoga-003.png",
    },
  };

  function getExerciseImage(ex) {
    if (ex.image) return ex.image;
    const p = (ex.position || "").toLowerCase();
    const images = IMAGE_FALLBACKS[ex.discipline] || IMAGE_FALLBACKS.pilates;
    if (p.includes("supino")) return images.supino;
    if (p.includes("prono")) return images.prono;
    if (p.includes("costado")) return images.costado;
    if (p.includes("cuadrupedia")) return images.cuadrupedia;
    if (p.includes("rodill")) return images.rodillas;
    if (p.includes("sentad")) return images.sentada;
    if (p.includes("pie")) return images.pie;
    return images.default;
  }

  // ---------- coaching, progresión y adaptación por condición ----------
  // Si el ejercicio ya trae contenido cargado a mano (coaching/progression/adaptations en data.js),
  // se usa ese. Si no, se genera una versión razonable a partir de lo que sí existe (howTo/adaptation/avoid).
  function getCoaching(ex) {
    if (ex.coaching) return ex.coaching;
    return {
      verbal: ex.howTo || "Guiá la consigna con tus propias palabras, describiendo la acción concreta que tiene que suceder.",
      imagenMental: `Pensá en "${ex.name}" como un movimiento continuo y sin cortes, sin apurar el tramo final.`,
      tactil: "Pedí permiso y apoyá una mano cerca de la zona que más se activa, para que la alumna dirija ahí la atención.",
      pregunta: "¿En qué momento del movimiento sentís que se pierde el control o aparece tensión de más?",
    };
  }

  // ---------- diferencias por nivel ----------
  // Un mismo ejercicio puede servir para varios niveles; lo que cambia es la dosis (series, repeticiones,
  // respiraciones), el ritmo, el rango, la carga/apoyo y la variante. Todo se arma a partir de los datos
  // del ejercicio, así aplica a toda la base (y a los ejercicios propios) sin cargar texto a mano.
  const isCalmMoment = (ex) => ex.moment === 1 || ex.moment === 6 || (ex.modality || []).includes("restaurativo");

  const LEVEL_DOSE = {
    inicial:    { reps: "6 a 8 repeticiones",   breaths: "3 a 4 respiraciones", hold: "3 respiraciones",      tempo: "ritmo lento, con una pausa para reorganizarse entre repeticiones", range: "rango reducido y cómodo, priorizando la alineación", yogaTempo: "entrada y salida lentas, con una pausa entre lados" },
    intermedio: { reps: "8 a 10 repeticiones",  breaths: "5 a 6 respiraciones", hold: "5 respiraciones",      tempo: "ritmo continuo y controlado",                                      range: "recorrido completo", yogaTempo: "transiciones continuas, sincronizadas con la respiración" },
    avanzado:   { reps: "10 a 12 repeticiones", breaths: "6 a 8 respiraciones", hold: "6 a 8 respiraciones",  tempo: "ritmo fluido, con una pausa de 2 tiempos al final del recorrido",  range: "recorrido completo, con más exigencia de control", yogaTempo: "transiciones fluidas, sosteniendo la postura activa hasta la última respiración" },
  };

  // Si el "cómo explicarlo" ya trae un rango ("6 a 8 repeticiones"), inicial toma el mínimo y avanzado el máximo.
  function levelAmount(ex, level) {
    const m = (ex.howTo || "").match(/(\d+)\s*a\s*(\d+)\s*(repeticiones|respiraciones|alternancias|ciclos respiratorios|ciclos|círculos|empujes|rotaciones|exhalaciones)(\s+por lado)?/);
    if (m) {
      const [, lo, hi, rawUnit, perSide = ""] = m;
      const unit = rawUnit + perSide;
      if (level === "inicial") return `${lo} ${unit}`;
      if (level === "avanzado") return `${hi} ${unit}`;
      return `${lo} a ${hi} ${unit}`;
    }
    const dose = LEVEL_DOSE[level];
    if (isCalmMoment(ex)) return dose.breaths;
    return ex.discipline === "yoga" ? `sostener ${dose.hold}` : dose.reps;
  }

  function levelSetup(ex, level) {
    const modality = state.modality !== "mixta" && (ex.modality || []).includes(state.modality) ? state.modality : (ex.modality || [])[0];
    if (modality === "reformer") {
      if (level === "inicial") return "Resorte rojo o verde: el carro se mueve menos y da más estabilidad.";
      if (level === "intermedio") return "Resorte azul o rojo.";
      return (ex.objective || []).includes("tren-superior")
        ? "Un color más pesado para sumar fuerza, sin perder la organización escapular."
        : "Un color más liviano: el carro queda más inestable y exige más control del centro.";
    }
    if (modality === "mat") {
      if (level === "inicial") return "Con más base de apoyo: cabeza apoyada, rodillas flexionadas o manos en el piso según la posición.";
      if (level === "intermedio") return "Versión estándar del ejercicio.";
      return "Con menos apoyo: palancas más largas (piernas o brazos extendidos) o sin ayuda de las manos.";
    }
    // yoga
    if (level === "inicial") return "Usá apoyos (bloques, manta o pared) y entrá solo hasta la primera sensación de estiramiento.";
    if (level === "intermedio") return "Postura completa, con apoyos solo si hacen falta.";
    return isCalmMoment(ex)
      ? "Más tiempo de permanencia, soltando un poco más en cada exhalación."
      : "Sin apoyos, buscando la expresión completa de la postura y transiciones más fluidas.";
  }

  const EQUIPMENT_BY_LEVEL = {
    band:          { inicial: "Banda larga o de baja resistencia.",                  avanzado: "Acortá la banda o usá una de mayor resistencia." },
    "magic-circle":{ inicial: "Presión suave y sostenida sobre el círculo.",         avanzado: "Presión sostenida con pequeños pulsos al final del recorrido." },
    "soft-ball":   { inicial: "La pelota como guía de alineación, con presión suave.", avanzado: "Presión constante sobre la pelota durante todo el recorrido." },
    fitball:       { inicial: "Pies bien separados en el piso para ampliar la base.", avanzado: "Base más angosta o un pie elevado para sumar inestabilidad." },
    blocks:        { inicial: "Bloques en su altura máxima y cerca del cuerpo.",      avanzado: "Bloques más bajos, o sin bloques si el rango lo permite." },
    "foam-roller": { inicial: "Rodillo bien apoyado y con base amplia.",              avanzado: "Menos puntos de apoyo sobre el rodillo para sumar inestabilidad." },
  };

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const endDot = (s) => (s && !/[.!?]$/.test(s.trim()) ? s.trim() + "." : s);

  // Cada línea es {label, text} para poder mostrarla con su rótulo en la tarjeta.
  function getLevelGuide(ex, level = state.level) {
    const dose = LEVEL_DOSE[level] || LEVEL_DOSE.intermedio;
    const lines = [];
    lines.push({ label: "Dosis", text: `${capitalize(levelAmount(ex, level))} · ${isCalmMoment(ex) ? (level === "inicial" ? "respiración guiada y sin apuro" : level === "avanzado" ? "más tiempo de permanencia" : "respiración pausada") : ex.discipline === "yoga" ? dose.yogaTempo : `${dose.tempo}, ${dose.range}`}.` });

    // un ejercicio cargado como mat y reformer no muestra resortes en una clase de mat
    if (ex.resortes && state.modality !== "mat") {
      // escala del estudio: amarillo < azul < rojo < verde. Con verde no hay color más pesado,
      // y en "carro firme" o barra fija el resorte no se toca.
      const isMax = /^verde/i.test(ex.resortes);
      const isFixed = /trabado|firme|no carga|torre/i.test(ex.resortes);
      const wantsStrength = (ex.patron || []).some(p => p === "empuje" || p === "traccion");
      const tip = isFixed ? ""
        : level === "inicial" ? (isMax ? "" : " Si el carro se mueve de más, pasá al color siguiente (más pesado).")
        : level === "avanzado" ? (wantsStrength ? (isMax ? "" : " Para más fuerza, subí un color (más pesado).") : " Para más control de centro, bajá un color (más liviano).")
        : "";
      lines.push({ label: "Resortes", text: endDot(ex.resortes) + tip });
    } else {
      lines.push({ label: "Armado", text: levelSetup(ex, level) });
    }

    (ex.equipment || []).forEach(eq => {
      const tip = EQUIPMENT_BY_LEVEL[eq]?.[level];
      if (tip) lines.push({ label: "Elemento", text: tip });
    });

    const coaching = getCoaching(ex);
    const cues = [coaching.verbal, ex.cue].filter(Boolean);
    if (cues.length) lines.push({ label: "Cue", text: cues.slice(0, 2).map(endDot).join(" ") });

    if (level === "inicial" && ex.regresion) lines.push({ label: "Regresión", text: endDot(ex.regresion) });
    if (level === "intermedio" && ex.progresion) lines.push({ label: "Cuando esté estable", text: endDot(ex.progresion) });
    if (level === "avanzado" && ex.progresion) lines.push({ label: "Progresión", text: endDot(ex.progresion) });
    return lines;
  }
  const levelGuideText = (ex, level) => getLevelGuide(ex, level).map(l => `${l.label}: ${l.text}`);

  // series por nivel: inicial una menos, avanzado una más (salvo preparación y cierre, que no suman intensidad)
  function levelSeries(ex, level = state.level) {
    const base = ex.seriesDefault || 1;
    if (isCalmMoment(ex)) return base;
    if (level === "inicial") return Math.max(1, base - 1);
    if (level === "avanzado") return base + 1;
    return base;
  }

  // copia del ejercicio con la dosis del nivel: así cambiar series en una clase no modifica la base
  const withLevel = (ex) => ({ ...ex, seriesDefault: levelSeries(ex) });

  // ---------- prioridades para el sorteo ----------
  // El nivel es "nivel mínimo": avanzado puede usar cualquier ejercicio, pero prioriza los de su nivel,
  // así inicial, intermedio y avanzado no traen la misma clase.
  const LEVEL_INDEX = { inicial: 0, intermedio: 1, avanzado: 2 };
  const PROP_ACC = ["banda", "aro", "pelota", "fitball", "bloques", "foam_roller"];

  function exerciseWeight(ex, ctx) {
    const dist = (LEVEL_INDEX[ctx.level] ?? 1) - (LEVEL_INDEX[ex.nivelMin] ?? 0);
    let w = [3, 1.2, 0.5][Math.max(0, Math.min(2, dist))];

    // Reformer + tren superior sin accesorio elegido: lo propio del reformer (correas en manos,
    // arrodillada, de pie sobre el carro) va antes que la pelota, el aro o la banda.
    if (ctx.modality === "reformer" && ctx.objective === "tren-superior" && !ctx.accesorios.length) {
      const acc = ex.accesorio || [];
      const hasProp = acc.some(a => PROP_ACC.includes(a));
      if (!hasProp && (acc.includes("correas_manos") || ["arrodillado", "de_pie_en_carro"].includes(ex.posicion))) w *= 3;
      else if (hasProp) w *= 0.35;
    }
    // enfoque de tren superior: en los bloques que no son el principal, el patrón elegido tiene prioridad
    if (ctx.focusPatron && (ex.patron || []).includes(ctx.focusPatron)) w *= 3;
    if (ctx.favorites && ctx.favorites.has(ex.id)) w *= 2.5;
    return w;
  }

  function weightedShuffle(pool, ctx) {
    return pool
      .map(ex => ({ ex, key: Math.pow(Math.random(), 1 / exerciseWeight(ex, ctx)) }))
      .sort((a, b) => b.key - a.key)
      .map(o => o.ex);
  }

  // Principio general de seguridad por condición + cómo aplicarlo en el ejercicio puntual.
  // Se usa como base para CUALQUIER ejercicio; si el ejercicio tiene "adaptations" cargado
  // a mano para esa condición, ese contenido específico tiene prioridad sobre este genérico.
  const CONDITION_GUIDANCE = {
    "Osteoporosis / osteopenia": {
      principle: "evitar la flexión de columna combinada con rotación y cualquier carga de impacto",
      suggestion: "trabajá dentro de un rango más neutro de columna, sin buscar el máximo de flexión ni de rotación, y con apoyos que reduzcan la carga articular",
    },
    "Hernia de disco lumbar": {
      principle: "evitar la flexión lumbar profunda y la rotación forzada bajo carga",
      suggestion: "reducí el rango de flexión hacia adelante, mantené la columna más neutra y priorizá el control abdominal antes que la amplitud del movimiento",
    },
    "Embarazo / posparto": {
      principle: "evitar la posición boca abajo, la presión abdominal directa y las torsiones cerradas",
      suggestion: "adaptá la posición (de costado, sentada o de pie según convenga), reducí la intensidad y priorizá la respiración por sobre el rango de movimiento",
    },
    "Problemas de cadera / prótesis": {
      principle: "evitar el rango extremo de flexión, rotación interna o cruzar la línea media de cadera",
      suggestion: "trabajá dentro de un rango cómodo y menor, sumando apoyos (bloques, silla, pared) que sostengan la articulación",
    },
    "Post-cirugía de rodilla": {
      principle: "evitar la flexión profunda de rodilla y la carga con pivote sobre la rodilla flexionada",
      suggestion: "reducí el rango de flexión de rodilla, trabajá con menor carga o apoyo adicional, y evitá cualquier torsión con el pie fijo",
    },
    "Hipermovilidad": {
      principle: "evitar buscar el rango máximo o bloquear las articulaciones al final del recorrido",
      suggestion: "sostené el movimiento dentro de un rango controlado, activando el músculo en vez de apoyarte en el límite articular",
    },
    "Fibromialgia": {
      principle: "evitar sostenidos largos, cargas altas o cambios bruscos de ritmo que puedan generar sobrecarga",
      suggestion: "reducí el tiempo de sostén y la intensidad, sumá pausas y dejá que la alumna regule el ritmo según su energía del día",
    },
    "Disfunción de suelo pélvico": {
      principle: "evitar retener el aire o generar presión intraabdominal alta (maniobra de Valsalva)",
      suggestion: "coordiná el esfuerzo con una exhalación activa y reducí la intensidad o el rango si aparece sensación de presión hacia abajo",
    },
  };

  function getAdaptationForCondition(ex, tag) {
    // 1) contenido específico cargado a mano para este ejercicio y esta condición puntual
    if (ex.adaptations && ex.adaptations[tag]) return ex.adaptations[tag];

    const guidance = CONDITION_GUIDANCE[tag];
    const taggedHere = (ex.avoid || []).includes(tag);

    // 2) el ejercicio ya trae una adaptación general y esta condición es la que la motiva
    const specificNote = taggedHere && ex.adaptation
      ? ` Para este ejercicio en particular: ${ex.adaptation.charAt(0).toLowerCase()}${ex.adaptation.slice(1)}`
      : "";

    if (!guidance) {
      return ex.adaptation || "No hay un ajuste específico registrado; individualizá el rango y la intensidad, y ante cualquier duda consultá con el profesional tratante de la alumna.";
    }

    // 3) siempre generamos una adaptación aplicable a "este" ejercicio, combinando el
    // principio general de la condición con el nombre del ejercicio que se está mostrando
    return `Para esta condición, en general conviene ${guidance.principle}. En "${ex.name}": ${guidance.suggestion}.${specificNote}`;
  }

  // ---------- render form options depending on discipline ----------
  function renderPillGroup(containerId, options, activeValue, multi = false) {
    const el = $(containerId);
    el.innerHTML = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill" + ((multi ? false : opt.id === activeValue) ? " is-active" : "");
      btn.dataset.value = opt.id;
      btn.textContent = opt.label;
      el.appendChild(btn);
    });
  }

  function renderSelect(selectId, options) {
    const el = $(selectId);
    el.innerHTML = options.map(o => `<option value="${o.id}">${o.label}</option>`).join("");
  }

  // Accesorios ofrecidos: solo los que existen en la base para esa disciplina y modalidad,
  // en un orden fijo (primero lo propio del reformer, después los elementos).
  const ACC_ORDER = ["correas_manos", "correas_pies", "barra", "box", "carro", "torre", "ninguno", "banda", "aro", "pelota", "fitball", "bloques", "foam_roller"];
  function accesoriosFor(discipline, modality) {
    const present = new Set();
    EXERCISES.forEach(ex => {
      if (ex.discipline !== discipline) return;
      if (modality && modality !== "mixta" && !(ex.modality || []).includes(modality)) return;
      // en mat no se ofrecen las configuraciones del reformer (algunos ejercicios sirven para las dos modalidades)
      (ex.accesorio || []).forEach(a => { if (!(modality === "mat" && SETUP_ACC.includes(a))) present.add(a); });
    });
    return ACC_ORDER.filter(a => present.has(a)).map(id => ({ id, label: ACCESORIO_LABELS[id] || id }));
  }

  function refreshAccesorioPills() {
    const options = accesoriosFor(state.discipline, state.modality);
    state.accesorios = state.accesorios.filter(a => options.some(o => o.id === a));
    renderPillGroup("#accesorio-group", options, null, true);
    state.accesorios.forEach(a => $(`#accesorio-group .pill[data-value="${a}"]`)?.classList.add("is-active"));
  }

  function refreshFocusVisibility() {
    const show = state.discipline === "pilates" && $("#objective-select")?.value === "tren-superior";
    $("#focus-fieldset")?.classList.toggle("hidden", !show);
    if (!show) return;
    renderPillGroup("#focus-group", UPPER_FOCUS, state.upperFocus);
  }

  function refreshExAccesorioPills() {
    const exModality = $("#ex-modality-group .pill.is-active")?.dataset.value;
    renderPillGroup("#ex-accesorio-group", accesoriosFor(state.discipline, exModality), null, true);
    $("#ex-resortes-label")?.classList.toggle("hidden", exModality !== "reformer");
  }

  function refreshFormForDiscipline() {
    const d = state.discipline;
    renderPillGroup("#modality-group", MODALITIES[d], null);
    state.modality = MODALITIES[d][0].id;
    $(`#modality-group .pill[data-value="${state.modality}"]`).classList.add("is-active");
    state.accesorios = [];
    refreshAccesorioPills();

    renderSelect("#objective-select", OBJECTIVES[d]);
    renderSelect("#population-select", POPULATIONS);
    state.upperFocus = "mixto";
    refreshFocusVisibility();

    // exercise-add form groups: "mixta" no aplica a un ejercicio individual (ver filterPool)
    renderPillGroup("#ex-modality-group", MODALITIES[d].filter(m => m.id !== "mixta"), null);
    renderPillGroup("#ex-moment-group", BLOCKS.map(b => ({ id: b.id, label: `${b.id}. ${b.name}` })), null, true);
    renderPillGroup("#ex-objective-group", OBJECTIVES[d], null, true);
    renderPillGroup("#ex-avoid-group", AVOID_TAGS.map(t => ({ id: t, label: t })), null, true);
    renderPillGroup("#ex-patron-group", Object.keys(PATRON_LABELS).map(id => ({ id, label: PATRON_LABELS[id] })), null, true);
    renderSelect("#ex-posicion-select", POSICION_ORDER.map(id => ({ id, label: POSICION_LABELS[id] })));
    refreshExAccesorioPills();
  }

  // ---------- pill click handling (event delegation) ----------
  document.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    const group = pill.parentElement;
    const isMulti = group.classList.contains("multi");

    if (isMulti) {
      pill.classList.toggle("is-active");
    } else {
      Array.from(group.children).forEach(c => c.classList.remove("is-active"));
      pill.classList.add("is-active");
    }

    // sync state for main form
    if (group.id === "modality-group") {
      state.modality = pill.dataset.value;
      refreshAccesorioPills();
    }
    if (group.id === "ex-modality-group") refreshExAccesorioPills();
    if (group.id === "accesorio-group") state.accesorios = $$("#accesorio-group .pill.is-active").map(p => p.dataset.value);
    if (group.id === "focus-group") state.upperFocus = pill.dataset.value;
    if (group.id === "level-group") state.level = pill.dataset.value;
    if (group.id === "duration-group") state.duration = Number(pill.dataset.value);
  });

  // ---------- discipline toggle (sincroniza la barra principal y la barra pegajosa) ----------
  function syncDisciplineButtons(discipline) {
    $$(".discipline-btn").forEach(b => {
      const active = b.dataset.discipline === discipline;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  $$(".discipline-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.discipline = btn.dataset.discipline;
      state.accesorios = [];
      syncDisciplineButtons(state.discipline);
      refreshFormForDiscipline();
      lastRender = null;
      $("#output-content").classList.add("hidden");
      $("#output-empty").classList.remove("hidden");
    });
  });

  // ---------- barra pegajosa: aparece cuando el hero sale de vista ----------
  const heroSentinel = document.getElementById("hero-sentinel");
  if (heroSentinel && "IntersectionObserver" in window) {
    const stickyObserver = new IntersectionObserver(([entry]) => {
      $("#sticky-bar").classList.toggle("is-visible", !entry.isIntersecting);
    }, { threshold: 0 });
    stickyObserver.observe(heroSentinel);
  }

  // ---------- generate class ----------
  // Filtros DUROS: disciplina, bloque, modalidad, nivel (mínimo), accesorio, población, ocultos.
  // El objetivo también es duro en los bloques de trabajo (2 a 5). En preparación (1) y cierre (6)
  // se prefieren los del objetivo y, si no alcanzan, se completa con movilidad / vuelta a la calma
  // general del mismo nivel y accesorio: esos bloques cumplen una función, no trabajan el objetivo.
  // Nunca se relaja el nivel ni el accesorio: si no hay suficientes, la clase sale más corta con aviso.
  //
  // "mixta" es un tipo de CLASE (combinar mat y reformer), no una etiqueta de un ejercicio:
  // se resuelve acá como comodín.
  const SETUP_ACC = ["correas_manos", "correas_pies", "barra", "box", "carro", "torre"];

  function matchesAccesorio(ex, selected) {
    if (!selected.length) return true;
    const acc = ex.accesorio || [];
    // los elementos sueltos (banda, aro, pelota...) tienen que estar todos elegidos;
    // las configuraciones del reformer (correas, barra, box) alcanza con que coincida una
    const props = acc.filter(a => !SETUP_ACC.includes(a));
    if (props.some(a => !selected.includes(a))) return false;
    return acc.some(a => selected.includes(a));
  }

  function fitsPopulation(ex, populationId) {
    if (!populationId || populationId === "general") return true;
    return ex.population ? ex.population.includes(populationId)
      : !(populationId === "embarazo" && (ex.avoid || []).includes("Embarazo / posparto"));
  }

  function filterPool({ discipline, moment, modality, level, objective, populationId, accesorios, excludeIds = new Set(), excludeNames = new Set() }) {
    const hidden = getHidden();
    const base = allExercises().filter(ex =>
      ex.discipline === discipline &&
      ex.moment === moment &&
      (modality === "mixta" || (ex.modality || []).includes(modality)) &&
      (ex.level || []).includes(level) &&
      matchesAccesorio(ex, accesorios) &&
      fitsPopulation(ex, populationId) &&
      !hidden.has(ex.id) &&
      !excludeIds.has(ex.id) &&
      !excludeNames.has(ex.name)
    );
    const withObjective = base.filter(ex => (ex.objective || []).includes(objective));
    const isFrame = moment === 1 || moment === 6;
    return { pool: withObjective, general: isFrame ? base.filter(ex => !withObjective.includes(ex)) : [] };
  }

  // cantidad de ejercicios coherente con la duración: ~3,6 min por ejercicio (50 min ≈ 14)
  function exerciseCountFor(duration) {
    return Math.max(8, Math.round(duration / 3.6));
  }

  function allocateCounts(blocks, total) {
    const weightSum = blocks.reduce((s, b) => s + b.weight, 0);
    const counts = blocks.map(b => Math.max(1, Math.round((b.weight / weightSum) * total)));
    // ajustar al total exacto sumando o restando en el bloque principal
    let diff = total - counts.reduce((s, n) => s + n, 0);
    const mainIdx = Math.max(0, blocks.findIndex(b => b.id === 3));
    counts[mainIdx] = Math.max(1, counts[mainIdx] + diff);
    return counts;
  }

  // minutos por bloque que suman exactamente la duración (método del mayor resto, mínimo 3 por bloque)
  function allocateMinutes(blocks, duration) {
    const weightSum = blocks.reduce((s, b) => s + b.weight, 0);
    const raw = blocks.map(b => Math.max(3, (b.weight / weightSum) * duration));
    const mins = raw.map(Math.floor);
    let left = duration - mins.reduce((s, n) => s + n, 0);
    raw.map((r, i) => ({ i, frac: r - Math.floor(r) }))
      .sort((a, b) => b.frac - a.frac)
      .forEach(({ i }) => { if (left > 0) { mins[i] += 1; left -= 1; } });
    return mins;
  }

  // orden dentro del bloque: en reformer se agrupa por configuración del carro (barra, correas en pies,
  // correas en manos, box) para no cambiar resortes a cada rato; después por posición
  // (supino → costado → prono → plancha → cuadrupedia → arrodillada → sentada → de pie)
  function sortForFlow(list) {
    const posRank = (ex) => { const i = POSICION_ORDER.indexOf(ex.posicion); return i < 0 ? 99 : i; };
    const modRank = (ex) => ((ex.modality || []).includes("reformer") ? 1 : 0);
    return list.slice().sort((a, b) =>
      modRank(a) - modRank(b) ||
      (a.setupGroup || "").localeCompare(b.setupGroup || "") ||
      posRank(a) - posRank(b));
  }

  function generationContext(objectiveId, populationId) {
    const focus = state.discipline === "pilates" && objectiveId === "tren-superior"
      ? (UPPER_FOCUS.find(f => f.id === state.upperFocus) || UPPER_FOCUS[0]) : UPPER_FOCUS[0];
    return {
      discipline: state.discipline, modality: state.modality, level: state.level,
      objective: objectiveId, populationId, accesorios: state.accesorios.slice(),
      focus, favorites: getFavorites(),
    };
  }

  // elige `count` ejercicios para un bloque. Con un enfoque de tren superior, en los bloques
  // principales (3 y 4) al menos dos tercios salen de ese patrón si la base lo permite.
  function pickForBlock(block, count, ctx, used) {
    const { pool, general } = filterPool({
      discipline: ctx.discipline, moment: block.id, modality: ctx.modality, level: ctx.level,
      objective: ctx.objective, populationId: ctx.populationId, accesorios: ctx.accesorios,
      excludeIds: used.ids, excludeNames: used.names,
    });
    const focusPatron = ctx.focus.patron;
    const isMain = block.id === 3 || block.id === 4;
    const shuffleCtx = { ...ctx, focusPatron: isMain ? null : focusPatron };
    let picked = [];
    let focusShort = false;

    if (focusPatron && isMain) {
      const inFocus = weightedShuffle(pool.filter(ex => (ex.patron || []).includes(focusPatron)), shuffleCtx);
      const needed = Math.max(1, Math.ceil(count * 2 / 3));
      picked = inFocus.slice(0, count);
      if (picked.length < needed) focusShort = true;
      if (picked.length < count) {
        const rest = weightedShuffle(pool.filter(ex => !picked.includes(ex)), shuffleCtx);
        picked = picked.concat(rest.slice(0, count - picked.length));
      }
    } else {
      picked = weightedShuffle(pool, shuffleCtx).slice(0, count);
    }

    let generalCount = 0;
    if (picked.length < count && general.length) {
      const extra = weightedShuffle(general, shuffleCtx).slice(0, count - picked.length);
      generalCount = extra.length;
      picked = picked.concat(extra);
    }

    // sin repetir: ni el mismo id ni el mismo nombre (los propios guardan una copia por bloque)
    const unique = [];
    picked.forEach(ex => {
      if (used.ids.has(ex.id) || used.names.has(ex.name)) return;
      used.ids.add(ex.id); used.names.add(ex.name);
      unique.push(withLevel(ex));
    });

    return { exercises: unique, requested: count, short: unique.length < count, focusShort, generalCount };
  }

  function buildClass() {
    const objectiveId = $("#objective-select").value;
    const objectiveLabel = OBJECTIVES[state.discipline].find(o => o.id === objectiveId)?.label || objectiveId;
    const populationId = $("#population-select").value;
    const populationLabel = POPULATIONS.find(p => p.id === populationId)?.label || populationId;
    const includeWarmup = $("#include-warmup").checked;

    const blocksToUse = BLOCKS.filter(b => includeWarmup || !b.optional);
    const blockMinutes = allocateMinutes(blocksToUse, state.duration);
    const counts = allocateCounts(blocksToUse, exerciseCountFor(state.duration));

    const avoidRecent = $("#avoid-recent")?.checked;
    const recentIds = avoidRecent ? getRecentExerciseIds(3) : new Set();
    const ctx = generationContext(objectiveId, populationId);
    const used = { ids: new Set(recentIds), names: new Set() };

    const result = blocksToUse.map((block, i) => {
      const minutes = blockMinutes[i];
      const pick = pickForBlock(block, counts[i], ctx, used);
      return { block, minutes, ...pick, exercises: sortForFlow(pick.exercises) };
    });

    renderClass({ objectiveId, objectiveLabel, populationId, populationLabel, result, focusId: ctx.focus.id });
  }

  // ---------- extender clase sin repetir ejercicios ----------
  function extendClass() {
    if (!lastRender) return;
    state.duration += 20;

    const { objectiveId, objectiveLabel, populationId, populationLabel } = lastRender;
    const includeWarmup = $("#include-warmup").checked;
    const blocksToUse = BLOCKS.filter(b => includeWarmup || !b.optional);
    const blockMinutes = allocateMinutes(blocksToUse, state.duration);
    const extraCounts = allocateCounts(blocksToUse, exerciseCountFor(20));

    const ctx = generationContext(objectiveId, populationId);
    const used = {
      ids: new Set(lastRender.result.flatMap(r => r.exercises.map(ex => ex.id))),
      names: new Set(lastRender.result.flatMap(r => r.exercises.map(ex => ex.name))),
    };

    const result = blocksToUse.map((block, i) => {
      const minutes = blockMinutes[i];
      const previous = lastRender.result.find(r => r.block.id === block.id);
      const pick = pickForBlock(block, extraCounts[i], ctx, used);
      const exercises = sortForFlow((previous ? previous.exercises : []).concat(pick.exercises));
      return {
        block, minutes, exercises,
        requested: (previous?.requested || 0) + extraCounts[i],
        short: exercises.length < (previous?.requested || 0) + extraCounts[i],
        focusShort: previous?.focusShort || pick.focusShort,
        generalCount: (previous?.generalCount || 0) + pick.generalCount,
        noExtra: !!previous && exercises.length > 0 && pick.exercises.length === 0,
      };
    });

    renderClass({ objectiveId, objectiveLabel, populationId, populationLabel, result, focusId: ctx.focus.id });
  }

  // ---------- descargar clase en PDF ----------
  const IS_MOBILE =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPad con iPadOS

  // En mobile las fotos con loading="lazy" que no están en pantalla no se cargan,
  // y saldrían vacías en el PDF: las forzamos a cargar antes de capturar.
  function loadAllImages(root) {
    const imgs = Array.from(root.querySelectorAll("img"));
    return Promise.all(imgs.map(img => {
      img.loading = "eager";
      if (img.complete && img.naturalWidth) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
        setTimeout(resolve, 8000);
      });
    }));
  }

  // Los celulares tienen un tope de tamaño de canvas (~16 millones de píxeles en iOS);
  // si se pasa, el canvas sale en blanco. Ajustamos la escala para no superarlo.
  function safeCanvasScale(el) {
    const w = el.scrollWidth || 1;
    const h = el.scrollHeight || 1;
    const maxArea = IS_MOBILE ? 14_000_000 : 60_000_000;
    const maxSide = IS_MOBILE ? 16_000 : 32_000;
    const byArea = Math.sqrt(maxArea / (w * h));
    const bySide = maxSide / Math.max(w, h);
    return Math.max(0.5, Math.min(2, byArea, bySide));
  }

  // iOS/Android no respetan la descarga "invisible" de pdf.save().
  // Tras generar el PDF, el botón pasa a ser un link real que la persona toca
  // (un toque nuevo sí habilita abrir/compartir/descargar en Safari).
  function offerPdfOnMobile(btn, blob, filename) {
    const url = URL.createObjectURL(blob);
    const file = typeof File !== "undefined" ? new File([blob], filename, { type: "application/pdf" }) : null;
    const canShare = file && navigator.canShare && navigator.canShare({ files: [file] });

    const link = document.createElement("a");
    link.className = btn.className;
    link.id = "btn-pdf-ready";
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = canShare ? "↓ Guardar / compartir PDF" : "↓ Abrir PDF";
    link.addEventListener("click", e => {
      if (!canShare) return; // deja que el link abra el PDF
      e.preventDefault();
      navigator.share({ files: [file], title: filename }).catch(err => {
        if (err && err.name !== "AbortError") window.open(url, "_blank");
      });
    });
    btn.replaceWith(link);
  }

  function downloadPDF() {
    const btn = $("#btn-pdf");
    const target = $("#output-content");
    if (!btn || !target) return;
    if (typeof html2canvas === "undefined" || !window.jspdf) {
      alert("No se pudo cargar el generador de PDF. Revisá tu conexión y probá de nuevo.");
      return;
    }
    const original = btn.textContent;
    btn.textContent = "Generando…";
    btn.disabled = true;
    const filename = `clase-${state.discipline}-${Date.now()}.pdf`;
    let ok = false;

    loadAllImages(target)
      .then(() => html2canvas(target, {
        scale: safeCanvasScale(target),
        backgroundColor: "#FBF1EE",
        useCORS: true,
      }))
      .then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        // JPEG pesa mucho menos que PNG: evita quedarse sin memoria en el celular.
        const imgData = canvas.toDataURL("image/jpeg", 0.88);

        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        if (IS_MOBILE) {
          offerPdfOnMobile(btn, pdf.output("blob"), filename);
        } else {
          pdf.save(filename);
        }
        ok = true;
      })
      .catch(err => {
        console.error("Error generando PDF:", err);
        alert("No se pudo generar el PDF. Probá de nuevo.");
      })
      .finally(() => {
        if (!ok || !IS_MOBILE) {
          btn.textContent = original;
          btn.disabled = false;
        }
      });
  }

  // ---------- helpers de edición en vivo de la clase ----------
  function findEntry(blockId) {
    return lastRender.result.find(r => r.block.id === blockId);
  }

  function swapExercise(blockId, idx) {
    const entry = findEntry(blockId);
    if (!entry) return;
    const current = entry.exercises[idx];
    const excludeIds = new Set(lastRender.result.flatMap(r => r.exercises.map(ex => ex.id)));
    const excludeNames = new Set(lastRender.result.flatMap(r => r.exercises.map(ex => ex.name)));
    const ctx = generationContext(lastRender.objectiveId, lastRender.populationId);
    const { pool, general } = filterPool({
      discipline: state.discipline, moment: blockId, modality: state.modality, level: state.level,
      objective: lastRender.objectiveId, populationId: lastRender.populationId, accesorios: ctx.accesorios,
      excludeIds, excludeNames,
    });
    // preferimos un reemplazo con la misma configuración y posición, para no romper el orden del bloque
    const candidates = weightedShuffle(pool.length ? pool : general, ctx);
    const same = candidates.find(ex => ex.setupGroup === current?.setupGroup && ex.posicion === current?.posicion);
    const options = same ? [same] : candidates;
    if (!options.length) {
      alert("No hay otro ejercicio disponible para reemplazar este con los filtros actuales. Probá ampliando accesorios o nivel.");
      return;
    }
    entry.exercises[idx] = withLevel(options[0]);
    entry.exercises = sortForFlow(entry.exercises);
    renderClass(lastRender);
  }

  // "Nunca mostrar": lo oculta para siempre (se puede restaurar en Mis ejercicios) y lo reemplaza
  function hideExercise(blockId, idx) {
    const entry = findEntry(blockId);
    const ex = entry?.exercises[idx];
    if (!ex) return;
    if (!confirm(`¿Ocultar "${ex.name}" de todas tus próximas clases? Lo podés volver a mostrar desde "Mis ejercicios".`)) return;
    toggleInSet(HIDDEN_KEY, ex.id);
    renderHiddenBox();
    swapExercise(blockId, idx);
  }

  function toggleFavorite(blockId, idx, btn) {
    const ex = findEntry(blockId)?.exercises[idx];
    if (!ex) return;
    const isFav = toggleInSet(FAV_KEY, ex.id);
    btn.classList.toggle("is-active", isFav);
    btn.textContent = isFav ? "★ Favorito" : "☆ Favorito";
  }

  function removeExercise(blockId, idx) {
    const entry = findEntry(blockId);
    if (!entry) return;
    entry.exercises.splice(idx, 1);
    renderClass(lastRender);
  }

  function quickAddExercise(blockId, name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    const entry = findEntry(blockId);
    if (!entry) return;
    const ex = {
      id: "custom-" + Date.now(),
      discipline: state.discipline,
      name: trimmed,
      description: trimmed,
      position: "",
      modality: [state.modality === "mixta" ? MODALITIES[state.discipline][0].id : state.modality],
      equipment: [],
      accesorio: state.accesorios.length ? state.accesorios.slice() : undefined,
      nivelMin: state.level,
      moment: blockId,
      objective: [lastRender.objectiveId],
      seriesDefault: 1,
    };
    saveCustomExercise(ex);
    entry.exercises.push(window.enrichExercise ? window.enrichExercise({ ...ex }) : ex);
    renderClass(lastRender);
  }

  function changeSeries(blockId, idx, delta) {
    const entry = findEntry(blockId);
    if (!entry) return;
    const ex = entry.exercises[idx];
    if (!ex) return;
    ex.seriesDefault = Math.max(1, (ex.seriesDefault || 1) + delta);
    const el = $(`.exercise-card[data-block="${blockId}"][data-idx="${idx}"] .series-count`);
    if (el) el.textContent = `${ex.seriesDefault} series`;
  }

  // ---------- gráfico real de reparto de tiempo por bloque ----------
  const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"];

  function renderTimeDonut(result) {
    const total = result.reduce((s, r) => s + r.minutes, 0) || 1;
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const segments = result.map((r, i) => {
      const frac = r.minutes / total;
      const segLen = frac * circumference;
      const dashoffset = -offset;
      offset += segLen;
      return `<circle cx="42" cy="42" r="${radius}" fill="none" stroke="${CHART_COLORS[i % CHART_COLORS.length]}" stroke-width="11" stroke-dasharray="${segLen} ${circumference - segLen}" stroke-dashoffset="${dashoffset}" />`;
    }).join("");

    const legend = result.map((r, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
        <span>${r.block.name} · ${r.minutes} min</span>
      </div>`).join("");

    return `
      <div class="time-donut-row">
        <svg viewBox="0 0 84 84" width="80" height="80" class="time-donut">
          <g transform="rotate(-90 42 42)">${segments}</g>
          <text x="42" y="45" text-anchor="middle" class="time-donut-total">${total}</text>
          <text x="42" y="57" text-anchor="middle" class="time-donut-unit">MIN</text>
        </svg>
        <div class="time-donut-legend">${legend}</div>
      </div>`;
  }

  // ---------- render de una tarjeta de ejercicio ----------
  function renderExerciseCard(ex, blockId, idx, isPrepOriented, minutesEach) {
    const coaching = getCoaching(ex);
    const levelLabel = LEVEL_LABELS[state.level] || state.level;
    const imageSrc = getExerciseImage(ex);
    const isFav = getFavorites().has(ex.id);
    const metaChips = [
      minutesEach ? `≈ ${minutesEach} min` : "",
      ...(ex.accesorio || []).filter(a => a !== "ninguno").map(a => ACCESORIO_LABELS[a] || a),
      ...(ex.patron || []).slice(0, 2).map(p => PATRON_LABELS[p] || p),
    ].filter(Boolean);

    return `
      <div class="exercise-card" data-block="${blockId}" data-idx="${idx}">
        <div class="exercise-illustration">
          <img src="${imageSrc}" alt="${ex.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="exercise-illustration-icon" style="display:none;">${getPositionIcon(ex.position)}</div>
        </div>
        <div class="exercise-body">
          <div class="exercise-title-row">
            <h5>${ex.name}</h5>
            ${ex.position ? `<span class="position">${ex.position}</span>` : ""}
            ${isPrepOriented ? `<span class="badge-prep">PREP ORIENTADA</span>` : ""}
          </div>
          ${metaChips.length ? `<div class="exercise-meta">${metaChips.map(c => `<span class="meta-chip">${c}</span>`).join("")}</div>` : ""}
          <p class="exercise-desc">${ex.description}</p>

          <div class="level-guide">
            <span class="level-guide-title">Nivel ${levelLabel}</span>
            <ul>${getLevelGuide(ex).map(line => `<li><strong>${line.label}:</strong> ${line.text}</li>`).join("")}</ul>
          </div>

          <div class="exercise-chips">
            <button type="button" class="chip-btn toggle-coaching">Cómo explicarlo ▾</button>
            <button type="button" class="chip-btn toggle-adaptation">+ Adaptación por patología ▾</button>
            ${(ex.avoid && ex.avoid.length) ? `<span class="chip warn">Evitar en: ${ex.avoid.join(", ")}</span>` : ""}
          </div>

          <div class="coaching-panel hidden">
            <div class="coaching-row"><span class="coaching-icon" aria-hidden="true">🗣️</span><div><strong>Verbal</strong><p>${coaching.verbal}</p></div></div>
            <div class="coaching-row"><span class="coaching-icon" aria-hidden="true">🖼️</span><div><strong>Imagen mental</strong><p>${coaching.imagenMental}</p></div></div>
            <div class="coaching-row"><span class="coaching-icon" aria-hidden="true">✋</span><div><strong>Táctil</strong><p>${coaching.tactil}</p></div></div>
            <div class="coaching-row"><span class="coaching-icon" aria-hidden="true">❓</span><div><strong>Por pregunta</strong><p>${coaching.pregunta}</p></div></div>
          </div>

          <div class="adaptation-panel hidden">
            <p>¿Alguna alumna necesita adaptación? Tocá la condición y te muestro qué cambiar — la clase sigue normal para el resto del grupo:</p>
            <div class="condition-pills">
              ${AVOID_TAGS.map(tag => `<button type="button" class="pill-condition" data-tag="${tag}">${tag}</button>`).join("")}
            </div>
            <div class="condition-result hidden"></div>
          </div>

          <div class="exercise-controls">
            <div class="series-stepper">
              <button type="button" class="step-minus" aria-label="Restar serie">−</button>
              <span class="series-count">${ex.seriesDefault || 1} series</span>
              <button type="button" class="step-plus" aria-label="Sumar serie">+</button>
            </div>
            <button type="button" class="btn-mini btn-change">⇄ Cambiar</button>
            <button type="button" class="btn-mini btn-remove">✕ Quitar</button>
            <button type="button" class="btn-mini btn-fav${isFav ? " is-active" : ""}">${isFav ? "★" : "☆"} Favorito</button>
            <button type="button" class="btn-mini btn-hide" title="No volver a mostrar este ejercicio">🚫 No mostrar</button>
          </div>
        </div>
      </div>`;
  }

  // ---------- modo clase en vivo (cronómetro por ejercicio) ----------
  let liveState = null; // { steps: [{block, ex}], index, seconds, timerId, paused }

  function buildLiveSteps() {
    const steps = [];
    lastRender.result.forEach(({ block, exercises }) => {
      exercises.forEach(ex => steps.push({ block, ex }));
    });
    return steps;
  }

  function updateLiveTimerDisplay() {
    const m = String(Math.floor(liveState.seconds / 60)).padStart(2, "0");
    const s = String(liveState.seconds % 60).padStart(2, "0");
    $("#live-timer").textContent = `${m}:${s}`;
  }

  function renderLiveStep() {
    const { steps, index } = liveState;
    const { block, ex } = steps[index];
    $("#live-progress").textContent = `Ejercicio ${index + 1} de ${steps.length}`;
    $("#live-block-name").textContent = `${block.id}. ${block.name}`;
    $("#live-ex-position").textContent = ex.position || "";
    $("#live-ex-name").textContent = ex.name;
    $("#live-ex-desc").textContent = ex.description || "";
    $("#live-ex-howto").textContent = levelGuideText(ex).join(" · ");

    liveState.seconds = 0;
    liveState.paused = false;
    $("#live-pause").textContent = "Pausar";
    updateLiveTimerDisplay();
  }

  function startLiveTimer() {
    if (liveState.timerId) clearInterval(liveState.timerId);
    liveState.timerId = setInterval(() => {
      if (liveState.paused) return;
      liveState.seconds += 1;
      updateLiveTimerDisplay();
    }, 1000);
  }

  function startLiveMode() {
    if (!lastRender) return;
    const steps = buildLiveSteps();
    if (!steps.length) {
      alert("Todavía no hay ejercicios en esta clase para iniciar el modo en vivo.");
      return;
    }
    liveState = { steps, index: 0, seconds: 0, timerId: null, paused: false };
    $("#live-mode").classList.remove("hidden");
    renderLiveStep();
    startLiveTimer();
  }

  function stopLiveMode() {
    if (liveState && liveState.timerId) clearInterval(liveState.timerId);
    liveState = null;
    $("#live-mode").classList.add("hidden");
  }

  function liveStep(delta) {
    if (!liveState) return;
    const next = liveState.index + delta;
    if (next < 0 || next >= liveState.steps.length) return;
    liveState.index = next;
    renderLiveStep();
  }

  $("#live-close").addEventListener("click", stopLiveMode);
  $("#live-prev").addEventListener("click", () => liveStep(-1));
  $("#live-next").addEventListener("click", () => liveStep(1));
  $("#live-pause").addEventListener("click", () => {
    if (!liveState) return;
    liveState.paused = !liveState.paused;
    $("#live-pause").textContent = liveState.paused ? "Reanudar" : "Pausar";
  });

  // qué filtro conviene ampliar cuando un bloque queda corto
  function widenHint() {
    const hints = [];
    if (state.accesorios.length) hints.push("sumar accesorios o quitar el filtro de accesorio");
    if (state.level === "inicial") hints.push("probar con nivel intermedio");
    if (state.upperFocus !== "mixto") hints.push("cambiar el enfoque a Mixto");
    hints.push("cargar tus propios ejercicios");
    return hints.join(", ");
  }

  function renderClass({ objectiveId, objectiveLabel, populationId, populationLabel, result, focusId }) {
    lastRender = { objectiveId, objectiveLabel, populationId, populationLabel, result, focusId };
    $("#output-empty").classList.add("hidden");
    const content = $("#output-content");
    content.classList.remove("hidden");

    const modLabel = MODALITIES[state.discipline].find(m => m.id === state.modality)?.label || state.modality;
    const levelLabel = LEVEL_LABELS[state.level];

    let html = `
      <div class="class-header">
        <p class="kicker">Plan de clase · ${state.discipline === "pilates" ? "Pilates" : "Yoga"}</p>
        <h3>${objectiveLabel}</h3>
        <div class="tag-row">
          <span class="tag">${modLabel}</span>
          <span class="tag">${levelLabel}</span>
          <span class="tag">${state.duration} min</span>
          <span class="tag">${populationLabel}</span>
          ${state.accesorios.map(a => `<span class="tag">${ACCESORIO_LABELS[a] || a}</span>`).join("")}
          ${focusId && focusId !== "mixto" ? `<span class="tag">${UPPER_FOCUS.find(f => f.id === focusId)?.label || focusId}</span>` : ""}
        </div>
        ${renderTimeDonut(result)}
        <div class="actions">
          <button type="button" class="btn-outline" id="btn-live">▶ Modo clase en vivo</button>
          <button type="button" class="btn-outline" id="btn-pdf">↓ Descargar PDF</button>
          <button type="button" class="btn-outline" id="btn-save-class">☆ Guardar clase</button>
          <button type="button" class="btn-outline" id="btn-extend">+ 20 min sin repetir</button>
          <button type="button" class="btn-outline" id="btn-regenerate">↻ Regenerar clase</button>
          <button type="button" class="btn-outline" id="btn-copy">⎘ Copiar texto</button>
        </div>
      </div>

      <div class="intent-box">
        <span class="label">Frase de inicio — la intención de hoy</span>
        "Hoy en esta clase vamos a trabajar ${objectiveLabel.toLowerCase()}. Antes de empezar, tomá un momento para notar cómo llegás — sin cambiarlo, solo notarlo."
      </div>
    `;

    if (state.modality !== "mat" && state.discipline === "pilates" && window.RESORTES_LEYENDA) {
      html += `<p class="block-note resortes-leyenda">${window.RESORTES_LEYENDA}</p>`;
    }

    const shortBlocks = result.filter(r => r.short && r.requested);
    if (shortBlocks.length) {
      const missing = shortBlocks.reduce((s, r) => s + (r.requested - r.exercises.length), 0);
      html += `<p class="class-warning">Hay pocos ejercicios para esta combinación: ${missing === 1 ? "falta 1 ejercicio" : `faltan ${missing} ejercicios`} para completar ${shortBlocks.length === 1 ? "un bloque" : `${shortBlocks.length} bloques`}. No relleno con ejercicios que no corresponden. Para una clase más completa podés ${widenHint()}.</p>`;
    }

    result.forEach(({ block, minutes, exercises, noExtra, focusShort, generalCount }) => {
      html += `<div class="block">
        <div class="block-head">
          <div class="block-num">${block.id}</div>
          <div>
            <h4>${block.name}</h4>
            <p>${block.subtitle}</p>
          </div>
          <div class="block-time">${minutes} min</div>
        </div>`;

      if (!exercises.length) {
        html += populationId && populationId !== "general"
          ? `<p class="block-empty">No hay ejercicios de la base marcados como aptos para ${populationLabel.toLowerCase()} en este bloque con este elemento. Probá con otro elemento o sumá uno propio acá abajo.</p>`
          : `<p class="block-empty">Todavía no cargaste ejercicios para esta combinación en este bloque. Sumalos con "+ Agregar ejercicio propio" o con el campo de acá abajo.</p>`;
      } else {
        if (generalCount) {
          html += `<p class="block-note">${block.id === 1 ? "Incluye movilidad general" : "Incluye vuelta a la calma general"} (del mismo nivel y accesorio) para completar el bloque.</p>`;
        }
        if (focusShort) {
          html += `<p class="block-note">Hay pocos ejercicios de ${(UPPER_FOCUS.find(f => f.id === focusId)?.label || "").toLowerCase()} con estos filtros: el bloque se completa con otros de tren superior.</p>`;
        }
        if (noExtra) {
          html += `<p class="block-empty">No hay más ejercicios nuevos para sumar en este bloque sin repetir.</p>`;
        }
        const minutesEach = Math.max(1, Math.round(minutes / exercises.length));
        exercises.forEach((ex, idx) => {
          const isPrepOriented = !!block.optional && (ex.objective || []).includes(objectiveId);
          html += renderExerciseCard(ex, block.id, idx, isPrepOriented, minutesEach);
        });
      }

      html += `
        <div class="quick-add-row">
          <input type="text" class="quick-add-input" placeholder="Agregar tu propio ejercicio a este bloque...">
          <button type="button" class="btn-mini btn-quick-add" data-block="${block.id}">+ Sumar</button>
        </div>
      </div>`;
    });

    const totalMinutes = result.reduce((s, r) => s + (r.exercises.length ? r.minutes : 0), 0);
    const totalExercises = result.reduce((s, r) => s + r.exercises.length, 0);
    html += `
      <div class="class-summary">
        <strong>Tiempo total estimado: ${totalMinutes} min</strong>
        <span>${totalExercises} ejercicios · ${result.filter(r => r.exercises.length).length} bloques${totalMinutes < state.duration ? ` · ${state.duration - totalMinutes} min sin cubrir por falta de ejercicios` : ""}</span>
      </div>
      <div class="intent-box" style="background:var(--gold-soft); color:var(--bordo-deep);">
        <span class="label">Frase de cierre — decila en los últimos 30 segundos</span>
        "Hoy trabajamos ${objectiveLabel.toLowerCase()}. La próxima clase vamos a seguir construyendo sobre esta base."
      </div>
    `;

    content.innerHTML = html;

    $("#btn-regenerate").addEventListener("click", buildClass);
    $("#btn-extend").addEventListener("click", extendClass);
    $("#btn-pdf").addEventListener("click", downloadPDF);
    $("#btn-live").addEventListener("click", startLiveMode);
    $("#btn-save-class").addEventListener("click", saveCurrentClass);
    $("#btn-copy").addEventListener("click", () => {
      navigator.clipboard.writeText(content.innerText).then(() => {
        const b = $("#btn-copy");
        const original = b.textContent;
        b.textContent = "Copiado ✓";
        setTimeout(() => b.textContent = original, 1500);
      });
    });
  }

  // ---------- interacción dentro de una tarjeta de ejercicio (delegado, se registra una sola vez) ----------
  $("#output-content").addEventListener("click", (e) => {
    const quickAddBtn = e.target.closest(".btn-quick-add");
    if (quickAddBtn) {
      const row = quickAddBtn.closest(".quick-add-row");
      const input = row.querySelector(".quick-add-input");
      quickAddExercise(Number(quickAddBtn.dataset.block), input.value);
      return;
    }

    const card = e.target.closest(".exercise-card");
    if (!card) return;
    const blockId = Number(card.dataset.block);
    const idx = Number(card.dataset.idx);

    if (e.target.closest(".toggle-coaching")) {
      card.querySelector(".coaching-panel").classList.toggle("hidden");
      return;
    }
    if (e.target.closest(".toggle-adaptation")) {
      card.querySelector(".adaptation-panel").classList.toggle("hidden");
      return;
    }
    const conditionPill = e.target.closest(".pill-condition");
    if (conditionPill) {
      const panel = card.querySelector(".adaptation-panel");
      panel.querySelectorAll(".pill-condition").forEach(p => p.classList.remove("is-active"));
      conditionPill.classList.add("is-active");
      const entry = findEntry(blockId);
      const ex = entry.exercises[idx];
      const resultBox = panel.querySelector(".condition-result");
      resultBox.textContent = getAdaptationForCondition(ex, conditionPill.dataset.tag);
      resultBox.classList.remove("hidden");
      return;
    }
    if (e.target.closest(".step-minus")) { changeSeries(blockId, idx, -1); return; }
    if (e.target.closest(".step-plus")) { changeSeries(blockId, idx, 1); return; }
    if (e.target.closest(".btn-change")) { swapExercise(blockId, idx); return; }
    if (e.target.closest(".btn-remove")) { removeExercise(blockId, idx); return; }
    const favBtn = e.target.closest(".btn-fav");
    if (favBtn) { toggleFavorite(blockId, idx, favBtn); return; }
    if (e.target.closest(".btn-hide")) { hideExercise(blockId, idx); return; }
  });

  $("#class-form").addEventListener("submit", (e) => {
    e.preventDefault();
    buildClass();
    if (window.innerWidth < 900) {
      $("#output-panel").scrollIntoView({ behavior: "smooth" });
    }
  });

  // ---------- add own exercise ----------
  $("#toggle-add-exercise").addEventListener("click", () => {
    $("#exercise-form").classList.toggle("hidden");
  });

  $("#exercise-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const getMultiValues = (id) => $$(`${id} .pill.is-active`).map(p => p.dataset.value);

    const modality = getMultiValues("#ex-modality-group");
    const nivelMin = getMultiValues("#ex-level-group")[0];
    const moments = getMultiValues("#ex-moment-group").map(Number);
    const objective = getMultiValues("#ex-objective-group");
    const avoid = getMultiValues("#ex-avoid-group");
    const accesorio = getMultiValues("#ex-accesorio-group");
    const patron = getMultiValues("#ex-patron-group");
    const val = (id) => ($(id)?.value || "").trim();

    if (!modality.length || !nivelMin || !moments.length) {
      alert("Elegí la modalidad, el nivel mínimo y al menos un momento de la clase.");
      return;
    }

    // compatibilidad con el filtro de elementos que usa la guía de nivel
    const ACC_TO_EQUIP = { banda: "band", aro: "magic-circle", pelota: "soft-ball", fitball: "fitball", bloques: "blocks", foam_roller: "foam-roller" };
    const isReformer = modality.includes("reformer");

    // un ejercicio propio puede aplicar a varios momentos: guardamos una entrada por momento
    moments.forEach((moment, idx) => {
      saveCustomExercise({
        id: "custom-" + Date.now() + "-" + idx,
        discipline: state.discipline,
        name: val("#ex-name"),
        description: val("#ex-description"),
        position: val("#ex-position") || POSICION_LABELS[val("#ex-posicion-select")] || "",
        posicion: val("#ex-posicion-select") || undefined,
        modality, nivelMin, moment, objective, avoid,
        accesorio: accesorio.length ? accesorio : (isReformer ? undefined : ["ninguno"]),
        equipment: accesorio.map(a => ACC_TO_EQUIP[a]).filter(Boolean),
        patron: patron.length ? patron : undefined,
        howTo: val("#ex-howto") || undefined,
        resortes: isReformer ? (val("#ex-resortes") || undefined) : undefined,
        cue: val("#ex-cue") || undefined,
        regresion: val("#ex-regresion") || undefined,
        progresion: val("#ex-progresion") || undefined,
        seriesDefault: 2,
      });
    });

    alert("Ejercicio guardado. Ya está disponible en el generador.");
    e.target.reset();
    $$("#exercise-form .pill.is-active").forEach(p => p.classList.remove("is-active"));
    refreshExAccesorioPills();
    $("#exercise-form").classList.add("hidden");
  });

  // ---------- exportar / importar / restaurar ocultos ----------
  $("#btn-export-mine")?.addEventListener("click", exportCustomExercises);
  $("#import-mine-input")?.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importCustomExercises(file);
    e.target.value = "";
  });
  $("#my-exercises-panel")?.addEventListener("click", (e) => {
    if (!e.target.closest("#btn-restore-hidden")) return;
    writeJSON(HIDDEN_KEY, []);
    renderHiddenBox();
  });

  // el enfoque de tren superior solo aparece con ese objetivo
  $("#objective-select").addEventListener("change", refreshFocusVisibility);

  // ---------- mis clases guardadas: toggle + interacciones ----------
  $("#toggle-saved-classes").addEventListener("click", () => {
    $("#saved-classes-panel").classList.toggle("hidden");
  });

  $("#saved-classes-list").addEventListener("click", (e) => {
    const openBtn = e.target.closest(".btn-open-saved");
    if (openBtn) { openSavedClass(openBtn.dataset.id); return; }
    const deleteBtn = e.target.closest(".btn-delete-saved");
    if (deleteBtn) { deleteSavedClass(deleteBtn.dataset.id); return; }
  });

  // ---------- mis ejercicios propios: toggle + interacciones ----------
  $("#toggle-my-exercises").addEventListener("click", () => {
    $("#my-exercises-panel").classList.toggle("hidden");
  });

  $("#my-exercises-list").addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".btn-delete-exercise");
    if (deleteBtn) { deleteCustomExercise(deleteBtn.dataset.id); }
  });

  // ---------- init ----------
  refreshFormForDiscipline();
  renderSavedClassesList();
  renderMyExercisesList();
})();