import { calculateEstimate, money, transportLabel } from './estimate';
import type { QuoteSnapshot } from './pdf';

const form = document.querySelector<HTMLFormElement>('#quote-form');
if (form) {
  const fields = Array.from(form.querySelectorAll<HTMLFieldSetElement>('[data-form-step]'));
  const next = document.querySelector<HTMLButtonElement>('#quote-next')!;
  const back = document.querySelector<HTMLButtonElement>('#quote-back')!;
  const submit = document.querySelector<HTMLButtonElement>('#quote-submit')!;
  const status = document.querySelector<HTMLElement>('#quote-status')!;
  const result = document.querySelector<HTMLElement>('#quote-result')!;
  const sendStatus = document.querySelector<HTMLElement>('#send-status')!;
  const sendButton = document.querySelector<HTMLButtonElement>('#send-quote')!;
  const downloadButton = document.querySelector<HTMLButtonElement>('#download-pdf')!;
  const accessKey = form.dataset.web3Key?.trim();
  let step = 0,
    snapshot: QuoteSnapshot | null = null,
    sending = false,
    pdfBusy = false,
    sendAccepted = false;
  function val(name: string) {
    const el = form!.elements.namedItem(name);
    return el instanceof RadioNodeList
      ? el.value
      : el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement
        ? el.value.trim()
        : '';
  }
  function checked(name: string) {
    return (form!.elements.namedItem(name) as HTMLInputElement | null)?.checked || false;
  }
  function estimate() {
    return calculateEstimate({
      operation: val('operation'),
      transport: val('transport'),
      regime: val('regime'),
      specialCargo: checked('specialCargo'),
      documentReview: checked('documentReview'),
      classification: checked('classification'),
    });
  }
  function update() {
    const e = estimate();
    const low = document.querySelector<HTMLElement>('#quote-low')!;
    low.textContent = e.specialized ? 'Revisión especializada' : money(e.low);
    low.classList.toggle('specialized', e.specialized);
    document.querySelector('#quote-high')!.textContent = e.specialized
      ? 'Prepararemos el alcance con tus datos.'
      : `a ${money(e.high)} MXN`;
    document.querySelector('#summary-operation')!.textContent = val('operation');
    document.querySelector('#summary-transport')!.textContent =
      `Vía ${transportLabel(val('transport'))}`;
    const lines = document.querySelector('#quote-lines')!;
    lines.replaceChildren();
    if (!e.specialized)
      e.lines.forEach((l) => {
        const row = document.createElement('div');
        row.className = 'quote-line';
        const label = document.createElement('span');
        label.textContent = l.label;
        const amount = document.createElement('span');
        amount.textContent = money(l.amount);
        row.append(label, amount);
        lines.append(row);
      });
    else {
      const note = document.createElement('p');
      note.className = 'summary-note';
      note.textContent =
        'La modalidad, el régimen o las condiciones de tu carga requieren un análisis particular. Puedes continuar para preparar tu ficha.';
      lines.append(note);
    }
    const exportMode = val('operation') === 'Exportación';
    document.querySelector('#destination-label')!.textContent = exportMode
      ? 'País y ciudad de destino'
      : 'Ciudad de destino en México';
    (form!.elements.namedItem('destination') as HTMLInputElement).placeholder = exportMode
      ? 'Ej. Houston, Estados Unidos'
      : 'Ej. Ciudad de México';
  }
  function checkControl(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    control.setCustomValidity('');
    if (
      control instanceof HTMLTextAreaElement ||
      (control instanceof HTMLInputElement && ['text', 'email', 'tel'].includes(control.type))
    ) {
      const text = control.value.trim();
      const minimum = Math.max(control.required ? 1 : 0, control.minLength);
      if ((control.required || text.length > 0) && text.length < minimum)
        control.setCustomValidity(
          minimum > 1
            ? `Escribe al menos ${minimum} caracteres, sin contar espacios al inicio o al final.`
            : 'Completa este campo con información válida.',
        );
    }
    return control.checkValidity();
  }
  function validFieldset(index: number) {
    const controls = fields[index]!.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('input,select,textarea');
    for (const control of controls) {
      if (!checkControl(control)) {
        const details = control.closest('details');
        if (details) details.open = true;
        control.reportValidity();
        control.focus();
        return false;
      }
    }
    return true;
  }
  function showStep(index: number, focus = true) {
    step = index;
    fields.forEach((f, i) => {
      f.hidden = i !== step;
      f.disabled = i !== step;
    });
    document.querySelectorAll<HTMLElement>('[data-step-indicator]').forEach((s, i) => {
      s.classList.toggle('active', i === step);
      s.classList.toggle('complete', i < step);
      if (i === step) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
    back.hidden = step === 0;
    next.hidden = step === 2;
    submit.hidden = step !== 2;
    document.querySelector('#step-caption')!.textContent = `PASO 0${step + 1} DE 03`;
    status.textContent = '';
    if (focus) {
      const legend = fields[step]!.querySelector('legend')!;
      legend.tabIndex = -1;
      legend.focus({ preventScroll: true });
      form!.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    }
  }
  next.addEventListener('click', () => {
    if (validFieldset(step)) showStep(Math.min(2, step + 1));
  });
  back.addEventListener('click', () => showStep(Math.max(0, step - 1)));
  form.addEventListener('input', (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    )
      e.target.setCustomValidity('');
    update();
  });
  form.addEventListener('change', () => update());
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement && step < 2) {
      e.preventDefault();
      next.click();
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (step < 2) {
      next.click();
      return;
    }
    if (checked('botcheck')) {
      status.textContent = 'No fue posible procesar la solicitud.';
      return;
    }
    fields.forEach((f) => (f.disabled = false));
    for (let i = 0; i < fields.length; i++) {
      if (
        !Array.from(
          fields[i]!.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
            'input,select,textarea',
          ),
        ).every((c) => checkControl(c))
      ) {
        showStep(i);
        validFieldset(i);
        return;
      }
    }
    const now = new Date();
    const services = ['Gestión aduanal', `Coordinación ${transportLabel(val('transport'))}`];
    if (checked('documentReview')) services.push('Revisión documental adicional');
    if (checked('classification')) services.push('Análisis preliminar de clasificación');
    if (checked('specialCargo')) services.push('Carga con condiciones especiales');
    snapshot = {
      reference: `DNR-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      date: now.toLocaleString('es-MX', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'America/Mexico_City',
      }),
      name: val('name'),
      company: val('company'),
      email: val('email'),
      phone: val('phone'),
      operation: val('operation'),
      transport: val('transport'),
      origin: val('origin'),
      destination: val('destination'),
      customsOffice: val('customsOffice'),
      description: val('description'),
      declaredValue: val('declaredValue'),
      currency: val('currency'),
      weight: val('weight'),
      volume: val('volume'),
      packages: val('packages'),
      incoterm: val('incoterm'),
      regime: val('regime'),
      tariffCode: val('tariffCode'),
      nico: val('nico'),
      notes: val('notes'),
      firstOperation: checked('firstOperation') ? 'Sí' : 'No',
      dateNeeded: val('dateNeeded'),
      services,
      estimate: estimate(),
    };
    form!.hidden = true;
    result.hidden = false;
    result.focus({ preventScroll: true });
    document.querySelector('#result-reference')!.textContent =
      `FOLIO ${snapshot.reference} · ${snapshot.operation} · ${snapshot.transport}`;
    sendStatus.textContent = accessKey
      ? 'Tu PDF está listo para generarse. El envío de la solicitud es opcional.'
      : 'Puedes descargar tu PDF. El envío por correo aún no está habilitado en este prototipo.';
    sendButton.disabled = !accessKey;
    sendButton.textContent = 'Enviar solicitud ↗';
    fields.forEach((f, i) => (f.disabled = i !== step));
  });
  document.querySelector('#edit-quote')!.addEventListener('click', () => {
    if (sending) return;
    snapshot = null;
    sendAccepted = false;
    form!.hidden = false;
    result.hidden = true;
    sendStatus.textContent = '';
    sendStatus.classList.remove('error-text');
    showStep(2);
  });
  downloadButton.addEventListener('click', async () => {
    if (!snapshot || pdfBusy) return;
    pdfBusy = true;
    downloadButton.disabled = true;
    downloadButton.textContent = 'Preparando PDF…';
    try {
      const { downloadQuotePDF } = await import('./pdf');
      await downloadQuotePDF(snapshot);
      sendStatus.classList.remove('error-text');
      sendStatus.textContent = sendAccepted
        ? 'PDF generado. Tu solicitud ya fue aceptada por el servicio de correo.'
        : sending
          ? 'PDF generado. La solicitud continúa enviándose…'
          : accessKey
            ? 'PDF generado. También puedes enviar la solicitud para revisión.'
            : 'PDF generado. El envío por correo aún no está habilitado en este prototipo.';
    } catch {
      sendStatus.classList.add('error-text');
      sendStatus.textContent =
        'No pudimos generar el PDF. Tus datos siguen aquí; vuelve a intentarlo.';
    } finally {
      pdfBusy = false;
      downloadButton.disabled = false;
      downloadButton.textContent = 'Descargar PDF ↓';
    }
  });
  sendButton.addEventListener('click', async () => {
    if (!snapshot || !accessKey || sending) return;
    sending = true;
    sendButton.disabled = true;
    sendButton.textContent = 'Enviando…';
    sendStatus.textContent = 'Enviando tu solicitud para revisión…';
    sendStatus.classList.remove('error-text');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    const quote = snapshot;
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Solicitud de operación ${quote.reference}`,
          from_name: 'DUANOR · Cotizador',
          name: quote.name,
          email: quote.email,
          empresa: quote.company,
          telefono: quote.phone,
          folio: quote.reference,
          fecha: quote.date,
          operacion: quote.operation,
          transporte: quote.transport,
          origen: quote.origin,
          destino: quote.destination,
          aduana: quote.customsOffice,
          mercancia: quote.description,
          valor_comercial: `${quote.declaredValue} ${quote.currency}`,
          peso_kg: quote.weight,
          bultos: quote.packages,
          volumen_m3: quote.volume,
          fecha_estimada: quote.dateNeeded,
          incoterm: quote.incoterm,
          regimen: quote.regime,
          fraccion_arancelaria: quote.tariffCode,
          nico: quote.nico,
          primera_operacion: quote.firstOperation,
          servicios: quote.services.join(', '),
          notas: quote.notes,
          estimacion_mxn: quote.estimate.specialized
            ? 'Requiere revisión especializada'
            : `${money(quote.estimate.low)} a ${money(quote.estimate.high)} MXN`,
          conceptos: quote.estimate.specialized
            ? 'Por definir'
            : quote.estimate.lines.map((l) => `${l.label}: ${money(l.amount)} MXN`).join('\n'),
          alcance:
            'Tarifas de demostración. No incluye impuestos, contribuciones, fletes, seguros, almacenajes, maniobras ni permisos. No vinculante.',
          consentimiento: 'Aviso de privacidad aceptado al crear esta solicitud.',
          botcheck: '',
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.success !== true)
        throw new Error(response.status === 429 ? 'limit' : 'rejected');
      sendAccepted = true;
      sendStatus.textContent =
        'Solicitud aceptada por el servicio de correo. Conserva tu PDF y folio como referencia.';
      sendButton.textContent = 'Solicitud enviada ✓';
    } catch (error) {
      sendStatus.classList.add('error-text');
      sendStatus.textContent =
        error instanceof Error && error.message === 'limit'
          ? 'Se alcanzó el límite temporal de envíos. Conservamos tus datos; intenta más tarde.'
          : 'No pudimos confirmar el envío. Tus datos siguen aquí. Conserva tu PDF e intenta más tarde.';
      sendButton.disabled = false;
      sendButton.textContent = 'Reintentar envío ↗';
    } finally {
      clearTimeout(timeout);
      sending = false;
    }
  });
  showStep(0, false);
  update();
}
