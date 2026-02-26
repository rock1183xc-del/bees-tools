(function () {
  const API_BASE = '';
  const STORAGE_KEY = 'beeToolsTheme';

  function run() {
    const cardsContainer = document.getElementById('cardsContainer');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const btnSettings = document.getElementById('btnSettings');
    const btnAdmin = document.getElementById('btnAdmin');
    const modalSettings = document.getElementById('modalSettings');
    const modalAdmin = document.getElementById('modalAdmin');
    const closeSettings = document.getElementById('closeSettings');
    const closeAdmin = document.getElementById('closeAdmin');
    const saveSettings = document.getElementById('saveSettings');
    const inputPrimaryColor = document.getElementById('inputPrimaryColor');
    const inputButtonColor = document.getElementById('inputButtonColor');
    const inputButtonColorEnd = document.getElementById('inputButtonColorEnd');
    const inputCardBgColor = document.getElementById('inputCardBgColor');
    const inputCardBgColorEnd = document.getElementById('inputCardBgColorEnd');
    const inputModalBgColor = document.getElementById('inputModalBgColor');
    const inputModalBgColorEnd = document.getElementById('inputModalBgColorEnd');
    const inputPrimaryColorEnd = document.getElementById('inputPrimaryColorEnd');
    const inputBodyGradientStart = document.getElementById('inputBodyGradientStart');
    const inputBodyGradientEnd = document.getElementById('inputBodyGradientEnd');
    const clearBodyGradientBtn = document.getElementById('clearBodyGradientBtn');
    const inputBackgroundUrl = document.getElementById('inputBackgroundUrl');
    const inputBackgroundFile = document.getElementById('inputBackgroundFile');
    const clearBackgroundBtn = document.getElementById('clearBackgroundBtn');
    const inputFontSize = document.getElementById('inputFontSize');
    const inputCardSpacing = document.getElementById('inputCardSpacing');
    const inputCardRadius = document.getElementById('inputCardRadius');
    const adminPassword = document.getElementById('adminPassword');
    const toolName = document.getElementById('toolName');
    const toolUrl = document.getElementById('toolUrl');
    const toolDescription = document.getElementById('toolDescription');
    const toolType = document.getElementById('toolType');
    const toolTypeHint = document.getElementById('toolTypeHint');
    const labelToolUrl = document.getElementById('labelToolUrl');
    const toolCardColor = document.getElementById('toolCardColor');
    const toolIcon = document.getElementById('toolIcon');
    const toolIconFile = document.getElementById('toolIconFile');
    const clearToolIconBtn = document.getElementById('clearToolIconBtn');
    const toolIconPreview = document.getElementById('toolIconPreview');
    const toolIconPreviewImg = document.getElementById('toolIconPreviewImg');
    const submitTool = document.getElementById('submitTool');
    const adminMessage = document.getElementById('adminMessage');
    const adminMessageAdd = document.getElementById('adminMessageAdd');
    const adminVerifyView = document.getElementById('adminVerifyView');
    const adminAddView = document.getElementById('adminAddView');
    const adminVerifyBtn = document.getElementById('adminVerifyBtn');
    const modalAdminTitle = document.getElementById('modalAdminTitle');
    const modalAdminSubtitle = document.getElementById('modalAdminSubtitle');
    const wishPoolWidget = document.getElementById('wishPoolWidget');
    const wishPoolPanel = document.getElementById('wishPoolPanel');
    const wishPoolBadge = document.getElementById('wishPoolBadge');
    const wishPoolClose = document.getElementById('wishPoolClose');
    const wishPoolSubmitView = document.getElementById('wishPoolSubmitView');
    const wishPoolAdminView = document.getElementById('wishPoolAdminView');
    const wishPoolContent = document.getElementById('wishPoolContent');
    const wishPoolSubmit = document.getElementById('wishPoolSubmit');
    const wishPoolMsg = document.getElementById('wishPoolMsg');
    const wishPoolList = document.getElementById('wishPoolList');
    const wishPoolCount = document.getElementById('wishPoolCount');

    if (!cardsContainer || !btnSettings || !btnAdmin || !modalSettings || !modalAdmin) return;

    var currentTools = [];
    var adminMode = false;
    var storedAdminPassword = '';
    var editingToolId = '';
    var uploadedIconDataUrl = '';

    function updateToolTypeHint() {
      if (!toolTypeHint || !labelToolUrl) return;
      if (toolType && toolType.value === 'plugin') {
        toolTypeHint.textContent = '請填寫插件的「下載連結」（例如 GitHub Releases、雲端硬碟的 .zip 連結）。';
        labelToolUrl.textContent = '下載網址';
      } else {
        toolTypeHint.textContent = '點擊卡片會開啟連結。';
        labelToolUrl.textContent = '網址';
      }
    }
    if (toolType) toolType.addEventListener('change', updateToolTypeHint);

    function getLuminance(hex) {
      if (!hex || typeof hex !== 'string') return 1;
      hex = hex.replace(/^#/, '');
      if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      if (hex.length !== 6) return 1;
      var r = parseInt(hex.slice(0, 2), 16) / 255;
      var g = parseInt(hex.slice(2, 4), 16) / 255;
      var b = parseInt(hex.slice(4, 6), 16) / 255;
      r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function applyTheme(theme) {
      var root = document.documentElement;
      if (!theme) {
        root.classList.remove('theme-dark');
        root.style.removeProperty('--text');
        root.style.removeProperty('--text-muted');
        root.style.removeProperty('--card-border');
        return;
      }
      var p1 = theme.primaryColor && theme.primaryColor.trim();
      var p2 = theme.primaryColorEnd && theme.primaryColorEnd.trim();
      if (p1) {
        root.style.setProperty('--primary', p1);
        root.style.setProperty('--primary-hover', theme.primaryColorHover || p1);
      }
      if (p1 && p2) {
        root.style.setProperty('--header-gradient', 'linear-gradient(135deg, color-mix(in srgb, ' + p1 + ' 35%, #000) 0%, color-mix(in srgb, ' + p2 + ' 22%, #000) 100%)');
        root.style.setProperty('--body-pattern', 'radial-gradient(ellipse at top, color-mix(in srgb, ' + p1 + ' 22%, transparent) 0%, color-mix(in srgb, ' + p2 + ' 12%, transparent) 50%, transparent 55%)');
      } else if (p1) {
        root.style.setProperty('--header-gradient', 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 35%, #000) 0%, color-mix(in srgb, var(--primary) 22%, #000) 100%)');
        root.style.setProperty('--body-pattern', 'radial-gradient(ellipse at top, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 55%)');
      }
      var b1 = theme.buttonColor && theme.buttonColor.trim();
      var b2 = theme.buttonColorEnd && theme.buttonColorEnd.trim();
      if (b1) {
        root.style.setProperty('--button-color', b1);
        root.style.setProperty('--button-color-hover', theme.buttonColorHover || b2 || b1);
      }
      if (b1 && b2) {
        root.style.setProperty('--button-gradient', 'linear-gradient(145deg, ' + b1 + ' 0%, ' + b2 + ' 100%)');
        root.style.setProperty('--button-gradient-hover', 'linear-gradient(145deg, ' + (theme.buttonColorHover || b2) + ' 0%, ' + b1 + ' 100%)');
      } else if (b1) {
        root.style.setProperty('--button-gradient', b1);
        root.style.setProperty('--button-gradient-hover', theme.buttonColorHover || b1);
      }
      var c1 = theme.cardBgColor !== undefined && theme.cardBgColor !== null ? (theme.cardBgColor || '#ffffff') : null;
      var c2 = theme.cardBgColorEnd && theme.cardBgColorEnd.trim();
      if (c1 !== null) {
        if (c2) root.style.setProperty('--card-bg', 'linear-gradient(135deg, ' + c1 + ' 0%, ' + c2 + ' 100%)');
        else root.style.setProperty('--card-bg', c1);
      }
      var m1 = theme.modalBgColor !== undefined && theme.modalBgColor !== null ? (theme.modalBgColor || '#ffffff') : '#ffffff';
      var m2 = theme.modalBgColorEnd && theme.modalBgColorEnd.trim();
      if (m2) root.style.setProperty('--modal-bg', 'linear-gradient(135deg, ' + m1 + ' 0%, ' + m2 + ' 100%)');
      else root.style.setProperty('--modal-bg', m1);
      var start = theme.bodyGradientStart && theme.bodyGradientStart.trim();
      var end = theme.bodyGradientEnd && theme.bodyGradientEnd.trim();
      if (start && end) {
        root.style.setProperty('--body-bg', start);
        root.style.setProperty('--body-pattern', 'linear-gradient(135deg, ' + start + ' 0%, ' + end + ' 100%)');
      } else if (p1 && p2) {
        root.style.setProperty('--body-bg', p1);
      } else {
        root.style.setProperty('--body-bg', '#f0f2f5');
        if (!p1) root.style.setProperty('--body-pattern', 'radial-gradient(ellipse at top, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 55%)');
      }
      if (theme.backgroundImage) {
        document.body.style.backgroundImage = 'linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0.85)), url(' + theme.backgroundImage + ')';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      } else {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundAttachment = '';
      }
      document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
      if (theme.fontSize) document.body.classList.add('font-size-' + theme.fontSize);
      document.body.classList.remove('card-spacing-compact', 'card-spacing-normal', 'card-spacing-relaxed');
      if (theme.cardSpacing) document.body.classList.add('card-spacing-' + theme.cardSpacing);
      document.body.classList.remove('card-radius-small', 'card-radius-medium', 'card-radius-large');
      if (theme.cardRadius) document.body.classList.add('card-radius-' + theme.cardRadius);
      var cardBg = (theme.cardBgColor !== undefined && theme.cardBgColor !== null) ? (theme.cardBgColor || '#ffffff') : '#ffffff';
      var modalBg = (theme.modalBgColor !== undefined && theme.modalBgColor !== null) ? (theme.modalBgColor || '#ffffff') : '#ffffff';
      var bodyStart = (theme.bodyGradientStart && theme.bodyGradientStart.trim()) || (theme.primaryColor && theme.primaryColor.trim()) || '';
      var isDark = getLuminance(cardBg) < 0.4 || getLuminance(modalBg) < 0.4 || (bodyStart && getLuminance(bodyStart) < 0.4);
      if (isDark) {
        root.classList.add('theme-dark');
        root.style.setProperty('--text', '#f0f0f0');
        root.style.setProperty('--text-muted', '#b8b8b8');
        root.style.setProperty('--card-border', 'rgba(255,255,255,0.12)');
      } else {
        root.classList.remove('theme-dark');
        root.style.removeProperty('--text');
        root.style.removeProperty('--text-muted');
        root.style.removeProperty('--card-border');
      }
    }

    function loadTheme() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var theme = raw ? JSON.parse(raw) : null;
        applyTheme(theme);
        if (theme && inputPrimaryColor) inputPrimaryColor.value = theme.primaryColor || '#e6a700';
        if (inputPrimaryColorEnd) inputPrimaryColorEnd.value = (theme && theme.primaryColorEnd) ? theme.primaryColorEnd : '';
        if (theme && inputButtonColor) inputButtonColor.value = theme.buttonColor || '#e6a700';
        if (inputButtonColorEnd) inputButtonColorEnd.value = (theme && theme.buttonColorEnd) ? theme.buttonColorEnd : '';
        if (inputCardBgColor) inputCardBgColor.value = (theme && theme.cardBgColor) ? theme.cardBgColor : '#ffffff';
        if (inputCardBgColorEnd) inputCardBgColorEnd.value = (theme && theme.cardBgColorEnd) ? theme.cardBgColorEnd : '';
        if (inputModalBgColor) inputModalBgColor.value = (theme && theme.modalBgColor) ? theme.modalBgColor : '#ffffff';
        if (inputModalBgColorEnd) inputModalBgColorEnd.value = (theme && theme.modalBgColorEnd) ? theme.modalBgColorEnd : '';
        if (inputBodyGradientStart && inputBodyGradientEnd) {
          if (theme && theme.bodyGradientStart && theme.bodyGradientEnd) {
            inputBodyGradientStart.value = theme.bodyGradientStart;
            inputBodyGradientEnd.value = theme.bodyGradientEnd;
            inputBodyGradientStart.removeAttribute('data-use-default');
            inputBodyGradientEnd.removeAttribute('data-use-default');
          } else {
            inputBodyGradientStart.value = '#e6a700';
            inputBodyGradientEnd.value = '#d49800';
            inputBodyGradientStart.setAttribute('data-use-default', 'true');
            inputBodyGradientEnd.setAttribute('data-use-default', 'true');
          }
        }
        if (theme && inputBackgroundUrl) {
          var bg = theme.backgroundImage || '';
          inputBackgroundUrl.value = (bg && bg.indexOf('http') === 0) ? bg : '';
        }
        if (inputBackgroundFile) inputBackgroundFile.value = '';
        if (theme && inputFontSize) inputFontSize.value = theme.fontSize || 'medium';
        if (theme && inputCardSpacing) inputCardSpacing.value = theme.cardSpacing || 'normal';
        if (theme && inputCardRadius) inputCardRadius.value = theme.cardRadius || 'medium';
      } catch (e) {}
    }

    function saveTheme() {
      var theme = {
        primaryColor: inputPrimaryColor ? inputPrimaryColor.value : '#e6a700',
        primaryColorEnd: (inputPrimaryColorEnd && inputPrimaryColorEnd.value.trim()) ? inputPrimaryColorEnd.value.trim() : '',
        buttonColor: inputButtonColor ? inputButtonColor.value : '#e6a700',
        buttonColorEnd: (inputButtonColorEnd && inputButtonColorEnd.value.trim()) ? inputButtonColorEnd.value.trim() : '',
        cardBgColor: inputCardBgColor ? inputCardBgColor.value : '#ffffff',
        cardBgColorEnd: (inputCardBgColorEnd && inputCardBgColorEnd.value.trim()) ? inputCardBgColorEnd.value.trim() : '',
        modalBgColor: inputModalBgColor ? inputModalBgColor.value : '#ffffff',
        modalBgColorEnd: (inputModalBgColorEnd && inputModalBgColorEnd.value.trim()) ? inputModalBgColorEnd.value.trim() : '',
        bodyGradientStart: (inputBodyGradientStart && inputBodyGradientStart.getAttribute('data-use-default') !== 'true') ? (inputBodyGradientStart.value || '') : '',
        bodyGradientEnd: (inputBodyGradientEnd && inputBodyGradientEnd.getAttribute('data-use-default') !== 'true') ? (inputBodyGradientEnd.value || '') : '',
        fontSize: inputFontSize ? inputFontSize.value : 'medium',
        cardSpacing: inputCardSpacing ? inputCardSpacing.value : 'normal',
        cardRadius: inputCardRadius ? inputCardRadius.value : 'medium'
      };
      if (inputBackgroundFile && inputBackgroundFile.files && inputBackgroundFile.files[0]) {
        var fr = new FileReader();
        fr.onload = function () {
          theme.backgroundImage = fr.result;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
          applyTheme(theme);
        };
        fr.readAsDataURL(inputBackgroundFile.files[0]);
        return;
      }
      theme.backgroundImage = (inputBackgroundUrl && inputBackgroundUrl.value.trim()) ? inputBackgroundUrl.value.trim() : '';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
      applyTheme(theme);
    }

    function showLoading(show) {
      if (loadingEl) loadingEl.classList.toggle('hidden', !show);
    }

    function showError(msg) {
      if (errorEl) {
        errorEl.textContent = msg || '';
        errorEl.classList.toggle('hidden', !msg);
      }
    }

    function getFaviconUrl(url) {
      try {
        var u = new URL(url);
        return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(u.hostname) + '&sz=128';
      } catch (e) {
        return '';
      }
    }

    function getFaviconFallbackUrl(url) {
      try {
        var u = new URL(url);
        return u.origin + '/favicon.ico';
      } catch (e) {
        return '';
      }
    }

    function getCardIconUrl(tool) {
      if (tool.icon && String(tool.icon).trim()) return String(tool.icon).trim();
      if (tool.url && String(tool.url).trim()) return getFaviconFallbackUrl(tool.url);
      return '';
    }

    function renderCards(tools, isAdminMode) {
      if (!cardsContainer) return;
      cardsContainer.innerHTML = '';
      var list = Array.isArray(tools) ? tools : [];
      var isAdmin = !!isAdminMode;

      if (list.length === 0 && !isAdmin) {
        cardsContainer.innerHTML = '<p class="loading">尚無工具，請由管理者新增。</p>';
        return;
      }

      list.forEach(function (tool) {
        var isPlugin = tool.type === 'plugin';
        var iconUrl = getCardIconUrl(tool);
        var fallbackUrl = '';
        if (iconUrl && iconUrl.indexOf('data:') !== 0 && tool.url) {
          fallbackUrl = getFaviconUrl(tool.url);
        }
        var iconHtml = iconUrl
          ? '<div class="card-icon"><img class="card-icon-img" src="' + escapeHtml(iconUrl) + '" alt="" loading="lazy"></div>'
          : '<div class="card-icon" aria-hidden="true"></div>';
        var cardInner =
          (isPlugin ? '<span class="card-badge">插件</span>' : '') +
          iconHtml +
          '<h3 class="card-title">' + escapeHtml(tool.name) + '</h3>' +
          (tool.description ? '<p class="card-desc">' + escapeHtml(tool.description) + '</p>' : '') +
          (isPlugin ? '<p class="card-action">下載插件</p>' : '');

        if (isAdmin) {
          var wrap = document.createElement('div');
          wrap.className = 'card-outer';
          wrap.innerHTML =
            '<button type="button" class="card-delete" data-tool-id="' + escapeHtml(tool.id) + '" aria-label="刪除 ' + escapeHtml(tool.name) + '">&times;</button>' +
            '<a class="card' + (isPlugin ? ' card--plugin' : '') + '" href="' + escapeHtml(tool.url) + '" target="_blank" rel="noopener noreferrer"' + (isPlugin ? ' download' : '') + ' data-tool-id="' + escapeHtml(tool.id) + '">' + cardInner + '</a>';
          var link = wrap.querySelector('a');
          var delBtn = wrap.querySelector('.card-delete');
          if (delBtn) {
            delBtn.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              var id = delBtn.getAttribute('data-tool-id');
              fetch(API_BASE + '/api/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: storedAdminPassword, action: 'delete', id: id })
              })
                .then(function (res) { return res.json().then(function (data) {
                  if (res.ok) fetchTools();
                }); })
                .catch(function () {});
            });
          }
          link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openEditModal(tool);
          });
          cardsContainer.appendChild(wrap);
          if (tool.cardColor && String(tool.cardColor).trim()) link.style.background = tool.cardColor.trim();
          if (fallbackUrl) {
            var iconImg = wrap.querySelector('.card-icon img');
            if (iconImg) {
              iconImg.setAttribute('data-fallback', fallbackUrl);
              iconImg.onerror = function () {
                iconImg.onerror = null;
                var fb = iconImg.getAttribute('data-fallback');
                if (fb) iconImg.src = fb;
              };
            }
          }
        } else {
          var a = document.createElement('a');
          a.className = 'card' + (isPlugin ? ' card--plugin' : '');
          a.href = tool.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          if (isPlugin) a.setAttribute('download', '');
          a.innerHTML = cardInner;
          if (tool.cardColor && String(tool.cardColor).trim()) a.style.background = tool.cardColor.trim();
          cardsContainer.appendChild(a);
          if (fallbackUrl) {
            var iconImg = a.querySelector('.card-icon img');
            if (iconImg) {
              iconImg.setAttribute('data-fallback', fallbackUrl);
              iconImg.onerror = function () {
                iconImg.onerror = null;
                var fb = iconImg.getAttribute('data-fallback');
                if (fb) iconImg.src = fb;
              };
            }
          }
        }
      });

      if (isAdmin) {
        var addCard = document.createElement('button');
        addCard.type = 'button';
        addCard.className = 'card card-add';
        addCard.setAttribute('aria-label', '新增工具');
        addCard.innerHTML = '<span class="card-add-icon">+</span>';
        addCard.addEventListener('click', function () {
          editingToolId = '';
          uploadedIconDataUrl = '';
          if (toolName) toolName.value = '';
          if (toolUrl) toolUrl.value = '';
          if (toolDescription) toolDescription.value = '';
          if (toolCardColor) toolCardColor.value = '';
          if (toolIcon) toolIcon.value = '';
          if (toolIconFile) toolIconFile.value = '';
          if (toolIconPreview) toolIconPreview.classList.add('hidden');
          if (toolIconPreviewImg) toolIconPreviewImg.src = '';
          if (toolType) toolType.value = 'link';
          updateToolTypeHint();
          if (adminMessageAdd) { adminMessageAdd.textContent = ''; adminMessageAdd.classList.add('hidden'); }
          if (adminVerifyView) adminVerifyView.classList.add('hidden');
          if (adminAddView) { adminAddView.classList.remove('hidden'); }
          if (modalAdminTitle) modalAdminTitle.textContent = '新增工具';
          if (modalAdminSubtitle) modalAdminSubtitle.classList.remove('hidden');
          if (submitTool) submitTool.textContent = '新增';
          openModal(modalAdmin);
        });
        cardsContainer.appendChild(addCard);
      }
    }

    function updateAdminButtonText() {
      if (btnAdmin) btnAdmin.textContent = adminMode ? '結束管理' : '管理者';
    }

    function openEditModal(tool) {
      editingToolId = tool.id;
      if (toolName) toolName.value = tool.name || '';
      if (toolUrl) toolUrl.value = tool.url || '';
      if (toolDescription) toolDescription.value = tool.description || '';
      if (toolCardColor) toolCardColor.value = (tool.cardColor && String(tool.cardColor).trim()) ? tool.cardColor.trim() : '';
      var iconVal = (tool.icon && String(tool.icon).trim()) ? tool.icon.trim() : '';
      if (iconVal && iconVal.indexOf('data:') === 0) {
        uploadedIconDataUrl = iconVal;
        if (toolIcon) toolIcon.value = '';
        if (toolIconFile) toolIconFile.value = '';
        if (toolIconPreviewImg) toolIconPreviewImg.src = iconVal;
        if (toolIconPreview) toolIconPreview.classList.remove('hidden');
      } else {
        uploadedIconDataUrl = '';
        if (toolIcon) toolIcon.value = iconVal;
        if (toolIconFile) toolIconFile.value = '';
        if (toolIconPreview) toolIconPreview.classList.add('hidden');
        if (toolIconPreviewImg) toolIconPreviewImg.src = '';
      }
      if (toolType) toolType.value = (tool.type === 'plugin') ? 'plugin' : 'link';
      updateToolTypeHint();
      if (adminMessageAdd) { adminMessageAdd.textContent = ''; adminMessageAdd.classList.add('hidden'); }
      if (adminVerifyView) adminVerifyView.classList.add('hidden');
      if (adminAddView) { adminAddView.classList.remove('hidden'); }
      if (modalAdminTitle) modalAdminTitle.textContent = '編輯工具';
      if (modalAdminSubtitle) modalAdminSubtitle.classList.add('hidden');
      if (submitTool) submitTool.textContent = '儲存';
      openModal(modalAdmin);
    }

    function escapeHtml(s) {
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }

    function fetchTools() {
      showLoading(true);
      showError('');
      if (cardsContainer) cardsContainer.innerHTML = '';
      return fetch(API_BASE + '/api/tools')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var list = Array.isArray(data) ? data : [];
          currentTools = list;
          showLoading(false);
          renderCards(list, adminMode);
          return list;
        })
        .catch(function (err) {
          showLoading(false);
          showError('無法載入工具列表，請稍後再試。');
          if (cardsContainer) cardsContainer.innerHTML = '<p class="loading">尚無工具，請由管理者新增。</p>';
          currentTools = [];
        });
    }

    function openModal(modal) {
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      var main = document.getElementById('mainContent');
      if (main) main.setAttribute('aria-hidden', 'true');
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      var main = document.getElementById('mainContent');
      if (main) main.setAttribute('aria-hidden', 'false');
    }

    function showAdminMessage(text, isError) {
      if (adminMessage) {
        adminMessage.textContent = text;
        adminMessage.classList.remove('success', 'error');
        adminMessage.classList.add(isError ? 'error' : 'success');
        adminMessage.classList.remove('hidden');
      }
    }

    function hideAdminMessage() {
      if (adminMessage) adminMessage.classList.add('hidden');
    }

    btnSettings.addEventListener('click', function () { openModal(modalSettings); });
    if (closeSettings) closeSettings.addEventListener('click', function () { closeModal(modalSettings); });
    if (saveSettings) saveSettings.addEventListener('click', function () {
      saveTheme();
      closeModal(modalSettings);
    });
    if (clearBodyGradientBtn) clearBodyGradientBtn.addEventListener('click', function () {
      if (inputBodyGradientStart) { inputBodyGradientStart.value = '#e6a700'; inputBodyGradientStart.setAttribute('data-use-default', 'true'); }
      if (inputBodyGradientEnd) { inputBodyGradientEnd.value = '#d49800'; inputBodyGradientEnd.setAttribute('data-use-default', 'true'); }
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var theme = raw ? JSON.parse(raw) : {};
        theme.bodyGradientStart = '';
        theme.bodyGradientEnd = '';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
        applyTheme(theme);
      } catch (e) {}
    });
    if (inputBodyGradientStart) inputBodyGradientStart.addEventListener('input', function () { inputBodyGradientStart.removeAttribute('data-use-default'); if (inputBodyGradientEnd) inputBodyGradientEnd.removeAttribute('data-use-default'); });
    if (inputBodyGradientEnd) inputBodyGradientEnd.addEventListener('input', function () { inputBodyGradientEnd.removeAttribute('data-use-default'); if (inputBodyGradientStart) inputBodyGradientStart.removeAttribute('data-use-default'); });
    if (clearBackgroundBtn) clearBackgroundBtn.addEventListener('click', function () {
      if (inputBackgroundUrl) inputBackgroundUrl.value = '';
      if (inputBackgroundFile) inputBackgroundFile.value = '';
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var theme = raw ? JSON.parse(raw) : {};
        theme.backgroundImage = '';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
        applyTheme(theme);
      } catch (e) {}
    });
    if (toolIconFile) toolIconFile.addEventListener('change', function () {
      var file = toolIconFile.files && toolIconFile.files[0];
      if (!file) return;
      var fr = new FileReader();
      fr.onload = function () {
        uploadedIconDataUrl = fr.result;
        if (toolIconPreviewImg) toolIconPreviewImg.src = uploadedIconDataUrl;
        if (toolIconPreview) toolIconPreview.classList.remove('hidden');
        if (toolIcon) toolIcon.value = '';
      };
      fr.readAsDataURL(file);
    });
    if (clearToolIconBtn) clearToolIconBtn.addEventListener('click', function () {
      uploadedIconDataUrl = '';
      if (toolIconFile) toolIconFile.value = '';
      if (toolIconPreview) toolIconPreview.classList.add('hidden');
      if (toolIconPreviewImg) toolIconPreviewImg.src = '';
    });
    modalSettings.addEventListener('click', function (e) {
      if (e.target === modalSettings) closeModal(modalSettings);
    });

    btnAdmin.addEventListener('click', function () {
      if (adminMode) {
        adminMode = false;
        storedAdminPassword = '';
        updateAdminButtonText();
        renderCards(currentTools, false);
        return;
      }
      if (adminPassword) adminPassword.value = '';
      hideAdminMessage();
      if (adminVerifyView) adminVerifyView.classList.remove('hidden');
      if (adminAddView) adminAddView.classList.add('hidden');
      if (modalAdminTitle) modalAdminTitle.textContent = '管理者驗證';
      if (modalAdminSubtitle) modalAdminSubtitle.classList.add('hidden');
      openModal(modalAdmin);
      if (adminPassword) setTimeout(function () { adminPassword.focus(); }, 100);
    });

    if (adminPassword) adminPassword.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (adminVerifyBtn) adminVerifyBtn.click();
      }
    });
    if (adminVerifyBtn) adminVerifyBtn.addEventListener('click', function () {
      var pwd = adminPassword ? adminPassword.value.trim() : '';
      if (!pwd) { showAdminMessage('請輸入密碼', true); return; }
      hideAdminMessage();
      fetch(API_BASE + '/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, action: 'verify' })
      })
        .then(function (res) { return res.json().then(function (data) {
          if (res.ok) {
            storedAdminPassword = pwd;
            adminMode = true;
            updateAdminButtonText();
            closeModal(modalAdmin);
            fetchTools();
            fetchWishesCount();
          } else {
            showAdminMessage(data.error || '密碼錯誤', true);
          }
        }); })
        .catch(function (err) {
          showAdminMessage('無法連線：' + (err.message || '請稍後再試'), true);
        });
    });

    if (closeAdmin) closeAdmin.addEventListener('click', function () {
      if (adminAddView && !adminAddView.classList.contains('hidden')) {
        adminAddView.classList.add('hidden');
        if (adminVerifyView) adminVerifyView.classList.remove('hidden');
        if (modalAdminTitle) modalAdminTitle.textContent = '管理者驗證';
        if (modalAdminSubtitle) modalAdminSubtitle.classList.add('hidden');
      }
      closeModal(modalAdmin);
    });

    if (submitTool) submitTool.addEventListener('click', function () {
      var password = adminMode ? storedAdminPassword : (adminPassword ? adminPassword.value.trim() : '');
      var name = toolName ? toolName.value.trim() : '';
      var url = toolUrl ? toolUrl.value.trim() : '';
      if (!password) {
        if (adminMessageAdd) { adminMessageAdd.textContent = '請輸入管理者密碼'; adminMessageAdd.classList.remove('hidden', 'success'); adminMessageAdd.classList.add('error'); }
        return;
      }
      if (!name || !url) {
        if (adminMessageAdd) { adminMessageAdd.textContent = '請填寫工具名稱與網址'; adminMessageAdd.classList.remove('hidden', 'success'); adminMessageAdd.classList.add('error'); }
        return;
      }
      if (adminMessageAdd) adminMessageAdd.classList.add('hidden');
      var isEdit = !!editingToolId;
      var body = {
        password: password,
        tool: {
          name: name,
          url: url,
          description: toolDescription ? toolDescription.value.trim() : '',
          cardColor: (toolCardColor && toolCardColor.value.trim()) ? toolCardColor.value.trim() : '',
          icon: (uploadedIconDataUrl || (toolIcon && toolIcon.value.trim()) || '').trim(),
          type: (toolType && toolType.value === 'plugin') ? 'plugin' : 'link'
        }
      };
      if (isEdit) {
        body.action = 'update';
        body.id = editingToolId;
      }
      fetch(API_BASE + '/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (res) { return res.json().then(function (data) {
          if (res.ok) {
            if (adminMessageAdd) { adminMessageAdd.textContent = isEdit ? '已儲存！' : '新增成功！'; adminMessageAdd.classList.remove('hidden', 'error'); adminMessageAdd.classList.add('success'); }
            editingToolId = '';
            if (toolName) toolName.value = '';
            if (toolUrl) toolUrl.value = '';
            if (toolDescription) toolDescription.value = '';
            uploadedIconDataUrl = '';
            if (toolCardColor) toolCardColor.value = '';
            if (toolIcon) toolIcon.value = '';
            if (toolIconFile) toolIconFile.value = '';
            if (toolIconPreview) toolIconPreview.classList.add('hidden');
            if (toolIconPreviewImg) toolIconPreviewImg.src = '';
            fetchTools();
            closeModal(modalAdmin);
          } else {
            if (adminMessageAdd) { adminMessageAdd.textContent = data.error || (isEdit ? '儲存失敗' : '新增失敗'); adminMessageAdd.classList.remove('hidden', 'success'); adminMessageAdd.classList.add('error'); }
          }
        }); })
        .catch(function (err) {
          if (adminMessageAdd) { adminMessageAdd.textContent = '無法連線後端：' + (err.message || '請確認伺服器已啟動'); adminMessageAdd.classList.remove('hidden', 'success'); adminMessageAdd.classList.add('error'); }
        });
    });

    modalAdmin.addEventListener('click', function (e) {
      if (e.target === modalAdmin) closeModal(modalAdmin);
    });

    function fetchWishesCount() {
      fetch(API_BASE + '/api/wishes')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var n = data.pendingCount || 0;
          if (wishPoolBadge) {
            wishPoolBadge.textContent = n;
            wishPoolBadge.classList.toggle('hidden', n === 0);
          }
        })
        .catch(function () {});
    }

    function openWishPanel() {
      if (!wishPoolPanel) return;
      wishPoolPanel.classList.remove('hidden');
      if (adminMode && storedAdminPassword) {
        if (wishPoolSubmitView) wishPoolSubmitView.classList.add('hidden');
        if (wishPoolAdminView) wishPoolAdminView.classList.remove('hidden');
        fetch(API_BASE + '/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: storedAdminPassword, action: 'list' })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (wishPoolCount) wishPoolCount.textContent = (data.list && data.list.length) || 0;
            renderWishList(data.list || []);
          })
          .catch(function () { if (wishPoolList) wishPoolList.innerHTML = '<p class="wish-pool-empty">無法載入</p>'; });
      } else {
        if (wishPoolAdminView) wishPoolAdminView.classList.add('hidden');
        if (wishPoolSubmitView) wishPoolSubmitView.classList.remove('hidden');
        if (wishPoolContent) wishPoolContent.value = '';
        if (wishPoolMsg) { wishPoolMsg.textContent = ''; wishPoolMsg.classList.add('hidden'); }
      }
    }

    function closeWishPanel() {
      if (wishPoolPanel) wishPoolPanel.classList.add('hidden');
    }

    function renderWishList(list) {
      if (!wishPoolList) return;
      wishPoolList.innerHTML = '';
      if (!list || list.length === 0) {
        wishPoolList.innerHTML = '<p class="wish-pool-empty">尚無許願</p>';
        return;
      }
      list.forEach(function (w) {
        var row = document.createElement('div');
        row.className = 'wish-pool-item';
        var statusLabel = { pending: '待處理', processing: '處理中', done: '已完成' }[w.status] || w.status;
        row.innerHTML =
          '<p class="wish-pool-item-content">' + escapeHtml(w.content) + '</p>' +
          '<div class="wish-pool-item-meta">' +
          '<select class="wish-pool-status" data-wish-id="' + escapeHtml(w.id) + '">' +
          '<option value="pending"' + (w.status === 'pending' ? ' selected' : '') + '>待處理</option>' +
          '<option value="processing"' + (w.status === 'processing' ? ' selected' : '') + '>處理中</option>' +
          '<option value="done"' + (w.status === 'done' ? ' selected' : '') + '>已完成</option>' +
          '</select>' +
          '</div>';
        wishPoolList.appendChild(row);
        var sel = row.querySelector('.wish-pool-status');
        if (sel) sel.addEventListener('change', function () {
          var id = sel.getAttribute('data-wish-id');
          var status = sel.value;
          fetch(API_BASE + '/api/wishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: storedAdminPassword, action: 'updateStatus', id: id, status: status })
          })
            .then(function (res) { return res.json(); })
            .then(function () { fetchWishesCount(); });
        });
      });
    }

    if (wishPoolWidget) wishPoolWidget.addEventListener('click', function () {
      if (wishPoolPanel && wishPoolPanel.classList.contains('hidden')) openWishPanel();
      else closeWishPanel();
    });
    if (wishPoolClose) wishPoolClose.addEventListener('click', closeWishPanel);
    if (wishPoolSubmit && wishPoolContent) wishPoolSubmit.addEventListener('click', function () {
      var content = wishPoolContent.value.trim();
      if (!content) {
        if (wishPoolMsg) { wishPoolMsg.textContent = '請輸入內容'; wishPoolMsg.classList.remove('hidden'); wishPoolMsg.classList.add('error'); }
        return;
      }
      if (wishPoolMsg) wishPoolMsg.classList.add('hidden');
      fetch(API_BASE + '/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.id) {
            if (wishPoolMsg) { wishPoolMsg.textContent = '已送出，謝謝你的許願～'; wishPoolMsg.classList.remove('hidden', 'error'); wishPoolMsg.classList.add('success'); }
            wishPoolContent.value = '';
          } else if (data.error && wishPoolMsg) {
            wishPoolMsg.textContent = data.error;
            wishPoolMsg.classList.remove('hidden', 'success');
            wishPoolMsg.classList.add('error');
          }
        })
        .catch(function () {
          if (wishPoolMsg) { wishPoolMsg.textContent = '無法送出，請稍後再試'; wishPoolMsg.classList.remove('hidden', 'success'); wishPoolMsg.classList.add('error'); }
        });
    });

    loadTheme();
    fetchTools();
    fetchWishesCount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
