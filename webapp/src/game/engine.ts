import { config } from "../config";

class Engine {
    // This class performs all the heavy lifting of the game
    // It can find the most likely movies based on a selection of emojis
    // It can also find emojis to best tell apart the likely movies 

    // Handles the 2D-array n_movies x n_emojis with scores for each emoji for each movie
    private cinemojis: Array<Array<number>> = [[]];

    private selected_emojis: number[] = [];
    private removed_movies: number[] = [];

    private movie_scores: number[] = [];

    async init() {
        await this.load_data();
    }

    async load_data() {
        const response3 = await fetch(config.cinemojiFile);
        const text3 = await response3.text();
        this.cinemojis = JSON.parse(text3);

        // Penalty: Convert all 0 to -1
        this.cinemojis = this.cinemojis.map(movie => 
            movie.map(score => 
                score === 0 ? config.wrongEmojiPenalty : score
        ));
    }

    start_new_game() {
        this.selected_emojis = [];
        this.removed_movies = [];
        this.movie_scores = Array(this.cinemojis.length).fill(0);
    }

    add_emoji(emojis: number) {
        this.selected_emojis.push(emojis);
        this.movie_scores = this.movie_scores.map(
            (score, i) => score + this.cinemojis[i][emojis]
        );
    }

    remove_movie(movie: number) {
        this.removed_movies.push(movie);
    }

    get_most_likely_movies(count: number = 0): number[] {
        // Sort the movies by their scores
        let sortedMovieIndices = this.movie_scores.map((score, i) => i).sort((a, b) => this.movie_scores[b] - this.movie_scores[a]);

        // Remove movies that have already been removed
        sortedMovieIndices = sortedMovieIndices.filter(index => !this.removed_movies.includes(index));
        
        // Select the top 'count' number of movies. If count is 0, return all movies.
        return sortedMovieIndices.slice(0, count || sortedMovieIndices.length);
    }

    get_movie_suggestion(): number[] {
        // Returns [max_ind, max_score] of non-removed movies
        const l_movies = this.get_most_likely_movies(100);
        // Remove movies that have already been removed
        const l_movies_filtered = l_movies.filter(index => !this.removed_movies.includes(index));

        const max_ind = l_movies_filtered[0];
        return [max_ind, this.movie_scores[max_ind]];
    }

    get_best_emojis(count: number = 0): number[] {
        if (this.selected_emojis.length === 0) {
            return this.get_random_emojis(count);
        };

        // Find the best emojis to tell apart the few most likely movies
        const l_movies = this.get_most_likely_movies(8);

        let selected: number[] = [];
        // Take the top emojis for each movie
        for (let i = 0; i < l_movies.length; i++) {
            const movie = l_movies[i];
            const emojis = this.cinemojis[movie];
            const sortedEmojiIndices = emojis.map((score, i) => i).sort((a, b) => emojis[b] - emojis[a]);

            let allowed = 1;
            if (i <= 1) {allowed = 2;}

            for (let j = 0; j < 10; j++) {
                const ind = sortedEmojiIndices[j];
                if (!selected.includes(ind) && !this.selected_emojis.includes(ind)) {
                    selected.push(ind);
                    allowed -= 1;

                    if (allowed <= 0) {
                        break;
                    }
                }
            }
        }
        // Add random emojis to fill up the list
        const random = this.get_random_emojis(count - selected.length, selected);

        selected = selected.concat(random);
        selected = shuffleArray(selected);
        return selected;
    }

    get_random_emojis(count: number, excluded: number[] = []): number[] {
        // Get random emojis that are not in the excluded list and not already selected, not repeating
        const available = this.cinemojis[0].map((_, i) => i).filter(i => !excluded.includes(i));
        let selected = available.filter(i => !this.selected_emojis.includes(i));
        // return shuffleArray(selected).slice(0, count);
        let result: number[] = [];
        while (result.length < count) {
            const sample = sampleBiased(selected);
            if (result.includes(sample)) {
                continue;
            }
            result.push(sample);
        }
        return result;
    }
}

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function sampleBiased<T>(array: T[], probability_factor: number = 0.2): T {
    // Sample the first element with probability of probability_factor and gradually decrease the probability
    // Sample the last element with a probability of 1
    if (array.length === 0) {
        throw new Error("Array is empty.");
    }

    if (probability_factor <= 0 || probability_factor > 1) {
        throw new Error("Probability factor must be between 0 (exclusive) and 1 (inclusive).");
    }

    const lastIndex = array.length - 1;
    const probabilities: number[] = [];

    for (let i = 0; i < array.length; i++) {
        const prob = probability_factor * (1 - (i / lastIndex));
        probabilities.push(prob);
    }

    let totalProb = probabilities.reduce((acc, val) => acc + val, 0);
    const random = Math.random() * totalProb;

    let accumulatedProb = 0;
    for (let i = 0; i < probabilities.length; i++) {
        accumulatedProb += probabilities[i];
        if (random <= accumulatedProb) {
            return array[i];
        }
    }

    return array[lastIndex]; // Fallback to the last element
}

export { Engine }