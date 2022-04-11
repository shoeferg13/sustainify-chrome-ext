// Replace <your unsplash access key> with the Access Key retrieved
// in the previous step.
const UNSPLASH_ACCESS_KEY = '<your unsplash access key>';

function validateResponse(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
}

async function getRandomPhoto() {
  const endpoint = 'https://api.unsplash.com/photos/random?orientation=landscape';

  // Creates a new Headers object.
  const headers = new Headers();
  // Set the HTTP Authorization header
  headers.append('Authorization', `Client-ID ${UNSPLASH_ACCESS_KEY}`);

  let response = await fetch(endpoint, { headers });
  const json = await validateResponse(response).json();

  return json;
}

async function nextImage() {
  try {
    const image = await getRandomPhoto();
    console.log(image);
  } catch (err) {
    console.log(err);
  }
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.onActivated.addListener(async info => {
      const tab = await chrome.tabs.get(info.tabId);
      
      const isShein = tab.url.startsWith('https://us.shein.com/');
      if (isShein) {
        //  chrome.action.enable(tab.tabId);
         console.log("shein");
      } else {
          console.log('what the fuck');
      }
    });
  });

  // When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      // With a new rule ...
      chrome.declarativeContent.onPageChanged.addRules([
        {
          // That fires when a page's URL matches one of the following ...
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { urlMatches: 'https://us.shein.com/*' },
            }) // continue with more urls if needed
          ],
          // And shows the extension's page action.
          actions: [ new chrome.declarativeContent.ShowPageAction()]
        }
      ]);
    });
  });
  
  chrome.pageAction.onClicked.addListener(function(tab) {
      chrome.tabs.executeScript(null, { file: "script.js" });
  });

//   chrome.browserAction.onClicked.addListener(function(tab) {
//     alert('Test!');
// });

// Execute the `nextImage` function when the extension is installed
chrome.runtime.onInstalled.addListener(getSite);
