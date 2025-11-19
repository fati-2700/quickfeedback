(function() {
  'use strict';

  // Widget configuration
  const API_URL = 'http://localhost:3000/api/feedback';

  // Create widget styles
  const widgetStyles = `
    #feedback-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
      z-index: 10000;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    #feedback-widget-button:hover {
      background-color: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    #feedback-widget-button:active {
      transform: translateY(0);
    }
    #feedback-widget-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    #feedback-widget-modal.active {
      display: flex;
    }
    #feedback-widget-modal-content {
      background-color: white;
      border-radius: 12px;
      padding: 32px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      position: relative;
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #feedback-widget-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    #feedback-widget-close:hover {
      background-color: #f3f4f6;
      color: #1f2937;
    }
    #feedback-widget-form h2 {
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
    }
    #feedback-widget-form label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    #feedback-widget-form input,
    #feedback-widget-form textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      margin-bottom: 20px;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }
    #feedback-widget-form input:focus,
    #feedback-widget-form textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    #feedback-widget-form textarea {
      resize: vertical;
      min-height: 120px;
    }
    #feedback-widget-submit {
      width: 100%;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    #feedback-widget-submit:hover {
      background-color: #2563eb;
    }
    #feedback-widget-submit:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    #feedback-widget-message {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      display: none;
    }
    #feedback-widget-message.success {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      display: block;
    }
    #feedback-widget-message.error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
      display: block;
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = widgetStyles;
  document.head.appendChild(styleSheet);

  // Create button
  const button = document.createElement('button');
  button.id = 'feedback-widget-button';
  button.textContent = 'Feedback';
  document.body.appendChild(button);

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'feedback-widget-modal';

  const modalContent = document.createElement('div');
  modalContent.id = 'feedback-widget-modal-content';

  const closeButton = document.createElement('button');
  closeButton.id = 'feedback-widget-close';
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close');

  const form = document.createElement('form');
  form.id = 'feedback-widget-form';

  const title = document.createElement('h2');
  title.textContent = 'Send Feedback';

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Name';
  nameLabel.setAttribute('for', 'feedback-name');

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'feedback-name';
  nameInput.name = 'name';
  nameInput.required = true;

  const emailLabel = document.createElement('label');
  emailLabel.textContent = 'Email';
  emailLabel.setAttribute('for', 'feedback-email');

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'feedback-email';
  emailInput.name = 'email';
  emailInput.required = true;

  const messageLabel = document.createElement('label');
  messageLabel.textContent = 'Message';
  messageLabel.setAttribute('for', 'feedback-message');

  const messageTextarea = document.createElement('textarea');
  messageTextarea.id = 'feedback-message';
  messageTextarea.name = 'message';
  messageTextarea.required = true;

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.id = 'feedback-widget-submit';
  submitButton.textContent = 'Submit Feedback';

  const messageDiv = document.createElement('div');
  messageDiv.id = 'feedback-widget-message';

  // Check for data-pro attribute to hide branding
  const scriptTag = document.querySelector('script[src*="widget.js"]');
  const isPro = scriptTag && scriptTag.getAttribute('data-pro') === 'true';

  // Branding text (only show if not pro)
  let brandingDiv = null;
  if (!isPro) {
    brandingDiv = document.createElement('div');
    brandingDiv.id = 'feedback-widget-branding';
    brandingDiv.textContent = 'Powered by QuickFeedback';
    brandingDiv.style.cssText = 'text-align: center; margin-top: 16px; font-size: 12px; color: #9ca3af;';
  }

  form.appendChild(title);
  form.appendChild(nameLabel);
  form.appendChild(nameInput);
  form.appendChild(emailLabel);
  form.appendChild(emailInput);
  form.appendChild(messageLabel);
  form.appendChild(messageTextarea);
  form.appendChild(submitButton);
  form.appendChild(messageDiv);
  if (brandingDiv) {
    form.appendChild(brandingDiv);
  }

  modalContent.appendChild(closeButton);
  modalContent.appendChild(form);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Show modal
  button.addEventListener('click', function() {
    modal.classList.add('active');
    nameInput.focus();
  });

  // Close modal
  closeButton.addEventListener('click', function() {
    modal.classList.remove('active');
    messageDiv.className = '';
    messageDiv.textContent = '';
    form.reset();
  });

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('active');
      messageDiv.className = '';
      messageDiv.textContent = '';
      form.reset();
    }
  });

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageTextarea.value.trim();
    const siteUrl = window.location.href;

    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    messageDiv.className = '';
    messageDiv.textContent = '';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          siteUrl,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        messageDiv.className = 'success';
        messageDiv.textContent = 'Thank you! Your feedback has been submitted.';
        form.reset();
        
        // Close modal after 2 seconds
        setTimeout(function() {
          modal.classList.remove('active');
          messageDiv.className = '';
          messageDiv.textContent = '';
        }, 2000);
      } else {
        messageDiv.className = 'error';
        messageDiv.textContent = data.message || 'Failed to submit feedback. Please try again.';
      }
    } catch (error) {
      messageDiv.className = 'error';
      messageDiv.textContent = 'An error occurred. Please try again later.';
      console.error('Feedback submission error:', error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Feedback';
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      messageDiv.className = '';
      messageDiv.textContent = '';
      form.reset();
    }
  });
})();

