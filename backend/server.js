import express from 'express';
import cors from 'cors';
import { db, initDb } from './db.js';
import { seedData } from './seed.js';
import { seedReports } from './seed_reports.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we have a writable log path
const isPackaged = process.env.NODE_ENV === 'production' || !!process.env.ELECTRON_RUN_AS_NODE;
const userDataPath = process.env.USER_DATA_PATH || 
    (process.platform === 'win32' ? process.env.APPDATA : path.join(process.env.HOME, '.config'));
const appDataDir = path.join(userDataPath, 'kLab-Reports');
if (!fs.existsSync(appDataDir)) fs.mkdirSync(appDataDir, { recursive: true });

const logFile = path.join(appDataDir, 'backend.log');

try {
    const startMsg = `Backend starting at ${new Date().toISOString()}\n`;
    fs.appendFileSync(logFile, startMsg);
    fs.appendFileSync(logFile, `Node: ${process.version}, Platform: ${process.platform}, Env: ${process.env.NODE_ENV}\n`);
    
    // Redirect console logs to file
    const originalLog = console.log;
    const originalError = console.error;
    console.log = (...args) => {
        originalLog(...args);
        try { fs.appendFileSync(logFile, `[LOG] ${args.join(' ')}\n`); } catch {}
    };
    console.error = (...args) => {
        originalError(...args);
        try { fs.appendFileSync(logFile, `[ERR] ${args.join(' ')}\n`); } catch {}
    };
} catch (e) {
    // If logging fails, we can't do much, but at least don't crash the server
}

const app = express();
const PORT = process.env.PORT || 5000;

// Global error logging
process.on('uncaughtException', (err) => {
    try {
        fs.appendFileSync(logFile, `UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}\n`);
    } catch {}
    process.exit(1);
});

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        try {
            fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)\n`);
        } catch {}
    });
    next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB on start
initDb();

// Auto-seed if database is empty
const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
if (patientCount === 0) {
    console.log('Database empty, performing auto-seed...');
    seedData(db);
    seedReports();
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// -- Authentication --
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const user = db.prepare('SELECT id, username, full_name, role FROM users WHERE username = ? AND password = ?')
                      .get(username, password);
        
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -- User Management --
app.get('/api/users', (req, res) => {
    try {
        const users = db.prepare('SELECT id, username, full_name, role, created_at FROM users').all();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;
        const stmt = db.prepare('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)');
        const info = stmt.run(username, password, full_name, role || 'TECHNICIAN');
        res.json({ id: info.lastInsertRowid, username, full_name, role });
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, role } = req.body;
        
        let query = 'UPDATE users SET username = ?, full_name = ?, role = ?';
        const params = [username, full_name, role];
        
        if (password) {
            query += ', password = ?';
            params.push(password);
        }
        
        query += ' WHERE id = ?';
        params.push(id);
        
        const stmt = db.prepare(query);
        stmt.run(...params);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -- Licensing & Usage --
app.get('/api/license-status', (req, res) => {
    try {
        let tier = 'FREE';
        try {
            const tierRow = db.prepare('SELECT config_value FROM app_config WHERE config_key = ?').get('tier');
            if (tierRow) tier = tierRow.config_value;
        } catch (e) {
            console.error('app_config query failed:', e.message);
        }
        
        // Count reports created in the current month
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const firstDayOfMonth = `${year}-${month}-01 00:00:00`;
        
        let count = 0;
        try {
            const usage = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'FINAL' AND created_at >= ?").get(firstDayOfMonth);
            count = usage?.count || 0;
        } catch (e) {
            console.error('Usage count query failed:', e.message);
        }
        
        res.json({
            tier,
            monthlyUsage: count,
            limit: 30,
            isPro: tier === 'PRO'
        });
    } catch (error) {
        console.error('License Status Global Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/activate-license', (req, res) => {
    try {
        const { key } = req.body;
        
        // Simple verification for MVP: In a real app, this would be more complex
        // We'll use a set of valid keys or a secret pattern
        const VALID_KEYS = ['KLAB-PRO-2026', 'KLAB-ADMIN-999'];
        
        if (VALID_KEYS.includes(key)) {
            db.prepare('UPDATE app_config SET config_value = ? WHERE config_key = ?').run('PRO', 'tier');
            db.prepare('INSERT OR REPLACE INTO app_config (config_key, config_value) VALUES (?, ?)').run('license_key', key);
            res.json({ success: true, message: 'Pro License Activated!' });
        } else {
            res.status(400).json({ error: 'Invalid license key' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -- Database Maintenance --
app.post('/api/reset-database', (req, res) => {
    try {
        db.transaction(() => {
            // Delete in order of dependencies
            db.prepare('DELETE FROM report_results').run();
            db.prepare('DELETE FROM reports').run();
            db.prepare('DELETE FROM patients').run();
            db.prepare('DELETE FROM test_parameters').run();
            db.prepare('DELETE FROM tests').run();
            db.prepare('DELETE FROM users').run();
            db.prepare('DELETE FROM app_config').run();
            db.prepare('DELETE FROM settings').run();
            
            // Reset sequences
            db.prepare('DELETE FROM sqlite_sequence').run();
        })();
        
        // Re-initialize default admin, settings, and medical data
        initDb();
        seedData(db);
        seedReports();
        
        const counts = {
            patients: db.prepare('SELECT COUNT(*) as count FROM patients').get().count,
            reports: db.prepare('SELECT COUNT(*) as count FROM reports').get().count
        };
        
        res.json({ 
            success: true, 
            message: `System fully reset and seeded. Seeded ${counts.patients} patients and ${counts.reports} reports.`,
            counts 
        });
    } catch (error) {
        console.error('Reset Database Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// -- Patients --
app.get('/api/patients', (req, res) => {
  try {
      const stmt = db.prepare('SELECT * FROM patients ORDER BY created_at DESC');
      const patients = stmt.all();
      res.json(patients);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', (req, res) => {
    try {
        const { name, age, gender, phone } = req.body;
        
        // Try to find existing patient by name (Exact match)
        const existing = db.prepare('SELECT id FROM patients WHERE name = ? COLLATE NOCASE').get(name);
        
        if (existing) {
            // Update existing patient info
            db.prepare('UPDATE patients SET age = ?, gender = ?, phone = ? WHERE id = ?').run(age, gender, phone, existing.id);
            return res.json({ id: existing.id, ...req.body });
        }

        const stmt = db.prepare('INSERT INTO patients (name, age, gender, phone) VALUES (?, ?, ?, ?)');
        const info = stmt.run(name, age, gender, phone);
        res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -- Tests Master --
app.get('/api/tests', (req, res) => {
    try {
        const tests = db.prepare('SELECT * FROM tests ORDER BY test_name').all();
        res.json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tests', (req, res) => {
    try {
        const { test_name, price } = req.body;
        const stmt = db.prepare('INSERT INTO tests (test_name, price) VALUES (?, ?)');
        const info = stmt.run(test_name, price);
        res.json({ id: info.lastInsertRowid, test_name, price });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tests/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { test_name, price } = req.body;
        const stmt = db.prepare('UPDATE tests SET test_name = ?, price = ? WHERE id = ?');
        stmt.run(test_name, price, id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tests/:id', (req, res) => {
    try {
        const { id } = req.params;
        // Verify no existing reports used this test? Or cascading delete?
        // Ideally should check, but for MVP soft delete or force delete.
        // Let's assume force delete but we should delete params first.
        const deleteParams = db.prepare('DELETE FROM test_parameters WHERE test_id = ?');
        const deleteTest = db.prepare('DELETE FROM tests WHERE id = ?');
        
        db.transaction(() => {
            deleteParams.run(id);
            deleteTest.run(id);
        })();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tests/:id/parameters', (req, res) => {
    try {
        const { id } = req.params;
        const params = db.prepare('SELECT * FROM test_parameters WHERE test_id = ?').all(id);
        res.json(params);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/parameters', (req, res) => {
    try {
        const { test_id, param_name, unit, min_range, max_range, gender_specific } = req.body;
        const stmt = db.prepare('INSERT INTO test_parameters (test_id, param_name, unit, min_range, max_range, gender_specific) VALUES (?, ?, ?, ?, ?, ?)');
        const info = stmt.run(test_id, param_name, unit, min_range, max_range, gender_specific || 0);
        res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/parameters/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { param_name, unit, min_range, max_range, gender_specific } = req.body;
        const stmt = db.prepare('UPDATE test_parameters SET param_name = ?, unit = ?, min_range = ?, max_range = ?, gender_specific = ? WHERE id = ?');
        stmt.run(param_name, unit, min_range, max_range, gender_specific, id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/parameters/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM test_parameters WHERE id = ?');
        stmt.run(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -- Settings --
// Initialize Settings Table
db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
`).run();

app.get('/api/settings', (req, res) => {
    try {
        const settings = db.prepare('SELECT * FROM settings').all();
        // Convert to object: { "lab_name": "Val", ... }
        const settingsObj = settings.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const settings = req.body; // { key: value, ... }
        const insert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        const updateSettings = db.transaction((data) => {
            for (const [key, value] of Object.entries(data)) {
                insert.run(key, String(value));
            }
        });
        updateSettings(settings);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/next-bill-number', (req, res) => {
    try {
        const row = db.prepare('SELECT bill_number FROM reports WHERE bill_number IS NOT NULL ORDER BY id DESC LIMIT 1').get();
        if (row && row.bill_number) {
            const lastBill = row.bill_number;
            // Simple logic: if it ends in a number, increment it
            const match = lastBill.match(/(.*?)(\d+)$/);
            if (match) {
                const prefix = match[1];
                const num = parseInt(match[2], 10);
                const nextBill = `${prefix}${(num + 1).toString().padStart(match[2].length, '0')}`;
                return res.json({ nextBillNumber: nextBill });
            }
        }
        res.json({ nextBillNumber: '' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -- Reports --
app.get('/api/reports', (req, res) => {
    try {
        // Fetch recent reports with Patient Name joined
        // Simple join for list view
        const query = `
            SELECT r.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender 
            FROM reports r
            JOIN patients p ON r.patient_id = p.id
            ORDER BY r.created_at DESC
        `;
        const reports = db.prepare(query).all();
        
        // Ensure tests are attached? Or maybe just IDs/Count for the list view?
        // For report history list, we might want test names. 
        // We can do a second query or string agg if sqlite supports group_concat easily for this.
        // Let's do a simple enrichment loop or subquery
        const enhancedReports = reports.map(r => {
             // Get test names for this report
             // report_results -> parameter_id -> test_parameters -> test_id -> tests
             // Actually, we don't store test_ids directly in reports table, we use report_results. 
             // Wait, the POST /api/reports log showed we insert into report_results.
             
             // Let's get distinct test names for this report
             const tests = db.prepare(`
                SELECT DISTINCT t.test_name 
                FROM report_results rr
                JOIN test_parameters tp ON rr.parameter_id = tp.id
                JOIN tests t ON tp.test_id = t.id
                WHERE rr.report_id = ?
             `).all(r.id);
             
             return { ...r, test_names: tests.map(t => t.test_name).join(', ') };
        });

        res.json(enhancedReports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single report by ID with full details
app.get('/api/reports/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Get report with patient info
        const report = db.prepare(`
            SELECT r.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender, p.phone as patient_phone
            FROM reports r
            JOIN patients p ON r.patient_id = p.id
            WHERE r.id = ?
        `).get(id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Get all results for this report with parameter details
        const results = db.prepare(`
            SELECT 
                rr.*, 
                tp.param_name,
                tp.unit,
                tp.min_range,
                tp.max_range,
                tp.test_id,
                t.test_name
            FROM report_results rr
            JOIN test_parameters tp ON rr.parameter_id = tp.id
            JOIN tests t ON tp.test_id = t.id
            WHERE rr.report_id = ?
            ORDER BY t.test_name, tp.param_name
        `).all(id);

        // Attach results to report
        report.results = results;

        res.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/reports/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { 
            patient_id, 
            test_ids, 
            results, 
            total_amount, 
            status,
            referring_doctor,
            sample_collection_date,
            bill_number
        } = req.body;

        // --- Tier Enforcement Check ---
        if (status === 'FINAL') {
            const tierRow = db.prepare('SELECT config_value FROM app_config WHERE config_key = ?').get('tier');
            const tier = tierRow?.config_value || 'FREE';
            
            if (tier === 'FREE') {
                // Check if this report is ALREADY final (if so, allow update)
                const existing = db.prepare('SELECT status FROM reports WHERE id = ?').get(id);
                if (existing?.status !== 'FINAL') {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const firstDayOfMonth = `${year}-${month}-01 00:00:00`;
                    
                    const usage = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'FINAL' AND created_at >= ?").get(firstDayOfMonth);
                    const count = usage?.count || 0;
                    
                    if (count >= 30) {
                        return res.status(403).json({ 
                            error: 'Monthly limit reached (30 reports/month). Please upgrade to Pro for unlimited reporting.',
                            limitReached: true
                        });
                    }
                }
            }
        }
        // ------------------------------

        db.transaction(() => {
            // 1. Update report header
            const stmt = db.prepare(`
                UPDATE reports SET 
                    patient_id = ?, 
                    total_amount = ?, 
                    status = ?,
                    referring_doctor = ?,
                    sample_collection_date = ?,
                    bill_number = ?
                WHERE id = ?
            `);
            stmt.run(
                patient_id, 
                total_amount, 
                status || 'DRAFT',
                referring_doctor || null,
                sample_collection_date || null,
                bill_number || null,
                id
            );

            // 2. Clear old results
            db.prepare('DELETE FROM report_results WHERE report_id = ?').run(id);

            // 3. Insert new results
            const insertResult = db.prepare(`
                INSERT INTO report_results (report_id, parameter_id, result_value, status, remarks)
                VALUES (?, ?, ?, ?, ?)
            `);

            if (Array.isArray(results)) {
                results.forEach(r => {
                    insertResult.run(id, r.parameter_id, r.result_value, r.status, r.remarks || '');
                });
            }
        })();

        res.json({ success: true, report_id: id });
    } catch (error) {
        console.error('Report update error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reports', (req, res) => {
    // Transactional save for Report + Results
    try {
        const { 
            patient_id, 
            test_ids, 
            results, 
            total_amount, 
            status,
            referring_doctor,
            sample_collection_date,
            bill_number
        } = req.body;

        // --- Tier Enforcement Check ---
        if (status === 'FINAL') {
            const tierRow = db.prepare('SELECT config_value FROM app_config WHERE config_key = ?').get('tier');
            const tier = tierRow?.config_value || 'FREE';
            
            if (tier === 'FREE') {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const firstDayOfMonth = `${year}-${month}-01 00:00:00`;
                
                const usage = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'FINAL' AND created_at >= ?").get(firstDayOfMonth);
                const count = usage?.count || 0;
                
                if (count >= 30) {
                    return res.status(403).json({ 
                        error: 'Monthly limit reached (30 reports/month). Please upgrade to Pro for unlimited reporting.',
                        limitReached: true
                    });
                }
            }
        }
        // ------------------------------

        console.log('Received Report Payload:', JSON.stringify(req.body, null, 2));

        const createReport = db.transaction(() => {
            const stmt = db.prepare(`
                INSERT INTO reports (
                    patient_id, 
                    total_amount, 
                    status,
                    referring_doctor,
                    sample_collection_date,
                    bill_number
                ) VALUES (?, ?, ?, ?, ?, ?)
            `);
            const info = stmt.run(
                patient_id, 
                total_amount, 
                status || 'DRAFT',
                referring_doctor || null,
                sample_collection_date || null,
                bill_number || null
            );
            const reportId = info.lastInsertRowid;

            const insertResult = db.prepare(`
                INSERT INTO report_results (report_id, parameter_id, result_value, status, remarks)
                VALUES (?, ?, ?, ?, ?)
            `);

            if (Array.isArray(results)) {
                results.forEach(r => {
                    insertResult.run(reportId, r.parameter_id, r.result_value, r.status, r.remarks || '');
                });
            }
            
            return reportId;
        });

        const newReportId = createReport();
        res.json({ success: true, report_id: newReportId });
    } catch (error) {
        console.error('Report save error details:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a report (and its results via CASCADE)
app.delete('/api/reports/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete report (results will be deleted automatically via CASCADE)
        const stmt = db.prepare('DELETE FROM reports WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '127.0.0.1', () => {
  const msg = `Backend server running on http://127.0.0.1:${PORT}\n`;
  console.log(msg);
  try {
      fs.appendFileSync(logFile, msg);
  } catch {}
});
