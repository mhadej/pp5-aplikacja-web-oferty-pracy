import { fetchJobs } from './src/api/jobsApi.js';
import store from './src/store.js';
import { initTheme } from './src/utils/theme.js';
import './src/components/job-card.js';
import './src/components/job-model.js';
import './src/components/filter-model.js';
import './src/components/comparison-model.js';

let currentJobType = null;
let currentView = 'all';
let filteredJobs = [];
let allJobs = [];

const CACHE_KEYS = {
    general: 'jobhunt_cache_general',
    it: 'jobhunt_cache_it',
    timestamp_general: 'jobhunt_timestamp_general',
    timestamp_it: 'jobhunt_timestamp_it',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // = 24 godziny

const jobSelectorGeneral = document.querySelector(
    '.job-selector_btn:nth-child(1)'
);
const jobSelectorIT = document.querySelector('.job-selector_btn:nth-child(2)');
const filterBtn = document.getElementById('filterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const themeToggle = document.querySelector('.header_theme');
const searchInput = document.getElementById('searchJobs');
const jobsGrid = document.querySelector('.jobs-grid');
const emptyState = document.querySelector('.empty-state');
const loadingState = document.querySelector('.loading');
const jobModel = document.querySelector('job-model');
const filterModel = document.querySelector('filter-model');
const comparisonModel = document.querySelector('comparison-model');
const compareBtn = document.getElementById('compareBtn');
const favoritesBtn = document.getElementById('favoritesBtn');

if (filterModel) {
    filterModel.addEventListener('apply-filters', (e) => {
        store.setFilters(e.detail.filters);
        filterAndRender();
    });
}

function getCachedJobs(type) {
    try {
        const cacheKey = CACHE_KEYS[type];
        const timestampKey = CACHE_KEYS[`timestamp_${type}`];

        const cachedData = localStorage.getItem(cacheKey);
        const timestamp = localStorage.getItem(timestampKey);

        if (!cachedData || !timestamp) {
            return null;
        }

        const age = Date.now() - parseInt(timestamp);
        if (age > CACHE_DURATION) {
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(timestampKey);
            return null;
        }

        return JSON.parse(cachedData);
    } catch (error) {
        console.log('Error:', error);
        return null;
    }
}

function setCachedJobs(type, jobs) {
    try {
        const cacheKey = CACHE_KEYS[type];
        const timestampKey = CACHE_KEYS[`timestamp_${type}`];

        localStorage.setItem(cacheKey, JSON.stringify(jobs));
        localStorage.setItem(timestampKey, Date.now().toString());
    } catch (error) {
        console.log('Error:', error);
    }
}

if (jobSelectorGeneral) {
    jobSelectorGeneral.addEventListener('click', () => {
        selectJobType('general');
        currentView = 'all';
        updateViewButtons();
    });
}

if (jobSelectorIT) {
    jobSelectorIT.addEventListener('click', () => {
        selectJobType('it');
        currentView = 'all';
        updateViewButtons();
    });
}

if (filterBtn) {
    filterBtn.addEventListener('click', () => {
        if (filterModel && allJobs.length > 0) {
            const availableFilters = store.getAvailableFilters(
                allJobs,
                currentJobType
            );
            const currentFilters = store.getFilters();
            filterModel.show(currentFilters, availableFilters, currentJobType);
        } else {
            alert('Załaduj najpierw oferty pracy');
        }
    });
}

if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', resetFilters);
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

if (searchInput) {
    searchInput.addEventListener('input', debounce(filterAndRender, 300));
}

if (compareBtn) {
    compareBtn.addEventListener('click', () => {
        const comparison = store.getComparison();

        if (comparison.length === 0) {
            alert('Dodaj oferty do porównania!');
            return;
        }

        const comparisonJobs = allJobs.filter((job) =>
            comparison.includes(job.id)
        );
        comparisonModel?.show(comparisonJobs);
    });
}

if (favoritesBtn) {
    favoritesBtn.addEventListener('click', showFavorites);
}

async function selectJobType(type) {
    currentJobType = type;

    store.setComparison([]);
    updateCompareBtn();

    document.querySelectorAll('.job-selector_btn').forEach((btn) => {
        btn.classList.remove('job-selector_btn--active');
    });
    (type === 'general' ? jobSelectorGeneral : jobSelectorIT)?.classList.add(
        'job-selector_btn--active'
    );

    showLoading();
    try {
        let cachedJobs = getCachedJobs(type);

        if (cachedJobs && cachedJobs.length > 0) {
            allJobs = cachedJobs;
        } else {
            allJobs = await fetchJobs(type);

            if (!allJobs || allJobs.length === 0) {
                throw new Error('Brak danych z API');
            }

            setCachedJobs(type, allJobs);
        }

        store.setJobs(allJobs, type);
        currentView = 'all';
        filterAndRender();
    } catch (error) {
        showError('Błąd ładowania ofert: ' + error.message);
    }
}

function showFavorites() {
    if (currentView === 'favorites') {
        currentView = 'all';
    } else {
        currentView = 'favorites';
    }
    updateViewButtons();
    filterAndRender();
}

function showComparison() {
    const comparisonIds = store.getComparison();

    if (comparisonIds.length === 0) {
        alert('Wybierz oferty do porównania');
        return;
    }

    const jobsToCompare = comparisonIds
        .map((id) => allJobs.find((j) => j.id === id))
        .filter(Boolean);

    if (jobsToCompare.length > 0) {
        comparisonModel?.show(jobsToCompare);
    }
}

function updateViewButtons() {
    if (favoritesBtn) {
        if (currentView === 'favorites') {
            favoritesBtn.classList.add('btn--primary');
            favoritesBtn.classList.remove('btn--secondary');
        } else {
            favoritesBtn.classList.remove('btn--primary');
            favoritesBtn.classList.add('btn--secondary');
        }
    }
}

function filterAndRender() {
    if (!currentJobType) {
        console.log('No job type selected');
        return;
    }

    const filters = store.getFilters();
    const searchTerm = searchInput?.value.toLowerCase() || '';

    let jobsToFilter = allJobs;

    if (currentView === 'favorites') {
        const favoriteIds = store.getAllFavorites(currentJobType);
        jobsToFilter = allJobs.filter((job) => favoriteIds.includes(job.id));
    }

    filteredJobs = jobsToFilter.filter((job) => {
        if (searchTerm) {
            const matchesSearch =
                job.title.toLowerCase().includes(searchTerm) ||
                job.company.toLowerCase().includes(searchTerm) ||
                job.location.toLowerCase().includes(searchTerm);

            if (!matchesSearch) return false;
        }

        if (
            filters.locations.length &&
            !filters.locations.includes(job.location)
        ) {
            return false;
        }

        if (filters.types.length && !filters.types.includes(job.type)) {
            return false;
        }

        if (
            job.salary_min < filters.salaryMin ||
            job.salary_max > filters.salaryMax
        ) {
            return false;
        }

        if (filters.languages && filters.languages.length > 0) {
            const hasLanguage = filters.languages.some((lang) =>
                (job.requirements || []).some((req) => {
                    const reqParts = req.split(',').map((r) => r.trim());
                    return reqParts.some(
                        (part) => part.toLowerCase() === lang.toLowerCase()
                    );
                })
            );
            if (!hasLanguage) return false;
        }

        if (filters.requirements && filters.requirements.length) {
            const hasRequired = filters.requirements.some((req) =>
                (job.requirements || []).some((r) =>
                    r.toLowerCase().includes(req.toLowerCase())
                )
            );
            if (!hasRequired) return false;
        }

        return true;
    });

    sortJobs(filteredJobs, filters.sortBy);

    hideLoading();
    render();
}

function sortJobs(jobs, sortBy) {
    switch (sortBy) {
        case 'salary-asc':
            jobs.sort((a, b) => a.salary_min - b.salary_min);
            break;
        case 'salary-desc':
            jobs.sort((a, b) => b.salary_max - a.salary_max);
            break;
        case 'newest':
        default:
            jobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));
    }
}

function render() {
    if (!jobsGrid) {
        console.log('JobsGrid not found!');
        return;
    }

    jobsGrid.innerHTML = '';

    if (filteredJobs.length === 0) {
        if (currentView === 'favorites') {
            showEmpty('Brak ulubionych ofert');
        } else if (searchInput?.value) {
            showEmpty(`Brak wyników dla "${searchInput.value}"`);
        } else {
            showEmpty('Brak ofert spełniających kryteria');
        }
        return;
    }

    filteredJobs.forEach((job) => {
        const card = document.createElement('job-card');
        card.dataset.id = job.id;
        card.dataset.title = job.title;
        card.dataset.company = job.company;
        card.dataset.location = job.location;
        card.dataset.type = job.type;
        card.dataset.salaryMin = job.salary_min;
        card.dataset.salaryMax = job.salary_max;
        card.dataset.posted = job.posted;
        card.dataset.ends = job.ends;
        card.dataset.requirements = JSON.stringify(job.requirements || []);
        card.dataset.isFavorite = store.isFavorite(job.id) ? 'true' : 'false';
        card.dataset.isInComparison = store.getComparison().includes(job.id)
            ? 'true'
            : 'false';

        card.addEventListener('view-job', (e) => {
            const viewedJob = allJobs.find((j) => j.id === e.detail.id);
            if (viewedJob) {
                jobModel?.show(viewedJob);
            }
        });

        card.addEventListener('toggle-favorite', (e) => {
            store.toggleFavorite(e.detail.id);

            const isFav = store.isFavorite(e.detail.id);
            card.updateFavorite(isFav);

            if (currentView === 'favorites') {
                card.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    card.remove();
                    if (jobsGrid.children.length === 0) {
                        showEmpty('Brak ulubionych ofert');
                    }
                }, 300);
            }
        });

        card.addEventListener('compare-job', (e) => {
            const comparison = store.getComparison();

            if (!comparison.includes(e.detail.id)) {
                if (comparison.length < 3) {
                    comparison.push(e.detail.id);
                    store.setComparison(comparison);

                    card.updateComparison(true);
                    updateCompareBtn();
                } else {
                    alert('Możesz porównać maksymalnie 3 oferty!');
                }
            } else {
                comparison.splice(comparison.indexOf(e.detail.id), 1);
                store.setComparison(comparison);

                card.updateComparison(false);
                updateCompareBtn();
            }
        });

        jobsGrid.appendChild(card);
    });

    hideEmpty();
}

function updateCompareBtn() {
    const count = store.getComparison().length;
    if (compareBtn) {
        compareBtn.textContent =
            count > 0 ? `Porównaj (${count}/3)` : 'Porównaj';
        compareBtn.style.opacity = count > 0 ? '1' : '0.5';
    }
}

function resetFilters() {
    store.setFilters({
        locations: [],
        types: [],
        languages: [],
        requirements: [],
        salaryMin: 0,
        salaryMax: 50000,
        sortBy: 'newest',
    });
    if (searchInput) searchInput.value = '';
    filterAndRender();
}

function toggleTheme() {
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
}

function showLoading() {
    if (loadingState) loadingState.style.display = 'flex';
    if (jobsGrid) jobsGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
}

function hideLoading() {
    if (loadingState) loadingState.style.display = 'none';
    if (jobsGrid) jobsGrid.style.display = 'grid';
}

function showEmpty(message = 'Brak ofert') {
    if (emptyState) {
        emptyState.textContent = message;
        emptyState.style.display = 'block';
    }
    if (jobsGrid) jobsGrid.style.display = 'none';
}

function hideEmpty() {
    if (emptyState) emptyState.style.display = 'none';
}

function showError(message) {
    console.log('Error:', message);
    if (emptyState) {
        emptyState.textContent = message;
        emptyState.style.display = 'block';
    }
    hideLoading();
    if (jobsGrid) jobsGrid.style.display = 'none';
}

function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCompareBtn();
    updateViewButtons();

    setTimeout(() => {
        if (jobSelectorGeneral) {
            jobSelectorGeneral.click();
        }
    }, 100);
});
