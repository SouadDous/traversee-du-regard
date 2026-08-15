const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");

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
        </div>
        <p class="prompt">Mais où l’un finit-il exactement et où l’autre commence-t-il&nbsp;?</p>
        <div class="copy"><p class="quiet">L’expérience dure environ cinq minutes.</p></div>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Prendre place</p>
        <h2>Asseyez-vous ou restez debout dans une position confortable.</h2>
        <div class="copy">
          <p>Ne fermez pas nécessairement les yeux.</p>
          <p>Remarquez les endroits où votre corps rencontre ce qui l’entoure.</p>
        </div>
        <ul class="contacts">
          <li>le sol</li>
          <li>le siège</li>
          <li>un vêtement</li>
          <li>l’air sur la peau</li>
        </ul>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La proposition</p>
        <h2>Pendant 90 secondes, observez trois formes de contact.</h2>
        <ul class="contacts">
          <li>ce qui vous porte</li>
          <li>l’air qui entre et sort</li>
          <li>ce qui vous atteint sans être touché</li>
        </ul>
        <div class="copy"><p class="quiet">Ne modifiez pas votre respiration. Ne cherchez aucun état particulier.</p></div>
        <button class="primary" id="start-observation" type="button">Commencer l’expérience</button>
      </div>`,
    manual: true,
  },
  {
    html: timerScreen(
      "Première phase · Le contact",
      "Sentez le poids du corps rencontrer le sol ou le siège.",
      "Pouvez-vous trouver une ligne précise séparant la sensation du support&nbsp;?"
    ),
    timer: true,
  },
  {
    html: timerScreen(
      "Deuxième phase · L’air",
      "Remarquez l’air qui entre et sort naturellement.",
      "Quelque chose qui était dehors devient continuellement une part de votre respiration."
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
        <h2>Ouvrez pleinement le regard autour de vous.</h2>
        <p class="prompt">Étiez-vous devant votre environnement, ou déjà au milieu de lui&nbsp;?</p>
        <div class="copy"><p class="quiet">Il n’est pas nécessaire de trouver une réponse.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui demeure</p>
        <h2>La frontière du corps existe.</h2>
        <div class="copy">
          <p>Elle protège, distingue et rend la relation possible. Mais elle n’est pas une muraille immobile.</p>
          <p>À chaque instant, quelque chose circule entre ce que nous appelons «&nbsp;moi&nbsp;» et ce que nous appelons «&nbsp;le monde&nbsp;».</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Lors d’un passage entre intérieur et extérieur, arrêtez-vous quelques secondes.</h2>
        <div class="copy">
          <p>Une porte, une fenêtre, un seuil, une sortie.</p>
          <p>Remarquez l’air, la lumière ou la température qui change.</p>
        </div>
        <p class="prompt">Où commence vraiment le dehors&nbsp;?</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 6 · Fin</p>
        <h2>Nous ne regardons pas le monde depuis l’extérieur. Nous sommes déjà en lui.</h2>
        <div class="copy">
          <p>Demain, il ne restera rien à ajouter.</p>
          <p>Seulement revenir à ce qui est là.</p>
        </div>
        <a class="primary" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let remainingSeconds = 30;
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
    currentStep = 3;
    renderStep();
  });

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    renderStep();
  });

  if (steps[currentStep].timer) {
    remainingSeconds = 30;
    startTimer();
  }
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
    remainingSeconds = 30;
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
      currentStep += 1;
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
