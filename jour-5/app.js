const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");
const guideAudio = document.querySelector("#guide-audio");

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
      </div>`,
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
        <div class="mode-actions">
          <button class="primary" id="start-audio" type="button">Observer avec la voix</button>
          <button class="secondary-button" id="start-silent" type="button">Observer en silence</button>
        </div>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner timer-wrap">
        <p class="eyebrow">L’observation</p>
        <div class="timer-ring" id="timer-ring" role="timer" aria-label="Quarante-cinq secondes d’observation">
          <div class="timer-content">
            <div class="timer-phase" id="timer-phase">Regardez ce que vous appelez imparfait.</div>
            <div class="timer-time" id="timer-time">00:45</div>
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
        <a class="primary" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let timerId = null;
let remainingSeconds = 45;
let timerRunning = false;
let audioMode = false;

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  timerRunning = false;
  guideAudio.pause();
  guideAudio.currentTime = 0;
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

  function beginObservation(useAudio) {
    remainingSeconds = 45;
    audioMode = useAudio;
    currentStep = 3;
    renderStep();
    startTimer();
  }

  document.querySelector("#start-audio")?.addEventListener("click", () => beginObservation(true));
  document.querySelector("#start-silent")?.addEventListener("click", () => beginObservation(false));

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    renderStep();
  });
}

function timerPhase(seconds) {
  if (seconds > 25) return "Observez l’impulsion de corriger. Que voudrait-elle changer ?";
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
  ring.style.setProperty("--progress", `${((45 - remainingSeconds) / 45) * 360}deg`);
}

function startTimer() {
  timerRunning = true;
  updateTimerDisplay();
  guideAudio.currentTime = 0;
  if (audioMode) guideAudio.play().catch(() => {});
  const pauseButton = document.querySelector("#pause-timer");
  const resetButton = document.querySelector("#reset-timer");

  pauseButton.addEventListener("click", () => {
    if (timerRunning) {
      if (timerId) window.clearInterval(timerId);
      timerId = null;
      timerRunning = false;
      if (audioMode) guideAudio.pause();
      pauseButton.textContent = "Reprendre";
    } else {
      timerRunning = true;
      pauseButton.textContent = "Pause";
      if (audioMode) guideAudio.play().catch(() => {});
      runTimer();
    }
  });

  resetButton.addEventListener("click", () => {
    stopTimer();
    remainingSeconds = 45;
    updateTimerDisplay();
    timerRunning = true;
    pauseButton.textContent = "Pause";
    guideAudio.currentTime = 0;
    if (audioMode) guideAudio.play().catch(() => {});
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
      remainingSeconds = 45;
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
