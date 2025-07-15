// MobileControls.js - Simple 4-button directional controls

export class MobileControls {
  constructor(container) {
    this.container = container;
    this.currentDirection = { dx: 0, dy: 0 };
    this.activeButtons = new Set();

    this.createMobileUI();
    this.setupTouchEvents();

    console.log('Mobile controls initialized');
  }

  createMobileUI() {
    // Create mobile controls container
    this.mobileUI = document.createElement('div');
    this.mobileUI.className = 'mobile-controls mobile-layout';
    this.mobileUI.innerHTML = `
      <div class="direction-pad">
        <button class="dir-btn dir-up" data-dir="up">▲</button>
        <div class="dir-middle">
          <button class="dir-btn dir-left" data-dir="left">◀</button>
          <button class="dir-btn dir-right" data-dir="right">▶</button>
        </div>
        <button class="dir-btn dir-down" data-dir="down">▼</button>
      </div>
      <div class="action-buttons">
        <button class="btn-pause" data-action="pause">⏸️</button>
        <button class="btn-restart" data-action="restart">🔄</button>
      </div>
    `;

    document.body.appendChild(this.mobileUI);
    console.log('Mobile UI created');

    // Get references
    this.directionButtons = this.mobileUI.querySelectorAll('[data-dir]');
    this.actionButtons = this.mobileUI.querySelectorAll('[data-action]');
  }

  setupTouchEvents() {
    // Direction button events
    this.directionButtons.forEach(button => {
      const direction = button.dataset.dir;

      // Touch start
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.startDirection(direction);
        button.classList.add('active');
      });

      // Touch end
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.stopDirection(direction);
        button.classList.remove('active');
      });

      // Touch cancel (when finger moves off button)
      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this.stopDirection(direction);
        button.classList.remove('active');
      });

      // Mouse events for desktop testing
      button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.startDirection(direction);
        button.classList.add('active');
      });

      button.addEventListener('mouseup', (e) => {
        e.preventDefault();
        this.stopDirection(direction);
        button.classList.remove('active');
      });

      button.addEventListener('mouseleave', (e) => {
        this.stopDirection(direction);
        button.classList.remove('active');
      });
    });

    // Action button events
    this.actionButtons.forEach(button => {
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.onActionPress(button.dataset.action);
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 150);
      });

      // Mouse for desktop testing
      button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.onActionPress(button.dataset.action);
      });
    });

    // Prevent scrolling on touch
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.mobile-controls')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  startDirection(direction) {
    this.activeButtons.add(direction);
    this.updateDirection();

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }

  stopDirection(direction) {
    this.activeButtons.delete(direction);
    this.updateDirection();
  }

  updateDirection() {
    let dx = 0;
    let dy = 0;

    if (this.activeButtons.has('left')) dx -= 1;
    if (this.activeButtons.has('right')) dx += 1;
    if (this.activeButtons.has('up')) dy -= 1;
    if (this.activeButtons.has('down')) dy += 1;

    this.currentDirection = { dx, dy };
  }

  onActionPress(action) {
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    console.log('Mobile action:', action);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('mobileAction', {
      detail: { action }
    }));
  }

  getMovementDirection() {
    return this.currentDirection;
  }

  show() {
    this.mobileUI.style.display = 'flex';
    console.log('Mobile controls shown');
  }

  hide() {
    this.mobileUI.style.display = 'none';
    console.log('Mobile controls hidden');
  }

  setVisibility(visible) {
    if (visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  destroy() {
    if (this.mobileUI && this.mobileUI.parentNode) {
      this.mobileUI.parentNode.removeChild(this.mobileUI);
      console.log('Mobile controls destroyed');
    }
  }
}