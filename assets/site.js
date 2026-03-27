(() => {
  const body = document.body;
  const toggleButton = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const stickyCta = document.querySelector('.mobile-sticky-cta');
  const normalizeText = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const readText = (node) => normalizeText(node && node.textContent);
  const currentPageName = (() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1] || 'index.html';
  })();
  const appConfig = window.APP_CONFIG || {};
  const analyticsConfig = appConfig.ANALYTICS || {};
  const gaMeasurementId = normalizeText(analyticsConfig.GA4_MEASUREMENT_ID);
  const clarityProjectId = normalizeText(analyticsConfig.CLARITY_PROJECT_ID);
  const appendExternalScript = (src) => {
    if (!src || document.querySelector(`script[src="${src}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  };
  const sanitizeAnalyticsParams = (params) => {
    return Object.entries(params).reduce((accumulator, [key, value]) => {
      if (value == null) {
        return accumulator;
      }

      if (typeof value === 'string') {
        const normalizedValue = normalizeText(value);
        if (!normalizedValue) {
          return accumulator;
        }

        accumulator[key] = normalizedValue;
        return accumulator;
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        accumulator[key] = value;
        return accumulator;
      }

      if (typeof value === 'boolean') {
        accumulator[key] = value ? 'true' : 'false';
      }

      return accumulator;
    }, {});
  };
  const initializeAnalytics = () => {
    if (gaMeasurementId && typeof window.gtag !== 'function') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', gaMeasurementId);
      appendExternalScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`);
    }

    if (clarityProjectId && typeof window.clarity !== 'function') {
      (function setupClarity(c, l, a, r, i, t, y) {
        c[a] = c[a] || function clarityProxy() {
          (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = 1;
        t.src = `https://www.clarity.ms/tag/${i}`;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      }(window, document, 'clarity', 'script', clarityProjectId));
    }
  };
  const trackEvent = (eventName, params = {}) => {
    if (!gaMeasurementId || typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('event', eventName, sanitizeAnalyticsParams({
      page_path: window.location.pathname,
      page_title: document.title,
      ...params
    }));
  };
  const parseLinkTarget = (href) => {
    try {
      const url = new URL(href, window.location.href);
      return {
        fileName: url.pathname.split('/').filter(Boolean).pop() || '',
        path: `${url.pathname}${url.search}`
      };
    } catch (error) {
      return {
        fileName: '',
        path: href || ''
      };
    }
  };
  const readSectionTitle = (node) => {
    if (!node) {
      return '';
    }

    const section = node.closest('section');
    if (!section) {
      return '';
    }

    return readText(section.querySelector('.section-title, .page-title, h2, h3'));
  };
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

    if (source.includes('주문 안내') || source.includes('제작·납기') || source.includes('FAQ') || source.includes('기타(FAQ)')) {
      return '주문 안내';
    }

    if (source.includes('골판지')) {
      return '골판지(양면 / 편면)';
    }

    return '기타 포장자재';
  };
  const normalizeQuoteItemCategory = (value) => {
    const normalized = normalizeText(value);

    if (!normalized) {
      return '';
    }

    if (normalized.includes('주문 안내') || normalized.includes('제작·납기') || normalized.includes('FAQ') || normalized.includes('기타(FAQ)')) {
      return '주문 안내';
    }

    return normalized;
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
  const buildLinkTrackingPayload = (link) => {
    const href = link.getAttribute('href') || '';
    const target = parseLinkTarget(href);
    const payload = {
      link_text: readText(link),
      link_target: target.path,
      section_title: readSectionTitle(link)
    };
    const cardData = collectCardQuoteData(link.closest('.feature-card, .product-list-item'));
    const productData = collectProductQuoteData();
    const trackingData = cardData || (link.closest('.page-hero, .mobile-sticky-cta') ? productData : null);

    if (trackingData) {
      payload.item_category = trackingData.itemCategory;
      payload.item_name = trackingData.itemName;
      payload.item_size = trackingData.size;
      payload.item_strength = trackingData.strength;
      payload.item_qty = trackingData.qty;
    }

    return sanitizeAnalyticsParams(payload);
  };

  initializeAnalytics();

  const syncCurrentNavLinks = () => {
    document.querySelectorAll('.nav a, .mobile-nav a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const target = parseLinkTarget(href);
      const isCurrent = link.classList.contains('is-current') || (target.fileName && target.fileName === currentPageName);

      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  syncCurrentNavLinks();

  if (toggleButton && mobileNav) {
    const mobileNavMedia = typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 860px)')
      : null;
    const setMobileNavState = (isOpen) => {
      mobileNav.classList.toggle('is-open', isOpen);
      mobileNav.hidden = !isOpen;
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      toggleButton.setAttribute('aria-expanded', String(isOpen));
      toggleButton.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
      body.classList.toggle('mobile-nav-open', isOpen);
    };
    const closeMobileNav = ({ restoreFocus = false } = {}) => {
      if (!mobileNav.classList.contains('is-open')) {
        setMobileNavState(false);
        return;
      }

      setMobileNavState(false);

      if (restoreFocus) {
        toggleButton.focus();
      }
    };

    setMobileNavState(false);

    toggleButton.addEventListener('click', () => {
      setMobileNavState(!mobileNav.classList.contains('is-open'));
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    document.addEventListener('click', (event) => {
      if (!mobileNav.classList.contains('is-open')) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (toggleButton.contains(target) || mobileNav.contains(target)) {
        return;
      }

      closeMobileNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !mobileNav.classList.contains('is-open')) {
        return;
      }

      event.preventDefault();
      closeMobileNav({ restoreFocus: true });
    });

    if (mobileNavMedia) {
      const handleMobileNavViewport = (event) => {
        if (!event.matches) {
          closeMobileNav();
        }
      };

      if (typeof mobileNavMedia.addEventListener === 'function') {
        mobileNavMedia.addEventListener('change', handleMobileNavViewport);
      } else if (typeof mobileNavMedia.addListener === 'function') {
        mobileNavMedia.addListener(handleMobileNavViewport);
      }
    }
  }

  if (stickyCta) {
    const syncStickyCtaState = (isMobileViewport) => {
      body.classList.toggle('has-mobile-cta', !body.classList.contains('no-mobile-cta') && isMobileViewport);
    };

    if (typeof window.matchMedia === 'function') {
      const stickyCtaMedia = window.matchMedia('(max-width: 860px)');
      const handleStickyCtaViewport = (event) => {
        syncStickyCtaState(event.matches);
      };

      if (typeof stickyCtaMedia.addEventListener === 'function') {
        stickyCtaMedia.addEventListener('change', handleStickyCtaViewport);
      } else if (typeof stickyCtaMedia.addListener === 'function') {
        stickyCtaMedia.addListener(handleStickyCtaViewport);
      }

      syncStickyCtaState(stickyCtaMedia.matches);
    } else {
      syncStickyCtaState(true);
    }
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

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) {
      return;
    }

    const href = link.getAttribute('href') || '';
    const target = parseLinkTarget(href);

    if (href.startsWith('tel:')) {
      trackEvent('phone_click', {
        link_text: readText(link),
        section_title: readSectionTitle(link)
      });
      return;
    }

    if (href.startsWith('mailto:')) {
      trackEvent('email_click', {
        link_text: readText(link),
        section_title: readSectionTitle(link)
      });
      return;
    }

    if (target.fileName === 'quote.html') {
      trackEvent('quote_request_click', buildLinkTrackingPayload(link));
      return;
    }

    if (/^product-.*\.html$/i.test(target.fileName)) {
      trackEvent('product_detail_click', buildLinkTrackingPayload(link));
    }
  });

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
  const quoteItemField = quoteForm.elements.namedItem('item');
  const quoteSizeField = quoteForm.elements.namedItem('size');
  const quoteStrengthField = quoteForm.elements.namedItem('strength');
  const quoteQtyField = quoteForm.elements.namedItem('qty');
  const quotePrintField = quoteForm.elements.namedItem('print_type');
  const quoteShippingField = quoteForm.elements.namedItem('shipping_method');
  const quoteDueField = quoteForm.elements.namedItem('due_text');
  const quoteExtraField = quoteForm.elements.namedItem('extra');
  const quoteInquiryModeFields = Array.from(quoteForm.querySelectorAll('input[name="inquiry_mode_ui"]'));
  const quoteItemLabel = quoteForm.querySelector('[data-quote-item-label]');
  const quoteSizeLabel = quoteForm.querySelector('[data-quote-size-label]');
  const quoteQtyLabel = quoteForm.querySelector('[data-quote-qty-label]');
  const quoteShippingLabel = quoteForm.querySelector('[data-quote-shipping-label]');
  const quoteDueLabel = quoteForm.querySelector('[data-quote-due-label]');
  const quoteExtraLabel = quoteForm.querySelector('[data-quote-extra-label]');
  const quoteModeSummary = quoteForm.querySelector('[data-quote-mode-summary]');
  const quoteModeHelp = quoteForm.querySelector('[data-quote-mode-help]');
  const quoteStrengthFieldWrap = quoteForm.querySelector('[data-quote-field="strength"]');
  const quotePrintFieldWrap = quoteForm.querySelector('[data-quote-field="print"]');
  const quoteShippingFieldWrap = quoteForm.querySelector('[data-quote-field="shipping"]');
  const defaultItemLabel = quoteItemLabel ? readText(quoteItemLabel) || '품목' : '품목';
  const defaultSizeLabel = quoteSizeLabel ? readText(quoteSizeLabel) || '규격 또는 문의 내용' : '규격 또는 문의 내용';
  const defaultQtyLabel = quoteQtyLabel ? readText(quoteQtyLabel) || '수량' : '수량';
  const defaultShippingLabel = quoteShippingLabel ? readText(quoteShippingLabel) || '희망 수령 방식' : '희망 수령 방식';
  const defaultDueLabel = quoteDueLabel ? readText(quoteDueLabel) || '희망 일정' : '희망 일정';
  const defaultExtraLabel = quoteExtraLabel ? readText(quoteExtraLabel) || '추가 요청 사항' : '추가 요청 사항';
  const defaultModeSummary = quoteModeSummary ? readText(quoteModeSummary) || '규격과 수량이 정해진 품목 견적에 적합합니다.' : '규격과 수량이 정해진 품목 견적에 적합합니다.';
  const defaultSizePlaceholder = quoteSizeField instanceof HTMLInputElement
    ? quoteSizeField.getAttribute('placeholder') || ''
    : '';
  const defaultQtyPlaceholder = quoteQtyField instanceof HTMLInputElement
    ? quoteQtyField.getAttribute('placeholder') || ''
    : '';
  const defaultDuePlaceholder = quoteDueField instanceof HTMLInputElement
    ? quoteDueField.getAttribute('placeholder') || ''
    : '';
  const defaultExtraPlaceholder = quoteExtraField instanceof HTMLTextAreaElement
    ? quoteExtraField.getAttribute('placeholder') || ''
    : '';
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
  const getSelectedQuoteInquiryMode = () => {
    const checkedField = quoteInquiryModeFields.find((field) => field.checked);
    return checkedField && checkedField.value === 'general' ? 'general' : 'product';
  };
  const setSelectedQuoteInquiryMode = (mode) => {
    const nextMode = mode === 'general' ? 'general' : 'product';

    quoteInquiryModeFields.forEach((field) => {
      field.checked = field.value === nextMode;
    });
  };
  const inferQuoteInquiryMode = ({ requestedMode = '', itemCategory = '', itemName = '' } = {}) => {
    const normalizedMode = normalizeText(requestedMode).toLowerCase();
    const normalizedCategory = normalizeQuoteItemCategory(itemCategory);
    const normalizedItemName = normalizeText(itemName);

    if (normalizedMode === 'general') {
      return 'general';
    }

    if (normalizedMode === 'product') {
      return 'product';
    }

    if (normalizedCategory === '주문 안내') {
      return 'general';
    }

    if (normalizedItemName.includes('상담')) {
      return 'general';
    }

    return 'product';
  };
  const toggleQuoteField = (fieldWrap, fieldControl, isVisible) => {
    if (fieldWrap instanceof HTMLElement) {
      fieldWrap.hidden = !isVisible;
    }

    if (fieldControl instanceof HTMLInputElement || fieldControl instanceof HTMLSelectElement || fieldControl instanceof HTMLTextAreaElement) {
      fieldControl.disabled = !isVisible;
      fieldControl.setCustomValidity('');
    }
  };
  const syncQuoteFormMode = () => {
    const isOrderGuideInquiry = quoteItemField instanceof HTMLSelectElement
      && normalizeQuoteItemCategory(quoteItemField.value) === '주문 안내';
    const isGeneralInquiry = getSelectedQuoteInquiryMode() === 'general' || isOrderGuideInquiry;

    if (isOrderGuideInquiry) {
      setSelectedQuoteInquiryMode('general');
    }

    if (quoteModeSummary) {
      quoteModeSummary.textContent = isGeneralInquiry
        ? '제작 가능 여부, 납기, 단가 기준처럼 제품 확정 전 문의에 적합합니다.'
        : defaultModeSummary;
    }

    if (quoteItemLabel) {
      quoteItemLabel.textContent = isGeneralInquiry ? '문의 주제' : defaultItemLabel;
    }

    if (quoteSizeLabel) {
      quoteSizeLabel.textContent = isGeneralInquiry ? '문의 내용' : defaultSizeLabel;
    }

    if (quoteQtyLabel) {
      quoteQtyLabel.textContent = isGeneralInquiry ? '수량(선택)' : defaultQtyLabel;
    }

    if (quoteShippingLabel) {
      quoteShippingLabel.textContent = defaultShippingLabel;
    }

    if (quoteDueLabel) {
      quoteDueLabel.textContent = isGeneralInquiry ? '희망 일정(선택)' : defaultDueLabel;
    }

    if (quoteExtraLabel) {
      quoteExtraLabel.textContent = isGeneralInquiry ? '추가 참고 사항' : defaultExtraLabel;
    }

    if (quoteSizeField instanceof HTMLInputElement) {
      quoteSizeField.placeholder = isGeneralInquiry
        ? '예: 납기 문의 / 제작 가능 여부 / 단가 기준 문의'
        : defaultSizePlaceholder;
    }

    if (quoteQtyField instanceof HTMLInputElement) {
      quoteQtyField.required = !isGeneralInquiry;
      quoteQtyField.placeholder = isGeneralInquiry
        ? '상담·일반 문의는 비워 두셔도 됩니다'
        : defaultQtyPlaceholder;
      quoteQtyField.setCustomValidity('');
    }

    if (quoteDueField instanceof HTMLInputElement) {
      quoteDueField.placeholder = isGeneralInquiry
        ? '예: 다음 주까지 / 상담 후 결정'
        : defaultDuePlaceholder;
    }

    if (quoteExtraField instanceof HTMLTextAreaElement) {
      quoteExtraField.placeholder = isGeneralInquiry
        ? '방문 여부, 답변 방식, 배송지 등 참고할 사항이 있으면 적어 주세요'
        : defaultExtraPlaceholder;
    }

    toggleQuoteField(quoteStrengthFieldWrap, quoteStrengthField, !isGeneralInquiry);
    toggleQuoteField(quotePrintFieldWrap, quotePrintField, !isGeneralInquiry);
    toggleQuoteField(quoteShippingFieldWrap, quoteShippingField, !isGeneralInquiry);

    if (quoteModeHelp) {
      quoteModeHelp.hidden = !isGeneralInquiry;
    }
  };
  const prefillQuoteForm = () => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = normalizeText(params.get('inquiry_mode') || params.get('mode'));
    const itemCategory = normalizeQuoteItemCategory(params.get('item_category'));
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
    const inferredInquiryMode = inferQuoteInquiryMode({ requestedMode, itemCategory, itemName });
    const combinedSize = inferredInquiryMode === 'general'
      ? ''
      : itemName && size ? `${itemName} / ${size}` : (size || itemName);
    const notes = [];

    if (quoteInquiryModeFields.length) {
      setSelectedQuoteInquiryMode(inferredInquiryMode);
    }

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

    if (inferredInquiryMode === 'general') {
      if (itemName) {
        notes.push(`문의 주제: ${itemName}`);
      }

      if (size) {
        notes.push(`참고 내용: ${size}`);
      }
    } else {
      if (itemName && (!combinedSize || !combinedSize.includes(itemName))) {
        notes.push(`선택 상품: ${itemName}`);
      }

      if (strength && (!normalizedStrength || normalizedStrength !== strength)) {
        notes.push(`재질/골 참고: ${strength}`);
      }
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
  syncQuoteFormMode();

  if (quoteItemField instanceof HTMLSelectElement) {
    quoteItemField.addEventListener('change', syncQuoteFormMode);
  }

  if (quoteInquiryModeFields.length) {
    quoteInquiryModeFields.forEach((field) => {
      field.addEventListener('change', syncQuoteFormMode);
    });
  }

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

    const quoteEventParams = sanitizeAnalyticsParams({
      item_category: formData.get('item'),
      strength_option: formData.get('strength'),
      print_type: formData.get('print_type'),
      shipping_method: formData.get('shipping_method'),
      source_page: formData.get('source_page'),
      has_email: Boolean(normalizeText(formData.get('email')))
    });

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
      syncQuoteFormMode();
      trackEvent('quote_form_submit_success', quoteEventParams);
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
