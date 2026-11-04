// Galactic Conquest: a Cookie Clicker-style incremental game.
// Recruit soldiers by clicking, grow your war machine, conquer the galaxy.

const app = document.querySelector<HTMLElement>("#app")!;

// The single source of truth for the game. The display always reads from
// here, so state and screen can never disagree.
const state = {
  soldiers: 0,
};

const title = document.createElement("h1");
title.textContent = "Galactic Conquest";

const counter = document.createElement("p");
counter.textContent = `Soldiers: ${state.soldiers}`;

const recruit = document.createElement("button");
recruit.textContent = "Recruit Soldier";
recruit.addEventListener("click", () => {
  state.soldiers += 1;
  counter.textContent = `Soldiers: ${state.soldiers}`;
});

app.append(title, counter, recruit);
