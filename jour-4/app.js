const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 4</p>
        <h1>Retenir</h1>
        <div class="copy">
          <p>Certaines choses n’apparaissent qu’un instant.</p>
          <p>Aujourd’hui, nous n’essaierons pas de les garder.</p>
          <p class="quiet">L’expérience dure environ cinq minutes.</p>
        </div>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Trouver ce qui change</p>
        <h2>Cherchez autour de vous quelque chose qui ne reste jamais tout à fait identique.</h2>
        <ul class="possibilities">
          <li>une lumière sur un mur</li>
          <li>des feuilles en mouvement</li>
          <li>un reflet</li>
          <li>de la vapeur</li>
          <li>un nuage</li>
          <li>un visage vivant</li>
        </ul>
        <div class="copy"><p class="quiet">Choisissez ce qui est réellement accessible là où vous êtes.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ne rien prélever</p>
        <h2>Si votre téléphone est dans votre main, posez-le.</h2>
        <div class="copy">
          <p>Pendant deux minutes, ne photographiez pas, ne filmez pas et ne cherchez pas à produire un souvenir.</p>
        </div>
        <p class="prompt">Regardez seulement ce qui change.</p>
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
            <div class="timer-phase" id="timer-phase">Regardez ce qui apparaît.</div>
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
        <p class="eyebrow">Laisser partir</p>
        <h2>Détournez maintenant le regard.</h2>
        <div class="copy">
          <p>Ne cherchez pas immédiatement à reconstruire l’image.</p>
          <p>Laissez ce moment ne plus être là.</p>
        </div>
        <p class="pause-count" id="pause-count">10 secondes</p>
      </div>`,
    pause: true,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui demeure</p>
        <h2>Vous n’avez rien enregistré.</h2>
        <div class="copy">
          <p>Pourtant, rien n’a été perdu.</p>
          <p>Le moment a été pleinement vécu avant de passer.</p>
          <p class="quiet">Il peut rester une impression, une couleur ou presque rien. Cela suffit.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Lorsque quelque chose vous paraît beau, résistez une fois au geste de le capturer.</h2>
        <div class="copy"><p>Restez devant lui quelques secondes.</p></div>
        <p class="prompt">Ne le prenez pas.<br />Laissez-le vous atteindre.</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Un dernier regard</p>
        <h2>Tout ce qui passe n’a pas besoin d’être retenu.</h2>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 4 · Fin</p>
        <h2>La Traversée continue là où vous êtes.</h2>
        <div class="copy"><p>Demain, nous regarderons ce qui apparaît lorsque nous cessons de corriger ce qui est.</p></div>
        <a class="primary" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let pauseId = null;
let remainingSeconds = 120;
let timerRunning = false;

function stopTimers() {
  if (timerId) window.clearInterval(timerId);
  if (pauseId) window.clearInterval(pauseId);
  timerId = null;
  pauseId = null;
  timerRunning = false;
}

function updateProgress() {
  progressLabel.textContent = `${currentStep + 1} / ${steps.length}`;
  progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
}

function renderStep() {
  stopTimers();
  stage.innerHTML = steps[currentStep].html;
  updateProgress();
  backButton.hidden = currentStep === 0;
  nextButton.hidden = Boolean(steps[currentStep].manual || steps[currentStep].timer || steps[currentStep].pause || steps[currentStep].final);
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

  if (steps[currentStep].pause) startQuietPause();
}

function timerPhase(seconds) {
  if (seconds > 60) return "Regardez ce qui apparaît. La lumière, la forme, le mouvement, les détails.";
  return "Regardez ce qui disparaît. Ce qui était là ne l’est déjà plus tout à fait.";
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
      if (timerId) window.clearInterval(timerId);
      timerId = null;
      timerRunning = false;
      pauseButton.textContent = "Reprendre";
    } else {
      timerRunning = true;
      pauseButton.textContent = "Pause";
      runTimer();
    }
  });

  resetButton.addEventListener("click", () => {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
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
      stopTimers();
      remainingSeconds = 120;
      currentStep = 4;
      renderStep();
    }
  }, 1000);
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

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" && !nextButton.hidden) nextButton.click();
  if (event.key === "ArrowLeft" && !backButton.hidden) backButton.click();
});

renderStep();
