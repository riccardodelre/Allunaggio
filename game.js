const lander = document.getElementById("lander");
    const flame = document.getElementById("flame");
    const leftFlame = document.getElementById("left-flame");
    const rightFlame = document.getElementById("right-flame");
    const speedDisplay = document.getElementById("speed");
    const engineDisplay = document.getElementById("engine");
    const fuelDisplay = document.getElementById("fuel");
    const message = document.getElementById("message");
    const scoreDisplay = document.getElementById("score");
    const target = document.getElementById("target");
    const engineSound = document.getElementById("engine-sound");
    const collisionSound = document.getElementById("collision-sound");
    const landingSuccessSound = document.getElementById("landing-success-sound");
    const fuelEmptySound = document.getElementById("fuel-empty-sound");
    const asteroidContainer = document.getElementById("asteroid-container");

    const starContainer = document.getElementById("stars");
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.top = Math.random() * 100 + "vh";
      star.style.left = Math.random() * 100 + "vw";
      starContainer.appendChild(star);
    }

    let position = 70; // era 90
    let speed = 0;
    let horizontalSpeed = 0;
    let gravity = 0.001;  
    let thrust = -0.002;    
    let engineOn = false;
    let movingLeft = false;
    let movingRight = false;
    let gameOver = false;
    let score = 0;
    let fuel = 100;
    let waitingToStart = false;
    let waitingToRestart = false; 

    let targetPosition = Math.random() * 80 + 10;
    target.style.left = targetPosition + "%";

    const asteroidData = [];

    function createAsteroids() {
      asteroidContainer.innerHTML = "";
      asteroidData.length = 0;
      for (let i = 0; i < 6; i++) {
        const asteroid = document.createElement("div");
        asteroid.classList.add("asteroid");
        const centerX = Math.random() * 70 + 10;
        const centerY = Math.random() * 30 + 40;
        const radius = 3 + Math.random() * 2;
        const angle = Math.random() * 2 * Math.PI;
        const speed = 0.005 + Math.random() * 0.003;
        asteroid.dataset.index = i;
        asteroidData.push({element: asteroid, centerX, centerY, radius, angle, speed});
        asteroidContainer.appendChild(asteroid);
      }
    }

    function moveAsteroids() {
      asteroidData.forEach(data => {
        data.angle += data.speed;
        const x = data.centerX + Math.cos(data.angle) * data.radius;
        const y = data.centerY + Math.sin(data.angle) * data.radius;
        data.element.style.left = x + "vw";
        data.element.style.top = y + "vh";
      });
    }

    createAsteroids();

    let lateralThrust = 0.002;

    window.addEventListener("keydown", (e) => {

      if (waitingToRestart && e.code === "Enter") {
        waitingToRestart = false;
        waitingToStart = true;
        resetLander();
        return;
      }


      if (waitingToStart && e.code === "Space") {
        waitingToStart = false;
        engineOn = true;
        requestAnimationFrame(update);
        return;
      }
      if (waitingToStart || waitingToRestart) return; 

      if (fuel <= 0) {
        fuelEmptySound.play();
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        engineOn = true;
        fuel = Math.max(0, fuel - 1);
      }
      if (e.code === "ArrowLeft") {
        movingLeft = true;
        fuel = Math.max(0, fuel - 1);
      }
      if (e.code === "ArrowRight") {
        movingRight = true;
        fuel = Math.max(0, fuel - 1);
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") engineOn = false;
      if (e.code === "ArrowLeft") movingLeft = false;
      if (e.code === "ArrowRight") movingRight = false;
    });

    function update() {
      if (gameOver) return; 
      message.textContent = ''; 
      let acc = gravity;
      if (engineOn && fuel > 0) {
        acc += thrust;
        if (engineSound.paused) engineSound.play();
      } else {
        engineOn = false;
        engineSound.pause();
        engineSound.currentTime = 0;
      }

      speed += acc;
      position -= speed * 100;

      if (movingLeft) {
        horizontalSpeed -= lateralThrust;
      }
      if (movingRight) {
        horizontalSpeed += lateralThrust;
      }

      const maxLeft = 0;
      const maxRight = window.innerWidth - lander.offsetWidth;
      let newX = lander.offsetLeft + horizontalSpeed * 100;
      newX = Math.max(maxLeft, Math.min(maxRight, newX));
      lander.style.left = newX + "px";

      for (let a of asteroidData) {
        const r1 = lander.getBoundingClientRect();
        const r2 = a.element.getBoundingClientRect();
        if (
          r1.bottom > r2.top &&
          r1.top < r2.bottom &&
          r1.left < r2.right &&
          r1.right > r2.left
        ) {
          collisionSound.play();
          message.innerHTML = "<span style='color:red;'>Hai colpito un asteroide!</span>";
          message.innerHTML += '<br><span id="restart-hint" style="font-size:0.7em;color:#fff;font-family:\'Press Start 2P\',monospace;">Premere INVIO per ricominciare</span>';
          gameOver = true;
          waitingToRestart = true;
          engineSound.pause();
          return;
        }
      }

      // Sostituisci il controllo atterraggio con questo:
      const surfaceHeight = 80; // deve essere uguale all'altezza di #surface in px
const minPosition = (surfaceHeight / window.innerHeight) * 100;

// Calcola la posizione in pixel dal fondo
      const landerRect = lander.getBoundingClientRect();
      const gameRect = document.getElementById('game').getBoundingClientRect();
      const landerBottomFromGame = gameRect.bottom - landerRect.bottom;

      if (landerBottomFromGame <= surfaceHeight) {
        // La navicella ha toccato o superato il terreno
        position = minPosition;
        gameOver = true;
        waitingToRestart = true;
        engineSound.pause();
        const landingPosition = lander.offsetLeft + lander.offsetWidth / 2;
        const targetCenter = target.offsetLeft + target.offsetWidth / 2;
        const distance = Math.abs(landingPosition - targetCenter);
        if (distance < 30 && speed < 0.03) {
          landingSuccessSound.play();
          message.textContent = "Atterraggio perfetto!";
          message.style.color = "yellow";
          message.style.fontSize = "2.5em";
          score = Math.max(0, 100 - (distance / 5));
          message.innerHTML += '<br><span id="restart-hint" style="font-size:0.7em;color:#fff;font-family:\'Press Start 2P\',monospace;">Premere INVIO per ricominciare</span>';
        } else {
          message.textContent = "MISSION FAILED";
          message.style.color = "red";
          message.style.fontSize = "2.5em";
          score = 0;
          message.innerHTML += '<br><span id="restart-hint" style="font-size:0.7em;color:#fff;font-family:\'Press Start 2P\',monospace;">Premere INVIO per ricominciare</span>';
        }
        scoreDisplay.textContent = score.toFixed(0);
      }

      lander.style.bottom = position + "%";
      speedDisplay.textContent = speed.toFixed(4);
      engineDisplay.textContent = engineOn ? "ON" : "OFF";
      fuelDisplay.textContent = Math.max(0, fuel.toFixed(0));
      flame.style.display = engineOn ? "block" : "none";
      leftFlame.style.display = movingRight ? "block" : "none";
      rightFlame.style.display = movingLeft ? "block" : "none";

      moveAsteroids();

      requestAnimationFrame(update);
    }

    function resetLander() {
      position = 70; // era 90
      speed = 0;
      horizontalSpeed = 0;
      fuel = 100;
      engineOn = false;
      movingLeft = false;
      movingRight = false;
      gameOver = false;
      score = 0;
      waitingToStart = true;
      waitingToRestart = false;

      // Posiziona il lander centrato orizzontalmente
      lander.style.left = (window.innerWidth / 2 - lander.offsetWidth / 2) + "px";
      lander.style.bottom = position + "%";

      // Reset testo info
      speedDisplay.textContent = '0';
      fuelDisplay.textContent = '100';
      engineDisplay.textContent = 'OFF';
      message.textContent = 'Premi SPAZIO per iniziare!';
      message.style.fontSize = "1.5em";
      message.style.color = "#fff";
      scoreDisplay.textContent = '0';

      // Reset target e asteroidi
      targetPosition = Math.random() * 80 + 10;
      target.style.left = targetPosition + "%";
      createAsteroids();

      // Avvia animazione asteroidi anche qui
      animateAsteroids();
    }

    function animateAsteroids() {
  if (!waitingToStart) return;
  moveAsteroids();
  requestAnimationFrame(animateAsteroids);
}

    function startGame() {
      resetLander();
      animateAsteroids();
      // NON chiamare update qui!
    }