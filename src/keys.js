/* Keys.js v1.0.0 by iDev Games */
class Keys
{
    keysElements = [];
    activeKeys = new Set();
    keyPressCount = new Map();
    keyTimestamps = new Map();
    keyPressTimes = new Map();
    keysAttributesCache = new Map();
    lastKeyTime = 0;
    typingTimeout = null;
    comboTimeout = null;
    comboSequence = [];
    preventDefaultKeys = new Set(); 
    COMBO_WINDOW = 1000;
    TYPING_IDLE_DELAY = 1000;

    constructor() {
        this.keysInit = this.keysInit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.updateElements = this.updateElements.bind(this);
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.keysInit);
        } else {
            this.keysInit();
        }
    }

    keysInit() {
        this.keysElements = document.querySelectorAll('body,.enable-keys,[data-keys]');
        if (document.body) {
            document.body.classList.add('keys-idle');
            const preventDefaults = document.body.getAttribute('data-keys-prevent-defaults');
            if (preventDefaults) {
                const keys = preventDefaults.split(',').map(k => k.trim());
                keys.forEach(key => this.preventDefaultKeys.add(key === '*' ? '*' : this.normalizeKey(key)));
            }
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', this.handleKeyDown, { passive: false });
        window.addEventListener('keyup', this.handleKeyUp, { passive: false });
        window.addEventListener('keypress', this.handleKeyPress, { passive: true });
        window.addEventListener('beforeunload', () => {
            this.activeKeys.clear();
            this.keyTimestamps.clear();
            this.keyPressTimes.clear();
        });
    }

    handleKeyDown(event) {
        const key = this.normalizeKey(event.key);
        const shouldPreventDefault = this.shouldPreventDefault(key);
        if (shouldPreventDefault) {
            event.preventDefault();
        }
        const isRepeat = this.activeKeys.has(key);
        const now = performance.now();
        if (!isRepeat) {
            this.activeKeys.add(key);
            this.keyTimestamps.set(key, now);
            this.keyPressTimes.set(key, now);
            this.keyPressCount.set(key, (this.keyPressCount.get(key) || 0) + 1);
            this.comboSequence.push(key);
            this.resetComboTimeout();
        } else {
            this.keyTimestamps.set(key, now);
        }
        this.setTypingState();
        this.updateElements();
    }

    handleKeyUp(event) {
        const key = this.normalizeKey(event.key);
        const shouldPreventDefault = this.shouldPreventDefault(key);
        if (shouldPreventDefault) {
            event.preventDefault();
        }
        this.activeKeys.delete(key);
        this.keyTimestamps.delete(key);
        this.keyPressTimes.delete(key);
        this.updateElements();
        this.setTypingState();
    }

    handleKeyPress(event) {
        this.lastKeyTime = performance.now();
        this.setTypingState();
    }

    normalizeKey(key) {
        const keyMap = {
            ' ': 'space',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'Control': 'ctrl',
            'Meta': 'meta',
            'Shift': 'shift',
            'Alt': 'alt',
            'Enter': 'enter',
            'Escape': 'esc',
            'Backspace': 'backspace',
            'Tab': 'tab'
        };

        return (keyMap[key] || key).toLowerCase();
    }

    setTypingState() {
        if (!document.body) return;

        clearTimeout(this.typingTimeout);

        if (this.activeKeys.size > 0) {
            document.body.classList.remove('keys-idle');
            document.body.classList.add('keys-typing');
        }

        this.typingTimeout = setTimeout(() => {
            if (!document.body) return;
            document.body.classList.remove('keys-typing');
            document.body.classList.add('keys-idle');
        }, this.TYPING_IDLE_DELAY);
    }

    resetComboTimeout() {
        clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => {
            this.comboSequence = [];
        }, this.COMBO_WINDOW);
    }

    shouldPreventDefault(key) {
        if (this.preventDefaultKeys.has('*') || this.preventDefaultKeys.has(key)) {
            return true;
        }
        for (const element of this.keysElements) {
            const preventAttr = element.getAttribute('data-keys-prevent');
            if (preventAttr) {
                const preventKeys = preventAttr.split(',').map(k => k.trim());
                if (preventKeys.includes('*') || preventKeys.includes(key)) {
                    return true;
                }
            }
        }

        return false;
    }

    updateElements() {
        requestAnimationFrame(() => {
            this.keysElements.forEach((element) => {
                this.updateElement(element);
            });
        });
    }

    updateElement(element) {
        const watchKeys = this.getWatchKeys(element);
        const isGlobal = element.dataset.keysGlobal === "true";
        const styleTarget = isGlobal ? document.documentElement.style : element.style;
        const idSuffix = isGlobal && element.id ? `-${element.id}` : "";
        const activeCount = this.activeKeys.size;
        styleTarget.setProperty(`--keys-active${idSuffix}`, activeCount);
        if (element === document.body) {
            this.updateBodyClasses();
            return;
        }
        this.updateElementClasses(element, watchKeys);
        if (element.dataset.keysVar === "true") {
            this.updateKeyVariables(element, watchKeys, styleTarget, idSuffix);
        }
        if (element.dataset.keysCombo) {
            this.checkCombo(element);
        }
    }

    getWatchKeys(element) {
        let cached = this.keysAttributesCache.get(element);
        if (!cached) {
            const watchAttr = element.getAttribute("data-keys-watch");
            cached = {
                watchKeys: watchAttr ? watchAttr.split(',').map(k => k.trim()) : null
            };
            this.keysAttributesCache.set(element, cached);
        }
        return cached.watchKeys;
    }

    updateElementClasses(element, watchKeys) {
        const keysToCheck = watchKeys || Array.from(this.activeKeys);
        if (this.activeKeys.size > 0) {
            element.classList.add('keys-active');
        } else {
            element.classList.remove('keys-active');
        }
        keysToCheck.forEach(key => {
            const className = `key-${key}`;
            if (this.activeKeys.has(key)) {
                if (!element.classList.contains(className)) {
                    element.classList.add(className);
                }
            } else {
                element.classList.remove(className);
            }
        });
    }

    updateKeyVariables(element, watchKeys, styleTarget, idSuffix) {
        const keysToUpdate = watchKeys || Array.from(this.activeKeys);
        const now = performance.now();
        keysToUpdate.forEach(key => {
            const isPressed = this.activeKeys.has(key) ? 1 : 0;
            const pressCount = this.keyPressCount.get(key) || 0;
            const pressTime = this.keyPressTimes.get(key);
            const duration = pressTime ? Math.floor(now - pressTime) : 0;
            styleTarget.setProperty(`--key-${key}${idSuffix}`, isPressed);
            styleTarget.setProperty(`--key-${key}-count${idSuffix}`, pressCount);
            styleTarget.setProperty(`--key-${key}-duration${idSuffix}`, `${duration}ms`);
            const normalizedDuration = Math.min(duration / 1000, 1);
            styleTarget.setProperty(`--key-${key}-hold${idSuffix}`, normalizedDuration.toFixed(2));
            if (element.dataset[`key${key.charAt(0).toUpperCase() + key.slice(1)}`] !== undefined) {
                element.dataset[`key${key.charAt(0).toUpperCase() + key.slice(1)}`] = isPressed;
            }
        });
        ['shift', 'ctrl', 'alt', 'meta'].forEach(modifier => {
            const isActive = this.activeKeys.has(modifier) ? 1 : 0;
            styleTarget.setProperty(`--key-${modifier}${idSuffix}`, isActive);
        });
    }

    updateBodyClasses() {
        const count = this.activeKeys.size;

        [1, 2, 3, 5, 10].forEach(breakpoint => {
            const className = `keys-count-${breakpoint}`;
            if (count >= breakpoint) {
                document.body.classList.add(className);
            } else {
                document.body.classList.remove(className);
            }
        });
        const allPossibleKeys = ['up', 'down', 'left', 'right', 'space', 'enter', 'shift', 'ctrl', 'alt', 'meta', 'esc'];
        allPossibleKeys.forEach(key => {
            const className = `key-${key}`;
            if (this.activeKeys.has(key)) {
                document.body.classList.add(className);
            } else {
                document.body.classList.remove(className);
            }
        });
    }

    checkCombo(element) {
        const comboString = element.dataset.keysCombo;
        const comboParts = comboString.split('+').map(k => k.trim());
        const comboActive = comboParts.every(key => this.activeKeys.has(key));

        if (comboActive) {
            element.classList.add('keys-combo-active');
            element.dispatchEvent(new CustomEvent('keyscombo', { detail: { combo: comboString } }));
        } else {
            element.classList.remove('keys-combo-active');
        }
    }

    isKeyActive(key) {
        return this.activeKeys.has(this.normalizeKey(key));
    }

    isKeyDown(key) {
        return this.isKeyActive(key);
    }

    getActiveKeys() {
        return Array.from(this.activeKeys);
    }

    getKeyPressCount(key) {
        return this.keyPressCount.get(this.normalizeKey(key)) || 0;
    }

    getKeyHoldDuration(key) {
        const normalizedKey = this.normalizeKey(key);
        const pressTime = this.keyPressTimes.get(normalizedKey);
        return pressTime ? Math.floor(performance.now() - pressTime) : 0;
    }

    resetKeyPressCount(key = null) {
        if (key) {
            this.keyPressCount.delete(this.normalizeKey(key));
        } else {
            this.keyPressCount.clear();
        }
    }

    getComboSequence() {
        return [...this.comboSequence];
    }

    isComboActive(...keys) {
        return keys.every(key => this.isKeyActive(key));
    }

    getAxis(negativeKey, positiveKey) {
        const negative = this.isKeyActive(negativeKey) ? -1 : 0;
        const positive = this.isKeyActive(positiveKey) ? 1 : 0;
        return negative + positive;
    }

    getVector2D(upKey = 'up', downKey = 'down', leftKey = 'left', rightKey = 'right') {
        return {
            x: this.getAxis(leftKey, rightKey),
            y: this.getAxis(downKey, upKey)
        };
    }

    getWASDVector() {
        return this.getVector2D('w', 's', 'a', 'd');
    }

    getArrowVector() {
        return this.getVector2D('up', 'down', 'left', 'right');
    }

    preventDefaults(...keys) {
        keys.forEach(key => {
            this.preventDefaultKeys.add(key === '*' ? '*' : this.normalizeKey(key));
        });
    }

    allowDefaults(...keys) {
        keys.forEach(key => {
            this.preventDefaultKeys.delete(key === '*' ? '*' : this.normalizeKey(key));
        });
    }

    clearAllKeys() {
        this.activeKeys.clear();
        this.keyTimestamps.clear();
        this.keyPressTimes.clear();
        this.updateElements();
    }
}
window.keys = new Keys();