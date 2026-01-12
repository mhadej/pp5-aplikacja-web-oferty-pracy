import store from '../store.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
    :host {
        display: block;
    }
    :host(.open) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        display: flex;
        align-items: flex-end;
    }
    .filter-panel {
        background: var(--bg-card);
        width: 100%;
        border-radius: 12px 12px 0 0;
        padding: 24px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .filter-panel_header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }
    .filter-panel_title {
        margin: 0;
        color: var(--text-primary);
    }
    .filter-panel_close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
    }
    .filter-section {
        margin-bottom: 24px;
    }
    .filter-section_title {
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 12px 0;
    }
    .filter-section_content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .filter-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        &input {
            cursor: pointer;
            width: 18px;
            height: 18px;
        }
    }
    
    .filter-slider {
        display: flex;
        gap: 12px;
        align-items: center;

        &input {
            flex: 1;
            height: 6px;
            border-radius: 3px;
            background: var(--border-color);
            outline: none;
            -webkit-appearance: none;

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: var(--primary-color);
                cursor: pointer;
            }
            
            &::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: var(--primary-color);
                cursor: pointer;
                border: none;
            }
        }
    }

    .filter-slider_display {
        min-width: 60px;
        text-align: right;
        color: var(--text-primary);
        font-weight: 600;
    }
    .filter-select {
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 0.9rem;
    }
    .filter-panel_footer {
        display: flex;
        gap: 12px;
        margin-top: 24px;
    }
    .filter-panel_btn {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    .filter-panel_btn--primary {
        background: var(--primary-color);
        color: white;

        &:hover {
            background: var(--primary-dark);
        }
    }

    .filter-panel_btn--secondary {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);

        &:hover {
            background: var(--bg-tertiary);
        }
    }

    @media (min-width: 1024px) {
        :host.open .filter-panel {
            position: relative;
            width: auto;
            border-radius: 12px;
            margin: auto;
        }
    }   
</style>

<div class="filter-panel">
    <div class="filter-panel_header">
        <h2 class="filter-panel_title"><img src="../img/lejek.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Filtry</h2>
        <button class="filter-panel_close">✕</button>
    </div>

    <div class="filter-section">
        <h3 class="filter-section_title">Sortuj po</h3>
        <select class="filter-select" id="sortBy">
            <option value="newest">Najnowsze</option>
            <option value="salary-desc">Pensja (malejąco)</option>
            <option value="salary-asc">Pensja (rosnąco)</option>
        </select>
    </div>

    <div class="filter-section">
        <h3 class="filter-section_title"><img src="../img/pinezka.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Lokalizacja</h3>
        <div class="filter-section_content" id="locationFilters"></div>
    </div>

    <div class="filter-section">
        <h3 class="filter-section_title"><img src="../img/alarm.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Typ pracy</h3>
        <div class="filter-section_content" id="typeFilters"></div>
    </div>

    <div class="filter-section">
        <h3 class="filter-section_title"><img src="../img/pensja.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Zakresspensji</h3>
        <div class="filter-slider">
            <input type="range" id="salaryMin" min="0" max="50000" step="1000">
            <input type="range" id="salaryMax" min="0" max="50000" step="1000">
            <div class="filter-slider_display">
                <span id="salaryDisplay">0-50k</span>
            </div>
        </div>
    </div>

    <div class="filter-section">
        <h3 class="filter-section_title"><img src="../img/laptop.png" style="width: 1.6rem; height: 1.6rem; vertical-align: middle"/> Wymagane umiejętności</h3>
        <div class="filter-section_content" id="requirementFilters"></div>
    </div>

    <div class="filter-panel_footer">
        <button class="filter-panel_btn filter-panel_btn--secondary" id="resetBtn">Reset</button>
        <button class="filter-panel_btn filter-panel_btn--primary" id="applyBtn">Zastosuj</button>
    </div>
</div>
`;

const LOCATIONS = [
    'Warsaw',
    'Kraków',
    'Wrocław',
    'Poznań',
    'Katowice',
    'Gdańsk',
    'Gdynia',
    'Szczecin',
    'Łódź',
    'Bydgoszcz',
];
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid'];
const REQUIREMENTS = [
    'JavaScript',
    'Python',
    'Java',
    'TypeScript',
    'Go',
    'Rust',
    'AWS',
    'Docker',
    'Kubernetes',
    'React',
];

export default class FilterPanel extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        this.setupEventListeners(shadow);
        this.renderFilters(shadow);
    }

    setupEventListeners(shadow) {
        const closeBtn = shadow.querySelector('.filter-panel_close');
        const applyBtn = shadow.querySelector('#applyBtn');
        const resetBtn = shadow.querySelector('#resetBtn');
        const sortSelect = shadow.querySelector('#sortBy');
        const salaryMin = shadow.querySelector('#salaryMin');
        const salaryMax = shadow.querySelector('#salaryMax');

        closeBtn.addEventListener('click', () => this.close());
        applyBtn.addEventListener('click', () => this.applyFilters(shadow));
        resetBtn.addEventListener('click', () => this.resetFilters(shadow));

        [salaryMin, salaryMax].forEach((slider) => {
            slider.addEventListener('input', () => {
                if (parseInt(salaryMin.value) > parseInt(salaryMax.value)) {
                    [salaryMin.value, salaryMax.value] = [
                        salaryMax.value,
                        salaryMin.value,
                    ];
                }
                shadow.querySelector('#salaryDisplay').textContent = `${
                    salaryMin.value / 1000
                }k - ${salaryMax.value / 1000}k`;
            });
        });
    }

    renderFilters(shadow) {
        const filters = store.getFilters();

        const locContainer = shadow.querySelector('#locationFilters');
        locContainer.innerHTML = LOCATIONS.map(
            (loc) => `
            <label class="filter-checkbox">
                <input type="checkbox" value="${loc}" ${
                filters.locations.includes(loc) ? 'checked' : ''
            }>
                <span>${loc}</span>
            </label>
        `
        ).join('');

        const typeContainer = shadow.querySelector('#typeFilters');
        typeContainer.innerHTML = TYPES.map(
            (type) => `
            <label class="filter-checkbox">
                <input type="checkbox" value="${type}" ${
                filters.types.includes(type) ? 'checked' : ''
            }>
                <span>${type}</span>
            </label>
        `
        ).join('');

        const reqContainer = shadow.querySelector('#requirementFilters');
        reqContainer.innerHTML = REQUIREMENTS.map(
            (req) => `
            <label class="filter-checkbox">
                <input type="checkbox" value="${req}" ${
                filters.requirements.includes(req) ? 'checked' : ''
            }>
                <span>${req}</span>
            </label>
        `
        ).join('');

        shadow.querySelector('#salaryMin').value = filters.salaryMin;
        shadow.querySelector('#salaryMax').value = filters.salaryMax;
        shadow.querySelector('#salaryDisplay').textContent = `${
            filters.salaryMin / 1000
        }k - ${filters.salaryMax / 1000}k`;
    }

    applyFilters(shadow) {
        const newFilters = {
            locations: Array.from(
                shadow.querySelectorAll('#locationFilters input:checked')
            ).map((i) => i.value),
            types: Array.from(
                shadow.querySelectorAll('#typeFilters input:checked')
            ).map((i) => i.value),
            requirements: Array.from(
                shadow.querySelectorAll('#requirementFilters input:checked')
            ).map((i) => i.value),
            salaryMin: parseInt(shadow.querySelector('#salaryMin').value),
            salaryMax: parseInt(shadow.querySelector('#salaryMax').value),
            sortBy: shadow.querySelector('#sortBy').value,
        };

        store.setFilters(newFilters);
        this.close();
    }

    resetFilters(shadow) {
        store.setFilters({
            locations: [],
            types: [],
            requirements: [],
            salaryMin: 0,
            salaryMax: 50000,
            sortBy: 'newest',
        });
        this.renderFilters(shadow);
    }

    close() {
        this.classList.remove('open');
    }

    show() {
        this.classList.add('open');
    }
}

customElements.define('filter-panel', FilterPanel);
