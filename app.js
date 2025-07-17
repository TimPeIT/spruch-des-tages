const spruchAnzeige = document.getElementById('spruch-anzeige');
const randomSpruchBtn = document.getElementById('random-spruch-btn');
const neuesSpruchForm = document.getElementById('neuer-spruch-form');
const spruchInput = document.getElementById('spruch-input');
const autorInput = document.getElementById('autor-input');
const spruchListe = document.getElementById('spruch-liste');
const zeichenCounter = document.getElementById('zeichen-counter');

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
  const sprueche = await fetchSprueche();
  spruchListe.innerHTML = '';

  sprueche.forEach(spruch => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <p class="mb-1">"${spruch.text}"</p>
      <small class="text-muted fst-italic">- ${spruch.autor}</small>
      <button class="loeschen-btn" data-id="${spruch.id}">&times;</button>
    `;
    li.querySelector('.loeschen-btn').addEventListener('click', async () => {
      await fetch(`/api/sprueche/${spruch.id}`, { method: 'DELETE' });
      renderSprueche();
    });
    spruchListe.appendChild(li);
  });
}

// Spruch hinzufügen
neuesSpruchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
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
});

// Zufallsspruch
randomSpruchBtn.addEventListener('click', async () => {
  const sprueche = await fetchSprueche();
  const zufallsSpruch = sprueche[Math.floor(Math.random() * sprueche.length)];
  spruchAnzeige.innerHTML = `
    <p>"${zufallsSpruch.text}"</p>
    <footer class="blockquote-footer">${zufallsSpruch.autor}</footer>
  `;
});

// Start
renderSprueche();
