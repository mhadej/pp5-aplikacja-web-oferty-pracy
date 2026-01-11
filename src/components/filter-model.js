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
            <style>
                :host {
                    display: none;
                }
                :host(.open) {
                    display: block;
                }
                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: flex-end;
                    z-index: 1000;
                    animation: fadeIn 0.2s;
                }
                @media (min-width: 768px) {
                    .overlay {
                        align-items: center;
                        justify-content: center;
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .model {
                    background: var(--bg-card);
                    border-radius: 12px 12px 0 0;
                    width: 100%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    animation: slideUp 0.3s;
                    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
                }
                @media (min-width: 768px) {
                    .model {
                        border-radius: 12px;
                        width: 90%;
                    }
                }
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .model_header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    background: var(--bg-card);
                }
                .model_title {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 600;
                }
                .model_close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    color: var(--text-primary);
                }
                .model_body {
                    padding: 20px;
                }
                .filter_section {
                    margin-bottom: 24px;
                }
                .filter_title {
                    margin: 0 0 12px 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .filter_options {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 300px;
                    overflow-y: auto;
                    padding-right: 8px;
                }
                .filter_options::-webkit-scrollbar {
                    width: 6px;
                }
                .filter_options::-webkit-scrollbar-track {
                    background: var(--bg-secondary);
                    border-radius: 3px;
                }
                .filter_options::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 3px;
                }
                .filter_options::-webkit-scrollbar-thumb:hover {
                    background: var(--primary-color);
                }
                .filter_checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    user-select: none;
                }
                .filter_checkbox input {
                    cursor: pointer;
                    width: 18px;
                    height: 18px;
                }
                .filter_checkbox span {
                    color: var(--text-primary);
                }
                .filter_range {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .filter_range-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .filter_range-value {
                    min-width: 60px;
                    text-align: center;
                    font-weight: 600;
                    color: var(--primary-color);
                }
                .model_footer {
                    padding: 20px;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    gap: 12px;
                    position: sticky;
                    bottom: 0;
                    background: var(--bg-card);
                }
                .model_btn {
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .model_btn--primary {
                    background: var(--primary-color);
                    color: white;
                }
                .model_btn--primary:hover {
                    background: var(--primary-dark);
                }
                .model_btn--secondary {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }
                .model_btn--secondary:hover {
                    background: var(--bg-tertiary);
                }
            </style>

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
