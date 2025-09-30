const params = new URLSearchParams(window.location.search);
const noteKey = params.get('note') || 'defaultNote';

const noteTitle = document.getElementById('noteTitle');
const noteText = document.getElementById('noteText');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesContainer = document.getElementById('notesContainer');
const printAllBtn = document.getElementById('printAllBtn');

noteTitle.textContent = `Shënime: ${noteKey}`;

// --- Merr të gjitha shënimet nga localStorage ---
function getNotes() {
    const saved = JSON.parse(localStorage.getItem(noteKey));
    return saved ? saved : [];
}

// --- Ruaj të gjitha shënimet ---
function saveNotes(notes) {
    localStorage.setItem(noteKey, JSON.stringify(notes));
    renderNotes();
}

// --- Shfaq shënimet ---
function renderNotes() {
    notesContainer.innerHTML = '';
    const notes = getNotes();
    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = "bg-gray-100 p-6 rounded-xl shadow-md relative text-lg sm:text-xl";
        noteDiv.innerHTML = `
            <p class="text-gray-800 whitespace-pre-wrap">${note.text}</p>
            <p class="text-gray-500 text-sm mt-2">Ruajtur më: ${note.date}</p>
            <div class="absolute top-3 right-3 flex space-x-2">
                <button class="editBtn bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm sm:text-base md:text-lg">Edit</button>
                <button class="deleteBtn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm sm:text-base md:text-lg">Fshi</button>
                <button class="printBtn bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm sm:text-base md:text-lg">Printo</button>
            </div>
        `;
        notesContainer.appendChild(noteDiv);

        // --- Edit ---
        noteDiv.querySelector('.editBtn').addEventListener('click', () => {
            const newText = prompt('Ndrysho shënimin:', note.text);
            if (newText !== null) {
                note.text = newText.trim();
                note.date = new Date().toLocaleString();
                saveNotes(notes);
            }
        });

        // --- Delete ---
        noteDiv.querySelector('.deleteBtn').addEventListener('click', () => {
            if (confirm('Doni të fshini këtë shënim?')) {
                const updatedNotes = notes.filter(n => n.id !== note.id);
                saveNotes(updatedNotes);
            }
        });

        // --- Print individual ---
        noteDiv.querySelector('.printBtn').addEventListener('click', () => {
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Shënim</title>');
            printWindow.document.write('<style>body{font-family:sans-serif;padding:20px;} p{font-size:18px;} .date{color:gray;font-size:14px;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(`<p>${note.text}</p>`);
            printWindow.document.write(`<p class="date">Ruajtur më: ${note.date}</p>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        });
    });
}

// --- Shto shënim i ri ---
addNoteBtn.addEventListener('click', () => {
    const text = noteText.value.trim();
    if (!text) return;
    const notes = getNotes();
    const newNote = {
        id: Date.now(),
        text,
        date: new Date().toLocaleString()
    };
    notes.push(newNote);
    saveNotes(notes);
    noteText.value = '';
});

// --- Printo të gjitha shënimet ---
printAllBtn.addEventListener('click', () => {
    const notes = getNotes();
    if (notes.length === 0) {
        alert("Nuk ka shënime për të printuar.");
        return;
    }
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Të gjitha shënimet</title>');
    printWindow.document.write('<style>body{font-family:sans-serif;padding:20px;} .note{border:1px solid #ccc;padding:10px;margin-bottom:10px;border-radius:8px;} .date{color:gray;font-size:0.9em;} p{font-size:18px;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h1>Shënime: ${noteKey}</h1>`);
    notes.forEach(note => {
        printWindow.document.write(`<div class="note"><p>${note.text}</p><p class="date">Ruajtur më: ${note.date}</p></div>`);
    });
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
});

// --- Ngarko shënimet kur hapet faqja ---
document.addEventListener('DOMContentLoaded', renderNotes);
