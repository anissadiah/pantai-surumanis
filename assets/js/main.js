(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  body.classList.add('v4-ready');

  // Local photo system:
  // Drop the replacement files in assets/images/ using these names.
  // If a file is missing, the original remote photo remains as a fallback.
  const localPhotoLibrary = {
    'https://lh3.googleusercontent.com/aida/AEtjO1WZBq9itUvTDSAakk-RjYihP04CqAk86fgCySA-CgcjifJ8oTj3puX6fzQAFAsvFL4OB9Nw9fZFSOMUoIVW_F-NcHMDYidjHACufXINJpvD3YiBEYn1Hn8KD4CkSD6gMZWHhGp1xDGnc0QvLUBiFbzwZzRiI5ZeYMv2sMuduoQYI7jzdWiNYObOBVRQt5RXCK0AiDKTbouiuSysBV7XYWUXJT03668vgvCLX8rF17n0Ewy-CmhWmGtUB4dj':
      'assets/images/01-hero-tebing.webp',
    'https://lh3.googleusercontent.com/aida/AEtjO1UkaEEChA_frFoinJ8_g233UcYwW17BM-Ie93oj1xwrZVu05yAJYnkv7P_IM6ryH_IMNpMeTQjDfQTiRSFdsJ_MlNaSFSQgQO1kzay2BwEHI9J90ft3geFnuiDFjIJnyf4EePXzMdcI2m1cwnaq5Ye75KPmHlwrrWOnkCPO7RbP_wp5EAWd5uRMtb49ZMTXvQajtI0QgAsFlvf6vtyR8jWhWvudfr4F3EWwRKx80njpHGr-3W5Vfsuj_zNv':
      'assets/images/02-jalur-pandan.webp',
    'https://lh3.googleusercontent.com/aida/AEtjO1WeI8Xdb2Vlt5SwT9ZwBegjEOsgH6y3s9CNFGJpZyoTpOVSXE45EbztfiXyfeA25AqmuURplclJVIzKlIKB-_dkubHTHvOswPBCz4j8m76mPzfynGHRooiA0hDZnxIlksyCaM5dfBXZFV5r4o3BebU9OVRzWUQ-yVqfeS-AHMvPCD2EW50UzolxygRyYE6alCtrE7EaqvqF3Jq7tM3jXKlh6znXRGx0K3lq7njeXOHn2F8XtPlffls86UL1':
      'assets/images/03-sunset-gardu.webp',
    'https://lh3.googleusercontent.com/aida/AEtjO1UyvWsG06LTzVzR3Tid5Wxi5q_ePGUsY2KuQX-xK5f2-epkLIdIiDzGUjirDGy8lB_BHvfgZUXt3Osq1uAGnkRmEir8njWxKRlykKq6V2CiA4k5KlE10sLBz5g8vKgVgsQ0YXMI-wkKvIujWCh-b0YjPlUGIx0EX4kQdNmBoYXLYMmHx5laj9X--nHT2euoqL7u0yvD7UVGTnl2VNwThz34rHlSbdiVm2Pa02lUqHITNf8ELV1fj8CiTMSd':
      'assets/images/04-panorama-pesisir.webp'
  };

  function hydrateLocalPhotos() {
    document.querySelectorAll('img[src]').forEach(img => {
      if ((img.alt || '').toLowerCase().includes('logo')) return;
      const original = img.getAttribute('src');
      const local = localPhotoLibrary[original];
      if (!local) return;
      img.dataset.remoteFallback = original;
      img.src = local;
      img.addEventListener('error', () => {
        if (img.dataset.remoteFallback && img.src !== new URL(img.dataset.remoteFallback, location.href).href) {
          img.src = img.dataset.remoteFallback;
        }
      }, { once: true });
    });
  }
  hydrateLocalPhotos();

  // Scroll progress: reuse an existing node (social.html already contains one).
  const bar = document.getElementById('v4-progress') || document.createElement('div');
  if (!bar.id) {
    bar.id = 'v4-progress';
    body.appendChild(bar);
  }

  let ticking = false;
  const updateScrollUI = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.width = `${Math.min(100, Math.max(0, (y / max) * 100))}%`;
      body.classList.toggle('v4-scrolled', y > 30);
      ticking = false;
    });
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  // Reveal sections/cards. Content remains visible when JS fails; CSS only hides after v4-ready.
  const candidates = document.querySelectorAll('.mp-page-section section, .mp-page-section article, .mp-page-section h2, .mp-page-section h3, .mp-page-section .grid > div, body > main > section:not(.hero)');
  candidates.forEach((el, i) => {
    if (el.closest('header, footer')) return;
    el.classList.add('v4-reveal');
    if (i % 4 === 1) el.classList.add('v4-delay-1');
    if (i % 4 === 2) el.classList.add('v4-delay-2');
    if (i % 4 === 3) el.classList.add('v4-delay-3');
  });

  const revealItems = document.querySelectorAll('.v4-reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('v4-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });
    revealItems.forEach(el => io.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('v4-visible'));
  }

  // Hero imagery + subtle parallax hooks. Local photos are hydrated first so hero uses them too.
  const hero = document.querySelector('.mp-page-hero');
  if (hero) {
    hero.dataset.motionHero = 'true';
  }
  const homeHero = document.getElementById('hero');
  if (homeHero) {
    homeHero.dataset.motionHero = 'true';
  }
  if (hero && !hero.style.getPropertyValue('--v4-hero-image')) {
    const declared = hero.dataset.hero;
    if (declared) hero.style.setProperty('--v4-hero-image', `url("${declared}")`);
    else {
      const img = [...document.querySelectorAll('img')].find(i => {
        const alt = (i.alt || '').toLowerCase();
        const src = i.currentSrc || i.src || '';
        return src && !alt.includes('logo') && !i.closest('#lightbox-modal');
      });
      if (img) hero.style.setProperty('--v4-hero-image', `url("${img.currentSrc || img.src}")`);
    }
  }


  // Staged hero/content motion.
  const motionGroups = [
    document.querySelector('#hero .max-w-3xl'),
    document.querySelector('.mp-page-hero .mp-shell'),
    document.querySelector('.social-final-hero .max-w-4xl')
  ].filter(Boolean);

  motionGroups.forEach(group => {
    group.classList.add('motion-stagger');
    requestAnimationFrame(() => group.classList.add('motion-ready'));
  });

  // Add a restrained sheen to primary gold actions.
  document.querySelectorAll('a.bg-sunset-gold, .social-final-btn-primary, .mp-cta-link').forEach(el => {
    el.classList.add('motion-sheen');
  });

  // Scroll-linked parallax; desktop-first and deliberately subtle.
  if (!reduceMotion) {
    const parallaxNodes = [];
    const collectParallax = () => {
      const nodes = [
        ...document.querySelectorAll('#hero[data-motion-hero], .mp-page-hero[data-motion-hero]')
      ];
      parallaxNodes.splice(0, parallaxNodes.length, ...nodes);
    };
    collectParallax();

    const updateParallax = () => {
      const vh = window.innerHeight || 1;
      parallaxNodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (vh / 2 - (rect.top + rect.height / 2)) / Math.max(vh, rect.height)));
        node.style.setProperty('--hero-shift', `${progress * -34}px`);
      });
    };
    let parallaxTick = false;
    const onParallaxScroll = () => {
      if (parallaxTick) return;
      parallaxTick = true;
      requestAnimationFrame(() => {
        updateParallax();
        parallaxTick = false;
      });
    };
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    updateParallax();
  }

  // Very subtle tilt on the Social cards for pointer devices only.
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.social-final-card').forEach(card => {
      let raf = 0;
      const reset = () => {
        card.style.transform = '';
      };
      card.addEventListener('pointermove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${(-y * 2.4).toFixed(2)}deg) rotateY(${(x * 2.4).toFixed(2)}deg) translateY(-4px)`;
        });
      });
      card.addEventListener('pointerleave', reset);
    });
  }

  // Mark current page in every main navigation.
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('header nav a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    const clean = href.split('#')[0];
    if (clean === current || (current === '' && clean === 'index.html')) {
      a.classList.add('v4-nav-active');
      a.setAttribute('aria-current', 'page');
    }
  });

  // Page-to-page fade, respecting reduced motion and modified/new-tab clicks.
  if (!reduceMotion) {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank' || a.hasAttribute('download')) return;
      a.addEventListener('click', e => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        e.preventDefault();
        body.classList.add('v4-leaving');
        window.setTimeout(() => { location.href = url.href; }, 180);
      });
    });
  }

  // Mobile drawer with focus return, Escape close, aria state, and scroll locking.
  const drawer = document.getElementById('luxury-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const drawerToggle = document.querySelector('[data-drawer-toggle="true"]');
  let drawerOpen = false;
  let lastDrawerFocus = null;

  const drawerFocusable = () => drawer ? [...drawer.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => !el.hidden) : [];

  function setDrawer(open) {
    if (!drawer) return;
    drawerOpen = Boolean(open);
    drawer.classList.toggle('active', drawerOpen);
    backdrop?.classList.toggle('active', drawerOpen);
    drawer.setAttribute('aria-hidden', drawerOpen ? 'false' : 'true');
    drawerToggle?.setAttribute('aria-expanded', String(drawerOpen));
    body.classList.toggle('v4-drawer-open', drawerOpen);
    if (drawerOpen) {
      lastDrawerFocus = document.activeElement;
      const first = drawerFocusable()[0];
      window.setTimeout(() => (first || drawer).focus?.(), 0);
    } else {
      window.setTimeout(() => lastDrawerFocus?.focus?.(), 0);
    }
  }

  window.toggleDrawer = () => setDrawer(!drawerOpen);
  drawerToggle?.addEventListener('click', () => setDrawer(!drawerOpen));
  document.addEventListener('click', e => {
    const closeLink = e.target.closest('#luxury-drawer a[href]');
    const closeControl = e.target.closest('[data-drawer-close="true"]');
    if (closeLink && !closeLink.getAttribute('href')?.startsWith('#')) setDrawer(false);
    if (closeControl && !closeLink) setDrawer(false);
  });
  backdrop?.addEventListener('click', () => setDrawer(false));
  drawer?.setAttribute('tabindex', '-1');
  drawer?.setAttribute('aria-hidden', 'true');

  // Lightbox: keeps the existing page hooks but adds keyboard support.
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalCaption = document.getElementById('lightbox-caption');
  let lastModalFocus = null;

  function closeLightbox() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('v4-modal-open');
    if (modalImg) {
      modalImg.removeAttribute('src');
      modalImg.alt = '';
    }
    window.setTimeout(() => lastModalFocus?.focus?.(), 0);
  }

  function openLightbox(imgSrc, captionText) {
    if (!modal || !modalImg || !imgSrc) return;
    lastModalFocus = document.activeElement;
    modalImg.src = imgSrc;
    modalImg.alt = captionText || 'Pratinjau foto Pantai Surumanis';
    if (modalCaption) modalCaption.textContent = captionText || '';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('v4-modal-open');
    window.setTimeout(() => document.querySelector('#lightbox-modal button')?.focus(), 0);
  }

  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  modal?.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('button[data-lightbox-close="true"]')) closeLightbox();
  });


  // Existing gallery triggers and direct image links.
  const galleryLinks = [...document.querySelectorAll('.v4-gallery-masonry a, .v4-lightbox-link')];
  galleryLinks.forEach(a => a.addEventListener('click', e => {
    if (a.hasAttribute('download')) return;
    const im = a.querySelector('img');
    if (!im) return;
    e.preventDefault();
    openLightbox(im.currentSrc || im.src, im.alt || 'Pratinjau foto Pantai Surumanis');
  }));

  const galleryTriggers = [...document.querySelectorAll('.v4-lightbox-trigger')];
  galleryTriggers.forEach(trigger => trigger.addEventListener('click', () => {
    const img = trigger.querySelector('img');
    const currentSrc = img?.currentSrc || img?.getAttribute('src') || trigger.dataset.lightboxSrc;
    openLightbox(currentSrc, trigger.dataset.lightboxCaption || img?.alt || 'Pratinjau foto Pantai Surumanis');
  }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modal?.classList.contains('active')) closeLightbox();
      if (drawerOpen) setDrawer(false);
      return;
    }
    if (e.key !== 'Tab') return;

    if (drawerOpen) {
      const items = drawerFocusable();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    } else if (modal?.classList.contains('active')) {
      const items = [...modal.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(el => !el.hidden);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('tabindex', '-1');
  }

  // Floating social buttons are intentionally omitted; direct CTAs and the social page keep the interface calmer.

})();
