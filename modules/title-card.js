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
}
