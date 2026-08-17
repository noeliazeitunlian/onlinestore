(() => {
  const STORAGE_KEY = "genclases_custom_exercises";
  const SAVED_KEY = "genclases_saved_classes";

  let state = {
    discipline: "pilates",
    modality: null,
    level: "intermedio",
    duration: 55,
  };

  let lastRender = null; // { objectiveId, objectiveLabel, populationId, populationLabel, result } de la clase mostrada actualmente

  // ---------- helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const LEVEL_LABELS = { inicial: "Inicial", intermedio: "Intermedio", avanzado: "Avanzado" };

  function getCustomExercises() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
  }

  function saveCustomExercise(ex) {
    const all = getCustomExercises();
    all.push(ex);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  function allExercises() {
    return EXERCISES.concat(getCustomExercises());
  }

  function shuffle(arr) {
    return arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
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
    state.level = entry.level;
    state.duration = entry.duration;

    $$("#modality-group .pill").forEach(p => p.classList.toggle("is-active", p.dataset.value === state.modality));
    $$("#level-group .pill").forEach(p => p.classList.toggle("is-active", p.dataset.value === state.level));
    $$("#duration-group .pill").forEach(p => p.classList.toggle("is-active", Number(p.dataset.value) === state.duration));
    $("#objective-select").value = entry.render.objectiveId;
    $("#population-select").value = entry.render.populationId;

    renderClass(entry.render);
    if (window.innerWidth < 900) {
      $("#output-panel").scrollIntoView({ behavior: "smooth" });
    }
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

  function getProgression(ex) {
    if (ex.progression) return ex.progression;
    const levelLabel = LEVEL_LABELS[state.level] || state.level;
    if (ex.level.length > 1) {
      return `sostené esta versión para nivel ${levelLabel.toLowerCase()}; para variar, ajustá rango, velocidad o apoyo`;
    }
    return `pensado específicamente para nivel ${levelLabel.toLowerCase()}`;
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

  function refreshFormForDiscipline() {
    const d = state.discipline;
    renderPillGroup("#modality-group", MODALITIES[d], null);
    state.modality = MODALITIES[d][0].id;
    $(`#modality-group .pill[data-value="${state.modality}"]`).classList.add("is-active");

    renderSelect("#objective-select", OBJECTIVES[d]);
    renderSelect("#population-select", POPULATIONS);

    // exercise-add form groups
    renderPillGroup("#ex-modality-group", MODALITIES[d], null);
    renderPillGroup("#ex-moment-group", BLOCKS.map(b => ({ id: b.id, label: `${b.id}. ${b.name}` })), null, true);
    renderPillGroup("#ex-objective-group", OBJECTIVES[d], null, true);
    renderPillGroup("#ex-avoid-group", AVOID_TAGS.map(t => ({ id: t, label: t })), null, true);
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
    if (group.id === "modality-group") state.modality = pill.dataset.value;
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
  function filterPool(discipline, moment, modality, level, objective, populationId, excludeIds = new Set()) {
    let pool = allExercises().filter(ex =>
      ex.discipline === discipline &&
      ex.moment === moment &&
      (ex.modality.includes(modality) || ex.modality.includes("mixta")) &&
      ex.level.includes(level) &&
      !excludeIds.has(ex.id)
    );

    // avoid contraindicated for population
    const popLabelMap = {
      embarazo: "Embarazo / posparto",
      mayores: null,
      principiantes: null,
      general: null,
    };
    const avoidLabel = popLabelMap[populationId];
    if (avoidLabel) {
      pool = pool.filter(ex => !(ex.avoid || []).includes(avoidLabel));
    }

    // prefer matching objective, but fall back if empty
    const withObjective = pool.filter(ex => ex.objective.includes(objective));
    if (withObjective.length) return { pool: withObjective, fallback: false };
    if (pool.length) return { pool, fallback: true };

    // last resort: ignore level
    const anyLevel = allExercises().filter(ex =>
      ex.discipline === discipline && ex.moment === moment && !excludeIds.has(ex.id)
    );
    return { pool: anyLevel, fallback: true };
  }

  function buildClass() {
    const objectiveId = $("#objective-select").value;
    const objectiveLabel = OBJECTIVES[state.discipline].find(o => o.id === objectiveId)?.label || objectiveId;
    const populationId = $("#population-select").value;
    const populationLabel = POPULATIONS.find(p => p.id === populationId)?.label || populationId;
    const includeWarmup = $("#include-warmup").checked;

    let blocksToUse = BLOCKS.filter(b => includeWarmup || !b.optional);
    const weightSum = blocksToUse.reduce((s, b) => s + b.weight, 0);

    const result = blocksToUse.map(block => {
      const minutes = Math.max(3, Math.round((block.weight / weightSum) * state.duration));
      const { pool, fallback } = filterPool(state.discipline, block.id, state.modality, state.level, objectiveId, populationId);
      const picked = shuffle(pool).slice(0, block.id === 3 ? 3 : 2);
      return { block, minutes, exercises: picked, fallback };
    });

    renderClass({ objectiveId, objectiveLabel, populationId, populationLabel, result });
  }

  // ---------- extender clase sin repetir ejercicios ----------
  function extendClass() {
    if (!lastRender) return;
    state.duration += 20;

    const { objectiveId, objectiveLabel, populationId, populationLabel } = lastRender;
    const includeWarmup = $("#include-warmup").checked;

    const blocksToUse = BLOCKS.filter(b => includeWarmup || !b.optional);
    const weightSum = blocksToUse.reduce((s, b) => s + b.weight, 0);

    const usedIds = new Set(lastRender.result.flatMap(r => r.exercises.map(ex => ex.id)));

    const result = blocksToUse.map(block => {
      const minutes = Math.max(3, Math.round((block.weight / weightSum) * state.duration));
      const previous = lastRender.result.find(r => r.block.id === block.id);
      const extraCount = block.id === 3 ? 2 : 1;
      const { pool, fallback } = filterPool(state.discipline, block.id, state.modality, state.level, objectiveId, populationId, usedIds);
      const extras = shuffle(pool).slice(0, extraCount);
      extras.forEach(ex => usedIds.add(ex.id));
      const exercises = (previous ? previous.exercises : []).concat(extras);
      return {
        block,
        minutes,
        exercises,
        fallback: previous ? previous.fallback : fallback,
        noExtra: !!previous && exercises.length > 0 && extras.length === 0,
      };
    });

    renderClass({ objectiveId, objectiveLabel, populationId, populationLabel, result });
  }

  // ---------- descargar clase en PDF ----------
  function downloadPDF() {
    const btn = $("#btn-pdf");
    if (!btn || typeof html2canvas === "undefined" || !window.jspdf) return;
    const original = btn.textContent;
    btn.textContent = "Generando…";
    btn.disabled = true;

    html2canvas($("#output-content"), { scale: 2, backgroundColor: "#FBF1EE" })
      .then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL("image/png");

        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`clase-${state.discipline}-${Date.now()}.pdf`);
      })
      .catch(() => alert("No se pudo generar el PDF. Probá de nuevo."))
      .finally(() => {
        btn.textContent = original;
        btn.disabled = false;
      });
  }

  // ---------- helpers de edición en vivo de la clase ----------
  function findEntry(blockId) {
    return lastRender.result.find(r => r.block.id === blockId);
  }

  function swapExercise(blockId, idx) {
    const entry = findEntry(blockId);
    if (!entry) return;
    const excludeIds = new Set(lastRender.result.flatMap(r => r.exercises.map(ex => ex.id)));
    const { pool } = filterPool(state.discipline, blockId, state.modality, state.level, lastRender.objectiveId, lastRender.populationId, excludeIds);
    const options = shuffle(pool);
    if (!options.length) {
      alert("No hay otro ejercicio disponible para reemplazar este, con los filtros actuales.");
      return;
    }
    entry.exercises[idx] = options[0];
    renderClass(lastRender);
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
      modality: [state.modality],
      level: [state.level],
      moment: blockId,
      objective: [lastRender.objectiveId],
      seriesDefault: 1,
    };
    saveCustomExercise(ex);
    entry.exercises.push(ex);
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
  function renderExerciseCard(ex, blockId, idx, isPrepOriented) {
    const coaching = getCoaching(ex);
    const progression = getProgression(ex);
    const levelLabel = LEVEL_LABELS[state.level] || state.level;

    return `
      <div class="exercise-card" data-block="${blockId}" data-idx="${idx}">
        <div class="exercise-illustration">${getPositionIcon(ex.position)}</div>
        <div class="exercise-body">
          <div class="exercise-title-row">
            <h5>${ex.name}</h5>
            ${ex.position ? `<span class="position">${ex.position}</span>` : ""}
            ${isPrepOriented ? `<span class="badge-prep">PREP ORIENTADA</span>` : ""}
          </div>
          <p class="exercise-desc">${ex.description}</p>

          <div class="exercise-chips">
            <span class="chip progression-chip">Progresión (${levelLabel}) · ${progression}</span>
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
    $("#live-ex-howto").textContent = getCoaching(ex).verbal;

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

  function renderClass({ objectiveId, objectiveLabel, populationId, populationLabel, result }) {
    lastRender = { objectiveId, objectiveLabel, populationId, populationLabel, result };
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

    result.forEach(({ block, minutes, exercises, fallback, noExtra }) => {
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
        html += `<p class="block-empty">Todavía no cargaste ejercicios para esta combinación en este bloque. Sumalos con "+ Agregar ejercicio propio" o con el campo de acá abajo.</p>`;
      } else {
        if (fallback) {
          html += `<p class="block-empty">Mostrando ejercicios similares (no hay carga exacta para este objetivo/nivel en este bloque todavía).</p>`;
        }
        if (noExtra) {
          html += `<p class="block-empty">No hay más ejercicios nuevos para sumar en este bloque sin repetir.</p>`;
        }
        exercises.forEach((ex, idx) => {
          const isPrepOriented = !!block.optional && !fallback && ex.objective.includes(objectiveId);
          html += renderExerciseCard(ex, block.id, idx, isPrepOriented);
        });
      }

      html += `
        <div class="quick-add-row">
          <input type="text" class="quick-add-input" placeholder="Agregar tu propio ejercicio a este bloque...">
          <button type="button" class="btn-mini btn-quick-add" data-block="${block.id}">+ Sumar</button>
        </div>
      </div>`;
    });

    html += `
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
    const level = getMultiValues("#ex-level-group");
    const moments = getMultiValues("#ex-moment-group").map(Number);
    const objective = getMultiValues("#ex-objective-group");
    const avoid = getMultiValues("#ex-avoid-group");

    if (!modality.length || !level.length || !moments.length) {
      alert("Elegí al menos una modalidad, un nivel y un momento de la clase.");
      return;
    }

    // un ejercicio propio puede aplicar a varios momentos: guardamos una entrada por momento
    moments.forEach((moment, idx) => {
      saveCustomExercise({
        id: "custom-" + Date.now() + "-" + idx,
        discipline: state.discipline,
        name: $("#ex-name").value.trim(),
        description: $("#ex-description").value.trim(),
        position: $("#ex-position").value.trim(),
        modality, level, moment, objective, avoid,
        seriesDefault: 3,
      });
    });

    alert("Ejercicio guardado. Ya está disponible en el generador.");
    e.target.reset();
    $$("#exercise-form .pill.is-active").forEach(p => p.classList.remove("is-active"));
    $("#exercise-form").classList.add("hidden");
  });

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

  // ---------- init ----------
  refreshFormForDiscipline();
  renderSavedClassesList();
})();
