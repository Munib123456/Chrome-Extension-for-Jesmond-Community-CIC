// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'simplifyPage') {
    // Get the page content from the content script first
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: extractPageContent
      }, function(results) {
        if (!results || !results[0]) {
          sendResponse({ error: 'Could not extract content from this page' });
          return;
        }
        
        const pageContent = results[0].result;
        
        // Use XMLHttpRequest exactly as in the provided example code
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (response.summary) {
                  sendResponse({ summary: response.summary });
                } else {
                  sendResponse({ error: 'No summary available for this page' });
                }
              } catch (e) {
                sendResponse({ error: 'Failed to parse API response' });
              }
            } else {
              sendResponse({ error: `API responded with status: ${xhr.status}` });
            }
          }
        };
        
        xhr.open('POST', 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize-text');
        xhr.setRequestHeader('x-rapidapi-key', request.apiKey);
        xhr.setRequestHeader('x-rapidapi-host', 'article-extractor-and-summarizer.p.rapidapi.com');
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        const data = JSON.stringify({
          text: pageContent,
          lang: 'en',
          engine: '2'
        });
        
        xhr.send(data);
      });
    });
    
    return true;
  } 
  
  else if (request.action === 'simplifyText') {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.summary) {
              sendResponse({ summary: response.summary });
            } else {
              sendResponse({ error: 'No summary available for this text' });
            }
          } catch (e) {
            sendResponse({ error: 'Failed to parse API response' });
          }
        } else {
          sendResponse({ error: `API responded with status: ${xhr.status}` });
        }
      }
    };
    
    xhr.open('POST', 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize-text');
    xhr.setRequestHeader('x-rapidapi-key', request.apiKey);
    xhr.setRequestHeader('x-rapidapi-host', 'article-extractor-and-summarizer.p.rapidapi.com');
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    const data = JSON.stringify({
      text: request.text,
      lang: 'en',
      engine: '2'
    });
    
    xhr.send(data);
    
    return true;
  }
});

function extractPageContent() {
  // Simplified extraction function
  function getAllTextContent() {
    // Get the page title
    let text = document.title + "\n\n";
    
    // First try to get the main content container
    const mainContent = document.querySelector('article, main, [role="main"], .content, #content');
    
    if (mainContent) {
      // If we found a main content container, get text from there
      text += mainContent.innerText;
    } else {
      // If not, get text from the body but exclude navigation, header, footer, etc.
      const exclusions = [
        'nav', 'header', 'footer', 'script', 'style', 'noscript', 'iframe',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
        '.navigation', '.sidebar', '.menu', '.ads', '.comments'
      ];
      
      // Create a temporary element to work with
      const tempElement = document.createElement('div');
      tempElement.innerHTML = document.body.innerHTML;
      
      // Remove excluded elements
      exclusions.forEach(selector => {
        const elements = tempElement.querySelectorAll(selector);
        elements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      });
      
      // Get text from the cleaned element
      text += tempElement.innerText;
    }
    
    // Clean up text: remove excessive whitespace
    return text.replace(/\s+/g, ' ').trim().substring(0, 5000);
  }
  
  return getAllTextContent();
}
