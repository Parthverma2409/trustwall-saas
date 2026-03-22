import { NextResponse } from 'next/server'

const WIDGET_SCRIPT = `(function() {
  var el = document.getElementById('trustwall-widget');
  if (!el) return;

  var spaceId = el.getAttribute('data-space');
  var style = el.getAttribute('data-style') || 'wall';
  var origin = '__ORIGIN__';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function stars(n) {
    return Array.from({length: 5}, function(_, i) {
      return '<span style="color:' + (i < n ? '#facc15' : '#d1d5db') + ';font-size:14px">\\u2605</span>';
    }).join('');
  }

  function card(t) {
    return '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;break-inside:avoid;margin-bottom:12px">' +
      '<div style="margin-bottom:8px">' + stars(t.rating) + '</div>' +
      '<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 12px">' +
      '\\u201C' + esc(t.text) + '\\u201D</p>' +
      '<div style="font-size:13px"><strong style="color:#111827">' + esc(t.authorName) + '</strong>' +
      (t.authorTitle ? '<span style="color:#9ca3af;margin-left:6px">\\u2022 ' + esc(t.authorTitle) + '</span>' : '') +
      '</div></div>';
  }

  fetch(origin + '/api/widget?spaceId=' + spaceId)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.testimonials || !data.testimonials.length) { el.innerHTML = ''; return; }

      // Check if requested style is allowed by plan
      var allowedStyles = data.allowedStyles || ['wall'];
      var effectiveStyle = allowedStyles.indexOf(style) !== -1 ? style : allowedStyles[0];

      var html = '';
      if (effectiveStyle === 'wall') {
        html = '<div style="column-count:2;column-gap:12px;font-family:system-ui,-apple-system,sans-serif">' +
          data.testimonials.map(card).join('') + '</div>';
      } else if (effectiveStyle === 'carousel') {
        var cid = 'tw-' + Math.random().toString(36).substr(2,6);
        html = '<div id="' + cid + '" style="overflow:hidden;font-family:system-ui,-apple-system,sans-serif">' +
          '<div style="display:flex;transition:transform .5s ease;gap:12px">' +
          data.testimonials.map(function(t) {
            return '<div style="min-width:320px;max-width:400px;flex-shrink:0">' + card(t) + '</div>';
          }).join('') + '</div></div>';
        setTimeout(function() {
          var w = document.querySelector('#' + cid + ' > div');
          if (!w) return;
          var i = 0;
          setInterval(function() {
            i = (i + 1) % data.testimonials.length;
            w.style.transform = 'translateX(-' + (i * 332) + 'px)';
          }, 4000);
        }, 100);
      } else if (effectiveStyle === 'badge') {
        // Compact star rating badge
        var avg = data.aggregate ? data.aggregate.average : '0';
        var cnt = data.aggregate ? data.aggregate.count : 0;
        html = '<div style="display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:10px 16px;font-family:system-ui,-apple-system,sans-serif">' +
          '<div style="display:flex;gap:2px">' + stars(Math.round(Number(avg))) + '</div>' +
          '<span style="font-weight:700;font-size:15px;color:#111827">' + avg + '</span>' +
          '<span style="color:#9ca3af;font-size:12px">from ' + cnt + ' review' + (cnt !== 1 ? 's' : '') + '</span>' +
          '</div>';
      } else {
        html = '<div style="max-width:600px;font-family:system-ui,-apple-system,sans-serif">' +
          data.testimonials.map(card).join('') + '</div>';
      }

      // Only show branding if plan doesn't allow removal
      if (!data.removeBranding) {
        html += '<div style="text-align:center;margin-top:16px"><a href="' + origin +
          '/powered-by" target="_blank" style="color:#9ca3af;font-size:11px;text-decoration:none">' +
          'Powered by Trustwall</a></div>';
      }

      el.innerHTML = html;
    })
    .catch(function(e) { console.error('Trustwall:', e); });
})();`

export async function GET(req: Request) {
  const origin = new URL(req.url).origin
  const script = WIDGET_SCRIPT.replace(/__ORIGIN__/g, origin)

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
