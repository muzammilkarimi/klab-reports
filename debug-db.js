import { db } from './backend/db.js';

try {
    const tests = db.prepare('SELECT count(*) as count FROM tests').get();
    const patients = db.prepare('SELECT count(*) as count FROM patients').get();
    const reports = db.prepare('SELECT count(*) as count FROM reports').get();
    const results = db.prepare('SELECT count(*) as count FROM report_results').get();
    const settings = db.prepare('SELECT count(*) as count FROM settings').get();
    
    console.log('--- DATABASE STATS ---');
    console.log(`Tests: ${tests.count}`);
    console.log(`Patients: ${patients.count}`);
    console.log(`Reports: ${reports.count}`);
    console.log(`Results: ${results.count}`);
    console.log(`Settings: ${settings.count}`);
    
    if (patients.count > 0 && reports.count > 0) {
        console.log('SUCCESS: Dummy data found.');
    } else {
        console.error('FAILURE: Missing dummy data.');
    }
} catch (error) {
    console.error('Debug script error:', error);
}

setTimeout(() => process.exit(0), 500);
