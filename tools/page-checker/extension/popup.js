// Vérifier la connexion au serveur
fetch('http://localhost:3000/api/offers')
    .then(r => r.json())
    .then(() => {
        document.getElementById('status').className = 'status connected';
        document.getElementById('status').textContent = '✓ Connecté au serveur';
    })
    .catch(() => {
        document.getElementById('status').className = 'status disconnected';
        document.getElementById('status').textContent = '✗ Serveur non accessible';
    });
