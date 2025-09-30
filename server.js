const express = require('express');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node'); // importi i ri
const path = require('path');

const app = express();
app.use(express.static('public'));

// === Setup LowDB me default data ===
const file = path.join(__dirname, 'employees.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { employees: [] }); // <--- default data

async function initDB() {
    await db.read();
    db.data = db.data || { employees: [] };

    // Lexo CSV
    const csvData = fs.readFileSync('data.csv', 'utf-8');
    const records = parse(csvData, {
        columns: true,
        trim: true,
        relax_quotes: true,
        skip_empty_lines: true
    });

    // Fut records në db.data.employees
    db.data.employees = records;
    await db.write();

    console.log(`Total records imported: ${records.length}`);
    console.log('Sample records:', records.slice(0, 3));
}

// Initialize DB
initDB().catch(err => console.error("Error initializing DB:", err));

// === API për kërkim ===
app.get('/search', async (req, res) => {
    const q = (req.query.q || '').toLowerCase();

    await db.read();
    const filtered = db.data.employees.filter(emp =>
        Object.values(emp).some(v => v && String(v).toLowerCase().includes(q))
    );

    res.json(filtered);
});

// === Start server ===
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
