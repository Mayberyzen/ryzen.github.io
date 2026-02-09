// Main Application JavaScript

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
    
    const btn = document.querySelector('.mobile-menu-btn');
    btn.classList.toggle('active');
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Counter Animation
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    };
    
    updateCounter();
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(counter => {
    counterObserver.observe(counter);
});

// Text Scramble Effect
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        
        this.el.innerHTML = output;
        
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Initialize Text Scramble
const scrambleEl = document.getElementById('scrambleText');
if (scrambleEl) {
    const fx = new TextScramble(scrambleEl);
    let counter = 0;
    const words = ['SECURITY', 'PENTEST', 'RED TEAM', 'RESEARCH'];
    
    const next = () => {
        fx.setText(words[counter]).then(() => {
            setTimeout(next, 3000);
        });
        counter = (counter + 1) % words.length;
    };
    
    next();
}

// Typewriter Effect
const typewriterEl = document.getElementById('typewriter');
if (typewriterEl) {
    const text = 'whoami';
    let i = 0;
    
    const type = () => {
        if (i < text.length) {
            typewriterEl.textContent += text.charAt(i);
            i++;
            setTimeout(type, 200);
        }
    };
    
    setTimeout(type, 1000);
}

// Tilt Effect for Cards
function initTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

initTilt();

// Loading Screen
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    }
});

// Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!');
    });
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--accent-green);
        color: var(--bg-primary);
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 700;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Active Navigation Link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// Form Validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let valid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            valid = false;
            input.style.borderColor = 'var(--accent-red)';
            input.addEventListener('input', () => {
                input.style.borderColor = '';
            }, { once: true });
        }
    });
    
    return valid;
}

// Easter Egg (Konami Code)
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    document.body.style.filter = 'hue-rotate(180deg)';
    showNotification('🎮 GOD MODE ACTIVATED');
    
    setTimeout(() => {
        document.body.style.filter = '';
    }, 5000);
}

// Performance: Disable animations on low battery
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        if (battery.level < 0.2 && !battery.charging) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        }
    });
}

// Export functions for use in other scripts
window.utils = {
    copyToClipboard,
    showNotification,
    validateForm,
    toggleMobileMenu
};