(function () {
  const API_BASE = '';
  const STORAGE_KEY = 'beeToolsTheme';

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
  const submitTool = document.getElementById('submitTool');
  const adminMessage = document.getElementById('adminMessage');

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
      if (theme) {
        if (theme.primaryColor) inputPrimaryColor.value = theme.primaryColor;
        if (theme.fontSize) inputFontSize.value = theme.fontSize;
        if (theme.cardSpacing) inputCardSpacing.value = theme.cardSpacing;
        if (theme.cardRadius) inputCardRadius.value = theme.cardRadius;
      }
    } catch (e) {}
  }

  function saveTheme() {
    const theme = {
      primaryColor: inputPrimaryColor.value,
      fontSize: inputFontSize.value,
      cardSpacing: inputCardSpacing.value,
      cardRadius: inputCardRadius.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    applyTheme(theme);
  }

  function showLoading(show) {
    loadingEl.classList.toggle('hidden', !show);
  }

  function showError(msg) {
    errorEl.textContent = msg || '';
    errorEl.classList.toggle('hidden', !msg);
  }

  function renderCards(tools) {
    cardsContainer.innerHTML = '';
    if (!tools || tools.length === 0) {
      cardsContainer.innerHTML = '<p class="loading">尚無工具，請由管理者新增。</p>';
      return;
    }
    tools.forEach(function (tool) {
      const a = document.createElement('a');
      a.className = 'card';
      a.href = tool.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML =
        '<div class="card-icon" aria-hidden="true"></div>' +
        '<h3 class="card-title">' + escapeHtml(tool.name) + '</h3>' +
        (tool.description ? '<p class="card-desc">' + escapeHtml(tool.description) + '</p>' : '');
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
    fetch(API_BASE + '/api/tools')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        showLoading(false);
        renderCards(Array.isArray(data) ? data : []);
      })
      .catch(function (err) {
        showLoading(false);
        showError('無法載入工具列表：' + (err.message || '請確認後端已啟動'));
        renderCards([]);
      });
  }

  function openModal(modal) {
    modal.classList.remove('hidden');
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
  }

  function showAdminMessage(text, isError) {
    adminMessage.textContent = text;
    adminMessage.classList.remove('success', 'error');
    adminMessage.classList.add(isError ? 'error' : 'success');
    adminMessage.classList.remove('hidden');
  }

  function hideAdminMessage() {
    adminMessage.classList.add('hidden');
  }

  btnSettings.addEventListener('click', function () {
    openModal(modalSettings);
  });

  closeSettings.addEventListener('click', function () {
    closeModal(modalSettings);
  });

  saveSettings.addEventListener('click', function () {
    saveTheme();
    closeModal(modalSettings);
  });

  modalSettings.addEventListener('click', function (e) {
    if (e.target === modalSettings) closeModal(modalSettings);
  });

  btnAdmin.addEventListener('click', function () {
    adminPassword.value = '';
    toolName.value = '';
    toolUrl.value = '';
    toolDescription.value = '';
    hideAdminMessage();
    openModal(modalAdmin);
  });

  closeAdmin.addEventListener('click', function () {
    closeModal(modalAdmin);
  });

  submitTool.addEventListener('click', function () {
    const password = adminPassword.value.trim();
    const name = toolName.value.trim();
    const url = toolUrl.value.trim();
    if (!password) {
      showAdminMessage('請輸入管理者密碼', true);
      return;
    }
    if (!name || !url) {
      showAdminMessage('請填寫工具名稱與網址', true);
      return;
    }
    hideAdminMessage();
    fetch(API_BASE + '/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: password,
        tool: {
          name: name,
          url: url,
          description: toolDescription.value.trim(),
          icon: ''
        }
      })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            showAdminMessage('新增成功！');
            toolName.value = '';
            toolUrl.value = '';
            toolDescription.value = '';
            fetchTools();
          } else {
            showAdminMessage(data.error || '新增失敗', true);
          }
        });
      })
      .catch(function (err) {
        showAdminMessage('無法連線後端：' + (err.message || '請確認伺服器已啟動'), true);
      });
  });

  modalAdmin.addEventListener('click', function (e) {
    if (e.target === modalAdmin) closeModal(modalAdmin);
  });

  loadTheme();
  fetchTools();
})();
