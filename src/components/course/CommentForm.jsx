import React, { useEffect, useState } from 'react';
import { WP_RENDER_HEADER } from '../../lib/wp-routing';

/**
 * Comments section under every course, as on the live site: WordPress' own
 * comment form posting to /wp-comments-post.php (WordPress stores the comment,
 * applies its moderation settings and redirects back), and the published
 * comments. When a course has published comments, the section is replaced by
 * WordPress' rendering of it so the list uses the theme's exact markup.
 */
export default function CommentForm({ course }) {
  const [wpHtml, setWpHtml] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/wp-json/wp/v2/comments?post=${course.id}&per_page=1&_fields=id`);
        if (!res.ok || !(parseInt(res.headers.get('x-wp-total') || '0', 10) > 0)) return;
        const page = await fetch(course.url, { headers: { [WP_RENDER_HEADER]: 'wordpress' } });
        if (!page.ok) return;
        const doc = new DOMParser().parseFromString(await page.text(), 'text/html');
        const comments = doc.getElementById('comments');
        if (!comments || !alive) return;
        // The theme's main.js wraps the reply form in <div class="comment-full"> at runtime.
        const respond = comments.querySelector('.comment-respond');
        if (respond && !respond.parentElement.classList.contains('comment-full')) {
          const wrap = doc.createElement('div');
          wrap.className = 'comment-full';
          respond.replaceWith(wrap);
          wrap.appendChild(respond);
        }
        setWpHtml(comments.innerHTML);
      } catch {
        /* keep the static section */
      }
    })();
    return () => {
      alive = false;
    };
  }, [course.id, course.url]);

  if (wpHtml !== null) {
    return <div id="comments" className="comments-area" dangerouslySetInnerHTML={{ __html: wpHtml }} />;
  }

  // The theme's main.js wraps .comment-respond in <div class="comment-full"> at runtime.
  return (
    <div id="comments" className="comments-area">
      <div className="comment-full">
        <div id="respond" className="comment-respond">
          <h3 id="reply-title" className="comment-reply-title">
            Leave a Reply{' '}
            <small>
              <a rel="nofollow" id="cancel-comment-reply-link" href={course.url + '#respond'} style={{ display: 'none' }}>
                Cancel reply
              </a>
            </small>
          </h3>
          <form action="/wp-comments-post.php" method="post" id="commentform" className="comment-form">
            <p className="comment-form-author">
              <label htmlFor="author">
                Name <span className="required">*</span>
              </label>{' '}
              <input id="author" name="author" type="text" defaultValue="" size="30" maxLength="245" autoComplete="name" required />
            </p>
            <p className="comment-form-email">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>{' '}
              <input id="email" name="email" type="email" defaultValue="" size="30" maxLength="100" autoComplete="email" required />
            </p>
            <p className="comment-form-url">
              <label htmlFor="url">Website</label> <input id="url" name="url" type="url" defaultValue="" size="30" maxLength="200" autoComplete="url" />
            </p>
            <p className="comment-form-cookies-consent">
              <input id="wp-comment-cookies-consent" name="wp-comment-cookies-consent" type="checkbox" value="yes" />{' '}
              <label htmlFor="wp-comment-cookies-consent">Save my name, email, and website in this browser for the next time I comment.</label>
            </p>
            <p className="comment-form-comment">
              <label htmlFor="comment">
                Comment <span className="required">*</span>
              </label>{' '}
              <textarea id="comment" name="comment" cols="45" rows="8" maxLength="65525" required></textarea>
            </p>
            <p className="form-submit">
              <input name="submit" type="submit" id="submit" className="submit" value="Post Comment" />{' '}
              <input type="hidden" name="comment_post_ID" value={course.id} id="comment_post_ID" />
              <input type="hidden" name="comment_parent" id="comment_parent" value="0" />
            </p>
            <input type="hidden" name="comment-post-item-course" value={course.id} />
          </form>
        </div>
        {/* #respond */}
      </div>
    </div>
  );
}
