(function () {
  'use strict';

  var APP_URL = 'https://sergioivorra.github.io/APP-ARTCUADROS-MOVIL/';
  var STORAGE_KEY = 'artcuadros_app_popup_closed';
  var DELAY_MS = 3500;

  if (localStorage.getItem(STORAGE_KEY) === '1') return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (!isMobile) return;

  var style = document.createElement('style');
  style.textContent = [
    '#ac-app-popup-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:99998;opacity:0;transition:opacity .3s}',
    '#ac-app-popup-backdrop.ac-visible{opacity:1}',
    '#ac-app-popup{position:fixed;left:50%;bottom:0;transform:translate(-50%,110%);width:min(92vw,380px);background:#1a1a1a;color:#f5f5f5;border-radius:20px 20px 0 0;padding:20px 18px 28px;z-index:99999;border:1px solid #2a2a2a;box-shadow:0 -8px 40px rgba(0,0,0,.5);transition:transform .35s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '#ac-app-popup.ac-visible{transform:translate(-50%,0)}',
    '#ac-app-popup .ac-close{position:absolute;top:10px;right:12px;background:transparent;border:0;color:#888;font-size:22px;line-height:1;cursor:pointer;padding:4px}',
    '#ac-app-popup .ac-badge{display:inline-block;background:#c9a962;color:#1a1a1a;font-weight:800;font-size:13px;padding:5px 10px;border-radius:8px;margin-bottom:10px}',
    '#ac-app-popup .ac-title{font-size:20px;font-weight:700;margin:0 0 8px;color:#e8d5a3}',
    '#ac-app-popup .ac-text{font-size:14px;line-height:1.45;color:#a0a0a0;margin:0 0 16px}',
    '#ac-app-popup .ac-preview{display:flex;gap:10px;align-items:center;background:#0f0f0f;border-radius:12px;padding:10px;margin-bottom:16px;border:1px solid #2a2a2a}',
    '#ac-app-popup .ac-preview img{width:52px;height:52px;border-radius:12px;object-fit:cover;background:#111}',
    '#ac-app-popup .ac-preview strong{display:block;font-size:13px;color:#f5f5f5}',
    '#ac-app-popup .ac-preview span{font-size:12px;color:#888}',
    '#ac-app-popup .ac-download{width:100%;background:#c9a962;color:#1a1a1a;border:0;border-radius:12px;padding:15px;font-size:16px;font-weight:700;cursor:pointer}',
    '#ac-app-popup .ac-download:active{transform:scale(.98)}',
    '#ac-app-popup .ac-later{width:100%;background:transparent;border:0;color:#888;padding:12px;font-size:13px;cursor:pointer;margin-top:4px}'
  ].join('');
  document.head.appendChild(style);

  var backdrop = document.createElement('div');
  backdrop.id = 'ac-app-popup-backdrop';

  var popup = document.createElement('div');
  popup.id = 'ac-app-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.innerHTML = [
    '<button type="button" class="ac-close" aria-label="Cerrar">&times;</button>',
    '<span class="ac-badge">-20% APP</span>',
    '<h2 class="ac-title">Prueba nuestra app móvil</h2>',
    '<p class="ac-text">Descarga Art Cuadros en tu teléfono, mira todos los cuadros y compra directo al pago con un 20% de descuento.</p>',
    '<div class="ac-preview">',
    '  <img src="' + APP_URL + 'icons/icon-192.png" alt="Art Cuadros">',
    '  <div><strong>Art Cuadros App</strong><span>Catálogo + pago directo</span></div>',
    '</div>',
    '<button type="button" class="ac-download">Descargar app en mi móvil</button>',
    '<button type="button" class="ac-later">Ahora no</button>'
  ].join('');

  function closePopup(remember) {
    backdrop.classList.remove('ac-visible');
    popup.classList.remove('ac-visible');
    setTimeout(function () {
      backdrop.remove();
      popup.remove();
    }, 320);
    if (remember) localStorage.setItem(STORAGE_KEY, '1');
  }

  function openAppInstall() {
    localStorage.setItem(STORAGE_KEY, '1');
    window.location.href = APP_URL + '?install=1';
  }

  popup.querySelector('.ac-close').addEventListener('click', function () {
    closePopup(true);
  });

  popup.querySelector('.ac-later').addEventListener('click', function () {
    closePopup(true);
  });

  popup.querySelector('.ac-download').addEventListener('click', openAppInstall);

  backdrop.addEventListener('click', function () {
    closePopup(true);
  });

  document.body.appendChild(backdrop);
  document.body.appendChild(popup);

  setTimeout(function () {
    backdrop.classList.add('ac-visible');
    popup.classList.add('ac-visible');
  }, DELAY_MS);
})();
