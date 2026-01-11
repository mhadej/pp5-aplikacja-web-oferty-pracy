import store from '../store.js';

const template = document.createElement('template');
template.innerHTML = `
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
