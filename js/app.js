/* ═══════════════════════════════════════════════════
   Tripzo — Main Application JavaScript
   ═══════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  /* ── LOADER ── */
  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("done");
  }, 2200);

  /* ── CUSTOM CURSOR ── */
  const cursor = document.getElementById("cursor");
  const cursorFollower = document.getElementById("cursorFollower");
  let mouseX = 0,
    mouseY = 0;
  let followerX = 0,
    followerY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursor) {
      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
    }
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    if (cursorFollower) {
      cursorFollower.style.left = followerX + "px";
      cursorFollower.style.top = followerY + "px";
    }
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (cursor) {
        cursor.style.width = "16px";
        cursor.style.height = "16px";
      }
      if (cursorFollower) {
        cursorFollower.style.width = "48px";
        cursorFollower.style.height = "48px";
      }
    });
    el.addEventListener("mouseleave", () => {
      if (cursor) {
        cursor.style.width = "8px";
        cursor.style.height = "8px";
      }
      if (cursorFollower) {
        cursorFollower.style.width = "32px";
        cursorFollower.style.height = "32px";
      }
    });
  });

  /* ── NAV SCROLL ── */
  const nav = document.getElementById("nav");
  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    () => {
      const currentScroll = window.scrollY;
      if (nav) {
        nav.classList.toggle("scrolled", currentScroll > 60);
      }
      lastScroll = currentScroll;
    },
    { passive: true },
  );

  /* ── HAMBURGER ── */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  window.closeMobileMenu = () => {
    hamburger?.classList.remove("open");
    mobileMenu?.classList.remove("open");
    document.body.style.overflow = "";
  };

  hamburger?.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("open");
    mobileMenu?.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  /* ── HERO SLIDESHOW ── */
  const slides = document.querySelectorAll(".hero-slide");
  const slideDots = document.querySelectorAll(".slide-dot");
  let currentSlide = 0;

  function goToSlide(n) {
    slides[currentSlide]?.classList.remove("active");
    slideDots[currentSlide]?.classList.remove("active");
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide]?.classList.add("active");
    slideDots[currentSlide]?.classList.add("active");
  }

  slideDots.forEach((dot, i) =>
    dot.addEventListener("click", () => goToSlide(i)),
  );

  const slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
  window.addEventListener("beforeunload", () => clearInterval(slideInterval));

  /* ── COUNTER ANIMATION ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(tick);
  }

  /* ── SCROLL REVEAL + COUNTERS ── */
  const revealEls = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right",
  );
  const counterEls = document.querySelectorAll(".stat-num");
  let countersStarted = false;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(
            () => entry.target.classList.add("revealed"),
            parseInt(delay),
          );
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        counterEls.forEach((el) => animateCounter(el));
      }
    },
    { threshold: 0.5 },
  );

  const heroStats = document.querySelector(".hero-stats");
  if (heroStats) counterObserver.observe(heroStats);

  /* ── DESTINATION CARDS ── */
  let shownCount = 6;
  const LOAD_MORE_COUNT = 3;

  function renderDestinations(filter = "all") {
    const grid = document.getElementById("destGrid");
    if (!grid || typeof DESTINATIONS === "undefined") return;

    const filtered =
      filter === "all"
        ? DESTINATIONS
        : DESTINATIONS.filter((d) => d.filter === filter);

    grid.innerHTML = filtered
      .slice(0, shownCount)
      .map(
        (d) => `
      <div class="dest-card${d.featured ? " featured" : ""}" data-filter="${d.filter}">
        <div class="dest-img">
          <img src="${d.img}" alt="${d.alt}" loading="lazy"/>
          <span class="dest-tag">${d.tag}</span>
          <button class="dest-wishlist" onclick="toggleWishlist(this, ${d.id})" aria-label="Add to wishlist">♡</button>
        </div>
        <div class="dest-body">
          <p class="dest-price">Starting from <strong>${d.price}</strong></p>
          <h3 class="dest-name">${d.name}</h3>
          <p class="dest-location">${d.location}</p>
          <div class="dest-meta">
            <span class="dest-rating">${d.rating}</span>
            <span class="dest-duration">⏱ ${d.duration}</span>
          </div>
          <button class="dest-btn" onclick="openBookingModal('${d.name}')">View Details</button>
        </div>
      </div>
    `,
      )
      .join("");

    // Re-observe new cards
    grid.querySelectorAll(".dest-card").forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "none";
      }, i * 80);
    });
  }

  window.loadMoreDestinations = () => {
    shownCount += LOAD_MORE_COUNT;
    const active = document.querySelector(".filter-btn.active");
    const filter = active ? active.dataset.filter : "all";
    renderDestinations(filter);
    showNotification("More destinations loaded ✓");
  };

  window.toggleWishlist = (btn, id) => {
    btn.classList.toggle("liked");
    btn.textContent = btn.classList.contains("liked") ? "♥" : "♡";
    const dest = DESTINATIONS.find((d) => d.id === id);
    showNotification(
      btn.classList.contains("liked")
        ? `${dest?.name} added to wishlist ♥`
        : `${dest?.name} removed from wishlist`,
    );
  };

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      shownCount = 6;
      renderDestinations(btn.dataset.filter);
    });
  });

  renderDestinations();

  /* ── SEARCH FORM ── */
  const destInput = document.getElementById("destInput");
  const suggestionsEl = document.getElementById("suggestions");
  const allDestNames =
    typeof DESTINATIONS !== "undefined"
      ? DESTINATIONS.map((d) => ({
          name: d.name,
          location: d.location.replace(/📍 /, ""),
        }))
      : [];

  destInput?.addEventListener("input", () => {
    const val = destInput.value.trim().toLowerCase();
    if (!val || val.length < 2) {
      suggestionsEl?.classList.remove("show");
      return;
    }

    const matches = allDestNames
      .filter(
        (d) =>
          d.name.toLowerCase().includes(val) ||
          d.location.toLowerCase().includes(val),
      )
      .slice(0, 5);

    if (matches.length && suggestionsEl) {
      suggestionsEl.innerHTML = matches
        .map(
          (m) => `
        <div class="suggestion-item" onclick="selectSuggestion('${m.name}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${m.name} <span style="color:var(--white-dim);font-size:0.75rem;margin-left:auto">${m.location}</span>
        </div>
      `,
        )
        .join("");
      suggestionsEl.classList.add("show");
    } else {
      suggestionsEl?.classList.remove("show");
    }
  });

  window.selectSuggestion = (name) => {
    if (destInput) destInput.value = name;
    suggestionsEl?.classList.remove("show");
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".input-wrap"))
      suggestionsEl?.classList.remove("show");
  });

  // Set min dates
  const today = new Date().toISOString().split("T")[0];
  const departDate = document.getElementById("departDate");
  const returnDate = document.getElementById("returnDate");
  if (departDate) {
    departDate.min = today;
    departDate.value = today;
  }
  if (returnDate) {
    returnDate.min = today;
  }
  departDate?.addEventListener("change", () => {
    if (returnDate) returnDate.min = departDate.value;
  });

  // Search form submit
  document.getElementById("searchForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const dest = destInput?.value.trim();
    if (!dest) {
      destInput?.focus();
      showNotification("Please enter a destination ✈");
      return;
    }
    openBookingModal(dest);
  });

  /* ── BOOKING MODAL ── */
  window.openBookingModal = (destination = "") => {
    const modal = document.getElementById("bookingModal");
    if (!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (destination) {
      const bkDest = document.getElementById("bkDest");
      if (bkDest) bkDest.value = destination;
    }
  };

  window.closeBookingModal = () => {
    const modal = document.getElementById("bookingModal");
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  };

  document.getElementById("bookingModal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeBookingModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBookingModal();
  });

  // Booking form validation & submit
  document.getElementById("bookingForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: "bkFirstName", label: "First name" },
      { id: "bkLastName", label: "Last name" },
      { id: "bkEmail", label: "Email", type: "email" },
      { id: "bkDest", label: "Destination" },
    ];

    fields.forEach((f) => {
      const input = document.getElementById(f.id);
      const err = document.getElementById("err-" + f.id);
      let msg = "";

      if (!input?.value.trim()) {
        msg = `${f.label} is required`;
        valid = false;
      } else if (
        f.type === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)
      ) {
        msg = "Please enter a valid email address";
        valid = false;
      }

      if (err) err.textContent = msg;
      if (input) {
        input.style.borderColor = msg ? "var(--accent)" : "";
        if (!msg) input.style.borderColor = "";
      }
    });

    if (!valid) return;

    const btn = e.target.querySelector(".modal-submit");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = "Sending... ✓";
    btn.disabled = true;

    setTimeout(() => {
      closeBookingModal();
      e.target.reset();
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      showNotification(
        "🎉 Request sent! A Tripzo specialist will contact you within 24 hours.",
      );
    }, 1500);
  });

  // Clear error on input
  document
    .querySelectorAll(".modal-field input, .modal-field select")
    .forEach((input) => {
      input.addEventListener("input", () => {
        const errId = "err-" + input.id;
        const err = document.getElementById(errId);
        if (err) err.textContent = "";
        input.style.borderColor = "";
      });
    });

  /* ── NEWSLETTER FORM ── */
  document.getElementById("newsletterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("nlEmail");
    if (
      !email?.value.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
    ) {
      showNotification("Please enter a valid email address");
      return;
    }
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = "✓ Subscribed!";
    btn.disabled = true;
    email.value = "";
    showNotification(
      "Welcome to Tripzo! Check your inbox for a welcome gift 🎁",
    );
    setTimeout(() => {
      btn.innerHTML =
        'Subscribe <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      btn.disabled = false;
    }, 3000);
  });

  /* ── TESTIMONIAL CAROUSEL ── */
  const cards = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".cdot");
  let currentCard = 0;

  function goToCard(n) {
    cards[currentCard]?.classList.remove("active");
    dots[currentCard]?.classList.remove("active");
    currentCard = (n + cards.length) % cards.length;
    cards[currentCard]?.classList.add("active");
    dots[currentCard]?.classList.add("active");
  }

  document
    .getElementById("testimonialPrev")
    ?.addEventListener("click", () => goToCard(currentCard - 1));
  document
    .getElementById("testimonialNext")
    ?.addEventListener("click", () => goToCard(currentCard + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => goToCard(i)));

  // Auto-advance
  setInterval(() => goToCard(currentCard + 1), 6000);

  /* ── TOAST NOTIFICATIONS ── */
  window.showNotification = (msg) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove("show"), 3500);
  };

  /* ── SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});
