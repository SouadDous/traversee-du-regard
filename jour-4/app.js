const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const narrationAudio = document.querySelector("#narration-audio");
const voiceControl = document.querySelector("#voice-control");
const audioFiles = [
  "jour-4-ecran-1.mp3", "jour-4-ecran-2.mp3", "jour-4-ecran-3.mp3", null,
  "jour-4-ecran-5.mp3", "jour-4-ecran-6.mp3", "jour-4-ecran-7.mp3",
  "jour-4-ecran-8.mp3", "jour-4-ecran-9.mp3", "jour-4-ecran-10.mp3",
];
const observationInstructions = {
  60: "jour-4-consigne-1.mp3", 40: "jour-4-consigne-2.mp3", 20: "jour-4-consigne-3.mp3",
};

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 4</p>
        <h1>Retenir</h1>
        <div class="copy">
          <p>Certaines choses ne se donnent qu’une fois.</p>
          <p>Au moment même où nous les regardons, elles sont déjà en train de changer.</p>
          <p>Aujourd’hui, nous n’essaierons pas de les garder.</p>
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
        <p class="eyebrow">Trouver ce qui passe</p>
        <h2>Levez les yeux de l’écran. Cherchez quelque chose qui change sous votre regard.</h2>
        <ul class="possibilities">
          <li>une lumière sur un mur</li>
          <li>des feuilles en mouvement</li>
          <li>un reflet</li>
          <li>la vapeur de votre café ou de votre thé</li>
          <li>un nuage</li>
          <li>un visage vivant</li>
        </ul>
        <div class="copy"><p class="quiet">Une ombre ou un mouvement dans la rue conviennent aussi. Rien de remarquable n’est nécessaire.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La proposition</p>
        <h2>Regardez ce qui est devant vous en sachant que cet instant précis ne reviendra pas.</h2>
        <div class="copy">
          <p>N’essayez ni de le fixer, ni de vous en souvenir.</p>
        </div>
        <p class="prompt">Laissez-le seulement avoir lieu.</p>
        <button class="primary" id="start-observation" type="button">Commencer l’observation</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner timer-wrap">
        <p class="eyebrow">L’observation</p>
        <div class="timer-ring" id="timer-ring" role="timer" aria-label="Une minute d’observation">
          <div class="timer-content">
            <div class="timer-phase" id="timer-phase">Regardez ce qui apparaît.</div>
            <div class="timer-time" id="timer-time">01:00</div>
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
        <p class="eyebrow">La disparition</p>
        <h2>Détournez maintenant le regard.</h2>
        <div class="copy">
          <p>Ne cherchez pas immédiatement à reconstruire l’image.</p>
          <p>Laissez ce moment ne plus être là.</p><p>Restez quelques secondes avec ce qui demeure.</p>
        </div>
        <p class="pause-count" id="pause-count">10 secondes</p>
      </div>`,
    pause: true,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui demeure</p>
        <h2>Le moment n’est plus là.</h2>
        <div class="copy">
          <p>Pourtant, quelque chose a été vécu.</p>
          <p>Il peut rester une couleur, une sensation, une impression — ou presque rien.</p>
          <p class="quiet">Cela suffit.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La distinction</p>
        <h2>Ce qui disparaît n’est pas nécessairement perdu.</h2>
        <div class="copy"><p>Un moment n’a pas besoin de devenir une image ou un souvenir précis pour avoir été pleinement rencontré.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Lorsqu’une chose vous touche, restez devant elle quelques secondes sans chercher à la conserver.</h2>
        <div class="copy"><p>Laissez-la vous atteindre. Puis laissez-la passer.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Un dernier regard</p>
        <h2>Retenir n’ajoute rien à ce qui a été pleinement vécu.</h2>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 4 · Fin</p>
        <h2>La Traversée continue là où vous êtes.</h2>
        <div class="copy"><p>Demain, nous regarderons ce qui apparaît lorsque nous cessons de corriger ce qui est.</p></div>
        <a class="primary" href="https://www.editionsla.com/">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
        <figure class="final-landscape" aria-hidden="true"><img src="../assets/paysage-fin.png" alt="" /></figure>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let pauseId = null;
let remainingSeconds = 60;
let timerRunning = false;
let experienceMode = null;
let observationFinishing = false;
let autoAdvanceId = null;
let autoAdvanceDeadline = 0;
let autoAdvanceRemaining = 2000;
let audioPaused = false;

function clearAutoAdvance() {
  if (autoAdvanceId) window.clearTimeout(autoAdvanceId);
  autoAdvanceId = null; autoAdvanceDeadline = 0; autoAdvanceRemaining = 2000;
}

function stopTimers() {
  if (timerId) window.clearInterval(timerId);
  if (pauseId) window.clearInterval(pauseId);
  timerId = null;
  pauseId = null;
  timerRunning = false;
  observationFinishing = false;
  narrationAudio.pause(); narrationAudio.currentTime = 0;
}

function stopNarration() {
  clearAutoAdvance(); narrationAudio.pause(); narrationAudio.currentTime = 0;
  audioPaused = false; voiceControl.textContent = "Mode audio · Pause";
}
function playNarration() {
  if (experienceMode !== "audio") return;
  audioPaused = false; narrationAudio.src = `${audioFiles[currentStep]}?v=1`;
  narrationAudio.currentTime = 0; narrationAudio.play().catch(() => {});
  voiceControl.textContent = "Mode audio · Pause";
}
function advanceAudioExperience() {
  clearAutoAdvance();
  if (currentStep === 2) { remainingSeconds = 60; currentStep = 3; renderStep(); startTimer(); return; }
  if (currentStep < steps.length - 1) { currentStep += 1; renderStep(); }
}
function scheduleAutoAdvance(delay) {
  if (experienceMode !== "audio" || currentStep === 3 || currentStep === steps.length - 1) return;
  const wait = delay ?? (currentStep === 4 ? 10000 : 2000);
  autoAdvanceRemaining = wait; autoAdvanceDeadline = Date.now() + wait;
  autoAdvanceId = window.setTimeout(advanceAudioExperience, wait);
}
function setExperienceMode(mode) {
  experienceMode = mode; voiceControl.hidden = mode !== "audio"; nextButton.hidden = false;
  document.querySelector("#experience-mode")?.remove(); if (mode === "audio") playNarration();
}

function updateProgress() {
  progressLabel.textContent = `${currentStep + 1} / ${steps.length}`;
  progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
}

function renderStep() {
  stopTimers();
  stopNarration();
  stage.innerHTML = steps[currentStep].html;
  document.body.classList.toggle("is-final", Boolean(steps[currentStep].final));
  updateProgress();
  backButton.hidden = currentStep === 0;
  nextButton.hidden = Boolean(steps[currentStep].manual || steps[currentStep].timer || steps[currentStep].pause || steps[currentStep].final);
  voiceControl.hidden = experienceMode !== "audio";
  stage.focus({ preventScroll: true });

  document.querySelector("#start-observation")?.addEventListener("click", () => {
    remainingSeconds = 60;
    currentStep = 3;
    renderStep();
    startTimer();
  });
  document.querySelector("#choose-audio")?.addEventListener("click", () => setExperienceMode("audio"));
  document.querySelector("#choose-reading")?.addEventListener("click", () => setExperienceMode("reading"));

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    experienceMode = null; voiceControl.hidden = true;
    renderStep();
  });

  if (steps[currentStep].pause && experienceMode !== "audio") startQuietPause();
  if (experienceMode === "audio" && !steps[currentStep].timer) playNarration();
}

function timerPhase(seconds) {
  if (seconds > 40) return "Regardez ce qui est là maintenant.";
  if (seconds > 20) return "Remarquez ce qui a déjà changé depuis le début de votre regard.";
  return "Voyez si quelque chose en vous cherche à retenir cet instant.";
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
  ring.style.setProperty("--progress", `${((60 - remainingSeconds) / 60) * 360}deg`);
}

function startTimer() {
  timerRunning = true;
  updateTimerDisplay();
  if (experienceMode === "audio") {
    playObservationInstruction(60);
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
    if (timerId) window.clearInterval(timerId);
    timerId = null;
    remainingSeconds = 60;
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
  narrationAudio.src = `${file}?v=1`; narrationAudio.currentTime = 0; narrationAudio.play().catch(() => {});
}

function runTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();
    if (remainingSeconds === 40 || remainingSeconds === 20) playObservationInstruction(remainingSeconds);
    if (remainingSeconds <= 0) {
      finishObservation();
    }
  }, 1000);
}

function finishObservation() {
  if (timerId) window.clearInterval(timerId);
  timerId = null; timerRunning = false; observationFinishing = true; remainingSeconds = 0; updateTimerDisplay();
  const pauseButton = document.querySelector("#pause-timer"); if (pauseButton) pauseButton.disabled = true;
  narrationAudio.pause(); narrationAudio.src = "../son-signature-editions-la.mp3?v=1"; narrationAudio.currentTime = 0;
  narrationAudio.play().catch(() => { currentStep = 4; renderStep(); });
  narrationAudio.addEventListener("ended", () => { currentStep = 4; renderStep(); }, { once: true });
}

function startQuietPause() {
  let seconds = 10;
  const count = document.querySelector("#pause-count");
  pauseId = window.setInterval(() => {
    seconds -= 1;
    if (count) count.textContent = seconds > 0 ? `${seconds} secondes` : "Vous pouvez poursuivre.";
    if (seconds <= 0) {
      window.clearInterval(pauseId);
      pauseId = null;
      nextButton.hidden = false;
      nextButton.focus();
    }
  }, 1000);
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
  if (steps[currentStep].timer && !observationFinishing) { document.querySelector("#pause-timer")?.click(); return; }
  if (observationFinishing) {
    if (narrationAudio.paused) { narrationAudio.play().catch(() => {}); voiceControl.textContent = "Mode audio · Pause"; }
    else { narrationAudio.pause(); voiceControl.textContent = "Mode audio · Reprendre"; } return;
  }
  if (autoAdvanceId) {
    autoAdvanceRemaining = Math.max(0, autoAdvanceDeadline - Date.now()); window.clearTimeout(autoAdvanceId);
    autoAdvanceId = null; audioPaused = true; voiceControl.textContent = "Mode audio · Reprendre"; return;
  }
  if (audioPaused && narrationAudio.ended) {
    audioPaused = false; voiceControl.textContent = "Mode audio · Pause"; scheduleAutoAdvance(autoAdvanceRemaining); return;
  }
  if (narrationAudio.paused) {
    if (narrationAudio.ended) narrationAudio.currentTime = 0;
    narrationAudio.play().catch(() => {}); audioPaused = false; voiceControl.textContent = "Mode audio · Pause";
  } else { narrationAudio.pause(); audioPaused = true; voiceControl.textContent = "Mode audio · Reprendre"; }
});
narrationAudio.addEventListener("ended", () => {
  if (experienceMode === "audio" && !steps[currentStep].timer) scheduleAutoAdvance();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" && !nextButton.hidden) nextButton.click();
  if (event.key === "ArrowLeft" && !backButton.hidden) backButton.click();
});

renderStep();
