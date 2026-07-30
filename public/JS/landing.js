/* =============================================================================
   LANDING.JS - Landing Page Premium Fashion Style
   Animaciones, interactividad y funcionalidad
   ============================================================================= */

(function() {
  'use strict';

  const CONFIG = {
    revealThreshold: 0.15,
    sliderInterval: 5000
  };

  document.addEventListener('DOMContentLoaded', function() {
    initNavbarScroll();
    initMobileMenu();
    initSlider();
    initScrollReveal();
    initCountdown();
    initSmoothScroll();
    initTestimonialForm();
    loadSavedTestimonials();
  });

  // ─── Navbar ───
  function initNavbarScroll() {
    var navbar = document.querySelector('.fs-navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function() {
      var s = window.pageYOffset || document.documentElement.scrollTop;
      navbar.classList.toggle('scrolled', s > 50);
    }, { passive: true });
  }

  // ─── Mobile Menu ───
  function initMobileMenu() {
    var toggle = document.querySelector('.fs-nav-toggle');
    var navLinks = document.querySelector('.fs-nav-links');
    var overlay = document.querySelector('.fs-nav-overlay');
    if (!toggle || !navLinks) return;

    function close() { toggle.classList.remove('active'); navLinks.classList.remove('open'); if (overlay) overlay.classList.remove('active'); document.body.style.overflow = ''; }
    function open() { toggle.classList.add('active'); navLinks.classList.add('open'); if (overlay) overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }

    toggle.addEventListener('click', function() { navLinks.classList.contains('open') ? close() : open(); });
    if (overlay) overlay.addEventListener('click', close);
    navLinks.querySelectorAll('a').forEach(function(l) { l.addEventListener('click', close); });
    window.addEventListener('resize', function() { if (window.innerWidth > 1024) close(); });
  }

  // ─── SLIDER / CARRUSEL ───
  function initSlider() {
    var slider = document.querySelector('.fs-slider');
    if (!slider) return;

    var slides = slider.querySelectorAll('.fs-slide');
    var dots = slider.querySelectorAll('.fs-dot');
    var prevBtn = slider.querySelector('.fs-slider-prev');
    var nextBtn = slider.querySelector('.fs-slider-next');
    var current = 0;
    var total = slides.length;
    var interval;

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      slides.forEach(function(s, i) { s.classList.toggle('active', i === index); });
      dots.forEach(function(d, i) { d.classList.toggle('active', i === index); });
      current = index;
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoPlay() { if (total > 1) interval = setInterval(next, CONFIG.sliderInterval); }
    function stopAutoPlay() { clearInterval(interval); }

    if (nextBtn) nextBtn.addEventListener('click', function() { stopAutoPlay(); next(); startAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', function() { stopAutoPlay(); prev(); startAutoPlay(); });
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        stopAutoPlay();
        goTo(parseInt(this.dataset.index));
        startAutoPlay();
      });
    });

    // Pausar al hover
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    // Iniciar auto-play
    startAutoPlay();
  }

  // ─── Scroll Reveal ───
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;
    function onScroll() {
      var wh = window.innerHeight;
      els.forEach(function(el) {
        var r = el.getBoundingClientRect();
        if (r.top < wh * (1 - CONFIG.revealThreshold) && r.bottom > 0) el.classList.add('visible');
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Countdown ───
  function initCountdown() {
    var countdown = document.querySelector('.fs-countdown');
    if (!countdown) return;
    var target = new Date();
    target.setDate(target.getDate() + 3);
    target.setHours(23, 59, 59, 0);

    function update() {
      var diff = target - new Date();
      if (diff <= 0) return;
      function set(attr, val) { var el = countdown.querySelector('[data-countdown="' + attr + '"]'); if (el) el.textContent = String(val).padStart(2, '0'); }
      set('days', Math.floor(diff / (1000*60*60*24)));
      set('hours', Math.floor((diff % (1000*60*60*24)) / (1000*60*60)));
      set('minutes', Math.floor((diff % (1000*60*60)) / (1000*60)));
      set('seconds', Math.floor((diff % (1000*60)) / 1000));
    }
    update();
    setInterval(update, 1000);
  }

  // ─── Smooth Scroll ───
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
      });
    });
  }

  // ─── Category click ───
  document.addEventListener('click', function(e) {
    var cat = e.target.closest('.fs-category-card');
    if (cat) {
      var link = cat.querySelector('.fs-category-btn');
      if (link && link.getAttribute('href') && !e.target.closest('.fs-category-btn')) {
        window.location.href = link.getAttribute('href');
      }
    }
  });

  // ─── Product card delegation ───
  document.addEventListener('click', function(e) {
    var card = e.target.closest('.fs-product-card');
    if (!card) return;
    var addCart = e.target.closest('.fs-product-add-cart');
    var buyNow = e.target.closest('.fs-product-buy-now');
    var wishlist = e.target.closest('.fs-product-wishlist');

    if (addCart && window.CartUtils) {
      e.preventDefault(); e.stopPropagation();
      window.CartUtils.addItem('fashion_cart', {
        id: Number(card.dataset.id), nombre: card.dataset.nombre,
        precio: Number(card.dataset.precio), imagen: card.dataset.imagen || ''
      });
      if (window.miniCarrito) { window.miniCarrito.actualizarBadge(); window.miniCarrito.toggle(); }
    } else if (buyNow) {
      e.preventDefault(); e.stopPropagation();
      var id = Number(card.dataset.id);
      if (id) window.location.href = 'producto.html?id=' + id;
    } else if (wishlist) {
      e.preventDefault(); e.stopPropagation();
      wishlist.classList.toggle('active');
      wishlist.style.color = wishlist.classList.contains('active') ? '#ff1493' : '#adb5bd';
    }
  });

  // ─── TESTIMONIOS ───
  function initTestimonialForm() {
    var form = document.getElementById('testimonialForm');
    if (!form) return;
    var nameInput = document.getElementById('testimonialName');
    var commentInput = document.getElementById('testimonialComment');
    var stars = form.querySelectorAll('.star-rating input');
    var submitBtn = form.querySelector('.btn-submit-testimonial');
    var errorEl = document.getElementById('testimonialError');
    var successEl = document.getElementById('testimonialSuccess');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (errorEl) errorEl.classList.remove('show');
      if (successEl) successEl.classList.remove('show');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publicando...';

      var name = nameInput ? nameInput.value.trim() : '';
      var comment = commentInput ? commentInput.value.trim() : '';
      var rating = 0;
      for (var i = 0; i < stars.length; i++) { if (stars[i].checked) { rating = parseInt(stars[i].value); break; } }

      if (!name) { showError('Por favor ingresa tu nombre'); return; }
      if (!comment || comment.length < 10) { showError('El comentario debe tener al menos 10 caracteres'); return; }
      if (rating === 0) { showError('Selecciona una calificación'); return; }

      var testimonial = {
        name: name, comment: comment, rating: rating,
        date: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
        id: Date.now()
      };

      saveTestimonial(testimonial);
      addTestimonialCard(testimonial);
      form.reset();
      if (successEl) successEl.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publicar comentario';
      setTimeout(function() { if (successEl) successEl.classList.remove('show'); }, 4000);
    });

    function showError(msg) {
      if (errorEl) { errorEl.textContent = msg; errorEl.classList.add('show'); }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publicar comentario';
    }
  }

  function saveTestimonial(t) {
    var list = JSON.parse(localStorage.getItem('fs_testimonials') || '[]');
    list.unshift(t);
    localStorage.setItem('fs_testimonials', JSON.stringify(list));
  }

  function loadSavedTestimonials() {
    var grid = document.querySelector('.fs-testimonials-grid');
    if (!grid) return;
    var saved = JSON.parse(localStorage.getItem('fs_testimonials') || '[]');
    saved.forEach(function(t) { addTestimonialCard(t, grid); });
  }

  function addTestimonialCard(t, grid) {
    grid = grid || document.querySelector('.fs-testimonials-grid');
    if (!grid) return;
    var stars = '';
    for (var i = 0; i < 5; i++) stars += i < t.rating ? '★' : '☆';
    var initials = t.name.split(' ').map(function(w) { return w.charAt(0); }).join('').substring(0, 2).toUpperCase();
    var card = document.createElement('div');
    card.className = 'fs-testimonial-card reveal';
    card.innerHTML = '<div class="fs-testimonial-stars">' + stars + '</div>' +
      (t.date ? '<div class="fs-testimonial-date">' + t.date + '</div>' : '') +
      '<p class="fs-testimonial-text">"' + escapeHtml(t.comment) + '"</p>' +
      '<div class="fs-testimonial-author"><div class="fs-testimonial-avatar">' + initials + '</div>' +
      '<div><div class="fs-testimonial-name">' + escapeHtml(t.name) + '</div><div class="fs-testimonial-role">Cliente verificado</div></div></div>';
    grid.appendChild(card);
    setTimeout(function() { card.classList.add('visible'); }, 100);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  window.addTestimonialCard = addTestimonialCard;

})();