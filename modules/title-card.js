export class SoulslikeTitleCard {
    static currentContainer = null;
    static hideTimeout = null;

    static debug(message, ...args) {
        const debugMode = game.settings?.get('soulslike-title-card', 'debugMode') ?? false;
        if (debugMode) {
            console.log(`Soulslike Title Card | DEBUG | ${message}`, ...args);
        }
    }

    static _getTimings(overrides = {}) {
        return {
            fadeIn: overrides.fadeIn ?? game.settings.get('soulslike-title-card', 'fadeInDuration') ?? 1000,
            hold: overrides.hold ?? game.settings.get('soulslike-title-card', 'holdDuration') ?? 3000,
            fadeOut: overrides.fadeOut ?? game.settings.get('soulslike-title-card', 'fadeOutDuration') ?? 1500
        };
    }

    static _stopCurrent() {
        if (this.currentContainer) {
            this.currentContainer.remove();
            this.currentContainer = null;
        }
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    static async show(title, { style, subtitle, fadeIn, hold, fadeOut, sound } = {}) {
        const effectiveStyle = style || game.settings.get('soulslike-title-card', 'defaultStyle') || 'dark-souls';
        const timings = this._getTimings({ fadeIn, hold, fadeOut });
        const soundEnabled = sound ?? game.settings.get('soulslike-title-card', 'soundEnabled') ?? false;

        this._stopCurrent();

        const container = document.createElement('div');
        container.id = 'soulslike-title-card';
        container.className = `stc-style-${effectiveStyle}`;

        container.innerHTML = `
            <div class="stc-backdrop"></div>
            <div class="stc-content">
                <div class="stc-title">${this._escapeHtml(title)}</div>
                ${subtitle ? `<div class="stc-subtitle">${this._escapeHtml(subtitle)}</div>` : ''}
            </div>
        `;

        document.body.appendChild(container);
        this.currentContainer = container;
        this.debug('Showing title card', { title, style: effectiveStyle, timings });

        container.style.setProperty('--stc-fade-in', `${timings.fadeIn}ms`);
        container.style.setProperty('--stc-hold', `${timings.hold}ms`);
        container.style.setProperty('--stc-fade-out', `${timings.fadeOut}ms`);

        requestAnimationFrame(() => {
            container.classList.add('stc-visible');

            this.hideTimeout = setTimeout(() => {
                container.classList.remove('stc-visible');
                container.classList.add('stc-hidden');

                setTimeout(() => {
                    container.remove();
                    if (this.currentContainer === container) {
                        this.currentContainer = null;
                    }
                    this.hideTimeout = null;
                }, timings.fadeOut);
            }, timings.fadeIn + timings.hold);
        });
    }

    static async hide({ style, fadeOut } = {}) {
        const timings = this._getTimings({ fadeOut });

        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        if (!this.currentContainer) return;

        const container = this.currentContainer;
        container.classList.remove('stc-visible');
        container.classList.add('stc-hidden');

        setTimeout(() => {
            container.remove();
            if (this.currentContainer === container) {
                this.currentContainer = null;
            }
        }, timings.fadeOut);

        this.debug('Hiding title card');
    }

    static _escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(String(str)));
        return div.innerHTML;
    }

    static async openTitleCardDialog() {
        const MODULE = 'soulslike-title-card';
        const scenes = game.scenes.map(s => `<option value="${s.id}" ${canvas?.scene?.id === s.id ? 'selected' : ''}>${this._escapeHtml(s.name)}</option>`).join('');
        const styles = ['dark-souls', 'elden-ring', 'sekiro', 'bloodborne', 'hollow-knight'];
        const styleOpts = styles.map(s => `<option value="${s}">${s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>`).join('');

        const content = `
            <form id="stc-dialog-form">
                <div class="stc-dialog-grid">
                    <div class="stc-field">
                        <label>${game.i18n.localize('SOULSLIKE.Dialog.Scene')}</label>
                        <select id="stc-scene">${scenes}</select>
                    </div>
                    <div class="stc-field">
                        <label>${game.i18n.localize('SOULSLIKE.Dialog.StyleIn')}</label>
                        <select id="stc-style">${styleOpts}</select>
                    </div>
                    <div class="stc-field">
                        <label>${game.i18n.localize('SOULSLIKE.Dialog.TitleIn')}</label>
                        <input type="text" id="stc-title-in" placeholder="${game.i18n.localize('SOULSLIKE.Dialog.TitleInPH')}">
                    </div>
                    <div class="stc-field">
                        <label>${game.i18n.localize('SOULSLIKE.Dialog.TitleOut')}</label>
                        <input type="text" id="stc-title-out" placeholder="${game.i18n.localize('SOULSLIKE.Dialog.TitleOutPH')}">
                    </div>
                    <div class="stc-field">
                        <label>${game.i18n.localize('SOULSLIKE.Dialog.SubtitleIn')}</label>
                        <input type="text" id="stc-subtitle-in" placeholder="${game.i18n.localize('SOULSLIKE.Dialog.SubtitleInPH')}">
                    </div>
                    <div class="stc-field">
                        <label>${game.i18n.localize('SOULSLIKE.Dialog.SubtitleOut')}</label>
                        <input type="text" id="stc-subtitle-out" placeholder="${game.i18n.localize('SOULSLIKE.Dialog.SubtitleOutPH')}">
                    </div>
                </div>
            </form>
        `;

        new Dialog({
            title: game.i18n.localize('SOULSLIKE.Dialog.Title'),
            content,
            buttons: {
                preview: {
                    icon: '<i class="fas fa-eye"></i>',
                    label: game.i18n.localize('SOULSLIKE.Dialog.Preview'),
                    callback: (html) => {
                        const form = html[0].querySelector('#stc-dialog-form');
                        const scene = game.scenes.get(form.querySelector('#stc-scene').value);
                        const titleIn = form.querySelector('#stc-title-in').value || scene?.name || '';
                        const subtitleIn = form.querySelector('#stc-subtitle-in').value || '';
                        const style = form.querySelector('#stc-style').value;
                        SoulslikeTitleCard.show(titleIn, { subtitle: subtitleIn, style });
                    }
                },
                save: {
                    icon: '<i class="fas fa-save"></i>',
                    label: game.i18n.localize('SOULSLIKE.Dialog.Save'),
                    callback: async (html) => {
                        const form = html[0].querySelector('#stc-dialog-form');
                        const sceneId = form.querySelector('#stc-scene').value;
                        const scene = game.scenes.get(sceneId);
                        if (!scene) return ui.notifications.warn(game.i18n.localize('SOULSLIKE.Dialog.NoScene'));

                        const style = form.querySelector('#stc-style').value;
                        const titleIn = form.querySelector('#stc-title-in').value;
                        const titleOut = form.querySelector('#stc-title-out').value;
                        const subtitleIn = form.querySelector('#stc-subtitle-in').value;
                        const subtitleOut = form.querySelector('#stc-subtitle-out').value;

                        const flags = {};
                        if (titleIn) flags.titleIn = titleIn;
                        if (titleOut) flags.titleOut = titleOut;
                        if (subtitleIn) flags.subtitle = subtitleIn;
                        if (subtitleOut) flags.subtitleOut = subtitleOut;
                        flags.style = style;

                        await scene.setFlag(MODULE, flags);
                        ui.notifications.info(game.i18n.format('SOULSLIKE.Dialog.Saved', { name: scene.name }));
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize('SOULSLIKE.Dialog.Cancel')
                }
            },
            default: 'preview',
            render: (html) => {
                const form = html[0].querySelector('#stc-dialog-form');
                const sceneSelect = form.querySelector('#stc-scene');
                const styleSelect = form.querySelector('#stc-style');

                const populate = () => {
                    const scene = game.scenes.get(sceneSelect.value);
                    if (!scene) return;
                    const flags = scene.flags?.[MODULE] || {};
                    form.querySelector('#stc-title-in').value = flags.titleIn || '';
                    form.querySelector('#stc-title-out').value = flags.titleOut || '';
                    form.querySelector('#stc-subtitle-in').value = flags.subtitle || '';
                    form.querySelector('#stc-subtitle-out').value = flags.subtitleOut || '';
                    if (flags.style) styleSelect.value = flags.style;
                };

                sceneSelect.addEventListener('change', populate);
                populate();
            }
        }, { width: 500, classes: ['dialog', 'stc-dialog'] }).render(true);
    }
}
