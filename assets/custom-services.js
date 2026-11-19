/* Project brief: validation, provider submission and an optional WhatsApp draft. */
(function () {
  "use strict";
  var form = document.getElementById("briefForm");
  if (!form) return;
  var button = document.getElementById("briefSubmit");
  var whatsapp = document.getElementById("briefWhatsApp");
  var status = document.getElementById("briefStatus");
  whatsapp.hidden = false;
  var phone = document.getElementById("brief-phone");
  var name = document.getElementById("brief-name");

  // One-shot per-tab draft only when navigating between the two language pages.
  // Do not place form contents in the URL or retain them after restoration.
  var draftKey = "attia-custom-language-draft";
  var languageLink = document.getElementById("langToggle");
  try {
    var draft = sessionStorage.getItem(draftKey);
    if (draft) {
      sessionStorage.removeItem(draftKey);
      JSON.parse(draft).forEach(function (saved) {
        Array.prototype.forEach.call(form.elements, function (field) {
          if (field.name !== saved.name || field.type !== saved.type) return;
          if (field.type === "radio" || field.type === "checkbox") {
            if (field.value === saved.value) field.checked = saved.checked;
          } else field.value = saved.value;
        });
      });
    }
  } catch (error) { /* Storage may be blocked; the form remains usable. */ }
  if (languageLink) languageLink.addEventListener("click", function () {
    try {
      var fields = Array.prototype.filter.call(form.elements, function (field) {
        return field.name && field.name !== "_gotcha" && field.type !== "hidden" && field.type !== "submit" && field.type !== "button";
      }).map(function (field) {
        return { name: field.name, type: field.type, value: field.value, checked: field.checked };
      });
      sessionStorage.setItem(draftKey, JSON.stringify(fields));
    } catch (error) { /* Navigation still works when storage is unavailable. */ }
  });

  // Enhance only the brief's single-select controls. The original select remains
  // the form's source of truth and is usable if JavaScript is unavailable.
  var pickers = [];
  var openPicker = null;
  Array.prototype.forEach.call(form.querySelectorAll("select"), function (select) {
    if (select.multiple || select.size > 1) return;
    var label = form.querySelector('label[for="' + select.id + '"]');
    if (!label) return;
    var trigger = document.createElement("button");
    var value = document.createElement("span");
    var arrow = document.createElement("span");
    var list = document.createElement("div");
    var error = document.createElement("span");
    var labelId = select.id + "-label";
    var valueId = select.id + "-value";
    var listId = select.id + "-listbox";
    var errorId = select.id + "-error";
    var active = 0;
    var isOpen = false;
    var search = "";
    var searchTimer;

    label.id = label.id || labelId;
    value.id = valueId;
    value.className = "brief-select-value";
    arrow.className = "brief-select-arrow";
    arrow.setAttribute("aria-hidden", "true");
    trigger.type = "button";
    trigger.id = select.id + "-trigger";
    trigger.className = "brief-select-trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-labelledby", label.id + " " + valueId);
    trigger.setAttribute("aria-controls", listId);
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    if (select.required) trigger.setAttribute("aria-required", "true");
    trigger.disabled = select.disabled;
    trigger.appendChild(value);
    trigger.appendChild(arrow);
    list.id = listId;
    list.className = "brief-select-list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-labelledby", label.id);
    list.setAttribute("aria-hidden", "true");
    list.setAttribute("dir", document.documentElement.dir);
    error.id = errorId;
    error.className = "brief-select-error";
    error.setAttribute("role", "alert");
    error.hidden = true;

    select.parentNode.insertBefore(trigger, select.nextSibling);
    trigger.parentNode.insertBefore(error, trigger.nextSibling);
    document.body.appendChild(list);
    label.addEventListener("click", function (event) { event.preventDefault(); trigger.focus(); });
    select.classList.add("brief-select-source");
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;

    function sync() {
      var options = Array.prototype.slice.call(select.options);
      list.textContent = "";
      options.forEach(function (option, index) {
        var item = document.createElement("div");
        item.id = listId + "-option-" + index;
        item.className = "brief-select-option";
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(option.selected));
        if (option.disabled || (option.parentElement.tagName === "OPTGROUP" && option.parentElement.disabled)) item.setAttribute("aria-disabled", "true");
        item.textContent = option.textContent;
        item.addEventListener("mousedown", function (event) { event.preventDefault(); });
        item.addEventListener("click", function () { choose(index); });
        list.appendChild(item);
      });
      value.textContent = select.selectedIndex >= 0 ? select.options[select.selectedIndex].textContent : "";
      list.setAttribute("dir", document.documentElement.dir);
      trigger.disabled = select.disabled;
      if (select.required) trigger.setAttribute("aria-required", "true");
      else trigger.removeAttribute("aria-required");
      if (select.validity.valid) clearError();
      if (isOpen) markActive();
    }
    function clearError() {
      error.hidden = true;
      error.textContent = "";
      trigger.removeAttribute("aria-invalid");
      trigger.removeAttribute("aria-describedby");
    }
    function available(index) {
      var option = select.options[index];
      return option && !option.disabled && !(option.parentElement.tagName === "OPTGROUP" && option.parentElement.disabled);
    }
    function move(start, direction) {
      var i = start;
      while (i >= 0 && i < select.options.length && !available(i)) i += direction;
      if (available(i)) { active = i; markActive(); }
    }
    function markActive() {
      Array.prototype.forEach.call(list.children, function (item, i) { item.classList.toggle("is-active", i === active); });
      var item = list.children[active];
      if (!item) return;
      trigger.setAttribute("aria-activedescendant", item.id);
      var itemRect = item.getBoundingClientRect();
      var listRect = list.getBoundingClientRect();
      if (itemRect.top < listRect.top) list.scrollTop -= listRect.top - itemRect.top;
      else if (itemRect.bottom > listRect.bottom) list.scrollTop += itemRect.bottom - listRect.bottom;
    }
    function position() {
      if (!isOpen) return;
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var width = Math.min(rect.width, Math.max(0, window.innerWidth - 2 * margin));
      var left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
      var below = window.innerHeight - rect.bottom - margin - 6;
      var above = rect.top - margin - 6;
      var upward = below < 160 && above > below;
      var height = Math.max(48, Math.min(304, upward ? above : below));
      list.style.width = width + "px";
      list.style.left = left + "px";
      list.style.maxHeight = height + "px";
      list.style.top = upward ? "auto" : (rect.bottom + 6) + "px";
      list.style.bottom = upward ? (window.innerHeight - rect.top + 6) + "px" : "auto";
      list.classList.toggle("opens-up", upward);
    }
    function close(restore) {
      if (!isOpen) return;
      isOpen = false;
      trigger.setAttribute("aria-expanded", "false");
      trigger.removeAttribute("aria-activedescendant");
      list.setAttribute("aria-hidden", "true");
      list.classList.remove("is-open");
      if (openPicker === picker) openPicker = null;
      if (restore) trigger.focus();
    }
    function open() {
      if (select.disabled || isOpen) return;
      if (openPicker) openPicker.close(false);
      sync();
      isOpen = true;
      openPicker = picker;
      active = select.selectedIndex >= 0 ? select.selectedIndex : 0;
      if (!available(active)) {
        active = 0;
        while (active < select.options.length && !available(active)) active++;
      }
      trigger.setAttribute("aria-expanded", "true");
      list.setAttribute("aria-hidden", "false");
      position();
      list.classList.add("is-open");
      markActive();
    }
    function choose(index) {
      if (!available(index)) return;
      var changed = select.selectedIndex !== index;
      select.selectedIndex = index;
      if (changed) {
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      } else sync();
      close(true);
    }
    var picker = { trigger: trigger, list: list, close: close, position: position, sync: sync };
    pickers.push(picker);
    trigger.addEventListener("click", function () { if (isOpen) close(false); else open(); });
    trigger.addEventListener("keydown", function (event) {
      var key = event.key;
      if (key === "Escape" && isOpen) { event.preventDefault(); close(true); return; }
      if (key === "Tab") { close(false); return; }
      if (key === "ArrowDown" || key === "ArrowUp") {
        event.preventDefault();
        if (!isOpen) open();
        else move(active + (key === "ArrowDown" ? 1 : -1), key === "ArrowDown" ? 1 : -1);
      } else if ((key === "Home" || key === "End") && isOpen) {
        event.preventDefault();
        move(key === "Home" ? 0 : select.options.length - 1, key === "Home" ? 1 : -1);
      } else if ((key === "Enter" || key === " ") && isOpen) {
        event.preventDefault();
        choose(active);
      } else if ((key === "Enter" || key === " ") && !isOpen) {
        event.preventDefault();
        open();
      } else if (isOpen && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        clearTimeout(searchTimer);
        search += key.toLocaleLowerCase();
        searchTimer = setTimeout(function () { search = ""; }, 700);
        for (var i = 0; i < select.options.length; i++) {
          if (available(i) && select.options[i].textContent.trim().toLocaleLowerCase().indexOf(search) === 0) { active = i; markActive(); break; }
        }
      }
    });
    select.addEventListener("change", sync);
    select.addEventListener("invalid", function (event) {
      event.preventDefault();
      error.textContent = select.validationMessage;
      error.hidden = false;
      trigger.setAttribute("aria-invalid", "true");
      trigger.setAttribute("aria-describedby", errorId);
      var firstInvalid = Array.prototype.find.call(form.elements, function (field) {
        return field.willValidate && !field.validity.valid;
      });
      if (firstInvalid === select) trigger.focus();
    });
    sync();
  });
  document.addEventListener("click", function (event) {
    if (openPicker && !openPicker.trigger.contains(event.target) && !openPicker.list.contains(event.target)) openPicker.close(false);
  });
  document.addEventListener("focusin", function (event) {
    if (openPicker && !openPicker.trigger.contains(event.target) && !openPicker.list.contains(event.target)) openPicker.close(false);
  });
  window.addEventListener("resize", function () { if (openPicker) openPicker.position(); });
  window.addEventListener("scroll", function (event) {
    if (openPicker && !(event.target && event.target.nodeType && openPicker.list.contains(event.target))) openPicker.position();
  }, true);
  document.addEventListener("attia:lang", function () { pickers.forEach(function (picker) { picker.sync(); }); });
  form.addEventListener("reset", function () { setTimeout(function () { pickers.forEach(function (picker) { picker.sync(); }); }, 0); });

  function validate() {
    var digits = phone.value.replace(/\D/g, "");
    phone.setCustomValidity(phone.value && (digits.length < 8 || digits.length > 15) ? window.AttiaI18n.t("custom.phoneError") : "");
    name.setCustomValidity(name.value && !name.value.trim() ? window.AttiaI18n.t("form.invalidName") : "");
    return form.reportValidity();
  }
  phone.addEventListener("input", function () { phone.setCustomValidity(""); });
  name.addEventListener("input", function () { name.setCustomValidity(""); });

  // Indicative follow-up only; incomplete responses are never rejected.
  function classify() {
    var e = form.elements;
    if (!e.service.value || !e.problem.value.trim() || !e.start_time.value || !e.funding.value || !e.decision.value || !e.budget.value) return "Needs clarification";
    if (e.decision.value === "Later" || e.start_time.value === "Within three months") return "Future follow-up";
    if (e.decision.value === "Ready" && e.funding.value === "Ready") return "High priority";
    return "Needs clarification";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (button.disabled || !validate()) return;
    form.elements.follow_up_category.value = classify();
    button.disabled = true;
    button.querySelector("span").textContent = window.AttiaI18n.t("form.sending");
    status.className = "form-status";
    status.textContent = "";
    fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Form submission failed");
        status.textContent = window.AttiaI18n.t("form.success");
        status.className = "form-status show is-success";
        form.reset();
      })
      .catch(function () {
        status.textContent = window.AttiaI18n.t("form.error");
        status.className = "form-status show is-error";
      })
      .finally(function () {
        button.disabled = false;
        button.querySelector("span").textContent = window.AttiaI18n.t("custom.submit");
      });
  });

  whatsapp.addEventListener("click", function () {
    if (!validate()) return;
    var lines = [window.AttiaI18n.t("custom.title")];
    form.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]), select, textarea").forEach(function (field) {
      if (!field.id || field.name === "_gotcha" || !field.value.trim()) return;
      var label = form.querySelector('label[for="' + field.id + '"]');
      var value = field.tagName === "SELECT" ? field.options[field.selectedIndex].textContent : field.value.trim();
      if (label) lines.push(label.textContent.trim() + ": " + value);
    });
    var existing = form.querySelector('input[name="existing_system"]:checked');
    if (existing) lines.push(document.getElementById("brief-current-label").textContent.trim() + ": " + existing.parentElement.textContent.trim());
    var popup = window.open("https://wa.me/213798726063?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener,noreferrer");
    // Some browsers return null for noopener even when opened: show a neutral fallback, not a failure claim.
    if (!popup) {
      status.textContent = window.AttiaI18n.t("custom.whatsapp.note");
      status.className = "form-status show is-warn";
    }
  });
})();
