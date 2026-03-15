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
  const sourcePageField = document.getElementById('quoteSourcePage');
  const quoteFieldOrder = [
    'item',
    'size',
    'strength',
    'qty',
    'print_type',
    'shipping_method',
    'due_text',
    'company',
    'phone',
    'email',
    'extra',
    'source_page',
    'website'
  ];
  const currentPageName = (() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1] || 'quote.html';
  })();

  const setStatus = (message, type) => {
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;
    statusNode.style.color = type === 'error' ? '#b42318' : '#123A5A';
  };

  const resetSourcePageValue = () => {
    if (sourcePageField) {
      sourcePageField.value = currentPageName;
    }
  };

  const parseJsonResponse = async (response) => {
    const responseText = await response.text();

    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      return null;
    }
  };

  resetSourcePageValue();

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

    const params = new URLSearchParams();
    quoteFieldOrder.forEach((key) => {
      const value = formData.get(key);
      const normalizedValue = typeof value === 'string' ? value.trim() : value;
      params.append(key, normalizedValue == null ? '' : normalizedValue);
    });

    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus('견적 요청을 전송하고 있습니다.', 'success');

    try {
      let response;

      try {
        response = await fetch(endpoint, {
          method: 'POST',
          redirect: 'follow',
          body: params
        });
      } catch (error) {
        error.type = 'network';
        throw error;
      }

      const result = await parseJsonResponse(response);
      const serverMessage = result && typeof result.message === 'string'
        ? result.message.trim()
        : '';

      if (!response.ok) {
        const error = new Error(serverMessage || `HTTP ${response.status}`);
        error.type = 'http';
        error.userMessage = serverMessage || '서버 응답에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        throw error;
      }

      if (result && result.ok === false) {
        const error = new Error(serverMessage || '서버 검증에 실패했습니다.');
        error.type = 'server';
        error.userMessage = serverMessage || '입력한 내용을 다시 확인해 주세요.';
        throw error;
      }

      quoteForm.reset();
      resetSourcePageValue();
      setStatus('견적 요청이 접수되었습니다. 확인 후 연락드리겠습니다.', 'success');
    } catch (error) {
      console.error(error);

      if (error && typeof error.userMessage === 'string' && error.userMessage.trim()) {
        setStatus(error.userMessage.trim(), 'error');
      } else if (error && error.type === 'network') {
        setStatus('네트워크 연결을 확인한 뒤 다시 시도해 주세요.', 'error');
      } else if (error && error.type === 'http') {
        setStatus('서버 응답에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
      } else if (error && error.type === 'server') {
        setStatus('입력한 내용을 다시 확인해 주세요.', 'error');
      } else {
        setStatus('전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
})();
