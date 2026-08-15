const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 3</p>
        <h1>Commenter</h1>
        <div class="copy">
          <p>Nous ne rencontrons pas seulement ce qui arrive.</p>
          <p>Nous rencontrons aussi ce que nous en disons.</p>
          <p class="quiet">Choisissez un petit désagrément récent, encore présent à votre esprit. Quelque chose de mineur, sans raviver une situation douloureuse.</p>
        </div>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">L’événement</p>
        <h2>Revenez brièvement à ce moment.</h2>
        <p class="prompt">Que s’est-il passé, concrètement&nbsp;?</p>
        <div class="copy"><p class="quiet">Ne cherchez pas encore à l’expliquer.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Le fait seul</p>
        <h2>Formulez l’événement en une seule phrase.</h2>
        <div class="copy"><p>Uniquement ce qu’une caméra aurait pu enregistrer.</p></div>
        <div class="contrast">
          <p>«&nbsp;La personne n’a pas répondu à mon message.&nbsp;»</p>
          <p class="quiet">Et non&nbsp;: «&nbsp;Elle m’ignore.&nbsp;»</p>
        </div>
        <button class="primary" id="fact-ready" type="button">J’ai formulé le fait</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Ce qui s’ajoute</p>
        <h2>Laissez revenir ce que vous vous êtes dit à propos de ce fait.</h2>
        <ul class="examples">
          <li>Ce n’est pas normal.</li>
          <li>Cela arrive toujours.</li>
          <li>La personne aurait dû…</li>
          <li>Cela signifie que…</li>
        </ul>
        <p class="prompt">Combien de ces phrases décrivent réellement ce qui s’est passé&nbsp;?</p>
        <button class="primary" id="start-observation" type="button">Observer pendant 90 secondes</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner timer-wrap">
        <p class="eyebrow">L’expérience du commentaire</p>
        <div class="timer-ring" id="timer-ring" role="timer" aria-label="Quatre-vingt-dix secondes d’observation">
          <div class="timer-content">
            <div class="timer-phase" id="timer-phase">Laissez apparaître le fait et les commentaires qui l’accompagnent.</div>
            <div class="timer-time" id="timer-time">01:30</div>
          </div>
        </div>
        <p class="observation-note">Il n’est pas nécessaire de faire disparaître les pensées. Distinguez seulement ce qui est arrivé de ce qui s’y ajoute.</p>
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
        <p class="eyebrow">Ce qui demeure</p>
        <h2>Revenez une dernière fois à la phrase factuelle.</h2>
        <p class="prompt">Lorsque le commentaire se retire, que reste-t-il de l’événement&nbsp;?</p>
        <div class="copy">
          <p>La situation n’a peut-être pas changé.</p>
          <p>Votre manière de la rencontrer, peut-être.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Une distinction essentielle</p>
        <h2>Retirer le commentaire ne signifie pas nier ce qui s’est passé.</h2>
        <div class="copy">
          <p>Cela n’oblige ni à accepter, ni à pardonner, ni à rester silencieux.</p>
          <p>Cela permet seulement de répondre au fait plutôt qu’au récit construit autour de lui.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Emporter l’expérience</p>
        <h2>Lorsqu’une contrariété apparaît, arrêtez-vous un instant.</h2>
        <p class="prompt">«&nbsp;Pour l’instant, le fait est…&nbsp;»</p>
        <div class="copy">
          <p>Puis observez ce qui vient immédiatement après&nbsp;: une explication, une accusation, une anticipation ou une généralisation.</p>
          <p class="quiet">Il n’est pas nécessaire de les combattre. Seulement de les reconnaître.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 3 · Fin</p>
        <h2>Le commentaire peut être utile. Mais il n’est pas l’événement.</h2>
        <div class="copy"><p>Demain, nous regarderons ce que nous faisons lorsque nous voulons retenir ce qui passe.</p></div>
        <a class="primary" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let remainingSeconds = 90;
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

  document.querySelector("#fact-ready")?.addEventListener("click", () => {
    currentStep = 3;
    renderStep();
  });

  document.querySelector("#start-observation")?.addEventListener("click", () => {
    remainingSeconds = 90;
    currentStep = 4;
    renderStep();
    startTimer();
  });

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    renderStep();
  });
}

function timerPhase(seconds) {
  if (seconds > 45) return "Laissez apparaître le fait et les commentaires qui l’accompagnent.";
  return "Gardez seulement la phrase factuelle. Laissez les autres phrases se retirer.";
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
    remainingSeconds = 90;
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
      remainingSeconds = 90;
      currentStep = 5;
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
