<p align="center">
  <img src="https://github.com/iDev-Games/Keys-JS/blob/master/logo.png">
</p>

[![iDev-Games - Keys-JS](https://img.shields.io/static/v1?label=iDev-Games&message=Keys-JS&color=blue&logo=github)](https://github.com/iDev-Games/Keys-JS "Go to GitHub repo")
[![stars - Keys-JS](https://img.shields.io/github/stars/iDev-Games/Keys-JS?style=social)](https://github.com/iDev-Games/Keys-JS)

[![Stargazers repo roster for @iDev-Games/Keys-JS](https://reporoster.com/stars/iDev-Games/Keys-JS)](https://github.com/iDev-Games/Keys-JS/stargazers)

[![GitHub tag](https://img.shields.io/github/tag/iDev-Games/Keys-JS?include_prereleases=&sort=semver&color=blue)](https://github.com/iDev-Games/Keys-JS/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

Keys.js powers dynamic, CSS-driven keyboard-reactive effects using CSS variables and key press data, making interactive keyboard experiences effortless. Create custom animations in CSS or use keys-animations.css for ready-made effects—full control or quick setup. **Perfect for gaming, interactive applications, and keyboard-driven UIs.**

<p align="center">
  <img src="https://github.com/iDev-Games/Keys-JS/raw/master/creative.gif">
</p>

See it in action here: https://idev-games.github.io/Keys-JS/

Keys-Animations.css documentation can be found here: https://idev-games.github.io/Keys-JS/animations.html

# Installation

**Download from Github** or install with NPM:

```bash
npm i @idevgames/keys-js
```

**Use Keys.js from a CDN:**
```html
<script src="https://cdn.jsdelivr.net/npm/@idevgames/keys-js/src/keys.min.js"></script>
```

# What is Keys.js?

Keys.js is a super simple, efficient and lightweight way of exposing keyboard input to CSS variables. You can use Keys.js to create keyboard-reactive animations, game controls, shortcuts, and interactive experiences **entirely in CSS**.

Using nothing but the power of CSS, HTML and Keys.js, you can make keyboard-driven games, interactive demos, and reactive UIs. Keys.js is really lightweight and created with vanilla JavaScript with **zero dependencies**.

Keys.js is designed to work seamlessly with other iDev animation libraries:
- **[Motion.js](https://github.com/iDev-Games/Motion-JS)** - Time-based animations
- **[Trig.js](https://github.com/iDev-Games/Trig-JS)** - Scroll-based animations
- **[Cursor.js](https://github.com/iDev-Games/Cursor-JS)** - Mouse position tracking

Together, they form a complete **CSS-native animation ecosystem** for modern web development and gaming.

---

# Quick Start

Add Keys.js to your HTML:

```html
<script src="keys.js"></script>
```

Add `data-keys` to any element you want to track:

```html
<div class="box" data-keys data-keys-watch="space" data-keys-var="true"></div>
```

Style it with CSS using CSS variables:

```css
.box {
    transform: scale(1);
    transition: transform 0.2s ease;
}

/* Scale up when space is pressed */
.box.key-space {
    transform: scale(1.5);
}

/* Or use CSS variables directly */
.box {
    transform: scale(calc(1 + var(--key-space, 0) * 0.5));
}
```

---

# Gaming Mode

Keys.js is **optimized for gaming** with features that make it perfect for interactive applications:

## 1. Prevent Default Browser Behavior

Essential for games - prevents arrow keys from scrolling, space from page-down, etc.

**Recommended: Per-element prevention (granular control)**
```html
<!-- Only prevent defaults for specific keys on specific elements -->
<div data-keys data-keys-watch="up,down,space" data-keys-prevent="up,down,space">
    <!-- Arrow keys and space won't scroll when this element is active -->
</div>
```

**Alternative: Global prevention (for full-screen games)**
```html
<!-- Prevent defaults for all keys globally -->
<body data-keys-prevent-defaults="*">

<!-- Or specific keys globally -->
<body data-keys-prevent-defaults="up,down,left,right,space">
```

The `data-keys-prevent` attribute gives you fine-grained control and only prevents defaults when needed, making it easier to develop and test.

## 2. High-Precision Timing

Keys.js uses `performance.now()` instead of `Date.now()` for **sub-millisecond precision**. Perfect for frame-perfect input detection.

```javascript
// Get exact hold duration in milliseconds
const holdDuration = keys.getKeyHoldDuration('space');
if (holdDuration > 500) {
    // Charged attack ready!
}
```

## 3. Non-Passive Event Listeners

Keys.js uses non-passive event listeners to support `preventDefault()` while maintaining responsiveness. This is critical for gaming where you need to override browser shortcuts.

## 4. Key Repeat Detection

Keys.js tracks the **first press** separately from key repeats, ensuring accurate press counting and timing:

```javascript
// Press count only increments on initial keydown, not repeats
const pressCount = keys.getKeyPressCount('space');
```

---

# CSS Variables

Keys.js exposes keyboard state as CSS variables that update in real-time:

```css
/* Key state (0 or 1) */
var(--key-space)              /* Is space pressed? */
var(--key-w)                  /* Is W pressed? */
var(--key-enter)              /* Is enter pressed? */

/* Press count */
var(--key-space-count)        /* How many times pressed */

/* Hold duration */
var(--key-shift-duration)     /* Hold time in milliseconds (e.g. "1234ms") */
var(--key-shift-hold)         /* Normalized 0-1 value (capped at 1 second) */

/* Modifier keys */
var(--key-shift)              /* Is shift pressed? */
var(--key-ctrl)               /* Is ctrl pressed? */
var(--key-alt)                /* Is alt pressed? */
var(--key-meta)               /* Is meta/cmd pressed? */

/* Active keys count */
var(--keys-active)            /* Number of keys currently pressed */
```

## Example: Charged Attack

```html
<div class="charge-bar" data-keys data-keys-watch="shift" data-keys-var="true">
    <div class="charge-fill"></div>
</div>
```

```css
.charge-fill {
    /* Width grows from 0 to 100% based on hold duration (0-1) */
    width: calc(var(--key-shift-hold, 0) * 100%);
    height: 10px;
    background: linear-gradient(90deg, #700c0c, #ff8800);
    transition: width 0.05s linear;
}

/* Full charge indicator */
[data-key-shift-hold="1"] .charge-fill {
    box-shadow: 0 0 20px #ff8800;
    animation: pulse 0.3s ease infinite;
}
```

---

# CSS Classes

Keys.js automatically adds classes to elements for easy CSS targeting:

```css
/* General classes */
.keys-active          /* Added when ANY key is pressed */
.keys-typing          /* Added when user is typing */
.keys-idle            /* Added when no keys pressed */

/* Specific key classes */
.key-space            /* Added when space is pressed */
.key-enter            /* Added when enter is pressed */
.key-w                /* Added when W is pressed */
.key-up               /* Added when up arrow is pressed */

/* Body classes for key count breakpoints */
.keys-count-1         /* At least 1 key pressed */
.keys-count-2         /* At least 2 keys pressed */
.keys-count-3         /* At least 3 keys pressed */
.keys-count-5         /* At least 5 keys pressed */
.keys-count-10        /* At least 10 keys pressed */
```

Example:

```css
.player {
    background: blue;
}

/* Turn red when space is pressed */
.player.key-space {
    background: red;
    transform: translateY(-50px);
}
```

---

# Data Attributes

Configure Keys.js behavior with HTML attributes:

```html
<div id="player"
     data-keys
     data-keys-watch="w,a,s,d,space"
     data-keys-var="true"
     data-keys-global="false"
     data-keys-combo="shift+space"
     data-keys-prevent="space,w,a,s,d">
</div>
```

## Available Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `data-keys` | Enable Keys.js on element | `data-keys` |
| `data-keys-watch` | Comma-separated list of keys to track | `data-keys-watch="w,a,s,d"` |
| `data-keys-var` | Enable CSS variables | `data-keys-var="true"` |
| `data-keys-global` | Set variables on `:root` instead of element | `data-keys-global="true"` |
| `data-keys-combo` | Define key combo to detect | `data-keys-combo="ctrl+shift"` |
| `data-keys-prevent` | Prevent default browser behavior for specific keys | `data-keys-prevent="up,down,space"` |
| `data-keys-prevent-defaults` | Keys to prevent default behavior (body only, legacy) | `data-keys-prevent-defaults="*"` |

---

# Keys-Animations.css

Keys.js comes with a ready-to-use animation library with **30+ keyboard-triggered animations**:

```html
<link rel="stylesheet" href="keys-animations.css">

<div data-keys data-keys-watch="space" class="keys-anim-press-pulse">
    Press SPACE to see pulse animation
</div>
```

**Animation Categories:**
- **Press Animations**: pulse, shake, bounce, glow, flash
- **Arrow Keys**: arrow-up, arrow-down, arrow-left, arrow-right
- **WASD Movement**: wasd-up, wasd-down, wasd-left, wasd-right
- **Specific Keys**: space-jump, enter-confirm, escape-fade, tab-switch
- **Typing Effects**: typing-glow, typing-scale, typing-shake
- **Combos**: combo-flash, combo-spin, combo-burst
- **Rotation**: rotate-r, rotate-continuous
- **Color Effects**: color-shift, brightness-pulse, fade-in

See all animations: https://idev-games.github.io/Keys-JS/animations.html

---

# Integration with iDev Ecosystem

Keys.js works seamlessly with other iDev libraries for complete CSS-native game development:

## Example: Player Movement (Keys.js + Motion.js)

```html
<div class="player"
     data-keys
     data-keys-watch="w,a,s,d,space"
     data-keys-var="true"
     data-motion
     data-motion-var="true">
</div>
```

```css
.player {
    position: absolute;

    /* Position based on WASD key press count */
    left: calc(50% + (var(--key-d-count, 0) - var(--key-a-count, 0)) * 10px);
    top: calc(50% + (var(--key-s-count, 0) - var(--key-w-count, 0)) * 10px);

    /* Idle animation from Motion.js */
    transform: translateY(calc(var(--motion-bounce, 0%) * 0.05));
}

/* Jump on space */
.player.key-space {
    transform: translateY(-50px);
    transition: transform 0.2s ease-out;
}
```

See [codepen examples]([https://codepen.io/collection/gPEpkK) for comprehensive integration examples.

---

# Performance Best Practices

1. **Use `data-keys-watch`** to limit which keys are tracked per element
2. **Prevent defaults only when needed** - use specific keys, not `*` for regular websites
3. **Use CSS transitions** instead of JavaScript for smooth animations
4. **Leverage `requestAnimationFrame`** for game loops, not setInterval
5. **Combine with Motion.js** for time-based effects without JavaScript animation loops

---

# Browser Compatibility

Keys.js works in all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Uses standard APIs:
- Keyboard Events (KeyboardEvent)
- Performance API (performance.now())
- CSS Custom Properties
- requestAnimationFrame

---

# Key Normalization

Keys.js automatically normalizes key names for consistency:

| Browser Key | Normalized Name |
|-------------|-----------------|
| ' ' (space) | `space` |
| 'ArrowUp' | `up` |
| 'ArrowDown' | `down` |
| 'ArrowLeft' | `left` |
| 'ArrowRight' | `right` |
| 'Control' | `ctrl` |
| 'Meta' | `meta` |
| 'Shift' | `shift` |
| 'Alt' | `alt` |
| 'Enter' | `enter` |
| 'Escape' | `esc` |
| 'Backspace' | `backspace` |
| 'Tab' | `tab` |

All other keys use their lowercase `event.key` value.

---

# Companion Libraries

Keys.js is part of the **iDev Animation Toolkit Ecosystem**:

### 🎹 [Keys.js](https://github.com/iDev-Games/Keys-JS) (You are here)
**Purpose:** Keyboard-reactive CSS variables
**Best For:** Gaming controls, keyboard shortcuts, interactive applications

### ⏱️ [Motion.js](https://github.com/iDev-Games/Motion-JS)
**Purpose:** Time-reactive CSS variables
**Best For:** Loading animations, ambient motion, continuous effects

### 📜 [Trig.js](https://github.com/iDev-Games/Trig-JS)
**Purpose:** Scroll-reactive CSS variables
**Best For:** Parallax effects, scroll reveals, storytelling websites

### 🖱️ [Cursor.js](https://github.com/iDev-Games/Cursor-JS)
**Purpose:** Mouse position tracking
**Best For:** Cursor effects, mouse-reactive animations

**Together they provide complete control over input, time, and state - all through CSS!**

---

# License

MIT License - Free for commercial and personal use

---

# Links

- [Keys.js Documentation](https://github.com/iDev-Games/Keys-JS)
- [Motion.js Documentation](https://github.com/iDev-Games/Motion-JS)
- [Trig.js Documentation](https://github.com/iDev-Games/Trig-JS)
- [Cursor.js Documentation](https://github.com/iDev-Games/Cursor-JS)
- [Animation Showcase](https://idev-games.github.io/Keys-JS/animations.html)
