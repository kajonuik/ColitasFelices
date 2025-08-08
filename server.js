// server.js
const express = require('express');
const path = require('path');
const fs = require('fs'); // Módulo para leer archivos del sistema

const app = express();
const port = 3000;

// Cargar los datos de los albergues
const shelters = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para obtener todos los albergues (usada por la landing page)
app.get('/api/albergues', (req, res) => {
    res.json(shelters);
});

// NUEVA RUTA: Ruta para la página de detalle de un albergue específico
app.get('/albergues/:id', (req, res) => {
    const shelterId = req.params.id;
    const shelter = shelters.find(s => s.id === shelterId);

    if (!shelter) {
        return res.status(404).send('Albergue no encontrado');
    }

    // --- Generación dinámica del HTML de la página de detalle ---
    const socialLinksHtml = shelter.contacto.redesSociales.map(url => `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-teal-600 hover:text-teal-800 transition-colors duration-200">
            ${url.includes('facebook') ? '<i class="fab fa-facebook-f mr-1"></i>Facebook' : url.includes('instagram') ? '<i class="fab fa-instagram mr-1"></i>Instagram' : url.includes('twitter') ? '<i class="fab fa-twitter mr-1"></i>Twitter' : '<i class="fas fa-link mr-1"></i>Red Social'}
        </a>
    `).join(' ');

    const urgentNeedsHtml = shelter.necesidadesUrgentes.map(need => `
        <li class="flex items-start text-gray-700">
            <svg class="w-5 h-5 text-teal-500 mr-2 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span>${need}</span>
        </li>
    `).join('');

    const animalsForAdoptionHtml = shelter.animalesParaAdopcion.map(animal => `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4">
            <img src="${animal.fotoURL}" alt="Foto de ${animal.nombre}" class="w-full sm:w-40 h-40 object-cover rounded-md flex-shrink-0 border border-blue-300 shadow">
            <div class="flex-grow">
                <h4 class="text-lg font-bold text-blue-800">${animal.nombre}</h4>
                <p class="text-sm text-gray-600 font-medium">${animal.especie} - ${animal.raza}</p>
                <p class="text-gray-700 mt-2">${animal.descripcion}</p>
                <button data-animal-id="${animal.id}" data-shelter-id="${shelter.id}" class="share-button mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-semibold shadow-md">
                    Compartir Caso
                </button>
            </div>
        </div>
    `).join('') || '<p class="text-gray-600">No hay animales para difusión en este momento en este albergue.</p>';


    const detailPageHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${shelter.nombre} - Colitas Felices</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-100 text-gray-800">

<header class="bg-gradient-to-r from-teal-600 to-blue-700 text-white shadow-lg py-6">
    <div class="container mx-auto px-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
            <h1 class="text-4xl font-extrabold text-center sm:text-left">
                <a href="/" class="text-white hover:text-gray-100 transition-colors">Colitas Felices</a>
            </h1>
            <nav class="mt-4 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-4">
                <a href="/" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Directorio</a>
                <a href="/contacto.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Contacto</a>
                <a href="/nosotros.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Nosotros</a>
            </nav>
        </div>
        <p class="text-lg opacity-90 text-center sm:text-left">Hogares donde empiezan nuevas vidas.</p>
    </div>
</header>

    <main class="container mx-auto px-6 py-8 bg-white shadow-lg rounded-lg">
        <div class="mb-8 pb-4 border-b border-gray-200">
            <h2 class="text-4xl font-bold text-gray-900 mb-2">${shelter.nombre} ${shelter.verificado ? '<span class="text-base font-medium text-green-600 bg-green-100 rounded-full px-3 py-1 ml-3 align-middle shadow-sm">Verificado</span>' : '<span class="text-base font-medium text-yellow-600 bg-yellow-100 rounded-full px-3 py-1 ml-3 align-middle shadow-sm">No Verificado</span>'}</h2>
            <p class="text-gray-600 text-lg">${shelter.ubicacion}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-2">
                <section class="mb-8">
                    <h3 class="text-2xl font-semibold text-teal-700 mb-4 border-b-2 border-teal-200 pb-2">Nuestra Misión</h3>
                    <p class="text-gray-700 leading-relaxed">${shelter.mision}</p>
                </section>

                <section class="mb-8">
                    <h3 class="text-2xl font-semibold text-teal-700 mb-4 border-b-2 border-teal-200 pb-2">Necesidades Urgentes</h3>
                    <ul class="space-y-3 list-none p-0">
                        ${urgentNeedsHtml}
                    </ul>
                </section>

                <section>
                    <h3 class="text-2xl font-semibold text-teal-700 mb-4 border-b-2 border-teal-200 pb-2">Animales para Adopción y Difusión</h3>
                    <div class="space-y-6">
                        ${animalsForAdoptionHtml}
                    </div>
                </section>
            </div>

            <aside class="md:col-span-1 bg-blue-50 p-6 rounded-lg shadow-inner border border-blue-200">
                <h3 class="text-2xl font-semibold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">Contacto</h3>
                <p class="text-gray-700 mb-3"><strong>Email:</strong> <a href="mailto:${shelter.contacto.email}" class="text-teal-600 hover:text-teal-800 break-words">${shelter.contacto.email}</a></p>
                <p class="text-gray-700 mb-3"><strong>Teléfono:</strong> ${shelter.contacto.telefono}</p>
                <p class="text-gray-700 mb-4"><strong>Redes Sociales:</strong></p>
                <div class="flex flex-col space-y-2">
                    ${socialLinksHtml}
                </div>
            </aside>
        </div>
    </main>

    <div id="copy-notification" class="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg opacity-0 transition-opacity duration-300">
        ¡Texto copiado al portapapeles!
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const copyNotification = document.getElementById('copy-notification');

            async function handleShare(animalId, shelterId) {
                // Fetch the data again to ensure it's fresh (or pass it from server)
                // For this MVP, refetching is simpler than passing complex JSON in template
                const response = await fetch('/api/albergues');
                const sheltersData = await response.json();
                const shelter = sheltersData.find(s => s.id === shelterId);
                const animal = shelter ? shelter.animalesParaAdopcion.find(a => a.id === animalId) : null;

                if (!animal) return;

                const shareText = \`¡AYUDA A ENCONTRAR UN HOGAR! 🙏\\n\\n🐶 Nombre: \${animal.nombre}\\n📍 Albergue: \${shelter.nombre}\\n📝 Descripción: \${animal.descripcion}\\n\\n¡Comparte para ayudar a \${animal.nombre} a encontrar su familia para siempre! Contacta a \${shelter.nombre} para más información. #AdoptaNoCompres #RescateAnimal\`;

                try {
                    await navigator.clipboard.writeText(shareText);
                    showCopyNotification();
                } catch (err) {
                    console.error('Fallback: could not copy text: ', err);
                    const textArea = document.createElement("textarea");
                    textArea.value = shareText;
                    textArea.style.position = "fixed";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showCopyNotification();
                    } catch (err) {
                        console.error('Fallback: Oops, unable to copy', err);
                        alert('No se pudo copiar el texto. Por favor, cópialo manualmente.');
                    }
                    document.body.removeChild(textArea);
                }
            }

            function showCopyNotification() {
                copyNotification.classList.remove('opacity-0');
                setTimeout(() => {
                    copyNotification.classList.add('opacity-0');
                }, 2000);
            }

            // Event delegation for share buttons
            document.addEventListener('click', (e) => {
                const shareButton = e.target.closest('.share-button');
                if (shareButton) {
                    const { animalId, shelterId } = shareButton.dataset;
                    handleShare(animalId, shelterId);
                }
            });
        });
    </script>
</body>
</html>
    `;

    res.send(detailPageHtml);
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor MVP escuchando en http://localhost:3000`);
});