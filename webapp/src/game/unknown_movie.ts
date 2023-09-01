class UnknownMoviePopup {
  private container: HTMLDivElement;
  private title: HTMLDivElement; 
  private overlay: HTMLDivElement;
  public close_btn: HTMLButtonElement;

  constructor() {
    // Create popup wrapper element
    const wrapper = document.createElement("div");
    wrapper.classList.add("popup-wrapper");

    // Create popup container
    this.container = document.createElement("div");
    this.container.classList.add("popup");

    // Display text 
    this.title = document.createElement("h3");
    this.title.classList.add("popup-title");
    this.title.innerText = "I don't think I know this movie...";
    this.container.appendChild(this.title);

    // Add a btn to close the popup
    this.close_btn = document.createElement("button");
    this.close_btn.classList.add("emoji-btn");
    this.close_btn.textContent = "😅";
    this.container.appendChild(this.close_btn);

    // Create overlay
    this.overlay = document.createElement("div");
    this.overlay.classList.add("popup-overlay");
    wrapper.appendChild(this.container);
    this.overlay.appendChild(wrapper);
    document.body.appendChild(this.overlay);
  }

  show() {
    this.overlay.style.display = "block";
  }

  close() {
    this.overlay.style.display = "none";
  }
}

export { UnknownMoviePopup };