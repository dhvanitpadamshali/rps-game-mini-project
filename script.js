let currentMode = 3;
let isWaiting = false;

function setMode(mode) {
  currentMode = mode;

  // Update button styles
  document.getElementById("mode-3").classList.toggle("active", mode === 3);
  document.getElementById("mode-5").classList.toggle("active", mode === 5);

  e;
  fetch("/set_mode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: mode }),
  });

  resetGame();
}

function play(choice) {
  if (isWaiting) return;
  isWaiting = true;

  setButtonsDisabled(true);
  document.getElementById("result-area").style.display = "none";
  document.getElementById("thinking").style.display = "block";

  setTimeout(() => {
    fetch("/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice: choice }),
    })
      .then((r) => r.json())
      .then((data) => {
        document.getElementById("thinking").style.display = "none";

        if (data.match_over && !data.result) return;

        const area = document.getElementById("result-area");
        area.style.display = "block";
        area.classList.remove("shake");

        document.getElementById("user-emoji").textContent = data.user_emoji;
        document.getElementById("user-choice").textContent = data.user_choice;
        document.getElementById("cpu-emoji").textContent = data.computer_emoji;
        document.getElementById("cpu-choice").textContent =
          data.computer_choice;

        const msg = document.getElementById("result-message");
        msg.textContent = data.message;
        msg.className = "result-message " + data.result;

        document.getElementById("taunt").textContent = data.taunt || "";

        if (data.result === "lose") {
          void area.offsetWidth;
          area.classList.add("shake");
        }

        if (data.result === "win") {
          launchConfetti();
        }

        document.getElementById("wins").textContent = data.wins;
        document.getElementById("losses").textContent = data.losses;
        document.getElementById("ties").textContent = data.ties;
        document.getElementById("streak").textContent = data.streak;
        document.getElementById("best-streak").textContent = data.best_streak;

        updateDots(data.match_wins, data.match_losses, data.match_mode);

        updateHistory(data.history);

        if (data.match_over) {
          showMatchBanner(data.match_winner);
          setButtonsDisabled(true);
        } else {
          setButtonsDisabled(false);
        }

        isWaiting = false;
      });
  }, 800);
}

function updateDots(playerWins, cpuWins, mode) {
  const needed = mode === 3 ? 2 : 3;

  const playerDiv = document.getElementById("player-dots");
  const cpuDiv = document.getElementById("cpu-dots");

  playerDiv.innerHTML = "";
  cpuDiv.innerHTML = "";

  for (let i = 0; i < needed; i++) {
    const pd = document.createElement("div");
    pd.className = "dot" + (i < playerWins ? " filled-player" : "");
    playerDiv.appendChild(pd);

    const cd = document.createElement("div");
    cd.className = "dot" + (i < cpuWins ? " filled-cpu" : "");
    cpuDiv.appendChild(cd);
  }
}

function updateHistory(history) {
  const list = document.getElementById("history-list");
  list.innerHTML = "";

  if (!history || history.length === 0) {
    list.innerHTML = '<span class="history-empty">No rounds yet...</span>';
    return;
  }

  [...history].reverse().forEach((round) => {
    const item = document.createElement("div");
    item.className = "history-item " + round.result;
    item.innerHTML = `${round.user} <span class="history-vs">vs</span> ${round.cpu}`;
    list.appendChild(item);
  });
}

function showMatchBanner(winner) {
  const banner = document.getElementById("match-banner");
  const text = document.getElementById("banner-text");

  if (winner === "player") {
    text.textContent = "🏆 You Won the Match!";
    text.style.color = "#4ade80";
    launchConfetti();
    launchConfetti();
  } else {
    text.textContent = "💻 CPU Won the Match";
    text.style.color = "#f87171";
  }

  banner.style.display = "block";
}

function launchConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.55 },
    colors: ["#6366f1", "#4ade80", "#facc15", "#f87171", "#a5b4fc"],
  });
}

function resetGame() {
  fetch("/reset", { method: "POST" })
    .then((r) => r.json())
    .then(() => {
      document.getElementById("wins").textContent = 0;
      document.getElementById("losses").textContent = 0;
      document.getElementById("ties").textContent = 0;
      document.getElementById("streak").textContent = 0;
      document.getElementById("best-streak").textContent = 0;
      document.getElementById("result-area").style.display = "none";
      document.getElementById("match-banner").style.display = "none";
      document.getElementById("thinking").style.display = "none";
      document.getElementById("history-list").innerHTML =
        '<span class="history-empty">No rounds yet...</span>';
      document.getElementById("taunt").textContent = "";

      updateDots(0, 0, currentMode);
      setButtonsDisabled(false);
      isWaiting = false;
    });
}

function setButtonsDisabled(disabled) {
  document.querySelectorAll(".choice-btn").forEach((btn) => {
    btn.disabled = disabled;
  });
}

updateDots(0, 0, currentMode);
