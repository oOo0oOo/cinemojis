class MovieSuggestionPopup {
  private container: HTMLDivElement;
  private title: HTMLHeadingElement; 
  private image: HTMLImageElement;
  private yes_btn: HTMLButtonElement;
  private no_btn: HTMLButtonElement;
  private overlay: HTMLDivElement;

  constructor() {
    // Create popup wrapper element
    const wrapper = document.createElement("div");
    wrapper.classList.add("popup-wrapper");

    // Create popup container
    this.container = document.createElement("div");
    this.container.classList.add("popup");

    // Create image element
    this.image = document.createElement("img");
    this.image.classList.add("popup-image");
    this.container.appendChild(this.image);

    // Create title element
    this.title = document.createElement("h3");
    this.title.classList.add("popup-title");
    this.container.appendChild(this.title);

    // Create yes and no button
    this.yes_btn = document.createElement("button");
    this.yes_btn.classList.add("popup-btn-yes");
    this.yes_btn.textContent = "Yes";
    this.yes_btn.addEventListener("click", this.close.bind(this));
    this.container.appendChild(this.yes_btn);

    this.no_btn = document.createElement("button");
    this.no_btn.classList.add("popup-btn-no");
    this.no_btn.textContent = "No";
    this.no_btn.addEventListener("click", this.close.bind(this));
    this.container.appendChild(this.no_btn);


    // Create overlay
    this.overlay = document.createElement("div");
    this.overlay.classList.add("popup-overlay");

    wrapper.appendChild(this.container);
    this.overlay.appendChild(wrapper);
    
    // Add popup to the DOM
    document.body.appendChild(this.overlay);
  }

  show(movie: { imdb: string, title: string, year: string }) {
    // Set title and message content
    this.title.textContent = movie.title + " (" + movie.year + ")";
    this.image.src = "static/covers/" + movie.imdb + ".jpg";

    // Show popup and overlay
    this.overlay.style.display = "block";
  }

    get_yes_btn() {
        return this.yes_btn;
    }

    get_no_btn() {
        return this.no_btn;
    }

  close() {
    // Hide popup and overlay
    this.overlay.style.display = "none";
  }
}

export { MovieSuggestionPopup };