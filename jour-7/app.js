const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const narrationAudio = document.querySelector("#narration-audio");
const voiceControl = document.querySelector("#voice-control");

const audioFiles = [
  "jour-7-ecran-1.mp3",
  "jour-7-ecran-2.mp3",
  "jour-7-ecran-3.mp3",
  "jour-7-ecran-4.mp3",
  "jour-7-ecran-5.mp3",
  "jour-7-ecran-6.mp3",
  "jour-7-ecran-7.mp3",
  "jour-7-ecran-8.mp3",
  "jour-7-ecran-9.mp3",
  "jour-7-ecran-10.mp3",
];

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 7</p>
        <h1>LÀ</h1>
        <div class="copy">
          <p>Pendant six jours, vous avez écouté, regardé, distingué, laissé passer, cessé de corriger et observé les frontières.</p>
          <p>Aujourd’hui, il n’y aura rien de nouveau à apprendre.</p>
          <p class="quiet">L’expérience dure environ cinq minutes.</p>
        </div>
        <div class="horizon" aria-hidden="true"></div>
        <div class="mode-actions" id="experience-mode">
          <button class="primary" id="choose-audio" type="button">Écouter l’expérience</button>
          <button class="secondary-button" id="choose-reading" type="button">Lire l’expérience</button>
        </div>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Préparer</p>
        <h2>Allez chercher un verre d’eau.</h2>
        <div class="copy"><p>Posez-le devant vous, puis revenez à cet écran.</p></div>
        <button class="primary" id="glass-ready" type="button">Le verre est là</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Avant le geste</p>
        <h2>Ne prenez pas encore le verre.</h2>
        <div class="copy"><p>Arrêtez-vous.</p></div>
        <ul class="sequence">
          <li>un son proche</li>
          <li>un son plus lointain</li>
          <li>puis l’ensemble</li>
        </ul>
      </div>`,
    pause: 8,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Regarder</p>
        <h2>Regardez le verre avant de vous contenter de son nom.</h2>
        <ul class="sequence">
          <li>la lumière qui le traverse</li>
          <li>la forme de l’eau</li>
          <li>la ligne de sa surface</li>
        </ul>
        <p class="prompt">Vous connaissez cet objet. Mais l’avez-vous déjà vu exactement ainsi&nbsp;?</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Toucher</p>
        <h2>Prenez maintenant le verre.</h2>
        <div class="copy"><p>Sentez son poids, sa température et le contact de votre main.</p></div>
        <p class="prompt">Où finit la main&nbsp;?<br />Où commence le verre&nbsp;?</p>
        <div class="copy"><p class="quiet">Il n’est pas nécessaire de répondre.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Boire</p>
        <h2>Buvez une seule gorgée.</h2>
        <div class="copy">
          <p>Sans vous presser. Sans chercher à rendre ce moment particulier.</p>
        </div>
        <p class="prompt">L’eau qui était devant vous entre maintenant dans le corps.</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner stillness">
        <p class="eyebrow">Après</p>
        <h2>Reposez le verre.</h2>
        <p class="prompt">Restez là.</p>
      </div>`,
    pause: 10,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Rien d’extraordinaire</p>
        <h2>Vous avez bu un verre d’eau.</h2>
        <div class="copy">
          <p>Rien d’exceptionnel ne s’est produit.</p>
          <p>Et pourtant, ce moment n’était pas absent.</p>
          <p class="quiet">Il était peut-être seulement recouvert par l’habitude, les mots, les pensées et le mouvement vers ce qui vient ensuite.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La suite</p>
        <h2>La Traversée ne demande pas de transformer chaque geste en exercice.</h2>
        <div class="copy">
          <p>Elle ne demande pas de rester constamment attentif.</p>
          <p>Elle laisse seulement ouverte la possibilité de revenir.</p>
        </div>
        <ul class="sequence">
          <li>à un son</li>
          <li>à une chose</li>
          <li>à un geste</li>
          <li>à ce qui est là</li>
        </ul>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 7 · Fin</p>
        <h2 class="final-line">Il n’y avait rien à ajouter. Seulement ce qui était déjà là.</h2>
        <div class="copy">
          <p>La Traversée s’arrête ici.</p>
          <p>Le regard peut continuer.</p>
        </div>
        <div class="final-actions">
          <a class="primary" href="https://www.editionsla.com/le-livre-je-me-vois">Découvrir Je me vois</a>
          <a class="secondary-link" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
        </div>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let pauseId = null;
let pauseDeadline = 0;
let pauseRemaining = 0;
let pauseComplete = false;
let experienceMode = null;
let autoAdvanceId = null;
let autoAdvanceDeadline = 0;
let autoAdvanceRemaining = 2000;
let narrationComplete = false;
let audioPaused = false;

function clearPause() {
  if (pauseId) window.clearTimeout(pauseId);
  pauseId = null;
  pauseDeadline = 0;
  pauseRemaining = 0;
  pauseComplete = false;
}

function clearAutoAdvance() {
  if (autoAdvanceId) window.clearTimeout(autoAdvanceId);
  autoAdvanceId = null;
  autoAdvanceDeadline = 0;
  autoAdvanceRemaining = 2000;
}

function stopNarration() {
  clearAutoAdvance();
  narrationAudio.pause();
  narrationAudio.currentTime = 0;
  narrationComplete = false;
  audioPaused = false;
  voiceControl.textContent = "Mode audio · Pause";
}

function playNarration() {
  if (experienceMode !== "audio") return;
  narrationComplete = false;
  audioPaused = false;
  narrationAudio.src = `${audioFiles[currentStep]}?v=1`;
  narrationAudio.currentTime = 0;
  narrationAudio.play().catch(() => {});
  voiceControl.textContent = "Mode audio · Pause";
}

function advanceAudioExperience() {
  clearAutoAdvance();
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep();
  }
}

function scheduleAutoAdvance(delay = 2000) {
  if (experienceMode !== "audio" || steps[currentStep].manual || steps[currentStep].final) return;
  autoAdvanceRemaining = delay;
  autoAdvanceDeadline = Date.now() + delay;
  autoAdvanceId = window.setTimeout(advanceAudioExperience, delay);
}

function completeStepPause() {
  pauseId = null;
  pauseDeadline = 0;
  pauseRemaining = 0;
  pauseComplete = true;

  if (experienceMode === "audio") {
    if (narrationComplete) scheduleAutoAdvance();
    return;
  }

  nextButton.hidden = false;
  nextButton.focus();
}

function startStepPause(delay) {
  pauseRemaining = delay;
  pauseDeadline = Date.now() + delay;
  pauseId = window.setTimeout(completeStepPause, delay);
}

function freezeStepPause() {
  if (!pauseId) return;
  pauseRemaining = Math.max(0, pauseDeadline - Date.now());
  window.clearTimeout(pauseId);
  pauseId = null;
  pauseDeadline = 0;
}

function resumeStepPause() {
  if (pauseComplete || pauseId || pauseRemaining <= 0) return;
  startStepPause(pauseRemaining);
}

function setExperienceMode(mode) {
  experienceMode = mode;
  voiceControl.hidden = mode !== "audio";
  nextButton.hidden = false;
  document.querySelector("#experience-mode")?.remove();
  if (mode === "audio") playNarration();
}

function updateProgress() {
  progressLabel.textContent = `${currentStep + 1} / ${steps.length}`;
  progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
}

function renderStep() {
  clearPause();
  stopNarration();
  stage.innerHTML = steps[currentStep].html;
  updateProgress();
  backButton.hidden = currentStep === 0;
  nextButton.hidden = Boolean(steps[currentStep].manual || steps[currentStep].pause || steps[currentStep].final);
  voiceControl.hidden = experienceMode !== "audio";
  stage.focus({ preventScroll: true });

  document.querySelector("#choose-audio")?.addEventListener("click", () => setExperienceMode("audio"));
  document.querySelector("#choose-reading")?.addEventListener("click", () => setExperienceMode("reading"));
  document.querySelector("#glass-ready")?.addEventListener("click", () => {
    currentStep = 2;
    renderStep();
  });

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    experienceMode = null;
    voiceControl.hidden = true;
    renderStep();
  });

  if (steps[currentStep].pause) startStepPause(steps[currentStep].pause * 1000);
  if (experienceMode === "audio") playNarration();
}

backButton.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderStep();
  }
});

nextButton.addEventListener("click", () => {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep();
  }
});

voiceControl.addEventListener("click", () => {
  if (autoAdvanceId) {
    autoAdvanceRemaining = Math.max(0, autoAdvanceDeadline - Date.now());
    window.clearTimeout(autoAdvanceId);
    autoAdvanceId = null;
    audioPaused = true;
    voiceControl.textContent = "Mode audio · Reprendre";
    return;
  }

  if (audioPaused && narrationAudio.ended) {
    audioPaused = false;
    voiceControl.textContent = "Mode audio · Pause";
    if (steps[currentStep].pause && !pauseComplete) resumeStepPause();
    else scheduleAutoAdvance(autoAdvanceRemaining);
    return;
  }

  if (narrationAudio.paused) {
    if (narrationAudio.ended) narrationAudio.currentTime = 0;
    narrationAudio.play().catch(() => {});
    if (steps[currentStep].pause && !pauseComplete) resumeStepPause();
    audioPaused = false;
    voiceControl.textContent = "Mode audio · Pause";
  } else {
    narrationAudio.pause();
    if (steps[currentStep].pause && !pauseComplete) freezeStepPause();
    audioPaused = true;
    voiceControl.textContent = "Mode audio · Reprendre";
  }
});

narrationAudio.addEventListener("ended", () => {
  if (experienceMode !== "audio") return;
  narrationComplete = true;
  if (steps[currentStep].manual || steps[currentStep].final) return;
  if (steps[currentStep].pause && !pauseComplete) return;
  scheduleAutoAdvance();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" && !nextButton.hidden) nextButton.click();
  if (event.key === "ArrowLeft" && !backButton.hidden) backButton.click();
});

renderStep();
