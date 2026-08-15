const stage = document.querySelector("#stage");
const backButton = document.querySelector("#back");
const nextButton = document.querySelector("#next");
const progressLabel = document.querySelector("#progress-label");
const progressFill = document.querySelector("#progress-fill");

const steps = [
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La Traversée du regard · Jour 7</p>
        <h1>LÀ</h1>
        <div class="copy">
          <p>Pendant six jours, vous avez écouté, regardé, distingué, laissé passer, cessé de corriger et observé les frontières.</p>
          <p>Aujourd’hui, il n’y aura rien de nouveau à apprendre.</p>
          <p class="quiet">L’expérience dure environ cinq minutes.</p>
        </div>
        <div class="horizon" aria-hidden="true"></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Préparer</p>
        <h2>Allez chercher un verre d’eau.</h2>
        <div class="copy"><p>Posez-le devant vous, puis revenez à cet écran.</p></div>
        <button class="primary" id="glass-ready" type="button">Le verre est là</button>
      </div>`,
    manual: true,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Avant le geste</p>
        <h2>Ne prenez pas encore le verre.</h2>
        <div class="copy"><p>Arrêtez-vous.</p></div>
        <ul class="sequence">
          <li>un son proche</li>
          <li>un son plus lointain</li>
          <li>puis l’ensemble</li>
        </ul>
      </div>`,
    pause: 8,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Regarder</p>
        <h2>Regardez le verre avant de vous contenter de son nom.</h2>
        <ul class="sequence">
          <li>la lumière qui le traverse</li>
          <li>la forme de l’eau</li>
          <li>la ligne de sa surface</li>
        </ul>
        <p class="prompt">Vous connaissez cet objet. Mais l’avez-vous déjà vu exactement ainsi&nbsp;?</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Toucher</p>
        <h2>Prenez maintenant le verre.</h2>
        <div class="copy"><p>Sentez son poids, sa température et le contact de votre main.</p></div>
        <p class="prompt">Où finit la main&nbsp;?<br />Où commence le verre&nbsp;?</p>
        <div class="copy"><p class="quiet">Il n’est pas nécessaire de répondre.</p></div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Boire</p>
        <h2>Buvez une seule gorgée.</h2>
        <div class="copy">
          <p>Sans vous presser. Sans chercher à rendre ce moment particulier.</p>
        </div>
        <p class="prompt">L’eau qui était devant vous entre maintenant dans le corps.</p>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner stillness">
        <p class="eyebrow">Après</p>
        <h2>Reposez le verre.</h2>
        <p class="prompt">Restez là.</p>
      </div>`,
    pause: 10,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Rien d’extraordinaire</p>
        <h2>Vous avez bu un verre d’eau.</h2>
        <div class="copy">
          <p>Rien d’exceptionnel ne s’est produit.</p>
          <p>Et pourtant, ce moment n’était pas absent.</p>
          <p class="quiet">Il était peut-être seulement recouvert par l’habitude, les mots, les pensées et le mouvement vers ce qui vient ensuite.</p>
        </div>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">La suite</p>
        <h2>La Traversée ne demande pas de transformer chaque geste en exercice.</h2>
        <div class="copy">
          <p>Elle ne demande pas de rester constamment attentif.</p>
          <p>Elle laisse seulement ouverte la possibilité de revenir.</p>
        </div>
        <ul class="sequence">
          <li>à un son</li>
          <li>à une chose</li>
          <li>à un geste</li>
          <li>à ce qui est là</li>
        </ul>
      </div>`,
  },
  {
    html: `
      <div class="stage-inner">
        <p class="eyebrow">Jour 7 · Fin</p>
        <h2 class="final-line">Il n’y avait rien à ajouter. Seulement ce qui était déjà là.</h2>
        <div class="copy">
          <p>La Traversée s’arrête ici.</p>
          <p>Le regard peut continuer.</p>
        </div>
        <div class="final-actions">
          <a class="primary" href="https://www.editionsla.com/le-livre-je-me-vois">Découvrir Je me vois</a>
          <a class="secondary-link" href="https://www.editionsla.com/la-traversee">Quitter l’expérience</a>
        </div>
        <div class="restart-action"><button class="text-button" id="restart" type="button">Recommencer</button></div>
      </div>`,
    final: true,
  },
];

let currentStep = 0;
let pauseId = null;

function clearPause() {
  if (pauseId) window.clearTimeout(pauseId);
  pauseId = null;
}

function updateProgress() {
  progressLabel.textContent = `${currentStep + 1} / ${steps.length}`;
  progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
}

function renderStep() {
  clearPause();
  stage.innerHTML = steps[currentStep].html;
  updateProgress();
  backButton.hidden = currentStep === 0;
  nextButton.hidden = Boolean(steps[currentStep].manual || steps[currentStep].pause || steps[currentStep].final);
  stage.focus({ preventScroll: true });

  document.querySelector("#glass-ready")?.addEventListener("click", () => {
    currentStep = 2;
    renderStep();
  });

  document.querySelector("#restart")?.addEventListener("click", () => {
    currentStep = 0;
    renderStep();
  });

  if (steps[currentStep].pause) {
    pauseId = window.setTimeout(() => {
      pauseId = null;
      nextButton.hidden = false;
      nextButton.focus();
    }, steps[currentStep].pause * 1000);
  }
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
