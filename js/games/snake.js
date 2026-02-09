class TerminalSnake {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.speed = 100;
        this.running = false;
        this.gameLoop = null;
        
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        document.getElementById('highScore').textContent = this.highScore;
        
        this.setupControls();
        this.draw();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.running) {
                if (e.code === 'Space') this.start();
                return;
            }
            
            switch(e.key) {
                case 'ArrowUp': if (this.dy === 0) { this.dx = 0; this.dy = -1; } break;
                case 'ArrowDown': if (this.dy === 0) { this.dx = 0; this.dy = 1; } break;
                case 'ArrowLeft': if (this.dx === 0) { this.dx = -1; this.dy = 0; } break;
                case 'ArrowRight': if (this.dx === 0) { this.dx = 1; this.dy = 0; } break;
            }
        });
    }
    
    generateFood() {
        return {
            x: Math.floor(Math.random() * (this.tileCount - 2)) + 1,
            y: Math.floor(Math.random() * (this.tileCount - 2)) + 1,
            type: Math.random() > 0.8 ? 'bonus' : 'normal'
        };
    }
    
    start() {
        if (this.running) return;
        
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 1;
        this.dy = 0;
        this.score = 0;
        this.level = 1;
        this.speed = 100;
        this.running = true;
        
        document.getElementById('score').textContent = '0';
        document.getElementById('level').textContent = '1';
        document.getElementById('statusText').textContent = 'Game in progress...';
        document.getElementById('startBtn').innerHTML = '<i data-lucide="pause"></i> Pause';
        lucide.createIcons();
        
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }
    
    pause() {
        this.running = false;
        clearInterval(this.gameLoop);
        document.getElementById('statusText').textContent = 'Paused - Press SPACE to resume';
        document.getElementById('startBtn').innerHTML = '<i data-lucide="play"></i> Resume';
        lucide.createIcons();
    }
    
    update() {
        const head = {
            x: this.snake[0].x + this.dx,
            y: this.snake[0].y + this.dy
        };
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= 20) {
            this.gameOver();
            return;
        }
        
        // Self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Eat food
        if (head.x === this.food.x && head.y === this.food.y) {
            const points = this.food.type === 'bonus' ? 50 : 10;
            this.score += points;
            document.getElementById('score').textContent = this.score;
            
            // Level up every 50 points
            if (this.score % 50 === 0) {
                this.level++;
                this.speed = Math.max(50, this.speed - 10);
                document.getElementById('level').textContent = this.level;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
            
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    draw() {
        // Clear with terminal background
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#1a1a2e';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake with terminal style
        this.snake.forEach((segment, index) => {
            const isHead = index === 0;
            this.ctx.fillStyle = isHead ? '#3b82f6' : '#1d4ed8';
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            if (isHead) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 6,
                    segment.y * this.gridSize + 6,
                    4,
                    4
                );
            }
        });
        
        // Draw food
        this.ctx.fillStyle = this.food.type === 'bonus' ? '#ec4899' : '#10b981';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.food.type === 'bonus' ? '#ec4899' : '#10b981';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    gameOver() {
        this.running = false;
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
            document.getElementById('statusText').textContent = `New High Score! ${this.score} points`;
        } else {
            document.getElementById('statusText').textContent = `Game Over! Score: ${this.score}`;
        }
        
        document.getElementById('startBtn').innerHTML = '<i data-lucide="rotate-ccw"></i> Try Again';
        lucide.createIcons();
        
        // Update leaderboard
        this.updateLeaderboard();
    }
    
    updateLeaderboard() {
        const leaderboard = document.getElementById('leaderboard');
        const scores = JSON.parse(localStorage.getItem('snakeScores') || '[]');
        scores.push({ score: this.score, date: new Date().toLocaleDateString() });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(5); // Keep top 5
        
        localStorage.setItem('snakeScores', JSON.stringify(scores));
        
        leaderboard.innerHTML = scores.map((entry, i) => `
            <div class="leaderboard-item ${i === 0 ? 'gold' : ''}">
                <span class="rank">#${i + 1}</span>
                <span class="score">${entry.score}</span>
                <span class="date">${entry.date}</span>
            </div>
        `).join('');
    }
}

const game = new TerminalSnake();

// Mobile controls
document.getElementById('startBtn').addEventListener('click', () => {
    if (game.running) {
        game.pause();
    } else {
        game.start();
    }
});