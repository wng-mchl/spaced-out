// ResponsiveGame.js - Handles dynamic sizing and responsive design

export class ResponsiveGame {
  constructor() {
    this.minWidth = 120;   // Minimum game width in characters
    this.minHeight = 40;   // Minimum game height in characters
    this.maxWidth = 300;   // Maximum game width in characters
    this.maxHeight = 100;  // Maximum game height in characters
    this.aspectRatio = 3.2; // Target aspect ratio (width/height)
    
    this.currentDimensions = this.calculateOptimalSize();
    this.setupResizeListener();
  }

  calculateOptimalSize() {
    const viewport = this.getViewportSize();
    const isMobile = this.isMobileDevice();
    
    console.log('Device detection:', { isMobile, viewport });
    
    // Much larger character size for mobile to make game bigger
    const baseCharWidth = isMobile ? 16 : 12;   // Bigger chars on mobile
    const baseCharHeight = isMobile ? 20 : 18;  // Bigger chars on mobile
    
    // Calculate how many characters fit
    const maxCharsWidth = Math.floor((viewport.width * 0.9) / baseCharWidth);   // Use more screen space
    const maxCharsHeight = Math.floor((viewport.height * 0.6) / baseCharHeight); // Leave room for controls
    
    // Mobile gets smaller grid but bigger characters
    let optimalWidth = isMobile ? 
      Math.min(maxCharsWidth, 140) :    // Smaller grid on mobile
      Math.min(maxCharsWidth, this.maxWidth);
    
    let optimalHeight = isMobile ? 
      Math.min(maxCharsHeight, 35) :    // Smaller grid on mobile  
      Math.min(maxCharsHeight, this.maxHeight);
    
    // Maintain aspect ratio
    const currentRatio = optimalWidth / optimalHeight;
    if (currentRatio > this.aspectRatio) {
      // Too wide, reduce width
      optimalWidth = Math.floor(optimalHeight * this.aspectRatio);
    } else {
      // Too tall, reduce height  
      optimalHeight = Math.floor(optimalWidth / this.aspectRatio);
    }
    
    // Ensure minimum sizes
    optimalWidth = Math.max(optimalWidth, isMobile ? 80 : this.minWidth);
    optimalHeight = Math.max(optimalHeight, isMobile ? 25 : this.minHeight);
    
    const result = {
      width: optimalWidth,
      height: optimalHeight,
      fontSize: baseCharWidth,
      lineHeight: baseCharHeight,
      isMobile: isMobile,
      scale: 1 // Don't scale, we're using bigger fonts instead
    };
    
    console.log('Calculated dimensions:', result);
    return result;
  }

  calculateScale(width, height, viewport) {
    const gamePixelWidth = width * 12;  // Approximate pixel width
    const gamePixelHeight = height * 18; // Approximate pixel height
    
    const scaleX = (viewport.width * 0.95) / gamePixelWidth;
    const scaleY = (viewport.height * 0.85) / gamePixelHeight;
    
    return Math.min(scaleX, scaleY, 2); // Cap at 2x scale
  }

  getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  isMobileDevice() {
    // Multiple checks for mobile detection
    const userAgent = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth < 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const isMobile = isMobileUA || isSmallScreen || isTouchDevice;
    
    console.log('Mobile detection:', {
      userAgent: userAgent.substr(0, 50) + '...',
      isMobileUA,
      isSmallScreen,
      isTouchDevice,
      finalResult: isMobile,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    });
    
    return isMobile;
  }

  setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newDimensions = this.calculateOptimalSize();
        if (this.hasSignificantChange(newDimensions)) {
          this.currentDimensions = newDimensions;
          this.onResize(newDimensions);
        }
      }, 250); // Debounce resize events
    });
  }

  hasSignificantChange(newDimensions) {
    const current = this.currentDimensions;
    return Math.abs(current.width - newDimensions.width) > 5 ||
           Math.abs(current.height - newDimensions.height) > 5 ||
           current.isMobile !== newDimensions.isMobile;
  }

  onResize(newDimensions) {
    // Override this in the main game class
    console.log('Screen resized, new dimensions:', newDimensions);
  }

  getDimensions() {
    return this.currentDimensions;
  }

  // Get CSS styles for the game container
  getContainerStyles() {
    const dims = this.currentDimensions;
    return {
      transform: `scale(${dims.scale})`,
      transformOrigin: 'center center',
      fontSize: `${dims.fontSize}px`,
      lineHeight: '1.2',
      fontFamily: 'monospace',
      width: 'fit-content',
      height: 'fit-content'
    };
  }

  // Check if we're in landscape or portrait
  getOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  // Get safe area for mobile devices (avoiding notches, etc.)
  getSafeArea() {
    const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0');
    const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
    const safeLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0');
    const safeRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0');
    
    return {
      top: safeTop,
      bottom: safeBottom,
      left: safeLeft,
      right: safeRight
    };
  }
}