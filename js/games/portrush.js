// PortRush Game Logic

const gameState = {
    isPlaying: false,
    score: 0,
    timeLeft: 60,
    found: 0,
    strikes: 0,
    difficulty: 'easy',
    targetServices: [],
    scannedPorts: [],
    timer: null,
    idsChance: 0.1
};

const difficulties = {
    easy: { time: 60, idsChance: 0.05, services: 4 },
    medium: { time: 45, idsChance: 0.1, services: 5 },
    hard: { time: 30, idsChance: 0.15, services: 6 }
};

const commonPorts = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    8080: 'HTTP-Proxy',
    8443: 'HTTPS-Alt'
};

let currentTargets = [];

function initGame() {
    generatePortGrid();
    loadHighScore();
}

function generatePortGrid() {
    const grid = document.getElementById('portGrid');
    grid.innerHTML = '';
    
    // Generate ports from 1-100 (showing common ports)
    const ports = [];
    for (let i = 1; i <= 100; i++) {
        ports.push(i);
    }
    
    ports.forEach(port => {
        const cell = document.createElement('div');
        cell.className = 'port-cell';
        cell.dataset.port = port;
        cell.innerHTML = `
            <span class="port-number">${port}</span>
            <span class="port-status"></span>
        `;
        cell.onclick = () => scanPort(port, cell);
        grid.appendChild(cell);
    });
}

function setDifficulty(level) {
    gameState.difficulty = level;
    
    // Update UI
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update hints based on difficulty
    updateHints();
}

function updateHints() {
    const hintList = document.getElementById('hintList');
    const serviceCount = difficulties[gameState.difficulty].services;
    
    const selectedServices = Object.entries(commonPorts)
        .sort(() => Math.random() - 0.5)
        .slice(0, serviceCount);
    
    currentTargets = selectedServices;
    
    hintList.innerHTML = selectedServices.map(([port, service]) => `
        <span class="hint-item" id="hint-${port}">${service} (${port})</span>
    `).join('');
}

function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.found = 0;
    gameState.strikes = 0;
    gameState.scannedPorts = [];
    gameState.timeLeft = difficulties[gameState.difficulty].time;
    gameState.idsChance = difficulties[gameState.difficulty].idsChance;
    
    // Reset UI
    document.querySelectorAll('.port-cell').forEach(cell => {
        cell.className = 'port-cell';
        cell.querySelector('.port-status').textContent = '';
    });
    
    document.querySelectorAll('.hint-item').forEach(hint => {
        hint.classList.remove('found');
    });
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('startBtn').textContent = '⏳ SCANNING...';
    document.getElementById('targetStatus').textContent = 'SCANNING';
    document.getElementById('targetStatus').style.color = 'var(--accent-green)';
    
    updateDisplay();
    
    // Start timer
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
    
    // Random IDS detection
    gameState.idsTimer = setInterval(() => {
        if (Math.random() < gameState.idsChance && gameState.isPlaying) {
            triggerIDS();
        }
    }, 5000);
}

function scanPort(port, cell) {
    if (!gameState.isPlaying || cell.classList.contains('scanned') || cell.classList.contains('locked')) {
        return;
    }
    
    // Add scan animation
    const scanLine = document.createElement('div');
    scanLine.className = 'scan-line';
    cell.appendChild(scanLine);
    setTimeout(() => scanLine.remove(), 500);
    
    gameState.scannedPorts.push(port);
    
    // Check if port is a target
    const targetIndex = currentTargets.findIndex(([p]) => parseInt(p) === port);
    
    if (targetIndex !== -1) {
        // Found a service!
        cell.classList.add('scanned', 'open');
        cell.querySelector('.port-status').textContent = 'OPEN';
        
        const [portNum, service] = currentTargets[targetIndex];
        document.getElementById(`hint-${portNum}`).classList.add('found');
        
        gameState.found++;
        gameState.score += 100;
        
        // Check if all found
        if (gameState.found === currentTargets.length) {
            endGame(true);
        }
    } else {
        // Port is closed
        cell.classList.add('scanned', 'closed');
        cell.querySelector('.port-status').textContent = 'CLOSED';
        
        // Small penalty for scanning closed ports
        gameState.score = Math.max(0, gameState.score - 5);
    }
    
    updateDisplay();
}

function triggerIDS() {
    // Lock random unscanned ports
    const unscanned = document.querySelectorAll('.port-cell:not(.scanned)');
    if (unscanned.length === 0) return;
    
    const toLock = Math.min(3, unscanned.length);
    
    for (let i = 0; i < toLock; i++) {
        const randomCell = unscanned[Math.floor(Math.random() * unscanned.length)];
        randomCell.classList.add('locked');
        randomCell.querySelector('.port-status').textContent = 'BLOCKED';
    }
    
    // Show alert
    const alert = document.getElementById('idsAlert');
    alert.classList.add('active');
    setTimeout(() => alert.classList.remove('active'), 1500);
    
    gameState.strikes++;
    gameState.score = Math.max(0, gameState.score - 50);
    
    updateDisplay();
    
    // Too many strikes = game over
    if (gameState.strikes >= 3) {
        endGame(false);
    }
}

function updateTimer() {
    const bar = document.getElementById('timerBar');
    const maxTime = difficulties[gameState.difficulty].time;
    const percentage = (gameState.timeLeft / maxTime) * 100;
    
    bar.style.width = percentage + '%';
    
    if (percentage < 30) {
        bar.classList.add('warning');
    } else {
        bar.classList.remove('warning');
    }
}

function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('time').textContent = gameState.timeLeft;
    document.getElementById('found').textContent = `${gameState.found}/${currentTargets.length}`;
    document.getElementById('strikes').textContent = gameState.strikes;
}

function endGame(completed) {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    clearInterval(gameState.idsTimer);
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = '▶ Start Scan';
    document.getElementById('targetStatus').textContent = completed ? 'COMPROMISED' : 'DETECTED';
    document.getElementById('targetStatus').style.color = completed ? 'var(--accent-green)' : 'var(--accent-red)';
    
    // Calculate final stats
    const accuracy = Math.round((gameState.found / gameState.scannedPorts.length) * 100) || 0;
    const timeBonus = gameState.timeLeft * 10;
    const finalScore = gameState.score + timeBonus;
    
    // Update modal
    document.getElementById('endTitle').textContent = completed ? '✓ SYSTEM BREACHED' : '✗ SCAN DETECTED';
    document.getElementById('endTitle').style.color = completed ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('finalFound').textContent = `${gameState.found}/${currentTargets.length}`;
    document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
    document.getElementById('finalTimeBonus').textContent = timeBonus;
    document.getElementById('finalScore').textContent = finalScore;
    
    // Save high score
    const highScore = parseInt(localStorage.getItem('portrush_high') || '0');
    if (finalScore > highScore) {
        localStorage.setItem('portrush_high', finalScore);
        localStorage.setItem('portrush_high_diff', gameState.difficulty);
    }
    
    // Show modal
    document.getElementById('gameOverModal').classList.add('active');
}

function resetGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    clearInterval(gameState.idsTimer);
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('startBtn').textContent = '▶ Start Scan';
    document.getElementById('targetStatus').textContent = 'STANDBY';
    document.getElementById('targetStatus').style.color = '';
    document.getElementById('timerBar').style.width = '100%';
    document.getElementById('timerBar').classList.remove('warning');
    
    gameState.score = 0;
    gameState.timeLeft = difficulties[gameState.difficulty].time;
    gameState.found = 0;
    gameState.strikes = 0;
    gameState.scannedPorts = [];
    
    document.querySelectorAll('.port-cell').forEach(cell => {
        cell.className = 'port-cell';
        cell.querySelector('.port-status').textContent = '';
    });
    
    document.querySelectorAll('.hint-item').forEach(hint => {
        hint.classList.remove('found');
    });
    
    updateDisplay();
    updateHints();
}

function closeModal() {
    document.getElementById('gameOverModal').classList.remove('active');
    resetGame();
}

function loadHighScore() {
    // High score is displayed on the games.html page
    const highScore = localStorage.getItem('portrush_high') || '0';
    const highDiff = localStorage.getItem('portrush_high_diff') || 'easy';
    console.log(`PortRush High Score: ${highScore} (${highDiff})`);
}

// Initialize on load
window.addEventListener('load', () => {
    initGame();
    updateHints();
});