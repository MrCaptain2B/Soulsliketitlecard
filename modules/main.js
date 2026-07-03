import { SoulslikeTitleCard } from './title-card.js';
import { registerSettings } from './settings.js';
import { registerAPI } from './api.js';

const MODULE = 'soulslike-title-card';
let _previousSceneId = null;

function debug(message, ...args) {
    const debugMode = game.settings?.get(MODULE, 'debugMode') ?? false;
    if (debugMode) {
        console.log(`Soulslike Title Card | DEBUG | ${message}`, ...args);
    }
}

Hooks.once('init', () => {
    console.log('Soulslike Title Card | Initializing');
    registerSettings();
    registerAPI();
});

Hooks.once('ready', () => {
    console.log('Soulslike Title Card | Ready');
    _previousSceneId = game.scenes?.current?.id || null;
});

Hooks.on('canvasReady', () => {
    const autoShow = game.settings.get(MODULE, 'autoShowOnSceneChange');
    if (!autoShow) return;

    const scene = canvas?.scene;
    if (!scene) return;

    const showExit = game.settings.get(MODULE, 'showExitOnLeave');

    if (showExit && _previousSceneId && _previousSceneId !== scene.id) {
        const prevScene = game.scenes.get(_previousSceneId);
        if (prevScene) {
            const exitTitle = prevScene.flags?.[MODULE]?.titleOut || prevScene.name;
            const exitSubtitle = prevScene.flags?.[MODULE]?.subtitleOut || '';
            const exitStyle = prevScene.flags?.[MODULE]?.style || null;
            if (exitTitle) {
                debug('Auto-showing exit title card', { title: exitTitle, subtitle: exitSubtitle, style: exitStyle });
                SoulslikeTitleCard.show(exitTitle, { subtitle: exitSubtitle, style: exitStyle });
            }
        }
    }

    _previousSceneId = scene.id;

    const title = scene.flags?.[MODULE]?.titleIn || scene.name;
    const subtitle = scene.flags?.[MODULE]?.subtitle || '';
    const style = scene.flags?.[MODULE]?.style || null;

    if (title) {
        debug('Auto-showing title card for scene', { title, subtitle, style });
        SoulslikeTitleCard.show(title, { subtitle, style });
    }
});

Hooks.on('getSceneControlButtons', (controls) => {
    controls.push({
        name: 'soulslike-title',
        title: game.i18n.localize('SOULSLIKE.Dialog.ButtonTitle') || 'Soulslike Title Card',
        icon: 'fas fa-signature',
        layer: 'SoulslikeTitle',
        tools: [{
            name: 'stc-config',
            title: game.i18n.localize('SOULSLIKE.Dialog.ButtonTitle') || 'Soulslike Title Card',
            icon: 'fas fa-signature',
            onClick: () => SoulslikeTitleCard.openTitleCardDialog(),
            button: true
        }]
    });
});


