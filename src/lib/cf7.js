/**
 * Contact Form 7 client helpers, ported from the plugin's own scripts
 * (contact-form-7/includes/js/index.js and includes/swv/js/index.js, v6.1.5)
 * so the forms talk to the WordPress backend and validate exactly as on the
 * live site.
 */

const API_ROOT = '/wp-json/';
const NAMESPACE = 'contact-form-7/v1';

/** CF7's apiFetch: JSON response on 2xx, otherwise rejects. */
export async function cf7Fetch(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const url = API_ROOT + NAMESPACE + '/' + endpoint.replace(/^\//, '');
  let res;
  try {
    res = await fetch(url, { method, body, headers: { Accept: 'application/json, */*;q=0.1', ...headers } });
  } catch {
    throw { code: 'fetch_error', message: 'You are probably offline.' };
  }
  if (res.status < 200 || res.status >= 300) throw res;
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    throw { code: 'invalid_json', message: 'The response is not a valid JSON response.' };
  }
}

const schemas = new Map();
/** CF7 fetches each form's SWV schema from WordPress on page load. */
export function loadSchema(formId) {
  if (!schemas.has(formId)) {
    schemas.set(
      formId,
      cf7Fetch(`contact-forms/${formId}/feedback/schema`).catch(() => undefined),
    );
  }
  return schemas.get(formId);
}

// --- SWV rules used by the site's forms (required, email, number, maxlength, enum, ...) ---
const values = (fd, field) =>
  fd
    .getAll(field)
    .map((v) => String(v).trim())
    .filter((v) => v !== '');

const isEmail = (t) => {
  if (t.length < 6) return false;
  if (t.indexOf('@', 1) === -1) return false;
  if (t.indexOf('@') !== t.lastIndexOf('@')) return false;
  const [local, domain] = t.split('@', 2);
  if (!/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return false;
  if (/\.{2,}/.test(domain)) return false;
  if (/(?:^[ \t\n\r\0\x0B.]|[ \t\n\r\0\x0B.]$)/.test(domain)) return false;
  const parts = domain.split('.');
  if (parts.length < 2) return false;
  for (const p of parts) {
    if (/(?:^[ \t\n\r\0\x0B-]|[ \t\n\r\0\x0B-]$)/.test(p)) return false;
    if (!/^[a-z0-9-]+$/i.test(p)) return false;
  }
  return true;
};
const isNumber = (t) => /^[-]?[0-9]+(?:[eE][+-]?[0-9]+)?$/.test(t) || /^[-]?(?:[0-9]+)?[.][0-9]+(?:[eE][+-]?[0-9]+)?$/.test(t);

const RULES = {
  required: (r, fd) => values(fd, r.field).length > 0,
  requiredfile: (r, fd) => fd.getAll(r.field).length > 0,
  email: (r, fd) => values(fd, r.field).every(isEmail),
  number: (r, fd) => values(fd, r.field).every(isNumber),
  enum: (r, fd) => values(fd, r.field).every((t) => (r.accept || []).some((a) => t === String(a))),
  maxlength: (r, fd) => values(fd, r.field).reduce((n, t) => n + t.length, 0) <= parseInt(r.threshold, 10),
  minlength: (r, fd) => {
    const v = values(fd, r.field);
    return v.length === 0 || v.reduce((n, t) => n + t.length, 0) >= parseInt(r.threshold, 10);
  },
  minnumber: (r, fd) => values(fd, r.field).every((t) => !(parseFloat(t) < parseFloat(r.threshold))),
  maxnumber: (r, fd) => values(fd, r.field).every((t) => !(parseFloat(t) > parseFloat(r.threshold))),
};

/**
 * swv.validate(): runs the schema rules and returns Map(field -> first error message).
 * Unknown rule types are skipped, as in the plugin.
 */
export function validateSchema(schema, fd) {
  const errors = new Map();
  for (const rule of (schema && schema.rules) || []) {
    const check = RULES[rule.rule];
    if (!check) continue;
    if (errors.has(rule.field)) continue;
    if (!check(rule, fd) && rule.field !== undefined && rule.error !== undefined) errors.set(rule.field, rule.error);
  }
  return errors;
}
