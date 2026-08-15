const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 2</p>
        <h1>Nommer</h1>
        <div class="copy">
          <p>L’expérience dure environ cinq minutes.</p>
          <p>Choisissez un objet ordinaire à portée de regard. Un objet que vous connaissez bien et que vous ne regardez presque plus.</p>
        </div>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Le premier regard</p>
        <h2>Regardez cet objet.</h2>
        <p class="prompt">Quel est son nom&nbsp;?</p>
        <div class="copy"><p class="quiet">Laissez le mot apparaître mentalement, puis poursuivez.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce que le mot contient</p>
        <h2>Lorsque nous nommons une chose, nous croyons souvent l’avoir vue.</h2>
        <div class="copy">
          <p>Pourtant, son nom ne dit presque rien de ce qui se trouve réellement devant nous.</p>
        </div>
        <p class="prompt">Regardez maintenant sans chercher d’autres mots.</p>
        <button class="primary" id="start-observation" type="button">Commencer l’observation</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner timer-wrap">
        <p class="eyebrow">L’observation</p>
        <div class="timer-ring" id="timer-ring" role="timer" aria-label="Deux minutes d’observation">
          <div class="timer-content">
            <div class="timer-phase" id="timer-phase">Regardez ses formes, ses lignes et ses contours.</div>
            <div class="timer-time" id="timer-time">02:00</div>
          </div>
        </div>
        <p class="observation-note">Si un mot apparaît, laissez-le passer et revenez simplement à ce que vous voyez.</p>
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
        <p class="eyebrow">Après l’observation</p>
        <h2>Détournez les yeux quelques secondes.</h2>
        <div class="copy"><p>Puis regardez de nouveau l’objet.</p></div>
        <p class="prompt">Est-il exactement celui que vous pensiez connaître&nbsp;?</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui a eu lieu</p>
        <h2>Le mot n’a pas disparu.</h2>
        <div class="copy">
          <p>Mais, pendant un instant, il n’a plus suffi.</p>
          <p>La chose a pu redevenir présente.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Trois choses familières.</h2>
        <div class="copy">
          <p>Aujourd’hui, choisissez trois choses familières&nbsp;: une plante, un visage, un objet utilisé quotidiennement.</p>
          <p>Avant de les nommer, regardez-les pendant quelques secondes.</p>
          <p class="quiet">Voyez ce qui apparaît avant que le mot ne referme le regard.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Un dernier regard</p>
        <h2>Une chose ne se réduit pas au nom que nous lui donnons.</h2>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 2 · Fin</p>
        <h2>La Traversée continue là où vous êtes.</h2>
        <div class="copy"><p>Demain, nous regarderons ce que nos commentaires ajoutent à ce qui arrive.</p></div>
        <a class="primary" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let remainingSeconds = 120;
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

  document.querySelector("#start-observation")?.addEventListener("click", () => {
    remainingSeconds = 120;
    currentStep = 3;
    renderStep();
    startTimer();
  });

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    renderStep();
  });
}

function timerPhase(seconds) {
  if (seconds > 60) return "Regardez ses formes, ses lignes et ses contours.";
  return "Regardez ses couleurs, ses ombres et la lumière qui le touche.";
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
    remainingSeconds = 120;
    updateTimerDisplay();
    timerRunning = true;
    pauseButton.textContent = "Pause";
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
      stopTimer();
      remainingSeconds = 120;
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
