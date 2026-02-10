// Shooter Jet Game using Module Pattern with proper encapsulation
const ShooterGame = (function() {
    // Private variables (closure)
    let score = 0;
    let gameState = 'playing'; // 'playing', 'gameOver'
    let canvas, ctx;
    let player, bullets, enemies;
    let animationId;
    let keys = {};
    
    // Private event handler references for cleanup
    let boundKeyDownHandler;
    let boundKeyUpHandler;
    let boundRestartHandler;
    
    // Player object
    function createPlayer() {
        return {
            x: 375,
            y: 500,
            width: 50,
            height: 50,
            speed: 5,
            color: '#00ff88'
        };
    }
    
    // Bullet object
    function createBullet(x, y) {
        return {
            x: x,
            y: y,
            width: 5,
            height: 15,
            speed: 7,
            color: '#ffaa00'
        };
    }
    
    // Enemy object
    function createEnemy() {
        return {
            x: Math.random() * (canvas.width - 40),
            y: -50,
            width: 40,
            height: 40,
            speed: 2 + Math.random() * 2,
            color: '#ff0044'
        };
    }
    
    // Private methods
    function initCanvas() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
    }
    
    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        // Draw jet nose
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x + player.width / 2 - 10, player.y + 20);
        ctx.lineTo(player.x + player.width / 2 + 10, player.y + 20);
        ctx.closePath();
        ctx.fill();
    }
    
    function drawBullets() {
        bullets.forEach(bullet => {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
    
    function drawEnemies() {
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
    }
    
    function updatePlayer() {
        if (keys.ArrowLeft && player.x > 0) {
            player.x -= player.speed;
        }
        if (keys.ArrowRight && player.x < canvas.width - player.width) {
            player.x += player.speed;
        }
        if (keys.ArrowUp && player.y > 0) {
            player.y -= player.speed;
        }
        if (keys.ArrowDown && player.y < canvas.height - player.height) {
            player.y += player.speed;
        }
    }
    
    function updateBullets() {
        // Use reverse loop to safely remove bullets while iterating
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= bullets[i].speed;
            if (bullets[i].y < 0) {
                bullets.splice(i, 1);
            }
        }
    }
    
    function updateEnemies() {
        // Use reverse loop to safely remove enemies while iterating
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += enemies[i].speed;
            if (enemies[i].y > canvas.height) {
                enemies.splice(i, 1);
                // Enemy passed through - decrease score
                decreaseScore(5);
            }
        }
    }
    
    function checkCollisions() {
        // Check bullet-enemy collisions using reverse loops
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const bullet = bullets[i];
                const enemy = enemies[j];
                
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    increaseScore(10);
                    break; // Break inner loop since bullet is destroyed
                }
            }
        }
        
        // Check player-enemy collisions
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                gameOver();
                break; // Game over, no need to check more collisions
            }
        }
    }
    
    function spawnEnemy() {
        if (Math.random() < 0.02 && gameState === 'playing') {
            enemies.push(createEnemy());
        }
    }
    
    function updateScore() {
        document.getElementById('score').textContent = score;
    }
    
    function increaseScore(amount) {
        score += amount;
        updateScore();
    }
    
    function decreaseScore(amount) {
        score = Math.max(0, score - amount);
        updateScore();
    }
    
    function gameOver() {
        gameState = 'gameOver';
        document.getElementById('finalScore').textContent = score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        cancelAnimationFrame(animationId);
    }
    
    function gameLoop() {
        if (gameState !== 'playing') return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update
        updatePlayer();
        updateBullets();
        updateEnemies();
        checkCollisions();
        spawnEnemy();
        
        // Draw
        drawPlayer();
        drawBullets();
        drawEnemies();
        
        animationId = requestAnimationFrame(gameLoop);
    }
    
    // Event handlers with proper 'this' context binding
    function handleKeyDown(event) {
        keys[event.key] = true;
        
        if (event.key === ' ' && gameState === 'playing') {
            event.preventDefault();
            bullets.push(createBullet(
                player.x + player.width / 2 - 2.5,
                player.y
            ));
        }
    }
    
    function handleKeyUp(event) {
        keys[event.key] = false;
    }
    
    function handleRestart() {
        // Reset game state
        score = 0;
        gameState = 'playing';
        player = createPlayer();
        bullets = [];
        enemies = [];
        
        updateScore();
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        gameLoop();
    }
    
    // Public API
    return {
        init: function() {
            initCanvas();
            player = createPlayer();
            bullets = [];
            enemies = [];
            
            // Bind event handlers to maintain context
            boundKeyDownHandler = handleKeyDown.bind(this);
            boundKeyUpHandler = handleKeyUp.bind(this);
            boundRestartHandler = handleRestart.bind(this);
            
            // Add event listeners
            window.addEventListener('keydown', boundKeyDownHandler);
            window.addEventListener('keyup', boundKeyUpHandler);
            document.getElementById('restartButton').addEventListener('click', boundRestartHandler);
            
            updateScore();
            gameLoop();
        },
        
        // Public methods to modify score (encapsulated)
        increaseScore: function(amount) {
            increaseScore(amount);
        },
        
        decreaseScore: function(amount) {
            decreaseScore(amount);
        },
        
        // Public method to get current score (read-only)
        getScore: function() {
            return score;
        },
        
        // Cleanup method to prevent memory leaks
        destroy: function() {
            // Cancel animation frame
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            // Remove event listeners
            window.removeEventListener('keydown', boundKeyDownHandler);
            window.removeEventListener('keyup', boundKeyUpHandler);
            document.getElementById('restartButton').removeEventListener('click', boundRestartHandler);
            
            // Clear references
            boundKeyDownHandler = null;
            boundKeyUpHandler = null;
            boundRestartHandler = null;
            canvas = null;
            ctx = null;
        }
    };
})();

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ShooterGame.init();
});
