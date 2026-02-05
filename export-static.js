#!/usr/bin/env node

/**
 * Statischer HTML-Generator für EduFunds
 * Workaround für NPM/Build-Probleme
 */

const fs = require('fs');
const path = require('path');

// Lade Daten
const programme = JSON.parse(fs.readFileSync('./data/foerderprogramme.json', 'utf8'));

// HTML Template
const template = (title, content) => `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | EduFunds</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #0f172a; color: #f8fafc; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .gradient-text { background: linear-gradient(to right, #f97316, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body class="min-h-screen">
    <nav class="glass fixed w-full z-50 top-0">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="index.html" class="text-2xl font-bold gradient-text">EduFunds</a>
            <div class="flex gap-6">
                <a href="index.html" class="text-slate-300 hover:text-orange-400">Start</a>
                <a href="programme.html" class="text-slate-300 hover:text-orange-400">Förderfinder</a>
            </div>
        </div>
    </nav>
    
    <main class="pt-24 pb-12">
        <div class="container mx-auto px-4">
            ${content}
        </div>
    </main>
    
    <footer class="border-t border-slate-800 py-8 mt-12">
        <div class="container mx-auto px-4 text-center text-slate-500 text-sm">
            © 2025 EduFunds | 
            <a href="impressum.html" class="hover:text-orange-400">Impressum</a> | 
            <a href="datenschutz.html" class="hover:text-orange-400">Datenschutz</a>
        </div>
    </footer>
</body>
</html>`;

// Generate Index Page
const indexContent = `
    <div class="text-center py-20">
        <h1 class="text-5xl font-bold mb-6">Fördermittel für Schulen</h1>
        <p class="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Finden und beantragen Sie Förderungen – unterstützt durch KI.
        </p>
        <a href="programme.html" class="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-white">
            Förderfinder öffnen
        </a>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-orange-400">${programme.length}</div>
            <div class="text-sm text-slate-500">Programme</div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-cyan-400">${programme.filter(p => p.foerdergeberTyp === 'bund').length}</div>
            <div class="text-sm text-slate-500">Bund</div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-purple-400">${programme.filter(p => p.foerdergeberTyp === 'land').length}</div>
            <div class="text-sm text-slate-500">Länder</div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-green-400">${programme.filter(p => p.foerdergeberTyp === 'stiftung').length}</div>
            <div class="text-sm text-slate-500">Stiftungen</div>
        </div>
        <div class="glass rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-blue-400">${programme.filter(p => p.foerdergeberTyp === 'eu').length}</div>
            <div class="text-sm text-slate-500">EU</div>
        </div>
    </div>
`;

// Generate Programme List Page
const programmeContent = `
    <h1 class="text-3xl font-bold mb-8">Förderprogramme</h1>
    
    <div class="grid gap-4">
        ${programme.map(p => `
        <article class="glass rounded-xl p-6">
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-${p.foerdergeberTyp === 'bund' ? 'cyan' : p.foerdergeberTyp === 'land' ? 'purple' : p.foerdergeberTyp === 'stiftung' ? 'green' : 'blue'}-500/20 text-${p.foerdergeberTyp === 'bund' ? 'cyan' : p.foerdergeberTyp === 'land' ? 'purple' : p.foerdergeberTyp === 'stiftung' ? 'green' : 'blue'}-400">
                    ${p.foerdergeberTyp.toUpperCase()}
                </span>
                ${p.kiAntragGeeignet ? '<span class="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">KI-geeignet</span>' : ''}
            </div>
            <h2 class="text-xl font-bold mb-2">${p.name}</h2>
            <p class="text-slate-400 text-sm mb-3">${p.foerdergeber}</p>
            <p class="text-slate-300 mb-4">${p.kurzbeschreibung}</p>
            <div class="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                <span>💰 ${p.foerdersummeText}</span>
                <span>📅 ${p.bewerbungsfristText}</span>
            </div>
            <div class="flex gap-2">
                ${p.kategorien.slice(0, 4).map(k => `<span class="px-2 py-1 rounded text-xs bg-slate-800 text-slate-400">${k}</span>`).join('')}
            </div>
            <a href="${p.infoLink}" target="_blank" class="inline-block mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm">
                Details →
            </a>
        </article>
        `).join('')}
    </div>
`;

// Generate Impressum
const impressumContent = `
    <h1 class="text-3xl font-bold mb-8">Impressum</h1>
    <div class="glass rounded-xl p-8">
        <h2 class="text-xl font-bold mb-4">Angaben gemäß § 5 TMG</h2>
        <p class="mb-4">EduFunds<br>Musterstraße 123<br>12345 Musterstadt</p>
        <h2 class="text-xl font-bold mb-4">Kontakt</h2>
        <p>E-Mail: info@edufunds.de</p>
    </div>
`;

// Generate Datenschutz
const datenschutzContent = `
    <h1 class="text-3xl font-bold mb-8">Datenschutzerklärung</h1>
    <div class="glass rounded-xl p-8 space-y-4">
        <h2 class="text-xl font-bold">1. Datenschutz auf einen Blick</h2>
        <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst.</p>
        <h2 class="text-xl font-bold">2. Verantwortlicher</h2>
        <p>EduFunds, Musterstraße 123, 12345 Musterstadt</p>
    </div>
`;

// Create dist directory
if (!fs.existsSync('./dist')) fs.mkdirSync('./dist', { recursive: true });

// Write files
fs.writeFileSync('./dist/index.html', template('Startseite', indexContent));
fs.writeFileSync('./dist/programme.html', template('Förderprogramme', programmeContent));
fs.writeFileSync('./dist/impressum.html', template('Impressum', impressumContent));
fs.writeFileSync('./dist/datenschutz.html', template('Datenschutz', datenschutzContent));

console.log('✅ Statische HTML-Dateien erstellt:');
console.log('   - dist/index.html');
console.log('   - dist/programme.html');
console.log('   - dist/impressum.html');
console.log('   - dist/datenschutz.html');
console.log(`\n📊 ${programme.length} Förderprogramme exportiert`);
