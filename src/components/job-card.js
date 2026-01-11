class JobCard extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    updateFavorite(isFavorite) {
        const favoriteBtn = this.querySelector('[data-action="favorite"]');
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', isFavorite);
            favoriteBtn.innerHTML = isFavorite
                ? `<img src="../img/serce.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/>`
                : '🤍';
        }
        this.dataset.isFavorite = isFavorite ? 'true' : 'false';
    }

    updateComparison(isInComparison) {
        const compareBtn = this.querySelector('[data-action="compare"]');
        if (compareBtn) {
            compareBtn.classList.toggle('active', isInComparison);
            compareBtn.innerHTML = isInComparison
                ? '✔️'
                : `<img src="../img/waga.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/>`;
        }
        this.dataset.isInComparison = isInComparison ? 'true' : 'false';
    }

    render() {
        const id = this.dataset.id;
        const title = this.dataset.title;
        const company = this.dataset.company;
        const location = this.dataset.location;
        const type = this.dataset.type;
        const salaryMin = this.dataset.salaryMin;
        const salaryMax = this.dataset.salaryMax;
        const posted = this.dataset.posted;
        const ends = this.dataset.ends;
        const requirements = this.dataset.requirements
            ? JSON.parse(this.dataset.requirements)
            : [];

        const PROGRAMMING_LANGUAGES = [
            'JavaScript',
            'Python',
            'Java',
            'C++',
            'C#',
            'C',
            'PHP',
            'TypeScript',
            'Go',
            'SQL',
            'Rust',
            'Ruby',
            'Swift',
            'Kotlin',
            'Scala',
            'Haskell',
            'R',
            'HTML+CSS',
        ];
        const languages = requirements
            .map((req) =>
                req
                    .trim()
                    .split(',')
                    .map((r) => r.trim())
            )
            .flat()
            .filter(
                (req) =>
                    req &&
                    PROGRAMMING_LANGUAGES.some((lang) => req.includes(lang))
            );

        const isFavorite = this.dataset.isFavorite === 'true';
        const isInComparison = this.dataset.isInComparison === 'true';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endsDate = new Date(ends);
        endsDate.setHours(0, 0, 0, 0);

        const isExpired = endsDate < today;
        const timeDiff = endsDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        let expiryStatusHTML = '';
        if (isExpired) {
            expiryStatusHTML =
                '<span class="job-card_expired">❌ Wygasła</span>';
        } else if (daysLeft <= 3) {
            expiryStatusHTML = `<span class="job-card_expires-soon">⚠️ Wygasa za ${daysLeft} ${
                daysLeft === 1 ? 'dzień' : 'dni'
            }</span>`;
        } else {
            expiryStatusHTML = `<span class="job-card_expires"><img src="../img/kalendarz.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Aktywna przez ${daysLeft} dni</span>`;
        }

        const languagesHTML =
            languages.length > 0
                ? `<div class="job-card_badges">
          ${languages
              .map(
                  (lang) =>
                      `<span class="job-card_badge">${this.escapeHtml(
                          lang
                      )}</span>`
              )
              .join('')}
        </div>`
                : '';

        this.innerHTML = `
      <div class="job-card">
        <div class="job-card_header">
          <h3 class="job-card_title">${this.escapeHtml(title)}</h3>
          <div class="job-card_actions">
            <button class="job-card_icon-btn ${
                isFavorite ? 'active' : ''
            }" data-action="favorite" title="Dodaj do ulubionych">
              ${
                  isFavorite
                      ? '<img src="../img/serce.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/>'
                      : '🤍'
              }
            </button>
            <button class="job-card_icon-btn ${
                isInComparison ? 'active' : ''
            }" data-action="compare" title="Dodaj do porównania">
              ${
                  isInComparison
                      ? '✔️'
                      : '<img src="../img/waga.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/>'
              }
            </button>
          </div>
        </div>

        <div class="job-card_company">
          <span><img src="../img/budynek.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/></span>
          <span>${this.escapeHtml(company)}</span>
        </div>

        <div class="job-card_meta">
          <div class="job-card_meta-item">
            <span><img src="../img/pinezka.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/></span>
            <span>${this.escapeHtml(location)}</span>
          </div>
          <div class="job-card_meta-item">
            <span><img src="../img/teczka.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/></span>
            <span>${this.escapeHtml(type)}</span>
          </div>
        </div>

        <div class="job-card_salary"><img src="../img/pensja.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> ${salaryMin} - ${salaryMax} PLN</div>

        <div>${expiryStatusHTML}</div>

        ${languagesHTML}

        <div class="job-card_footer">
          <button class="job-card_btn" data-action="view">Szczegóły</button>
          <button class="job-card_btn" data-action="apply">Aplikuj</button>
        </div>
      </div>
    `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const viewBtn = this.querySelector('[data-action="view"]');
        const applyBtn = this.querySelector('[data-action="apply"]');
        const favoriteBtn = this.querySelector('[data-action="favorite"]');
        const compareBtn = this.querySelector('[data-action="compare"]');

        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                this.dispatchEvent(
                    new CustomEvent('view-job', {
                        detail: { id: parseInt(this.dataset.id) },
                        bubbles: true,
                    })
                );
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                alert(`Aplikowałeś na stanowisko: ${this.dataset.title}`);
            });
        }

        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dispatchEvent(
                    new CustomEvent('toggle-favorite', {
                        detail: { id: parseInt(this.dataset.id) },
                        bubbles: true,
                    })
                );
            });
        }

        if (compareBtn) {
            compareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dispatchEvent(
                    new CustomEvent('compare-job', {
                        detail: { id: parseInt(this.dataset.id) },
                        bubbles: true,
                    })
                );
            });
        }
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

customElements.define('job-card', JobCard);
