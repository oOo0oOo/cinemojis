import { config } from "../config";
import { EmojiBtn } from "./emoji_btn";
import { Engine } from "./engine";
import { MovieSuggestionPopup } from "./suggestion";

class Game {
    private history_container: HTMLDivElement;
    private question_container: HTMLDivElement;
    private start_container: HTMLDivElement;
    private title: HTMLDivElement;
    private reroll_btn: HTMLButtonElement;

    private movies: any[] = [];
    private emojis: string[] = [];
    private emoji_btns: EmojiBtn[] = [];
    private current_questions: number[] = [];
    private first_click = false;
    private engine = new Engine();
    private suggestion_popup = new MovieSuggestionPopup();
    private movie_pick: number[] = [-1, 0];

    constructor() {
        this.history_container = document.getElementById("history_container") as HTMLDivElement;
        this.question_container = document.getElementById("question_container") as HTMLDivElement;
        this.start_container = document.getElementById("start_container") as HTMLDivElement;
        this.title = document.getElementById("title") as HTMLDivElement;
        this.reroll_btn = document.getElementById("reroll_btn") as HTMLButtonElement;

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
        this.first_click = false;
        this.title.innerHTML = 'Think of a <span class="title-emoji">&#127916;</span>';

        // Reset emoji buttons
        this.reset_emoji_questions();
    }

    reset_emoji_questions(suggest_movie: boolean = true, force_random: boolean = false) {
        this.current_questions = [];
        if (this.first_click && suggest_movie) {
            // Find most likely movies
            this.movie_pick = this.engine.get_movie_suggestion();

            if (this.movie_pick[1] > config.movieSuggestionThreshold) {
                // Display movie suggestion
                this.suggestion_popup.show(this.movies[this.movie_pick[0]]);
            }
        }
        let emojis;
        if (force_random) {
            emojis = this.engine.get_random_emojis(16);
        } else {
            emojis = this.engine.get_best_emojis(16);
        }
        emojis.forEach((emoji_index, i) => {
            this.current_questions.push(emoji_index);
            this.emoji_btns[i].set_emoji(this.emojis[emoji_index]);
        });
    }

    on_click_emoji(index: number) {
        if (!this.first_click) {
            this.first_click = true;
            this.start_container.style.display = "none";
            this.title.innerHTML = 'A <span class="title-emoji">&#127916;</span> about';
        }

        // Add emoji to selected emojis
        this.engine.add_emoji(this.current_questions[index]);
        this.history_container.innerHTML += this.emojis[this.current_questions[index]];
        this.reset_emoji_questions();
    }
}

export { Game };
