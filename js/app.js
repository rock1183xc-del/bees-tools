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
    const submitTool = document.getElementById('submitTool');
    const adminMessage = document.getElementById('adminMessage');

    if (!cardsContainer || !btnSettings || !btnAdmin || !modalSettings || !modalAdmin) return;

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
      const root = document.documentElement;
      if (theme.primaryColor) {
        root.style.setProperty('--primary', theme.primaryColor);
        root.style.setProperty('--primary-hover', theme.primaryColorHover || theme.primaryColor);
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
        const raw = localStorage.getItem(STORAGE_KEY);
        const theme = raw ? JSON.parse(raw) : null;
        applyTheme(theme);
        if (theme && inputPrimaryColor) inputPrimaryColor.value = theme.primaryColor || '#e6a700';
        if (theme && inputFontSize) inputFontSize.value = theme.fontSize || 'medium';
        if (theme && inputCardSpacing) inputCardSpacing.value = theme.cardSpacing || 'normal';
        if (theme && inputCardRadius) inputCardRadius.value = theme.cardRadius || 'medium';
      } catch (e) {}
    }

    function saveTheme() {
      const theme = {
        primaryColor: inputPrimaryColor ? inputPrimaryColor.value : '#e6a700',
        fontSize: inputFontSize ? inputFontSize.value : 'medium',
        cardSpacing: inputCardSpacing ? inputCardSpacing.value : 'normal',
        cardRadius: inputCardRadius ? inputCardRadius.value : 'medium'
      };
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

    function renderCards(tools) {
      if (!cardsContainer) return;
      cardsContainer.innerHTML = '';
      if (!tools || tools.length === 0) {
        cardsContainer.innerHTML = '<p class="loading">尚無工具，請由管理者新增。</p>';
        return;
      }
      tools.forEach(function (tool) {
        const isPlugin = tool.type === 'plugin';
        const a = document.createElement('a');
        a.className = 'card' + (isPlugin ? ' card--plugin' : '');
        a.href = tool.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        if (isPlugin) a.setAttribute('download', '');
        a.innerHTML =
          (isPlugin ? '<span class="card-badge">插件</span>' : '') +
          '<div class="card-icon" aria-hidden="true"></div>' +
          '<h3 class="card-title">' + escapeHtml(tool.name) + '</h3>' +
          (tool.description ? '<p class="card-desc">' + escapeHtml(tool.description) + '</p>' : '') +
          (isPlugin ? '<p class="card-action">下載插件</p>' : '');
        cardsContainer.appendChild(a);
      });
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
      fetch(API_BASE + '/api/tools')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          showLoading(false);
          renderCards(Array.isArray(data) ? data : []);
        })
        .catch(function (err) {
          showLoading(false);
          showError('無法載入工具列表，請稍後再試。');
          if (cardsContainer) cardsContainer.innerHTML = '<p class="loading">尚無工具，請由管理者新增。</p>';
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
    modalSettings.addEventListener('click', function (e) {
      if (e.target === modalSettings) closeModal(modalSettings);
    });

    btnAdmin.addEventListener('click', function () {
      if (adminPassword) adminPassword.value = '';
      if (toolName) toolName.value = '';
      if (toolUrl) toolUrl.value = '';
      if (toolDescription) toolDescription.value = '';
      if (toolType) toolType.value = 'link';
      updateToolTypeHint();
      hideAdminMessage();
      openModal(modalAdmin);
    });
    if (closeAdmin) closeAdmin.addEventListener('click', function () { closeModal(modalAdmin); });
    if (submitTool) submitTool.addEventListener('click', function () {
      const password = adminPassword ? adminPassword.value.trim() : '';
      const name = toolName ? toolName.value.trim() : '';
      const url = toolUrl ? toolUrl.value.trim() : '';
      if (!password) { showAdminMessage('請輸入管理者密碼', true); return; }
      if (!name || !url) { showAdminMessage('請填寫工具名稱與網址', true); return; }
      hideAdminMessage();
      fetch(API_BASE + '/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password,
          tool: {
            name: name,
            url: url,
            description: toolDescription ? toolDescription.value.trim() : '',
            icon: '',
            type: (toolType && toolType.value === 'plugin') ? 'plugin' : 'link'
          }
        })
      })
        .then(function (res) { return res.json().then(function (data) {
          if (res.ok) {
            showAdminMessage('新增成功！');
            if (toolName) toolName.value = '';
            if (toolUrl) toolUrl.value = '';
            if (toolDescription) toolDescription.value = '';
            fetchTools();
          } else {
            showAdminMessage(data.error || '新增失敗', true);
          }
        }); })
        .catch(function (err) {
          showAdminMessage('無法連線後端：' + (err.message || '請確認伺服器已啟動'), true);
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
