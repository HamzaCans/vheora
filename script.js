/* ========================================
   VHEORA.CO — Interactive JavaScript
   Animations, Particles & Interactivity
   ======================================== */

const API_URL = window.location.origin === 'http://localhost:3001' ? '' : 'http://localhost:3001';

// ========== SERVICE WORKER REGISTRATION ==========
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ========== LOADING SCREEN (immediate) ==========
(function() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const hideLoader = () => {
    if (!loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      setTimeout(() => { loader.style.display = 'none'; }, 600);
    }
  };

  window.addEventListener('load', () => {
    const delay = window.innerWidth <= 768 ? 1000 : 1500;
    setTimeout(hideLoader, delay);
  });

  setTimeout(hideLoader, 3000);
})();

document.addEventListener('DOMContentLoaded', () => {

  // ========== NAVBAR SCROLL EFFECT & SCROLL SPY ==========
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const mainNavLinks = navLinks
    ? navLinks.querySelectorAll('a:not(.nav-cta):not(.lang-dropdown a)')
    : [];
  const navSectionIds = ['hero', 'about', 'services', 'collection', 'testimonials', 'contact'];

  function getNavOffset() {
    return navbar ? navbar.offsetHeight + 16 : 88;
  }

  function syncNavOffset() {
    const offset = getNavOffset();
    document.documentElement.style.setProperty('--nav-offset', `${offset}px`);
    return offset;
  }

  function updateActiveNavLink() {
    const offset = syncNavOffset();
    const scrollPos = window.pageYOffset + offset + 4;
    let activeId = navSectionIds[0];

    navSectionIds.forEach(id => {
      const section = document.getElementById(id);
      if (section && section.offsetTop <= scrollPos) {
        activeId = id;
      }
    });

    mainNavLinks.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${activeId}`);
    });
  }

  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateActiveNavLink();
        scrollTicking = false;
      });
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    syncNavOffset();
    updateActiveNavLink();
  });

  syncNavOffset();
  updateActiveNavLink();

  // ========== MOBILE MENU ==========
  const menuToggle = document.getElementById('menuToggle');
  const navOverlay = document.getElementById('navOverlay');

  function setMobileMenu(open) {
    menuToggle.classList.toggle('active', open);
    navLinks.classList.toggle('active', open);
    if (navOverlay) navOverlay.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (navOverlay) navOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function closeMobileMenu() {
    setMobileMenu(false);
  }

  menuToggle.addEventListener('click', () => {
    setMobileMenu(!navLinks.classList.contains('active'));
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileMenu);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Close mobile menu on main link click (but not on language selector)
  navLinks.querySelectorAll('a:not(.lang-dropdown a)').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Ignore if href is just "#" or empty
      if (href === '#' || href === '') return;

      e.preventDefault();
      try {
        const target = document.querySelector(href);
        if (target) {
          const top = target.getBoundingClientRect().top + window.pageYOffset - getNavOffset();
          window.scrollTo({ top, behavior: 'smooth' });
          closeMobileMenu();
        }
      } catch (err) {
        console.warn('Invalid scroll target:', href);
      }
    });
  });

  // ========== SCROLL REVEAL ANIMATIONS ==========
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  // ========== SHARE EXPERIENCE FORM ==========
  const shareForm = document.getElementById('shareForm');
  if (shareForm) {
    shareForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = shareForm.querySelector('.form-submit');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = '<span>⌛ Yorumunuz Gönderiliyor...</span>';
      submitBtn.disabled = true;

      try {
        const res = await fetch(`${API_URL}/api/testimonial`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${document.getElementById('revFirstName').value} ${document.getElementById('revLastName').value}`,
            location: `${document.getElementById('revCountry').value}, ${document.getElementById('revCity').value}`,
            text: document.getElementById('revComment').value
          })
        });

        if (res.ok) {
          submitBtn.innerHTML = '<span>✓ Teşekkürler! Yorumunuz onaydan sonra yayınlanacak.</span>';
          submitBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
          shareForm.reset();
        } else {
          const data = await res.json();
          alert(data.error || 'Bir hata oluştu');
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          return;
        }
      } catch (err) {
        alert('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        return;
      }

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    });
  }


  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ========== COUNTER ANIMATION ==========
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        if (!isNaN(target)) {
          animateCounter(el, target);
        }
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    if (target <= 0) {
      el.textContent = '0+';
      return;
    }

    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      if (target >= 1000) {
        el.textContent = Math.floor(current).toLocaleString() + '+';
      } else {
        el.textContent = Math.floor(current) + '+';
      }
    }, 16);
  }

  // ========== HERO PARTICLE CANVAS ==========
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrame;

    function resizeCanvas() {
      const hero = document.querySelector('.hero');
      if (hero) {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
        // Re-init particles on large resize if needed, 
        // but here we just let them wrap naturally.
      }
    }

    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * (canvas.width || 800);
        this.y = Math.random() * (canvas.height || 600);
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;

        // Gold-ish colors
        const colors = [
          { r: 212, g: 168, b: 83 },   // Gold
          { r: 240, g: 194, b: 127 },   // Light Gold
          { r: 255, g: 255, b: 255 },   // White sparkle
          { r: 184, g: 145, b: 46 },    // Dark Gold
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity += this.fadeDirection * this.fadeSpeed;

        if (this.opacity >= 0.6) this.fadeDirection = -1;
        if (this.opacity <= 0.05) this.fadeDirection = 1;

        // Wrap around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fill();

        // Sparkle glow
        if (this.size > 1.2) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.15})`;
          ctx.fill();
        }
      }
    }

    // Create particles
    function initParticles() {
      particles = [];
      const isMobile = window.innerWidth <= 768;
      const density = isMobile ? 25000 : 15000;
      const maxCount = isMobile ? 35 : 80;
      const particleCount = Math.min(maxCount, Math.floor((canvas.width * canvas.height) / density) || (isMobile ? 20 : 40));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    
    initParticles();

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrame = requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Pause animation when not visible
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animationFrame) animateParticles();
        } else {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      });
    }, { threshold: 0.1 });

    const heroSec = document.querySelector('.hero');
    if (heroSec) heroObserver.observe(heroSec);
  }

  // ========== CONTACT FORM ==========
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.form-submit');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = '<span>⌛ Gönderiliyor...</span>';
      submitBtn.disabled = true;

      try {
        const res = await fetch(`${API_URL}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value || 'Genel İletişim',
            message: document.getElementById('message').value
          })
        });

        const data = await res.json();

        if (res.ok) {
          submitBtn.innerHTML = '<span>✓ Mesajınız alındı!</span>';
          submitBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
          contactForm.reset();
        } else {
          alert(data.error || 'Bir hata oluştu');
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          return;
        }
      } catch (err) {
        alert('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        return;
      }

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    });
  }

  // ========== TESTIMONIALS SLIDER (Random realistic generation) ==========
  const testimonialGrid = document.getElementById('testimonialGrid');
  if (testimonialGrid) {
    const maleNames = ['Ahmet', 'Mehmet', 'Ali', 'Can', 'Emre', 'Burak', 'Kerem', 'Ozan', 'Deniz', 'Mert', 'Efe', 'Onur', 'Serkan', 'Kaan', 'Tolga', 'Fatih', 'Murat', 'Hakan', 'Cem', 'Barış', 'Utku', 'Alp', 'Eren', 'Yiğit', 'Arda'];
    const femaleNames = ['Zeynep', 'Elif', 'Ayşe', 'Fatma', 'Merve', 'Derya', 'Sibel', 'Gizem', 'İrem', 'Buse', 'Ebru', 'Aslı', 'Cansu', 'Nazlı', 'Sena', 'Defne', 'Lale', 'Pınar', 'Özge', 'Burcu', 'Aylin', 'Ece', 'Deniz', 'Yasemin', 'Seda'];
    const internationalMale = ['James', 'Michael', 'David', 'Daniel', 'Alexander', 'Lukas', 'Marco', 'Pierre', 'Hugo', 'Thomas', 'William', 'Oliver', 'Felix', 'Noah', 'Leon', 'Maximilian'];
    const internationalFemale = ['Sarah', 'Emily', 'Sophie', 'Emma', 'Olivia', 'Anna', 'Marie', 'Laura', 'Julia', 'Isabella', 'Charlotte', 'Amelia', 'Mia', 'Lea', 'Hannah', 'Johanna'];
    const internationalLast = ['Anderson', 'Smith', 'Wilson', 'Taylor', 'Brown', 'Miller', 'Jones', 'Davis', 'García', 'Martínez', 'Müller', 'Schmidt', 'Fischer', 'Weber', 'Wagner', 'Becker', 'Rossi', 'Russo', 'Ferrari', 'Bianchi'];

    const trCities = [
      'İstanbul, Nişantaşı', 'İstanbul, Bebek', 'İstanbul, Kadıköy', 'İstanbul, Etiler', 'İstanbul, Bağdat Caddesi',
      'Ankara, Çankaya', 'Ankara, Kızılay', 'Ankara, Bilkent', 'İzmir, Alsancak', 'İzmir, Karşıyaka',
      'Antalya, Lara', 'Antalya, Konyaaltı', 'Bodrum, Yalıkavak', 'Bodrum, Türkbükü', 'Çeşme, Alaçatı',
      'Muğla, Fethiye', 'Bursa, Nilüfer', 'Eskişehir, Tepebaşı', 'Trabzon, Ortahisar', 'Gaziantep, Şahinbey'
    ];
    const intCities = [
      'London, Chelsea', 'London, Mayfair', 'Paris, Champs-Élysées', 'Paris, Le Marais',
      'New York, Manhattan', 'New York, Brooklyn', 'Milan, Brera', 'Milan, Montenapoleone',
      'Dubai, Downtown', 'Dubai, Marina', 'Berlin, Mitte', 'Munich, Schwabing',
      'Zurich, Bahnhofstrasse', 'Geneva, Eaux-Vives', 'Vienna, Innere Stadt', 'Rome, Trastevere',
      'Barcelona, Eixample', 'Madrid, Salamanca', 'Amsterdam, Jordaan', 'Stockholm, Östermalm',
      'Oslo, Frogner', 'Copenhagen, Frederiksberg', 'Helsinki, Eira', 'Tokyo, Ginza',
      'Seoul, Gangnam', 'Singapore, Orchard', 'Sydney, Darlinghurst', 'Los Angeles, Beverly Hills'
    ];

    const commentTemplates = [
      { tr: 'Nişan yüzüğümüzü buradan aldık, parmağımdaki ışıltısı her gün beni mutlu ediyor. İşçilik gerçekten çok ince.', en: 'We bought our engagement ring here, the sparkle on my finger makes me happy every day.' },
      { tr: 'Eşim için özel bir hediye yaptırdık, kutusunu açtığı anki mutluluğu paha biçilemezdi.', en: 'We had a special gift made for my spouse, the joy when opening the box was priceless.' },
      { tr: 'Bileklik tam zamanında yetişti. Zarif ve modern duruşuyla her kıyafete uyum sağlıyor.', en: 'The bracelet arrived just in time. Its elegant and modern look complements every outfit.' },
      { tr: 'Kolyedeki detaylar harika, her gün kullanıyorum ve ilk günkü gibi parlak.', en: 'The details on the necklace are amazing, I wear it every day and it shines like the first day.' },
      { tr: 'İşçilik gerçekten büyüleyici. Daha önce hiç bu kadar kaliteli bir takı görmemiştim.', en: 'The craftsmanship is truly mesmerizing. I have never seen such high quality jewelry before.' },
      { tr: 'Yıldönümü hediyesi olarak aldık, eşim çok mutlu oldu. Teşekkürler VHEORA!', en: 'We got it as an anniversary gift, my spouse was overjoyed. Thank you VHEORA!' },
      { tr: 'Siparişim çok hızlı geldi ve paketleme mükemmeldi. Kesinlikle tavsiye ederim.', en: 'My order arrived very fast and the packaging was perfect. I highly recommend it.' },
      { tr: 'Küpeleri anneme hediye ettim, çok beğendi. Zarif tasarımlarınızı çok seviyorum.', en: 'I gifted the earrings to my mother, she loved them. I adore your elegant designs.' },
      { tr: 'Özel tasarım yüzük hayalimdeki gibi oldu. İlginiz ve profesyonelliğiniz için teşekkürler.', en: 'The custom-designed ring turned out exactly as I dreamed. Thanks for your interest and professionalism.' },
      { tr: 'Uzun zamandır bu kadar kaliteli bir takı görmemiştim. Herkese gönül rahatlığıyla öneriyorum.', en: 'I haven\'t seen such quality jewelry in a long time. I confidently recommend it to everyone.' },
      { tr: 'Doğum günümde kendime hediye ettim, kesinlikle değdi. Her bakışta içim açılıyor.', en: 'I treated myself for my birthday, it was totally worth it. It brightens my mood every time I look at it.' },
      { tr: 'Düğün setimizi VHEORA\'dan aldık, herkes çok beğendi. Kaliteniz daim olsun.', en: 'We got our wedding set from VHEORA, everyone loved it. May your quality always remain.' },
      { tr: 'İnternetten takı almakta tereddüt etmiştim ama bu deneyim beklentimin çok üstündeydi.', en: 'I was hesitant about buying jewelry online, but this experience exceeded my expectations.' },
      { tr: 'Sevgilime aldığım hediye sayenizde unutulmaz oldu. Tasarımlarınız gerçekten özel.', en: 'The gift I got for my significant other became unforgettable thanks to you. Your designs are truly special.' },
      { tr: 'Sağlam ve şık bir ürün. Her gün kullanıyorum, hiçbir kararma olmadı.', en: 'Durable and stylish product. I use it every day, no tarnishing at all.' },
      { tr: 'Müşteri hizmetleriniz çok ilgiliydi, tüm sorularımı cevapladılar. Güvenilir bir marka.', en: 'Your customer service was very attentive, they answered all my questions. A trustworthy brand.' },
      { tr: 'Yurt dışına sipariş verdim, vergi ve kargo süreci hakkında çok yardımcı oldular.', en: 'I ordered from abroad, they were very helpful about taxes and shipping.' },
      { tr: 'Kolyeyi ilk taktığımda herkes nereden aldığımı sordu. Kesinlikle farklı bir kalite.', en: 'When I first wore the necklace, everyone asked where I got it. Definitely a different level of quality.' },
      { tr: 'Ürün görsellerdeki gibi çıktı, hatta daha güzeldi. Çok memnun kaldım.', en: 'The product looked just like the photos, even more beautiful. I am very satisfied.' },
      { tr: 'Annem için özel bir hediye yaptırdık, kutusunu açtığı anki mutluluğu paha biçilemezdi. Gerçekten işinin ehli bir ekip.', en: 'We had a special gift made for my mother, the joy when she opened the box was priceless. A truly skilled team.' }
    ];

    function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function generateTestimonials(count = 6) {
      const result = [];
      for (let i = 0; i < count; i++) {
        const isTurkish = Math.random() < 0.55;
        const isMale = Math.random() < 0.5;
        let name, location;
        if (isTurkish) {
          name = isMale ? randomItem(maleNames) : randomItem(femaleNames);
          location = randomItem(trCities);
        } else {
          const first = isMale ? randomItem(internationalMale) : randomItem(internationalFemale);
          const last = randomItem(internationalLast);
          name = `${first} ${last}`;
          location = randomItem(intCities);
        }
        const template = randomItem(commentTemplates);
        const text = isTurkish ? template.tr : template.en;
        const rating = 5;
        result.push({ name, location, text, rating });
      }
      return result;
    }

    async function loadTestimonials() {
      try {
        const res = await fetch(`${API_URL}/api/testimonials`);
        const realTestimonials = await res.json();
        const real = (Array.isArray(realTestimonials) ? realTestimonials : []).slice(0, 6);
        const generated = generateTestimonials(6);
        const mixed = [...real, ...generated].sort(() => Math.random() - 0.5).slice(0, 6);

        testimonialGrid.innerHTML = mixed.map(t => `
          <div class="testimonial-card">
            <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}</div>
            <p class="testimonial-text">${t.text}</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${t.name.charAt(0)}</div>
              <div>
                <div class="testimonial-name">${t.name}</div>
                <div class="testimonial-location">${t.location || ''}</div>
              </div>
            </div>
          </div>
        `).join('');

        initSlider();
      } catch (err) {
        const fallback = generateTestimonials(6);
        testimonialGrid.innerHTML = fallback.map(t => `
          <div class="testimonial-card">
            <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
            <p class="testimonial-text">${t.text}</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${t.name.charAt(0)}</div>
              <div>
                <div class="testimonial-name">${t.name}</div>
                <div class="testimonial-location">${t.location}</div>
              </div>
            </div>
          </div>
        `).join('');
        initSlider();
      }
    }

    loadTestimonials();

    // Slider Logic
    function initSlider() {
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    let currentIndex = 0;

    function getItemsVisible() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function updateSlider() {
      const card = testimonialGrid.querySelector('.testimonial-card');
      if (!card) return;
      const gap = window.innerWidth <= 768 ? 24 : 32;
      const itemWidth = card.offsetWidth + gap;
      testimonialGrid.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    nextBtn.addEventListener('click', () => {
      const visible = getItemsVisible();
      if (currentIndex < 6 - visible) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      updateSlider();
    });

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        const visible = getItemsVisible();
        currentIndex = 6 - visible;
      }
      updateSlider();
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    testimonialGrid.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    testimonialGrid.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) < 50) return;
      if (diff > 0) nextBtn.click();
      else prevBtn.click();
    }, { passive: true });

    window.addEventListener('resize', () => {
      currentIndex = 0;
      updateSlider();
    });
  }

  }

  // ========== PARALLAX ON MOUSE MOVE (Hero) ==========
  const heroVisual = document.querySelector('.hero-visual');
  const heroSection = document.querySelector('.hero');

  // Skip heavy hero parallax on touch devices
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (heroSection && heroVisual && !isTouchDevice) {
    heroSection.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      heroVisual.style.transition = 'none'; // Remove transition during move for performance
      heroVisual.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      heroVisual.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
      heroVisual.style.transform = 'translate(0, 0)';
    });
  }

  // ========== IMAGE LAZY LOADING WITH FADE ==========
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
  });

  // ========== LANGUAGE SWITCHER LOGIC ==========
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function clearGoogleTranslateCookies() {
    const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = `googtrans=; ${expire}; path=/`;
    if (window.location.hostname) {
      document.cookie = `googtrans=; ${expire}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=; ${expire}; path=/; domain=.${window.location.hostname}`;
    }
  }

  function setGoogleTranslateCookie(langCode) {
    const value = `/tr/${langCode}`;
    document.cookie = `googtrans=${value}; path=/`;
    if (window.location.hostname) {
      document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
    }
  }

  function triggerGoogleCombo(langCode, attempt = 0) {
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
      return true;
    }
    if (attempt < 25) {
      setTimeout(() => triggerGoogleCombo(langCode, attempt + 1), 250);
    }
    return false;
  }

  function changeGoogleTranslateLanguage(langCode) {
    if (langCode === 'tr') {
      clearGoogleTranslateCookies();
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = 'tr';
        combo.dispatchEvent(new Event('change'));
      }
      window.location.reload();
      return;
    }

    setGoogleTranslateCookie(langCode);
    triggerGoogleTranslate(langCode);
  }

  function triggerGoogleTranslate(langCode) {
    if (!triggerGoogleCombo(langCode)) {
      // Widget not ready yet; cookie will apply on next load
      window.location.reload();
    }
  }

  function applySavedLanguage() {
    const savedLangCookie = getCookie('googtrans');
    if (!savedLangCookie) return;

    const langCode = savedLangCookie.split('/').pop();
    if (!langCode || langCode === 'tr') return;

    const activeLangLink = document.querySelector(`.lang-dropdown a[data-lang="${langCode}"]`);
    if (activeLangLink && langBtn) {
      langBtn.innerHTML = `🌐 ${activeLangLink.textContent.split(' - ')[0]}`;
    }

    triggerGoogleCombo(langCode);
  }

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      langDropdown.classList.remove('active');
    });

    langDropdown.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const selectedLang = item.getAttribute('data-lang');
        const selectedLangText = item.textContent.split(' - ')[0];

        langBtn.innerHTML = `🌐 ${selectedLangText}`;
        langDropdown.classList.remove('active');
        changeGoogleTranslateLanguage(selectedLang);
      });
    });
  }

  document.addEventListener('googleTranslateReady', applySavedLanguage);

  const savedLangCookie = getCookie('googtrans');
  if (savedLangCookie) {
    const langCode = savedLangCookie.split('/').pop();
    const activeLangLink = document.querySelector(`.lang-dropdown a[data-lang="${langCode}"]`);
    if (activeLangLink && langBtn) {
      langBtn.innerHTML = `🌐 ${activeLangLink.textContent.split(' - ')[0]}`;
    }
  }

  // ========== SUPPORT MODAL ==========
  const supportContent = {
    sss: {
      title: 'Sıkça Sorulan Sorular',
      icon: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="rgb(212,168,83)" stroke-width="2.5" opacity="0.3"/><circle cx="32" cy="32" r="18" stroke="rgb(212,168,83)" stroke-width="2" opacity="0.5"/><circle cx="32" cy="22" r="2" fill="rgb(212,168,83)"/><path d="M32 28v14" stroke="rgb(212,168,83)" stroke-width="3" stroke-linecap="round"/></svg>`,
      html: `<div class="sss-list">
        <div class="sss-item"><button class="sss-question">Siparişimi nasıl takip edebilirim?<span class="sss-icon">▼</span></button><div class="sss-answer">Siparişiniz kargoya verildikten sonra e-posta ve SMS ile bir takip numarası alırsınız. Bu numara ile kargo firmasının web sitesinden siparişinizi anlık olarak takip edebilirsiniz.</div></div>
        <div class="sss-item"><button class="sss-question">Hangi ödeme yöntemlerini kabul ediyorsunuz?<span class="sss-icon">▼</span></button><div class="sss-answer">Kredi kartı (Visa, Mastercard), banka havalesi ve EFT kabul ediyoruz. Tüm kredi kartı işlemleriniz 256-bit SSL sertifikası ile korunmaktadır.</div></div>
        <div class="sss-item"><button class="sss-question">Uluslararası sipariş veriyorum, gümrük vergisi var mı?<span class="sss-icon">▼</span></button><div class="sss-answer">Evet, uluslararası siparişlerde alıcının bulunduğu ülkenin gümrük politikasına bağlı olarak ek vergiler uygulanabilir. Bu vergiler sipariş tutarına dahil değildir ve alıcıya aittir. Sipariş öncesi ülkenizin gümrük koşullarını kontrol etmenizi öneririz.</div></div>
        <div class="sss-item"><button class="sss-question">Hediye paketi seçeneğiniz var mı?<span class="sss-icon">▼</span></button><div class="sss-answer">Evet, tüm siparişleriniz VHEORA imzalı lüks hediye kutusu, kesecik ve sertifika ile gönderilir. Özel gün kartı eklenmesini isterseniz sipariş notunda belirtebilirsiniz.</div></div>
        <div class="sss-item"><button class="sss-question">Teslimat süresi ne kadar?<span class="sss-icon">▼</span></button><div class="sss-answer">Türkiye içi siparişlerde teslimat 3-7 iş günü, uluslararası siparişlerde ise 7-14 iş günü arasındadır. Özel tasarım siparişlerde bu süre değişiklik gösterebilir.</div></div>
        <div class="sss-item"><button class="sss-question">Ürünlerinizin garantisi var mı?<span class="sss-icon">▼</span></button><div class="sss-answer">Tüm ürünlerimiz 2 yıl işçilik garantisi ile gelmektedir. Garanti belgeniz ürününüzle birlikte gönderilir. Üretim hatası durumunda ürününüzü ücretsiz olarak onarıyoruz.</div></div>
        <div class="sss-item"><button class="sss-question">Özel tasarım yaptırmak istiyorum, nasıl iletişime geçebilirim?<span class="sss-icon">▼</span></button><div class="sss-answer">Koleksiyon sayfamızdaki herhangi bir üründe "Teklif Al" butonuna tıklayarak WhatsApp veya e-posta yoluyla bize ulaşabilirsiniz. Tasarım ekibimiz size en kısa sürede dönüş yapacaktır.</div></div>
      </div>`
    },
    kargo: {
      title: 'Kargo & İade',
      icon: `<svg viewBox="0 0 64 64" fill="none"><rect x="6" y="24" width="40" height="26" rx="3" stroke="rgb(212,168,83)" stroke-width="2" fill="rgba(212,168,83,0.06)"/><path d="M46 30h10l-4 10h-6" stroke="rgb(212,168,83)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="44" r="4" stroke="rgb(212,168,83)" stroke-width="2" fill="rgba(212,168,83,0.1)"/><circle cx="38" cy="44" r="4" stroke="rgb(212,168,83)" stroke-width="2" fill="rgba(212,168,83,0.1)"/><path d="M16 24V14h12l4 10" stroke="rgb(212,168,83)" stroke-width="2" stroke-linecap="round"/></svg>`,
      html: `<div class="kargo-grid">
        <div class="kargo-card"><h4>🚚 Türkiye İçi Kargo</h4><p>3-7 iş günü içinde teslimat. 5.000 TL ve üzeri alışverişlerde kargo ücretsizdir.</p></div>
        <div class="kargo-card"><h4>✈️ Uluslararası Kargo</h4><p>DHL/FedEx ile 7-14 iş günü. Global gönderimlerde takip numarası e-posta ile paylaşılır.</p></div>
        <div class="kargo-card"><h4>📦 Paketleme</h4><p>Takı kutunuz çift katlı korumalı ambalajda, sertifikası ile birlikte gönderilir.</p></div>
        <div class="kargo-card"><h4>📋 Sigorta</h4><p>Tüm gönderilerimiz sigortalıdır. Size ulaşana kadar her adımda güvendesiniz.</p></div>
      </div>
      <h3>İade Koşulları</h3>
      <ul class="iade-list">
        <li>Ürün teslim tarihinden itibaren 30 gün içinde iade yapabilirsiniz.</li>
        <li>İade edilecek ürünün orijinal kutusu, sertifikası ve tüm aksesuarları eksiksiz olmalıdır.</li>
        <li>Özel tasarım ve kişiye özel ürünlerde iade kabul edilmemektedir.</li>
        <li>İade sürecini başlatmak için bizimle iletişime geçmeniz yeterlidir, size iade talimatlarını göndeririz.</li>
        <li>İade kargo ücreti alıcıya aittir. Ürün bize ulaştıktan sonra 5 iş günü içinde iadeniz gerçekleştirilir.</li>
      </ul>`
    },
    bakim: {
      title: 'Bakım Rehberi',
      icon: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="14" stroke="rgb(212,168,83)" stroke-width="2.5" fill="rgba(212,168,83,0.06)"/><circle cx="32" cy="32" r="8" stroke="rgb(212,168,83)" stroke-width="1.5" fill="rgba(212,168,83,0.05)"/><path d="M32 12v-4M32 56v-4M52 32h4M8 32h4M46.6 17.4l2.8-2.8M14.6 49.4l2.8-2.8M17.4 17.4l-2.8-2.8M49.4 49.4l-2.8-2.8" stroke="rgb(212,168,83)" stroke-width="1.5" opacity="0.5"/></svg>`,
      html: `<p style="margin-bottom:18px;">Takılarınızın ilk günkü parlaklığını korumak için aşağıdaki bakım önerilerine göz atın.</p>
      <div class="bakim-grid">
        <div class="bakim-card do">
          <h4>✓  Ilık Su & Sabun</h4>
          <p>Ilık su ve bir damla sabunla yumuşak bir fırça ile nazikçe temizleyin. Durulayıp yumuşak bezle kurulayın.</p>
        </div>
        <div class="bakim-card dont">
          <h4>✗  Kimyasal Temas</h4>
          <p>Parfüm, krem, klorlu su ve ağır temizlik ürünleri takılarınıza zarar verir. Temas ettirmeyin.</p>
        </div>
        <div class="bakim-card do">
          <h4>✓  Ayrı Saklama</h4>
          <p>Her takıyı ayrı kesede veya bölmeli kutuda saklayın. Çizilmeleri önlemek için temas ettirmeyin.</p>
        </div>
        <div class="bakim-card dont">
          <h4>✗  Spor & Havuz</h4>
          <p>Spor yaparken, yüzerken veya duş alırken takılarınızı çıkartın. Ter ve klor kaplamaya zarar verir.</p>
        </div>
        <div class="bakim-card do">
          <h4>✓  Profesyonel Bakım</h4>
          <p>Yılda bir kez profesyonel temizlik ve kontrol önerilir. Taş düşmesi ve kaplama aşınması kontrol edilir.</p>
        </div>
        <div class="bakim-card dont">
          <h4>✗  Ultrasonik Temizlik</h4>
          <p>Zümrüt, opal, inci gibi yumuşak taşlarda ultrasonik temizleyici kullanmayın. Çatlamaya neden olabilir.</p>
        </div>
      </div>
      <div class="bakim-extra">
        <h4>Özel İpuçları</h4>
        <p>Takılarınızı makyaj yapmadan ve saç spreyi sıkmadan önce takın gün sonunda çıkartırken yumuşak bir bezle hafifçe silin. Gece yatarken takılarınızı çıkartmanız ömrünü uzatır. Altın takılarınızı zaman zaman sirke ve karbonat karışımına batırılmış yumuşak bezle parlatarak oksitlenmeyi önleyebilirsiniz.</p>
      </div>`
    },
    beden: {
      title: 'Beden Rehberi',
      icon: `<svg viewBox="0 0 64 64" fill="none"><path d="M20 56V16c0-2 1-4 3-4h18c2 0 3 2 3 4v40" stroke="rgb(212,168,83)" stroke-width="2.5" stroke-linecap="round"/><path d="M20 28h24" stroke="rgb(212,168,83)" stroke-width="1.5" opacity="0.4"/><path d="M20 38h24" stroke="rgb(212,168,83)" stroke-width="1.5" opacity="0.4"/><rect x="44" y="34" width="16" height="4" rx="2" stroke="rgb(212,168,83)" stroke-width="1.5" opacity="0.5"/></svg>`,
      html: `<div class="beden-intro">
        <p>Parmak ölçünüzü evde kendiniz kolayca alabilirsiniz. Bir ip veya kağıt şerit ile parmak çevrenizi ölçüp aşağıdaki tablodan numaranızı bulun.</p>
      </div>
      <table class="beden-table">
        <tr><th>Numara (TR)</th><th>Çap (mm)</th><th>Çevre (mm)</th><th>ABD/İngiltere</th></tr>
        <tr><td>12</td><td>15.7</td><td>49.3</td><td>4.5</td></tr>
        <tr><td>13</td><td>16.0</td><td>50.3</td><td>5</td></tr>
        <tr><td>14</td><td>16.5</td><td>51.8</td><td>5.5</td></tr>
        <tr><td>15</td><td>17.0</td><td>53.4</td><td>6</td></tr>
        <tr><td>16</td><td>17.5</td><td>55.0</td><td>7</td></tr>
        <tr><td>17</td><td>18.0</td><td>56.5</td><td>7.5</td></tr>
        <tr><td>18</td><td>18.5</td><td>58.1</td><td>8</td></tr>
        <tr><td>19</td><td>19.0</td><td>59.7</td><td>8.5</td></tr>
        <tr><td>20</td><td>19.5</td><td>61.3</td><td>9</td></tr>
        <tr><td>21</td><td>20.2</td><td>63.5</td><td>10</td></tr>
        <tr><td>22</td><td>20.8</td><td>65.3</td><td>10.5</td></tr>
        <tr><td>23</td><td>21.4</td><td>67.2</td><td>11</td></tr>
      </table>
      <div class="beden-ek">
        <h4>Diğer Ölçüler</h4>
        <div class="beden-ek-item">
          <div class="beden-ek-item-content"><strong>📿 Bileklik</strong><span>Standart: 16-18 cm, Uzun: 19-21 cm</span></div>
        </div>
        <div class="beden-ek-item">
          <div class="beden-ek-item-content"><strong>📿 Zincir Kolye</strong><span>Kısa: 40-42 cm, Orta: 45-50 cm, Uzun: 55-60 cm</span></div>
        </div>
        <div class="beden-ek-item">
          <div class="beden-ek-item-content"><strong>💍 Ölçü İpucu</strong><span>Parmağınızın en geniş kısmından ölçü alın, sıkı olmayan rahat bir ölçü tercih edin. Sabah ve akşam parmak ölçüleri farklı olabilir.</span></div>
        </div>
      </div>`
    }
  };

  const supportModal = document.getElementById('supportModal');
  const supportOverlay = document.getElementById('supportOverlay');
  const supportClose = document.getElementById('supportClose');
  const supportTitle = document.getElementById('supportModalTitle');
  const supportBody = document.getElementById('supportModalBody');
  const supportLinks = document.querySelectorAll('a[data-support]');

  function openSupport(type) {
    const content = supportContent[type];
    if (!content) return;
    supportTitle.textContent = content.title;
    supportBody.innerHTML = `<div class="support-section">${content.icon}${content.html}</div>`;
    supportModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (type === 'sss') {
      supportBody.querySelectorAll('.sss-question').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.sss-item');
          item.classList.toggle('open');
        });
      });
    }
  }

  function closeSupport() {
    supportModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  supportLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const type = link.getAttribute('data-support');
      openSupport(type);
    });
  });

  supportOverlay.addEventListener('click', closeSupport);
  supportClose.addEventListener('click', closeSupport);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && supportModal.classList.contains('active')) {
      closeSupport();
    }
  });

});
