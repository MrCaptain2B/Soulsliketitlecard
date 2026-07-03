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
    _injectSidebarButton();
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

function _injectSidebarButton() {
    try {
        if (document.getElementById('stc-config-btn')) return;

        const menuEl =
            document.querySelector('#sidebar-controls') ||
            document.querySelector('#sidebar menu.sidebar-controls') ||
            document.querySelector('#sidebar menu.flexcol');
        if (!menuEl) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'stc-config-btn';
        btn.className = 'stc-config-btn ui-control plain icon fas fa-signature';
        btn.setAttribute('data-tooltip', game.i18n.localize('SOULSLIKE.Dialog.ButtonTitle') || 'Soulslike Title Card');
        btn.setAttribute('aria-label', game.i18n.localize('SOULSLIKE.Dialog.ButtonTitle') || 'Soulslike Title Card');
        btn.title = game.i18n.localize('SOULSLIKE.Dialog.ButtonTitle') || 'Soulslike Title Card';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            SoulslikeTitleCard.openTitleCardDialog();
        });

        menuEl.prepend(btn);
        debug('Sidebar button injected');
    } catch (err) {
        console.warn('Soulslike Title Card | Could not inject sidebar button:', err);
    }
}

Hooks.on('renderSidebar', () => _injectSidebarButton());
Hooks.on('renderSidebarTab', () => _injectSidebarButton());
Hooks.on('getSceneControlButtons', (controls) => {
    const isV14 = !foundry.utils.isNewerVersion('14.0.0', game.version);
    const tokenControl = isV14 ? controls.tokens : controls.find(c => c.name === 'token');
    if (!tokenControl?.tools) return;

    const tool = {
        name: 'soulslike-title',
        title: game.i18n.localize('SOULSLIKE.Dialog.ButtonTitle') || 'Soulslike Title Card',
        icon: 'fas fa-signature',
        onClick: () => SoulslikeTitleCard.openTitleCardDialog(),
        button: true
    };

    if (isV14) {
        tokenControl.tools['soulslike-title'] = tool;
    } else {
        if (!tokenControl.tools.some(t => t.name === 'soulslike-title')) {
            tokenControl.tools.push(tool);
        }
    }
});
