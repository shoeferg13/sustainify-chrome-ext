let jsondata; 
let url;

function matchSiteToJson(url, jsondata) {
    console.log(url);
    for (i = 0; i < jsondata.data.length; i++) {
        jsonUrl = jsondata.data[i].url;
        console.log("JSON URL", jsonUrl);
        if (url.includes(jsonUrl)) {
            return jsondata.data[i];
        }
    }
    return null;
}

chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let currentTab = tabs[0];
    url = currentTab.url;
    console.log("URL", currentTab.url);
    // use `url` here inside the callback because it's asynchronous!
});

fetch("sustainify_database.json")
    .then(response => response.json())
    .then(data => {
        jsondata = data;
        console.log("hi", jsondata);
        const matchingCompany = matchSiteToJson(url, jsondata);
        const nameDiv=document.getElementById("jsonData");
        const rankingDiv = document.getElementById("jsonDataRanking");
        if (matchingCompany != null) {
            console.log(matchingCompany);
            nameDiv.textContent = matchingCompany.name;
            rankingDiv.textContent = matchingCompany.info["GOY animal rating"];
        } else {
            nameDiv.textContent = "No matches";
        }
        
        
    });

    
