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
        <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        :host(.open) {
          opacity: 1;
          pointer-events: auto;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: -1;
        }

        .model {
          position: relative;
          background: var(--color-surface, #1a1a2e);
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .model_header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-shrink: 0;
        }

        .model_close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
          flex-shrink: 0;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
          }
        }

        .model_title {
          flex: 1;
          color: rgba(255, 255, 255, 0.95);
          font-size: 20px;
          font-weight: 600;
          line-height: 1.4;
        }

        .section {
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .section_label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .section_value {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          line-height: 1.6;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .info-item {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border-left: 3px solid var(--primary-color);
        }

        .info-item_label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .info-item_value {
          color: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          font-weight: 600;
        }

        .model_footer {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn--porownaj {
          background: var(--primary-color);
          color: #fff;

          &:hover {
            opacity: 0.9;
            transform: translateY(-2px);
          }
        }

        .btn--opcje {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);

          &:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        }

      
        .model_body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;

          &::-webkit-scrollbar {
            width: 8px;
          }

          &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
          }

          &::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
        
      </style>
      
      <div class="overlay"></div>

      <div class="model">
        <div class="model_header">
          <h2 class="model_title">${this.escapeHtml(job.title)}</h2>
          <button class="model_close" type="button">✕</button>
        </div>

        <div class="model_body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-item_label">
                <img
                    src="../img/pinezka.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Lokalizacja
              </div>
              <div class="info-item_value">${this.escapeHtml(
                  job.location
              )}</div>
            </div>
            <div class="info-item">
              <div class="info-item_label">
                <img
                    src="../img/budynek.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Firma</div>
              <div class="info-item_value">${this.escapeHtml(
                  job.company
              )}</div>
            </div>
            <div class="info-item">
              <div class="info-item_label">
                <img
                    src="../img/teczka.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Typ Umowy</div>
              <div class="info-item_value">${this.escapeHtml(job.type)}</div>
            </div>
            <div class="info-item">
              <div class="info-item_label">
                <img
                    src="../img/pensja.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Wynagrodzenie</div>
              <div class="info-item_value">${job.salary_min} - ${
            job.salary_max
        } PLN</div>
            </div>
          </div>

          <div class="section">
            <div class="section_label">
                <img
                    src="../img/kalendarz.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Data Opublikowania</div>
            <div class="section_value">${postedDate}</div>
          </div>

          <div class="section">
            <div class="section_label">
                <img
                    src="../img/alarm.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Data Końca Rekrutacji</div>
            <div class="section_value">${endsDate}</div>
          </div>

          ${
              requirements
                  ? `
            <div class="section">
              <div class="section_label">✓ Wymagania</div>
              <div class="section_value">${this.escapeHtml(requirements)}</div>
            </div>
          `
                  : ''
          }

          ${
              benefits
                  ? `
            <div class="section">
              <div class="section_label">
                <img
                    src="../img/prezent.png"
                    style="width: 1.6rem; height: 1.6rem; vertical-align: middle"
                />
                Benefity</div>
              <div class="section_value">${this.escapeHtml(benefits)}</div>
            </div>
          `
                  : ''
          }
        </div>

        <div class="model_footer">
          <button class="btn btn--secondary" data-action="close" type="button">Zamknij</button>
          <button class="btn btn--primary" data-action="apply" type="button">Aplikuj teraz</button>
        </div>
      </div>
    `;

        this.classList.add('open');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.model_close');
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
