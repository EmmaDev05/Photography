"use strict";

// Wrap slideshow logic in an IIFE or init function
(function initializeAboutPage() {
  // --- MENU LOGIC (Keep for this page as elements exist) ---
  // Ideally, move this to a shared menu.js file and call initialization there
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.querySelector(".menu .close-btn"); // More specific selector
  const menu = document.querySelector(".menu");

  const openMenu = () => menu?.classList.add("active");
  const closeMenu = () => menu?.classList.remove("active");

  if (menuBtn && closeBtn && menu) {
    menuBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    document.addEventListener("click", (event) => {
      const isClickInside =
        menu.contains(event.target) || menuBtn.contains(event.target);
      if (!isClickInside && menu.classList.contains("active")) {
        closeMenu();
      }
    });
    menu.addEventListener("click", (event) => {
      // Allow clicks on links inside menu, stop others
      if (event.target.tagName !== "A") {
        event.stopPropagation();
      } else {
        // Optional: close menu when a link inside is clicked
        // setTimeout(closeMenu, 100); // Slight delay maybe needed
      }
    });
    // Add basic keyboard accessibility for menu elements if not handled globally
    menuBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenu();
      }
    });
    closeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        closeMenu();
      }
    });
    menu.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  } else {
    console.warn("Menu elements not found for about page listeners.");
  }
  // --- END OF MENU LOGIC ---

  // --- SLIDESHOW LOGIC ---
  const IMAGE_PATHS = [
    "./new-img/pexels-yaroslav-shuraev-5980162.jpg",
    "./new-img/pexels-pixabay-157675.jpg",
    "./new-img/pexels-cottonbro-6221576.jpg",
    "./new-img/pexels-harsh-kushwaha-804217-1721558.jpg",
    "./new-img/pexels-hiddencouple-3048527.jpg",
    "./new-img/pexels-maksgelatin-4757966.jpg",
    "./new-img/pexels-tomaz-barcellos-999425-1987301.jpg",
    "./new-img/pexels-khoa-vo-2347168-4918385.jpg",
    "./new-img/pexels-timegrocery-5267760.jpg",
    "./new-img/pexels-botanicalnature-5290758.jpg",
  ];
  const IMAGE_DURATION_MS = 5000;
  const FADE_DURATION_MS = 800; // Should match CSS transition duration for #carousel

  // Use original IDs from HTML
  const carouselElement = document.getElementById("carousel");
  const countdownElement = document.getElementById("countdown");
  const overlayElement = document.getElementById("overlay");
  const textContainerElement = document.getElementById("text-container");

  if (
    !carouselElement ||
    !countdownElement ||
    !overlayElement ||
    !textContainerElement
  ) {
    console.error("Slideshow elements missing!");
    return;
  }

  let currentIndex = 0;
  let imageChangeIntervalId = null;
  let countdownStartTime = null;
  let countdownAnimationFrameId = null;
  const totalDurationSeconds = IMAGE_PATHS.length * (IMAGE_DURATION_MS / 1000);
  let preloadedImages = []; // Array to hold preloaded image objects

  function preloadImages(imageUrls) {
    const promises = imageUrls.map((src) => {
      return new Promise((resolve) => {
        // Don't reject Promise.all on single image failure
        const img = new Image();
        img.onload = () => resolve(img); // Resolve with the image object
        img.onerror = () => {
          console.error("Failed to preload:", src);
          resolve(null); // Resolve with null on error
        };
        img.src = src;
      });
    });
    // Store preloaded images (optional, useful if you need dimensions etc.)
    Promise.all(promises).then((images) => {
      preloadedImages = images.filter((img) => img !== null); // Filter out failed loads
      console.log(
        `Preloaded ${preloadedImages.length}/${IMAGE_PATHS.length} images.`
      );
    });
    return Promise.all(promises); // Return the promise for waiting
  }

  function changeImage() {
    currentIndex++;
    if (currentIndex >= IMAGE_PATHS.length) {
      clearInterval(imageChangeIntervalId); // Stop interval when done
      return;
    }

    carouselElement.style.opacity = 0; // Start fade out

    // Change image source partway through fade
    setTimeout(() => {
      if (currentIndex < IMAGE_PATHS.length) {
        carouselElement.style.backgroundImage = `url(${IMAGE_PATHS[currentIndex]})`;
        carouselElement.style.opacity = 1; // Start fade in
      }
    }, FADE_DURATION_MS * 0.7); // Adjust timing (e.g., 70% through fade)
  }

  function updateCountdown(timestamp) {
    if (!countdownStartTime) countdownStartTime = timestamp;

    const elapsedSeconds = Math.floor((timestamp - countdownStartTime) / 1000);
    const timeLeft = Math.max(0, totalDurationSeconds - elapsedSeconds);

    if (countdownElement.textContent !== String(timeLeft)) {
      countdownElement.textContent = timeLeft;
    }

    if (timeLeft > 0) {
      countdownAnimationFrameId = requestAnimationFrame(updateCountdown);
    } else {
      endShow(); // End when timer reaches zero
    }
  }

  function endShow() {
    console.log("Ending slideshow...");
    // Clear intervals/animations
    clearInterval(imageChangeIntervalId);
    imageChangeIntervalId = null;
    cancelAnimationFrame(countdownAnimationFrameId);
    countdownAnimationFrameId = null;

    // Fade out last image and countdown
    if (carouselElement) carouselElement.style.opacity = 0;
    if (countdownElement) countdownElement.classList.add("hidden");

    // Activate overlay (triggers background fade to white in CSS)
    if (overlayElement) overlayElement.classList.add("active");

    // Show final text (triggers fade-in via CSS)
    if (textContainerElement) {
      // Ensure display is correct before adding visible class
      textContainerElement.style.display = "flex"; // Or 'block' if flex isn't needed
      requestAnimationFrame(() => {
        textContainerElement.classList.add("visible");
      });
    }
  }

  async function startShow() {
    if (IMAGE_PATHS.length === 0) {
      console.warn("No images provided.");
      endShow(); // Go straight to end if no images
      return;
    }

    // Set initial state before preloading
    carouselElement.style.backgroundImage = `url(${IMAGE_PATHS[0]})`;
    carouselElement.style.opacity = 1; // Ensure first image is visible
    countdownElement.textContent = totalDurationSeconds;

    try {
      await preloadImages(IMAGE_PATHS); // Wait for images
      console.log("Preloading finished.");

      // Start intervals/animations only after preloading
      imageChangeIntervalId = setInterval(changeImage, IMAGE_DURATION_MS);
      countdownAnimationFrameId = requestAnimationFrame(updateCountdown);
    } catch (error) {
      console.error("Slideshow start failed:", error);
      // Handle error display if needed
    }
  }

  // Start the process
  startShow();
})(); // Immediately Invoked Function Expression (IIFE)
