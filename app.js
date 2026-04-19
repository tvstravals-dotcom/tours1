/* =============================================
   TVS TOURS & TRAVELS - MAIN SCRIPT
   ============================================= */

// ---- HEADER SCROLL EFFECT ----
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
  updateActiveNav();
});

// ---- MOBILE HAMBURGER ----
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");
const navOverlay = document.getElementById("nav-overlay");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
  navOverlay.classList.toggle("open");
  document.body.classList.toggle("menu-open");
});
// Close menu on nav link click
document.querySelectorAll(".nav-link, .nav-btn").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    navOverlay.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});
// Close menu on overlay click
navOverlay.addEventListener("click", () => {
  hamburger.classList.remove("open");
  navLinks.classList.remove("open");
  navOverlay.classList.remove("open");
  document.body.classList.remove("menu-open");
});

// ---- ACTIVE NAV LINK ----
function updateActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  let current = "";
  sections.forEach((sec) => {
    const sectionTop = sec.offsetTop - 140;
    if (window.scrollY >= sectionTop) {
      current = sec.getAttribute("id");
    }
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
}

// ---- HERO SLIDER ----
const slides = document.querySelectorAll(".hero-slide");
let currentSlide = 0;
let slideTimer;

function goToSlide(index) {
  slides[currentSlide].classList.remove("active");
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
}

function startSlider() {
  slideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
}

document.getElementById("slide-next").addEventListener("click", () => {
  clearInterval(slideTimer);
  goToSlide(currentSlide + 1);
  startSlider();
});
document.getElementById("slide-prev").addEventListener("click", () => {
  clearInterval(slideTimer);
  goToSlide(currentSlide - 1);
  startSlider();
});
startSlider();

// ---- TESTIMONIAL SLIDER ----
const testimonialCards = document.querySelectorAll(".testimonial-card");
const dots = document.querySelectorAll(".dot");
let currentTestimonial = 0;
let testimonialTimer;

function goToTestimonial(index) {
  testimonialCards[currentTestimonial].classList.remove("active");
  dots[currentTestimonial].classList.remove("active");
  currentTestimonial =
    (index + testimonialCards.length) % testimonialCards.length;
  testimonialCards[currentTestimonial].classList.add("active");
  dots[currentTestimonial].classList.add("active");
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    clearInterval(testimonialTimer);
    goToTestimonial(parseInt(dot.dataset.index));
    startTestimonialTimer();
  });
});

function startTestimonialTimer() {
  testimonialTimer = setInterval(
    () => goToTestimonial(currentTestimonial + 1),
    4500,
  );
}
startTestimonialTimer();

// ---- SCROLL REVEAL ----
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add("visible");
    }
  });
}

// Add reveal class to key elements
function addRevealClasses() {
  const toReveal = document.querySelectorAll(
    ".service-card, .package-card, .fleet-card, .about-img-main, .about-content, .contact-card, .fleet-card, .section-header",
  );
  toReveal.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 0.1 + "s";
  });
}
addRevealClasses();
window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// ---- QUICK BOOK HANDLER ----
function handleQuickBook() {
  const from = document.getElementById("from-location").value;
  const to = document.getElementById("to-location").value;
  const date = document.getElementById("travel-date").value;
  const vehicle = document.getElementById("vehicle-type").value;

  if (!from && !to) {
    showToast("Please enter pickup and drop locations!", "warning");
    return;
  }

  // Pre-fill the enquiry form
  if (from) document.getElementById("enq-from").value = from;
  if (to) document.getElementById("enq-to").value = to;
  if (date) document.getElementById("enq-date").value = date;
  if (vehicle) document.getElementById("enq-vehicle").value = vehicle;

  document.getElementById("enquiry").scrollIntoView({ behavior: "smooth" });
}

// ---- ENQUIRY FORM HANDLER ----
function handleEnquiry(e) {
  e.preventDefault();

  const name = document.getElementById("enq-name").value.trim();
  const phone = document.getElementById("enq-phone").value.trim();
  const from = document.getElementById("enq-from").value.trim();
  const to = document.getElementById("enq-to").value.trim();
  const date = document.getElementById("enq-date").value;
  const vehicle = document.getElementById("enq-vehicle").value;
  const message = document.getElementById("enq-message").value.trim();

  if (!name || !phone) {
    showToast("Please fill in your name and phone number.", "warning");
    return;
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\s+/g, "").replace("+91", ""))) {
    showToast("Please enter a valid 10-digit Indian phone number.", "warning");
    return;
  }

  // Build WhatsApp message
  let waMsg = `🚗 *New Booking Enquiry - TVS Tours & Travels*\n\n`;
  waMsg += `👤 *Name:* ${name}\n`;
  waMsg += `📞 *Phone:* ${phone}\n`;
  if (from) waMsg += `📍 *From:* ${from}\n`;
  if (to) waMsg += `🏁 *To:* ${to}\n`;
  if (date) waMsg += `📅 *Date:* ${formatDate(date)}\n`;
  if (vehicle) waMsg += `🚙 *Vehicle:* ${vehicle}\n`;
  if (message) waMsg += `💬 *Message:* ${message}\n`;

  const encodedMsg = encodeURIComponent(waMsg);
  const waUrl = `https://wa.me/919150306264?text=${encodedMsg}`;

  // Open WhatsApp
  window.open(waUrl, "_blank");

  // Show success toast
  showToast(`Thank you, ${name}! Redirecting to WhatsApp...`);

  // Reset form
  e.target.reset();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---- TOAST NOTIFICATION ----
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  const toastIcon = toast.querySelector("i");

  toastMsg.textContent = msg;
  if (type === "warning") {
    toast.style.background = "#F6AD55";
    toastIcon.className = "fas fa-exclamation-circle";
  } else {
    toast.style.background = "#48BB78";
    toastIcon.className = "fas fa-check-circle";
  }

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4000);
}

// ---- SMOOTH ANCHOR SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const headerOffset = 85;
      const elementPosition =
        target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  });
});

// ---- FOOTER YEAR ----
document.getElementById("current-year").textContent = new Date().getFullYear();

// ---- INPUT DATE MIN ----
const dateInputs = document.querySelectorAll('input[type="date"]');
const today = new Date().toISOString().split("T")[0];
dateInputs.forEach((input) => input.setAttribute("min", today));

// ---- COUNTER ANIMATION ----
function animateCounters() {
  const stats = document.querySelectorAll(".stat-num");
  stats.forEach((stat) => {
    const target = parseInt(stat.textContent.replace("+", ""));
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      stat.textContent = Math.floor(current) + "+";
    }, 40);
  });
}

// Trigger counters when hero is visible
let countersAnimated = false;
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !countersAnimated) {
      countersAnimated = true;
      animateCounters();
    }
  });
});
const heroSection = document.getElementById("home");
if (heroSection) heroObserver.observe(heroSection);

// ---- PARALLAX EFFECT ON HERO ----
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  const heroEl = document.querySelector(".hero");
  if (heroEl && scrolled < heroEl.offsetHeight) {
    document.querySelectorAll(".hero-slide.active").forEach((slide) => {
      slide.style.transform = `translateY(${scrolled * 0.3}px) scale(1.05)`;
    });
  }
});

// ---- PACKAGE CARDS TILT EFFECT ----
document.querySelectorAll(".package-card, .service-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

console.log(
  "%c✈️ TVS TOURS & TRAVELS, Madurai",
  "color: #C2185B; font-size: 18px; font-weight: bold;",
);
console.log(
  "%cContact: 9150306264 | Manikandan M",
  "color: #666; font-size: 12px;",
);

// ---- LOAD PRICING FROM Live Database ----
async function loadLivePricing() {
  let data = window.LIVE_PRICES;

  // Try to fetch real-time data from Vercel Serverless Function
  try {
    const response = await fetch('/api/get-prices');
    if (response.ok) {
      const freshData = await response.json();
      if (Array.isArray(freshData) && freshData.length > 0) {
        data = freshData;
        console.log("Loaded fresh data from Notion CMS.");
      }
    }
  } catch (err) {
    console.log("Live fetch unavailable, using background data.", err);
  }

  if (!data || !Array.isArray(data)) {
    console.log(
      "Using fallback static UI prices. No Live Database data found.",
    );
    return;
  }

  const container = document.getElementById("tariff-cards-container");
  if (!container) return;

  // Clear any existing hardcoded cards
  container.innerHTML = "";

  data.forEach((item, index) => {
    // Generate inner lines of text
    let customTiersHTML = "";
    const blocks = item.details.split(/\n\n+/); // Split by empty lines

    // Fallback subtitle logic if details are empty
    let subtitleHTML = `<p class="tvc-subtitle">&nbsp;</p>`;

    blocks.forEach((block, idx) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);
      if (lines.length === 0) return;

      const altClass = idx % 2 === 1 ? "tvc-tier-alt" : "";
      const icon = idx % 2 === 1 ? "fa-tachometer-alt" : "fa-road";

      customTiersHTML += `<div class="tvc-tier ${altClass}">`;
      customTiersHTML += `<div class="tvc-tier-label"><i class="fas ${icon}"></i> ${lines[0]}</div>`;

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].includes(":")) {
          const [label, val] = lines[i].split(":");
          customTiersHTML += `<div class="tvc-row"><span>${label.trim()}</span><strong>${val.trim()}</strong></div>`;
        } else {
          customTiersHTML += `<div class="tvc-row"><span>${lines[i]}</span></div>`;
        }
      }
      customTiersHTML += `</div>`;
    });

    // Build entire card
    const cardHTML = `
      <div class="tariff-vehicle-card" id="tv-custom-${index}" style="opacity: 0; animation: fadeIn 0.5s ease forwards ${index * 0.1}s;">
        <div class="tvc-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="tvc-body">
          <h3 class="tvc-title"><i class="fas fa-car-side"></i> ${item.name}</h3>
          ${subtitleHTML}
          ${customTiersHTML}
          <a href="#enquiry" class="tvc-book-btn" onclick="document.getElementById('vehicle-type').value='${item.name}';">
            <i class="fas fa-calendar-check"></i> Book Now
          </a>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", cardHTML);
  });
}

// Load dynamic prices and trigger fade in CSS
const style = document.createElement("style");
style.textContent = `@keyframes fadeIn { to { opacity: 1; } }`;
document.head.appendChild(style);

loadLivePricing();
// ---- CARD SLIDER LOGIC ----
function initCardSliders() {
  const sliders = document.querySelectorAll(".card-slider");
  sliders.forEach((slider) => {
    const slides = slider.querySelectorAll(".card-slide");
    const prevBtn = slider.querySelector(".prev");
    const nextBtn = slider.querySelector(".next");
    let current = 0;

    if (!slides.length) return;

    function showSlide(index) {
      slides[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
    }

    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showSlide(current + 1);
    });

    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showSlide(current - 1);
    });

    // Auto-play option
    setInterval(() => showSlide(current + 1), 6000 + Math.random() * 2000);
  });
}
initCardSliders();
