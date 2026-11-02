/* ============================================================
   Attia Web Solutions — admin portal behaviour
   Demo authentication, dashboard navigation, mock CRUD
   ============================================================ */
(function () {
  "use strict";

  var I18N = window.AttiaI18n;

  function t(key) { return I18N ? I18N.t(key) : key; }
  function pick(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    var lang = I18N ? I18N.lang() : "ar";
    return obj[lang] != null ? obj[lang] : obj.ar;
  }
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }
  function initials(name) {
    return String(name).trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join("");
  }

  /* ============================================================
     MOCK DATA (بطاقة "بيانات تجريبية" في الواجهة)
     ============================================================ */
  var messages = [
    {
      id: 1,
      name: { ar: "سفيان بلقاسم", fr: "Sofiane Belkacem" },
      email: "s.belkacem@gmail.com",
      subject: { ar: "طلب عرض سعر لنظام إدارة مكتب محاسبة", fr: "Devis pour un logiciel de comptabilité" },
      date: "2026-10-31",
      status: "new"
    },
    {
      id: 2,
      name: { ar: "نور الهدى شريف", fr: "Nour El Houda Cherif" },
      email: "n.cherif@outlook.com",
      subject: { ar: "تصميم موقع لصالون تجميل", fr: "Site vitrine pour un institut de beauté" },
      date: "2026-10-30",
      status: "new"
    },
    {
      id: 3,
      name: { ar: "كريم حاج علي", fr: "Karim Hadj Ali" },
      email: "k.hadjali@gmail.com",
      subject: { ar: "استفسار عن دعم تطبيق ديوان", fr: "Question sur le support Diwan" },
      date: "2026-10-29",
      status: "new"
    },
    {
      id: 4,
      name: { ar: "ليلى بن عمر", fr: "Leila Ben Amor" },
      email: "leila.benamor@gmail.com",
      subject: { ar: "ربط متجر إلكتروني بوسائل الدفع", fr: "Paiement en ligne pour une boutique" },
      date: "2026-10-27",
      status: "read"
    },
    {
      id: 5,
      name: { ar: "يوسف مباركي", fr: "Youcef Mebarki" },
      email: "y.mebarki@attia.dz",
      subject: { ar: "صيانة موقع شركة عقارية", fr: "Maintenance d'un site immobilier" },
      date: "2026-10-24",
      status: "replied"
    }
  ];

  var team = [
    { id: 1, name: { ar: "عبد الرحمن عطية", fr: "Abderrahmane Attia" }, role: "manager", email: "attiawebsite@gmail.com", active: true },
    { id: 2, name: { ar: "ياسين بوعلام", fr: "Yacine Boualem" }, role: "dev", email: "y.boualem@attia.dz", active: true },
    { id: 3, name: { ar: "سارة مزيان", fr: "Sara Meziane" }, role: "marketing", email: "s.meziane@attia.dz", active: true },
    { id: 4, name: { ar: "أمين حمداني", fr: "Amine Hamdani" }, role: "design", email: "a.hamdani@attia.dz", active: false }
  ];

  var projects = [
    {
      id: 1,
      title: { ar: "ديوان — نظام إدارة مكاتب المحاماة", fr: "Diwan — Gestion de cabinets d'avocats" },
      category: { ar: "برمجيات", fr: "Logiciel" },
      desc: { ar: "قضايا، موكلون، جلسات، آجال وأتعاب في منصّة واحدة.", fr: "Dossiers, clients, audiences, délais et honoraires réunis." }
    },
    {
      id: 2,
      title: { ar: "متجر أثاث إلكتروني", fr: "Boutique de mobilier en ligne" },
      category: { ar: "تجارة إلكترونية", fr: "E-commerce" },
      desc: { ar: "كتالوج متجاوب مع سلة وطلب عبر واتساب.", fr: "Catalogue responsive, panier et commande par WhatsApp." }
    },
    {
      id: 3,
      title: { ar: "موقع وكالة عقارية", fr: "Site d'une agence immobilière" },
      category: { ar: "موقع تعريفي", fr: "Site vitrine" },
      desc: { ar: "بحث عن العقارات مع خرائط ونماذج اتصال.", fr: "Recherche de biens avec cartes et formulaires de contact." }
    }
  ];

  var visits = [420, 510, 480, 690, 760, 830, 700];
  var inquiries = [12, 18, 9, 22, 26, 31, 19];

  /* ============================================================
     ELEMENTS
     ============================================================ */
  var loginView = document.getElementById("loginView");
  var loginForm = document.getElementById("loginForm");
  var loginEmail = document.getElementById("loginEmail");
  var loginPassword = document.getElementById("loginPassword");
  var loginError = document.getElementById("loginError");
  var pwToggle = document.getElementById("pwToggle");
  var demoBtn = document.getElementById("demoBtn");
  var shell = document.getElementById("adminShell");
  var sidebar = document.getElementById("sidebar");
  var sidebarBackdrop = document.getElementById("sidebarBackdrop");
  var sideToggle = document.getElementById("sideToggle");
  var search = document.getElementById("globalSearch");
  var logoutBtn = document.getElementById("logoutBtn");
  var langToggle = document.getElementById("langToggle");

  var chartBars = document.getElementById("chartBars");
  var recentMessages = document.getElementById("recentMessages");
  var msgBody = document.getElementById("msgBody");
  var msgCount = document.getElementById("msgCount");
  var msgNewCount = document.getElementById("msgNewCount");
  var teamBody = document.getElementById("teamBody");
  var projGrid = document.getElementById("projGrid");
  var kpiTeam = document.getElementById("kpiTeam");
  var kpiProjects = document.getElementById("kpiProjects");
  var toastStack = document.getElementById("toastStack");

  var modal = document.getElementById("modal");
  var modalTitle = document.getElementById("modalTitle");
  var modalBody = document.getElementById("modalBody");
  var modalForm = document.getElementById("modalForm");
  var modalClose = document.getElementById("modalClose");
  var modalCancel = document.getElementById("modalCancel");

  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var sideLinks = Array.prototype.slice.call(document.querySelectorAll(".side-link[data-view]"));
  var modalMode = null;
  var editingId = null;
  var lastFocused = null;

  var ICON = {
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2.5h6.5A2.5 2.5 0 0 1 21 10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'
  };

  /* ============================================================
     RENDER
     ============================================================ */
  function matchesQuery(text) {
    var q = (search && search.value || "").trim().toLowerCase();
    if (!q) return true;
    return String(text).toLowerCase().indexOf(q) !== -1;
  }

  function renderChart() {
    if (!chartBars) return;
    var maxV = Math.max.apply(null, visits);
    var maxQ = Math.max.apply(null, inquiries);
    chartBars.innerHTML = visits.map(function (value, i) {
      var vh = Math.max(6, Math.round((value / maxV) * 100));
      var qh = Math.max(4, Math.round((inquiries[i] / maxQ) * 26));
      return '<div class="chart-col">' +
        '<div class="bar-pair">' +
          '<span class="bar bar-v" style="height:' + vh + '%" title="' + esc(t("admin.chart.visits")) + ': ' + value + '"></span>' +
          '<span class="bar bar-q" style="height:' + qh + '%" title="' + esc(t("admin.chart.inquiries")) + ': ' + inquiries[i] + '"></span>' +
        '</div>' +
        '<small>' + esc(t("admin.day" + (i + 1))) + '</small>' +
      '</div>';
    }).join("");
  }

  function statusBadge(status) {
    var label = status === "new" ? t("admin.msg.new") : status === "read" ? t("admin.msg.read") : t("admin.msg.replied");
    return '<span class="badge ' + status + '">' + esc(label) + '</span>';
  }

  function renderRecent() {
    if (!recentMessages) return;
    var rows = messages.slice(0, 4);
    recentMessages.innerHTML = rows.map(function (m) {
      return '<div class="mini-item">' +
        '<span class="avatar" aria-hidden="true">' + esc(initials(pick(m.name))) + '</span>' +
        '<div style="min-width:0">' +
          '<b>' + esc(pick(m.name)) + '</b>' +
          '<small>' + esc(pick(m.subject)) + '</small>' +
        '</div>' +
        statusBadge(m.status) +
      '</div>';
    }).join("");
  }

  function renderMessages() {
    if (!msgBody) return;
    var rows = messages.filter(function (m) {
      return matchesQuery(pick(m.name) + " " + m.email + " " + pick(m.subject));
    });

    msgBody.innerHTML = rows.length ? rows.map(function (m) {
      return '<tr>' +
        '<td><div class="cell-user"><span class="avatar" aria-hidden="true">' + esc(initials(pick(m.name))) + '</span>' +
          '<div><b>' + esc(pick(m.name)) + '</b><small dir="ltr">' + esc(m.email) + '</small></div></div></td>' +
        '<td>' + esc(pick(m.subject)) + '</td>' +
        '<td class="date-cell">' + esc(m.date) + '</td>' +
        '<td>' + statusBadge(m.status) + '</td>' +
        '<td><div class="row-actions">' +
          (m.status === "new"
            ? '<button type="button" class="icon-btn sm" data-action="read" data-id="' + m.id + '" title="' + esc(t("admin.msg.markRead")) + '" aria-label="' + esc(t("admin.msg.markRead")) + '">' + ICON.check + '</button>'
            : '') +
          '<button type="button" class="icon-btn sm danger" data-action="delete-message" data-id="' + m.id + '" title="' + esc(t("admin.msg.delete")) + '" aria-label="' + esc(t("admin.msg.delete")) + '">' + ICON.trash + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join("") : '<tr class="empty-row"><td colspan="5">' + esc(t("admin.msg.empty")) + '</td></tr>';

    var unread = messages.filter(function (m) { return m.status === "new"; }).length;
    if (msgCount) msgCount.textContent = String(unread);
    if (msgNewCount) msgNewCount.textContent = String(unread);
  }

  function renderTeam() {
    if (!teamBody) return;
    var rows = team.filter(function (m) {
      return matchesQuery(pick(m.name) + " " + m.email + " " + t("admin.role." + m.role));
    });

    teamBody.innerHTML = rows.length ? rows.map(function (m) {
      return '<tr>' +
        '<td><div class="cell-user"><span class="avatar' + (m.role === "manager" ? " gold" : "") + '" aria-hidden="true">' + esc(initials(pick(m.name))) + '</span>' +
          '<div><b>' + esc(pick(m.name)) + '</b><small>' + esc(t("admin.role." + m.role)) + '</small></div></div></td>' +
        '<td>' + esc(t("admin.role." + m.role)) + '</td>' +
        '<td><a class="mail-link" href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a></td>' +
        '<td><span class="badge ' + (m.active ? "active" : "away") + '">' + esc(t(m.active ? "admin.team.active" : "admin.team.away")) + '</span></td>' +
        '<td><div class="row-actions">' +
          '<button type="button" class="icon-btn sm" data-action="edit-member" data-id="' + m.id + '" title="' + esc(t("admin.team.edit")) + '" aria-label="' + esc(t("admin.team.edit")) + '">' + ICON.pencil + '</button>' +
          '<button type="button" class="icon-btn sm danger" data-action="delete-member" data-id="' + m.id + '" title="' + esc(t("admin.team.delete")) + '" aria-label="' + esc(t("admin.team.delete")) + '">' + ICON.trash + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join("") : '<tr class="empty-row"><td colspan="5">—</td></tr>';

    if (kpiTeam) kpiTeam.textContent = String(team.length);
  }

  function renderProjects() {
    if (!projGrid) return;
    var list = projects.filter(function (p) {
      return matchesQuery(pick(p.title) + " " + pick(p.category) + " " + pick(p.desc));
    });

    projGrid.innerHTML = list.map(function (p) {
      return '<article class="proj-card">' +
        '<div class="proj-thumb" aria-hidden="true">' + ICON.folder + '</div>' +
        '<span class="proj-cat">' + esc(pick(p.category)) + (p.isNew ? ' · <span class="proj-new">' + esc(t("admin.proj.tag")) + '</span>' : '') + '</span>' +
        '<h3>' + esc(pick(p.title)) + '</h3>' +
        '<p>' + esc(pick(p.desc)) + '</p>' +
      '</article>';
    }).join("");

    if (kpiProjects) kpiProjects.textContent = String(20 + projects.length);
  }

  function renderAll() {
    renderChart();
    renderRecent();
    renderMessages();
    renderTeam();
    renderProjects();
  }

  /* ============================================================
     VIEWS + SIDEBAR
     ============================================================ */
  function showView(name) {
    views.forEach(function (view) {
      view.hidden = view.id !== "view-" + name;
    });
    sideLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("data-view") === name);
    });
    closeSidebar();
  }

  function openSidebar() {
    if (sidebar) sidebar.classList.add("is-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("is-open");
    if (sideToggle) sideToggle.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("is-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("is-open");
    if (sideToggle) sideToggle.setAttribute("aria-expanded", "false");
  }

  sideLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      showView(link.getAttribute("data-view"));
    });
  });

  Array.prototype.slice.call(document.querySelectorAll("[data-goto]")).forEach(function (btn) {
    btn.addEventListener("click", function () { showView(btn.getAttribute("data-goto")); });
  });

  if (sideToggle) {
    sideToggle.addEventListener("click", function () {
      if (sidebar && sidebar.classList.contains("is-open")) closeSidebar();
      else openSidebar();
    });
  }
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);

  if (search) {
    search.addEventListener("input", function () {
      renderMessages();
      renderTeam();
      renderProjects();
    });
  }

  /* ============================================================
     LOGIN (simulated — no real authentication yet)
     ============================================================ */
  function toast(key) {
    if (!toastStack) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = ICON.check + "<span>" + esc(t(key)) + "</span>";
    toastStack.appendChild(el);
    window.setTimeout(function () {
      el.classList.add("is-out");
      window.setTimeout(function () { el.remove(); }, 320);
    }, 3200);
  }

  function showError(message) {
    if (!loginError) return;
    loginError.textContent = message;
    loginError.classList.add("show");
  }

  function hideError() {
    if (loginError) loginError.classList.remove("show");
  }

  function enterDashboard() {
    hideError();
    if (loginView) loginView.hidden = true;
    if (shell) shell.hidden = false;
    document.body.classList.remove("is-locked");
    renderAll();
    showView("overview");
    toast("admin.toast.login");
  }

  function attemptLogin() {
    var email = (loginEmail.value || "").trim();
    var password = loginPassword.value || "";
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    if (!validEmail || password.length < 6) {
      showError(t("admin.login.error"));
      (!validEmail ? loginEmail : loginPassword).focus();
      return;
    }
    enterDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      attemptLogin();
    });
  }

  if (demoBtn) {
    demoBtn.addEventListener("click", function () {
      loginEmail.value = "admin@attia.dz";
      loginPassword.value = "demo1234";
      attemptLogin();
    });
  }

  if (pwToggle) {
    pwToggle.addEventListener("click", function () {
      var showing = loginPassword.getAttribute("type") === "text";
      loginPassword.setAttribute("type", showing ? "password" : "text");
      pwToggle.setAttribute("aria-label", showing ? "عرض كلمة المرور" : "إخفاء كلمة المرور");
      loginPassword.focus();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (shell) shell.hidden = true;
      if (loginView) loginView.hidden = false;
      if (loginPassword) loginPassword.value = "";
      closeModal();
      toast("admin.toast.logout");
    });
  }

  /* ============================================================
     MODAL
     ============================================================ */
  var ROLE_OPTIONS = ["manager", "dev", "marketing", "design"];

  function openModal(mode, id) {
    modalMode = mode;
    editingId = id == null ? null : id;
    lastFocused = document.activeElement;
    if (!modal || !modalBody) return;

    if (mode === "project-add") {
      modalTitle.textContent = t("admin.modal.projectAdd");
      modalBody.innerHTML =
        '<div class="field"><label for="pTitle">' + esc(t("admin.field.title")) + '</label>' +
          '<input type="text" id="pTitle" name="title" required placeholder="' + esc(t("admin.field.title")) + '" /></div>' +
        '<div class="field"><label for="pCategory">' + esc(t("admin.field.category")) + '</label>' +
          '<input type="text" id="pCategory" name="category" placeholder="' + esc(t("admin.field.category")) + '" /></div>' +
        '<div class="field"><label for="pDesc">' + esc(t("admin.field.desc")) + '</label>' +
          '<textarea id="pDesc" name="desc" placeholder="' + esc(t("admin.field.desc")) + '"></textarea></div>';
    } else {
      var member = mode === "member-edit" ? team.filter(function (m) { return m.id === id; })[0] : null;
      modalTitle.textContent = t(member ? "admin.modal.teamEdit" : "admin.modal.teamAdd");
      modalBody.innerHTML =
        '<div class="field"><label for="mName">' + esc(t("admin.field.name")) + '</label>' +
          '<input type="text" id="mName" name="name" required value="' + esc(member ? pick(member.name) : "") + '" /></div>' +
        '<div class="field"><label for="mEmail">' + esc(t("admin.field.email")) + '</label>' +
          '<input type="email" id="mEmail" name="email" dir="ltr" value="' + esc(member ? member.email : "") + '" /></div>' +
        '<div class="field"><label for="mRole">' + esc(t("admin.field.role")) + '</label>' +
          '<select id="mRole" name="role">' +
            ROLE_OPTIONS.map(function (role) {
              var selected = member && member.role === role ? " selected" : "";
              return '<option value="' + role + '"' + selected + '>' + esc(t("admin.role." + role)) + '</option>';
            }).join("") +
          '</select></div>';
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    var first = modalBody.querySelector("input, textarea, select");
    if (first) first.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    modalMode = null;
    editingId = null;
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCancel) modalCancel.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (modal && modal.classList.contains("is-open") && event.key === "Escape") closeModal();
  });

  if (modalForm) {
    modalForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!modalBody) return;

      if (modalMode === "project-add") {
        var titleInput = modalBody.querySelector("#pTitle");
        var categoryInput = modalBody.querySelector("#pCategory");
        var descInput = modalBody.querySelector("#pDesc");
        if (!titleInput || !titleInput.value.trim()) { titleInput.focus(); return; }
        projects.unshift({
          id: Date.now(),
          title: { ar: titleInput.value.trim(), fr: titleInput.value.trim() },
          category: {
            ar: (categoryInput.value || "").trim() || "مشروع",
            fr: (categoryInput.value || "").trim() || "Projet"
          },
          desc: { ar: (descInput.value || "").trim(), fr: (descInput.value || "").trim() },
          isNew: true
        });
        renderProjects();
        closeModal();
        toast("admin.toast.project");
        return;
      }

      var nameInput = modalBody.querySelector("#mName");
      var emailInput = modalBody.querySelector("#mEmail");
      var roleInput = modalBody.querySelector("#mRole");
      if (!nameInput || !nameInput.value.trim()) { nameInput.focus(); return; }

      if (modalMode === "member-edit" && editingId != null) {
        team.forEach(function (m) {
          if (m.id !== editingId) return;
          m.name = { ar: nameInput.value.trim(), fr: nameInput.value.trim() };
          m.email = (emailInput.value || "").trim();
          m.role = roleInput.value;
        });
        renderTeam();
        closeModal();
        toast("admin.toast.updated");
      } else {
        team.push({
          id: Date.now(),
          name: { ar: nameInput.value.trim(), fr: nameInput.value.trim() },
          email: (emailInput.value || "").trim(),
          role: roleInput.value,
          active: true
        });
        renderTeam();
        closeModal();
        toast("admin.toast.member");
      }
    });
  }

  var addMemberBtn = document.getElementById("addMemberBtn");
  var addProjectBtn = document.getElementById("addProjectBtn");
  if (addMemberBtn) addMemberBtn.addEventListener("click", function () { openModal("member-add"); });
  if (addProjectBtn) addProjectBtn.addEventListener("click", function () { openModal("project-add"); });

  /* row actions (delegated) */
  if (msgBody) {
    msgBody.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action]");
      if (!btn) return;
      var id = Number(btn.getAttribute("data-id"));
      var action = btn.getAttribute("data-action");

      if (action === "read") {
        messages.forEach(function (m) { if (m.id === id) m.status = "read"; });
        renderMessages();
        renderRecent();
        toast("admin.toast.read");
      } else if (action === "delete-message") {
        if (!window.confirm(t("admin.confirm.delete"))) return;
        messages = messages.filter(function (m) { return m.id !== id; });
        renderMessages();
        renderRecent();
        toast("admin.toast.deleted");
      }
    });
  }

  if (teamBody) {
    teamBody.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action]");
      if (!btn) return;
      var id = Number(btn.getAttribute("data-id"));
      var action = btn.getAttribute("data-action");

      if (action === "edit-member") {
        openModal("member-edit", id);
      } else if (action === "delete-member") {
        if (!window.confirm(t("admin.confirm.delete"))) return;
        team = team.filter(function (m) { return m.id !== id; });
        renderTeam();
        renderMessages();
        toast("admin.toast.deleted");
      }
    });
  }

  /* ============================================================
     LANGUAGE
     ============================================================ */
  if (I18N) I18N.init();
  if (langToggle) {
    langToggle.addEventListener("click", function () {
      if (I18N) I18N.toggle();
    });
  }
  document.addEventListener("attia:lang", function () {
    if (shell && !shell.hidden) renderAll();
  });

  /* first paint of the dashboard data (hidden until login) */
  renderAll();
})();
