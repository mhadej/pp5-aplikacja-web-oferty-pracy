// Lista języków programowania
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

class FilterModel extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
    }

    show(currentFilters, availableFilters, jobType) {
        const shadow = this.shadowRoot;

        const languagesHTML =
            jobType === 'it'
                ? `
            <div class="filter_section">
                <h3 class="filter_title"><img src="../img/laptop.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Języki programowania</h3>
                <div class="filter_options">
                    ${PROGRAMMING_LANGUAGES.map(
                        (lang) => `
                        <label class="filter_checkbox">
                            <input 
                                type="checkbox" 
                                value="${lang}"
                                class="filter_input-lang"
                                ${
                                    currentFilters.languages?.includes(lang)
                                        ? 'checked'
                                        : ''
                                }
                            />
                            <span>${lang}</span>
                        </label>
                    `
                    ).join('')}
                </div>
            </div>
        `
                : '';

        shadow.innerHTML = `
            <div class="overlay">
                <div class="model">
                    <div class="model_header">
                        <h2 class="model_title"><img src="../img/lejek.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Filtry</h2>
                        <button class="model_close">✕</button>
                    </div>
                    
                    <div class="model_body">
                        <div class="filter_section">
                            <h3 class="filter_title"><img src="../img/pinezka.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Lokalizacja</h3>
                            <div class="filter_options">
                                ${(availableFilters.locations || [])
                                    .map(
                                        (loc) => `
                                    <label class="filter_checkbox">
                                        <input 
                                            type="checkbox" 
                                            value="${loc}"
                                            class="filter_input-location"
                                            ${
                                                currentFilters.locations?.includes(
                                                    loc
                                                )
                                                    ? 'checked'
                                                    : ''
                                            }
                                        />
                                        <span>${loc}</span>
                                    </label>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>

                        <div class="filter_section">
                            <h3 class="filter_title"><img src="../img/alarm.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Typ umowy</h3>
                            <div class="filter_options">
                                ${(availableFilters.types || [])
                                    .map(
                                        (type) => `
                                    <label class="filter_checkbox">
                                        <input 
                                            type="checkbox" 
                                            value="${type}"
                                            class="filter_input-type"
                                            ${
                                                currentFilters.types?.includes(
                                                    type
                                                )
                                                    ? 'checked'
                                                    : ''
                                            }
                                        />
                                        <span>${type}</span>
                                    </label>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>

                        <div class="filter_section">
                            <h3 class="filter_title"><img src="../img/pensja.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Wynagrodzenie</h3>
                            <div class="filter_range">
                                <input 
                                    type="number" 
                                    class="filter_range-input filter_input-salary-min"
                                    placeholder="Min"
                                    value="${currentFilters.salaryMin || 0}"
                                    min="0"
                                    max="50000"
                                />
                                <span>-</span>
                                <input 
                                    type="number" 
                                    class="filter_range-input filter_input-salary-max"
                                    placeholder="Max"
                                    value="${currentFilters.salaryMax || 50000}"
                                    min="0"
                                    max="50000"
                                />
                                <span class="filter_range-value">PLN</span>
                            </div>
                        </div>

                        ${languagesHTML}
                    </div>
                    
                    <div class="model_footer">
                        <button class="model_btn model_btn--secondary" data-action="reset">Resetuj</button>
                        <button class="model_btn model_btn--primary" data-action="apply">Zastosuj</button>
                    </div>
                </div>
            </div>
        `;

        this.classList.add('open');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = this.shadowRoot.querySelector('.model_close');
        const overlay = this.shadowRoot.querySelector('.overlay');
        const applyBtn = this.shadowRoot.querySelector('[data-action="apply"]');
        const resetBtn = this.shadowRoot.querySelector('[data-action="reset"]');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    applyFilters() {
        const locations = Array.from(
            this.shadowRoot.querySelectorAll('.filter_input-location:checked')
        ).map((el) => el.value);

        const types = Array.from(
            this.shadowRoot.querySelectorAll('.filter_input-type:checked')
        ).map((el) => el.value);

        const languages = Array.from(
            this.shadowRoot.querySelectorAll('.filter_input-lang:checked')
        ).map((el) => el.value);

        const salaryMin = parseInt(
            this.shadowRoot.querySelector('.filter_input-salary-min')?.value ||
                0
        );
        const salaryMax = parseInt(
            this.shadowRoot.querySelector('.filter_input-salary-max')?.value ||
                50000
        );

        const filters = {
            locations,
            types,
            languages,
            salaryMin,
            salaryMax,
            sortBy: 'newest',
        };

        this.dispatchEvent(
            new CustomEvent('apply-filters', {
                detail: { filters },
                bubbles: true,
                composed: true,
            })
        );

        this.close();
    }

    resetFilters() {
        this.shadowRoot
            .querySelectorAll('input[type="checkbox"]')
            .forEach((el) => {
                el.checked = false;
            });
        this.shadowRoot.querySelector('.filter_input-salary-min').value = 0;
        this.shadowRoot.querySelector('.filter_input-salary-max').value = 50000;
    }

    close() {
        this.classList.remove('open');
    }
}

customElements.define('filter-model', FilterModel);
