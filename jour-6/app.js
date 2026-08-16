const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const narrationAudio = document.querySelector("#narration-audio");
const voiceControl = document.querySelector("#voice-control");

const audioFiles = [
  "jour-6-ecran-1.mp3",
  "jour-6-ecran-2.mp3",
  "jour-6-ecran-3.mp3",
  "jour-6-consigne-1.mp3",
  "jour-6-consigne-2.mp3",
  "jour-6-consigne-3.mp3",
  "jour-6-ecran-7.mp3",
  "jour-6-ecran-8.mp3",
  "jour-6-ecran-9.mp3",
  "jour-6-ecran-10.mp3",
];

function timerScreen(eyebrow, instruction, detail) {
  return `
    <div class="stage-inner timer-wrap">
      <p class="eyebrow">${eyebrow}</p>
      <div class="timer-ring" id="timer-ring" role="timer" aria-label="Trente secondes d’observation">
        <div class="timer-content">
          <div class="timer-phase">${instruction}</div>
          <div class="timer-time" id="timer-time">00:30</div>
        </div>
      </div>
      <p class="quiet">${detail}</p>
      <div class="timer-actions">
        <button class="text-button" id="pause-timer" type="button">Pause</button>
        <button class="text-button" id="reset-timer" type="button">Recommencer</button>
      </div>
    </div>`;
}

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 6</p>
        <h1>Séparer</h1>
        <div class="copy">
          <p>Nous disons&nbsp;: mon corps, la chaise, l’air, le monde autour de moi.</p>
          <p>Nous traçons des frontières pour distinguer les choses.</p>
          <p>Aujourd’hui, nous regarderons ce qui se passe à l’endroit même où elles se rencontrent.</p>
        </div>
        <p class="prompt">Où le corps finit-il exactement&nbsp;?<br />Où le monde commence-t-il&nbsp;?</p>
        <div class="copy"><p class="quiet">L’expérience dure environ cinq minutes.</p></div>
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
        <p class="eyebrow">Prendre place</p>
        <h2>Asseyez-vous, ou restez debout dans une position confortable.</h2>
        <div class="copy">
          <p>Vous pouvez garder les yeux ouverts.</p>
          <p>Sans modifier votre posture, remarquez les endroits où votre corps rencontre ce qui l’entoure&nbsp;:</p>
        </div>
        <ul class="contacts">
          <li>le sol</li>
          <li>le siège</li>
          <li>vos vêtements</li>
          <li>l’air sur votre peau</li>
        </ul>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La proposition</p>
        <h2>Pendant quatre-vingt-dix secondes, observez trois formes de contact.</h2>
        <ul class="contacts">
          <li>ce qui vous porte</li>
          <li>l’air qui entre et sort</li>
          <li>ce qui vous atteint sans vous toucher</li>
        </ul>
        <div class="copy">
          <p>Ne modifiez pas votre respiration.</p>
          <p class="quiet">Ne cherchez aucun état particulier.</p>
        </div>
        <button class="primary" id="start-observation" type="button">Commencer l’expérience</button>
      </div>`,
    manual: true,
  },
  {
    html: timerScreen(
      "Première phase · Le contact",
      "Sentez le poids de votre corps rencontrer le sol ou le siège.",
      "Pouvez-vous trouver une ligne précise séparant la sensation de ce qui vous porte&nbsp;?"
    ),
    timer: true,
  },
  {
    html: timerScreen(
      "Deuxième phase · L’air",
      "Remarquez l’air qui entre et sort naturellement.",
      "Ce qui était dehors entre en vous. Ce qui était en vous retourne au monde."
    ),
    timer: true,
  },
  {
    html: timerScreen(
      "Troisième phase · Ce qui vous atteint",
      "Laissez les sons, la lumière et la température venir jusqu’à vous.",
      "Vous n’avez pas besoin d’aller vers le monde pour qu’il vous atteigne."
    ),
    timer: true,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Après l’expérience</p>
        <h2>Regardez maintenant autour de vous.</h2>
        <p class="prompt">Étiez-vous face à votre environnement, ou déjà au milieu de lui&nbsp;?</p>
        <div class="copy"><p class="quiet">Il n’est pas nécessaire de trouver une réponse.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui demeure</p>
        <h2>La frontière du corps existe.</h2>
        <div class="copy">
          <p>Elle protège. Elle distingue. Elle rend la relation possible.</p>
          <p>Mais elle n’est pas une muraille immobile.</p>
          <p>À chaque instant, quelque chose circule entre ce que nous appelons «&nbsp;moi&nbsp;» et ce que nous appelons «&nbsp;le monde&nbsp;».</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Lorsque vous franchirez un seuil, arrêtez-vous quelques secondes.</h2>
        <div class="copy">
          <p>Une porte. Une entrée. Une sortie.</p>
          <p>Remarquez le moment où l’air, la lumière ou la température change.</p>
        </div>
        <p class="prompt">Où commence vraiment le dehors&nbsp;?</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 6 · Fin</p>
        <h2>Nous ne regardons pas le monde depuis l’extérieur.</h2>
        <div class="copy">
          <p>Nous sommes déjà en lui.</p>
          <p>Demain, il ne restera rien à ajouter.</p>
          <p>Seulement revenir à ce qui est là.</p>
        </div>
        <a class="primary" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
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
    currentStep = 3;
    renderStep();
    return;
  }
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep();
  }
}

function scheduleAutoAdvance(delay = 2000) {
  if (experienceMode !== "audio" || steps[currentStep].timer || currentStep === steps.length - 1) return;
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
  observationFinishing = false;
  stage.innerHTML = steps[currentStep].html;
  document.body.classList.toggle("is-final", Boolean(steps[currentStep].final));
  updateProgress();
  backButton.hidden = currentStep === 0;
  nextButton.hidden = Boolean(steps[currentStep].manual || steps[currentStep].timer || steps[currentStep].final);
  voiceControl.hidden = experienceMode !== "audio";
  stage.focus({ preventScroll: true });

  document.querySelector("#choose-audio")?.addEventListener("click", () => setExperienceMode("audio"));
  document.querySelector("#choose-reading")?.addEventListener("click", () => setExperienceMode("reading"));
  document.querySelector("#start-observation")?.addEventListener("click", () => {
    currentStep = 3;
    renderStep();
  });

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    experienceMode = null;
    voiceControl.hidden = true;
    renderStep();
  });

  if (steps[currentStep].timer) startTimer();
  else if (experienceMode === "audio") playNarration();
}

function formatTime(seconds) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  const time = document.querySelector("#timer-time");
  const ring = document.querySelector("#timer-ring");
  if (!time || !ring) return;
  time.textContent = formatTime(remainingSeconds);
  ring.style.setProperty("--progress", `${((30 - remainingSeconds) / 30) * 360}deg`);
}

function startTimer() {
  remainingSeconds = 30;
  timerRunning = true;
  updateTimerDisplay();

  if (experienceMode === "audio") {
    narrationAudio.src = `${audioFiles[currentStep]}?v=1`;
    narrationAudio.currentTime = 0;
    narrationAudio.play().catch(() => {});
  }

  const pauseButton = document.querySelector("#pause-timer");
  const resetButton = document.querySelector("#reset-timer");

  pauseButton.addEventListener("click", () => {
    if (timerRunning) {
      stopTimer();
      if (experienceMode === "audio") narrationAudio.pause();
      pauseButton.textContent = "Reprendre";
      if (experienceMode === "audio") voiceControl.textContent = "Mode audio · Reprendre";
    } else {
      timerRunning = true;
      pauseButton.textContent = "Pause";
      if (experienceMode === "audio" && !narrationAudio.ended) narrationAudio.play().catch(() => {});
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
    if (experienceMode === "audio") {
      narrationAudio.currentTime = 0;
      narrationAudio.play().catch(() => {});
      voiceControl.textContent = "Mode audio · Pause";
    }
    runTimer();
  });

  runTimer();
}

function runTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();
    if (remainingSeconds <= 0) finishTimedPhase();
  }, 1000);
}

function finishTimedPhase() {
  stopTimer();
  remainingSeconds = 0;
  updateTimerDisplay();

  if (currentStep < 5) {
    currentStep += 1;
    renderStep();
    return;
  }

  observationFinishing = true;
  const pauseButton = document.querySelector("#pause-timer");
  if (pauseButton) pauseButton.disabled = true;
  narrationAudio.pause();
  narrationAudio.src = "../son-signature-editions-la.mp3?v=1";
  narrationAudio.currentTime = 0;
  narrationAudio.play().catch(showPostObservation);
  narrationAudio.addEventListener("ended", showPostObservation, { once: true });
}

function showPostObservation() {
  currentStep = 6;
  renderStep();
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
  if (experienceMode === "audio" && !steps[currentStep].timer && !observationFinishing) {
    scheduleAutoAdvance();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" && !nextButton.hidden) nextButton.click();
  if (event.key === "ArrowLeft" && !backButton.hidden) backButton.click();
});

renderStep();
