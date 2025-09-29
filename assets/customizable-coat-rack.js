class CustomizableCoatRack {
  constructor() {
    this.config = window.CoatRackConfig || {};
    this.state = {
      selectedSize: null,
      selectedBaseColor: 'oak',
      selectedHookColor: 'black',
      individualHookColors: {},
      mixAndMatch: false,
      currentVariant: null,
      imageCache: new Map(),
      isLoading: false
    };

    this.elements = {
      form: document.getElementById('customCoatRackForm'),
      imageStack: document.getElementById('imageStack'),
      baseRailImage: document.getElementById('baseRailImage'),
      hookLayers: document.getElementById('hookLayers'),
      sizeOptions: document.getElementById('sizeOptions'),
      baseColorSwatches: document.getElementById('baseColorSwatches'),
      hookColorGrid: document.getElementById('hookColorGrid'),
      mixAndMatchCheckbox: document.getElementById('mixAndMatch'),
      individualHooksSection: document.getElementById('individualHooksSection'),
      selectionSummary: document.getElementById('selectionSummary'),
      summaryDetails: document.getElementById('summaryDetails'),
      addToCartBtn: document.getElementById('addToCartBtn'),
      currentPrice: document.getElementById('currentPrice'),
      totalPrice: document.getElementById('totalPrice'),
      variantId: document.getElementById('variantId'),
      hookColorProperties: document.getElementById('hookColorProperties'),
      quantity: document.getElementById('quantity')
    };

    this.init();
  }

  init() {
    // Add debug mode
    if (localStorage.getItem('coatRackDebug') === 'true') {
      console.log('🔧 Coat Rack Debug Mode Enabled');
      console.log('Config:', this.config);
      console.log('Elements found:', Object.keys(this.elements).filter(key => this.elements[key]));
    }

    this.setupEventListeners();
    this.populateHookColors();
    this.selectFirstAvailableSize();
    this.preloadCriticalImages();
    this.updateDisplay();

    // Show initial fallback if no images
    if (!this.elements.baseRailImage.src) {
      this.showImageFallback();
    }
  }

  setupEventListeners() {
    // Size selection
    this.elements.sizeOptions?.addEventListener('click', (e) => {
      if (e.target.classList.contains('size-option') && !e.target.classList.contains('disabled')) {
        this.selectSize(e.target);
      }
    });

    // Base color selection
    this.elements.baseColorSwatches?.addEventListener('click', (e) => {
      if (e.target.classList.contains('base-color-swatch')) {
        this.selectBaseColor(e.target);
      }
    });

    // Hook color selection
    this.elements.hookColorGrid?.addEventListener('click', (e) => {
      if (e.target.classList.contains('hook-color-swatch') && !e.target.classList.contains('disabled')) {
        this.selectHookColor(e.target);
      }
    });

    // Mix and match toggle
    this.elements.mixAndMatchCheckbox?.addEventListener('change', (e) => {
      this.toggleMixAndMatch(e.target.checked);
    });

    // Form submission
    this.elements.form?.addEventListener('submit', (e) => {
      this.handleFormSubmit(e);
    });

    // Quantity change
    this.elements.quantity?.addEventListener('change', () => {
      this.updateTotalPrice();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  populateHookColors() {
    if (!this.elements.hookColorGrid) return;

    this.elements.hookColorGrid.innerHTML = '';

    Object.entries(this.config.colors).forEach(([colorKey, colorData]) => {
      const swatch = document.createElement('div');
      swatch.className = 'hook-color-swatch';
      swatch.dataset.color = colorKey;
      swatch.style.backgroundColor = colorData.hex;
      swatch.setAttribute('aria-label', `Select ${colorData.name}`);
      swatch.setAttribute('role', 'button');
      swatch.setAttribute('tabindex', '0');

      const tooltip = document.createElement('div');
      tooltip.className = 'color-tooltip';
      tooltip.textContent = colorData.name;
      swatch.appendChild(tooltip);

      if (colorKey === this.state.selectedHookColor) {
        swatch.classList.add('selected');
      }

      this.elements.hookColorGrid.appendChild(swatch);
    });
  }

  selectSize(element) {
    // Remove previous selection
    this.elements.sizeOptions?.querySelectorAll('.size-option').forEach(opt => {
      opt.classList.remove('selected');
      opt.setAttribute('aria-selected', 'false');
    });

    // Select new size
    element.classList.add('selected');
    element.setAttribute('aria-selected', 'true');

    this.state.selectedSize = element.dataset.size;
    this.state.currentVariant = this.config.variants[element.dataset.variantId];
    this.elements.variantId.value = element.dataset.variantId;

    // Reset individual hook colors for new size
    this.state.individualHookColors = {};
    this.setupIndividualHookControls();

    this.updateDisplay();
    this.announceChange(`Selected ${this.state.selectedSize}`);
  }

  selectBaseColor(element) {
    // Remove previous selection
    this.elements.baseColorSwatches?.querySelectorAll('.base-color-swatch').forEach(swatch => {
      swatch.classList.remove('selected');
    });

    // Select new base color
    element.classList.add('selected');
    this.state.selectedBaseColor = element.dataset.color;

    this.updateDisplay();
    this.announceChange(`Selected base color: ${element.dataset.label}`);
  }

  selectHookColor(element) {
    if (this.state.mixAndMatch) return; // Individual hook selection handles this

    // Remove previous selection
    this.elements.hookColorGrid?.querySelectorAll('.hook-color-swatch').forEach(swatch => {
      swatch.classList.remove('selected');
    });

    // Select new hook color
    element.classList.add('selected');
    this.state.selectedHookColor = element.dataset.color;

    this.updateDisplay();
    this.announceChange(`Selected hook color: ${this.config.colors[element.dataset.color]?.name}`);
  }

  toggleMixAndMatch(enabled) {
    this.state.mixAndMatch = enabled;

    if (enabled) {
      this.elements.individualHooksSection.style.display = 'block';
      this.elements.hookColorGrid.style.opacity = '0.5';
      this.elements.hookColorGrid.style.pointerEvents = 'none';
      this.setupIndividualHookControls();
    } else {
      this.elements.individualHooksSection.style.display = 'none';
      this.elements.hookColorGrid.style.opacity = '1';
      this.elements.hookColorGrid.style.pointerEvents = 'auto';
      this.state.individualHookColors = {};
    }

    this.updateDisplay();
    this.announceChange(`Mix and match ${enabled ? 'enabled' : 'disabled'}`);
  }

  setupIndividualHookControls() {
    if (!this.state.selectedSize || !this.elements.individualHooksSection) return;

    const hookCount = parseInt(this.state.selectedSize.replace(' Hooks', ''));
    const controlsContainer = document.getElementById('individualHookControls');

    if (!controlsContainer) return;

    controlsContainer.innerHTML = '';

    for (let i = 1; i <= hookCount; i++) {
      const controlGroup = document.createElement('div');
      controlGroup.className = 'individual-hook-control';
      controlGroup.style.cssText = 'display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;';

      const label = document.createElement('label');
      label.textContent = `Hook ${i}:`;
      label.style.cssText = 'font-weight: 600; min-width: 80px;';

      const colorGrid = document.createElement('div');
      colorGrid.className = 'individual-hook-colors';
      colorGrid.style.cssText = 'display: flex; gap: 0.25rem; flex-wrap: wrap;';

      Object.entries(this.config.colors).forEach(([colorKey, colorData]) => {
        const swatch = document.createElement('div');
        swatch.className = 'hook-color-swatch individual-hook-swatch';
        swatch.style.cssText = `width: 30px; height: 30px; background-color: ${colorData.hex}; border: 2px solid #ddd; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;`;
        swatch.dataset.color = colorKey;
        swatch.dataset.position = i;
        swatch.title = colorData.name;

        swatch.addEventListener('click', () => {
          this.selectIndividualHookColor(i, colorKey, swatch);
        });

        colorGrid.appendChild(swatch);
      });

      controlGroup.appendChild(label);
      controlGroup.appendChild(colorGrid);
      controlsContainer.appendChild(controlGroup);
    }
  }

  selectIndividualHookColor(position, colorKey, swatchElement) {
    // Remove previous selection for this position
    const positionSwatches = document.querySelectorAll(`[data-position="${position}"]`);
    positionSwatches.forEach(s => {
      s.style.borderColor = '#ddd';
      s.style.boxShadow = 'none';
    });

    // Select new color
    swatchElement.style.borderColor = '#007aff';
    swatchElement.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.3)';

    this.state.individualHookColors[position] = colorKey;
    this.updateDisplay();
    this.announceChange(`Hook ${position} set to ${this.config.colors[colorKey]?.name}`);
  }

  selectFirstAvailableSize() {
    const firstAvailable = this.elements.sizeOptions?.querySelector('.size-option:not(.disabled)');
    if (firstAvailable) {
      this.selectSize(firstAvailable);
    }
  }

  async updateDisplay() {
    if (!this.state.selectedSize) return;

    this.setLoadingState(true);

    try {
      await this.updateImages();
      this.updatePrice();
      this.updateSummary();
      this.updateFormProperties();
      this.validateSelection();
    } catch (error) {
      console.error('Error updating display:', error);
      this.showError('Failed to update product display');
    } finally {
      this.setLoadingState(false);
    }
  }

  async updateImages() {
    try {
      // Update base rail image
      const baseImageUrl = this.getBaseImageUrl();
      await this.loadImage(baseImageUrl, this.elements.baseRailImage);

      // Update hook layers
      await this.updateHookLayers();
    } catch (error) {
      console.warn('Image loading failed, using fallback display:', error);
      this.showImageFallback();
    }
  }

  showImageFallback() {
    // Show a placeholder or text when images fail to load
    if (this.elements.imageStack) {
      const fallback = document.createElement('div');
      fallback.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: #666;
        font-size: 1.2rem;
        background: rgba(255,255,255,0.9);
        padding: 2rem;
        border-radius: 8px;
        border: 2px dashed #ccc;
      `;
      fallback.innerHTML = `
        <div>🖼️</div>
        <div style="margin-top: 1rem;">Product Image Preview</div>
        <div style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">
          ${this.state.selectedSize || 'Select size'} - ${this.state.selectedBaseColor} base
        </div>
      `;

      // Remove existing fallback
      const existing = this.elements.imageStack.querySelector('.image-fallback');
      if (existing) existing.remove();

      fallback.className = 'image-fallback';
      this.elements.imageStack.appendChild(fallback);
    }
  }

  getBaseImageUrl() {
    const size = this.state.selectedSize.replace(' Hooks', '');
    const hookSize = 'original'; // Could be made configurable
    return `${this.config.imageBasePath}${size}-${hookSize}-${this.state.selectedBaseColor}.png`;
  }

  async updateHookLayers() {
    if (!this.elements.hookLayers) return;

    this.elements.hookLayers.innerHTML = '';

    const hookCount = parseInt(this.state.selectedSize.replace(' Hooks', ''));
    const hookSize = 'original';

    for (let i = 1; i <= hookCount; i++) {
      const hookColor = this.state.mixAndMatch
        ? this.state.individualHookColors[i] || 'black'
        : this.state.selectedHookColor;

      const hookLayer = document.createElement('img');
      hookLayer.className = 'hook-layer';
      hookLayer.dataset.position = i;
      hookLayer.dataset.color = hookColor;
      hookLayer.style.position = 'absolute';
      hookLayer.style.top = '0';
      hookLayer.style.left = '0';
      hookLayer.style.width = '100%';
      hookLayer.style.height = '100%';
      hookLayer.style.objectFit = 'contain';

      // Use position letters (a, b, c, etc.)
      const positionLetter = String.fromCharCode(96 + i); // a, b, c...
      const hookImageUrl = `${this.config.imageBasePath}${hookCount}${positionLetter}-${hookSize}-red.png`;

      try {
        await this.loadImage(hookImageUrl, hookLayer);
        this.elements.hookLayers.appendChild(hookLayer);
      } catch (error) {
        console.warn(`Failed to load hook image for position ${i}:`, error);
      }
    }
  }

  async loadImage(url, imgElement) {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (this.state.imageCache.has(url)) {
        const cachedUrl = this.state.imageCache.get(url);
        imgElement.src = cachedUrl;
        imgElement.style.display = 'block';
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.state.imageCache.set(url, url);
        imgElement.src = url;
        imgElement.style.display = 'block';
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }

  updatePrice() {
    if (!this.state.currentVariant) return;

    const basePrice = this.state.currentVariant.price;
    const quantity = parseInt(this.elements.quantity?.value || 1);
    const totalPrice = basePrice * quantity;

    if (this.elements.currentPrice) {
      this.elements.currentPrice.textContent = this.formatMoney(basePrice);
    }

    if (this.elements.totalPrice) {
      this.elements.totalPrice.textContent = this.formatMoney(totalPrice);
    }
  }

  updateTotalPrice() {
    this.updatePrice();
  }

  updateSummary() {
    if (!this.elements.summaryDetails) return;

    let summary = `${this.state.selectedSize} coat rack`;
    summary += ` with ${this.state.selectedBaseColor} base`;

    if (this.state.mixAndMatch) {
      const hookCount = parseInt(this.state.selectedSize.replace(' Hooks', ''));
      const selectedColors = Object.keys(this.state.individualHookColors).length;
      summary += ` and custom hook colors (${selectedColors}/${hookCount} selected)`;
    } else {
      const colorName = this.config.colors[this.state.selectedHookColor]?.name;
      summary += ` and ${colorName} hooks`;
    }

    this.elements.summaryDetails.textContent = summary;
  }

  updateFormProperties() {
    if (!this.elements.hookColorProperties) return;

    this.elements.hookColorProperties.innerHTML = '';

    if (this.state.mixAndMatch) {
      // Add individual hook color properties
      Object.entries(this.state.individualHookColors).forEach(([position, color]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = `properties[Hook Position ${position}]`;
        input.value = this.config.colors[color]?.name || color;
        this.elements.hookColorProperties.appendChild(input);
      });

      // Add mix and match indicator
      const mixInput = document.createElement('input');
      mixInput.type = 'hidden';
      mixInput.name = 'properties[Hook Color]';
      mixInput.value = 'Mixed';
      this.elements.hookColorProperties.appendChild(mixInput);
    } else {
      // Add single hook color property
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'properties[Hook Color]';
      input.value = this.config.colors[this.state.selectedHookColor]?.name || this.state.selectedHookColor;
      this.elements.hookColorProperties.appendChild(input);
    }

    // Add base color property
    const baseInput = document.createElement('input');
    baseInput.type = 'hidden';
    baseInput.name = 'properties[Base Color]';
    baseInput.value = this.state.selectedBaseColor;
    this.elements.hookColorProperties.appendChild(baseInput);
  }

  validateSelection() {
    let isValid = true;
    let errorMessage = '';

    if (!this.state.selectedSize) {
      isValid = false;
      errorMessage = 'Please select a size';
    } else if (this.state.mixAndMatch) {
      const hookCount = parseInt(this.state.selectedSize.replace(' Hooks', ''));
      const selectedColors = Object.keys(this.state.individualHookColors).length;
      if (selectedColors < hookCount) {
        isValid = false;
        errorMessage = `Please select colors for all ${hookCount} hooks`;
      }
    }

    if (this.elements.addToCartBtn) {
      this.elements.addToCartBtn.disabled = !isValid;
      this.elements.addToCartBtn.title = errorMessage;
    }

    return isValid;
  }

  async preloadCriticalImages() {
    // Preload images for the first few sizes and common colors
    const criticalImages = [];
    const commonSizes = ['3 Hooks', '6 Hooks'];
    const commonColors = ['black', 'white', 'navy-blue'];

    commonSizes.forEach(size => {
      const sizeNum = size.replace(' Hooks', '');
      criticalImages.push(`${this.config.imageBasePath}${sizeNum}-original-oak.png`);

      commonColors.forEach(color => {
        for (let i = 1; i <= parseInt(sizeNum); i++) {
          const positionLetter = String.fromCharCode(96 + i);
          criticalImages.push(`${this.config.imageBasePath}${sizeNum}${positionLetter}-original-red.png`);
        }
      });
    });

    // Load images in batches to avoid overwhelming the browser
    const batchSize = 3;
    for (let i = 0; i < criticalImages.length; i += batchSize) {
      const batch = criticalImages.slice(i, i + batchSize);
      await Promise.all(batch.map(url => this.preloadImage(url)));
    }
  }

  preloadImage(url) {
    return new Promise((resolve) => {
      if (this.state.imageCache.has(url)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.state.imageCache.set(url, url);
        resolve();
      };
      img.onerror = () => {
        resolve(); // Don't fail the entire batch if one image fails
      };
      img.src = url;
    });
  }

  setLoadingState(isLoading) {
    this.state.isLoading = isLoading;

    if (this.elements.imageStack) {
      this.elements.imageStack.classList.toggle('image-loading', isLoading);
    }

    if (this.elements.addToCartBtn) {
      this.elements.addToCartBtn.disabled = isLoading || !this.validateSelection();
    }
  }

  handleFormSubmit(e) {
    if (!this.validateSelection()) {
      e.preventDefault();
      this.showError('Please complete your selection before adding to cart');
      return;
    }

    // Allow normal form submission to proceed
    this.announceChange('Adding to cart...');
  }

  handleKeyboardNavigation(e) {
    // Add keyboard support for better accessibility
    if (e.target.classList.contains('hook-color-swatch')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
      }
    }
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }

  showError(message) {
    // Create or update error message display
    let errorEl = document.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      this.elements.form?.insertBefore(errorEl, this.elements.form.firstChild);
    }
    errorEl.textContent = message;

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      errorEl?.remove();
    }, 5000);
  }

  announceChange(message) {
    // Announce changes for screen readers
    const announcement = document.getElementById('a11y-announcer') || this.createAnnouncementElement();
    announcement.textContent = message;
  }

  createAnnouncementElement() {
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    document.body.appendChild(announcer);
    return announcer;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.customizable-coat-rack')) {
    new CustomizableCoatRack();
  }
});

// Shopify integration
if (typeof Shopify !== 'undefined' && Shopify.onError) {
  Shopify.onError = function(XMLHttpRequest, textStatus) {
    console.error('Shopify AJAX error:', textStatus);
  };
}