import Toast from "./toast.js";
import randomToastData from "./data.js";
import { generateRandomNumber } from "./utils.js";

const toaster = new Toast();
const button = document.querySelectorAll(".toast-button");

document.addEventListener("click", (event) => {
  if (!event.target.matches(".toast-button")) return;

  const targetElement = event.target;

  toaster
    .editToast(randomToastData[generateRandomNumber(50)])
    .render(targetElement.dataset.position);
});

// setInterval(() => {
//   toaster.editToast(randomToastData[generateRandomNumber(20)]).render();
// }, 2000);
