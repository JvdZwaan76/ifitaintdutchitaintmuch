document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            message.textContent = 'Access Granted. Welcome to the mystery.';
            message.style.color = '#00ff00';
            // Optionally redirect or show content
        } else {
            message.textContent = 'Access Denied. Try again.';
            message.style.color = '#ff0000';
        }
    } catch (error) {
        message.textContent = 'Error connecting to the void.';
        message.style.color = '#ff0000';
    }
});

// Simple smoke particles enhancement (optional, for more smoke)
function createSmokeParticle() {
    const particle = document.createElement('div');
    particle.classList.add('smoke-particle');
    particle.style.position = 'absolute';
    particle.style.width = `${Math.random() * 50 + 20}px`;
    particle.style.height = particle.style.width;
    particle.style.background = '#333';
    particle.style.borderRadius = '50%';
    particle.style.opacity = 0.1;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = '100%';
    particle.style.boxShadow = '0 0 20px #333';
    document.querySelector('.smoke').appendChild(particle);

    const anim = particle.animate([
        { transform: 'translateY(0) scale(1)', opacity: 0.1 },
        { transform: `translateY(-${window.innerHeight + 100}px) scale(${Math.random() + 1})`, opacity: 0 }
    ], {
        duration: Math.random() * 10000 + 5000,
        easing: 'linear'
    });

    anim.onfinish = () => particle.remove();
}

setInterval(createSmokeParticle, 500);
