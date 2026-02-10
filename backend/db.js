import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the user's data directory. In Electron, this is app.getPath('userData')
const isPackaged = process.env.NODE_ENV === 'production' || !!process.env.ELECTRON_RUN_AS_NODE;
const userDataPath = process.env.USER_DATA_PATH || 
    (process.platform === 'win32' ? process.env.APPDATA : path.join(process.env.HOME, '.config'));

// In production, we store in %APPDATA%/kLab-Reports/database/klab.db
// In development, we use the local project database folder
const dbDir = isPackaged 
    ? path.join(userDataPath, 'kLab-Reports', 'database') 
    : path.join(__dirname, '../database');

const dbPath = path.join(dbDir, 'klab.db');

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Using Database at:', dbPath);
const db = new Database(dbPath, { verbose: console.log });

function initDb() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database initialized');

    // Migrations: Add new fields to reports table if they don't exist
    try {
        db.exec(`ALTER TABLE reports ADD COLUMN referring_doctor TEXT;`);
        console.log('Added referring_doctor column');
    } catch (e) { /* Column exists */ }

    try {
        db.exec(`ALTER TABLE reports ADD COLUMN sample_collection_date DATETIME;`);
        console.log('Added sample_collection_date column');
    } catch (e) { /* Column exists */ }

    try {
        db.exec(`ALTER TABLE reports ADD COLUMN bill_number TEXT;`);
        console.log('Added bill_number column');
    } catch (e) { /* Column exists */ }

    // Ensure default admin user exists
    try {
        const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
        if (!adminExists) {
            db.prepare('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)')
              .run('admin', 'admin123', 'Lab Admin', 'ADMIN');
            console.log('Default admin user created');
        }
    } catch (e) {
        console.error('Failed to ensure admin user', e);
    }

    // Ensure default tier is set to FREE
    try {
        const tierExists = db.prepare('SELECT id FROM app_config WHERE config_key = ?').get('tier');
        if (!tierExists) {
            db.prepare('INSERT INTO app_config (config_key, config_value) VALUES (?, ?)').run('tier', 'FREE');
            db.prepare('INSERT INTO app_config (config_key, config_value) VALUES (?, ?)').run('install_date', new Date().toISOString());
            console.log('App initialized as FREE tier');
        }
    } catch (e) {
        console.error('Failed to initialize app_config', e);
    }
    // Ensure default settings exist
    try {
        const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get().count;
        if (settingsCount === 0) {
            const defaultSettings = [
                ['lab_name', 'kLab Diagnostic Centre'],
                ['address_line1', '123 Health Street'],
                ['address_line2', 'Medical District'],
                ['phone', '(555) 123-4567'],
                ['email', 'reports@klab.com'],
                ['website', 'www.klab.com']
            ];
            const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
            db.transaction(() => {
                for (const [key, value] of defaultSettings) {
                    insert.run(key, value);
                }
            })();
            console.log('Default laboratory settings initialized');
        }
    } catch (e) {
        console.error('Failed to initialize settings table', e);
    }
}

export { db, initDb };
