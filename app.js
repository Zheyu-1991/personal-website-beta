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

  function finishIntro(fromButton = false) {
    clearTimeout(introTimer);
    clearTimeout(finishTimer);
    const focusWasInIntro = intro.contains(document.activeElement);
    root.classList.remove('intro-active');
    shell.inert = false;
    shell.removeAttribute('aria-hidden');
    intro.inert = true;
    intro.setAttribute('aria-hidden', 'true');
    if (fromButton || focusWasInIntro) main.focus({ preventScroll: true });
    finishTimer = setTimeout(() => { intro.hidden = true; }, reducedMotion.matches ? 0 : 850);
  }

  function playIntro() {
    clearTimeout(finishTimer);
    clearTimeout(introTimer);
    intro.hidden = false;
    intro.inert = false;
    intro.removeAttribute('aria-hidden');
    shell.inert = true;
    shell.setAttribute('aria-hidden', 'true');
    root.classList.add('intro-active');
    // Hold the original opening for two seconds, then crossfade into the page.
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
