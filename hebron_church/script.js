// Language toggle (English / Amharic)
const langToggle = document.getElementById('langToggle');
const langOpts = document.querySelectorAll('.lang-opt');
let currentLang = localStorage.getItem('hebron-lang') === 'am' ? 'am' : 'en';

const langListeners = [];

function setLanguage(lang) {
    currentLang = lang;

    // Text: every element with data-en / data-am (markup like <strong> is kept)
    document.querySelectorAll('[data-en]').forEach(el => {
        const text = el.dataset[lang];
        if (text) el.innerHTML = text;
    });

    // Form placeholders
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
        el.placeholder = lang === 'am' ? el.dataset.placeholderAm : el.dataset.placeholderEn;
    });

    langOpts.forEach(opt => opt.classList.toggle('active', opt.dataset.lang === lang));
    langToggle.setAttribute('aria-label', lang === 'am' ? 'Switch to English' : 'ወደ አማርኛ ቀይር');
    document.documentElement.lang = lang;
    localStorage.setItem('hebron-lang', lang);
}

langToggle.addEventListener('click', () => {
    setLanguage(currentLang === 'en' ? 'am' : 'en');
});
setLanguage(currentLang);

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
});


document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

// Active nav link
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = 'hero';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    navLinkItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Departments carousel — moves one card at a time
const deptTrack = document.getElementById('deptTrack');
const deptPrev = document.getElementById('deptPrev');
const deptNext = document.getElementById('deptNext');

function deptStep() {
    const firstCard = deptTrack.querySelector('.dept-card');
    if (!firstCard) return deptTrack.clientWidth;
    const trackGap = parseFloat(getComputedStyle(deptTrack).columnGap || getComputedStyle(deptTrack).gap || 0);
    return firstCard.getBoundingClientRect().width + trackGap;
}

function updateDeptArrows() {
    const maxScroll = deptTrack.scrollWidth - deptTrack.clientWidth - 2;
    deptPrev.disabled = deptTrack.scrollLeft <= 2;
    deptNext.disabled = deptTrack.scrollLeft >= maxScroll;
}

deptNext.addEventListener('click', () => {
    deptTrack.scrollBy({ left: deptStep(), behavior: 'smooth' });
});
deptPrev.addEventListener('click', () => {
    deptTrack.scrollBy({ left: -deptStep(), behavior: 'smooth' });
});
deptTrack.addEventListener('scroll', updateDeptArrows);
window.addEventListener('resize', updateDeptArrows);
updateDeptArrows();

// Scroll reveal
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
revealElements.forEach(el => revealObserver.observe(el));

// Contact form
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const formStatus = document.getElementById('formStatus');

    const FORM_TEXT = {
        en: {
            required: 'Please fill in all fields.',
            sending: 'Sending...',
            success: name => 'Thank you, ' + name + '! Your message has been sent. We will get back to you soon.',
            error: 'Sorry, your message could not be sent. Please try again, or call +251 91 162 2728.'
        },
        am: {
            required: 'እባክዎ ሁሉንም መስኮች ይሙሉ።',
            sending: 'በመላክ ላይ...',
            success: name => 'እናመሰግናለን፣ ' + name + '! መልእክትዎ ተልኳል። በቅርቡ እንመልስልዎታለን።',
            error: 'ይቅርታ፣ መልእክትዎ አልተላከም።'
        }
    };

    const showStatus = (message, type) => {
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;      // "success" or "error"
        formStatus.hidden = false;
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const t = FORM_TEXT[currentLang];
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            showStatus(t.required, 'error');
            return;
        }

        formStatus.hidden = true;
        submitBtn.disabled = true;
        submitBtn.textContent = t.sending;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);   

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm),
                signal: controller.signal
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Rejected');

            contactForm.reset();
            showStatus(t.success(name), 'success');
        } catch (err) {
            showStatus(t.error, 'error');
        } finally {
            clearTimeout(timer);
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset[currentLang] || 'Send Message';
        }
    });
}
              // ===== DEPARTMENT MODAL (Description Only) =====
const modal = document.getElementById('departmentModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');

// Open modal when a department card is clicked
document.querySelectorAll('.dept-card').forEach(card => {
    card.addEventListener('click', function() {
        const am = currentLang === 'am';
        const name = (am && this.dataset.nameAm) || this.dataset.name;
        const description = (am && this.dataset.descriptionAm) || this.dataset.description;
        openModal(name, description);
    });
});

function openModal(name, description) {
    modalTitle.textContent = name;
    modalDescription.textContent = description;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});
