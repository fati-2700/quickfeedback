(function() {
  'use strict';

  // Widget configuration
  const API_URL = 'https://quickfeedback.co/api/feedback';

  // Create widget styles
  const widgetStyles = `
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
      }
      50% {
        box-shadow: 0 4px 30px rgba(79, 70, 229, 0.6);
      }
    }
    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    #feedback-widget-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      animation: pulse 3s ease-in-out infinite;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #feedback-widget-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 30px rgba(79, 70, 229, 0.6);
    }
    #feedback-widget-button:active {
      transform: scale(1.05);
    }
    #feedback-widget-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 10001;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #feedback-widget-modal.active {
      display: flex;
    }
    #feedback-widget-modal-content {
      background-color: white;
      border-radius: 16px;
      padding: 0;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      position: relative;
      animation: modalFadeIn 0.2s ease-out;
      overflow: hidden;
    }
    #feedback-widget-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6B7280;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
      z-index: 10;
    }
    #feedback-widget-close:hover {
      background-color: #F3F4F6;
      color: #1F2937;
    }
    #feedback-widget-form {
      padding: 32px;
    }
    #feedback-widget-header {
      margin-bottom: 24px;
    }
    #feedback-widget-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }
    #feedback-widget-subtitle {
      font-size: 16px;
      color: #6B7280;
      margin: 0;
      font-weight: 400;
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
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      font-size: 15px;
      font-family: system-ui, -apple-system, sans-serif;
      margin-bottom: 20px;
      box-sizing: border-box;
      transition: all 0.2s ease;
      background-color: white;
    }
    #feedback-widget-form input:focus,
    #feedback-widget-form textarea:focus {
      outline: none;
      border-color: #4F46E5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    #feedback-widget-form textarea {
      resize: vertical;
      min-height: 120px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #feedback-widget-submit {
      width: 100%;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 14px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #feedback-widget-submit:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: scale(1.02);
    }
    #feedback-widget-submit:disabled {
      background: #9CA3AF;
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    #feedback-widget-message {
      margin-top: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      display: none;
      font-weight: 500;
    }
    #feedback-widget-message.success {
      background-color: #10B981;
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #feedback-widget-message.error {
      background-color: #EF4444;
      color: white;
      display: block;
    }
    #feedback-widget-branding {
      text-align: center;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
    }
    #feedback-widget-branding a {
      font-size: 12px;
      color: #6B7280;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    #feedback-widget-branding a:hover {
      color: #4F46E5;
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = widgetStyles;
  document.head.appendChild(styleSheet);

  // Check for data-pro attribute to hide branding
  const scriptTag = document.querySelector('script[src*="widget.js"]');
  const isPro = scriptTag && scriptTag.getAttribute('data-pro') === 'true';

  // Create floating button
  const button = document.createElement('button');
  button.id = 'feedback-widget-button';
  button.innerHTML = '💬';
  button.setAttribute('aria-label', 'Open feedback form');
  document.body.appendChild(button);

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'feedback-widget-modal';

  const modalContent = document.createElement('div');
  modalContent.id = 'feedback-widget-modal-content';

  const closeButton = document.createElement('button');
  closeButton.id = 'feedback-widget-close';
  closeButton.innerHTML = '×';
  closeButton.setAttribute('aria-label', 'Close');

  const form = document.createElement('form');
  form.id = 'feedback-widget-form';

  // Header
  const header = document.createElement('div');
  header.id = 'feedback-widget-header';

  const title = document.createElement('h2');
  title.id = 'feedback-widget-title';
  title.textContent = 'Share Your Feedback';

  const subtitle = document.createElement('p');
  subtitle.id = 'feedback-widget-subtitle';
  subtitle.textContent = "We'd love to hear from you";

  header.appendChild(title);
  header.appendChild(subtitle);

  // Form fields
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Name';
  nameLabel.setAttribute('for', 'feedback-name');

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'feedback-name';
  nameInput.name = 'name';
  nameInput.placeholder = 'Your name';
  nameInput.required = true;

  const emailLabel = document.createElement('label');
  emailLabel.textContent = 'Email';
  emailLabel.setAttribute('for', 'feedback-email');

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'feedback-email';
  emailInput.name = 'email';
  emailInput.placeholder = 'your@email.com';
  emailInput.required = true;

  const messageLabel = document.createElement('label');
  messageLabel.textContent = 'Message';
  messageLabel.setAttribute('for', 'feedback-message');

  const messageTextarea = document.createElement('textarea');
  messageTextarea.id = 'feedback-message';
  messageTextarea.name = 'message';
  messageTextarea.placeholder = 'Tell us what you think...';
  messageTextarea.required = true;

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.id = 'feedback-widget-submit';
  submitButton.textContent = 'Submit Feedback';

  const messageDiv = document.createElement('div');
  messageDiv.id = 'feedback-widget-message';

  // Branding (only show if not pro)
  let brandingDiv = null;
  if (!isPro) {
    brandingDiv = document.createElement('div');
    brandingDiv.id = 'feedback-widget-branding';
    const brandingLink = document.createElement('a');
    brandingLink.href = 'https://quickfeedback.co';
    brandingLink.target = '_blank';
    brandingLink.rel = 'noopener noreferrer';
    brandingLink.textContent = 'Powered by QuickFeedback';
    brandingDiv.appendChild(brandingLink);
  }

  // Assemble form
  form.appendChild(header);
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
  const closeModal = function() {
    modal.classList.remove('active');
    messageDiv.className = '';
    messageDiv.textContent = '';
    form.reset();
  };

  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
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
        messageDiv.innerHTML = '<span>✓</span> Thank you! Your feedback has been submitted.';
        form.reset();
        
        // Close modal after 3 seconds
        setTimeout(function() {
          closeModal();
        }, 3000);
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
      closeModal();
    }
  });
})();
