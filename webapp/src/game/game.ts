import { config } from "../config";
import { EmojiBtn } from "./emoji_btn";
import { Engine } from "./engine";
import { MovieSuggestionPopup } from "./suggestion";
import { UnknownMoviePopup } from "./unknown_movie";

class Game {
    private history_container: HTMLDivElement;
    private question_container: HTMLDivElement;
    private start_container: HTMLDivElement;
    private title: HTMLDivElement;
    private reroll_btn: HTMLButtonElement;
    private search_input: HTMLInputElement;

    private movies: any[] = [];
    private emojis: string[] = [];
    private emoji_btns: EmojiBtn[] = [];
    private current_questions: number[] = [];
    private did_first_click = false;
    private engine = new Engine();
    private suggestion_popup = new MovieSuggestionPopup();
    private movie_pick: number[] = [-1, 0];
    private unknown_movie_popup = new UnknownMoviePopup();

    constructor() {
        this.history_container = document.getElementById("history_container") as HTMLDivElement;
        this.question_container = document.getElementById("question_container") as HTMLDivElement;
        this.start_container = document.getElementById("start_container") as HTMLDivElement;
        this.title = document.getElementById("title") as HTMLDivElement;
        this.reroll_btn = document.getElementById("reroll_btn") as HTMLButtonElement;
        this.search_input = document.getElementById("search_input") as HTMLInputElement;

        // Add click event listener to reroll button
        this.reroll_btn.addEventListener("click", this.reset_emoji_questions.bind(this, false, true));

        // Create emoji buttons in question container
        for (let i = 0; i < config.questionCount; i++) {
            const btn = new EmojiBtn();
            this.question_container.appendChild(btn.get_container());
            this.emoji_btns.push(btn);

            // Add click event listener
            btn.get_container().addEventListener("click", this.on_click_emoji.bind(this, i));
        };
        
        // Add click event listener to suggestion popup yes and no buttons
        this.suggestion_popup.get_yes_btn().addEventListener("click", this.suggestion_answer.bind(this, true));
        this.suggestion_popup.get_no_btn().addEventListener("click", this.suggestion_answer.bind(this, false));
    
        // Add click event listener to unknown movie popup close button
        this.unknown_movie_popup.close_btn.addEventListener("click", this.start_new_game.bind(this));

        // Add keyup event listener to search input
        this.search_input.addEventListener("keyup", this.search_changed.bind(this));
    }

    suggestion_answer(answer: boolean) {
        if (answer) {
            // YOU WIN, restart the game
            this.start_new_game();
            return;
        }

        // Remove movie from engine
        this.engine.remove_movie(this.movie_pick[0]);

        // Reset emoji questions
        this.reset_emoji_questions(false);
    }

    search_changed() {
        const search = this.search_input.value.toLowerCase();
        this.current_questions = [];
        const candidates = this.engine.text_search_emojis(search);
        candidates.forEach((emoji_index, i) => {
            this.current_questions.push(emoji_index);
            this.emoji_btns[i].set_emoji(this.emojis[emoji_index]);
        });

        // Hide the other emojis
        for (let i = candidates.length; i < config.questionCount; i++) {
            this.emoji_btns[i].hide();
        }
    }

    async init() {
        await this.engine.init();
        await this.load_data();
        this.start_new_game();
    }

    async load_data() {
        const response = await fetch(config.movieFile);
        const text = await response.text();

        // Parse csv
        const lines = text.split("\n");
        lines.shift(); // Remove header and last empty line
        lines.pop();
        this.movies = lines.map(line => {
            const [imdb, title, year] = line.split(",");
            return { imdb, title, year };
        });

        // Load emojis (split by character)
        const response2 = await fetch(config.emojiFile);
        const text2 = await response2.text();
        this.emojis = text2.split("\n");
    }

    start_new_game() {
        this.engine.start_new_game();
        this.start_container.style.display = "block";
        this.history_container.innerHTML = "";
        this.did_first_click = false;
        this.title.innerHTML = 'Think of a <span class="title-emoji">&#127916;</span>';

        // Reset emoji buttons
        this.reset_emoji_questions();

        // Hide unknown movie popup
        this.unknown_movie_popup.close();
    }

    reset_emoji_questions(suggest_movie: boolean = true, force_random: boolean = false) {
        this.current_questions = [];
        if (this.did_first_click && suggest_movie) {
            const num = this.engine.get_emoji_count();
            if (num > config.hardMaxEmojis) {
                // Display unknown movie popup
                this.unknown_movie_popup.show();
                return;
            }

            // Find most likely movies
            this.movie_pick = this.engine.get_movie_suggestion();

            if (this.movie_pick[1] > config.movieSuggestionThreshold) {
                // Display movie suggestion
                this.suggestion_popup.show(this.movies[this.movie_pick[0]]);
            } else {

                if (num > config.maxEmojis) {
                    // Display unknown movie popup
                    this.unknown_movie_popup.show();
                    return;
                }
            }
        }

        let emojis;
        if (force_random) {
            if (this.search_input.value.length > 0) {
                this.search_changed();
                return;
            } else {
                emojis = this.engine.get_random_emojis(16);
            }
        } else {
            emojis = this.engine.get_best_emojis(16);
        }
        emojis.forEach((emoji_index, i) => {
            this.current_questions.push(emoji_index);
            this.emoji_btns[i].set_emoji(this.emojis[emoji_index]);
        });
    }

    on_click_emoji(index: number) {
        if (!this.did_first_click) {
            this.did_first_click = true;
            this.start_container.style.display = "none";
            this.title.innerHTML = 'A <span class="title-emoji">&#127916;</span> about';
        }

        // Add emoji to selected emojis
        this.engine.add_emoji(this.current_questions[index]);
        this.history_container.innerHTML += this.emojis[this.current_questions[index]] + " ";
        this.reset_emoji_questions();

        // Reset the search input
        this.search_input.value = "";
    }
}

export { Game };
