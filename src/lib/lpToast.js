import '../styles/toastify.css';

/**
 * Minimal Toastify 1.12 equivalent used by LearnPress for its error toasts
 * (lpData.toast: gravity bottom, position center, duration 3000, close 1,
 * stopOnFocus 1, classPrefix "lp-toast"). Same element, classes and timing.
 */
export function showLpToast(text, type = 'error') {
  const el = document.createElement('div');
  el.className = `toastify on lp-toast ${type} toastify-center toastify-bottom`;
  el.setAttribute('aria-live', 'polite');
  el.innerText = text;
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  close.className = 'toast-close';
  close.innerHTML = '&#10006;';
  el.appendChild(close);
  el.style.transform = 'translate(0px, 0px)';
  el.style.bottom = '15px';
  document.body.appendChild(el);

  let timer;
  const remove = () => {
    el.classList.remove('on');
    setTimeout(() => el.remove(), 400);
  };
  const start = () => {
    timer = setTimeout(remove, 3000);
  };
  close.addEventListener('click', (e) => {
    e.stopPropagation();
    clearTimeout(timer);
    remove();
  });
  el.addEventListener('mouseover', () => clearTimeout(timer));
  el.addEventListener('mouseleave', start);
  start();
}
