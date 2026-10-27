(() => {
  'use strict';
  const root = document.documentElement;
  const shell = document.getElementById('site-shell');
  const intro = document.getElementById('intro');
  const main = document.getElementById('main-content');
  const pages = [...document.querySelectorAll('.page')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const labels = { home: '主页', about: '个人背景', resume: '简历', life: '生活' };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let introTimer;
  let finishTimer;
  let unlockAnimations = [];

  function clearUnlockAnimations() {
    for (const animation of unlockAnimations) animation.cancel();
    unlockAnimations = [];
  }

  function animateUnlock() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const pieces = shell.querySelectorAll(
      '.wordmark, .sidebar-caption, .nav-link, .sidebar-bottom, .topbar, ' +
      '.page:not([hidden]) .hero-copy > *, .page:not([hidden]) .hero-art, ' +
      '.page:not([hidden]) .section-label, .page:not([hidden]) .explore-links > a, ' +
      '.page:not([hidden]) .page-heading, .page:not([hidden]) .about-layout, ' +
      '.page:not([hidden]) .resume-note, .page:not([hidden]) .resume-sections, ' +
      '.page:not([hidden]) .life-canvas, .page:not([hidden]) .life-back, .footer'
    );

    for (const [index, element] of [...pieces].entries()) {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.top >= window.innerHeight || rect.bottom <= 0) continue;
      const dx = centerX - (rect.left + rect.width / 2);
      const dy = centerY - (rect.top + rect.height / 2);
      unlockAnimations.push(element.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(.68)`, opacity: 0 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 }
      ], { duration: 1080, delay: Math.min(index * 8, 80), easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' }));
    }

    const directions = [[-.25, -.18], [.04, -.3], [.22, .25]];
    intro.querySelectorAll('.intro-word').forEach((word, index) => {
      const [dx, dy] = directions[index];
      unlockAnimations.push(word.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * innerWidth}px, ${dy * innerHeight}px) scale(1.18)`, opacity: 0 }
      ], { duration: 720, easing: 'cubic-bezier(.4, 0, .6, 1)', fill: 'both' }));
    });
  }

  function finishIntro(fromButton = false) {
    if (!root.classList.contains('intro-active')) return;
    clearTimeout(introTimer);
    clearTimeout(finishTimer);
    const focusWasInIntro = intro.contains(document.activeElement);
    if (!reducedMotion.matches) {
      root.classList.add('intro-transitioning');
      try { animateUnlock(); } catch { clearUnlockAnimations(); }
    }
    root.classList.remove('intro-active');
    shell.inert = false;
    shell.removeAttribute('aria-hidden');
    intro.inert = true;
    intro.setAttribute('aria-hidden', 'true');
    if (fromButton || focusWasInIntro) main.focus({ preventScroll: true });
    finishTimer = setTimeout(() => {
      intro.hidden = true;
      root.classList.remove('intro-transitioning');
      clearUnlockAnimations();
    }, reducedMotion.matches ? 0 : 1200);
  }

  function playIntro() {
    clearTimeout(finishTimer);
    clearTimeout(introTimer);
    clearUnlockAnimations();
    root.classList.remove('intro-transitioning');
    intro.hidden = false;
    intro.inert = false;
    intro.removeAttribute('aria-hidden');
    shell.inert = true;
    shell.setAttribute('aria-hidden', 'true');
    root.classList.add('intro-active');
    // Hold the original opening for two seconds, then unfold the page from its center.
    introTimer = setTimeout(finishIntro, 2000);
  }

  function showPage(focus = false) {
    let id = location.hash.slice(1) || 'home';
    if (id === 'main-content') {
      main.focus({ preventScroll: true });
      return;
    }
    if (!Object.hasOwn(labels, id)) {
      id = 'home';
      history.replaceState(null, '', '#home');
    }
    for (const page of pages) {
      const active = page.id === id;
      page.hidden = !active;
      page.classList.toggle('is-entering', active);
    }
    for (const link of navLinks) {
      const active = link.hash === '#' + id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    document.getElementById('breadcrumb').textContent = '我的空间 / ' + labels[id];
    document.title = 'Zheyu Deng · ' + labels[id];
    if (focus) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      main.focus({ preventScroll: true });
    }
  }

  document.getElementById('skip-intro').addEventListener('click', () => finishIntro(true));
  document.getElementById('replay-intro').addEventListener('click', () => {
    playIntro();
    document.getElementById('skip-intro').focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', () => showPage(true));
  document.getElementById('year').textContent = new Date().getFullYear();
  showPage();
  playIntro();
})();
