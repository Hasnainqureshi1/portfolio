(() => {
  const form = document.querySelector("#marketplace-brief-form");
  const status = document.querySelector("#marketplace-form-status");
  const track = (name, method) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, { method, service: "service-marketplace-app-development" });
    }
  };

  document.querySelectorAll("[data-contact-method]").forEach((link) => {
    link.addEventListener("click", () => track("contact_click", link.dataset.contactMethod));
  });
  if (!form || !status) return;

  let submitting = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    submitting = true;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = "Sending your brief...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      status.textContent = "Thank you. Your brief has been sent. I'll reply by email.";
      track("generate_lead", "marketplace-brief-form");
    } catch {
      status.replaceChildren(document.createTextNode("Your brief could not be sent. Your entries are still here. Try again or "));
      const email = document.createElement("a");
      email.href = "mailto:husnainqureshi134@gmail.com?subject=Service%20marketplace%20app%20enquiry";
      email.textContent = "email Hasnain directly";
      status.append(email, document.createTextNode("."));
    } finally {
      submitting = false;
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
})();
