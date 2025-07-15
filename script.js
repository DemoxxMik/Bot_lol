const champions = [
  "Ahri", "Akali", "Alistar", "Amumu", "Annie", "Ashe", "Blitzcrank", "Braum",
  "Caitlyn", "Cassiopeia", "Chogath", "Darius", "Diana", "Ezreal", "Fizz",
  "Galio", "Garen", "Hecarim", "Irelia", "Kai'sa", "Kassadin", "Kennen", "Kha'zix",
  "Leona", "Lillia", "Lissandra", "Lucian", "Lulu", "Lux", "MasterYi", "Malphite",
  "Maokai", "Millio", "MissFortune", "Mordekaiser", "Nasus", "Nautilus", "Nocturne",
  "Poppy", "Rakkan", "RennataGlasc", "Rumble", "Sejuani", "Seraphine", "Sett", "Shyvana",
  "Sivir", "Smolder", "Sona", "Soraka", "Taric", "Tristana", "Tryndamere", "TwistedFate",
  "Twitch", "Urgot", "Varus", "Vayne", "Veigar", "Vex", "Vi", "Volibear", "Warwick",
  "Wukong", "XinZhao", "Yorick", "Ziggs", "Zyra"
];

document.addEventListener("DOMContentLoaded", () => {
  const bouton = document.getElementById("generate");
  if (bouton) {
    bouton.addEventListener("click", genererTournoi);
  }
});

function genererTournoi() {
  const selection = [...champions].sort(() => 0.5 - Math.random()).slice(0, 16);
  const bracket = document.getElementById("bracket");
  bracket.innerHTML = "";

  const rounds = [8, 4, 2, 1]; // nombre de matchs par round

  rounds.forEach((matchCount, roundIndex) => {
    const col = document.createElement("div");
    col.className = "round";

    for (let i = 0; i < matchCount; i++) {
      const match = document.createElement("div");
      match.className = "match";
      match.dataset.round = roundIndex;
      match.dataset.index = i;

      // On prépare 2 slots dès le départ
      const slot1 = document.createElement("img");
      const slot2 = document.createElement("img");

      slot1.className = "champ-icon slot slot1";
      slot2.className = "champ-icon slot slot2";

      slot1.dataset.slot = "1";
      slot2.dataset.slot = "2";

      match.appendChild(slot1);
      match.insertAdjacentHTML("beforeend", "<br>vs<br>");
      match.appendChild(slot2);
      col.appendChild(match);
    }

    bracket.appendChild(col);
  });

  // Remplir les huitièmes avec les champions initiaux
  const firstRound = document.querySelectorAll(".round")[0].querySelectorAll(".match");
  firstRound.forEach((match, i) => {
    const champ1 = selection[i * 2];
    const champ2 = selection[i * 2 + 1];

    const img1 = match.querySelector(".slot1");
    const img2 = match.querySelector(".slot2");

    setChampion(img1, champ1);
    setChampion(img2, champ2);

    match.classList.add("active");
  });

  setTimeout(() => {
    bindMatchClicks();
    drawLines();
  }, 100);
}

function getIconURL(champName) {
  return `https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${champName}.png`;
}

function setChampion(imgElement, champName) {
  imgElement.src = getIconURL(champName);
  imgElement.alt = champName;
  imgElement.dataset.champion = champName;
  imgElement.style.opacity = "1";
  imgElement.style.cursor = "pointer";
  imgElement.classList.add("clickable");
}

function bindMatchClicks() {
  document.querySelectorAll(".match").forEach(match => {
    if (!match.classList.contains("active")) return;

    const imgs = match.querySelectorAll(".champ-icon");
    imgs.forEach(img => {
      img.onclick = () => {
        if (!img.dataset.champion || match.classList.contains("locked")) return;

        const champ = img.dataset.champion;
        const round = parseInt(match.dataset.round);
        const index = parseInt(match.dataset.index);
        const nextRound = round + 1;
        const nextIndex = Math.floor(index / 2);

        const allRounds = document.querySelectorAll(".round");
        const nextMatch = allRounds[nextRound]?.querySelectorAll(".match")[nextIndex];
        if (!nextMatch) return;
        // Effet visuel gagnant
        imgs.forEach(i => i.classList.remove("winner")); // retire le halo des deux
        img.classList.add("winner"); // ajoute le halo sur le gagnant


        // Trouver une case vide dans le match suivant
        const target = [...nextMatch.querySelectorAll(".champ-icon")]
          .find(slot => !slot.dataset.champion);

        if (target) {
          setChampion(target, champ);

          // Si le match suivant est maintenant complet, le rendre cliquable
          const [s1, s2] = nextMatch.querySelectorAll(".champ-icon");
          if (s1.dataset.champion && s2.dataset.champion) {
            nextMatch.classList.add("active");
            bindMatchClicks(); // rebind les nouveaux clics
          }
        }

        // Désactiver ce match
        match.classList.remove("active");
        match.classList.add("locked");
        imgs.forEach(img => {
          img.classList.remove("clickable");
          img.style.opacity = "0.5";
          img.style.cursor = "default";
        });

        drawLines();
      };
    });
  });
}

function drawLines() {
  const svg = document.getElementById("lines");
  svg.innerHTML = "";

  document.querySelectorAll(".match").forEach(m => m.style.marginTop = "");

  const bracket = document.getElementById("bracket");
  const bracketRect = bracket.getBoundingClientRect();
  svg.setAttribute("width", bracket.offsetWidth);
  svg.setAttribute("height", bracket.offsetHeight);

  const rounds = bracket.querySelectorAll(".round");

  // Centrage
  for (let r = 0; r < rounds.length - 1; r++) {
    const currentMatches = rounds[r].querySelectorAll(".match");
    const nextMatches = rounds[r + 1].querySelectorAll(".match");

    for (let i = 0; i < nextMatches.length; i++) {
      const m1 = currentMatches[i * 2];
      const m2 = currentMatches[i * 2 + 1];
      const next = nextMatches[i];
      if (!m1 || !m2 || !next) continue;

      const p1 = getCenter(m1, bracketRect);
      const p2 = getCenter(m2, bracketRect);
      const averageY = (p1.y + p2.y) / 2;
      const matchHeight = next.offsetHeight;
      const currentOffset = next.offsetTop;
      const idealOffset = averageY - matchHeight / 2;
      const marginOffset = idealOffset - currentOffset;
      next.style.marginTop = `${marginOffset}px`;
    }
  }

  // Tracé des lignes
  requestAnimationFrame(() => {
    svg.innerHTML = "";

    for (let r = 0; r < rounds.length - 1; r++) {
      const currentMatches = rounds[r].querySelectorAll(".match");
      const nextMatches = rounds[r + 1].querySelectorAll(".match");

      for (let i = 0; i < nextMatches.length; i++) {
        const m1 = currentMatches[i * 2];
        const m2 = currentMatches[i * 2 + 1];
        const next = nextMatches[i];
        if (!m1 || !m2 || !next) continue;

        const p1 = getCenter(m1, bracketRect);
        const p2 = getCenter(m2, bracketRect);
        const pNext = getCenter(next, bracketRect);

        drawCurve(p1.x + m1.offsetWidth, p1.y, pNext.x, pNext.y);
        drawCurve(p2.x + m2.offsetWidth, p2.y, pNext.x, pNext.y);
      }
    }
  });
}

function getCenter(elem, containerRect) {
  const rect = elem.getBoundingClientRect();
  return {
    x: rect.left - containerRect.left,
    y: rect.top - containerRect.top + rect.height / 2
  };
}

function drawCurve(x1, y1, x2, y2) {
  const svg = document.getElementById("lines");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const curveX = x1 + (x2 - x1) * 0.5;

  path.setAttribute("d", `M ${x1} ${y1} C ${curveX} ${y1}, ${curveX} ${y2}, ${x2} ${y2}`);
  path.setAttribute("stroke", "#aaa");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("fill", "none");

  svg.appendChild(path);
}
