export function registerSettings() {
    const MODULE = 'soulslike-title-card';

    game.settings.register(MODULE, 'autoShowOnSceneChange', {
        name: game.i18n.localize('SOULSLIKE.Settings.AutoShow'),
        hint: game.i18n.localize('SOULSLIKE.Settings.AutoShowHint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE, 'defaultStyle', {
        name: game.i18n.localize('SOULSLIKE.Settings.DefaultStyle'),
        hint: game.i18n.localize('SOULSLIKE.Settings.DefaultStyleHint'),
        scope: 'world',
        config: true,
        type: String,
        choices: {
            'dark-souls': 'Dark Souls',
            'elden-ring': 'Elden Ring',
            'sekiro': 'Sekiro',
            'bloodborne': 'Bloodborne',
            'hollow-knight': 'Hollow Knight'
        },
        default: 'dark-souls'
    });

    game.settings.register(MODULE, 'fadeInDuration', {
        name: game.i18n.localize('SOULSLIKE.Settings.FadeIn'),
        hint: game.i18n.localize('SOULSLIKE.Settings.FadeInHint'),
        scope: 'world',
        config: true,
        type: Number,
        range: { min: 200, max: 3000, step: 100 },
        default: 1000
    });

    game.settings.register(MODULE, 'holdDuration', {
        name: game.i18n.localize('SOULSLIKE.Settings.Hold'),
        hint: game.i18n.localize('SOULSLIKE.Settings.HoldHint'),
        scope: 'world',
        config: true,
        type: Number,
        range: { min: 500, max: 10000, step: 500 },
        default: 3000
    });

    game.settings.register(MODULE, 'fadeOutDuration', {
        name: game.i18n.localize('SOULSLIKE.Settings.FadeOut'),
        hint: game.i18n.localize('SOULSLIKE.Settings.FadeOutHint'),
        scope: 'world',
        config: true,
        type: Number,
        range: { min: 200, max: 3000, step: 100 },
        default: 1500
    });

    game.settings.register(MODULE, 'showExitOnLeave', {
        name: game.i18n.localize('SOULSLIKE.Settings.ShowExit'),
        hint: game.i18n.localize('SOULSLIKE.Settings.ShowExitHint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE, 'soundEnabled', {
        name: game.i18n.localize('SOULSLIKE.Settings.SoundEnabled'),
        hint: game.i18n.localize('SOULSLIKE.Settings.SoundEnabledHint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE, 'debugMode', {
        name: game.i18n.localize('SOULSLIKE.Settings.Debug'),
        hint: game.i18n.localize('SOULSLIKE.Settings.DebugHint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
}
