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
        <style>
        :host {
          all: initial;
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        :host(.open) {
          display: flex !important;
          align-items: center;
          justify-content: center;
        }

        .comparison-model {
          background: #1a1a2e;
          border-radius: 12px;
          padding: 30px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          color: rgba(255, 255, 255, 0.8);
        }

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 15px;
          gap: 15px;

          h2 {
            margin: 0;
            color: rgba(255, 255, 255, 0.95);
            font-size: 24px;
            flex: 1;
          }
        }


        .comparison-count {
          background: var(--primary-color);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }

        .comparison-close {
          background: none;
          border: none;
          font-size: 28px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;

          &:hover {
            color: rgba(255, 255, 255, 0.95);
            transform: scale(1.1);
          }
        }

        .comparison-content {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        th {
          background: #1f0947;
          color: snow;
          padding: 12px;
          text-align: left;
          border: 1px solid var(--primary-dark);
          font-weight: 600;
          position: sticky;
          top: 0;
        }

        td {
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        tr:nth-child(even) {
          background: rgba(255, 255, 255, 0.02);
        }

        .comparison-footer {
          display: flex;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-close {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
          }
        }


        .btn-clear {
          background: linear-gradient(135deg, var(--primary-dark), #3c197e);
          color: white;
          border: none;

          &:hover {
            background: linear-gradient(235deg, var(--primary-dark), #3c197e);
            box-shadow: 0 4px 12px black;
            transform: translateY(-2px);
          }
          
          &:active {
            transform: translateY(0);
          }
        }

      </style>
      
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
