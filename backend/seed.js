export const seedData = (db) => {
    const insertTest = db.prepare(`
        INSERT OR IGNORE INTO tests (test_name, price, department) VALUES (?, ?, ?)
    `);

    const insertParam = db.prepare(`
        INSERT INTO test_parameters (test_id, param_name, unit, min_range, max_range, gender_specific) 
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const getTestId = (name) => {
        const row = db.prepare('SELECT id FROM tests WHERE test_name = ?').get(name);
        return row ? row.id : null;
    };

    db.transaction(() => {
        // --- 1. Hematology ---
        insertTest.run('Complete Blood Count (CBC)', 500, 'Haematology');
        let cbcId = getTestId('Complete Blood Count (CBC)');
        if (cbcId) {
            db.prepare('DELETE FROM test_parameters WHERE test_id = ?').run(cbcId);
            insertParam.run(cbcId, 'Haemoglobin', 'g/dL', 13.0, 17.0, 1); // Male
            insertParam.run(cbcId, 'Haemoglobin', 'g/dL', 12.0, 15.0, 2); // Female
            insertParam.run(cbcId, 'Total WBC Count', 'cells/cumm', 4000, 11000, 0);
            insertParam.run(cbcId, 'Platelet Count', 'lakh/cumm', 1.5, 4.5, 0);
            insertParam.run(cbcId, 'RBC Count', 'mill/cumm', 4.5, 5.5, 1);
            insertParam.run(cbcId, 'Packed Cell Volume (PCV)', '%', 40, 50, 1);
            insertParam.run(cbcId, 'Neutrophils', '%', 40, 75, 0);
            insertParam.run(cbcId, 'Lymphocytes', '%', 20, 45, 0);
            insertParam.run(cbcId, 'Monocytes', '%', 2, 10, 0);
            insertParam.run(cbcId, 'Eosinophils', '%', 1, 6, 0);
        }

        // --- 2. Biochemistry (Liver Function) ---
        insertTest.run('Liver Function Test (LFT)', 1200, 'Biochemistry');
        let lftId = getTestId('Liver Function Test (LFT)');
        if (lftId) {
            db.prepare('DELETE FROM test_parameters WHERE test_id = ?').run(lftId);
            insertParam.run(lftId, 'Bilirubin Total', 'mg/dL', 0.2, 1.2, 0);
            insertParam.run(lftId, 'Bilirubin Direct', 'mg/dL', 0.0, 0.3, 0);
            insertParam.run(lftId, 'SGOT (AST)', 'U/L', 5, 40, 0);
            insertParam.run(lftId, 'SGPT (ALT)', 'U/L', 7, 56, 0);
            insertParam.run(lftId, 'Alkaline Phosphatase', 'U/L', 44, 147, 0);
            insertParam.run(lftId, 'Total Protein', 'g/dL', 6.0, 8.3, 0);
            insertParam.run(lftId, 'Albumin', 'g/dL', 3.4, 5.4, 0);
        }

        // --- 3. Biochemistry (Kidney Function) ---
        insertTest.run('Kidney Function Test (KFT)', 1000, 'Biochemistry');
        let kftId = getTestId('Kidney Function Test (KFT)');
        if (kftId) {
            db.prepare('DELETE FROM test_parameters WHERE test_id = ?').run(kftId);
            insertParam.run(kftId, 'Urea', 'mg/dL', 7, 20, 0);
            insertParam.run(kftId, 'Creatinine', 'mg/dL', 0.7, 1.3, 1); // Male
            insertParam.run(kftId, 'Creatinine', 'mg/dL', 0.6, 1.1, 2); // Female
            insertParam.run(kftId, 'Uric Acid', 'mg/dL', 3.4, 7.0, 1);
            insertParam.run(kftId, 'Calcium', 'mg/dL', 8.5, 10.2, 0);
        }

        // --- 4. Lipid Profile ---
        insertTest.run('Lipid Profile', 800, 'Biochemistry');
        let lipidId = getTestId('Lipid Profile');
        if (lipidId) {
            db.prepare('DELETE FROM test_parameters WHERE test_id = ?').run(lipidId);
            insertParam.run(lipidId, 'Total Cholesterol', 'mg/dL', 125, 200, 0);
            insertParam.run(lipidId, 'Triglycerides', 'mg/dL', 0, 150, 0);
            insertParam.run(lipidId, 'HDL Cholesterol', 'mg/dL', 40, 60, 0);
            insertParam.run(lipidId, 'LDL Cholesterol', 'mg/dL', 0, 100, 0);
        }

        // --- 5. Thyroid Profile ---
        insertTest.run('Thyroid Profile (T3, T4, TSH)', 1500, 'Endocrinology');
        let thyId = getTestId('Thyroid Profile (T3, T4, TSH)');
        if (thyId) {
            db.prepare('DELETE FROM test_parameters WHERE test_id = ?').run(thyId);
            insertParam.run(thyId, 'Total T3', 'ng/dL', 80, 200, 0);
            insertParam.run(thyId, 'Total T4', 'mcg/dL', 5.0, 12.0, 0);
            insertParam.run(thyId, 'TSH', 'uIU/mL', 0.4, 4.0, 0);
        }

        // --- 6. Diabetes ---
        insertTest.run('Blood Sugar (Fasting)', 150, 'Biochemistry');
        let glucId = getTestId('Blood Sugar (Fasting)');
        if (glucId) {
            db.prepare('DELETE FROM test_parameters WHERE test_id = ?').run(glucId);
            insertParam.run(glucId, 'Fasting Plasma Glucose', 'mg/dL', 70, 99, 0);
        }

        insertTest.run('HbA1c', 600, 'Biochemistry');
        let hbaId = getTestId('HbA1c');
        if (hbaId) {
            db.prepare('DELETE FROM test_parameters WHERE test_id = ?').run(hbaId);
            insertParam.run(hbaId, 'HbA1c', '%', 4.0, 5.6, 0);
        }
    })();
};

// Re-wrapper for standalone CLI use
import { db, initDb } from './db.js';
if (process.argv[1].endsWith('seed.js')) {
    console.log('Running standalone seed...');
    initDb();
    seedData(db);
    console.log('Standalone seed completed.');
}
