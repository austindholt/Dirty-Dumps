const quoteForm = document.getElementById("quoteForm");
const formStatus = document.getElementById("formStatus");
const quoteSubmit = document.getElementById("quoteSubmit");

if (quoteForm && formStatus && quoteSubmit) {
  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!quoteForm.reportValidity()) {
      formStatus.className = "form-status is-error";
      formStatus.textContent = "Please fill out the required fields so we know who to contact, where the job is, and what needs hauled.";
      return;
    }

    formStatus.className = "form-status";
    formStatus.textContent = "";
    quoteSubmit.disabled = true;
    quoteSubmit.textContent = "Sending...";

    try {
      const response = await fetch(quoteForm.action, {
        method: "POST",
        body: new FormData(quoteForm),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Form submission failed");

      quoteForm.reset();
      formStatus.className = "form-status is-success";
      formStatus.textContent = "Thanks! Your quote request was sent. We will review the details and follow up soon. If you have photos ready, email them to dirtydumpshaulingco@gmail.com or send them through social.";
    } catch (error) {
      formStatus.className = "form-status is-error";
      formStatus.textContent = "Sorry, the form did not send. Please email your quote details and photos to dirtydumpshaulingco@gmail.com, or try the form again in a minute.";
    } finally {
      quoteSubmit.disabled = false;
      quoteSubmit.textContent = "Send Quote Request";
    }
  });
}
