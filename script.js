document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initBackgroundSwans();
  initCursorSwan();
  initMobileNav();
  initFAQ();
  initIframeWebhooks();
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

// Spawns one large decorative background logo with flashing color gradient
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
      
      fetch('https://services.leadconnectorhq.com/hooks/4NyXZeHEOGDa9f6sTlKB/webhook-trigger/51a93107-d128-4cdf-93f1-4a183a16f536', {
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
