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

// Optimized smoke particles for fog-like mystery
function createSmokeParticle() {
    const particle = document.createElement('div');
    particle.classList.add('smoke-particle');
    particle.style.position = 'absolute';
    particle.style.width = `${Math.random() * 80 + 40}px`;
    particle.style.height = particle.style.width;
    particle.style.background = 'radial-gradient(circle, rgba(255, 149, 0, 0.1) 0%, transparent 70%)';
    particle.style.borderRadius = '50%';
    particle.style.opacity = Math.random() * 0.3 + 0.1;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = '100%';
    particle.style.filter = 'blur(12px)';
    particle.style.pointerEvents = 'none';
    document.querySelector('.smoke').appendChild(particle);

    const anim = particle.animate([
        { transform: 'translateY(0) scale(1)', opacity: 0.2 },
        { transform: `translateY(-${window.innerHeight + 200}px) translateX(${Math.random() * 100 - 50}px) scale(${Math.random() * 1.5 + 1})`, opacity: 0 }
    ], {
        duration: Math.random() * 15000 + 10000,
        easing: 'ease-out'
    });

    anim.onfinish = () => particle.remove();
}

setInterval(createSmokeParticle, 500); // Slightly more for denser fog, but still fast

// Canvas for subtle starry/mysterious background (fast, lightweight)
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

drawStars();

// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawStars();
});
