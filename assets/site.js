(() => {
  if (document.querySelector('.mobile-sticky-cta')) {
    document.body.classList.add('has-mobile-cta');
  }

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

  const quoteCalculators = [...document.querySelectorAll('[data-quote-calc]')];
  if (quoteCalculators.length) {
    const won = new Intl.NumberFormat('ko-KR');

    quoteCalculators.forEach((calculator) => {
      const unitPrice = Number(calculator.dataset.unitPrice || 0);
      const qtyField = calculator.querySelector('select[id="qty"], select[name="qty"], [data-quote-qty]');
      const totalField = calculator.querySelector('[data-quote-total]');

      if (!unitPrice || !qtyField || !totalField) {
        return;
      }

      const renderTotal = () => {
        const quantity = Number(qtyField.value || 0);
        totalField.value = `${won.format(unitPrice * quantity)}원`;
      };

      qtyField.addEventListener('change', renderTotal);
      qtyField.addEventListener('input', renderTotal);
      renderTotal();
    });
  }

  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    const status = document.getElementById('quoteFormStatus');
    const submitButton = document.getElementById('quoteSubmitButton');
    const submitLabel = submitButton ? submitButton.innerHTML : '';
    const config = window.APP_CONFIG || {};

    const setStatus = (message, type) => {
      if (!status) {
        return;
      }

      status.textContent = message;
      status.style.color = type === 'error' ? 'var(--danger, #b42318)' : 'var(--text)';
    };

    const setSubmitting = (isSubmitting) => {
      if (!submitButton) {
        return;
      }

      submitButton.disabled = isSubmitting;
      submitButton.setAttribute('aria-disabled', String(isSubmitting));
      submitButton.innerHTML = isSubmitting ? '전송 중...' : submitLabel;
    };

    quoteForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (quoteForm.dataset.submitting === 'true') {
        return;
      }

      if (!quoteForm.reportValidity()) {
        return;
      }

      const endpoint = String(config.QUOTE_ENDPOINT || '').trim();
      if (!endpoint) {
        setStatus('견적 접수 설정이 아직 연결되지 않았습니다. 관리자 설정이 필요합니다.', 'error');
        return;
      }

      const formData = new FormData(quoteForm);
      formData.set('source_page', window.location.pathname.split('/').pop() || 'quote.html');

      if (String(formData.get('website') || '').trim()) {
        setStatus('요청을 처리할 수 없습니다. 다시 시도해 주세요.', 'error');
        return;
      }

      quoteForm.dataset.submitting = 'true';
      setSubmitting(true);
      setStatus('견적 요청을 전송하고 있습니다.', 'info');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new URLSearchParams(formData),
        });

        let result = null;
        try {
          result = await response.json();
        } catch (error) {
          result = null;
        }

        if (!response.ok) {
          throw new Error('network-error');
        }

        if (result && result.ok === false) {
          throw new Error(result.message || '견적 요청을 전송하지 못했습니다.');
        }

        const company = String(formData.get('company') || '-');
        const phone = String(formData.get('phone') || '-');
        const item = String(formData.get('item') || '-');

        quoteForm.reset();
        const sourcePageField = document.getElementById('quoteSourcePage');
        if (sourcePageField) {
          sourcePageField.value = window.location.pathname.split('/').pop() || 'quote.html';
        }
        setStatus(`접수 완료: ${company} / ${phone} / ${item}`, 'success');
      } catch (error) {
        setStatus(error instanceof Error && error.message ? error.message : '견적 요청을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.', 'error');
      } finally {
        delete quoteForm.dataset.submitting;
        setSubmitting(false);
      }
    });
  }
})();
