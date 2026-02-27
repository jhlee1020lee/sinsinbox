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

  const qtySelect = document.querySelector('select[data-qty]');
  const unitPriceSource = document.querySelector('[data-unit-price]');
  const totalTarget = document.querySelector('[data-total]');

  const formatWon = (value) => `${value.toLocaleString('ko-KR')}원 (VAT 별도)`;

  const updateTotalPrice = () => {
    if (!qtySelect || !unitPriceSource || !totalTarget) {
      return;
    }

    const qty = Number(qtySelect.value);
    const unitPrice = Number(unitPriceSource.getAttribute('data-unit-price'));

    if (!Number.isFinite(qty) || !Number.isFinite(unitPrice)) {
      totalTarget.textContent = formatWon(0);
      return;
    }

    totalTarget.textContent = formatWon(qty * unitPrice);
  };

  if (qtySelect && unitPriceSource && totalTarget) {
    qtySelect.addEventListener('change', updateTotalPrice);
    updateTotalPrice();
  }
})();
