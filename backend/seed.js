export const seedData = (db) => {
    const insertTest = db.prepare(`
        INSERT OR IGNORE INTO tests (test_name, price, department) VALUES (?, ?, ?)
    `);

    const insertParam = db.prepare(`
        INSERT OR IGNORE INTO test_parameters (test_id, param_name, unit, min_range, max_range, gender_specific) 
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const getTestId = (name) => {
        const row = db.prepare('SELECT id FROM tests WHERE test_name = ?').get(name);
        return row ? row.id : null;
    };

    const insertParamsSafe = (testId, paramsArray) => {
        if (!testId) return;
        const exists = db.prepare('SELECT COUNT(*) as count FROM test_parameters WHERE test_id = ?').get(testId).count;
        if (exists === 0) {
            paramsArray.forEach(p => insertParam.run(testId, ...p));
        }
    };

    // --- 1. Hematology / Serology ---
    const hematologyTests = [
        ['Complete Blood Count (CBC)', 500, 'Hematology/Serology'],
        ['Haemoglobin (Hb)', 150, 'Hematology/Serology'],
        ['TLC (Total Leukocyte Count)', 200, 'Hematology/Serology'],
        ['DLC (Differential Leukocyte Count)', 250, 'Hematology/Serology'],
        ['ESR (Erythrocyte Sedimentation Rate)', 150, 'Hematology/Serology'],
        ['RBC Count', 200, 'Hematology/Serology'],
        ['PCV (Packed Cell Volume)', 200, 'Hematology/Serology'],
        ['Platelets Count', 300, 'Hematology/Serology'],
        ['BT & CT (Bleeding & Clotting Time)', 300, 'Hematology/Serology'],
        ['AEC (Absolute Eosinophil Count)', 250, 'Hematology/Serology'],
        ['Malaria Card Test', 400, 'Hematology/Serology'],
        ['ABO Grouping (H/W both)', 300, 'Hematology/Serology'],
        ['Rh Factor (H/W both)', 300, 'Hematology/Serology'],
        ['Widal Test', 350, 'Hematology/Serology'],
        ['R.A. Factor', 500, 'Hematology/Serology'],
        ['A.S.O. Titre', 200, 'Hematology/Serology'],
        ['CRP (C-Reactive Protein)', 500, 'Hematology/Serology'],
        ['HIV 1&2', 600, 'Hematology/Serology'],
        ['HBsAg', 500, 'Hematology/Serology'],
        ['VDRL (H/W both)', 300, 'Hematology/Serology'],
        ['ELISA for Kalazar', 1200, 'Hematology/Serology']
    ];
    
    hematologyTests.forEach(([name, price, dept]) => {
        insertTest.run(name, price, dept);
    });

    // Detailed Parameters for Hematology
    let cbcId = getTestId('Complete Blood Count (CBC)');
    insertParamsSafe(cbcId, [
        ['Hemoglobin', 'g/dL', 13.0, 18.0, 1],
        ['Hemoglobin', 'g/dL', 12.0, 16.0, 2],
        ['Total WBC Count (TLC)', 'cells/cumm', 4000, 11000, 0],
        ['RBC Count', 'mill/cumm', 4.5, 6.5, 1],
        ['RBC Count', 'mill/cumm', 3.8, 5.8, 2],
        ['PCV (Hematocrit)', '%', 40, 54, 1],
        ['PCV (Hematocrit)', '%', 37, 47, 2],
        ['MCV', 'fL', 80, 100, 0],
        ['MCH', 'pg', 27, 32, 0],
        ['MCHC', 'g/dL', 32, 36, 0],
        ['Platelet Count', 'lakh/cumm', 1.5, 4.5, 0],
        ['RDW-CV', '%', 11.5, 14.5, 0]
    ]);

    insertParamsSafe(getTestId('Haemoglobin (Hb)'), [
        ['Hemoglobin (Hb)', 'g/dL', 13.0, 18.0, 1],
        ['Hemoglobin (Hb)', 'g/dL', 12.0, 16.0, 2]
    ]);

    insertParamsSafe(getTestId('TLC (Total Leukocyte Count)'), [
        ['Total WBC Count (TLC)', 'cells/cumm', 4000, 11000, 0]
    ]);

    insertParamsSafe(getTestId('DLC (Differential Leukocyte Count)'), [
        ['Neutrophils', '%', 40, 70, 0],
        ['Lymphocytes', '%', 20, 45, 0],
        ['Monocytes', '%', 2, 10, 0],
        ['Eosinophils', '%', 1, 6, 0],
        ['Basophils', '%', 0, 1, 0]
    ]);

    insertParamsSafe(getTestId('ESR (Erythrocyte Sedimentation Rate)'), [
        ['ESR', 'mm/1st hr', 0, 15, 1],
        ['ESR', 'mm/1st hr', 0, 20, 2]
    ]);

    insertParamsSafe(getTestId('RBC Count'), [
        ['RBC Count', 'mill/cumm', 4.5, 6.5, 1],
        ['RBC Count', 'mill/cumm', 3.8, 5.8, 2]
    ]);

    insertParamsSafe(getTestId('PCV (Packed Cell Volume)'), [
        ['PCV (Hematocrit)', '%', 40, 54, 1],
        ['PCV (Hematocrit)', '%', 37, 47, 2]
    ]);

    insertParamsSafe(getTestId('Platelets Count'), [
        ['Platelet Count', 'lakh/cumm', 1.5, 4.5, 0]
    ]);

    insertParamsSafe(getTestId('BT & CT (Bleeding & Clotting Time)'), [
        ['Bleeding Time (BT)', 'min', 2, 7, 0],
        ['Clotting Time (CT)', 'min', 4, 10, 0]
    ]);

    insertParamsSafe(getTestId('AEC (Absolute Eosinophil Count)'), [
        ['AEC', 'cells/cumm', 40, 440, 0]
    ]);

    insertParamsSafe(getTestId('Malaria Card Test'), [
        ['Method', '', null, null, 0],
        ['Result', '', null, null, 0],
        ['Note', '', null, null, 0]
    ]);

    insertParamsSafe(getTestId('ABO Grouping (H/W both)'), [
        ['Blood Group', '', null, null, 0],
        ['Rh Factor', '', null, null, 0]
    ]);

    insertParamsSafe(getTestId('Rh Factor (H/W both)'), [
        ['Rh Factor', '', null, null, 0]
    ]);

    insertParamsSafe(getTestId('Widal Test'), [
        ["S. Typhi 'O'", 'Titer', null, null, 0],
        ["S. Typhi 'H'", 'Titer', null, null, 0],
        ["S. Paratyphi 'AH'", 'Titer', null, null, 0],
        ["S. Paratyphi 'BH'", 'Titer', null, null, 0]
    ]);

    insertParamsSafe(getTestId('R.A. Factor'), [['R.A. Factor', 'IU/mL', 0, 15, 0]]);
    insertParamsSafe(getTestId('A.S.O. Titre'), [['A.S.O. Titre', 'IU/mL', 0, 200, 0]]);
    insertParamsSafe(getTestId('CRP (C-Reactive Protein)'), [['CRP', 'mg/L', 0, 6.0, 0]]);
    insertParamsSafe(getTestId('HIV 1&2'), [['HIV 1&2 Antibodies', '', null, null, 0]]);
    insertParamsSafe(getTestId('HBsAg'), [['HBsAg', '', null, null, 0]]);
    insertParamsSafe(getTestId('VDRL (H/W both)'), [['VDRL', '', null, null, 0]]);
    insertParamsSafe(getTestId('ELISA for Kalazar'), [
        ['IgG Antibodies', '', null, null, 0],
        ['IgM Antibodies', '', null, null, 0]
    ]);

    // --- 2. Biochemistry ---
    const biochemistryTests = [
        ['Blood Sugar Fasting', 150, 'Biochemistry'],
        ['Blood Sugar PP', 150, 'Biochemistry'],
        ['Blood Sugar Random', 150, 'Biochemistry'],
        ['Liver Function Test (LFT)', 1200, 'Biochemistry'],
        ['Kidney Function Test (KFT)', 1000, 'Biochemistry'],
        ['Lipid Profile', 1200, 'Biochemistry'],
        ['Sr. Bilirubin', 300, 'Biochemistry'],
        ['SGOT (AST)', 300, 'Biochemistry'],
        ['SGPT (ALT)', 300, 'Biochemistry'],
        ['Alk. Phosphatase', 300, 'Biochemistry'],
        ['Total Protein', 250, 'Biochemistry'],
        ['Albumin', 250, 'Biochemistry'],
        ['Blood Urea', 250, 'Biochemistry'],
        ['Sr. Creatinine', 250, 'Biochemistry'],
        ['Uric Acid', 250, 'Biochemistry'],
        ['Sr. Electrolyte', 1000, 'Biochemistry'],
        ['Sr. Chloride', 400, 'Biochemistry'],
        ['Sr. Calcium', 400, 'Biochemistry'],
        ['Inorganic Phos.', 400, 'Biochemistry'],
        ['CPK', 800, 'Biochemistry'],
        ['CPK (MB)', 1000, 'Biochemistry'],
        ['Amylase', 800, 'Biochemistry'],
        ['LDH', 800, 'Biochemistry']
    ];
    biochemistryTests.forEach(([name, price, dept]) => {
        insertTest.run(name, price, dept);
    });

    // Biochemistry Parameters
    insertParamsSafe(getTestId('Blood Sugar Fasting'), [['Fasting Blood Sugar', 'mg/dL', 70, 100, 0]]);
    insertParamsSafe(getTestId('Blood Sugar PP'), [['Post Prandial Blood Sugar', 'mg/dL', 70, 140, 0]]);
    insertParamsSafe(getTestId('Blood Sugar Random'), [['Random Blood Sugar', 'mg/dL', 70, 150, 0]]);

    insertParamsSafe(getTestId('Liver Function Test (LFT)'), [
        ['Bilirubin Total', 'mg/dL', 0.2, 1.2, 0],
        ['Bilirubin Direct', 'mg/dL', 0.0, 0.3, 0],
        ['Bilirubin Indirect', 'mg/dL', 0.1, 0.8, 0],
        ['SGOT (AST)', 'U/L', 5, 40, 0],
        ['SGPT (ALT)', 'U/L', 7, 56, 0],
        ['Alkaline Phosphatase', 'U/L', 44, 147, 0],
        ['Total Protein', 'g/dL', 6.0, 8.3, 0],
        ['Albumin', 'g/dL', 3.5, 5.2, 0],
        ['Globulin', 'g/dL', 2.0, 3.5, 0],
        ['A/G Ratio', 'Ratio', 1.1, 2.2, 0]
    ]);

    insertParamsSafe(getTestId('Kidney Function Test (KFT)'), [
        ['Blood Urea', 'mg/dL', 10, 50, 0],
        ['Serum Creatinine', 'mg/dL', 0.6, 1.3, 0],
        ['Uric Acid', 'mg/dL', 3.5, 7.2, 0],
        ['Sodium (Na+)', 'mmol/L', 135, 145, 0],
        ['Potassium (K+)', 'mmol/L', 3.5, 5.5, 0],
        ['Chloride (Cl-)', 'mmol/L', 96, 106, 0]
    ]);

    insertParamsSafe(getTestId('Lipid Profile'), [
        ['Total Cholesterol', 'mg/dL', 100, 200, 0],
        ['Triglycerides', 'mg/dL', 50, 150, 0],
        ['HDL Cholesterol', 'mg/dL', 40, 60, 0],
        ['LDL Cholesterol', 'mg/dL', 0, 100, 0],
        ['VLDL Cholesterol', 'mg/dL', 5, 40, 0]
    ]);

    // Individual Biochemistry
    insertParamsSafe(getTestId('Sr. Bilirubin'), [
        ['Bilirubin Total', 'mg/dL', 0.2, 1.2, 0],
        ['Bilirubin Direct', 'mg/dL', 0.0, 0.3, 0],
        ['Bilirubin Indirect', 'mg/dL', 0.1, 0.8, 0]
    ]);
    insertParamsSafe(getTestId('SGOT (AST)'), [['SGOT (AST)', 'U/L', 5, 40, 0]]);
    insertParamsSafe(getTestId('SGPT (ALT)'), [['SGPT (ALT)', 'U/L', 7, 56, 0]]);
    insertParamsSafe(getTestId('Alk. Phosphatase'), [['Alkaline Phosphatase', 'U/L', 44, 147, 0]]);
    insertParamsSafe(getTestId('Total Protein'), [['Total Protein', 'g/dL', 6.0, 8.3, 0]]);
    insertParamsSafe(getTestId('Albumin'), [['Albumin', 'g/dL', 3.5, 5.2, 0]]);
    insertParamsSafe(getTestId('Blood Urea'), [['Blood Urea', 'mg/dL', 10, 50, 0]]);
    insertParamsSafe(getTestId('Sr. Creatinine'), [['Serum Creatinine', 'mg/dL', 0.6, 1.3, 0]]);
    insertParamsSafe(getTestId('Uric Acid'), [['Uric Acid', 'mg/dL', 3.5, 7.2, 0]]);
    insertParamsSafe(getTestId('Sr. Electrolyte'), [
        ['Sodium (Na+)', 'mmol/L', 135, 145, 0],
        ['Potassium (K+)', 'mmol/L', 3.5, 5.5, 0],
        ['Chloride (Cl-)', 'mmol/L', 96, 106, 0]
    ]);
    insertParamsSafe(getTestId('Sr. Chloride'), [['Chloride (Cl-)', 'mmol/L', 96, 106, 0]]);
    insertParamsSafe(getTestId('Sr. Calcium'), [['Calcium Total', 'mg/dL', 8.5, 10.5, 0]]);
    insertParamsSafe(getTestId('Inorganic Phos.'), [['Inorganic Phosphorus', 'mg/dL', 2.5, 4.5, 0]]);
    insertParamsSafe(getTestId('CPK'), [
        ['CPK Total', 'U/L', 39, 308, 1],
        ['CPK Total', 'U/L', 26, 192, 2]
    ]);
    insertParamsSafe(getTestId('CPK (MB)'), [['CPK-MB', 'U/L', 0, 25, 0]]);
    insertParamsSafe(getTestId('Amylase'), [['Amylase', 'U/L', 30, 110, 0]]);
    insertParamsSafe(getTestId('LDH'), [['LDH', 'U/L', 140, 280, 0]]);


    // --- 3. Endocrinology / Special ---
    const specialTests = [
        ['T3, T4, TSH', 1200, 'Endocrinology'],
        ['HbA1c', 600, 'Endocrinology'],
        ['PSA', 1500, 'Endocrinology'],
        ['Prolactin', 800, 'Endocrinology'],
        ['FSH', 800, 'Endocrinology'],
        ['LH', 800, 'Endocrinology']
    ];
    specialTests.forEach(([name, price, dept]) => {
        insertTest.run(name, price, dept);
    });

    // Thyroid & Special Parameters
    insertParamsSafe(getTestId('T3, T4, TSH'), [
        ['TSH', 'uIU/mL', 0.45, 4.5, 0],
        ['Total T3', 'ng/dL', 80, 200, 0],
        ['Total T4', 'ug/dL', 5.0, 12.0, 0]
    ]);
    
    insertParamsSafe(getTestId('HbA1c'), [
        ['HbA1c', '%', 4.0, 5.7, 0],
        ['Estimated Average Glucose (eAG)', 'mg/dL', 68, 117, 0]
    ]);
    insertParamsSafe(getTestId('PSA'), [['Total PSA', 'ng/mL', 0, 4.0, 1]]);
    insertParamsSafe(getTestId('Prolactin'), [
        ['Prolactin', 'ng/mL', 3.0, 13.0, 1],
        ['Prolactin', 'ng/mL', 3.0, 27.0, 2]
    ]);
    insertParamsSafe(getTestId('FSH'), [
        ['FSH', 'mIU/mL', 1.5, 12.4, 1],
        ['FSH (Follicular Phase)', 'mIU/mL', 3.3, 11.3, 2]
    ]);
    insertParamsSafe(getTestId('LH'), [
        ['LH', 'mIU/mL', 1.3, 8.0, 1],
        ['LH (Follicular Phase)', 'mIU/mL', 3.3, 11.3, 2]
    ]);

    // --- 4. Clinical Pathology ---
    const pathologyTests = [
        ['Urine R/E', 200, 'Clinical Pathology'],
        ['Stool R/E', 200, 'Clinical Pathology']
    ];
    pathologyTests.forEach(([name, price, dept]) => {
        insertTest.run(name, price, dept);
    });

    // Pathology Parameters
    insertParamsSafe(getTestId('Urine R/E'), [
        ['Color', '', null, null, 0],
        ['Transparency', '', null, null, 0],
        ['PH', '', 4.5, 8.0, 0],
        ['Specific Gravity', '', 1.005, 1.030, 0],
        ['Glucose', '', null, null, 0],
        ['Protein', '', null, null, 0],
        ['Pus Cells', '/hpf', 0, 4, 0],
        ['RBCs', '/hpf', 0, 2, 0],
        ['Epithelial Cells', '/hpf', 2, 5, 0]
    ]);
    
    insertParamsSafe(getTestId('Stool R/E'), [
        ['Color', '', null, null, 0],
        ['Consistency', '', null, null, 0],
        ['Mucus', '', null, null, 0],
        ['Blood', '', null, null, 0],
        ['Pus Cells', '/hpf', 0, 4, 0],
        ['RBCs', '/hpf', 0, 1, 0],
        ['Ova', '', null, null, 0],
        ['Cysts', '', null, null, 0],
        ['Parasites', '', null, null, 0]
    ]);

    console.log('Seed process completed.');
};
