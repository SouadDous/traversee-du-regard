const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const narrationAudio = document.querySelector("#narration-audio");
const voiceControl = document.querySelector("#voice-control");

const audioFiles = [
  "jour-5-ecran-1.mp3",
  "jour-5-ecran-2.mp3",
  "jour-5-ecran-3.mp3",
  "jour-5-guide-audio.mp3",
  "jour-5-ecran-5.mp3",
  "jour-5-ecran-6.mp3",
  "jour-5-ecran-7.mp3",
  "jour-5-ecran-8.mp3",
  "jour-5-ecran-9.mp3",
];

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 5</p>
        <h1>Corriger</h1>
        <div class="copy">
          <p>Nous regardons rarement une chose sans imaginer aussitôt comment elle devrait être.</p>
          <p>Aujourd’hui, nous laisserons quelque chose être exactement comme il est.</p>
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
        <p class="eyebrow">Choisir une imperfection</p>
        <h2>Trouvez autour de vous quelque chose qui appelle légèrement une correction.</h2>
        <ul class="possibilities">
          <li>un tissu froissé</li>
          <li>un objet déplacé</li>
          <li>une feuille abîmée</li>
          <li>une tasse ébréchée</li>
          <li>un coin imparfaitement rangé</li>
        </ul>
        <div class="copy"><p class="quiet">Choisissez quelque chose de sans conséquence, qui ne nécessite aucune intervention immédiate.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">L’impulsion</p>
        <h2>Regardez cette chose.</h2>
        <p class="prompt">Que voudriez-vous changer en elle&nbsp;?</p>
        <div class="copy">
          <p>Ne la touchez pas encore.</p>
          <p class="quiet">Observez simplement le mouvement qui voudrait redresser, déplacer, arranger ou améliorer.</p>
        </div>
        <button class="primary" id="start-observation" type="button">Observer sans corriger</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner timer-wrap">
        <p class="eyebrow">L’observation</p>
        <div class="timer-ring" id="timer-ring" role="timer" aria-label="Trente secondes d’observation">
          <div class="timer-content">
            <div class="timer-phase" id="timer-phase">Regardez ce que vous appelez imparfait.</div>
            <div class="timer-time" id="timer-time">00:30</div>
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
        <p class="eyebrow">Choisir le geste</p>
        <h2>Maintenant, choisissez.</h2>
        <p class="prompt">Corrigez cette chose, ou laissez-la comme elle est.</p>
        <div class="copy">
          <p>L’important n’est pas votre décision.</p>
          <p>C’est d’avoir vu ce qui précédait le geste.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Une distinction importante</p>
        <h2>Laisser être ne signifie pas renoncer à agir.</h2>
        <div class="copy">
          <p>Vous pourrez ranger, réparer ou transformer ce qui doit l’être.</p>
          <p>Mais l’action peut venir après le regard — et non à la place du regard.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Remarquez une fois cette phrase silencieuse.</h2>
        <p class="prompt">«&nbsp;Cela devrait être autrement.&nbsp;»</p>
        <div class="copy">
          <p>Avant d’agir, attendez quelques secondes.</p>
          <p>Regardez ce qui est là, puis choisissez librement de modifier ou de ne pas modifier.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Un dernier regard</p>
        <h2>Ce qui est n’attend pas notre approbation pour être.</h2>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 5 · Fin</p>
        <h2>La Traversée continue là où vous êtes.</h2>
        <div class="copy"><p>Demain, nous regarderons la frontière que nous traçons entre nous et ce qui nous entoure.</p></div>
        <a class="primary" href="https://www.editionsla.com/">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
        <figure class="final-landscape" aria-hidden="true"><img src="../assets/paysage-fin.png" alt="" /></figure>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let remainingSeconds = 30;
let timerRunning = false;
let observationFinishing = false;
let experienceMode = null;
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
    remainingSeconds = 30;
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

  function beginObservation() {
    remainingSeconds = 30;
    currentStep = 3;
    renderStep();
    startTimer();
  }

  document.querySelector("#choose-audio")?.addEventListener("click", () => setExperienceMode("audio"));
  document.querySelector("#choose-reading")?.addEventListener("click", () => setExperienceMode("reading"));
  document.querySelector("#start-observation")?.addEventListener("click", beginObservation);

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    experienceMode = null;
    voiceControl.hidden = true;
    renderStep();
  });

  if (experienceMode === "audio" && !steps[currentStep].timer) playNarration();
}

function timerPhase(seconds) {
  if (seconds > 15) return "Observez l’impulsion de corriger. Que voudrait-elle changer ?";
  return "Retirez l’image de ce que cette chose devrait être. Regardez-la sans la corriger.";
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
  ring.style.setProperty("--progress", `${((30 - remainingSeconds) / 30) * 360}deg`);
}

function startTimer() {
  timerRunning = true;
  updateTimerDisplay();
  if (experienceMode === "audio") {
    narrationAudio.src = `${audioFiles[currentStep]}?v=2`;
    narrationAudio.currentTime = 0;
    narrationAudio.play().catch(() => {});
  } else {
    narrationAudio.src = "son-signature-editions-la.mp3?v=1";
    narrationAudio.muted = true;
    narrationAudio.play().then(() => {
      narrationAudio.pause();
      narrationAudio.currentTime = 0;
      narrationAudio.muted = false;
    }).catch(() => {
      narrationAudio.muted = false;
    });
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
      if (experienceMode === "audio") narrationAudio.play().catch(() => {});
      if (experienceMode === "audio") voiceControl.textContent = "Mode audio · Pause";
      runTimer();
    }
  });

  resetButton.addEventListener("click", () => {
    stopTimer();
    remainingSeconds = 30;
    updateTimerDisplay();
    timerRunning = true;
    pauseButton.textContent = "Pause";
    narrationAudio.currentTime = 0;
    if (experienceMode === "audio") narrationAudio.play().catch(() => {});
    if (experienceMode === "audio") voiceControl.textContent = "Mode audio · Pause";
    runTimer();
  });

  runTimer();
}

function runTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();
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
  narrationAudio.src = "son-signature-editions-la.mp3?v=1";
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
