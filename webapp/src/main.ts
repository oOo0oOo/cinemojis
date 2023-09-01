
import { Game } from "./game/game";

async function main() {
    const game = new Game();
    await game.init();
}

main();