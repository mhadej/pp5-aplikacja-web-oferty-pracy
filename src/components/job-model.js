class JobModel extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
    }

    show(job) {
        const shadow = this.shadowRoot;
        const requirements = (job.requirements || [])
            .flatMap((r) => r.split(',').map((x) => x.trim()))
            .join(', ');

        const benefits = (job.benefits || [])
            .flatMap((b) => b.split(',').map((x) => x.trim()))
            .join(', ');

        let postedDate = 'ERROR';
        let endsDate = 'ERROR';

        try {
            if (!job.posted) {
                postedDate = new Date().toLocaleDateString('pl-PL');
            } else {
                const postedObj = new Date(job.posted);

                if (isNaN(postedObj.getTime())) {
                    postedDate = new Date().toLocaleDateString('pl-PL');
                } else {
                    postedDate = postedObj.toLocaleDateString('pl-PL');
                }
            }
        } catch (err) {
            postedDate = new Date().toLocaleDateString('pl-PL');
        }

        try {
            if (!job.ends) {
                endsDate = new Date().toLocaleDateString('pl-PL');
            } else {
                const endsObj = new Date(job.ends);
                if (isNaN(endsObj.getTime())) {
                    endsDate = new Date().toLocaleDateString('pl-PL');
                } else {
                    endsDate = endsObj.toLocaleDateString('pl-PL');
                }
            }
        } catch (err) {
            endsDate = new Date().toLocaleDateString('pl-PL');
        }

        shadow.innerHTML = `
      <div class="overlay"></div>

      <div class="model">
        <div class="model__header">
          <h2 class="model__title">${this.escapeHtml(job.title)}</h2>
          <button class="model__close" type="button">✕</button>
        </div>

        <div class="model__body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-item__label">
                <img
                    src="../img/pinezka.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Lokalizacja
              </div>
              <div class="info-item__value">${this.escapeHtml(
                  job.location
              )}</div>
            </div>
            <div class="info-item">
              <div class="info-item__label">
                <img
                    src="../img/budynek.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Firma</div>
              <div class="info-item__value">${this.escapeHtml(
                  job.company
              )}</div>
            </div>
            <div class="info-item">
              <div class="info-item__label">
                <img
                    src="../img/teczka.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Typ Umowy</div>
              <div class="info-item__value">${this.escapeHtml(job.type)}</div>
            </div>
            <div class="info-item">
              <div class="info-item__label">
                <img
                    src="../img/pensja.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Wynagrodzenie</div>
              <div class="info-item__value">${job.salary_min} - ${
            job.salary_max
        } PLN</div>
            </div>
          </div>

          <div class="section">
            <div class="section__label">
                <img
                    src="../img/kalendarz.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Data Opublikowania</div>
            <div class="section__value">${postedDate}</div>
          </div>

          <div class="section">
            <div class="section__label">
                <img
                    src="../img/alarm.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Data Końca Rekrutacji</div>
            <div class="section__value">${endsDate}</div>
          </div>

          ${
              requirements
                  ? `
            <div class="section">
              <div class="section__label">✓ Wymagania</div>
              <div class="section__value">${this.escapeHtml(requirements)}</div>
            </div>
          `
                  : ''
          }

          ${
              benefits
                  ? `
            <div class="section">
              <div class="section__label">
                <img
                    src="../img/prezent.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Benefity</div>
              <div class="section__value">${this.escapeHtml(benefits)}</div>
            </div>
          `
                  : ''
          }
        </div>

        <div class="model__footer">
          <button class="btn btn--secondary" data-action="close" type="button">Zamknij</button>
          <button class="btn btn--primary" data-action="apply" type="button">Aplikuj teraz</button>
        </div>
      </div>
    `;

        this.classList.add('open');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.model__close');
        const overlay = this.shadowRoot.querySelector('.overlay');
        const closeFooterBtn = this.shadowRoot.querySelector(
            '[data-action="close"]'
        );
        const applyBtn = this.shadowRoot.querySelector('[data-action="apply"]');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        if (closeFooterBtn) {
            closeFooterBtn.addEventListener('click', () => this.close());
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                alert('Aplikacja przesłana!');
                this.close();
            });
        }
    }

    close() {
        this.classList.remove('open');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}

customElements.define('job-model', JobModel);
