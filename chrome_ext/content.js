

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'replaceWithSimplified') {
    // Create an overlay to show the simplified version
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    overlay.style.zIndex = '10000';
    overlay.style.padding = '40px';
    overlay.style.overflowY = 'auto';
    overlay.style.fontFamily = 'Poppins, Arial, sans-serif';
    overlay.style.boxSizing = 'border-box';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'fixed';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.padding = '10px 15px';
    closeButton.style.backgroundColor = '#3a7bd5';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontFamily = 'Poppins, Arial, sans-serif';
    closeButton.addEventListener('click', function() {
      document.body.removeChild(overlay);
    });
    
    // Add content
    const content = document.createElement('div');
    content.style.maxWidth = '800px';
    content.style.margin = '0 auto';
    content.style.lineHeight = '1.6';
    content.innerHTML = `
      <h1 style="color: #2a5885; margin-bottom: 20px; font-weight: 600;">Simplified Version</h1>
      <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
        ${request.simplifiedText}
      </div>
    `;
    
    overlay.appendChild(closeButton);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    sendResponse({ success: true });
  }
});
