const spruchAnzeige = document.getElementById('spruch-anzeige');
const randomSpruchBtn = document.getElementById('random-spruch-btn');
const neuesSpruchForm = document.getElementById('neuer-spruch-form');
const spruchInput = document.getElementById('spruch-input');
const autorInput = document.getElementById('autor-input');
const spruchListe = document.getElementById('spruch-liste');
const zeichenCounter = document.getElementById('zeichen-counter');
const suchfeld = document.getElementById('suchfeld');
const suchBtn = document.getElementById('such-btn');

// Zeichenzähler
spruchInput.addEventListener('input', () => {
  zeichenCounter.textContent = `Zeichen: ${spruchInput.value.length}`;
});

// Sprüche vom Server holen
async function fetchSprueche() {
  const res = await fetch('/api/sprueche');
  return await res.json();
}

// Sprüche anzeigen
async function renderSprueche() {
  try {
    const sprueche = await fetchSprueche();
    spruchListe.innerHTML = '';

    sprueche.forEach((spruch) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <p class="mb-1">"${spruch.text}"</p>
        <small class="text-muted fst-italic">- ${spruch.autor}</small>
        <div class="mt-2">
          <button class="btn btn-sm btn-info bearbeiten-btn" data-id="${spruch.id}">✏️ Bearbeiten</button>
          <button class="btn btn-sm btn-danger loeschen-btn" data-id="${spruch.id}">🗑️ Löschen</button>
        </div>
      `;

      li.querySelector('.loeschen-btn').addEventListener('click', async () => {
        await fetch(`/api/sprueche/${spruch.id}`, { method: 'DELETE' });
        renderSprueche();
      });

      li.querySelector('.bearbeiten-btn').addEventListener('click', async () => {
        const neuerText = prompt('Neuer Spruchtext:', spruch.text);
        if (neuerText === null) return;

        const neuerAutor = prompt('Neuer Autor:', spruch.autor);
        if (neuerAutor === null) return;

        await fetch(`/api/sprueche/${spruch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: neuerText, autor: neuerAutor })
        });
        renderSprueche();
      });

      spruchListe.appendChild(li);
    });
  } catch (error) {
    console.error('Fehler beim Laden der Sprüche:', error);
    spruchListe.innerHTML = '<li class="list-group-item text-danger">Fehler beim Laden der Sprüche.</li>';
  }
}

// Spruch hinzufügen
neuesSpruchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await fetch('/api/sprueche', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: spruchInput.value,
        autor: autorInput.value
      })
    });
    neuesSpruchForm.reset();
    zeichenCounter.textContent = 'Zeichen: 0';
    renderSprueche();
  } catch {
    alert('Fehler beim Hinzufügen des Spruchs.');
  }
});

// Zufallsspruch anzeigen
randomSpruchBtn.addEventListener('click', async () => {
  try {
    const sprueche = await fetchSprueche();
    const zufallsSpruch = sprueche[Math.floor(Math.random() * sprueche.length)];
    spruchAnzeige.innerHTML = `
      <p>"${zufallsSpruch.text}"</p>
      <footer class="blockquote-footer">${zufallsSpruch.autor}</footer>
    `;
  } catch {
    spruchAnzeige.textContent = 'Fehler beim Laden des Zufallsspruchs.';
  }
});

// Suche
suchBtn.addEventListener('click', async () => {
  const query = suchfeld.value.trim();
  if (!query) {
    renderSprueche();
    return;
  }

  try {
    const res = await fetch(`/api/sprueche/search?q=${encodeURIComponent(query)}`);
    const suchErgebnisse = await res.json();

    spruchListe.innerHTML = '';
    suchErgebnisse.forEach((spruch) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `
        <p class="mb-1">"${spruch.text}"</p>
        <small class="text-muted fst-italic">- ${spruch.autor}</small>
      `;
      spruchListe.appendChild(li);
    });
  } catch {
    spruchListe.innerHTML = '<li class="list-group-item text-danger">Fehler bei der Suche.</li>';
  }
});

// App starten
renderSprueche();