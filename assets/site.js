(() => {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('is-open', !expanded);
    });
  }

  const tabLinks = [...document.querySelectorAll('.product-tabs a[href^="#"]')];
  if (tabLinks.length) {
    const setActive = () => {
      const current = window.location.hash || '#detail-info';
      tabLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === current);
      });
    };

    tabLinks.forEach((link) => {
      link.addEventListener('click', () => {
        setTimeout(setActive, 0);
      });
    });

    window.addEventListener('hashchange', setActive);
    setActive();
  }
})();
