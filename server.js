const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Leer los datos de albergues y veterinarias de archivos separados
const shelters = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
const veterinarias = JSON.parse(fs.readFileSync(path.join(__dirname, 'veterinarias.json'), 'utf8'));

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para listar las veterinarias
app.get('/api/veterinarias', (req, res) => {
    res.json(veterinarias);
});

// Endpoint para todos los animales
app.get('/api/animales', (req, res) => {
    const allAnimals = shelters.flatMap(shelter =>
        shelter.animalesParaAdopcion.map(animal => ({
            ...animal,
            albergue: {
                id: shelter.id,
                nombre: shelter.nombre,
                ubicacion: shelter.ubicacion
            }
        }))
    );
    res.json(allAnimals);
});

// Ruta para la página de detalle de un albergue
app.get('/albergues/:id', (req, res) => {
    const shelterId = req.params.id;
    const shelter = shelters.find(s => s.id === shelterId);

    if (!shelter) {
        return res.status(404).send('Albergue no encontrado');
    }

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
        <a href="/albergues/${shelter.id}/animales/${animal.id}" class="block bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4 hover:shadow-lg transition-shadow duration-300">
            <img src="${animal.fotoURL}" alt="Foto de ${animal.nombre}" class="w-full sm:w-40 h-40 object-cover rounded-md flex-shrink-0 border border-blue-300 shadow">
            <div class="flex-grow">
                <h4 class="text-xl font-bold text-blue-800">${animal.nombre}</h4>
                <p class="text-sm text-gray-600 font-medium mt-1">
                    <span class="bg-gray-200 text-gray-700 rounded-full px-2 py-1">${animal.especie}</span>
                    <span class="bg-gray-200 text-gray-700 rounded-full px-2 py-1">${animal.raza}</span>
                    <span class="bg-gray-200 text-gray-700 rounded-full px-2 py-1">${animal.edad}</span>
                </p>
                <p class="text-gray-700 mt-2">${animal.historia.slice(0, 100)}...</p>
                <span class="inline-block mt-4 text-teal-600 hover:text-teal-800 font-semibold transition-colors">Ver más detalles &rarr;</span>
            </div>
        </a>
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
                <a href="/" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors bg-teal-700 bg-opacity-70">Directorio</a>
                <a href="/veterinarias.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Veterinarias</a>
                <a href="/donaciones.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Donaciones</a>
                <a href="/contacto.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Contacto</a>
                <a href="/nosotros.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Nosotros</a>
            </nav>
        </div>
        <p class="text-lg opacity-90 text-center sm:text-left">Hogares donde empiezan nuevas vidas.</p>
    </div>
</header>

    <div class="container mx-auto px-6 mt-6">
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
            <p class="font-bold">Espacio Publicitario</p>
            <p class="text-sm">Aquí irían los anuncios de nuestros socios para ayudarnos a mantener la plataforma y apoyar a los albergues.</p>
        </div>
    </div>

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
                    <h3 class="text-2xl font-semibold text-teal-700 mb-4 border-b-2 border-teal-200 pb-2">Animales para Adopción</h3>
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

    <footer class="bg-gray-800 text-white text-center p-4 mt-8 flex flex-col sm:flex-row justify-center sm:justify-between items-center px-6">
        <p class="mb-2 sm:mb-0">&copy; 2025 Colitas Felices. Todos los derechos reservados.</p>
        <nav class="flex space-x-4">
            <a href="/comoFuncionamos.html" class="text-gray-300 hover:text-white transition-colors">Cómo Funcionamos</a>
        </nav>
    </footer>

</body>
</html>
    `;

    res.send(detailPageHtml);
});

// Ruta para la página de detalle de una mascota
app.get('/albergues/:shelterId/animales/:animalId', (req, res) => {
    const { shelterId, animalId } = req.params;
    const shelter = shelters.find(s => s.id === shelterId);
    const animal = shelter ? shelter.animalesParaAdopcion.find(a => a.id === animalId) : null;

    if (!shelter || !animal) {
        return res.status(404).send('Mascota no encontrada');
    }

    const animalDetailPageHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${animal.nombre} - ${shelter.nombre}</title>
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
                <a href="/" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors bg-teal-700 bg-opacity-70">Directorio</a>
                <a href="/veterinarias.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Veterinarias</a>
                <a href="/donaciones.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Donaciones</a>
                <a href="/contacto.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Contacto</a>
                <a href="/nosotros.html" class="text-white hover:text-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition-colors">Nosotros</a>
            </nav>
        </div>
        <p class="text-lg opacity-90 text-center sm:text-left">Hogares donde empiezan nuevas vidas.</p>
    </div>
</header>

    <div class="container mx-auto px-6 mt-6">
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
            <p class="font-bold">Espacio Publicitario</p>
            <p class="text-sm">Aquí irían los anuncios de nuestros socios para ayudarnos a mantener la plataforma y apoyar a los albergues.</p>
        </div>
    </div>

    <main class="container mx-auto px-6 py-8 bg-white shadow-lg rounded-lg">
        <div class="mb-6">
            <a href="/albergues/${shelter.id}" class="text-blue-600 hover:text-blue-800 transition-colors flex items-center mb-4">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Volver a ${shelter.nombre}
            </a>
            <h2 class="text-4xl font-bold text-gray-900 mb-2">${animal.nombre}</h2>
            <p class="text-gray-600 text-lg">En adopción en ${shelter.nombre}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <img src="${animal.fotoURL}" alt="Foto de ${animal.nombre}" class="w-full h-auto object-cover rounded-lg shadow-md border border-gray-200">
            </div>
            <div class="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                <h3 class="text-2xl font-semibold text-teal-700 mb-4 border-b-2 border-teal-200 pb-2">Datos de la Mascota</h3>
                <ul class="space-y-3">
                    <li class="flex items-center"><i class="fas fa-paw text-blue-500 mr-3"></i><strong>Especie:</strong> ${animal.especie}</li>
                    <li class="flex items-center"><i class="fas fa-tag text-blue-500 mr-3"></i><strong>Raza:</strong> ${animal.raza}</li>
                    <li class="flex items-center"><i class="fas fa-birthday-cake text-blue-500 mr-3"></i><strong>Edad:</strong> ${animal.edad}</li>
                    <li class="flex items-center"><i class="fas fa-ruler-combined text-blue-500 mr-3"></i><strong>Tamaño:</strong> ${animal.tamano}</li>
                    <li class="flex items-center"><i class="fas fa-paint-brush text-blue-500 mr-3"></i><strong>Color:</strong> ${animal.color}</li>
                    <li class="flex items-center"><i class="fas fa-venus-mars text-blue-500 mr-3"></i><strong>Sexo:</strong> ${animal.sexo}</li>
                    <li class="flex items-center"><i class="fas fa-id-card text-blue-500 mr-3"></i><strong>Microchip:</strong> ${animal.microchip}</li>
                    <li class="flex items-center"><i class="fas fa-heartbeat text-blue-500 mr-3"></i><strong>Estado de Salud:</strong> ${animal.estadoSalud}</li>
                    <li class="flex items-center"><i class="fas fa-syringe text-blue-500 mr-3"></i><strong>Vacunas/Operaciones:</strong> ${animal.vacunasOperaciones}</li>
                </ul>

                <div class="mt-6">
                    <h4 class="text-xl font-semibold text-teal-700 mb-2">Su Historia</h4>
                    <p class="text-gray-700 leading-relaxed">${animal.historia}</p>
                </div>

                <div class="mt-6 p-4 bg-blue-100 rounded-lg">
                    <h4 class="text-xl font-semibold text-blue-800 mb-2">Situación Actual</h4>
                    <p class="text-blue-900 leading-relaxed font-medium">${animal.situacion}</p>
                </div>
            </div>
        </div>

        <section class="mt-12 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
            <h3 class="text-3xl font-bold text-gray-900 mb-4 text-center">¡Interesado en Adoptar! 🐾</h3>
            <p class="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
                Si deseas conocer a ${animal.nombre} o iniciar el proceso de adopción, llena este formulario. Tu mensaje será enviado directamente a ${shelter.nombre}, quienes se pondrán en contacto contigo.
            </p>
            <form id="contact-form" class="space-y-6 max-w-lg mx-auto">
                <div>
                    <label for="nombre" class="block text-sm font-medium text-gray-700">Tu Nombre</label>
                    <input type="text" id="nombre" name="nombre" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500" required>
                </div>
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Tu Email</label>
                    <input type="email" id="email" name="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500" required>
                </div>
                <div>
                    <label for="mensaje" class="block text-sm font-medium text-gray-700">Tu Mensaje</label>
                    <textarea id="mensaje" name="mensaje" rows="4" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500" required>Hola, estoy interesado/a en adoptar a ${animal.nombre}. Me gustaría conocer más sobre él/ella. Gracias.</textarea>
                </div>
                <div id="form-notification" class="hidden p-4 text-sm rounded-lg" role="alert"></div>
                <button type="submit" class="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-300 flex items-center justify-center">
                    <i class="fas fa-paper-plane mr-2"></i> Enviar Mensaje a ${shelter.nombre}
                </button>
            </form>
        </section>

        <div class="mt-8 text-center">
            <button data-animal-id="${animal.id}" data-shelter-id="${shelter.id}" class="share-button inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-md">
                <i class="fas fa-share-alt mr-2"></i> Compartir Caso
            </button>
        </div>
    </main>
    
    <div id="copy-notification" class="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg opacity-0 transition-opacity duration-300">
        ¡Texto copiado al portapapeles!
    </div>

    <footer class="bg-gray-800 text-white text-center p-4 mt-8 flex flex-col sm:flex-row justify-center sm:justify-between items-center px-6">
        <p class="mb-2 sm:mb-0">&copy; 2025 Colitas Felices. Todos los derechos reservados.</p>
        <nav class="flex space-x-4">
            <a href="/comoFuncionamos.html" class="text-gray-300 hover:text-white transition-colors">Cómo Funcionamos</a>
        </nav>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Lógica para el formulario de contacto
            const contactForm = document.getElementById('contact-form');
            const formNotification = document.getElementById('form-notification');
            const animalName = "${animal.nombre}";
            const shelterName = "${shelter.nombre}";
            
            contactForm.addEventListener('submit', function(event) {
                event.preventDefault();

                // Simulación de envío exitoso
                formNotification.classList.remove('hidden');
                formNotification.classList.remove('bg-red-100', 'text-red-700');
                formNotification.classList.add('bg-green-100', 'text-green-700');
                formNotification.innerHTML = '<p class="font-bold">¡Mensaje Enviado!</p><p>Gracias por tu interés en ' + animalName + '. ' + shelterName + ' se pondrá en contacto contigo pronto.</p>';
                contactForm.reset();

                setTimeout(() => {
                    formNotification.classList.add('hidden');
                }, 5000);
            });

            // Lógica para el botón de compartir
            const copyNotification = document.getElementById('copy-notification');

            async function handleShare(animalId, shelterId) {
                const shareText = \`¡AYUDA A ENCONTRAR UN HOGAR! 🙏\\n\\n🐶 Nombre: ${animal.nombre}\\n📍 Albergue: ${shelter.nombre}\\n📝 Historia: ${animal.historia}\\n\\n¡Comparte para ayudar a ${animal.nombre} a encontrar su familia para siempre! Contacta a ${shelter.nombre} para más información.\\n\\n#AdoptaNoCompres #RescateAnimal #ColitasFelices\`;

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

    res.send(animalDetailPageHtml);
});


app.get('/api/albergues', (req, res) => {
    res.json(shelters);
});

// NUEVA RUTA: Sirve la página de veterinarias
app.get('/veterinarias.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'veterinarias.html'));
});


// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor MVP escuchando en http://localhost:${port}`);
});