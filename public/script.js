// script.js

// === Faqja e parë: Search dhe butona ===
const searchInput = document.getElementById("searchInput");
const tbody = document.querySelector("#resultsTable tbody");

// Funksion për të rregulluar karakteret shqipe
function fixChars(str) {
    if (!str) return '';
    return str
        .replace(/�/g, 'ë')
        .replace(/�/g, 'ç');
}

// Funksioni për live search dhe ngarkim të dhënash
async function search(query = '') {
    if (!tbody) return; 

    try {
        const res = await fetch(`/search?q=${encodeURIComponent(query.trim().toLowerCase())}`);
        const data = await res.json();

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7;
            td.innerHTML = `
                <div class="bg-red-100 text-red-700 font-bold text-lg uppercase py-4 px-6 rounded-lg text-center">
                    Punëtori që kërkuat nuk ekziston
                </div>
            `;
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        const fields = ['NrP','NrTel','Emri','Mbiemri','IDDep','Departamenti','VendiPunës'];

        data.forEach(emp => {
            const tr = document.createElement('tr');
            tr.classList.add('hover:bg-gray-100', 'transition', 'duration-200', 'cursor-pointer', 'shadow-sm', 'rounded-lg');

            // Klikim për detaje
            tr.addEventListener('click', () => {
                goToDetails('NrP', emp.NrP);
            });

            fields.forEach(f => {
                const td = document.createElement('td');
                td.textContent = fixChars(emp[f]) || '';
                td.classList.add('py-3', 'px-4', 'text-gray-700', 'font-medium');
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Gabim gjatë kërkimit:", err);
    }
}

// Live search
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        search(e.target.value);
    });

    window.addEventListener('DOMContentLoaded', () => {
        search();
    });
}

// Funksioni për të kaluar në faqen e detajeve
function goToDetails(field, value) {
    window.location.href = `details.html?field=${encodeURIComponent(field)}&q=${encodeURIComponent(value)}`;
}

// === Faqja e dytë: Detajet e punëtorit ===
function loadDetails() {
    const cardDiv = document.getElementById('employeeCard');
    if (!cardDiv) return;

    const params = new URLSearchParams(window.location.search);
    const field = params.get('field');
    const q = params.get('q');

    if (!field || !q) return;

    fetch(`/search?q=${encodeURIComponent(q.toLowerCase())}`)
        .then(res => res.json())
        .then(data => {
            cardDiv.innerHTML = '';

            // Filtrimi i të gjithë punëtorëve që përputhen
            const filtered = data ? data.filter(e => String(e[field]).toLowerCase() === q.toLowerCase()) : [];

            if (!data || data.length === 0 || filtered.length === 0) {
                cardDiv.innerHTML = `
                    <div class="bg-red-100 text-red-700 font-bold text-xl uppercase py-6 px-8 rounded-xl text-center mt-8">
                        Punëtori që kërkuat nuk ekziston
                    </div>
                `;
                return;
            }

            // Krijojmë një grid për cards
            const gridDiv = document.createElement('div');
gridDiv.className = "grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1";

            filtered.forEach(emp => {
                const div = document.createElement('div');
                div.className = "bg-white p-6 rounded-3xl shadow-2xl space-y-5 font-sans";

                div.innerHTML = `
                    <div class="flex justify-center">
                        <img src="images/kek.png" alt="Foto Punëtori" class="w-24 h-24 rounded-full object-cover border-4 border-gray-200">
                    </div>
                    <h2 class="text-3xl sm:text-4xl font-extrabold mb-2 text-center text-gray-900">${fixChars(emp.Emri)} ${fixChars(emp.Mbiemri)}</h2>
                    <p class="text-lg sm:text-xl flex items-center gap-2">
                        <img src="images/flag.webp" class="w-5 h-5" alt="Flag Icon">
                        <span class="font-semibold">NrTel:</span> <a href="tel:${emp.NrTel}" class="text-blue-500 hover:underline">${emp.NrTel}</a>
                    </p>
                    <p class="text-lg sm:text-xl"><span class="font-semibold">Nr.P:</span> ${fixChars(emp.NrP)}</p>
                    <p class="text-lg sm:text-xl"><span class="font-semibold">IDDep:</span> ${fixChars(emp.IDDep)}</p>
                    <p class="text-lg sm:text-xl"><span class="font-semibold">Departamenti:</span> ${fixChars(emp.Departamenti)}</p>
                    <p class="text-lg sm:text-xl"><span class="font-semibold">VendiPunës:</span> ${fixChars(emp.VendiPunës)}</p>
                `;

                gridDiv.appendChild(div);
            });

            cardDiv.appendChild(gridDiv);

            // Shto butonin Kthehu mbrapa në fund
            const backBtn = document.createElement('button');
            backBtn.textContent = "Kthehu mbrapa";
            backBtn.className = "mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl w-full max-w-xl mx-auto block";
            backBtn.onclick = () => window.history.back();
            cardDiv.appendChild(backBtn);
        })
        .catch(err => console.error("Gabim gjatë kërkimit:", err));
}

// Ngarko detajet në faqen e dytë
if (document.getElementById('employeeCard')) {
    window.addEventListener('DOMContentLoaded', loadDetails);
}