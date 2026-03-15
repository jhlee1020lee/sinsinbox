(() => {
  const body = document.body;
  const toggleButton = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const stickyCta = document.querySelector('.mobile-sticky-cta');

  if (toggleButton && mobileNav) {
    toggleButton.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      toggleButton.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        toggleButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (stickyCta) {
    body.classList.add('has-mobile-cta');
  }

  const productTabs = document.querySelectorAll('.product-tabs a');
  if (productTabs.length) {
    const syncActiveTab = () => {
      const currentHash = window.location.hash || productTabs[0].getAttribute('href');
      productTabs.forEach((tab) => {
        tab.classList.toggle('is-active', tab.getAttribute('href') === currentHash);
      });
    };

    productTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        window.setTimeout(syncActiveTab, 0);
      });
    });

    window.addEventListener('hashchange', syncActiveTab);
    syncActiveTab();
  }

  document.querySelectorAll('[data-quote-calc]').forEach((wrapper) => {
    const qtyField = wrapper.querySelector('[data-quote-qty]');
    const totalField = wrapper.querySelector('[data-quote-total]');
    const unitPrice = Number(wrapper.getAttribute('data-unit-price'));

    if (!qtyField || !totalField || !Number.isFinite(unitPrice)) {
      return;
    }

    const formatter = new Intl.NumberFormat('ko-KR');
    const render = () => {
      const quantity = Number(qtyField.value || 0);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        totalField.value = '';
        return;
      }

      totalField.value = `예상 금액 ${formatter.format(unitPrice * quantity)}원`;
    };

    qtyField.addEventListener('change', render);
    render();
  });

  const quoteForm = document.getElementById('quoteForm');
  if (!quoteForm) {
    return;
  }

  const submitButton = document.getElementById('quoteSubmitButton');
  const statusNode = document.getElementById('quoteFormStatus');

  const setStatus = (message, type) => {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;
    statusNode.style.color = type === 'error' ? '#b42318' : '#123A5A';
  };

  quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!quoteForm.reportValidity()) {
      setStatus('필수 항목을 먼저 확인해 주세요.', 'error');
      return;
    }

    const endpoint = window.APP_CONFIG && window.APP_CONFIG.QUOTE_ENDPOINT;
    if (!endpoint) {
      setStatus('전송 설정을 확인할 수 없습니다. 전화나 이메일로 문의해 주세요.', 'error');
      return;
    }

    const formData = new FormData(quoteForm);
    if (String(formData.get('website') || '').trim() !== '') {
      setStatus('전송을 진행할 수 없습니다.', 'error');
      return;
    }

    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = typeof value === 'string' ? value.trim() : value;
    });

    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus('견적 요청을 전송하고 있습니다.', 'success');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      quoteForm.reset();
      const sourcePage = document.getElementById('quoteSourcePage');
      if (sourcePage) {
        sourcePage.value = 'quote.html';
      }
      setStatus('견적 요청이 접수되었습니다. 확인 후 연락드리겠습니다.', 'success');
    } catch (error) {
      setStatus('전송 중 문제가 발생했습니다. 전화 02-2269-4933 또는 이메일로 문의해 주세요.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
})();
