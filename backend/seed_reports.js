import { db, initDb } from './db.js';

export const seedReports = () => {
    console.log('--- SEED REPORTS START ---');

    try {
        const patients = [
            { name: 'John Doe', age: 45, gender: 'Male', phone: '9876543210' },
            { name: 'Jane Smith', age: 32, gender: 'Female', phone: '8765432109' },
            { name: 'Robert Wilson', age: 58, gender: 'Male', phone: '7654321098' },
            { name: 'Mary Johnson', age: 24, gender: 'Female', phone: '6543210987' }
        ];

        db.transaction(() => {
            console.log('Inside transaction...');
            
            // 1. Insert Patients
            const insertPatient = db.prepare('INSERT INTO patients (name, age, gender, phone) VALUES (?, ?, ?, ?)');
            
            patients.forEach(p => {
                const exists = db.prepare('SELECT id FROM patients WHERE name = ? AND phone = ?').get(p.name, p.phone);
                if (!exists) {
                    console.log(`Inserting patient: ${p.name}`);
                    insertPatient.run(p.name, p.age, p.gender, p.phone);
                } else {
                    console.log(`Patient already exists: ${p.name}`);
                }
            });

            const allPatients = db.prepare('SELECT id, name, gender FROM patients').all();
            console.log(`Patients in DB: ${allPatients.length}`);
            
            const allTests = db.prepare('SELECT id, test_name, price FROM tests').all();
            console.log(`Tests in DB: ${allTests.length}`);
            
            if (allTests.length === 0) {
                console.error('No tests found in database. Run seed.js first.');
                return;
            }

            // 2. Create Reports and Results
            allPatients.forEach(patient => {
                // Check if this patient already has reports
                const reportCount = db.prepare('SELECT COUNT(*) as count FROM reports WHERE patient_id = ?').get(patient.id).count;
                if (reportCount > 0) {
                    console.log(`Patient ${patient.name} already has ${reportCount} reports. Skipping seed.`);
                    return;
                }

                console.log(`Seeding reports for ${patient.name}...`);
                for (let i = 0; i < 2; i++) {
                    const test = allTests[Math.floor(Math.random() * allTests.length)];
                    
                    const reportInsert = db.prepare(`
                        INSERT INTO reports (patient_id, status, total_amount, bill_number, referring_doctor) 
                        VALUES (?, ?, ?, ?, ?)
                    `).run(
                        patient.id, 
                        i === 0 ? 'FINAL' : 'DRAFT', 
                        test.price, 
                        `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
                        'Dr. Self'
                    );
                    
                    const reportId = reportInsert.lastInsertRowid;
                    
                    const params = db.prepare('SELECT id, param_name, min_range, max_range, unit FROM test_parameters WHERE test_id = ?').all(test.id);
                    
                    params.forEach(param => {
                        let val;
                        if (param.min_range && param.max_range) {
                            const rand = Math.random();
                            if (rand < 0.7) {
                                val = (param.min_range + Math.random() * (param.max_range - param.min_range)).toFixed(1);
                            } else if (rand < 0.85) {
                                val = (param.min_range - Math.random() * (param.min_range * 0.2)).toFixed(1);
                            } else {
                                val = (param.max_range + Math.random() * (param.max_range * 0.2)).toFixed(1);
                            }
                        } else {
                            val = (Math.random() * 100).toFixed(1);
                        }

                        let status = 'NORMAL';
                        if (param.min_range && parseFloat(val) < param.min_range) status = 'LOW';
                        if (param.max_range && parseFloat(val) > param.max_range) status = 'HIGH';

                        db.prepare(`
                            INSERT INTO report_results (report_id, parameter_id, result_value, status) 
                            VALUES (?, ?, ?, ?)
                        `).run(reportId, param.id, val.toString(), status);
                    });
                }
            });
        })();
        console.log('--- SEED REPORTS COMPLETED ---');
    } catch (error) {
        console.error('--- SEED REPORTS ERROR ---', error);
    }
};

// Standalone execution
if (process.argv[1] && process.argv[1].endsWith('seed_reports.js')) {
    initDb();
    seedReports();
    process.exit(0);
}
