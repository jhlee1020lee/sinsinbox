(() => {
  const body = document.body;
  const toggleButton = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const stickyCta = document.querySelector('.mobile-sticky-cta');
  const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const readText = (node) => normalizeText(node && node.textContent);
  const findLabeledValue = (root, labels) => {
    if (!root) {
      return '';
    }

    const normalizedLabels = labels.map((label) => normalizeText(label));
    const entries = root.querySelectorAll('.summary-item, .card');

    for (const entry of entries) {
      const labelNode = entry.querySelector('.summary-label');
      const valueNode = entry.querySelector('.summary-value');
      const labelText = readText(labelNode);

      if (!labelText || !valueNode) {
        continue;
      }

      if (normalizedLabels.includes(labelText)) {
        return readText(valueNode);
      }
    }

    return '';
  };
  const mapItemCategory = (categoryText, itemName) => {
    const source = `${normalizeText(categoryText)} ${normalizeText(itemName)}`;

    if (source.includes('택배박스') || source.includes('골판지 박스')) {
      return '택배박스 / 골판지 박스';
    }

    if (source.includes('D형박스')) {
      return 'D형박스';
    }

    if (source.includes('골판지')) {
      return '골판지(양면 / 편면)';
    }

    return '기타 포장자재';
  };
  const mapStrengthOption = (strengthText) => {
    const normalized = normalizeText(strengthText).toUpperCase();

    if (!normalized) {
      return '';
    }

    if (normalized.includes('DW') || normalized.includes('D/W')) {
      return 'DW';
    }

    if (normalized.includes('A골')) {
      return 'A골';
    }

    if (normalized.includes('B골')) {
      return 'B골';
    }

    if (normalized.includes('E골')) {
      return 'E골';
    }

    return '';
  };
  const setSelectValue = (select, value) => {
    if (!select || !value) {
      return false;
    }

    const targetValue = normalizeText(value);
    const matchedOption = Array.from(select.options).find((option) => {
      return normalizeText(option.value) === targetValue || normalizeText(option.textContent) === targetValue;
    });

    if (!matchedOption) {
      return false;
    }

    select.value = matchedOption.value;
    return true;
  };
  const appendLines = (field, lines) => {
    if (!field || !lines.length) {
      return;
    }

    const currentValue = normalizeText(field.value);
    const nextLines = lines.filter((line) => line && !currentValue.includes(line));

    if (!nextLines.length) {
      return;
    }

    field.value = currentValue ? `${field.value.trim()}\n${nextLines.join('\n')}` : nextLines.join('\n');
  };
  const collectProductQuoteData = () => {
    if (!body.classList.contains('product-detail-page')) {
      return null;
    }

    const pageHero = document.querySelector('.page-hero');
    if (!pageHero) {
      return null;
    }

    const itemName = findLabeledValue(pageHero, ['상품명']) || readText(pageHero.querySelector('.page-title'));
    const categoryText = readText(pageHero.querySelector('.badges .badge.strong'));
    const size = findLabeledValue(pageHero, ['규격']);
    const strength = findLabeledValue(pageHero, ['재질 · 골 · 두께']);
    const qtyField = pageHero.querySelector('[data-quote-qty]');
    const qty = qtyField ? normalizeText(qtyField.value) : '';

    return {
      itemCategory: mapItemCategory(categoryText, itemName),
      itemName,
      size,
      strength,
      qty
    };
  };
  const collectCardQuoteData = (card) => {
    if (!card) {
      return null;
    }

    const categoryText = readText(card.querySelector('.badges .badge.strong'));
    let itemName = '';
    let size = '';

    if (card.classList.contains('feature-card')) {
      itemName = readText(card.querySelector('h3'));
      const specValue = card.querySelector('.feature-meta .meta-value');
      size = readText(specValue).split(' / ')[0];
    } else if (card.classList.contains('product-list-item')) {
      itemName = readText(card.querySelector('.product-title'));
      size = readText(card.querySelector('.product-spec')).split(' / ')[0];
    }

    if (!itemName && !categoryText && !size) {
      return null;
    }

    return {
      itemCategory: mapItemCategory(categoryText, itemName),
      itemName,
      size
    };
  };
  const buildQuoteUrl = (baseHref, productData) => {
    const url = new URL(baseHref, window.location.href);

    if (!productData) {
      return url.toString();
    }

    if (productData.itemCategory) {
      url.searchParams.set('item_category', productData.itemCategory);
    }

    if (productData.itemName) {
      url.searchParams.set('item_name', productData.itemName);
    }

    if (productData.size) {
      url.searchParams.set('size', productData.size);
    }

    if (productData.strength) {
      url.searchParams.set('strength', productData.strength);
    }

    if (productData.qty) {
      url.searchParams.set('qty', productData.qty);
    }

    return url.toString();
  };

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

  const productQuoteLinks = Array.from(document.querySelectorAll('.page-hero a[href="quote.html"], .mobile-sticky-cta a[href="quote.html"]'));
  const updateProductQuoteLinks = () => {
    const productQuoteData = collectProductQuoteData();

    if (!productQuoteData || !productQuoteLinks.length) {
      return;
    }

    productQuoteLinks.forEach((link) => {
      const baseHref = link.dataset.quoteBaseHref || link.getAttribute('href') || 'quote.html';
      link.setAttribute('href', buildQuoteUrl(baseHref, productQuoteData));
    });
  };

  if (productQuoteLinks.length) {
    productQuoteLinks.forEach((link) => {
      link.dataset.quoteBaseHref = link.getAttribute('href') || 'quote.html';
      link.addEventListener('click', updateProductQuoteLinks);
    });

    const qtyField = document.querySelector('.page-hero [data-quote-qty]');
    if (qtyField) {
      qtyField.addEventListener('input', updateProductQuoteLinks);
      qtyField.addEventListener('change', updateProductQuoteLinks);
    }

    updateProductQuoteLinks();
  }

  document.querySelectorAll('.feature-card a[href="quote.html"], .product-list-item a[href="quote.html"]').forEach((link) => {
    const card = link.closest('.feature-card, .product-list-item');
    const cardQuoteData = collectCardQuoteData(card);

    if (!cardQuoteData) {
      return;
    }

    link.setAttribute('href', buildQuoteUrl(link.getAttribute('href') || 'quote.html', cardQuoteData));
  });

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
  const prefillQuoteForm = () => {
    const params = new URLSearchParams(window.location.search);
    const itemCategory = normalizeText(params.get('item_category'));
    const itemName = normalizeText(params.get('item_name'));
    const size = normalizeText(params.get('size'));
    const strength = normalizeText(params.get('strength'));
    const qty = normalizeText(params.get('qty'));
    const itemField = quoteForm.elements.namedItem('item');
    const sizeField = quoteForm.elements.namedItem('size');
    const strengthField = quoteForm.elements.namedItem('strength');
    const qtyField = quoteForm.elements.namedItem('qty');
    const extraField = quoteForm.elements.namedItem('extra');
    const normalizedStrength = mapStrengthOption(strength);
    const combinedSize = itemName && size ? `${itemName} / ${size}` : (size || itemName);
    const notes = [];

    if (itemField instanceof HTMLSelectElement) {
      setSelectValue(itemField, itemCategory);
    }

    if (sizeField instanceof HTMLInputElement && combinedSize) {
      sizeField.value = combinedSize;
    }

    if (strengthField instanceof HTMLSelectElement && normalizedStrength) {
      setSelectValue(strengthField, normalizedStrength);
    }

    if (qtyField instanceof HTMLInputElement && qty) {
      qtyField.value = qty;
    }

    if (itemName && (!combinedSize || !combinedSize.includes(itemName))) {
      notes.push(`선택 상품: ${itemName}`);
    }

    if (strength && (!normalizedStrength || normalizedStrength !== strength)) {
      notes.push(`재질/골 참고: ${strength}`);
    }

    if (extraField instanceof HTMLTextAreaElement) {
      appendLines(extraField, notes);
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
  prefillQuoteForm();

  quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!quoteForm.reportValidity()) {
      setStatus('필수 항목을 먼저 확인해 주세요.', 'error');
      return;
    }

    const endpoint = window.APP_CONFIG && window.APP_CONFIG.QUOTE_ENDPOINT;
    if (!endpoint) {
      setStatus('시스템 오류로 인해 견적 요청을 전송할 수 없습니다. 전화 또는 이메일 문의를 이용해 주세요.', 'error');
      return;
    }

    const formData = new FormData(quoteForm);
    if (String(formData.get('website') || '').trim() !== '') {
      setStatus('전송에 실패했습니다.', 'error');
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
        setStatus('네트워크 연결을 확인한 뒤 다시 시도해 주세요. 전송이 되지 않으면 전화 또는 이메일 문의를 이용해 주세요.', 'error');
      } else if (error && error.type === 'http') {
        setStatus('서버 응답에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. 전송이 되지 않으면 전화 또는 이메일 문의를 이용해 주세요.', 'error');
      } else if (error && error.type === 'server') {
        setStatus('입력한 내용을 다시 확인해 주세요. 계속 문제가 있으면 전화 또는 이메일 문의를 이용해 주세요.', 'error');
      } else {
        setStatus('전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. 전송이 되지 않으면 전화 또는 이메일 문의를 이용해 주세요.', 'error');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
})();
