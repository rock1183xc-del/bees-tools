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
    const toolIcon = document.getElementById('toolIcon');
    const submitTool = document.getElementById('submitTool');
    const adminMessage = document.getElementById('adminMessage');
    const adminMessageAdd = document.getElementById('adminMessageAdd');
    const adminVerifyView = document.getElementById('adminVerifyView');
    const adminAddView = document.getElementById('adminAddView');
    const adminVerifyBtn = document.getElementById('adminVerifyBtn');
    const modalAdminTitle = document.getElementById('modalAdminTitle');
    const modalAdminSubtitle = document.getElementById('modalAdminSubtitle');

    if (!cardsContainer || !btnSettings || !btnAdmin || !modalSettings || !modalAdmin) return;

    var currentTools = [];
    var adminMode = false;
    var storedAdminPassword = '';

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

    function applyTheme(theme) {
      if (!theme) return;
      var root = document.documentElement;
      if (theme.primaryColor) {
        root.style.setProperty('--primary', theme.primaryColor);
        root.style.setProperty('--primary-hover', theme.primaryColorHover || theme.primaryColor);
      }
      if (theme.buttonColor) {
        root.style.setProperty('--button-color', theme.buttonColor);
        root.style.setProperty('--button-color-hover', theme.buttonColorHover || theme.buttonColor);
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
    }

    function loadTheme() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var theme = raw ? JSON.parse(raw) : null;
        applyTheme(theme);
        if (theme && inputPrimaryColor) inputPrimaryColor.value = theme.primaryColor || '#e6a700';
        if (theme && inputButtonColor) inputButtonColor.value = theme.buttonColor || '#e6a700';
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
        buttonColor: inputButtonColor ? inputButtonColor.value : '#e6a700',
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

    function getCardIconUrl(tool) {
      if (tool.icon && String(tool.icon).trim()) return String(tool.icon).trim();
      return getFaviconUrl(tool.url);
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
            '<a class="card' + (isPlugin ? ' card--plugin' : '') + '" href="' + escapeHtml(tool.url) + '" target="_blank" rel="noopener noreferrer"' + (isPlugin ? ' download' : '') + '>' + cardInner + '</a>';
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
          cardsContainer.appendChild(wrap);
        } else {
          var a = document.createElement('a');
          a.className = 'card' + (isPlugin ? ' card--plugin' : '');
          a.href = tool.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          if (isPlugin) a.setAttribute('download', '');
          a.innerHTML = cardInner;
          cardsContainer.appendChild(a);
        }
      });

      if (isAdmin) {
        var addCard = document.createElement('button');
        addCard.type = 'button';
        addCard.className = 'card card-add';
        addCard.setAttribute('aria-label', '新增工具');
        addCard.innerHTML = '<span class="card-add-icon">+</span>';
        addCard.addEventListener('click', function () {
          if (toolName) toolName.value = '';
          if (toolUrl) toolUrl.value = '';
          if (toolDescription) toolDescription.value = '';
          if (toolIcon) toolIcon.value = '';
          if (toolType) toolType.value = 'link';
          updateToolTypeHint();
          if (adminMessageAdd) { adminMessageAdd.textContent = ''; adminMessageAdd.classList.add('hidden'); }
          if (adminVerifyView) adminVerifyView.classList.add('hidden');
          if (adminAddView) { adminAddView.classList.remove('hidden'); }
          if (modalAdminTitle) modalAdminTitle.textContent = '新增工具';
          if (modalAdminSubtitle) modalAdminSubtitle.classList.remove('hidden');
          openModal(modalAdmin);
        });
        cardsContainer.appendChild(addCard);
      }
    }

    function updateAdminButtonText() {
      if (btnAdmin) btnAdmin.textContent = adminMode ? '結束管理' : '管理者';
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
      fetch(API_BASE + '/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password,
          tool: {
            name: name,
            url: url,
            description: toolDescription ? toolDescription.value.trim() : '',
            icon: toolIcon ? toolIcon.value.trim() : '',
            type: (toolType && toolType.value === 'plugin') ? 'plugin' : 'link'
          }
        })
      })
        .then(function (res) { return res.json().then(function (data) {
          if (res.ok) {
            if (adminMessageAdd) { adminMessageAdd.textContent = '新增成功！'; adminMessageAdd.classList.remove('hidden', 'error'); adminMessageAdd.classList.add('success'); }
            if (toolName) toolName.value = '';
            if (toolUrl) toolUrl.value = '';
            if (toolDescription) toolDescription.value = '';
            if (toolIcon) toolIcon.value = '';
            fetchTools();
          } else {
            if (adminMessageAdd) { adminMessageAdd.textContent = data.error || '新增失敗'; adminMessageAdd.classList.remove('hidden', 'success'); adminMessageAdd.classList.add('error'); }
          }
        }); })
        .catch(function (err) {
          if (adminMessageAdd) { adminMessageAdd.textContent = '無法連線後端：' + (err.message || '請確認伺服器已啟動'); adminMessageAdd.classList.remove('hidden', 'success'); adminMessageAdd.classList.add('error'); }
        });
    });

    modalAdmin.addEventListener('click', function (e) {
      if (e.target === modalAdmin) closeModal(modalAdmin);
    });

    loadTheme();
    fetchTools();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
