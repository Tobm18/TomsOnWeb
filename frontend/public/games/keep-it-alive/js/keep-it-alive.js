const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let INITIAL_WIDTH = window.innerWidth;
let INITIAL_HEIGHT = window.innerHeight;
canvas.width = INITIAL_WIDTH;
canvas.height = INITIAL_HEIGHT;

window.addEventListener('resize', () => {
    INITIAL_WIDTH = window.innerWidth;
    INITIAL_HEIGHT = window.innerHeight;
    if (gameState === 'playing') {
        canvas.width = INITIAL_WIDTH;
        canvas.height = INITIAL_HEIGHT;
    }
});

let gameState = 'start';
let score = 0;
let animationId;
let doublePointsCombo = 1;

const keys = { left: false, right: false };

const powerups = [];
const collectables = [];
const windParticles = [];
let activePowerups = { shield: 0, slowmo: 0, doublePoints: 0 };

const ball = {
    x: INITIAL_WIDTH / 2,
    y: INITIAL_HEIGHT / 2,
    radius: 20,
    vx: 0,
    vy: 0,
    color: '#4ecdc4',
    moveSpeed: 0.6,
    maxHorizontalSpeed: 10,
    trail: [],
    maxTrailLength: 15
};

const physics = {
    baseGravity: 0.4,
    gravity: 0.4,
    impulseStrength: -10,
    friction: 0.98,
    horizontalFriction: 0.92,
    maxSpeed: 15,
    windForce: 0
};

const difficulty = {
    startTime: 0,
    currentTime: 0,
    gravityIncrease: 0.02,
    windChance: 0.004,
    maxWind: 0.5,
    obstacleSpawnRate: 2500,
    lastObstacleSpawn: 0,
    minObstacleInterval: 800,
    powerupSpawnRate: 12000,
    lastPowerupSpawn: 0,
    collectableSpawnRate: 1500,
    lastCollectableSpawn: 0,
    obstacleSpeedMultiplier: 1
};

const obstacles = [];

class PointCollectable {
    constructor() {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = -20;
        this.speed = Math.random() * 1.5 + 1;
        this.rotation = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        const rarities = [
            { threshold: 0.4, value: 5, size: 12, color: '#90EE90', glow: 'rgba(144, 238, 144, 0.5)' },
            { threshold: 0.65, value: 25, size: 16, color: '#4169E1', glow: 'rgba(65, 105, 225, 0.5)' },
            { threshold: 0.85, value: 100, size: 20, color: '#9370DB', glow: 'rgba(147, 112, 219, 0.6)' },
            { threshold: 0.95, value: 200, size: 24, color: '#FF6347', glow: 'rgba(255, 99, 71, 0.7)' },
            { threshold: 1, value: 500, size: 28, color: '#FFD700', glow: 'rgba(255, 215, 0, 0.8)' }
        ];
        
        const rarity = Math.random();
        const config = rarities.find(r => rarity < r.threshold);
        Object.assign(this, config);
    }
    
    update() {
        const slowmoFactor = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.y += this.speed * slowmoFactor;
        this.rotation += 0.03;
        this.pulsePhase += 0.1;
    }
    
    draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
        const currentSize = this.size * pulse;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.glow;
        
        // Étoile extérieure
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * currentSize;
            const y = Math.sin(angle) * currentSize;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Centre
        ctx.beginPath();
        ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        ctx.shadowBlur = 0;

        const fontSize = Math.max(14, Math.round(currentSize * 0.6));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.lineWidth = Math.max(3, Math.round(currentSize * 0.12));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeText(this.value, 0, 0);

        ctx.fillStyle = '#000';
        ctx.fillText(this.value, 0, 0);
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > canvas.height + this.size;
    }
    
    collidesWith(ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size + ball.radius;
    }
}

function drawPowerupTimers() {
    const centerX = canvas.width / 2;
    const timers = [
        activePowerups.shield > 0 && { color: '#00BFFF', symbol: '🛡️', text: `${(activePowerups.shield / 60).toFixed(1)}s` },
        activePowerups.slowmo > 0 && { color: '#32CD32', symbol: '⏱️', text: `${(activePowerups.slowmo / 60).toFixed(1)}s` },
        activePowerups.doublePoints > 0 && { color: '#FFD700', symbol: '⭐', text: `${(activePowerups.doublePoints / 60).toFixed(1)}s${doublePointsCombo > 1 ? ` x${doublePointsCombo}` : ''}` }
    ].filter(Boolean);
    
    timers.forEach((timer, index) => {
        const yPos = 100 + (index * 50);
        
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = timer.color;
        
        // Power-up circle
        ctx.beginPath();
        ctx.arc(centerX - 80, yPos, 18, 0, Math.PI * 2);
        ctx.fillStyle = timer.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = timer.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Symbol
        ctx.shadowBlur = 0;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timer.symbol, centerX - 80, yPos);
        
        // Timer text
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = timer.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText(timer.text, centerX - 50, yPos + 2);
        ctx.fillText(timer.text, centerX - 50, yPos + 2);
        ctx.restore();
    });
}

class WindParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.length = Math.random() * 20 + 10;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.speed = Math.random() * 2 + 1;
    }
    
    update(windForce) {
        this.x += windForce * 50;
        this.y += Math.sin(this.x * 0.01) * 0.5;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
    }
    
    draw(windForce) {
        if (Math.abs(windForce) < 0.01) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity * Math.abs(windForce) * 3;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.sign(windForce) * this.length, this.y);
        ctx.stroke();
        ctx.restore();
    }
}

// Initialiser les particules de vent
for (let i = 0; i < 30; i++) {
    windParticles.push(new WindParticle());
}

class Powerup {
    constructor() {
        this.radius = 15;
        this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        this.y = -this.radius;
        this.speed = 2;
        this.rotation = 0;
        
        const types = ['shield', 'slowmo', 'doublePoints'];
        this.type = types[Math.floor(Math.random() * types.length)];
        const config = {
            shield: { color: '#00BFFF' },
            slowmo: { color: '#32CD32' },
            doublePoints: { color: '#FFD700' }
        };
        Object.assign(this, config[this.type]);
    }
    
    update() {
        const slowmoFactor = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.y += this.speed * slowmoFactor;
        this.rotation += 0.05;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        // Circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Symbol
        const symbols = { shield: '🛡️', slowmo: '⏱️', doublePoints: '⭐' };
        ctx.shadowBlur = 0;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbols[this.type], 0, 0);
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > canvas.height + this.radius;
    }
    
    collidesWith(ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + ball.radius;
    }
}

class Obstacle {
    constructor() {
        const types = ['bar', 'wave', 'spinner', 'zigzag'];
        this.obstacleType = types[Math.floor(Math.random() * types.length)];
        
        this.width = Math.random() * 120 + 100;
        this.height = Math.random() * 20 + 12;
        this.speed = (Math.random() * 2 + 2.5) * difficulty.obstacleSpeedMultiplier;
        
        const side = Math.random() < 0.5 ? 'top' : 'bottom';
        if (side === 'top') {
            this.x = Math.random() * (canvas.width - this.width);
            this.y = -this.height;
            this.direction = 1;
        } else {
            this.x = Math.random() * (canvas.width - this.width);
            this.y = canvas.height;
            this.direction = -1;
        }
        
        this.color = `hsl(${Math.random() * 30 + 345}, 80%, 55%)`;
        this.rotation = 0;
        this.phase = Math.random() * Math.PI * 2;
        this.initialX = this.x;
    }
    
    update() {
        const slowmoFactor = activePowerups.slowmo > 0 ? 0.5 : 1;
        const speed = this.speed * slowmoFactor;
        
        this.y += speed * this.direction;
        
        switch(this.obstacleType) {
            case 'wave':
                this.x = this.initialX + Math.sin(this.y * 0.01 + this.phase) * 50;
                break;
            case 'spinner':
                this.rotation += 0.03 * slowmoFactor;
                break;
            case 'zigzag':
                this.x += Math.sin(this.y * 0.05) * 2;
                break;
        }
    }
    
    draw() {
        ctx.save();
        
        if (this.obstacleType === 'spinner') {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.translate(-this.width / 2, -this.height / 2);
        } else {
            ctx.translate(this.x, this.y);
        }
        
        // Gradient
        const gradient = ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, 'rgba(255, 107, 107, 0.8)');
        gradient.addColorStop(1, this.color);
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.shadowBlur = 0;
        
        // Bordure animée
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.width, this.height);
        
        // Motif intérieur
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 5; i < this.width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.height);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    isOffScreen() {
        return (this.direction === 1 && this.y > canvas.height + this.height) ||
               (this.direction === -1 && this.y < -this.height);
    }
    
    collidesWith(ball) {
        if (activePowerups.shield > 0) return false;
        
        const closestX = Math.max(this.x, Math.min(ball.x, this.x + this.width));
        const closestY = Math.max(this.y, Math.min(ball.y, this.y + this.height));
        
        const distanceX = ball.x - closestX;
        const distanceY = ball.y - closestY;
        
        return (distanceX * distanceX + distanceY * distanceY) < (ball.radius * ball.radius);
    }
}

const particles = [];

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.radius = Math.random() * 3 + 1;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.color = `hsl(${Math.random() * 60 + 160}, 70%, 60%)`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vy += 0.1;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// Éléments DOM
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const finalScoreElement = document.getElementById('finalScore');
const survivalMessageElement = document.getElementById('survivalMessage');
const gameContainer = document.querySelector('.game-container');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    startGame();
});

canvas.addEventListener('click', () => {
    if (gameState === 'playing') {
        applyImpulse();
    }
});

document.addEventListener('keydown', (e) => {
    if (gameState === 'playing') {
        if (e.code === 'Space') {
            e.preventDefault();
            applyImpulse();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            keys.left = true;
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            keys.right = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') {
        keys.left = false;
    } else if (e.code === 'ArrowRight') {
        keys.right = false;
    }
});

document.addEventListener('keydown', (e) => {
    if (gameState === 'gameOver' && (e.code === 'Enter' || e.key === 'Enter')) {
        startGame();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing') {
        applyImpulse();
    } else if (gameState === 'gameOver') {
        startGame();
    }
});

function startGame() {
    gameState = 'playing';
    score = 0;
    doublePointsCombo = 1;
    difficulty.startTime = Date.now();
    difficulty.obstacleSpeedMultiplier = 1;
    
    document.getElementById('powerupLegend').classList.remove('hidden');
    
    canvas.width = INITIAL_WIDTH;
    canvas.height = INITIAL_HEIGHT;
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    ball.trail = [];
    
    physics.gravity = physics.baseGravity;
    physics.windForce = 0;
    
    particles.length = 0;
    obstacles.length = 0;
    powerups.length = 0;
    collectables.length = 0;
    difficulty.lastObstacleSpawn = Date.now();
    difficulty.lastPowerupSpawn = Date.now();
    difficulty.lastCollectableSpawn = Date.now();
    
    activePowerups = {
        shield: 0,
        slowmo: 0,
        doublePoints: 0
    };
    
    keys.left = false;
    keys.right = false;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    if (gameContainer) gameContainer.classList.add('hide-cursor');
    
    gameLoop();
}

function applyImpulse() {
    ball.vy = physics.impulseStrength;
    for (let i = 0; i < 8; i++) particles.push(new Particle(ball.x, ball.y));
}

function updatePhysics() {
    const slowmoFactor = activePowerups.slowmo > 0 ? 0.7 : 1;
    
    ball.vy += physics.gravity * slowmoFactor;
    
    if (keys.left) {
        ball.vx -= ball.moveSpeed;
    }
    if (keys.right) {
        ball.vx += ball.moveSpeed;
    }
    
    ball.vx += physics.windForce;
    ball.vx *= physics.horizontalFriction;
    ball.vy *= physics.friction;
    
    if (Math.abs(ball.vx) > ball.maxHorizontalSpeed) {
        ball.vx = Math.sign(ball.vx) * ball.maxHorizontalSpeed;
    }
    if (Math.abs(ball.vy) > physics.maxSpeed) {
        ball.vy = Math.sign(ball.vy) * physics.maxSpeed;
    }
    
    ball.trail.push({x: ball.x, y: ball.y});
    if (ball.trail.length > ball.maxTrailLength) {
        ball.trail.shift();
    }
    
    ball.x += ball.vx * slowmoFactor;
    ball.y += ball.vy * slowmoFactor;
}

function updateDifficulty() {
    difficulty.currentTime = (Date.now() - difficulty.startTime) / 1000;
    const now = Date.now();
    
    physics.gravity = physics.baseGravity + Math.floor(difficulty.currentTime / 8) * difficulty.gravityIncrease;
    difficulty.obstacleSpeedMultiplier = 1 + (difficulty.currentTime / 100);
    
    // Vent
    if (Math.random() < difficulty.windChance) {
        physics.windForce = (Math.random() - 0.5) * difficulty.maxWind;
    }
    physics.windForce *= 0.99;
    
    const obstacleInterval = Math.max(difficulty.obstacleSpawnRate - (difficulty.currentTime * 40), difficulty.minObstacleInterval);
    if (now - difficulty.lastObstacleSpawn > obstacleInterval) {
        obstacles.push(new Obstacle());
        difficulty.lastObstacleSpawn = now;
    }
    
    if (now - difficulty.lastPowerupSpawn > difficulty.powerupSpawnRate && Math.random() < 0.15) {
        powerups.push(new Powerup());
        difficulty.lastPowerupSpawn = now;
    }
    
    const collectableInterval = Math.max(difficulty.collectableSpawnRate - (difficulty.currentTime * 20), 600);
    if (now - difficulty.lastCollectableSpawn > collectableInterval) {
        collectables.push(new PointCollectable());
        difficulty.lastCollectableSpawn = now;
    }
    
    for (let key in activePowerups) {
        if (activePowerups[key] > 0) {
            activePowerups[key]--;
            if (key === 'doublePoints' && activePowerups[key] === 0) {
                doublePointsCombo = 1;
            }
        }
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        
        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }
}

function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].update();
        
        if (powerups[i].isOffScreen()) {
            powerups.splice(i, 1);
        } else if (powerups[i].collidesWith(ball)) {
            const powerup = powerups[i];
            const effects = {
                shield: () => activePowerups.shield = 600,
                slowmo: () => activePowerups.slowmo = 600,
                doublePoints: () => {
                    if (activePowerups.doublePoints > 0) {
                        doublePointsCombo++;
                        createFloatingText(`COMBO x${doublePointsCombo}!`, powerup.x, powerup.y, '#FFD700');
                    } else {
                        doublePointsCombo = 2;
                        createFloatingText('x2 Points!', powerup.x, powerup.y, '#FFD700');
                    }
                    activePowerups.doublePoints = 600;
                }
            };
            
            effects[powerup.type]();
            
            for (let j = 0; j < 15; j++) {
                const p = new Particle(powerup.x, powerup.y);
                p.color = powerup.color;
                particles.push(p);
            }
            
            powerups.splice(i, 1);
        }
    }
}

function updateCollectables() {
    for (let i = collectables.length - 1; i >= 0; i--) {
        collectables[i].update();
        
        if (collectables[i].isOffScreen()) {
            collectables.splice(i, 1);
        } else if (collectables[i].collidesWith(ball)) {
            const collectable = collectables[i];
            const multiplier = activePowerups.doublePoints > 0 ? doublePointsCombo : 1;
            const pointsGained = collectable.value * multiplier;
            score += pointsGained;
            
            for (let j = 0; j < 10; j++) {
                const p = new Particle(collectable.x, collectable.y);
                p.color = collectable.color;
                particles.push(p);
            }
            
            createFloatingText(`+${pointsGained}`, collectable.x, collectable.y, collectable.color);
            
            collectables.splice(i, 1);
        }
    }
}

const floatingTexts = [];

function createFloatingText(text, x, y, color) {
    floatingTexts.push({
        text: text,
        x: x,
        y: y,
        color: color,
        life: 60,
        vy: -2
    });
}

function updateFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life--;
        ft.vy *= 0.95;
        
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

function drawFloatingTexts() {
    floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = ft.life / 60;
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    });
}

function checkCollisions() {
    if (ball.x - ball.radius < 0) {
        if (activePowerups.shield > 0) {
            ball.x = ball.radius;
            ball.vx = 0;
        } else { gameOver(); return; }
    }
    if (ball.x + ball.radius > canvas.width) {
        if (activePowerups.shield > 0) {
            ball.x = canvas.width - ball.radius;
            ball.vx = 0;
        } else { gameOver(); return; }
    }
    if (ball.y - ball.radius < 0) {
        if (activePowerups.shield > 0) {
            ball.y = ball.radius;
            ball.vy = 0;
        } else { gameOver(); return; }
    }
    if (ball.y + ball.radius > canvas.height) {
        if (activePowerups.shield > 0) {
            ball.y = canvas.height - ball.radius;
            ball.vy = 0;
        } else { gameOver(); return; }
    }
    
    for (let obstacle of obstacles) {
        if (obstacle.collidesWith(ball)) {
            gameOver();
            return;
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    ctx.fillStyle = activePowerups.slowmo > 0 ? '#0a0f1e' : '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStarfield();
    
    if (Math.abs(physics.windForce) > 0.01) {
        windParticles.forEach(wp => {
            wp.update(physics.windForce);
            wp.draw(physics.windForce);
        });
    }
    
    obstacles.forEach(obstacle => obstacle.draw());
    powerups.forEach(powerup => powerup.draw());
    collectables.forEach(collectable => collectable.draw());
    particles.forEach(particle => particle.draw());
    
    ball.trail.forEach((pos, i) => {
        const alpha = i / ball.trail.length * 0.3;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ball.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    if (activePowerups.shield > 0) {
        ctx.save();
        const shieldRadius = ball.radius + 14;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, shieldRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,191,255,0.12)';
        ctx.fill();

        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(0,191,255,0.9)';

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, shieldRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,191,255,0.95)';
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,191,255,0.8)';
        ctx.arc(ball.x, ball.y, ball.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
    }
    
    const gradient = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ball.radius * 2
    );
    gradient.addColorStop(0, ball.color);
    gradient.addColorStop(0.5, ball.color);
    gradient.addColorStop(1, 'rgba(78, 205, 196, 0)');
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(ball.x - 6, ball.y - 6, ball.radius / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
    
    drawFloatingTexts();
    drawPowerupTimers();
}

const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * INITIAL_WIDTH,
        y: Math.random() * INITIAL_HEIGHT,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}

function drawStarfield() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateScore() {
    scoreElement.textContent = Math.floor(score) + ' pts';
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    updatePhysics();
    updateDifficulty();
    updateObstacles();
    updatePowerups();
    updateCollectables();
    updateFloatingTexts();
    checkCollisions();
    updateParticles();
    draw();
    updateScore();
    
    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState = 'gameOver';
    cancelAnimationFrame(animationId);
    
    document.getElementById('powerupLegend').classList.add('hidden');
    
    const finalScore = Math.floor(score);
    finalScoreElement.textContent = finalScore;

    // Send score to the parent application
    window.parent.postMessage({ 
        type: 'GAME_OVER', 
        score: finalScore 
    }, '*');

    if (survivalMessageElement) {
        survivalMessageElement.textContent = `Tu as survécu ${difficulty.currentTime.toFixed(1)}s`;
    }
    gameOverScreen.classList.remove('hidden');
    
    for (let i = 0; i < 30; i++) particles.push(new Particle(ball.x, ball.y));
    // Restore cursor when game ends
    if (gameContainer) gameContainer.classList.remove('hide-cursor');
}
