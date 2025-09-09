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

// Enhanced smoke particles
function createSmokeParticle() {
    const particle = document.createElement('div');
    particle.classList.add('smoke-particle');
    particle.style.position = 'absolute';
    particle.style.width = `${Math.random() * 60 + 30}px`;
    particle.style.height = particle.style.width;
    particle.style.background = 'radial-gradient(circle, #ff8c00 0%, transparent 70%)';
    particle.style.borderRadius = '50%';
    particle.style.opacity = Math.random() * 0.3 + 0.1;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = '100%';
    particle.style.filter = 'blur(10px)';
    document.querySelector('.smoke').appendChild(particle);

    const anim = particle.animate([
        { transform: 'translateY(0) scale(1)', opacity: 0.2 },
        { transform: `translateY(-${window.innerHeight + 200}px) translateX(${Math.random() * 200 - 100}px) scale(${Math.random() * 2 + 1})`, opacity: 0 }
    ], {
        duration: Math.random() * 15000 + 8000,
        easing: 'ease-out'
    });

    anim.onfinish = () => particle.remove();
}

setInterval(createSmokeParticle, 300);
