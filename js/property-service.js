(() => {
  const form = document.querySelector("#property-brief-form");
  const status = document.querySelector("#property-form-status");
  const track = (name, method) => {
    window.trackBusinessEvent?.(name, { method });
  };
  if (!form || !status) return;
  let submitting = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
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
      status.textContent = "Thank you. Your brief has been sent. I’ll reply by email.";
      track("generate_lead", "property-brief-form");
    } catch {
      status.replaceChildren(document.createTextNode("Your brief could not be sent. Your entries are still here. Try again or "));
      const email = document.createElement("a");
      email.href = "mailto:husnainqureshi134@gmail.com?subject=Commercial%20property%20website%20enquiry";
      email.textContent = "email Hasnain directly";
      status.append(email, document.createTextNode("."));
    } finally {
      submitting = false;
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
})();
