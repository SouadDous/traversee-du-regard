const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");

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
      </div>`,
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
        <h2>Pendant trois minutes, vous allez seulement écouter.</h2>
        <div class="copy">
          <p>D’abord, le son le plus proche.</p>
          <p>Puis, le son le plus lointain.</p>
          <p>Enfin, tous les sons ensemble, sans chercher à les nommer.</p>
          <p class="quiet">Rien ne doit devenir silencieux. Vous n’avez rien à réussir.</p>
        </div>
        <button class="primary" id="start-timer" type="button">Commencer les trois minutes</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner timer-wrap">
        <p class="eyebrow">L’écoute</p>
        <div class="timer-ring" id="timer-ring" role="timer" aria-label="Trois minutes d’écoute">
          <div class="timer-content">
            <div class="timer-phase" id="timer-phase">Le son le plus proche.</div>
            <div class="timer-time" id="timer-time">03:00</div>
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
        <a class="primary" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
        <div><button class="text-button" id="restart" type="button">Recommencer</button></div>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let remainingSeconds = 180;
let timerRunning = false;

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  timerRunning = false;
}

function updateProgress() {
  progressLabel.textContent = `${currentStep + 1} / ${steps.length}`;
  progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
}

function renderStep() {
  stopTimer();
  stage.innerHTML = steps[currentStep].html;
  updateProgress();
  backButton.hidden = currentStep === 0;
  nextButton.hidden = Boolean(steps[currentStep].manual || steps[currentStep].timer || steps[currentStep].final);
  stage.focus({ preventScroll: true });

  const startButton = document.querySelector("#start-timer");
  if (startButton) {
    startButton.addEventListener("click", () => {
      remainingSeconds = 180;
      currentStep = 3;
      renderStep();
      startTimer();
    });
  }

  const restartButton = document.querySelector("#restart");
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      currentStep = 0;
      renderStep();
    });
  }
}

function timerPhase(seconds) {
  if (seconds > 120) return "Le son le plus proche.";
  if (seconds > 60) return "Le son le plus lointain.";
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
  ring.style.setProperty("--progress", `${((180 - remainingSeconds) / 180) * 360}deg`);
}

function startTimer() {
  timerRunning = true;
  updateTimerDisplay();

  const pauseButton = document.querySelector("#pause-timer");
  const resetButton = document.querySelector("#reset-timer");

  pauseButton.addEventListener("click", () => {
    if (timerRunning) {
      stopTimer();
      pauseButton.textContent = "Reprendre";
    } else {
      timerRunning = true;
      pauseButton.textContent = "Pause";
      runTimer();
    }
  });

  resetButton.addEventListener("click", () => {
    stopTimer();
    remainingSeconds = 180;
    updateTimerDisplay();
    pauseButton.textContent = "Commencer";
  });

  runTimer();
}

function runTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();
    if (remainingSeconds <= 0) {
      stopTimer();
      remainingSeconds = 180;
      currentStep = 4;
      renderStep();
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

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" && !nextButton.hidden) nextButton.click();
  if (event.key === "ArrowLeft" && !backButton.hidden) backButton.click();
});

renderStep();
