/* Project brief: native validation and progressive enhancement for Formspree. */
(function () {
  "use strict";
  var form = document.getElementById("briefForm");
  if (!form) return;
  var button = document.getElementById("briefSubmit");
  var status = document.getElementById("briefStatus");
  var phone = document.getElementById("brief-phone");
  var name = document.getElementById("brief-name");

  function validatePhone() {
    var digits = phone.value.replace(/\D/g, "");
    phone.setCustomValidity(phone.value && (digits.length < 8 || digits.length > 15) ? window.AttiaI18n.t("custom.phoneError") : "");
  }
  function validateName() {
    name.setCustomValidity(name.value && !name.value.trim() ? window.AttiaI18n.t("form.invalidName") : "");
  }
  phone.addEventListener("input", validatePhone);
  name.addEventListener("input", validateName);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    validatePhone();
    validateName();
    if (!form.reportValidity()) return;
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
})();
