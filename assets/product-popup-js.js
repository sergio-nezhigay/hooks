class CustomPopup {
  constructor() {
    this.container = $("#custom_form_container");
    this.closeButton = $("#custom_popup_close");
    this.$addAnotherRailButton = $('[data-add-new-rail]')
    this.currentIndex = 0;
    this.steps = $(".poppup_step");
    this.nextBtn = $(".next_step");
    this.prevBtn = $(".prev_step");
    this.addToCart = $("#popup-add-to-cart");
    this.selectedQuantity = null;
    this.selectedSpacing = null;
    this.selectedSpacingImg = $("#hook_space_img");
    this.selectedMaterialValue = null;
    this.hookToUse = null;
    this.selectedWallType = null;
    this.selectedProductId = null;
    this.selectedProductName = null;
    this.selectedVariantId = null;
    this.selectedVariantName = null;
    this.$selectedOption = null;
    this.allVariantsToAdd = [];
    this.allVariantsDisplay = [];
    this.totalQuantity = 0;

    this.init();
  }

  init() {
    if (this.container.length) {
      this.setupPopupTriggers();
      this.setupSlideFunctionality();
    }
    this.updateSelectedInfo();
    this.setupHookSpaceZoomFuntion();
    this.setupOptionsQuantity();
    // this.setupMaterialDropdowns(); for the select the material by selection dropdown
    // this.setupProductsDropdowns(); for the slect the product by selection dropdown
    // this.setupOptionsDropdowns();
    this.showSelectedProductOptions();
    // this.setupVariantAddButton();
    this.setupAddToCart();
  }
  
  // for open and close the popup
  setupPopupTriggers() {
    const _self = this
    this.$addAnotherRailButton.on("click", (event) => {
      event.preventDefault();
      _self.container.hide();
      _self.currentIndex = 0
      _self.setupSlideFunctionality(false)
      $(".custom_form_content").show();
      $("#popup_thank_you").hide();
      _self.container.show().css("display", "flex");
    });
    $(".custom_popup_trigger").on("click", (event) => {
      event.preventDefault();
      this.container.show().css("display", "flex");
    });
    this.closeButton.on("click", () => {
      this.container.hide();
    });
  }

  // init slider funtionality
  setupSlideFunctionality(isFirst=true) {
    this.steps.hide().css({ transform: "translateX(100%)" });
    $(this.steps[this.currentIndex])
      .show()
      .css({ transform: "translateX(0%)" })
      .addClass("active");
    this.updateButtons();
    if(isFirst){
      this.nextBtn.click(() => this.nextStep());
      this.prevBtn.click(() => this.prevStep());
    }

  }

  // init the zoom feature of hook spaceing
  setupHookSpaceZoomFuntion() {
    $(".hook_sapcing_img").on("mousemove", function (e) {
      var $image = $(this).find(".hook_spacing-magnify");

      // Calculate mouse position within the container
      var offsetX = e.offsetX / $(this).width();
      var offsetY = e.offsetY / $(this).height();

      // Set the scale and position for the zoom effect
      $image.css({
        transform: "scale(2)", // Adjust scale as needed
        "transform-origin": `${offsetX * 100}% ${offsetY * 100}%`,
      });
    });

    $(".hook_sapcing_img").on("mouseleave", function () {
      // Reset the image on mouse leave
      $(this).find(".hook_spacing-magnify").css({
        transform: "scale(1)",
        "transform-origin": "center center",
      });
    });
  }

  nextStep() {
    if (this.currentIndex < this.steps.length - 1) {
      $(this.steps[this.currentIndex])
        .hide(400)
        .css({ transform: "translateX(-100%)" });
      this.currentIndex++;
      $(this.steps[this.currentIndex])
        .show()
        .css({ transform: "translateX(100%)" })
        .animate({ transform: "translateX(0%)" }, 400)
        .addClass("active");
      this.updateButtons();
    }
    $("#custom_popup_form").animate({ scrollTop: 0 }, "slow");
  }

  prevStep() {
    if (this.currentIndex > 0) {
      $(this.steps[this.currentIndex])
        .css({ transform: "translateX(100%)" })
        .hide(400);
      this.currentIndex--;
      $(this.steps[this.currentIndex])
        .show()
        .css({ transform: "translateX(-100%)" })
        .animate({ transform: "translateX(0%)" }, 400)
        .addClass("active");
      this.updateButtons();
    }
  }

  updateButtons() {
    this.nextBtn.show();
    this.addToCart.hide();
    this.addToCart.prop("disabled", true);

    this.prevBtn.prop("disabled", this.currentIndex === 0);
    this.nextBtn.prop("disabled", this.currentIndex === this.steps.length - 1);
    if (this.currentIndex === 1 && !this.selectedProductId) {
      this.nextBtn.prop("disabled", true);
    }
    if (this.currentIndex === 4 && !this.selectedMaterialValue) {
      this.nextBtn.prop("disabled", true);
    }
    if (this.currentIndex === 2) {
      this.nextBtn.prop("disabled", true);
      // if(this.selectedVariantId){
      //    this.nextBtn.prop("disabled", false);
      // }
      // for multiple color selection
      if (this.totalQuantity == this.selectedQuantity) {
        this.nextBtn.prop("disabled", false);
      }
    }

    if (this.currentIndex === this.steps.length - 1) {
      this.nextBtn.hide();
      this.addToCart.show();
      this.addToCart.prop("disabled", false);
    }
  }

  updateSelectedInfo() {
    $("#popup_quantity").on("change", () => this.getSelectedQuantity());
    $("#hook_spacing").on("change", () => this.getSelectedSpacing());
    $('input[name="option_product"]').on("change", () =>
      this.getSelectedProduct()
    );
    // $('input[name="option_variant"]').on('change', () =>  this.getSelectedVariant());
    $('input[name="option_material"]').on("change", () =>
      this.getSelectedMaterial()
    );
    $("#hook-used").on("input", () => this.getSelectedHooksTOUse());
    $("#wall-type").on("input", () => this.getSelectedWallType());

    this.getSelectedQuantity();
    this.getSelectedSpacing();
    this.getSelectedMaterial();
  }

  getSelectedQuantity() {
    this.selectedQuantity = $("#popup_quantity").val();
    this.resetSelectedColors()
    this.getSelectedSpacing();
    $("#popup_content_message").html(
      `${this.totalQuantity} Selected from ${this.selectedQuantity}`
    );
    console.log("Selected Product Quantity:", this.selectedQuantity);
  }
  resetSelectedColors(){
    $("#popup_content_message").removeClass("success");
    $(".opt_increment").prop("disabled", false);
    $('.selected_option_border').removeClass('selected_option_border')
     //reset colors values
    $(".color_option_number_input input[type='number']").val(0)
    this.totalQuantity = 0
  }
  getSelectedProduct() {
    this.selectedProductId = $('input[name="option_product"]:checked').val();
    this.selectedProductName = $('input[name="option_product"]:checked').attr(
      "data-name"
    );
    this.showSelectedProductOptions();
    this.updateButtons();
    console.log(
      "Selected product id:",
      this.selectedProductId,
      this.selectedProductName
    );
  }

  // for normal selection of colors
  // getSelectedVariant(){
  //   this.selectedVariantId =  $('input[name="option_variant"]:checked').val();
  //   this.selectedVariantName = $('input[name="option_variant"]:checked').attr('data-name');
  //   this.updateButtons();
  //   console.log('Selected variant id:', this.selectedVariantId ,this.selectedVariantName);
  // }

  getSelectedSpacing() {
    const hook = this.selectedQuantity;
    const space = $("#hook_spacing").find("option:selected").attr("space");
    this.selectedSpacing = $("#hook_spacing").val();
    const newImageUrl = sizeImage[hook][space];
    if (!newImageUrl) {
      console.error("Image URL is undefined or invalid:", newImageUrl);
      return; // Prevent further execution
    }
    this.selectedSpacingImg.fadeOut(200, function () {
      // Set the new image source
      $(this)
        .attr("src", newImageUrl)
        .on("load", function () {
          // Fade in the new image
          $(this).fadeIn(200);
        });
      // Trigger load event for the new image
      if (this.complete) {
        $(this).trigger("load");
      }
    });
    // this.selectedSpacingImg.attr('src', sizeImage[hook][space]);
    console.log(
      "Selected Product Spacing:",
      this.selectedSpacing,
      sizeImage[hook][space]
    );
  }

  getSelectedMaterial() {
    this.selectedMaterialValue = $(
      'input[name="option_material"]:checked'
    ).val();
    this.updateButtons();
    console.log("Selected material:", this.selectedMaterialValue);
  }

  getSelectedWallType() {
    this.selectedWallType = $("#wall-type").val();
    console.log(this.selectedWallType);
  }
  getSelectedHooksTOUse() {
    this.hookToUse = $("#hook-used").val();
    console.log(this.hookToUse);
  }

  setupShopifyForm() {
    const inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    var first_name = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.getElementById("first_name");
    var email = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.getElementById("email");
    var product = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.getElementById("custom#product");
    var spacing = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.getElementById("custom#spacing");
    var material = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.getElementById("custom#material");
    var colors = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.querySelector('[name="custom\\#colors"]');
    var wallType = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.querySelector('[name="custom\\#wall_type"]');
    var hookToUse = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.querySelector('[name="custom\\#hooks_be_used"]');
    var submitButton = $("#shopfiy_form_data form-embed")
      .first()
      .get(0)
      .shadowRoot.querySelector("button");

    try {
      // put the values in form
      first_name.value = popup_user;
      email.value = popup_user_email;
      product.value = this.selectedProductName;
      spacing.value = this.selectedSpacing;
      material.value = this.selectedMaterialValue;
      // colors.value = this.selectedVariantName;
      wallType.value = this.selectedWallType;
      hookToUse.value = this.hookToUse;
      this.allVariantsDisplay.forEach(({ id, quantity, color }) => {
        colors.value += `${color} : ${quantity}\n`;
      });

      // trigger the event for input in the form
      first_name.dispatchEvent(inputEvent);
      email.dispatchEvent(inputEvent);
      product.dispatchEvent(inputEvent);
      spacing.dispatchEvent(inputEvent);
      material.dispatchEvent(inputEvent);
      colors.dispatchEvent(inputEvent);
      wallType.dispatchEvent(inputEvent);
      hookToUse.dispatchEvent(inputEvent);
      // submit the form
      submitButton.click();
    } catch (error) {
      console.log(error);
    }
  }

  showSelectedProductOptions() {
    const $popupProductOptions = $(
      `.popup_product_option[product-option="${this.selectedProductId}"]`
    );
    $(".popup_product_option").hide();
    $popupProductOptions.show();
  }

  // setupMaterialDropdowns() {
  //     $('.custom-select.material').each((_, customSelect) => {
  //         const $customSelect = $(customSelect);
  //         const $selectedItem = $customSelect.find('.selected-item');
  //         const $dropdownMenu = $customSelect.find('.dropdown-menu');

  //         $selectedItem.on('click', () => {
  //             $customSelect.toggleClass('active').toggleClass('height-100');
  //             $dropdownMenu.toggle();
  //         });

  //         $dropdownMenu.on('click', 'div[data-value]', (event) => {
  //             const $slectedMaterial = $(event.currentTarget);
  //             this.selectedMaterialValue = $slectedMaterial.attr('data-value');
  //             const selectedImage = $slectedMaterial.find('img').attr('src');
  //             const selectedText = $slectedMaterial.find('span').text();
  //             $selectedItem.find('img').attr('src', selectedImage);
  //             $selectedItem.find('span').text(selectedText);
  //             console.log(this.selectedMaterialValue);
  //             $customSelect.removeClass('active').removeClass('height-100');
  //             $dropdownMenu.hide();
  //            this.updateButtons();
  //         });
  //     });
  // }

  // setupProductsDropdowns() {
  //      $('.custom-select.products').each((_, customSelect) => {
  //          const $customSelect = $(customSelect);
  //          const $selectedItem = $customSelect.find('.selected-item');
  //          const $dropdownMenu = $customSelect.find('.dropdown-menu');

  //          $selectedItem.on('click', () => {
  //              $customSelect.toggleClass('active').toggleClass('height-200');
  //              $dropdownMenu.toggle();
  //          });

  //          $dropdownMenu.on('click', 'div[data-product-id]', (event) => {
  //              const $slectedProduct = $(event.currentTarget);
  //              this.selectedProductId = $slectedProduct.attr('data-product-id');
  //              this.showSelectedProductOptions();
  //              const selectedImage = $slectedProduct.find('img').attr('src');
  //              const selectedText = $slectedProduct.find('span').text();
  //              $selectedItem.find('img').attr('srcset', selectedImage);
  //              $selectedItem.find('span').text(selectedText);
  //              console.log(this.selectedProductId);
  //              $customSelect.removeClass('active').removeClass('height-200');
  //              $dropdownMenu.hide();
  //              this.updateButtons();
  //          });
  //      });
  //  }

  calculateTotalQuantity() {
    let total = 0;
    $(".color_option_number_input input[type='number']").each((_, input) => {
      total += parseInt($(input).val()) || 0;
    });
    return total;
  }
  // for new option selection by quantity box
  setupOptionsQuantity() {
    // for + and - buttons
    $(".opt_increment").on(
      "click",
      function (e) {
        let input = $(e.target).siblings("input");
        input.val(parseInt(input.val()) + 1);
        // this.totalQuantity = Number(this.totalQuantity) + 1;
        this.totalQuantity = this.calculateTotalQuantity();
        console.log(this.totalQuantity);
        input.trigger("input");
      }.bind(this)
    );

    $(".opt_decrement").on(
      "click",
      function (e) {
        let input = $(e.target).siblings("input");
        if (parseInt(input.val()) > parseInt(input.attr("min"))) {
          input.val(parseInt(input.val()) - 1);
          // this.totalQuantity = Number(this.totalQuantity) - 1;
          this.totalQuantity = this.calculateTotalQuantity();
          console.log(this.totalQuantity);
          input.trigger("input");
        }
      }.bind(this)
    );

    $(".color_option_number_input").each((_, customSelect) => {
      const $customSelect = $(customSelect);

      const $selectedItem = $customSelect.find('input[type="number"]');
      // const $dropdownMenu = $customSelect.find('.dropdown-menu');

      $selectedItem.on("input", (event) => {
        if($selectedItem.val() < 0){
          $selectedItem.val(0);
        }
        console.log("quantity", $selectedItem.val());
        console.log("toatl", this.totalQuantity);
        console.log("event", event);
        if (event.originalEvent?.isTrusted) {
         this.totalQuantity = this.calculateTotalQuantity();
       } 
        // console.log($selectedItem.attr("variant-id"));

        if ($selectedItem.val() > 0) {
          $selectedItem.parent().addClass("selected_option_border");
          $customSelect.prev().addClass("selected_option_border");
        } else {
          $selectedItem.parent().removeClass("selected_option_border");
          $customSelect.prev().removeClass("selected_option_border");
        }
        if (this.totalQuantity >= this.selectedQuantity) {
           if (this.totalQuantity == this.selectedQuantity){
             $("#popup_content_message").addClass("success");
             this.addColorQuantity();
           }
          $(".opt_increment").prop("disabled", true);
        } else {
          $("#popup_content_message").removeClass("success");
          $(".opt_increment").prop("disabled", false);
        }
        $("#popup_content_message").html(
          `${this.totalQuantity} Selected from ${this.selectedQuantity}`
        );
        this.updateButtons();
      });
    });
  }

  // for new option selection by quantity box
  addColorQuantity() {
    this.allVariantsToAdd = [];
    this.allVariantsDisplay = [];
    $(".color_option_number_input").each((_, customSelect) => {
      const $customSelect = $(customSelect);
      const $selectedItem = $customSelect.find('input[type="number"]');
      const quantity = $selectedItem.val();
      const id = $selectedItem.attr("variant-id");
      const color = $selectedItem.attr("data-name");
      if (quantity > 0) {
        this.allVariantsToAdd.push({ id, quantity });
        this.allVariantsDisplay.push({ id, quantity, color });
      }
      if ($customSelect.is($(".color_option_number_input").last())) {
        const id = $(".second_product_id").attr("data_product_id");
        const quantity = $("#popup_quantity").val();
        this.allVariantsToAdd.push({ id, quantity });
      }
    });
    console.log(this.allVariantsToAdd);
  }

  // for dropdown option for colors
  // setupOptionsDropdowns() {
  //     $('.custom-select.product-options').each((_, customSelect) => {
  //         const $customSelect = $(customSelect);
  //         const $selectedItem = $customSelect.find('.selected-item');
  //         const $dropdownMenu = $customSelect.find('.dropdown-menu');

  //         $selectedItem.on('click', () => {
  //             $customSelect.toggleClass('active').toggleClass('height-100');
  //             $dropdownMenu.toggle();
  //         });

  //         $dropdownMenu.on('click', 'div[data-option-variant-id]', (event) => {
  //             this.$selectedOption = $(event.currentTarget);
  //             const selectedImage = this.$selectedOption.find('img').attr('src');
  //             const selectedText = this.$selectedOption.find('span').text();
  //             $selectedItem.find('img').attr('srcset', selectedImage);
  //             $selectedItem.find('span').text(selectedText);

  //             $customSelect.removeClass('active').removeClass('height-100');
  //             $dropdownMenu.hide();
  //             this.updateButtons();
  //         });
  //     });

  //     $('#popup_content_message').html(`${this.totalQuantity} left from ${this.selectedQuantity}`);
  // }

  // for dropdown color selection
  // setupVariantAddButton() {
  //     $('.add-to-products').on('click', () => this.addVariants());
  // }

  // for multi color select button, for dropdown color selection
  // addVariants() {
  //     const quantity = $(`.color-select-quantity-input[product-option="${this.selectedProductId}"]`).val() || 1;
  //     const selectedOptionValue = this.$selectedOption.attr('data-option-variant-id');
  //     const selectedOptionColor = this.$selectedOption.attr('data-value');
  //     const imageUrl = this.$selectedOption.find('img').attr('src');

  //     const existingIndex = this.allVariantsToAdd.findIndex(variant => variant.id === selectedOptionValue);
  //     if (existingIndex !== -1) {
  //         const totalIn = this.totalQuantity + Number(quantity) - Number(this.allVariantsToAdd[existingIndex].quantity);
  //         if (totalIn <= this.selectedQuantity) {
  //             this.totalQuantity = this.totalQuantity + Number(quantity) - Number(this.allVariantsToAdd[existingIndex].quantity);
  //         } else {
  //             this.totalQuantity += Number(quantity);
  //         }
  //     } else {
  //         this.totalQuantity += Number(quantity);
  //     }

  //     if (this.totalQuantity <= this.selectedQuantity) {
  //         if (existingIndex !== -1) {
  //             this.allVariantsToAdd[existingIndex] = { id: selectedOptionValue, quantity };
  //             this.allVariantsDisplay[existingIndex] = { id: selectedOptionValue, quantity, imageUrl, selectedOptionColor };
  //         } else {
  //             this.allVariantsToAdd.push({ id: selectedOptionValue, quantity });
  //             this.allVariantsDisplay.push({ id: selectedOptionValue, quantity, imageUrl, selectedOptionColor });
  //         }
  //         $('#popup_content_message').html(`${this.totalQuantity} left from ${this.selectedQuantity}`);
  //     } else {
  //         this.totalQuantity -= Number(quantity);
  //         $('#popup_content_message').html(`${this.totalQuantity} left from ${this.selectedQuantity}. Unable to add more than ${this.selectedQuantity}`);
  //     }
  //      this.displaySelectedVariants();
  //      this.updateButtons();
  // }

  // display the selected color variants
  displaySelectedVariants() {
    $("#selected-variants").html("");
    this.allVariantsDisplay.forEach(
      ({ id, quantity, imageUrl, selectedOptionColor }) => {
        const listItem = $("<li></li>").html(
          `<img src="${imageUrl}" alt="Product Image" style="width: 50px; height: 50px; margin-right: 10px;">${selectedOptionColor} - Quantity: ${quantity}`
        );
        $("#selected-variants").append(listItem);
      }
    );
  }

  setupAddToCart() {
    this.addToCart.on("click", () => {
      this.addToCart.prop("disabled", true);
      if (this.selectedVariantId) {
        // const truncateText = (text, maxLength = 255) => {
        //     return text.length > maxLength ? text.slice(0, maxLength) : text;
        //   };
        //    const properties = {
        //     NOTE:"CUSTOM RACK",
        //     SPACING: this.selectedSpacing,
        //     MATERIAL: this.selectedMaterialValue
        //   };
        //  if (this.selectedWallType !== null) {
        //       properties["WALL TYPE"] = truncateText(this.selectedWallType);
        //     }
        // if (this.hookToUse !== null) {
        //       properties["HOOKS BE USED"] = truncateText(this.hookToUse);
        //   }
        //   const items = [
        //         {
        //           id: this.selectedVariantId, // Variant ID
        //           quantity: this.selectedQuantity, // Quantity
        //           properties: properties // Dynamically generated properties
        //           }
        //         ];
        //   this.addItemsToCart(items).then(() => {
        //     this.addToCart.text('Items added to cart');
        //      this.setupShopifyForm();
        //    $('.custom_form_content').hide();
        //     setTimeout(function() {
        //       $('#popup_thank_you').show();
        //     }, 3000);
        //   });
      }
      if (this.allVariantsToAdd.length !== 0) {
        console.log("non", this.allVariantsToAdd.lenght);
        console.log("add to cart");
        // for the multi color add to cart
        const truncateText = (text, maxLength = 255) => {
          return text.length > maxLength ? text.slice(0, maxLength) : text;
        };
        const included_in = this.allVariantsDisplay
          .map((variant) => `${variant.color}:${variant.quantity}`)
          .join("/");
        function getCurrentTimeWithRandomDigits() {
          const now = new Date();
          const hours = String(now.getHours()).padStart(2, "0"); // Ensures 2 digits
          const minutes = String(now.getMinutes()).padStart(2, "0"); // Ensures 2 digits
          const randomDigits = Math.floor(Math.random() * 10); // Random one-digit number

          // Combine time and random digits
          return `${hours}${minutes}${randomDigits}`;
        }
        const secondproduct_id =
          $(".second_product_id").attr("data_product_id");
        const second_productqty = $("#popup_quantity").val();
        const spaceval = $("#hook_spacing")
          .find("option:selected")
          .attr("space");
        const properties = {
          'SIZE IN INCHES':second_productqty  * spaceval,
          'TOTAL HOOKS':$("#popup_quantity").val(),
          'HOOK INFO': this.selectedProductName + '-' +included_in,
          'DESIGNER RACK': getCurrentTimeWithRandomDigits(),
          SPACING: this.selectedSpacing,
          MATERIAL: this.selectedMaterialValue,
        };
        if (this.hookToUse !== null) {
          properties["HOOKS TO BE USED"] = truncateText(this.hookToUse);
        }

        const variantToAdd =  this.allVariantsToAdd.find((item) => {
          if (item.id == secondproduct_id) {
            return true
          }
          return false
        });
        variantToAdd.properties = properties
        variantToAdd.quantity = second_productqty * spaceval
        this.allVariantsDisplay.forEach((item,index) => {
          let colorLabel = `_Color ${index+1}`
          let idLabel = `_variant-${item.id}`
          variantToAdd.properties = {
            ...variantToAdd.properties,
            [idLabel]:item.quantity,
            [colorLabel]:item.color
          }
        });
        console.log(this.allVariantsToAdd);
        this.addItemsToCart(variantToAdd).then(() => {
          // console.log(this.selectedWallType,this.hookToUse)
          this.setCartNote(
            `SPACING:${this.selectedSpacing} , MATERIAL:${this.selectedMaterialValue} ,HOOKS BE USED:${this.hookToUse}`
          );
          this.addToCart.prop("disabled", true);
          this.addToCart.text("Items added to cart");
          this.setupShopifyForm();
          $(".custom_form_content").hide();
          setTimeout(function () {
            $("#popup_thank_you").show();
          }, 3000);
          // window.location.href = window.location.origin + '/cart';
        });

        // for clearing the cart
        //  this.clearCart().then(() => {

        // }).catch(error => {
        // console.error('Error clearing cart:', error);
        // // Re-enable the button in case of an error
        // this.addToCart.prop('disabled', false);
        // });
      }
    });
  }

  addItemsToCart(item) {
    return fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: [item] }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Items added to the cart:", data);
      })
      .catch((error) => {
        console.error("Error adding items to the cart:", error);
      });
  }
  setCartNote(note) {
    return fetch("/cart/update.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: note }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Cart note set:", data);
      })
      .catch((error) => {
        console.error("Error setting cart note:", error);
      });
  }

  clearCart() {
    return fetch("/cart/clear.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

$(document).ready(() => {
  new CustomPopup();
});
