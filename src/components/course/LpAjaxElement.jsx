import React, { useEffect, useRef, useState } from 'react';

/**
 * LearnPress "load content via AJAX" block (learnpress/assets/js/dist/loadAJAX.js,
 * v4.4.7): prints the skeleton, then asks the WordPress backend to render the
 * block (POST /lp-ajax-handle?id_url=...) and shows the returned HTML, exactly
 * as the live site does for the course "Reviews" tab. Page-number links inside
 * the rendered block reload it with the requested page, as in LearnPress.
 */
const SKELETON = [93, 90, 90, 97, 95, 96, 98, 92, 93, 98];
const LP_AJAX_URL = '/lp-ajax-handle';

async function fetchAjax(send) {
  const url = new URL(LP_AJAX_URL, window.location.origin);
  if (send.args && send.args.id_url) url.searchParams.set('id_url', send.args.id_url);
  else if (send.id_url) url.searchParams.set('id_url', send.id_url);
  const body = new FormData();
  body.append('nonce', '');
  body.append('lp-load-ajax', send.action || 'load_content_via_ajax');
  body.append('data', JSON.stringify(send));
  const res = await fetch(url, { method: 'POST', body });
  return res.json();
}

export default function LpAjaxElement({ targetId, send, skeleton = SKELETON }) {
  const elRef = useRef(null);
  const targetRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [firstDone, setFirstDone] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    const target = targetRef.current;
    if (!el || !target) return;
    let alive = true;
    const loadingChange = el.querySelector('.lp-loading-change');

    const load = (data, isPaging) => {
      if (isPaging && loadingChange) loadingChange.classList.remove('lp-hidden');
      fetchAjax(data)
        .then((json) => {
          if (!alive) return;
          if (json.status === 'success') target.innerHTML = json.data.content;
          else if (json.status === 'error') target.innerHTML = json.message;
        })
        .catch((err) => console.log(err))
        .finally(() => {
          if (!alive) return;
          setFirstDone(true);
          if (loadingChange) loadingChange.classList.add('lp-hidden');
        });
    };

    setLoaded(true);
    load({ ...JSON.parse(target.dataset.send) }, false);

    // LearnPress clickNumberPage(): pagination links inside the rendered block
    const onClick = (e) => {
      const link = e.target.closest && e.target.closest('.page-numbers:not(.disabled)');
      if (!link || link.tagName.toLowerCase() !== 'a' || !target.contains(link)) return;
      e.preventDefault();
      const data = { ...JSON.parse(target.dataset.send) };
      if (!Object.prototype.hasOwnProperty.call(data.args, 'paged')) data.args.paged = 1;
      if (link.classList.contains('prev')) data.args.paged--;
      else if (link.classList.contains('next')) data.args.paged++;
      else {
        const n = parseInt(link.textContent, 10);
        if (isNaN(n) || n < 1) return;
        data.args.paged = n;
      }
      target.dataset.send = JSON.stringify(data);
      load(data, true);
    };
    el.addEventListener('click', onClick);
    return () => {
      alive = false;
      el.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div className={'lp-load-ajax-element' + (loaded ? ' loaded' : '')} ref={elRef}>
      {firstDone ? null : (
        <div className="loading-first">
          <ul className="lp-skeleton-animation">
            {skeleton.map((w, i) => (
              <li key={i} style={{ width: w + '%' }}></li>
            ))}
          </ul>
        </div>
      )}
      <div className="lp-target" data-id={targetId} data-send={JSON.stringify(send)} ref={targetRef}></div>
      <div className="loading-after">
        <div className="lp-loading-change lp-hidden"></div>
      </div>
    </div>
  );
}
