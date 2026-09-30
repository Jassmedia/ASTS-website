import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import cf7cfOptions from '../../data/cf7cf-options.json';
import { cf7Fetch, loadSchema, validateSchema } from '../../lib/cf7';

/*
 * Contact Form 7 form, rendered with the same markup as on the live site and
 * submitted to the same Contact Form 7 REST endpoint on the WordPress backend
 * (/wp-json/contact-form-7/v1/contact-forms/<id>/feedback). WordPress
 * validates, sends the configured emails and returns the messages, exactly as
 * with CF7's own script. Client-side checks use the form's SWV schema loaded
 * from WordPress on change events, as CF7's script does.
 */

// CF7 status names -> form classes (contact-form-7/includes/js/index.js)
const STATUS_CLASS = {
  init: 'init',
  validation_failed: 'invalid',
  acceptance_missing: 'unaccepted',
  spam: 'spam',
  aborted: 'aborted',
  mail_sent: 'sent',
  mail_failed: 'failed',
  submitting: 'submitting',
  resetting: 'resetting',
  validating: 'validating',
  payment_required: 'payment-required',
};
const statusClass = (s) => STATUS_CLASS[s] || 'custom-' + String(s).replace(/[^0-9a-z]+/gi, ' ').trim().replace(/\s+/, '-');

const Ctx = createContext({ errors: {}, values: {}, setValue: () => {}, onFieldChange: () => {} });

export default function Cf7Form({ formId, postId, pagePath, children }) {
  const formRef = useRef(null);
  const schemaRef = useRef(null);
  const [status, setStatus] = useState('init');
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({});
  const [message, setMessage] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [postedHash, setPostedHash] = useState('');
  const changeRef = useRef(null);
  const unit = `wpcf7-f${formId}-p${postId}-o1`;
  const setValue = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  // CF7 loads each form's validation schema from WordPress when the page loads.
  useEffect(() => {
    let alive = true;
    loadSchema(formId).then((s) => {
      if (alive) schemaRef.current = s;
    });
    return () => {
      alive = false;
    };
  }, [formId]);

  // CF7's script runs on load: wrapper class no-js -> js, spinner after the submit
  // button, and validation on every native "change" event inside the form.
  useEffect(() => {
    setMounted(true);
    const form = formRef.current;
    const onChange = (e) => {
      if (e.target.closest && e.target.closest('.wpcf7-form-control')) changeRef.current(e.target);
    };
    form.addEventListener('change', onChange);
    return () => form.removeEventListener('change', onChange);
  }, []);

  // Conditional Fields: the hidden-group bookkeeping sent with every submission.
  const groups = () => Array.from(formRef.current ? formRef.current.querySelectorAll('[data-class="wpcf7cf_group"]') : []);
  const conditionalFields = () => {
    const hiddenFields = [];
    const hiddenGroups = [];
    const visibleGroups = [];
    for (const g of groups()) {
      if (g.style.display === 'none') {
        hiddenGroups.push(g.getAttribute('data-id'));
        g.querySelectorAll('input,select,textarea').forEach((el) => hiddenFields.push(el.getAttribute('name')));
      } else visibleGroups.push(g.getAttribute('data-id'));
    }
    return { hiddenFields, hiddenGroups, visibleGroups };
  };

  // CF7 validates on change: every field up to (and including) the changed one, in DOM order.
  const onFieldChange = (target) => {
    const schema = schemaRef.current;
    const form = formRef.current;
    if (!schema || !form) return;
    const fd = new FormData();
    form.querySelectorAll('.wpcf7-form-control-wrap').forEach((wrap) => {
      if (wrap.closest('.novalidate')) return;
      wrap.querySelectorAll(':where(input, textarea, select):enabled').forEach((el) => {
        if (!el.name || ['button', 'image', 'reset', 'submit'].includes(el.type)) return;
        if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
        fd.append(el.name, el.value);
      });
    });
    const result = validateSchema(schema, fd);
    setErrors((prev) => {
      const next = { ...prev };
      for (const wrap of form.querySelectorAll('.wpcf7-form-control-wrap')) {
        const name = wrap.dataset.name;
        if (name === undefined) continue;
        delete next[name];
        if (result.has(name)) next[name] = result.get(name);
        if (wrap.contains(target)) break;
      }
      return next;
    });
  };

  changeRef.current = onFieldChange;

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const cf = conditionalFields();
    form.querySelector('[name="_wpcf7cf_hidden_group_fields"]').value = JSON.stringify(cf.hiddenFields);
    form.querySelector('[name="_wpcf7cf_hidden_groups"]').value = JSON.stringify(cf.hiddenGroups);
    form.querySelector('[name="_wpcf7cf_visible_groups"]').value = JSON.stringify(cf.visibleGroups);
    const body = new FormData(form);
    setErrors({});
    setMessage('');
    setStatus('submitting');
    let res;
    try {
      res = await cf7Fetch(`contact-forms/${formId}/feedback`, { method: 'POST', body });
    } catch (err) {
      // CF7's script only logs a failed request; the form stays in "submitting".
      console.error(err);
      return;
    }
    if (res.posted_data_hash) setPostedHash(res.posted_data_hash);
    const errs = {};
    for (const f of res.invalid_fields || []) errs[f.field] = f.message;
    setErrors(errs);
    setMessage(res.message || '');
    setStatus(res.status);
    if (res.status === 'mail_sent') {
      form.reset();
      setValues({});
      setResetKey((k) => k + 1);
    }
  };

  const cls = statusClass(status);
  const options = cf7cfOptions[String(formId)];
  return (
    <Ctx.Provider value={{ errors, values, setValue, onFieldChange }}>
      <div className={'wpcf7 ' + (mounted ? 'js' : 'no-js')} id={unit} lang="en-US" dir="ltr" data-wpcf7-id={formId}>
        <div className="screen-reader-response">
          <p role="status" aria-live="polite" aria-atomic="true">
            {message}
          </p>{' '}
          <ul>
            {Object.entries(errors).map(([k, v]) => (
              <li key={k} id={`${unit}-ve-${k}`.replace(/[^0-9a-z_-]+/gi, '')}>
                {v}
              </li>
            ))}
          </ul>
        </div>
        <form ref={formRef} action={`${pagePath}#${unit}`} method="post" className={'wpcf7-form ' + cls} aria-label="Contact form" noValidate="novalidate" data-status={cls} onSubmit={onSubmit}>
          <fieldset className="hidden-fields-container">
            <input type="hidden" name="_wpcf7" value={formId} />
            <input type="hidden" name="_wpcf7_version" value="6.1.5" />
            <input type="hidden" name="_wpcf7_locale" value="en_US" />
            <input type="hidden" name="_wpcf7_unit_tag" value={unit} />
            <input type="hidden" name="_wpcf7_container_post" value={postId} />
            <input type="hidden" name="_wpcf7_posted_data_hash" value={postedHash} />
            <input type="hidden" name="_wpcf7cf_hidden_group_fields" defaultValue="[]" />
            <input type="hidden" name="_wpcf7cf_hidden_groups" defaultValue="[]" />
            <input type="hidden" name="_wpcf7cf_visible_groups" defaultValue="[]" />
            <input type="hidden" name="_wpcf7cf_repeaters" value="[]" />
            <input type="hidden" name="_wpcf7cf_steps" value="{}" />
            <input type="hidden" name="_wpcf7cf_options" value={JSON.stringify(options)} />
          </fieldset>
          <React.Fragment key={resetKey}>{children}</React.Fragment>
          <p>
            <input className="wpcf7-form-control wpcf7-submit has-spinner" type="submit" value="Submit" />
            {mounted ? <span className="wpcf7-spinner"></span> : null}
          </p>
          <div className="wpcf7-response-output" aria-hidden={message ? undefined : 'true'}>
            {message}
          </div>
        </form>
      </div>
    </Ctx.Provider>
  );
}

function Tip({ name }) {
  const { errors } = useContext(Ctx);
  return errors[name] ? (
    <span className="wpcf7-not-valid-tip" aria-hidden="true">
      {errors[name]}
    </span>
  ) : null;
}

/** Text / email / number input with its label, as CF7 prints it inside the theme's registration forms. */
export function Cf7Input({ name, label, type = 'text', required = true, col = 'col-lg-6 col-md-6', leadingSpace = false }) {
  const { errors, setValue } = useContext(Ctx);
  const invalid = !!errors[name];
  const cls = ['wpcf7-form-control'];
  if (type === 'email') cls.push('wpcf7-email');
  if (type === 'number') cls.push('wpcf7-number');
  if (required) cls.push('wpcf7-validates-as-required');
  if (type === 'text' || type === 'email') cls.push('wpcf7-text');
  if (type === 'email') cls.push('wpcf7-validates-as-email');
  if (type === 'number') cls.push('wpcf7-validates-as-number');
  if (invalid) cls.push('wpcf7-not-valid');
  return (
    <div className={col}>
      <p>
        <label>
          {leadingSpace ? ' ' : ''}
          {label}
          <br />
          <span className="wpcf7-form-control-wrap" data-name={name}>
            <input
              size={type === 'number' ? undefined : '40'}
              maxLength={type === 'number' ? undefined : '400'}
              className={cls.join(' ')}
              aria-required={required ? 'true' : undefined}
              aria-invalid={invalid ? 'true' : 'false'}
              defaultValue=""
              type={type}
              name={name}
              onChange={(e) => setValue(name, e.target.value)}
            />
            <Tip name={name} />
          </span>{' '}
        </label>
      </p>
    </div>
  );
}

export function Cf7Textarea({ name, label, required = true, col = 'col-lg-12 col-md-12' }) {
  const { errors } = useContext(Ctx);
  const invalid = !!errors[name];
  const cls = ['wpcf7-form-control', 'wpcf7-textarea', required ? 'wpcf7-validates-as-required' : '', invalid ? 'wpcf7-not-valid' : ''].filter(Boolean).join(' ');
  return (
    <div className={col}>
      <p>
        <label>
          {' '}
          {label}
          <br />
          <span className="wpcf7-form-control-wrap" data-name={name}>
            <textarea cols="40" rows="10" maxLength="2000" className={cls} aria-required={required ? 'true' : undefined} aria-invalid={invalid ? 'true' : 'false'} name={name}></textarea>
            <Tip name={name} />
          </span>{' '}
        </label>
      </p>
    </div>
  );
}

export function Cf7Select({ name, label, options, required = true, col, wrapInCol = true }) {
  const { errors, setValue, values } = useContext(Ctx);
  const invalid = !!errors[name];
  const cls = ['wpcf7-form-control', 'wpcf7-select', required ? 'wpcf7-validates-as-required' : '', invalid ? 'wpcf7-not-valid' : ''].filter(Boolean).join(' ');
  const select = (
    <p>
      <label>
        {' '}
        {label}
        <br />
        <span className="wpcf7-form-control-wrap" data-name={name}>
          <select
            className={cls}
            aria-required={required ? 'true' : undefined}
            aria-invalid={invalid ? 'true' : 'false'}
            name={name}
            value={values[name] || (Array.isArray(options[0]) ? options[0][0] : options[0])}
            onChange={(e) => setValue(name, e.target.value)}
          >
            {options.map((o) => {
              const [value, label] = Array.isArray(o) ? o : [o, o];
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          <Tip name={name} />
        </span>
        {wrapInCol ? ' ' : ''}
      </label>
    </p>
  );
  return wrapInCol ? <div className={col || 'col-lg-6 col-md-6'}>{select}</div> : select;
}

/** Conditional field group (Contact Form 7 Conditional Fields), shown when `field` equals `value`. */
export function Cf7Group({ id, field, value, clearOnHide = false, children }) {
  const { values, setValue } = useContext(Ctx);
  const ref = useRef(null);
  const visible = (values[field] || '') === value;
  useEffect(() => {
    if (visible || !clearOnHide || !ref.current) return;
    ref.current.querySelectorAll('select[name]').forEach((el) => setValue(el.name, undefined));
  }, [visible, clearOnHide]);
  const extra = clearOnHide ? { 'data-clear_on_hide': '' } : {};
  return (
    <div ref={ref} data-id={id} data-orig_data_id={id} {...extra} className="" data-class="wpcf7cf_group" style={{ display: visible ? undefined : 'none' }}>
      {children}
    </div>
  );
}
