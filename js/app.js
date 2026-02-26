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
    const toolIcon = document.getElementById('toolIcon');
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
      var start = theme.bodyGradientStart && theme.bodyGradientStart.trim();
      var end = theme.bodyGradientEnd && theme.bodyGradientEnd.trim();
      if (start && end) {
        root.style.setProperty('--body-pattern', 'linear-gradient(135deg, color-mix(in srgb, ' + start + ' 28%, transparent) 0%, color-mix(in srgb, ' + end + ' 12%, transparent) 100%)');
      } else {
        root.style.setProperty('--body-pattern', 'radial-gradient(ellipse at top, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 55%)');
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
        buttonColor: inputButtonColor ? inputButtonColor.value : '#e6a700',
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
          editingToolId = '';
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
      if (toolIcon) toolIcon.value = tool.icon || '';
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
          icon: toolIcon ? toolIcon.value.trim() : '',
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
            if (toolIcon) toolIcon.value = '';
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
