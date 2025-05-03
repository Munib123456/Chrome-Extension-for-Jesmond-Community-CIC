document.addEventListener('DOMContentLoaded', function() {

  // IMPORTANT: Insert your RapidAPI key below
  const API_KEY = "YOUR_API_KEY_HERE";
  const resultElement = document.getElementById('result');
  const resultSection = document.querySelector('.result-section');

  function showLoading() {
    resultSection.classList.add('loading');
  }
  
  function hideLoading() {
    resultSection.classList.remove('loading');
  }
  
  function showResult(text) {
    hideLoading();
    resultElement.innerHTML = `<p>${text}</p>`;
  }
  
  function showError(message) {
    hideLoading();
    resultElement.innerHTML = `<p class="error">${message}</p>`;
  }

  // Simplify selected text
  document.getElementById('simplify-selection').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: function() {
          return window.getSelection().toString();
        }
      }, function(results) {
        if (!results || !results[0] || !results[0].result) {
          showError("No text selected. Please select some text first.");
          return;
        }
        
        const selectedText = results[0].result;
        if (selectedText.trim().length === 0) {
          showError("No text selected. Please select some text first.");
          return;
        }
        
        showLoading();
        
        // Make the API request directly from popup script - simpler and more reliable
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize-text', true);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.setRequestHeader('x-rapidapi-host', 'article-extractor-and-summarizer.p.rapidapi.com');
        xhr.setRequestHeader('x-rapidapi-key', API_KEY);
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (response.summary) {
                  showResult(response.summary);
                } else {
                  showError("Could not generate summary. Try a different text.");
                }
              } catch (e) {
                showError("Error parsing API response.");
              }
            } else {
              showError(`API Error (${xhr.status}): Try again later.`);
            }
          }
        };
        
        const data = JSON.stringify({
          text: selectedText,
          lang: 'en',
          engine: '2'
        });
        
        xhr.send(data);
      });
    });
  });

  // Simplify current page
  document.getElementById('simplify-page').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: function() {
          // Extract visible text from the page
          const mainContent = document.querySelector('article, main, [role="main"], .content, #content');
          
          if (mainContent) {
            return document.title + "\n\n" + mainContent.innerText;
          } else {
            return document.title + "\n\n" + document.body.innerText;
          }
        }
      }, function(results) {
        if (!results || !results[0]) {
          showError("Cannot access page content. Try a different page.");
          return;
        }
        
        const pageContent = results[0].result;
        if (!pageContent || pageContent.length < 50) {
          showError("Not enough content found on this page.");
          return;
        }
        
        showLoading();
        
        // Make the API request directly
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize-text', true);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.setRequestHeader('x-rapidapi-host', 'article-extractor-and-summarizer.p.rapidapi.com');
        xhr.setRequestHeader('x-rapidapi-key', API_KEY);
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (response.summary) {
                  showResult(response.summary);
                } else {
                  showError("Could not generate summary. Try a different page.");
                }
              } catch (e) {
                showError("Error parsing API response.");
              }
            } else {
              showError(`API Error (${xhr.status}): Try again later.`);
            }
          }
        };
        
        // Limit to 5000 characters to avoid API issues
        const limitedText = pageContent.substring(0, 5000);
        
        const data = JSON.stringify({
          text: limitedText,
          lang: 'en',
          engine: '2'
        });
        
        xhr.send(data);
      });
    });
  });
});
