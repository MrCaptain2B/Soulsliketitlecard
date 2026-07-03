import { SoulslikeTitleCard } from './title-card.js';

export function registerAPI() {
    game.modules.get('soulslike-title-card').api = {
        show: SoulslikeTitleCard.show.bind(SoulslikeTitleCard),
        hide: SoulslikeTitleCard.hide.bind(SoulslikeTitleCard)
    };
}
