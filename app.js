const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const narrationAudio = document.querySelector("#narration-audio");
const voiceControl = document.querySelector("#voice-control");

const audioFiles = [
  "jour-1-ecran-1.mp3",
  "jour-1-ecran-2.mp3",
  "jour-1-ecran-3.mp3",
  "jour-1-guide-audio.mp3",
  "jour-1-ecran-5.mp3",
  "jour-1-ecran-6.mp3",
  "jour-1-ecran-7.mp3",
  "jour-1-ecran-8.mp3",
];

const listeningInstructions = {
  120: "jour-1-consigne-1.mp3",
  80: "jour-1-consigne-2.mp3",
  40: "jour-1-consigne-3.mp3",
};

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 1</p>
        <h1>S’arrêter</h1>
        <div class="copy">
          <p>L’expérience dure environ cinq minutes.</p>
          <p class="quiet">Assurez-vous simplement de ne pas être dérangé(e).</p>
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
        <p class="eyebrow">Avant l’arrêt</p>
        <h2>Restez exactement où vous êtes.</h2>
        <div class="copy">
          <p>Sans tendre particulièrement l’oreille, remarquez les sons que vous entendez maintenant.</p>
        </div>
        <p class="prompt">Combien en percevez-vous&nbsp;?</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La proposition</p>
        <h2>Pendant deux minutes, vous allez seulement écouter.</h2>
        <div class="copy">
          <p>D’abord, le son le plus proche.</p>
          <p>Puis, le son le plus lointain.</p>
          <p>Enfin, tous les sons ensemble, sans chercher à les nommer.</p>
          <p class="quiet">Rien ne doit devenir silencieux. Vous n’avez rien à réussir.</p>
        </div>
        <button class="primary" id="start-timer" type="button">Commencer les deux minutes</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner timer-wrap">
        <p class="eyebrow">L’écoute</p>
        <div class="timer-ring" id="timer-ring" role="timer" aria-label="Deux minutes d’écoute">
          <div class="timer-content">
            <div class="timer-phase" id="timer-phase">Le son le plus proche.</div>
            <div class="timer-time" id="timer-time">02:00</div>
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
        <p class="eyebrow">Après l’arrêt</p>
        <h2>Écoutez encore un instant.</h2>
        <p class="prompt">Combien de sons percevez-vous maintenant&nbsp;?</p>
        <div class="copy">
          <p>L’un d’eux était-il présent avant que vous ne le remarquiez&nbsp;?</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui a eu lieu</p>
        <h2>Rien n’a été ajouté.</h2>
        <div class="copy">
          <p>Les sons étaient là.</p>
          <p>L’arrêt les a laissés apparaître.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Trois passages ordinaires.</h2>
        <div class="copy">
          <p>Aujourd’hui, choisissez trois passages&nbsp;: une porte franchie, un trajet qui commence, un objet que vous posez.</p>
          <p>À chacun de ces moments, arrêtez-vous le temps d’entendre un seul son avant de continuer.</p>
          <p class="quiet">Il n’est pas nécessaire de s’en souvenir parfaitement. Une seule fois suffira.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 1 · Fin</p>
        <h2>La Traversée continue là où vous êtes.</h2>
        <div class="copy">
          <p>Demain, nous regarderons ce que les mots font aux choses.</p>
        </div>
        <a class="primary" href="https://www.editionsla.com/">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
        <figure class="final-landscape" aria-hidden="true"><img src="assets/paysage-fin.png" alt="" /></figure>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let remainingSeconds = 120;
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
  narrationAudio.src = `${audioFiles[currentStep]}?v=3`;
  narrationAudio.currentTime = 0;
  narrationAudio.play().catch(() => {});
  voiceControl.textContent = "Mode audio · Pause";
}

function advanceAudioExperience() {
  clearAutoAdvance();
  if (currentStep === 2) {
    remainingSeconds = 120;
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

  const startButton = document.querySelector("#start-timer");
  if (startButton) {
    startButton.addEventListener("click", () => {
      remainingSeconds = 120;
      currentStep = 3;
      renderStep();
      startTimer();
    });
  }

  document.querySelector("#choose-audio")?.addEventListener("click", () => setExperienceMode("audio"));
  document.querySelector("#choose-reading")?.addEventListener("click", () => setExperienceMode("reading"));

  const restartButton = document.querySelector("#restart");
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      currentStep = 0;
      experienceMode = null;
      voiceControl.hidden = true;
      renderStep();
    });
  }

  if (experienceMode === "audio" && !steps[currentStep].timer) playNarration();
}

function timerPhase(seconds) {
  if (seconds > 80) return "Le son le plus proche.";
  if (seconds > 40) return "Le son le plus lointain.";
  return "Tous les sons ensemble. Sans les nommer.";
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
  ring.style.setProperty("--progress", `${((120 - remainingSeconds) / 120) * 360}deg`);
}

function startTimer() {
  timerRunning = true;
  updateTimerDisplay();
  if (experienceMode === "audio") {
    playListeningInstruction(120);
  } else {
    narrationAudio.src = "son-signature-editions-la.mp3?v=3";
    narrationAudio.muted = true;
    narrationAudio.play().then(() => {
      narrationAudio.pause();
      narrationAudio.currentTime = 0;
      narrationAudio.muted = false;
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
        if (narrationAudio.ended && listeningInstructions[remainingSeconds]) {
          playListeningInstruction(remainingSeconds);
        } else if (!narrationAudio.ended) {
          narrationAudio.play().catch(() => {});
        }
        voiceControl.textContent = "Mode audio · Pause";
      }
      runTimer();
    }
  });

  resetButton.addEventListener("click", () => {
    stopTimer();
    remainingSeconds = 120;
    updateTimerDisplay();
    pauseButton.textContent = "Commencer";
    narrationAudio.currentTime = 0;
  });

  runTimer();
}

function playListeningInstruction(seconds) {
  const file = listeningInstructions[seconds];
  if (experienceMode !== "audio" || !file) return;
  narrationAudio.src = `${file}?v=5`;
  narrationAudio.currentTime = 0;
  narrationAudio.play().catch(() => {});
}

function runTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();
    if (remainingSeconds === 80 || remainingSeconds === 40) {
      playListeningInstruction(remainingSeconds);
    }
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
  narrationAudio.src = "son-signature-editions-la.mp3?v=3";
  narrationAudio.currentTime = 0;
  narrationAudio.play().catch(() => {
    currentStep = 4;
    renderStep();
  });
  narrationAudio.addEventListener("ended", () => {
    currentStep = 4;
    renderStep();
  }, { once: true });
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
    if (narrationAudio.paused) {
      narrationAudio.play().catch(() => {});
      voiceControl.textContent = "Mode audio · Pause";
    } else {
      narrationAudio.pause();
      voiceControl.textContent = "Mode audio · Reprendre";
    }
    return;
  }
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
    scheduleAutoAdvance(autoAdvanceRemaining);
    return;
  }
  if (narrationAudio.paused) {
    if (narrationAudio.ended) narrationAudio.currentTime = 0;
    narrationAudio.play().catch(() => {});
    audioPaused = false;
    voiceControl.textContent = "Mode audio · Pause";
  } else {
    narrationAudio.pause();
    audioPaused = true;
    voiceControl.textContent = "Mode audio · Reprendre";
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
