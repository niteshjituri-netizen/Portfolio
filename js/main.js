/**
 * Nitesh Jituri Portfolio - Main Interactive Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTypingEffect();
  initScrollSpyAndHeader();
  initMobileMenu();
  initHeroCanvas();
  initDomainFilter();
  initAnimatedCounters();
  initScrollReveal();
  initModals();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('nitesh_portfolio_theme') || (prefersDark ? 'dark' : 'light');

  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('nitesh_portfolio_theme', newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

/* --------------------------------------------------------------------------
   2. Typing Subheadline Effect
   -------------------------------------------------------------------------- */
function initTypingEffect() {
  const typedEl = document.getElementById('typedRole');
  if (!typedEl) return;

  const roles = [
    'Mechanical Engineering Diploma Student',
    'Certified CNC Programmer (VTU-NASD Grade A+)',
    'GTTC Hubli Trained - Advance Manufacturing',
    'Traditional Folk Artist & Mysore Dasara Performer',
    'Indian Classical & Folk Flutist',
    'Microsoft & Google Cloud Certified',
    'Active Volunteer (Karyakarta)'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 70;

  function type() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      typedEl.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 35;
    } else {
      typedEl.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 75;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      typingSpeed = 2200; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* --------------------------------------------------------------------------
   3. ScrollSpy & Sticky Header
   -------------------------------------------------------------------------- */
function initScrollSpyAndHeader() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active link highlighting
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    const toggleMenu = (open) => {
      const shouldOpen = open !== undefined ? open : !navLinks.classList.contains('mobile-open');
      if (shouldOpen) {
        navLinks.classList.add('mobile-open');
        menuBtn.innerHTML = '✕';
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open-lock');
      } else {
        navLinks.classList.remove('mobile-open');
        menuBtn.innerHTML = '☰';
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open-lock');
      }
    };

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    document.querySelectorAll('.nav-link, .mobile-cta-btn').forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('mobile-open') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
        toggleMenu(false);
      }
    });
  }
}

/* --------------------------------------------------------------------------
   5. Interactive Hero Canvas Background (Gears & Harmonic Waves)
   -------------------------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroBgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    createParticles();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function createParticles() {
    particles = [];
    const count = Math.floor(width * 0.04);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 1,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        color: Math.random() > 0.4 ? 'rgba(0, 210, 255, 0.4)' : 'rgba(251, 191, 36, 0.35)'
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw particles and connection lines
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse repulsion
      if (mouse.x && mouse.y) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 3;
          p.y -= (dy / dist) * force * 3;
        }
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Connect near neighbors
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 100) {
          ctx.strokeStyle = `rgba(0, 210, 255, ${0.15 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  resize();
  animate();
}

/* --------------------------------------------------------------------------
   6. Domain View Filter (All / Engineering / Cultural Arts)
   -------------------------------------------------------------------------- */
function initDomainFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterableItems = document.querySelectorAll('[data-domain]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetDomain = btn.getAttribute('data-filter');

      filterableItems.forEach(item => {
        const itemDomains = item.getAttribute('data-domain').split(' ');
        if (targetDomain === 'all' || itemDomains.includes(targetDomain)) {
          item.style.display = '';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(15px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   7. Animated Stats Counters
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        animateValue(el, 0, target, 1600, prefix, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

function animateValue(obj, start, end, duration, prefix, suffix) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeProgress * (end - start) + start);
    obj.textContent = `${prefix}${current}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.textContent = `${prefix}${end}${suffix}`;
    }
  };
  window.requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   8. Scroll Reveal Helper
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));
}

/* --------------------------------------------------------------------------
   9. Multi-Certificate Viewer Lightbox & Navigation
   -------------------------------------------------------------------------- */
const CERTIFICATES_DATA = [
  {
    id: 'vtu-cnc',
    title: 'CNC Programming & Operation – Turning & Milling',
    subtitle: 'VTU - National Academy for Skill Development (NASD), Dandeli',
    regNo: 'VTU/NASD/2025-26/CNC/B01-5',
    grade: 'Grade Secured: "A+" (>80%)',
    duration: '160 Hours (30 Days) | 19 May – 20 June 2025',
    desc: 'Government verified skill competency in CNC Lathe Turning and 3-Axis Vertical Machining Centers (VMC Milling). Proficient in ISO G/M-Codes, canned cycles, tool offset geometry, and high-precision tolerances.',
    img: 'assets/certificates/nitesh_cnc_certificate.jpg',
    pdf: 'assets/certificates/vtu_nasd_cnc_certificate.pdf'
  },
  {
    id: 'gttc-mfg',
    title: 'Advance Manufacturing Technology Internship',
    subtitle: 'Govt. Tool Room and Training Centre (GTTC Hubli - Indo-Danish Project)',
    regNo: 'Ref: GTTC/INT/DIP-IA/25-26/8 | Reg: 167ME23033',
    grade: '16-Week Intensive Internship (Govt. Polytechnic Mundagod)',
    duration: '16 Weeks | 22 Dec 2025 – 11 Apr 2026',
    desc: 'Specialized industrial internship covering 3D CAD modeling, 2D technical drawings, GD&T standards, rapid prototyping, additive manufacturing via precision 3D printing, and mechanical workshop practice.',
    img: 'assets/certificates/gttc_certificate.jpg',
    pdf: 'assets/certificates/gttc_advanced_manufacturing_certificate.pdf'
  },
  {
    id: 'copilot-prompt',
    title: 'Prompt Engineering with GitHub Copilot',
    subtitle: 'Simplilearn SkillUP (Powered by Microsoft)',
    regNo: 'Certificate Code: 10962930',
    grade: 'Declaration of Completion',
    duration: 'Issued: 29th October 2026',
    desc: 'Certified competence in generative AI prompt architectures, contextual code completion, engineering workflow automation, and modern developer productivity using GitHub Copilot.',
    img: 'assets/certificates/github_copilot_prompt_engineering.jpg',
    pdf: 'assets/certificates/github_copilot_prompt_engineering.pdf'
  },
  {
    id: 'google-drive',
    title: 'Google Drive - Cloud Productivity & Management',
    subtitle: 'Simplilearn SkillUP (Powered by Google Cloud)',
    regNo: 'Certificate Code: 10964849',
    grade: 'Declaration of Completion',
    duration: 'Issued: 29th October 2026',
    desc: 'Certification in enterprise cloud workspace management, digital asset organization, collaboration pipelines, access security controls, and Google Cloud workspace productivity.',
    img: 'assets/certificates/google_cloud_drive.jpg',
    pdf: 'assets/certificates/google_cloud_drive.pdf'
  }
];

let currentCertIdx = 0;

function initModals() {
  const certModal = document.getElementById('certModal');
  const openCertBtns = document.querySelectorAll('.btn-open-cert-modal');
  const closeCertBtns = document.querySelectorAll('.btn-close-cert');
  const btnPrev = document.getElementById('btnCertPrev');
  const btnNext = document.getElementById('btnCertNext');

  function updateCertModal(idx) {
    if (idx < 0) idx = CERTIFICATES_DATA.length - 1;
    if (idx >= CERTIFICATES_DATA.length) idx = 0;
    currentCertIdx = idx;

    const data = CERTIFICATES_DATA[currentCertIdx];
    const modalTitle = document.getElementById('certModalTitle');
    const modalSubtitle = document.getElementById('certModalSubtitle');
    const modalImg = document.getElementById('certModalImg');
    const modalReg = document.getElementById('certModalReg');
    const modalGrade = document.getElementById('certModalGrade');
    const modalDuration = document.getElementById('certModalDuration');
    const modalDesc = document.getElementById('certModalDesc');
    const modalPdfLink = document.getElementById('certModalPdfLink');
    const modalCounter = document.getElementById('certModalCounter');

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalSubtitle) modalSubtitle.textContent = data.subtitle;
    if (modalImg) {
      modalImg.src = data.img;
      modalImg.alt = `${data.title} - Nitesh Jituri`;
    }
    if (modalReg) modalReg.textContent = data.regNo;
    if (modalGrade) modalGrade.textContent = data.grade;
    if (modalDuration) modalDuration.textContent = data.duration;
    if (modalDesc) modalDesc.textContent = data.desc;
    if (modalPdfLink) {
      modalPdfLink.href = data.pdf;
    }
    if (modalCounter) {
      modalCounter.textContent = `${currentCertIdx + 1} of ${CERTIFICATES_DATA.length}`;
    }
  }

  openCertBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIdx = parseInt(btn.getAttribute('data-cert-idx') || '0', 10);
      updateCertModal(targetIdx);
      if (certModal) certModal.classList.add('active');
    });
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      updateCertModal(currentCertIdx - 1);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      updateCertModal(currentCertIdx + 1);
    });
  }

  closeCertBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (certModal) certModal.classList.remove('active');
    });
  });

  // Close modal on clicking overlay background or keyboard Esc / Arrow keys
  window.addEventListener('click', (e) => {
    if (e.target === certModal) certModal.classList.remove('active');
  });

  window.addEventListener('keydown', (e) => {
    if (!certModal || !certModal.classList.contains('active')) return;
    if (e.key === 'Escape') {
      certModal.classList.remove('active');
    } else if (e.key === 'ArrowLeft') {
      updateCertModal(currentCertIdx - 1);
    } else if (e.key === 'ArrowRight') {
      updateCertModal(currentCertIdx + 1);
    }
  });
}



/* --------------------------------------------------------------------------
   11. Toast Notification Helper
   -------------------------------------------------------------------------- */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
