
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.send('Hospital Patient Management System Backend is Running!');
});

// Get all patients
app.get('/patients', (req, res) => {
    const sql = 'SELECT * FROM patients ORDER BY patient_id DESC';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

// Get one patient
app.get('/patients/:id', (req, res) => {
    const sql = 'SELECT * FROM patients WHERE patient_id = ?';

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(results[0]);
    });
});

// Register a patient
app.post('/patients', (req, res) => {
    const {
        patient_name, age, gender, phone,
        address, blood_group, disease
    } = req.body;

    if (
        !patient_name || age === undefined || age === null || age === '' ||
        !gender || !phone || !address || !blood_group || !disease
    ) {
        return res.status(400).json({
            message: 'Please provide all patient details'
        });
    }

    const sql = `
        INSERT INTO patients
        (patient_name, age, gender, phone, address, blood_group, disease)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        patient_name, age, gender, phone,
        address, blood_group, disease
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Patient registered successfully',
            patient_id: result.insertId
        });
    });
});

// Update a patient
app.put('/patients/:id', (req, res) => {
    const {
        patient_name, age, gender, phone,
        address, blood_group, disease
    } = req.body;

    if (
        !patient_name || age === undefined || age === null || age === '' ||
        !gender || !phone || !address || !blood_group || !disease
    ) {
        return res.status(400).json({
            message: 'Please provide all patient details'
        });
    }

    const sql = `
        UPDATE patients
        SET patient_name = ?, age = ?, gender = ?, phone = ?,
            address = ?, blood_group = ?, disease = ?
        WHERE patient_id = ?
    `;

    const values = [
        patient_name, age, gender, phone,
        address, blood_group, disease, req.params.id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({ message: 'Patient updated successfully' });
    });
});

// Delete a patient
app.delete('/patients/:id', (req, res) => {
    const sql = 'DELETE FROM patients WHERE patient_id = ?';

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({ message: 'Patient deleted successfully' });
    });
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Hospital Backend running on http://localhost:${PORT}`);
});
