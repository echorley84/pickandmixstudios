// ==========================================================================
// Pick and Mix Studios — shared site script
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {

  // --- Video lightbox modal (Showcase + Tutorials pages) ---
  var overlay = document.getElementById('tcVideoOverlay');
  if (overlay) {
    var frame = document.getElementById('tcVideoFrame');
    var closeBtn = document.getElementById('tcVideoClose');
    var videoButtons = document.querySelectorAll('.tc-video-btn');

    function openModal(url) {
      frame.src = url;
      overlay.classList.add('is-open');
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      frame.src = '';
    }

    videoButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-video');
        if (!url || url === '#') return;
        openModal(url);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  // --- Contact form (Web3Forms) ---
  var form = document.getElementById('tcContactForm');
  if (form) {
    var statusEl = document.getElementById('tcFormStatus');
    var btn = document.getElementById('tcSubmitBtn');
    var btnLabel = document.getElementById('tcSubmitLabel');
    var defaultStatus = statusEl.textContent;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      btn.setAttribute('disabled', 'true');
      btnLabel.textContent = 'Sending...';
      statusEl.textContent = defaultStatus;
      statusEl.style.color = '';

      var formData = new FormData(form);
      var payload = Object.fromEntries(formData.entries());

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            form.reset();
            statusEl.textContent = 'Thanks! Your message has been sent.';
            statusEl.style.color = '#c8f5d0';
            btnLabel.textContent = 'Send Message';
          } else {
            statusEl.textContent = 'Something went wrong: ' + (data.message || 'please try again.');
            statusEl.style.color = '#ffd0d0';
            btnLabel.textContent = 'Send Message';
          }
        })
        .catch(function () {
          statusEl.textContent = 'Something went wrong sending your message. Please try again.';
          statusEl.style.color = '#ffd0d0';
          btnLabel.textContent = 'Send Message';
        })
        .finally(function () {
          btn.removeAttribute('disabled');
        });
    });
  }

  // --- Read more / read less toggles (Pop up Shop) ---
  document.querySelectorAll('.tc-readmore-btn').forEach(function (btn) {
    var targetId = btn.getAttribute('data-target');
    var target = document.getElementById(targetId);
    if (!target) return;

    btn.addEventListener('click', function () {
      var isOpen = target.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      var label = btn.querySelector('.tc-readmore-label');
      if (label) label.textContent = isOpen ? 'Read Less' : 'Read More';
    });
  });

});
