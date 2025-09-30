/**
 * Product Custom Canvas JavaScript
 * File: assets/product-custom-canvas.js
 * 
 * Handles canvas rendering and variant selection for customizable products
 */

class ProductCustomCanvas {
  constructor(sectionId) {
    this.sectionId = sectionId;
    this.section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!this.section) {
      console.error('Section not found:', sectionId);
      return;
    }

    this.canvas = this.section.querySelector('[data-canvas-image]');
    this.ctx = this.canvas?.getContext('2d');
    this.form = this.section.querySelector('form');
    
    // Get product data from global object
    if (!window.productCustomCanvasData || !window.productCustomCanvasData[sectionId]) {
      console.error('Product data not found for section:', sectionId);
      console.log('Available data:', window.productCustomCanvasData);
      return;
    }
    
    this.productData = window.productCustomCanvasData[sectionId];
    
    if (!this.productData || !this.productData.currentVariant) {
      console.error('Invalid product data structure:', this.productData);
      return;
    }
    
    this.currentOptions = this.getCurrentOptions();
    this.currentVariant = this.productData.currentVariant;
    
    this.init();
  }

  init() {
    if (!this.canvas || !this.ctx) {
      console.error('Canvas not available');
      return;
    }
    
    if (!this.productData || !this.productData.variants) {
      console.error('Product data not properly loaded');
      return;
    }

    // Set up event listeners
    this.setupVariantListeners();
    this.setupQuantityListeners();
    this.setupFormSubmit();
    
    // Initial render
    this.updateCanvas();
    this.updateConfigDisplay();
  }

  getCurrentOptions() {
    const options = {};
    
    // Get from dropdowns
    const selects = this.section.querySelectorAll('[data-option-select]');
    selects.forEach(select => {
      const optionIndex = select.dataset.optionIndex;
      options[`option${parseInt(optionIndex) + 1}`] = select.value;
    });
    
    // Get from buttons - find active buttons for each option group
    const buttonGroups = this.section.querySelectorAll('[data-option-buttons]');
    buttonGroups.forEach(buttonGroup => {
      const activeButton = buttonGroup.querySelector('.variant-button.active');
      if (activeButton) {
        const optionIndex = activeButton.dataset.optionIndex;
        options[`option${parseInt(optionIndex) + 1}`] = activeButton.dataset.optionValue;
      }
    });
    
    console.log('getCurrentOptions result:', options);
    return options;
  }

  setupVariantListeners() {
    // Dropdown selects
    const selects = this.section.querySelectorAll('[data-option-select]');
    console.log('Found selects:', selects.length);
    selects.forEach(select => {
      select.addEventListener('change', (e) => {
        const optionIndex = e.target.dataset.optionIndex;
        this.currentOptions[`option${parseInt(optionIndex) + 1}`] = e.target.value;
        console.log('Select changed:', this.currentOptions);
        this.handleVariantChange();
      });
    });

    // Button selects
    const buttons = this.section.querySelectorAll('[data-option-value]');
    console.log('Found variant buttons:', buttons.length);
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any default behavior
        
        const optionIndex = button.dataset.optionIndex;
        const optionValue = button.dataset.optionValue;
        
        console.log('Button clicked:', { optionIndex, optionValue });
        
        // Update active state
        const buttonGroup = button.parentElement;
        buttonGroup.querySelectorAll('.variant-button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        
        // IMPORTANT: Refresh all options from DOM, not just update one
        this.currentOptions = this.getCurrentOptions();
        console.log('Updated options (all):', this.currentOptions);
        
        this.handleVariantChange();
      });
    });
    
    console.log('Variant listeners setup complete. Current options:', this.currentOptions);
  }

  setupQuantityListeners() {
    const input = this.section.querySelector('[data-quantity-input]');
    const minusBtn = this.section.querySelector('[data-quantity-minus]');
    const plusBtn = this.section.querySelector('[data-quantity-plus]');

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        const currentVal = parseInt(input.value);
        if (currentVal > 1) {
          input.value = currentVal - 1;
        }
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        const currentVal = parseInt(input.value);
        input.value = currentVal + 1;
      });
    }
  }

  setupFormSubmit() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(this.form);
      const addToCartBtn = this.section.querySelector('[data-add-to-cart]');
      const btnText = addToCartBtn.querySelector('[data-add-to-cart-text]');
      const originalText = btnText.textContent;
      
      // Update button state
      addToCartBtn.disabled = true;
      btnText.textContent = 'Adding...';
      
      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          btnText.textContent = 'Added! ✓';
          
          // Update cart count if your theme supports it
          if (window.theme && window.theme.cartUpdateEvent) {
            document.dispatchEvent(new CustomEvent('cart:updated'));
          }
          
          // Reset button after delay
          setTimeout(() => {
            btnText.textContent = originalText;
            addToCartBtn.disabled = false;
          }, 2000);
        } else {
          throw new Error('Add to cart failed');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        btnText.textContent = 'Error - Try again';
        setTimeout(() => {
          btnText.textContent = originalText;
          addToCartBtn.disabled = false;
        }, 2000);
      }
    });
  }

  handleVariantChange() {
    console.log('handleVariantChange called with options:', this.currentOptions);
    
    // Find matching variant
    const variant = this.productData.variants.find(v => {
      return v.option1 === this.currentOptions.option1 &&
             v.option2 === this.currentOptions.option2 &&
             v.option3 === this.currentOptions.option3;
    });

    console.log('Found variant:', variant);

    if (variant) {
      this.currentVariant = variant;
      
      // Update hidden input
      const variantInput = this.section.querySelector('[data-variant-id]');
      if (variantInput) variantInput.value = variant.id;
      
      // Update price
      this.updatePrice(variant);
      
      // Update availability
      this.updateAvailability(variant);
      
      // Update canvas
      console.log('Calling updateCanvas...');
      this.updateCanvas();
      
      // Update config display
      this.updateConfigDisplay();
      
      // Hide any error message
      this.hideVariantError();
    } else {
      console.warn('No matching variant found for:', this.currentOptions);
      
      // Still update the canvas so user can see their selection
      this.updateCanvas();
      this.updateConfigDisplay();
      
      // Show user-friendly message
      this.showVariantError();
    }
  }
  
  showVariantError() {
    const addToCartBtn = this.section.querySelector('[data-add-to-cart]');
    const btnText = addToCartBtn.querySelector('[data-add-to-cart-text]');
    
    addToCartBtn.disabled = true;
    btnText.textContent = 'Combination Not Available';
    
    // Optionally add a message near the buttons
    let errorMsg = this.section.querySelector('.variant-error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'variant-error-message';
      errorMsg.style.cssText = 'color: #dc2626; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 16px 0; font-size: 14px;';
      const form = this.section.querySelector('.product-custom__form');
      form.insertBefore(errorMsg, form.firstChild);
    }
    errorMsg.textContent = '⚠️ This combination is not available. Please select a different option.';
    errorMsg.style.display = 'block';
  }
  
  hideVariantError() {
    const errorMsg = this.section.querySelector('.variant-error-message');
    if (errorMsg) {
      errorMsg.style.display = 'none';
    }
  }

  updatePrice(variant) {
    const priceElement = this.section.querySelector('[data-product-price]');
    if (priceElement && variant.price) {
      priceElement.textContent = this.formatMoney(variant.price);
    }
  }

  updateAvailability(variant) {
    const addToCartBtn = this.section.querySelector('[data-add-to-cart]');
    const btnText = addToCartBtn.querySelector('[data-add-to-cart-text]');
    
    if (variant.available) {
      addToCartBtn.disabled = false;
      btnText.textContent = 'Add to Cart';
    } else {
      addToCartBtn.disabled = true;
      btnText.textContent = 'Sold Out';
    }
  }

  updateConfigDisplay() {
    const configDisplay = this.section.querySelector('[data-config-display]');
    if (!configDisplay) return;

    const config = [];
    
    if (this.currentOptions.option1) {
      config.push(`<div class="config-item">
        <span class="config-label">Hook Finish:</span>
        <span class="config-value">${this.currentOptions.option1}</span>
      </div>`);
    }
    
    if (this.currentOptions.option2) {
      config.push(`<div class="config-item">
        <span class="config-label">Number of Hooks:</span>
        <span class="config-value">${this.currentOptions.option2}</span>
      </div>`);
    }
    
    if (this.currentOptions.option3) {
      config.push(`<div class="config-item">
        <span class="config-label">Base Material:</span>
        <span class="config-value">${this.currentOptions.option3}</span>
      </div>`);
    }

    configDisplay.innerHTML = config.join('');
  }

  updateCanvas() {
    if (!this.canvas || !this.ctx) {
      console.error('Canvas not available in updateCanvas');
      return;
    }

    console.log('updateCanvas called. Current options:', this.currentOptions);

    // Extract canvas options from variant options
    const hookColor = this.getColorFromName(this.currentOptions.option1);
    const hooksQuantity = this.getQuantityFromOption(this.currentOptions.option2);
    const blockColor = this.getColorFromName(this.currentOptions.option3);

    console.log('Rendering with:', { hookColor, hooksQuantity, blockColor });

    this.renderHooks(hookColor, hooksQuantity, blockColor);
    
    console.log('Canvas render complete');
  }

  getColorFromName(colorName) {
    if (!colorName) return '#2C3E50';
    
    const colorMap = {
      'Matte Black': '#2C3E50',
      'Brushed Silver': '#95A5A6',
      'Rose Gold': '#C9A885',
      'Brass': '#B8860B',
      'White': '#FFFFFF',
      'Light Gray': '#ECF0F1',
      'Walnut': '#5D4037',
      'Oak': '#A0826D',
      'Black': '#1C1C1C'
    };

    return colorMap[colorName] || '#2C3E50';
  }

  getQuantityFromOption(option) {
    if (!option) return 4;
    const match = option.match(/\d+/);
    return match ? parseInt(match[0]) : 4;
  }

  renderHooks(hookColor, hooksQuantity, blockColor) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#f5f5f5');
    bgGradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Calculate block dimensions
    const blockWidth = 500;
    const blockHeight = 100;
    const blockX = (width - blockWidth) / 2;
    const blockY = (height - blockHeight) / 2;

    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;

    // Draw block with texture effect
    const blockGradient = ctx.createLinearGradient(blockX, blockY, blockX, blockY + blockHeight);
    blockGradient.addColorStop(0, this.lightenColor(blockColor, 10));
    blockGradient.addColorStop(0.5, blockColor);
    blockGradient.addColorStop(1, this.darkenColor(blockColor, 10));
    
    ctx.fillStyle = blockGradient;
    ctx.fillRect(blockX, blockY, blockWidth, blockHeight);

    // Add subtle texture lines
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = this.darkenColor(blockColor, 5);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
      const lineY = blockY + (blockHeight / 10) * i;
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.moveTo(blockX, lineY);
      ctx.lineTo(blockX + blockWidth, lineY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw mounting holes
    const holeRadius = 4;
    ctx.fillStyle = this.darkenColor(blockColor, 30);
    ctx.beginPath();
    ctx.arc(blockX + 25, blockY + blockHeight / 2, holeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(blockX + blockWidth - 25, blockY + blockHeight / 2, holeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw hooks
    const hookSpacing = blockWidth / (hooksQuantity + 1);
    const hookWidth = 10;
    const hookLength = 60;

    for (let i = 0; i < hooksQuantity; i++) {
      const hookX = blockX + hookSpacing * (i + 1);
      const hookY = blockY + blockHeight;

      // Hook shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 5;

      // Draw hook with metallic effect
      const hookGradient = ctx.createLinearGradient(
        hookX - hookWidth / 2,
        hookY,
        hookX + hookWidth / 2,
        hookY
      );
      
      if (hookColor === '#FFFFFF') {
        hookGradient.addColorStop(0, '#E0E0E0');
        hookGradient.addColorStop(0.5, '#FFFFFF');
        hookGradient.addColorStop(1, '#D0D0D0');
      } else {
        hookGradient.addColorStop(0, this.darkenColor(hookColor, 15));
        hookGradient.addColorStop(0.3, this.lightenColor(hookColor, 20));
        hookGradient.addColorStop(0.7, hookColor);
        hookGradient.addColorStop(1, this.darkenColor(hookColor, 20));
      }

      // Hook vertical part
      ctx.fillStyle = hookGradient;
      ctx.fillRect(hookX - hookWidth / 2, hookY, hookWidth, hookLength - 18);

      // Hook curved part
      ctx.beginPath();
      ctx.arc(hookX, hookY + hookLength - 18, 18, 0, Math.PI, false);
      ctx.fill();

      // Add highlight
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = this.lightenColor(hookColor, 40);
      ctx.globalAlpha = 0.6;
      ctx.fillRect(hookX - hookWidth / 2 + 1.5, hookY + 6, 2.5, hookLength - 30);
      ctx.globalAlpha = 1;

      // Mounting screw
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      const screwGradient = ctx.createRadialGradient(hookX, hookY + 12, 0, hookX, hookY + 12, 6);
      screwGradient.addColorStop(0, this.lightenColor(hookColor, 30));
      screwGradient.addColorStop(1, this.darkenColor(hookColor, 10));
      ctx.fillStyle = screwGradient;
      ctx.beginPath();
      ctx.arc(hookX, hookY + 12, 6, 0, Math.PI * 2);
      ctx.fill();

      // Screw slot
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = this.darkenColor(hookColor, 40);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hookX - 4, hookY + 12);
      ctx.lineTo(hookX + 4, hookY + 12);
      ctx.stroke();
    }

    ctx.shadowColor = 'transparent';
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
  }

  formatMoney(cents) {
    const dollars = cents / 100;
    return `$${dollars.toFixed(2)}`;
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.product-custom-canvas[data-section-id]');
  sections.forEach(section => {
    const sectionId = section.dataset.sectionId;
    new ProductCustomCanvas(sectionId);
  });
});

// Reinitialize on Shopify section load (Theme Editor)
if (Shopify && Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target;
    const sectionId = section.dataset.sectionId;
    if (section.classList.contains('product-custom-canvas')) {
      new ProductCustomCanvas(sectionId);
    }
  });
}
