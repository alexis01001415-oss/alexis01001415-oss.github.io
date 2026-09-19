type ContactField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function initContactForms() {
  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
    if (form.dataset.initialized) return;
    form.dataset.initialized = 'true';

    const key = form.dataset.web3Key?.trim() || '';
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
    const buttonLabel = form.querySelector<HTMLElement>('[data-contact-button-label]')!;
    const status = form.querySelector<HTMLElement>('[data-contact-status]')!;
    const reset = form.querySelector<HTMLButtonElement>('[data-contact-reset]')!;
    const fields = [
      ...form.querySelectorAll<ContactField>('input:not([name="botcheck"]), select, textarea'),
    ];
    let sending = false;
    let accepted = false;
    let controller: AbortController | null = null;

    const setStatus = (message: string, state = '') => {
      status.textContent = message;
      status.dataset.state = state;
    };
    const errorFor = (field: ContactField) =>
      form.querySelector<HTMLElement>(`[data-error-for="${field.name}"]`);
    const validate = (field: ContactField) => {
      const value = field.value.trim();
      let error = '';
      if (field instanceof HTMLInputElement && field.type === 'checkbox') {
        if (!field.checked) error = 'Acepta el aviso de privacidad para enviar tu mensaje.';
      } else if (field.required && !value) {
        error =
          field.name === 'interest' ? 'Selecciona el tema de tu consulta.' : 'Completa este campo.';
      } else if (
        field instanceof HTMLInputElement &&
        field.type === 'email' &&
        !field.validity.valid
      ) {
        error = 'Escribe un correo electrónico válido.';
      } else if (field.name === 'name' && value.length < 2) {
        error = 'Escribe tu nombre, con al menos 2 caracteres.';
      } else if (field.name === 'message' && value.length < 15) {
        error = 'Cuéntanos un poco más: escribe al menos 15 caracteres.';
      } else if ('maxLength' in field && field.maxLength > 0 && value.length > field.maxLength) {
        error = `Usa como máximo ${field.maxLength} caracteres.`;
      }
      field.setAttribute('aria-invalid', String(Boolean(error)));
      const output = errorFor(field);
      if (output) output.textContent = error;
      return !error;
    };

    fields.forEach((field) => {
      field.addEventListener('blur', () => validate(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validate(field);
      });
      field.addEventListener('change', () => {
        if (field.getAttribute('aria-invalid') === 'true') validate(field);
      });
    });

    submit.disabled = !key;
    if (key) setStatus('Tu información se enviará únicamente al pulsar “Enviar mensaje”.');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending || accepted || !key) return;
      const invalid = fields.filter((field) => !validate(field));
      if (invalid.length) {
        setStatus('Revisa los campos señalados antes de enviar.', 'error');
        invalid[0].focus();
        return;
      }
      const honeypot = form.elements.namedItem('botcheck') as HTMLInputElement;
      if (honeypot.checked) {
        setStatus(
          'No se pudo validar el formulario. Recarga la página e intenta nuevamente.',
          'error',
        );
        return;
      }

      const data = new FormData(form);
      const value = (name: string) => String(data.get(name) || '').trim();
      sending = true;
      submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      buttonLabel.textContent = 'Enviando mensaje…';
      setStatus('Estamos enviando tu mensaje. Espera la confirmación.');
      fields.forEach((field) => {
        field.disabled = true;
      });
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 20000);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            access_key: key,
            subject: `DUANOR · Contacto · ${value('interest')}`,
            from_name: 'DUANOR · Formulario de contacto',
            name: value('name'),
            email: value('email'),
            empresa: value('company') || 'No indicada',
            interes: value('interest'),
            message: value('message'),
            consentimiento: 'Aviso de privacidad aceptado para atender esta solicitud.',
            origen_formulario: form.closest('[id]')?.id || 'contacto',
            botcheck: '',
          }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success !== true) {
          throw new Error(response.status === 429 ? 'rate-limit' : 'not-accepted');
        }
        accepted = true;
        buttonLabel.textContent = 'Mensaje enviado';
        setStatus(
          'Tu mensaje fue aceptado por el servicio de correo. Gracias por compartir tu proyecto.',
          'success',
        );
        fields.forEach((field) => {
          field.disabled = true;
        });
        reset.hidden = false;
      } catch (error) {
        const limited = error instanceof Error && error.message === 'rate-limit';
        const timedOut = error instanceof Error && error.name === 'AbortError';
        setStatus(
          limited
            ? 'Se alcanzó el límite temporal de envíos. Tus datos siguen aquí; intenta más tarde.'
            : timedOut
              ? 'La respuesta está tardando más de lo esperado y no pudimos confirmar el envío. Tus datos siguen aquí; puedes volver a intentarlo.'
              : 'No pudimos confirmar el envío. Conservamos tus datos para que puedas volver a intentarlo.',
          'error',
        );
        buttonLabel.textContent = 'Reintentar envío';
      } finally {
        window.clearTimeout(timeout);
        sending = false;
        controller = null;
        form.removeAttribute('aria-busy');
        if (!accepted)
          fields.forEach((field) => {
            field.disabled = false;
          });
        submit.disabled = accepted || !key;
      }
    });

    reset.addEventListener('click', () => {
      form.reset();
      accepted = false;
      reset.hidden = true;
      fields.forEach((field) => {
        field.disabled = false;
        field.removeAttribute('aria-invalid');
        const error = errorFor(field);
        if (error) error.textContent = '';
      });
      submit.disabled = !key;
      buttonLabel.textContent = 'Enviar mensaje';
      setStatus('Cuéntanos sobre tu siguiente proyecto.');
      fields[0].focus();
    });

    document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true });
  });
}

initContactForms();
document.addEventListener('astro:page-load', initContactForms);
