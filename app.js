document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initBackgroundSwans();
  initCursorSwan();
  initMobileNav();
  initFAQ();
  initIframeWebhooks();
  initContactScrollFix();
});

// Scroll animations utilizing IntersectionObserver
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach(el => observer.observe(el));
}

// Spawns scroll-interactive squiggly gradient paths in the background
function initBackgroundSwans() {
  const bgCanvas = document.createElement('div');
  bgCanvas.className = 'bg-canvas';
  document.body.appendChild(bgCanvas);

  const logo = document.createElement('div');
  logo.className = 'bg-logo-large';
  logo.innerHTML = `
    <img src="swan-logo.jpg" alt="WeWed Logo" style="width: 100%; height: 100%; object-fit: contain;">
  `;
  bgCanvas.appendChild(logo);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 1920 1080");
  svg.setAttribute("fill", "none");
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.style.position = "absolute";
  svg.style.width = "140%"; // Expanded to allow rotation without exposing edges
  svg.style.height = "140%";
  svg.style.top = "-20%";
  svg.style.left = "-20%";
  svg.style.pointerEvents = "none";
  svg.style.transformOrigin = "center center";
  svg.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
  svg.style.willChange = "transform";

  svg.innerHTML = `
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F9DC37" />
        <stop offset="100%" stop-color="#01F9C6" />
      </linearGradient>
    </defs>
    <title>Background Gradient Paths</title>
  `;

  bgCanvas.appendChild(svg);

  // Wavy path templates crossing the viewport area
  const pathData = [
    "M -100 150 C 400 -50, 800 450, 1300 200 C 1700 0, 1900 300, 2100 250",
    "M -100 450 C 300 700, 700 250, 1100 600 C 1500 850, 1800 300, 2100 500",
    "M -100 750 C 500 400, 900 1000, 1400 550 C 1700 300, 1900 900, 2100 800",
    "M -100 1000 C 300 800, 600 1200, 1000 900 C 1400 600, 1700 1100, 2100 950"
  ];

  const paths = [];

  pathData.forEach((d, idx) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("stroke", "url(#logo-gradient)");
    path.setAttribute("stroke-width", "8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-opacity", "0.25");
    path.style.willChange = "stroke-dashoffset";

    const segmentLength = 250 + idx * 50;
    const gapLength = 300 + idx * 50;
    path.setAttribute("stroke-dasharray", `${segmentLength} ${gapLength}`);
    path.setAttribute("stroke-dashoffset", "0");

    svg.appendChild(path);
    paths.push({
      element: path,
      direction: idx % 2 === 0 ? 1 : -1,
      baseSpeed: 0.5 + idx * 0.15
    });
  });

  let scrollOffset = 0;
  let scrollRotation = 0;
  let lastScrollY = window.scrollY;

  let idleOffset = 0;
  let idleRotation = 0;

  // Render loop combining idle drift and scroll-based motion
  function animate() {
    // Continuous subtle floating drift
    idleOffset += 0.2;
    idleRotation += 0.005;

    // Apply combined transformations
    const totalRotation = scrollRotation + idleRotation;
    const totalOffset = scrollOffset + idleOffset;

    svg.style.transform = `rotate(${totalRotation}deg)`;
    paths.forEach(p => {
      p.element.style.strokeDashoffset = `${totalOffset * p.direction * p.baseSpeed}`;
    });

    requestAnimationFrame(animate);
  }

  // Set up scroll event listener to update active target values
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = Math.max(0, Math.min(window.scrollY, maxScroll));
    const delta = scrollY - lastScrollY;
    lastScrollY = scrollY;

    // Drive motion based on scroll speed and direction
    scrollOffset += delta * 1.2;
    scrollRotation += delta * 0.04;
  }, { passive: true });

  // Start the frame animation loop
  requestAnimationFrame(animate);
}


// Interactive cursor swan and ripple effect on click
function initCursorSwan() {
  document.addEventListener('click', (e) => {
    // Avoid triggering if clicking on buttons or links
    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
      return;
    }

    const clickSwan = document.createElement('div');
    clickSwan.className = 'click-swan-effect';
    clickSwan.style.left = `${e.clientX}px`;
    clickSwan.style.top = `${e.clientY}px`;
    
    clickSwan.innerHTML = `
      <img src="swan-logo.jpg" class="swan-bob" alt="Swan Logo" style="width: 100%; height: 100%; object-fit: contain;">
    `;

    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;

    document.body.appendChild(clickSwan);
    document.body.appendChild(ripple);
    spawnSparkles(e.clientX, e.clientY);

    // Remove elements after animations finish
    setTimeout(() => {
      clickSwan.remove();
    }, 700);

    setTimeout(() => {
      ripple.remove();
    }, 700);
  });
}

// Sparkle particle effect triggered by snip clicks
function spawnSparkles(x, y) {
  const container = document.querySelector('.bg-canvas') || document.body;
  const count = 12;

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.style.position = 'fixed';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.width = '6px';
    sparkle.style.height = '6px';
    sparkle.style.borderRadius = '50%';
    
    // Varied primary accents (blue and spotlight shades)
    const colors = ['#01F9C6', '#F9DC37', '#ffffff'];
    sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9998';
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 30;
    const destinationX = Math.cos(angle) * distance;
    const destinationY = Math.sin(angle) * distance;

    container.appendChild(sparkle);

    const animation = sparkle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${destinationX}px, ${destinationY}px) scale(0)`, opacity: 0 }
    ], {
      duration: Math.random() * 400 + 400,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    });

    animation.onfinish = () => sparkle.remove();
  }
}

// Responsive Mobile Menu
function initMobileNav() {
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'mobile-menu-btn';
  toggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `;

  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  
  if (header && nav) {
    header.insertBefore(toggleBtn, nav);

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('open');
      toggleBtn.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggleBtn.contains(e.target)) {
        nav.classList.remove('open');
        toggleBtn.classList.remove('active');
      }
    });
  }
}

// Accordion FAQs handler
function initFAQ() {
  const questions = document.querySelectorAll('.faq-question');
  
  questions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close other open FAQ items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      item.classList.toggle('active', !isActive);
    });
  });
}

// Listens for message events dispatched by embedded HighLevel forms upon submission
function initIframeWebhooks() {
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data && (data === 'vformSubmitted' || data.msg === 'vformSubmitted' || data.type === 'vformSubmitted')) {
      const formId = data.formId || 'unknown';
      
      // Only trigger for the individual coaching form
      if (formId !== 'o4CqisZQlS3RFALK8i4p') {
        return;
      }
      
      fetch('https://services.leadconnectorhq.com/hooks/4NyXZeHEOGDa9f6sTlKB/webhook-trigger/fe6fc25e-9ce8-4b13-b1da-5c54c4bc6bd8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'formSubmitted',
          formId: formId,
          pageUrl: window.location.href,
          timestamp: new Date().toISOString()
        })
      })
      .then(response => {
        console.log('LeadConnector webhook triggered successfully');
      })
      .catch(err => {
        console.error('Error triggering webhook:', err);
      });
    }
  });
}

// Counteract HighLevel iframe autofocus/scroll-stealing on page load
function initContactScrollFix() {
  if (window.location.pathname.includes('contact')) {
    let hasInteracted = false;
    const stopFix = () => { hasInteracted = true; };
    
    // Stop correcting scroll position if the user starts interacting
    window.addEventListener('wheel', stopFix, { passive: true });
    window.addEventListener('touchmove', stopFix, { passive: true });
    window.addEventListener('mousedown', stopFix, { passive: true });

    // Execute at multiple interval thresholds to catch async iframe loading
    const times = [50, 150, 300, 600, 1000, 1500, 2000, 2500, 3000];
    times.forEach(delay => {
      setTimeout(() => {
        if (hasInteracted) return;
        if (window.location.hash === '#faq') {
          const faqSection = document.getElementById('faq');
          if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'auto' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }, delay);
    });
  }
}

