const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const narrationAudio = document.querySelector("#narration-audio");
const voiceControl = document.querySelector("#voice-control");

const audioFiles = [
  "jour-2-ecran-1.mp3", "jour-2-ecran-2.mp3", "jour-2-ecran-3.mp3", null,
  "jour-2-ecran-5.mp3", "jour-2-ecran-6.mp3", "jour-2-ecran-7.mp3",
  "jour-2-ecran-8.mp3", "jour-2-ecran-9.mp3", "jour-2-ecran-10.mp3",
];

const observationInstructions = {
  90: "jour-2-consigne-1.mp3",
  60: "jour-2-consigne-2.mp3",
  30: "jour-2-consigne-3.mp3",
};

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 2</p>
        <h1>Nommer</h1>
        <div class="copy">
          <p>Choisissez l’une de vos mains.</p>
          <p>Posez-la simplement devant vous, détendue.</p>
          <p class="quiet">Nous allons regarder ce qui nous est si proche que nous ne le voyons presque plus.</p>
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
        <p class="eyebrow">Le premier regard</p>
        <h2>Regardez votre main.</h2>
        <p class="prompt">Quel est son nom&nbsp;?</p>
        <div class="copy"><p class="quiet">Laissez venir mentalement les mots «&nbsp;main&nbsp;», ou «&nbsp;ma main&nbsp;». Puis regardez-la encore un instant.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce que le mot contient</p>
        <h2>Vous connaissez son nom depuis toujours.</h2>
        <div class="copy">
          <p>Pourtant, ce nom ne dit presque rien de ce qui se trouve devant vous.</p>
        </div>
        <p class="prompt">Pendant une minute trente, regardez votre main sans chercher à l’expliquer.</p>
        <button class="primary" id="start-observation" type="button">Commencer l’observation</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner timer-wrap">
        <p class="eyebrow">L’observation</p>
        <div class="timer-ring" id="timer-ring" role="timer" aria-label="Une minute trente d’observation">
          <div class="timer-content">
            <div class="timer-phase" id="timer-phase">Regardez ses formes, ses lignes et ses contours.</div>
            <div class="timer-time" id="timer-time">01:30</div>
          </div>
        </div>
        <div class="timer-actions">
          <button class="text-button" id="pause-timer" type="button">Pause</button>
          <button class="text-button" id="reset-timer" type="button">Recommencer</button>
        </div>
      </div>`,
    timer: true,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Un geste ordinaire</p>
        <h2>Prenez doucement un objet placé près de vous. Puis reposez-le.</h2>
        <div class="copy"><p>Un geste simple vient d’avoir lieu.</p></div>
        <p class="prompt">Avez-vous eu besoin de savoir comment votre main l’accomplissait&nbsp;?</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui était devenu invisible</p>
        <h2>Cette main saisit, porte, écrit, touche, fabrique ou prend soin.</h2>
        <div class="copy">
          <p>Elle accomplit chaque jour une multitude de gestes sans recevoir votre attention.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui a eu lieu</p>
        <h2>Vous connaissiez son nom.</h2>
        <div class="copy">
          <p>Mais aviez-vous réellement regardé votre main&nbsp;?</p>
          <p>Le mot n’a pas disparu. Il ne suffit simplement plus à contenir ce qui vient d’être vu.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Remarquez une fois votre main au milieu d’un geste ordinaire.</h2>
        <div class="copy"><p>Ne suspendez pas le geste.</p><p>Voyez seulement qu’il est en train d’avoir lieu.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Un dernier regard</p>
        <h2>Ce qui nous est le plus proche peut aussi nous être devenu invisible.</h2>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 2 · Fin</p>
        <h2>La Traversée continue là où vous êtes.</h2>
        <div class="copy"><p>Demain, nous regarderons ce que nos commentaires ajoutent à ce qui arrive.</p></div>
        <a class="primary" href="https://www.editionsla.com/">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
        <figure class="final-landscape" aria-hidden="true"><img src="../assets/paysage-fin.png" alt="" /></figure>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let remainingSeconds = 90;
let timerRunning = false;
let experienceMode = null;
let observationFinishing = false;
let autoAdvanceId = null;
let autoAdvanceDeadline = 0;
let autoAdvanceRemaining = 2000;
let audioPaused = false;

function clearAutoAdvance() {
  if (autoAdvanceId) window.clearTimeout(autoAdvanceId);
  autoAdvanceId = null;
  autoAdvanceDeadline = 0;
  autoAdvanceRemaining = 2000;
}

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  timerRunning = false;
  observationFinishing = false;
  narrationAudio.pause();
  narrationAudio.currentTime = 0;
}

function stopNarration() {
  clearAutoAdvance();
  narrationAudio.pause();
  narrationAudio.currentTime = 0;
  audioPaused = false;
  voiceControl.textContent = "Mode audio · Pause";
}

function playNarration() {
  if (experienceMode !== "audio") return;
  audioPaused = false;
  narrationAudio.src = `${audioFiles[currentStep]}?v=1`;
  narrationAudio.currentTime = 0;
  narrationAudio.play().catch(() => {});
  voiceControl.textContent = "Mode audio · Pause";
}

function advanceAudioExperience() {
  clearAutoAdvance();
  if (currentStep === 2) {
    remainingSeconds = 90;
    currentStep = 3;
    renderStep();
    startTimer();
    return;
  }
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep();
  }
}

function scheduleAutoAdvance(delay = 2000) {
  if (experienceMode !== "audio" || currentStep === 3 || currentStep === steps.length - 1) return;
  autoAdvanceRemaining = delay;
  autoAdvanceDeadline = Date.now() + delay;
  autoAdvanceId = window.setTimeout(advanceAudioExperience, delay);
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
  stopTimer();
  stopNarration();
  stage.innerHTML = steps[currentStep].html;
  document.body.classList.toggle("is-final", Boolean(steps[currentStep].final));
  updateProgress();
  backButton.hidden = currentStep === 0;
  nextButton.hidden = Boolean(steps[currentStep].manual || steps[currentStep].timer || steps[currentStep].final);
  voiceControl.hidden = experienceMode !== "audio";
  stage.focus({ preventScroll: true });

  document.querySelector("#start-observation")?.addEventListener("click", () => {
    remainingSeconds = 90;
    currentStep = 3;
    renderStep();
    startTimer();
  });

  document.querySelector("#choose-audio")?.addEventListener("click", () => setExperienceMode("audio"));
  document.querySelector("#choose-reading")?.addEventListener("click", () => setExperienceMode("reading"));

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    experienceMode = null;
    voiceControl.hidden = true;
    renderStep();
  });

  if (experienceMode === "audio" && !steps[currentStep].timer) playNarration();
}

function timerPhase(seconds) {
  if (seconds > 60) return "Regardez les lignes, les plis et les contours de votre main.";
  if (seconds > 30) return "Remarquez les nuances de la peau, ses traces et ses mouvements infimes.";
  return "Ouvrez lentement la main, puis repliez doucement les doigts.";
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  const phase = document.querySelector("#timer-phase");
  const time = document.querySelector("#timer-time");
  const ring = document.querySelector("#timer-ring");
  if (!phase || !time || !ring) return;
  phase.textContent = timerPhase(remainingSeconds);
  time.textContent = formatTime(remainingSeconds);
  ring.style.setProperty("--progress", `${((90 - remainingSeconds) / 90) * 360}deg`);
}

function startTimer() {
  timerRunning = true;
  updateTimerDisplay();
  if (experienceMode === "audio") {
    playObservationInstruction(90);
  } else {
    narrationAudio.src = "../son-signature-editions-la.mp3?v=1";
    narrationAudio.muted = true;
    narrationAudio.play().then(() => {
      narrationAudio.pause(); narrationAudio.currentTime = 0; narrationAudio.muted = false;
    }).catch(() => { narrationAudio.muted = false; });
  }

  const pauseButton = document.querySelector("#pause-timer");
  const resetButton = document.querySelector("#reset-timer");

  pauseButton.addEventListener("click", () => {
    if (timerRunning) {
      if (timerId) window.clearInterval(timerId);
      timerId = null;
      timerRunning = false;
      if (experienceMode === "audio") narrationAudio.pause();
      pauseButton.textContent = "Reprendre";
      if (experienceMode === "audio") voiceControl.textContent = "Mode audio · Reprendre";
    } else {
      timerRunning = true;
      pauseButton.textContent = "Pause";
      if (experienceMode === "audio") {
        if (narrationAudio.ended && observationInstructions[remainingSeconds]) playObservationInstruction(remainingSeconds);
        else if (!narrationAudio.ended) narrationAudio.play().catch(() => {});
        voiceControl.textContent = "Mode audio · Pause";
      }
      runTimer();
    }
  });

  resetButton.addEventListener("click", () => {
    stopTimer();
    remainingSeconds = 90;
    updateTimerDisplay();
    timerRunning = true;
    pauseButton.textContent = "Pause";
    runTimer();
  });

  runTimer();
}

function playObservationInstruction(seconds) {
  const file = observationInstructions[seconds];
  if (experienceMode !== "audio" || !file) return;
  narrationAudio.src = `${file}?v=1`;
  narrationAudio.currentTime = 0;
  narrationAudio.play().catch(() => {});
}

function runTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();
    if (remainingSeconds === 60 || remainingSeconds === 30) playObservationInstruction(remainingSeconds);
    if (remainingSeconds <= 0) {
      finishObservation();
    }
  }, 1000);
}

function finishObservation() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  timerRunning = false;
  observationFinishing = true;
  remainingSeconds = 0;
  updateTimerDisplay();
  const pauseButton = document.querySelector("#pause-timer");
  if (pauseButton) pauseButton.disabled = true;
  narrationAudio.pause();
  narrationAudio.src = "../son-signature-editions-la.mp3?v=1";
  narrationAudio.currentTime = 0;
  narrationAudio.play().catch(() => { currentStep = 4; renderStep(); });
  narrationAudio.addEventListener("ended", () => { currentStep = 4; renderStep(); }, { once: true });
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
  if (steps[currentStep].timer && !observationFinishing) {
    document.querySelector("#pause-timer")?.click();
    return;
  }
  if (observationFinishing) {
    if (narrationAudio.paused) { narrationAudio.play().catch(() => {}); voiceControl.textContent = "Mode audio · Pause"; }
    else { narrationAudio.pause(); voiceControl.textContent = "Mode audio · Reprendre"; }
    return;
  }
  if (autoAdvanceId) {
    autoAdvanceRemaining = Math.max(0, autoAdvanceDeadline - Date.now());
    window.clearTimeout(autoAdvanceId); autoAdvanceId = null; audioPaused = true;
    voiceControl.textContent = "Mode audio · Reprendre";
    return;
  }
  if (audioPaused && narrationAudio.ended) {
    audioPaused = false; voiceControl.textContent = "Mode audio · Pause";
    scheduleAutoAdvance(autoAdvanceRemaining); return;
  }
  if (narrationAudio.paused) {
    if (narrationAudio.ended) narrationAudio.currentTime = 0;
    narrationAudio.play().catch(() => {}); audioPaused = false;
    voiceControl.textContent = "Mode audio · Pause";
  } else {
    narrationAudio.pause(); audioPaused = true; voiceControl.textContent = "Mode audio · Reprendre";
  }
});

narrationAudio.addEventListener("ended", () => {
  if (experienceMode === "audio" && !steps[currentStep].timer) scheduleAutoAdvance();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" && !nextButton.hidden) nextButton.click();
  if (event.key === "ArrowLeft" && !backButton.hidden) backButton.click();
});

renderStep();
