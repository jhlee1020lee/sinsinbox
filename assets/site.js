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

  const qty = document.querySelector('[data-qty]');
  const unit = document.querySelector('[data-unit]');
  const total = document.querySelector('[data-total]');

  if (qty && unit && total) {
    const unitPrice = Number(unit.getAttribute('data-unit-price') || 0);
    const formatWon = (n) => `${n.toLocaleString('ko-KR')}원 (VAT 별도)`;
    const updateTotal = () => {
      const quantity = Number(qty.value || 0);
      total.textContent = formatWon(unitPrice * quantity);
    };
    qty.addEventListener('change', updateTotal);
    updateTotal();
  }


  if (document.querySelector('.sticky-cta')) {
    document.body.classList.add('has-sticky-cta');
  }

  const tabs = document.querySelectorAll('.product-tab-nav a');
  if (tabs.length) {
    const setActiveTab = (targetId) => {
      tabs.forEach((tab) => {
        tab.classList.toggle('is-active', tab.getAttribute('href') === `#${targetId}`);
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', (event) => {
        const href = tab.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveTab(href.slice(1));
      });
    });

    const initial = window.location.hash ? window.location.hash.slice(1) : 'tab-detail';
    setActiveTab(initial);
  }
})();
