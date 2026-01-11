class Store {
    constructor() {
        this.state = {
            jobs: [],
            currentJobType: null,
            favorites: {},
            comparison: [],
            filters: {
                locations: [],
                types: [],
                languages: [],
                requirements: [],
                salaryMin: 0,
                salaryMax: 50000,
                sortBy: 'newest',
            },
        };
        this.listeners = {};
        this.loadFromStorage();
    }

    generateKey(id, type) {
        return `${type}_${id}`;
    }

    setJobs(jobs, type) {
        this.state.jobs = jobs;
        this.state.currentJobType = type;
        this.notify('jobs');
    }

    getJobs() {
        return this.state.jobs;
    }

    setFilters(filters) {
        this.state.filters = filters;
        this.notify('filters');
    }

    getFilters() {
        return this.state.filters;
    }

    getAvailableFilters(jobs, jobType) {
        const locations = [...new Set(jobs.map((j) => j.location))].sort();
        const types = [...new Set(jobs.map((j) => j.type))].sort();

        let languages = [];
        if (jobType === 'it') {
            const allReqs = jobs.flatMap((j) => j.requirements || []);
            const commonLanguages = [
                'JavaScript',
                'Python',
                'Java',
                'TypeScript',
                'C#',
                'C++',
                'Go',
                'Rust',
                'PHP',
                'Ruby',
            ];
            languages = commonLanguages.filter((lang) =>
                allReqs.some((req) =>
                    req.toLowerCase().includes(lang.toLowerCase())
                )
            );
        }

        return {
            locations,
            types,
            languages,
        };
    }

    toggleFavorite(id) {
        const type = this.state.currentJobType;
        const key = this.generateKey(id, type);

        if (this.state.favorites[key]) {
            delete this.state.favorites[key];
        } else {
            this.state.favorites[key] = true;
        }

        this.saveToStorage();
        this.notify('favorites');
    }

    isFavorite(id) {
        const type = this.state.currentJobType;
        const key = this.generateKey(id, type);
        return !!this.state.favorites[key];
    }

    getAllFavorites(type) {
        const prefix = `${type}_`;
        return Object.keys(this.state.favorites)
            .filter((key) => key.startsWith(prefix))
            .map((key) => parseInt(key.replace(prefix, '')));
    }

    setComparison(ids) {
        this.state.comparison = ids;
        this.saveToStorage();
        this.notify('comparison');
    }

    getComparison() {
        return this.state.comparison;
    }

    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    notify(key) {
        if (this.listeners[key]) {
            this.listeners[key].forEach((callback) => callback());
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('jobhunt_store', JSON.stringify(this.state));
        } catch (e) {
            console.log('Storage error:', e);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('jobhunt_store');
            if (stored) {
                const data = JSON.parse(stored);
                this.state = { ...this.state, ...data };
            }
        } catch (e) {
            console.log('Storage error:', e);
        }
    }
}

const store = new Store();
export default store;
