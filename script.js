// =============================================
// ADMIN CONFIG
// =============================================
const ADMIN_EMAIL = "showb2131@gmail.com";
const ADMIN_CODE = "123456";

// =============================================
// BASE DE DONNÉES
// =============================================
const carDatabase = {
    volkswagen: { "golf 7": { 2020: ["Défaut capteur PMH", "Fuite d'huile"] } },
    bmw: { "x5": { 2021: ["Problème suspension", "Capteur O2"] } },
    mercedes: { "cla 200": { 2022: ["Boîte de vitesses"] } },
    toyota: { "corolla": { 2020: ["Alternateur", "Bougies"] } }
};

// =============================================
// GESTION UTILISATEURS
// =============================================
let currentUser = null;

function getUser(email) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    return users[email] || null;
}

function saveUser(email, data) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    users[email] = data;
    localStorage.setItem('users', JSON.stringify(users));
}

// =============================================
// CONNEXION
// =============================================
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const msg = document.getElementById('message');

    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);

    // ===== ADMIN =====
    if (email === ADMIN_EMAIL) {
        console.log("⭐ Admin détecté !");
        document.getElementById('adminSection').style.display = 'block';
        document.getElementById('adminCodeDisplay').textContent = ADMIN_CODE;
        msg.innerHTML = '⭐ Admin : Entrez le code 123456';
        msg.style.color = '#0077b6';
        return;
    }

    // ===== Clients =====
    const user = getUser(email);
    if (!user) {
        msg.innerHTML = '❌ Email non trouvé.';
        msg.style.color = '#b23b3b';
        return;
    }

    if (user.password !== password) {
        msg.innerHTML = '❌ Mot de passe incorrect.';
        msg.style.color = '#b23b3b';
        return;
    }

    currentUser = email;
    localStorage.setItem('currentUser', email);
    showDashboard(email);
});

// =============================================
// VÉRIFICATION ADMIN
// =============================================
window.verifyAdmin = function() {
    const code = document.getElementById('adminCodeInput').value.trim();
    const msg = document.getElementById('message');

    console.log("🔑 Code entré:", code);
    console.log("🔑 Code attendu:", ADMIN_CODE);

    if (code === ADMIN_CODE) {
        currentUser = ADMIN_EMAIL;
        localStorage.setItem('currentUser', ADMIN_EMAIL);
        msg.innerHTML = '⭐ Connexion Admin réussie !';
        msg.style.color = '#1e7e34';
        document.getElementById('adminSection').style.display = 'none';
        showDashboard(ADMIN_EMAIL);
    } else {
        msg.innerHTML = '❌ Code incorrect. Essayez 123456';
        msg.style.color = '#b23b3b';
    }
};

// =============================================
// AFFICHAGE DASHBOARD
// =============================================
function showDashboard(email) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('btnLogout').style.display = 'inline';
    document.getElementById('userName').textContent = email === ADMIN_EMAIL ? 'Admin ⭐' : email;
}

// =============================================
// DÉCONNEXION
// =============================================
document.getElementById('btnLogout').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('btnLogout').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('message').innerHTML = '';
});

// =============================================
// DIAGNOSTIC
// =============================================
window.runDiagnostic = function() {
    const email = currentUser || localStorage.getItem('currentUser');
    if (!email) return alert('Connectez-vous.');

    const brand = document.getElementById('carBrand').value;
    const model = document.getElementById('carModel').value.toLowerCase().trim();
    const year = document.getElementById('carYear').value;

    let defects = [];
    if (carDatabase[brand] && carDatabase[brand][model] && carDatabase[brand][model][year]) {
        defects = carDatabase[brand][model][year];
    } else {
        defects = ["Défaut inconnu", "Vérification requise"];
    }

    document.getElementById('carTitle').textContent = `${brand.toUpperCase()} ${model.toUpperCase()} (${year})`;
    document.getElementById('result').style.display = 'block';

    let html = '';
    defects.forEach(d => {
        html += `<li>🔹 ${d}</li>`;
    });
    document.getElementById('defectList').innerHTML = html;
};

// =============================================
// VÉRIFICATION SESSION
// =============================================
window.onload = function() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = saved;
        showDashboard(saved);
    }
};

console.log('✅ AutoDiagnostic Pro chargé !');
console.log('⭐ Admin :', ADMIN_EMAIL);
console.log('🔑 Code Admin :', ADMIN_CODE);
