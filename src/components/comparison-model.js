import store from '../store.js';

const template = document.createElement('template');
template.innerHTML = ``;

export default class ComparisonModel extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.style.display = 'none';
    }

    show(jobs) {
        const shadow = this.shadowRoot;
        const comparisonCount = jobs.length;
        const maxComparison = 3;

        const comparisonRows = jobs[0].requirements
            ? this.createComparisonTable(jobs)
            : '<p>Brak danych do porównania</p>';

        shadow.innerHTML = `
      <div class="comparison-model">
        <div class="comparison-header">
          <h2>Porównanie ofert</h2>
          <div class="comparison-count">${comparisonCount}/${maxComparison}</div>
          <button class="comparison-close" data-action="close">&times;</button>
        </div>

        <div class="comparison-content">
          <table>
            ${comparisonRows}
          </table>
        </div>

        <div class="comparison-footer">
          <button class="btn btn-close" data-action="close">Zamknij</button>
          <button class="btn btn-clear" data-action="clear">
            🗑️ Wyczyść porównywarkę
          </button>
        </div>
      </div>
    `;

        this.classList.add('open');
        this.style.display = 'flex';
        this.setupEventListeners();
    }

    createComparisonTable(jobs) {
        const headers = `
    <thead>
      <tr>
        <th style="min-width: 150px;">Kryterium</th>
        ${jobs.map((job) => `<th>${job.title}</th>`).join('')}
      </tr>
    </thead>
  `;

        const rows = [
            { label: 'Firma', key: 'company' },
            { label: 'Lokalizacja', key: 'location' },
            { label: 'Typ umowy', key: 'type' },
            {
                label: 'Pensja',
                key: 'salary',
                formatter: (job) => `${job.salary_min} - ${job.salary_max} PLN`,
            },
            {
                label: 'Benefity',
                key: 'benefits',
                formatter: (job) =>
                    (job.benefits || [])
                        .flatMap((b) => b.split(',').map((x) => x.trim()))
                        .join(', ') || '-',
            },
            {
                label: 'Wymagania',
                key: 'requirements',
                formatter: (job) =>
                    (job.requirements || [])
                        .flatMap((r) => r.split(',').map((x) => x.trim()))
                        .join(', ') || '-',
            },
        ];

        const bodyRows = rows
            .map(
                (row) => `
      <tr>
        <td style="font-weight: 600;">${row.label}</td>
        ${jobs
            .map(
                (job) =>
                    `<td>${
                        row.formatter ? row.formatter(job) : job[row.key] || '-'
                    }</td>`
            )
            .join('')}
      </tr>
    `
            )
            .join('');

        return `${headers}<tbody>${bodyRows}</tbody>`;
    }

    setupEventListeners() {
        const shadow = this.shadowRoot;

        const closeButtons = shadow.querySelectorAll('[data-action="close"]');
        closeButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.close();
            });
        });

        const clearBtn = shadow.querySelector('[data-action="clear"]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                store.setComparison([]);

                const cards = document.querySelectorAll('job-card');
                cards.forEach((card) => {
                    card.updateComparison(false);
                });

                const compareBtn = document.getElementById('compareBtn');
                if (compareBtn) {
                    compareBtn.textContent = 'Porównaj';
                    compareBtn.style.opacity = '0.5';
                }

                this.close();
            });
        }

        this.addEventListener('click', (e) => {
            if (e.target === this) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.classList.contains('open')) {
                this.close();
            }
        });
    }

    close() {
        this.classList.remove('open');
        this.style.display = 'none';
    }
}

customElements.define('comparison-model', ComparisonModel);
