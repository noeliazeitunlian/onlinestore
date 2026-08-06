(() => {
  const STORAGE_KEY = "genclases_custom_exercises";

  let state = {
    discipline: "pilates",
    modality: null,
    level: "intermedio",
    duration: 55,
  };

  // ---------- helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

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

  // ---------- discipline toggle ----------
  $$(".discipline-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".discipline-btn").forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      state.discipline = btn.dataset.discipline;
      refreshFormForDiscipline();
      $("#output-content").classList.add("hidden");
      $("#output-empty").classList.remove("hidden");
    });
  });

  // ---------- generate class ----------
  function filterPool(discipline, moment, modality, level, objective, populationId) {
    let pool = allExercises().filter(ex =>
      ex.discipline === discipline &&
      ex.moment === moment &&
      (ex.modality.includes(modality) || ex.modality.includes("mixta")) &&
      ex.level.includes(level)
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
    const anyLevel = allExercises().filter(ex => ex.discipline === discipline && ex.moment === moment);
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

    renderClass({ objectiveLabel, populationLabel, result });
  }

  function renderClass({ objectiveLabel, populationLabel, result }) {
    $("#output-empty").classList.add("hidden");
    const content = $("#output-content");
    content.classList.remove("hidden");

    const modLabel = MODALITIES[state.discipline].find(m => m.id === state.modality)?.label || state.modality;
    const levelLabel = { inicial: "Inicial", intermedio: "Intermedio", avanzado: "Avanzado" }[state.level];

    const ribbonColors = ["var(--rosa)", "var(--rosa)", "var(--bordo)", "var(--gold)", "var(--bordo)", "var(--rosa)"];

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
        <div class="intensity-ribbon">
          ${result.map((r, i) => `<span style="background:${ribbonColors[i % ribbonColors.length]}"></span>`).join("")}
        </div>
        <div class="actions">
          <button type="button" class="btn-outline" id="btn-regenerate">↻ Regenerar clase</button>
          <button type="button" class="btn-outline" id="btn-copy">⎘ Copiar texto</button>
        </div>
      </div>

      <div class="intent-box">
        <span class="label">Frase de inicio — la intención de hoy</span>
        "Hoy en esta clase vamos a trabajar ${objectiveLabel.toLowerCase()}. Antes de empezar, tomá un momento para notar cómo llegás — sin cambiarlo, solo notarlo."
      </div>
    `;

    result.forEach(({ block, minutes, exercises, fallback }) => {
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
        html += `<p class="block-empty">Todavía no cargaste ejercicios para esta combinación en este bloque. Sumalos con "+ Agregar ejercicio propio".</p>`;
      } else {
        if (fallback) {
          html += `<p class="block-empty">Mostrando ejercicios similares (no hay carga exacta para este objetivo/nivel en este bloque todavía).</p>`;
        }
        exercises.forEach(ex => {
          html += `<div class="exercise-card">
            <h5>${ex.name}${ex.position ? `<span class="position">${ex.position}</span>` : ""}</h5>
            <p>${ex.description}</p>
            <div class="exercise-meta">
              <span class="chip">${ex.seriesDefault || 1} series</span>
              ${ex.howTo ? `<span class="chip">Cómo explicarlo ▾</span>` : ""}
              ${ex.adaptation ? `<span class="chip">+ Adaptación por patología ▾</span>` : ""}
              ${(ex.avoid && ex.avoid.length) ? `<span class="chip warn">Evitar en: ${ex.avoid.join(", ")}</span>` : ""}
            </div>
          </div>`;
        });
      }
      html += `</div>`;
    });

    html += `
      <div class="intent-box" style="background:var(--gold-soft); color:var(--bordo-deep);">
        <span class="label">Frase de cierre — decila en los últimos 30 segundos</span>
        "Hoy trabajamos ${objectiveLabel.toLowerCase()}. La próxima clase vamos a seguir construyendo sobre esta base."
      </div>
    `;

    content.innerHTML = html;

    $("#btn-regenerate").addEventListener("click", buildClass);
    $("#btn-copy").addEventListener("click", () => {
      navigator.clipboard.writeText(content.innerText).then(() => {
        const b = $("#btn-copy");
        const original = b.textContent;
        b.textContent = "Copiado ✓";
        setTimeout(() => b.textContent = original, 1500);
      });
    });
  }

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
    const getSingleValue = (id) => {
      const active = document.querySelector(`${id} .pill.is-active`);
      return active ? active.dataset.value : null;
    };

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

  // ---------- init ----------
  refreshFormForDiscipline();
})();
