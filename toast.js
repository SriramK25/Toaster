export default class Toast {
  #toastHTML;
  #toastTriggerer;
  #toastPosition;
  #hasToastWrapper = false;
  #existedToastWrapper;
  #availableToastWrapperPositions = new Set([
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ]);
  #allToastType = new Set([
    "success",
    "error",
    "warning",
    "info",
    "promotion",
    "news",
  ]);
  #data = {
    heading: "Toast",
    message: "This is a default Toast message",
    duration: 4000,
    class: "",
    type: "info",
  };

  constructor(toastPosition, data, listener, eventType) {
    this.#toastPosition = this.#availableToastWrapperPositions.has(
      toastPosition
    )
      ? toastPosition
      : "bottom-right";

    this.#updateToastData(data);
    this.#toastListener(listener, eventType);
  }

  #createToastWrapper(target) {
    if (this.#hasToastWrapper) return this.#existedToastWrapper;

    this.#hasToastWrapper = true;

    const toastWrapperElement = `
    <div class="toast-wrapper custom-toast-wrapper" data-toaster-position=${
      this.#toastPosition
    }></div>
    `;
    const parent = document.querySelector(target);
    parent.insertAdjacentHTML("beforeend", toastWrapperElement);

    this.#existedToastWrapper = parent.querySelector(
      ".toast-wrapper.custom-toast-wrapper"
    );

    return this.#existedToastWrapper;
  }

  // Create HTML from the given Data
  #createToast(data) {
    this.#toastHTML = `
    <div id="${data?.id}" class="toast custom-toaster ${
      data?.class
    }" data-toast-state="closed" data-toast-type=${data?.type}>
      <div class="toast-header">
        <div class="toast-heading">${data?.heading ?? "Toast"}</div>
        <div class="toast-close">
          <svg
            width="16px"
            height="16px"
            viewBox="0 0 1024 1024"
            class="icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            stroke-width="30"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M176.662 817.173c-8.19 8.471-7.96 21.977 0.51 30.165 8.472 8.19 21.978 7.96 30.166-0.51l618.667-640c8.189-8.472 7.96-21.978-0.511-30.166-8.471-8.19-21.977-7.96-30.166 0.51l-618.666 640z"
                fill=""
              ></path>
              <path
                d="M795.328 846.827c8.19 8.471 21.695 8.7 30.166 0.511 8.471-8.188 8.7-21.694 0.511-30.165l-618.667-640c-8.188-8.471-21.694-8.7-30.165-0.511-8.471 8.188-8.7 21.694-0.511 30.165l618.666 640z"
                fill=""
              ></path>
            </g>
          </svg>
        </div>
      </div>
      ${
        data?.message
          ? `
        <div class="toast-message">
            <p class="toast-message-text">
                ${data.message}
            </p>
        </div>`
          : ""
      }

      <div class="toast-duration"></div>
    </div>
    `;
  }

  // Updates toasts Default data & Old data
  #updateToastData(data = null) {
    if (data && typeof data === "object" && Object.keys(data).length) {
      Object.entries(data).forEach(([key, value]) => (this.#data[key] = value));
    }
  }

  #toastPaintDecider(toastElement) {
    if (
      !this.#data.type ||
      !this.#allToastType.has(this.#data.type) ||
      !toastElement
    )
      return;

    toastElement.dataset.toastType = this.#data.type;
  }

  #startTimer(toastElement) {
    let timeId = setTimeout(() => {
      this.#hideToast(toastElement);
    }, this.#data.duration);

    // Store setTimeout Id in the element to stop timer later if necessary
    toastElement.dataset.timeId = timeId;
    toastElement.dataset.toastedOn = Date.now();
  }

  #toastListener(target = null, eventType = "click") {
    if (!target || typeof target !== "string") return;
    this.#toastTriggerer = document.querySelector(target);
    this.#toastTriggerer.addEventListener(eventType, () => this.render());
  }

  #hideToast(toastElement) {
    if (!toastElement) return;

    toastElement.dataset.toastState = "closed";
    toastElement.removeEventListener(
      "mouseover",
      toastElement._mouseOverHandler
    );
    toastElement.removeEventListener(
      "mouseleave",
      toastElement._mouseLeaveHandler
    );
    toastElement._mouseOverHandler = null;
    toastElement._mouseLeaveHandler = null;
    toastElement
      .querySelector(".toast-close")
      .removeEventListener("click", () => this.#hideToast(toastElement));

    setTimeout(() => this.#deleteToast(toastElement), 500);
  }

  #deleteToast(toastElement) {
    if (!toastElement) return;
    toastElement.remove();
  }

  #deleteOldestToast() {
    const totalToasts = this.#existedToastWrapper.querySelectorAll(
      ".toast.custom-toaster[data-toast-state = 'open']"
    );

    if (totalToasts && totalToasts?.length > 2) {
      this.#hideToast(totalToasts[0]);
    }
  }

  editToast(data) {
    this.#updateToastData(data);
    return this;
  }

  #enableInteraction(toastElement) {
    if (!toastElement) return;

    const mouseOverHandler = () => {
      if (toastElement.dataset.isToastPaused === "true") return;

      clearTimeout(toastElement.dataset.timeId);
      toastElement.lastElementChild.classList.add("pause-animation");
      toastElement.dataset.isToastPaused = "true";

      toastElement.dataset.toastDuration -=
        Date.now() - toastElement.dataset.toastedOn;
    };

    const mouseLeaveHandler = () => {
      let timeId = setTimeout(() => {
        this.#hideToast(toastElement);
      }, toastElement.dataset.toastDuration);

      toastElement.dataset.toastedOn = Date.now();
      toastElement.dataset.timeId = timeId;
      toastElement.dataset.isToastPaused = "false";
      toastElement.lastElementChild.classList.remove("pause-animation");
    };

    toastElement.addEventListener("mouseover", mouseOverHandler);
    toastElement.addEventListener("mouseleave", mouseLeaveHandler);

    toastElement
      .querySelector(".toast-close")
      .addEventListener("click", () => this.#hideToast(toastElement));

    toastElement._mouseOverHandler = mouseOverHandler;
    toastElement._mouseLeaveHandler = mouseLeaveHandler;
  }

  render(toastPosition, target = "body") {
    this.#data.id = `toast-${new Date().getTime()}`;

    const parentElement = this.#createToastWrapper(target);

    if (
      toastPosition &&
      this.#availableToastWrapperPositions.has(toastPosition)
    ) {
      parentElement.dataset.toasterPosition = toastPosition;
    }

    this.#createToast(this.#data);

    parentElement.insertAdjacentHTML("beforeend", this.#toastHTML);

    this.#deleteOldestToast();

    const toastElement = document.querySelector(`#${this.#data.id}`);

    if (!toastElement) return;

    setTimeout(() => {
      toastElement.dataset.toastState = "open";
    }, 100);

    toastElement.lastElementChild.style.animationDuration =
      this.#data.duration > 3000 ? `${this.#data.duration / 1000}s` : "3s";
    toastElement.dataset.toastDuration =
      this.#data.duration > 3000 ? this.#data.duration : 3000;
    toastElement.lastElementChild.classList.add("animate-width");

    this.#toastPaintDecider(toastElement);
    this.#startTimer(toastElement);
    this.#enableInteraction(toastElement);
  }
}
