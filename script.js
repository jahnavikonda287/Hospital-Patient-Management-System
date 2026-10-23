
const API_URL = 'http://localhost:5000/patients';

const patientForm = document.getElementById('patientForm');
const patientTable = document.getElementById('patientTable');
const searchInput = document.getElementById('searchInput');

const submitButton = document.getElementById('submitButton');
const cancelEdit = document.getElementById('cancelEdit');
const formHeading = document.getElementById('formHeading');

const patientDialog = document.getElementById('patientDialog');
const patientDetails = document.getElementById('patientDetails');
const closeDialog = document.getElementById('closeDialog');

let patients = [];
let editingId = null;

// Load patient records from MySQL
async function loadPatients() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to load patient records');
        }

        patients = await response.json();
        displayPatients();
        updateDashboard();

    } catch (error) {
        console.error(error);
        patientTable.innerHTML =
            '<tr><td colspan="8">Unable to load records. Check the backend server.</td></tr>';
    }
}

// Display patient records
function displayPatients() {
    const searchValue = searchInput.value.toLowerCase();

    const filteredPatients = patients.filter(patient =>
        String(patient.patient_id).includes(searchValue) ||
        patient.patient_name.toLowerCase().includes(searchValue)
    );

    patientTable.innerHTML = '';

    if (filteredPatients.length === 0) {
        patientTable.innerHTML =
            '<tr><td colspan="8">No patient records found</td></tr>';
        return;
    }

    filteredPatients.forEach(patient => {
        const row = document.createElement('tr');

        const values = [
            patient.patient_id,
            patient.patient_name,
            patient.age,
            patient.gender,
            patient.phone,
            patient.blood_group,
            patient.disease
        ];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value ?? '';
            row.appendChild(cell);
        });

        const actionCell = document.createElement('td');

        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.className = 'view-button';
        viewButton.addEventListener('click', () => viewPatient(patient));

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-button';
        editButton.addEventListener('click', () => editPatient(patient));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => deletePatient(patient.patient_id));

        actionCell.append(viewButton, editButton, deleteButton);
        row.appendChild(actionCell);
        patientTable.appendChild(row);
    });
}

// Register or update patient
patientForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const patient = {
        patient_name: document.getElementById('patientName').value.trim(),
        age: Number(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        blood_group: document.getElementById('bloodGroup').value,
        disease: document.getElementById('disease').value.trim()
    };

    const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patient)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || 'Operation failed');
        }

        alert(result.message);

        resetForm();
        await loadPatients();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

// Fill form for editing
function editPatient(patient) {
    editingId = patient.patient_id;

    document.getElementById('patientName').value = patient.patient_name;
    document.getElementById('age').value = patient.age;
    document.getElementById('gender').value = patient.gender;
    document.getElementById('phone').value = patient.phone;
    document.getElementById('address').value = patient.address;
    document.getElementById('bloodGroup').value = patient.blood_group;
    document.getElementById('disease').value = patient.disease;

    formHeading.textContent = 'Update Patient Details';
    submitButton.textContent = 'Update Patient';
    cancelEdit.hidden = false;

    document.getElementById('register').scrollIntoView({
        behavior: 'smooth'
    });
}

// Cancel editing
function resetForm() {
    patientForm.reset();
    editingId = null;

    formHeading.textContent = 'Register New Patient';
    submitButton.textContent = 'Register Patient';
    cancelEdit.hidden = true;
}

cancelEdit.addEventListener('click', resetForm);

// View individual patient
function viewPatient(patient) {
    patientDetails.innerHTML = '';

    const details = [
        ['Patient ID', patient.patient_id],
        ['Name', patient.patient_name],
        ['Age', patient.age],
        ['Gender', patient.gender],
        ['Phone', patient.phone],
        ['Address', patient.address],
        ['Blood Group', patient.blood_group],
        ['Reason for Visit', patient.disease],
        ['Registration Date', patient.registration_date]
    ];

    details.forEach(([label, value]) => {
        const paragraph = document.createElement('p');
        const strong = document.createElement('strong');

        strong.textContent = label + ': ';
        paragraph.append(strong, document.createTextNode(value ?? 'Not available'));
        patientDetails.appendChild(paragraph);
    });

    patientDialog.showModal();
}

closeDialog.addEventListener('click', () => {
    patientDialog.close();
});

// Delete patient
async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient record?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || 'Delete failed');
        }

        alert(result.message);
        await loadPatients();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// Search patients
searchInput.addEventListener('input', displayPatients);

// Update dashboard
function updateDashboard() {
    document.getElementById('totalPatients').textContent = patients.length;

    const today = new Date().toLocaleDateString();

    const todayCount = patients.filter(patient => {
        if (!patient.registration_date) {
            return false;
        }

        return new Date(patient.registration_date).toLocaleDateString() === today;
    }).length;

    document.getElementById('todayPatients').textContent = todayCount;
}

// Start application
loadPatients();
