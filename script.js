"use strict";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Starting initialization");
  initializeMenu();
  initializeCarousel();
});

// =============================================
// MENU FUNCTIONALITY
// =============================================
function initializeMenu() {
  const menuToggleBtn = document.getElementById("menu-btn");
  const menuElement = document.querySelector(".menu");
  if (!menuToggleBtn || !menuElement) {
    console.error("Menu elements missing.");
    return;
  }
  const closeMenuBtn = menuElement.querySelector(".close-btn");

  const openMenu = () => {
    menuElement.classList.add("active");
    menuToggleBtn.setAttribute("aria-expanded", "true");
    menuElement.setAttribute("aria-hidden", "false");
    if (closeMenuBtn) setTimeout(() => closeMenuBtn.focus(), 50);
  };

  const closeMenu = () => {
    menuElement.classList.remove("active");
    menuToggleBtn.setAttribute("aria-expanded", "false");
    menuElement.setAttribute("aria-hidden", "true");
    if (document.body.contains(menuToggleBtn)) menuToggleBtn.focus();
  };

  menuToggleBtn.addEventListener("click", openMenu);
  closeMenuBtn?.addEventListener("click", closeMenu);

  document.addEventListener("click", (event) => {
    const isClickInsideMenu = menuElement.contains(event.target);
    const isClickOnToggleButton = menuToggleBtn.contains(event.target);
    if (
      !isClickInsideMenu &&
      !isClickOnToggleButton &&
      menuElement.classList.contains("active")
    )
      closeMenu();
  });
}

// =============================================
// SIMPLIFIED CAROUSEL FUNCTIONALITY
// =============================================
function initializeCarousel() {
  console.log("Initializing carousel...");

  // Get elements with detailed logging
  const carouselContainer = document.querySelector(".carousel-container");
  const scrollLeftBtn = document.querySelector(".scroll-left");
  const scrollRightBtn = document.querySelector(".scroll-right");
  const carouselItems = document.querySelectorAll(".carousel-item");
  const photoInfoElement = document.getElementById("photoInfo");

  // Debug logging
  console.log("Carousel elements found:", {
    carouselContainer: !!carouselContainer,
    scrollLeftBtn: !!scrollLeftBtn,
    scrollRightBtn: !!scrollRightBtn,
    carouselItems: carouselItems.length,
    photoInfoElement: !!photoInfoElement,
  });

  if (!carouselContainer) {
    console.error("Carousel container not found!");
    return;
  }

  if (!scrollLeftBtn || !scrollRightBtn) {
    console.error(
      "Arrow buttons not found! Left:",
      !!scrollLeftBtn,
      "Right:",
      !!scrollRightBtn
    );
    return;
  }

  if (carouselItems.length === 0) {
    console.error("No carousel items found!");
    return;
  }

  let isScrolling = false;
  let currentImageIndex = 0;

  // Calculate the scroll amount for one image
  function getImageScrollAmount() {
    if (carouselItems.length === 0) return 300;

    // Get the first image and gap from CSS
    const firstItem = carouselItems[0];
    const itemWidth = firstItem.offsetWidth;

    // Get gap from computed styles (1.5rem = 24px typically)
    const carousel = document.querySelector(".carousel");
    const gapValue = window.getComputedStyle(carousel).gap;
    let gap = 24; // default fallback

    if (gapValue && gapValue !== "normal") {
      gap = parseFloat(gapValue);
    }

    const scrollAmount = itemWidth + gap;
    console.log(
      `Image width: ${itemWidth}px, Gap: ${gap}px, Scroll amount: ${scrollAmount}px`
    );
    return scrollAmount;
  }

  // Scroll exactly one image at a time
  function scrollCarousel(direction) {
    if (isScrolling) {
      console.log("Already scrolling, ignoring click");
      return;
    }

    isScrolling = true;

    const scrollAmount = getImageScrollAmount();
    const currentScroll = carouselContainer.scrollLeft;
    const maxScroll =
      carouselContainer.scrollWidth - carouselContainer.offsetWidth;

    let targetScroll;
    if (direction === "left") {
      currentImageIndex = Math.max(0, currentImageIndex - 1);
      targetScroll = Math.max(0, currentScroll - scrollAmount);
    } else {
      currentImageIndex = Math.min(
        carouselItems.length - 1,
        currentImageIndex + 1
      );
      targetScroll = Math.min(maxScroll, currentScroll + scrollAmount);
    }

    console.log(`Scrolling ${direction} to image ${currentImageIndex + 1}`);
    console.log(
      `Current scroll: ${currentScroll}px, Target: ${targetScroll}px`
    );

    // Use smooth scrolling
    carouselContainer.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });

    // Reset flag after animation
    setTimeout(() => {
      isScrolling = false;
      console.log(
        `Scroll complete. Now showing image ${currentImageIndex + 1}`
      );

      // Update photo info to match current image
      updatePhotoInfo(currentImageIndex + 1);

      // Update background with current image
      const currentImg = carouselItems[currentImageIndex].querySelector("img");
      if (currentImg && currentImg.complete) {
        updateBackground(currentImg.src);
      }
    }, 400);
  }

  // Add click listeners with detailed logging
  scrollLeftBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("LEFT ARROW CLICKED!");
    scrollCarousel("left");
  });

  scrollRightBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("RIGHT ARROW CLICKED!");
    scrollCarousel("right");
  });

  // Test if buttons are clickable
  console.log("Testing button accessibility...");
  console.log(
    "Left button style:",
    window.getComputedStyle(scrollLeftBtn).pointerEvents
  );
  console.log(
    "Right button style:",
    window.getComputedStyle(scrollRightBtn).pointerEvents
  );

  // Add visual feedback for debugging
  scrollLeftBtn.style.border = "2px solid red";
  scrollRightBtn.style.border = "2px solid red";

  // Remove borders after 3 seconds
  setTimeout(() => {
    scrollLeftBtn.style.border = "";
    scrollRightBtn.style.border = "";
  }, 3000);

  // Setup images with proper loading
  carouselItems.forEach((item, index) => {
    const img = item.querySelector("img");
    if (img) {
      console.log(`Setting up image ${index + 1}:`, img.src);

      // Add loading indicator
      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "loading-indicator";
      item.appendChild(loadingIndicator);

      // Handle image load
      const handleImageLoad = () => {
        console.log(`Image ${index + 1} loaded successfully`);
        img.classList.add("loaded");
        loadingIndicator.style.opacity = "0";
        setTimeout(() => {
          if (loadingIndicator.parentNode) {
            loadingIndicator.remove();
          }
        }, 300);

        // Update info for first image
        if (index === 0) {
          updatePhotoInfo(index + 1);
          updateBackground(img.src);
        }
      };

      // Handle image error
      const handleImageError = () => {
        console.error(`Image ${index + 1} failed to load:`, img.src);
        img.alt = "Error loading image";
        img.classList.add("loaded");
        loadingIndicator.style.opacity = "0";
        setTimeout(() => {
          if (loadingIndicator.parentNode) {
            loadingIndicator.remove();
          }
        }, 300);
      };

      img.addEventListener("load", handleImageLoad);
      img.addEventListener("error", handleImageError);

      // If image is already loaded
      if (img.complete && img.naturalHeight > 0) {
        handleImageLoad();
      }

      // Set up click handler for modal
      item.addEventListener("click", () => {
        console.log(`Image ${index + 1} clicked`);
        openModal(img);
      });

      // Make item focusable
      item.setAttribute("tabindex", "0");
    } else {
      console.warn(`No image found in carousel item ${index + 1}`);
    }
  });

  // Simple photo info update
  function updatePhotoInfo(photoNumber) {
    if (photoInfoElement) {
      photoInfoElement.textContent = `[${String(photoNumber).padStart(
        2,
        "0"
      )}]`;
    }
  }

  // Simple background update
  function updateBackground(imageSrc) {
    document.body.style.backgroundImage = `url('${imageSrc}')`;
  }

  // Find current center image and update info
  function updateCurrentImage() {
    const containerCenter =
      carouselContainer.scrollLeft + carouselContainer.offsetWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    carouselItems.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(containerCenter - itemCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const centerImg = carouselItems[closestIndex].querySelector("img");
    if (centerImg) {
      updatePhotoInfo(closestIndex + 1);
      updateBackground(centerImg.src);
    }
  }

  // Update on scroll end
  let scrollTimeout;
  carouselContainer.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateCurrentImage, 200);
  });

  // Modal functionality
  let currentModal = null;

  function openModal(img) {
    if (currentModal) return;

    const modal = document.createElement("div");
    modal.className = "modal visible";
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close-btn" aria-label="Close">&times;</button>
        <img src="${img.src}" alt="${img.alt}">
      </div>
    `;

    const closeBtn = modal.querySelector(".modal-close-btn");
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
    currentModal = modal;
  }

  function closeModal() {
    if (currentModal) {
      currentModal.remove();
      currentModal = null;
      document.body.style.overflow = "";
    }
  }

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && currentModal) {
      closeModal();
    } else if (!currentModal) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollCarousel("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollCarousel("right");
      }
    }
  });

  // Add scroll position debugging
  console.log("Carousel container info:");
  console.log(`Container width: ${carouselContainer.offsetWidth}px`);
  console.log(`Total scroll width: ${carouselContainer.scrollWidth}px`);
  console.log(`Number of images: ${carouselItems.length}`);

  // Calculate if all images fit
  const totalImagesWidth = Array.from(carouselItems).reduce((total, item) => {
    return total + item.offsetWidth;
  }, 0);
  console.log(`Total images width: ${totalImagesWidth}px`);

  // Check carousel layout
  setTimeout(() => {
    console.log("After layout:");
    console.log(`Container width: ${carouselContainer.offsetWidth}px`);
    console.log(`Scroll width: ${carouselContainer.scrollWidth}px`);
    console.log(
      `Can scroll: ${
        carouselContainer.scrollWidth > carouselContainer.offsetWidth
      }`
    );
  }, 1000);
}
