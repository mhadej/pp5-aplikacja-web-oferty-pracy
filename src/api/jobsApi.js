const API_GEN = 'https://my.api.mockaroo.com/general_jobs.json?key=4c139fd0';
const API_IT = 'https://my.api.mockaroo.com/it_jobs.json?key=4c139fd0';

export async function fetchJobs(type) {
    const url = type === 'general' ? API_GEN : API_IT;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data.map((job, index) => {
            const requirements = [];
            for (let i = 0; i < 5; i++) {
                const key = i === 0 ? 'requirements' : `requirements[${i}]`;
                if (job[key]) {
                    const val = String(job[key]).trim();
                    if (val) requirements.push(val);
                }
            }

            const benefits = [];
            for (let i = 0; i < 5; i++) {
                const key = i === 0 ? 'benefits' : `benefits[${i}]`;
                if (job[key]) {
                    const val = String(job[key]).trim();
                    if (val) benefits.push(val);
                }
            }

            let endsIso = job.ends;
            if (!endsIso) {
                const endDate = new Date(job.posted);
                endDate.setDate(endDate.getDate() + 30);
                endsIso = endDate.toISOString().split('T')[0];
            }

            const mappedJob = {
                id: parseInt(job.id) || 0,
                title: String(job.title || '').trim(),
                company: String(job.company || '').trim(),
                location: String(job.location || '').trim(),
                type: String(job.type || '').trim(),
                salary_min: parseInt(job.salary_min) || 0,
                salary_max: parseInt(job.salary_max) || 0,
                posted: job.posted,
                ends: endsIso,
                requirements: requirements.filter(Boolean),
                benefits: benefits.filter(Boolean),
            };

            return mappedJob;
        });
    } catch (error) {
        console.log('Error: ', error);
        throw error;
    }
}

export async function getJobDetails(jobId, type) {
    const jobs = await fetchJobs(type);
    return jobs.find((j) => j.id === jobId);
}
