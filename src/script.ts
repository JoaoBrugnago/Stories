import Slide from "./Slide.js";

const container = document.getElementById('slide');
const elements = document.getElementById('slide-elements');
const controls = document.getElementById('slide-controls');

if (container && elements && elements.childNodes.length && controls) {
  new Slide(container, Array.from(elements.children), controls, 3000);
}