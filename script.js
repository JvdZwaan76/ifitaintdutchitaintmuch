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
            message.style.color = '#00FF00';
        } else {
            message.textContent = 'Access Denied. Try again.';
            message.style.color = '#FF0000';
        }
    } catch (error) {
        message.textContent = 'Error connecting to the void.';
        message.style.color = '#FF0000';
    }
});

// Optimized smoke: Fewer particles, longer duration for performance
function createSmokeParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = `${Math.random() * 50 + 20}px`;
    particle.style.height = particle.style.width;
    particle.style.background = 'radial-gradient(circle, var(--shadow-color) 20%, transparent 80%)';
    particle.style.borderRadius = '50%';
    particle.style.opacity = Math.random() * 0.2 + 0.1;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = '100%';
    particle.style.filter = 'blur(8px)';
    document.querySelector('.smoke').appendChild(particle);

    const anim = particle.animate([
        { transform: 'translateY(0) scale(1)', opacity: 0.15 },
        { transform: `translateY(-${window.innerHeight * 1.5}px) scale(${Math.random() + 1.5})`, opacity: 0 }
    ], {
        duration: Math.random() * 20000 + 10000,
        easing: 'linear'
    });

    anim.onfinish = () => particle.remove();
}

setInterval(createSmokeParticle, 1000); // Reduced frequency for better perf
