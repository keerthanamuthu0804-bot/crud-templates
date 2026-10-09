import "./app.css";
import heroImg from "./assets/hero.png";
import viteLogo from "./assets/vite.svg";


let count = 0;

// Root HTML element
const app = document.querySelector("#app");

// Pure Vanilla HTML rendering
app.innerHTML = `
  <section id="center">
    <div class="hero">
      <img src="${heroImg}" class="base" width="170" height="179" alt="" />
      <img src="${viteLogo}" class="vite" alt="Vite logo" />
    </div>
    <div>
      <h1>Get started</h1>
      <p>Edit <code>src/main.js</code> and save to test HMR</p>
    </div>
    <button type="button" class="counter" id="counter-btn">
      Count is 0
    </button>
  </section>

  <div class="ticks"></div>

  <section id="next-steps">
    <div id="docs">
      <h2>Documentation</h2>
      <p>Your questions, answered</p>
      <ul>
        <li>
          <a href="https://vite.dev/" target="_blank">
            <img class="logo" src="${viteLogo}" alt="" />
            Explore Vite
          </a>
        </li>
      </ul>
    </div>
  </section>
`;


const btn = document.querySelector("#counter-btn");
btn.addEventListener("click", () => {
  count++;
  btn.textContent = `Count is ${count}`;
});
