// ====================================================
// 0. CONFIGURATION ADMIN (المالك) ⭐
// ====================================================
const ADMIN_EMAIL = "showb2131@gmail.com";
const ADMIN_CODE = "16050398";
const ADMIN_STAR = "⭐";

function isAdmin(email) {
    return email === ADMIN_EMAIL;
}

// ====================================================
// 1. CONFIGURATION EMAILJS (avec tes données)
// ====================================================
const EMAILJS_PUBLIC_KEY = "vo57xBjnbTYpv8hv2";
const EMAILJS_SERVICE_ID = "service_cn0j98d";
const EMAILJS_TEMPLATE_ID = "template_qzt8hkr";

emailjs.init(EMAILJS_PUBLIC_KEY);

// ====================================================
// 2. BASE DE DONNÉES DIAGNOSTIC
// ====================================================
const carDatabase = {
    volkswagen: { "golf 7": { 2020: ["Défaut capteur PMH", "Fuite d'huile"], 2021: ["Batterie faible"] } },
    bmw: { "x5": { 2021: ["Problème suspension", "Capteur O2"] } },
    mercedes: { "cla 200": { 2022: ["Boîte de vitesses", "Fuite huile moteur"] } },
    toyota: { "corolla": { 2020: ["Alternateur", "Bougies"] } },
    renault: { "clio": { 2020: ["Catalyseur", "Fuite huile boîte"] } },
    peugeot: { "208": { 2021: ["Capteurs avant", "Ventilateur"] } },
    audi: { "a3": { 2020: ["Turbo", "Freins"] } },
    ford: { "focus": { 2021: ["Suspension", "Batterie"] } }
};

const solutionsDB = {
    "Défaut capteur PMH": { solution: "Nettoyer/remplacer capteur", cost: 120 },
    "Fuite d'huile": { solution: "Changer joints", cost: 200 },
    "Boîte de vitesses": { solution: "Réparation boîte auto", cost: 350 },
    "Batterie faible": { solution: "Remplacer batterie", cost: 250 },
    "Problème suspension": { solution: "Changer amortisseurs", cost: 400 },
    "Capteur O2": { solution: "Remplacer sonde O2", cost: 180 },
    "Alternateur": { solution: "Réparer alternateur", cost: 280 },
    "Bougies": { solution: "Changer bougies", cost: 160 },
    "Catalyseur": { solution: "Nettoyer catalyseur", cost: 500 },
    "Fuite huile boîte": { solution: "Changer joint boîte", cost: 300 },
    "Capteurs avant": { solution: "Nettoyer capteurs", cost: 130 },
    "Ventilateur": { solution: "Changer ventilateur", cost: 190 },
    "Turbo": { solution: "Nettoyer turbo", cost: 450 },
    "Freins": { solution: "Changer disques", cost: 300 },
    "Fuite huile moteur": { solution: "Changer joints moteur", cost: 350 },
    "Suspension": { solution: "Révision complète", cost: 370 }
};

// ====================================================
// 3. GESTION DES UTILISATEURS
// ====================================================
let currentUser = null;

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || {};
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getUser(email) {
    const users = getUsers();
    return users[email] || null;
}

function createUser(data) {
    const users = getUsers();
    if (users[data.email]) return false;
    users[data.email] = {
        nom: data.nom,
        prenom: data.prenom,
        cin: data.cin,
        tel: data.tel,
        password: data.password,
        compteBancaire: data.compteBancaire,
        cinPhoto: data.cinPhoto || '',
        subscribed: false,
        subscriptionType: null,
        trialStart: new Date().toISOString(),
        subscriptionEnd: null,
        verified: false
    };
    saveUsers(users);
    return true;
}

function updateUser(email, data) {
    const users = getUsers();
    if (users[email]) {
        users[email] = { ...users[email], ...data };
        saveUsers(users);
        return true;
    }
    return false;
}

// ====================================================
// 4. ADMIN - إستعمال مجاني للأبد ⭐
// ====================================================
function getTrialDaysLeft(email) {
    if (isAdmin(email)) return 999;

    const user = getUser(email);
    if (!user) return 0;
    if (user.subscribed) return 999;
    
    const start = new Date(user.trialStart);
    const now = new Date();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, 3 - diff);
}

// ====================================================
// 5. ADMIN LOGIN (Email + Code unique) ⭐
// ====================================================
let adminCode = null;
let adminCodeTimer = null;

function generateAdminCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendAdminCode(email) {
    const msg = document.getElementById('authMessage');
    
    adminCode = generateAdminCode();
    
    const emailParams = {
        to_email: email,
        otp_code: adminCode,
        subject: "🔐 Code de connexion Admin",
        message: `Votre code de connexion Admin est : ${adminCode}\nValable 5 minutes.`
    };
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams)
        .then(() => {
            msg.innerHTML = '✅ Code envoyé sur votre email.';
            msg.style.color = '#1e7e34';
        })
        .catch((err) => {
            console.error('Erreur EmailJS:', err);
            console.log('📧 Code Admin :', adminCode);
            msg.innerHTML = `📧 Code (simulation) : ${adminCode}`;
            msg.style.color = '#0077b6';
        });
    
    document.getElementById('adminCodeSection').style.display = 'block';
    document.getElementById('adminEmailDisplay').textContent = email;
    
    if (adminCodeTimer) clearTimeout(adminCodeTimer);
    adminCodeTimer = setTimeout(() => {
        adminCode = null;
        document.getElementById('adminCodeSection').style.display = 'none';
        msg.innerHTML = '⏰ Code expiré. Cliquez sur "Se connecter" pour renvoyer.';
        msg.style.color = '#b23b3b';
    }, 300000);
}

window.verifyAdminCode = function() {
    const code = document.getElementById('adminCodeInput').value.trim();
    const msg = document.getElementById('authMessage');
    
    if (!code) {
        msg.innerHTML = '⚠️ Entrez le code reçu.';
        msg.style.color = '#b23b3b';
        return;
    }
    
    if (code === adminCode) {
        currentUser = ADMIN_EMAIL;
        localStorage.setItem('currentUser', ADMIN_EMAIL);
        msg.innerHTML = '⭐ Connexion Admin réussie !';
        msg.style.color = '#1e7e34';
        document.getElementById('adminCodeSection').style.display = 'none';
        document.getElementById('adminLoginSection').style.display = 'none';
        adminCode = null;
        showDashboard();
    } else {
        msg.innerHTML = '❌ Code incorrect.';
        msg.style.color = '#b23b3b';
    }
};

// ====================================================
// 6. INSCRIPTION (clients normaux)
// ====================================================
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const msg = document.getElementById('authMessage');

    const nom = document.getElementById('regNom').value.trim();
    const prenom = document.getElementById('regPrenom').value.trim();
    const cin = document.getElementById('regCIN').value.trim();
    const tel = document.getElementById('regTel').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const compteBancaire = document.getElementById('regCompteBancaire').value.trim();
    const cinPhoto = document.getElementById('regCINPhoto').files[0];

    if (!nom || !prenom || !cin || !tel || !email || !password || !compteBancaire || !cinPhoto) {
        msg.innerHTML = '⚠️ Tous les champs sont obligatoires.';
        msg.style.color = '#b23b3b';
        return;
    }

    if (getUser(email)) {
        msg.innerHTML = '❌ Cet email est déjà utilisé.';
        msg.style.color = '#b23b3b';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const photoData = event.target.result;

        const userData = {
            nom, prenom, cin, tel, email, password, compteBancaire,
            cinPhoto: photoData
        };

        if (createUser(userData)) {
            msg.innerHTML = '✅ Inscription réussie ! Connectez-vous maintenant.';
            msg.style.color = '#1e7e34';
            document.getElementById('registerForm').reset();

            setTimeout(() => {
                updateUser(email, { verified: true });
                msg.innerHTML = '✅ ✅ Carte d\'identité vérifiée avec succès !';
                msg.style.color = '#1e7e34';
            }, 2000);
        }
    };
    reader.readAsDataURL(cinPhoto);
});

// ====================================================
// 7. CONNEXION (clients normaux + Admin)
// ====================================================
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const msg = document.getElementById('authMessage');

    // ===== ADMIN : Connexion sans mot de passe =====
    if (email === ADMIN_EMAIL) {
        msg.innerHTML = '⭐ Admin : Un code va être envoyé à votre email.';
        msg.style.color = '#0077b6';
        document.getElementById('adminLoginSection').style.display = 'block';
        document.getElementById('adminCodeSection').style.display = 'none';
        document.getElementById('adminCodeInput').value = '';
        
        sendAdminCode(email);
        return;
    }

    // ===== Clients normaux =====
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

    if (!user.verified) {
        msg.innerHTML = '⏳ Votre compte est en cours de vérification.';
        msg.style.color = '#b23b3b';
        return;
    }

    currentUser = email;
    localStorage.setItem('currentUser', email);
    msg.innerHTML = '🔓 Connexion réussie !';
    msg.style.color = '#1e7e34';
    showDashboard();
});

// ====================================================
// 8. MOT DE PASSE OUBLIÉ
// ====================================================
document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
    e.preventDefault();
    const section = document.getElementById('forgotPasswordSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
});

let resetCode = null;
let resetEmailOrTel = null;

window.sendResetCode = function() {
    const input = document.getElementById('forgotEmailOrTel').value.trim();
    const msg = document.getElementById('authMessage');

    if (!input) {
        msg.innerHTML = '⚠️ Entrez votre email ou téléphone.';
        msg.style.color = '#b23b3b';
        return;
    }

    const users = getUsers();
    let foundUser = null;
    let foundKey = null;
    for (const [key, user] of Object.entries(users)) {
        if (user.email === input || user.tel === input) {
            foundUser = user;
            foundKey = key;
            break;
        }
    }

    if (!foundUser) {
        msg.innerHTML = '❌ Aucun compte trouvé.';
        msg.style.color = '#b23b3b';
        return;
    }

    resetEmailOrTel = foundKey;
    resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const templateParams = {
        to_email: foundUser.email,
        otp_code: resetCode,
        subject: "🔑 Réinitialisation mot de passe",
        message: `Votre code de réinitialisation est : ${resetCode}`
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(() => {
            msg.innerHTML = '✅ Code envoyé par email.';
            msg.style.color = '#1e7e34';
            document.getElementById('resetCodeSection').style.display = 'block';
        })
        .catch((err) => {
            console.error('Erreur EmailJS:', err);
            console.log('Code de réinitialisation :', resetCode);
            msg.innerHTML = `📱 Code (simulation) : ${resetCode}`;
            msg.style.color = '#0077b6';
            document.getElementById('resetCodeSection').style.display = 'block';
        });
};

window.resetPassword = function() {
    const code = document.getElementById('resetCodeInput').value.trim();
    const newPass = document.getElementById('resetNewPassword').value.trim();
    const msg = document.getElementById('authMessage');

    if (!code || !newPass || newPass.length < 6) {
        msg.innerHTML = '⚠️ Code et mot de passe (min 6) requis.';
        msg.style.color = '#b23b3b';
        return;
    }

    if (code !== resetCode) {
        msg.innerHTML = '❌ Code incorrect.';
        msg.style.color = '#b23b3b';
        return;
    }

    if (resetEmailOrTel) {
        updateUser(resetEmailOrTel, { password: newPass });
        msg.innerHTML = '✅ Mot de passe réinitialisé avec succès !';
        msg.style.color = '#1e7e34';
        document.getElementById('resetCodeSection').style.display = 'none';
        document.getElementById('forgotPasswordSection').style.display = 'none';
        resetCode = null;
    }
};

// ====================================================
// 9. AFFICHAGE TABLEAU DE BORD
// ====================================================
function showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('btnLogout').style.display = 'inline';

    const email = currentUser || localStorage.getItem('currentUser');
    if (email) {
        const days = getTrialDaysLeft(email);
        const user = getUser(email);
        
        let status = '';
        if (isAdmin(email)) {
            status = '⭐ Admin · Accès illimité (gratuit à vie)';
        } else if (user && user.subscribed) {
            status = '✅ Abonnement actif (illimité)';
        } else {
            status = `🔥 Essai : ${days} jours restants`;
        }
        document.getElementById('trialStatus').textContent = status;
        loadHistory(email);
    }
}

// ====================================================
// 10. DÉCONNEXION
// ====================================================
document.getElementById('btnLogout').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    adminCode = null;
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('btnLogout').style.display = 'none';
    document.getElementById('authMessage').innerHTML = '';
    document.getElementById('registerForm').reset();
    document.getElementById('loginForm').reset();
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('adminCodeSection').style.display = 'none';
});

// Vérifier session
window.onload = function() {
    const saved = localStorage.getItem('currentUser');
    if (saved && (isAdmin(saved) || (getUser(saved) && getUser(saved).verified))) {
        currentUser = saved;
        showDashboard();
    }
};

// ====================================================
// 11. DIAGNOSTIC
// ====================================================
window.runDiagnostic = function() {
    const email = currentUser || localStorage.getItem('currentUser');
    if (!email) return alert('Veuillez vous connecter.');

    const days = getTrialDaysLeft(email);
    if (days === 0) {
        alert('⛔ Essai terminé. Abonnez-vous.');
        return;
    }

    const brand = document.getElementById('carBrand').value;
    const model = document.getElementById('carModel').value.toLowerCase().trim();
    const year = document.getElementById('carYear').value;

    let defects = [];
    const brandData = carDatabase[brand];
    if (brandData && brandData[model] && brandData[model][year]) {
        defects = brandData[model][year];
    } else {
        defects = ["Défaut électronique", "Vérification complète"];
    }

    document.getElementById('carNameDisplay').textContent = `${brand.toUpperCase()} ${model.toUpperCase()} (${year})`;
    document.getElementById('result').style.display = 'block';

    let sorted = defects.map(d => {
        const data = solutionsDB[d] || { solution: "Expert requis", cost: 999 };
        return { defect: d, solution: data.solution, cost: data.cost };
    });
    sorted.sort((a, b) => a.cost - b.cost);

    let html = '';
    sorted.forEach(item => {
        html += `<li><span>🔹 ${item.defect}</span><span class="solution">✅ ${item.solution}</span><span class="cost">💰 ${item.cost} DT</span></li>`;
    });
    document.getElementById('defectList').innerHTML = html;

    const best = sorted[0];
    document.getElementById('aiText').innerHTML = `
        🔍 Solutions classées par coût.<br>⭐ <strong>Meilleure solution :</strong> ${best.solution} (${best.cost} DT)
    `;

    saveHistory(email, model, defects[0], best.solution);
};

// ====================================================
// 12. HISTORIQUE
// ====================================================
function saveHistory(email, car, defect, solution) {
    const histories = JSON.parse(localStorage.getItem('histories')) || {};
    if (!histories[email]) histories[email] = [];
    histories[email].unshift({
        date: new Date().toISOString().slice(0,10),
        car: car.toUpperCase(),
        defect: defect,
        solution: solution
    });
    if (histories[email].length > 50) histories[email].pop();
    localStorage.setItem('histories', JSON.stringify(histories));
    loadHistory(email);
}

function loadHistory(email) {
    const histories = JSON.parse(localStorage.getItem('histories')) || {};
    const rows = histories[email] || [];
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';
    rows.forEach(row => {
        tbody.innerHTML += `<tr><td>${row.date}</td><td>${row.car}</td><td>${row.defect}</td><td>${row.solution}</td></tr>`;
    });
}

// ====================================================
// 13. ABONNEMENT (D17: 55138035)
// ====================================================
window.subscribe = function(type) {
    const email = currentUser || localStorage.getItem('currentUser');
    if (!email) return alert('Connectez-vous.');

    const user = getUser(email);
    if (!user) return alert('Utilisateur non trouvé.');

    const price = type === 'monthly' ? '29' : '249';
    const currency = 'DT';
    const accountNumber = '55138035';

    const confirmMsg = `💰 Paiement de ${price} ${currency} sur D17 (${accountNumber})\n\n` +
                       `Compte bancaire : ${user.compteBancaire || 'Non spécifié'}\n\n` +
                       `✅ Confirmez-vous le paiement ?`;

    if (confirm(confirmMsg)) {
        alert('⏳ Vérification du paiement en cours...');
        
        setTimeout(() => {
            updateUser(email, { 
                subscribed: true, 
                subscriptionType: type,
                subscriptionEnd: new Date(Date.now() + (type === 'monthly' ? 30 : 365) * 86400000).toISOString()
            });
            
            alert(`🎉 Abonnement ${type} activé avec succès !\n` +
                  `💰 Montant : ${price} ${currency}\n` +
                  `📱 D17 : ${accountNumber}\n` +
                  `🏦 Compte : ${user.compteBancaire}`);
            
            showDashboard();
        }, 3000);
    }
};

// ====================================================
// 14. BOUTON DASHBOARD
// ====================================================
document.getElementById('btnDashboard').addEventListener('click', function(e) {
    e.preventDefault();
    const email = currentUser || localStorage.getItem('currentUser');
    if (email && (isAdmin
