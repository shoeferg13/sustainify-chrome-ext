let jsondata; 
let url;

let colors = { 
    '1': '#ff0b0d', // red
    '2': '#ff7039', // orange
    '3': '#ffd666', // yellow
    '4': '#a3b545', // light green
    '5': '#479526' // dark green
}

recommendation_mappings = {
    "UNIQLO": ["Yes Friends", "Knickey", "Kotn"],
    "Stradivarius": ["Studio JUX", "Saint Basics", "Sense Organics"],
    "Topshop": ["CHNGE", "PaaPii Design", "Yes Friends"],
    "Rip Curl": ["allSisters", "Loop Swim", "Charlee Swim"],
    "Victoria's Secret": ["Natalie Perry", "Whimsy + Row", "Amadeus"],
    "Urban Outfitters": ["CHNGE", "Saint Basics", "Purnama"],
    "GUESS": ["People Tree", "Mata Traders", "Amour Vert"],
    "GAP": ["loud + proud", "Phyne", "The Common Good Company"],
    "Zara": ["Honest Basics", "Mighty Good Basics", "Studio JUX"],
    "Zaful": ["Bik Bok", "WE Fashion", "Junarose"],
    "H&M": ["KENT", "unspun", "The Tiny Closet"],
    "Forever 21": ["PaaPii Design", "Yes Friends", "Knickey"],
    "Shein": ["Christy Dawn", "Bougainvillea London", "milo+nicki"],
    "Fashion Nova": ["Delikate Rayne", "TAMGA Designs", "tonlé"]
}

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
        const matchingCompany = matchSiteToJson(url, jsondata);
        const nameDiv=document.getElementById("jsonData");
        const descriptionDiv = document.getElementById("description");
        const circle = document.getElementById("circle");
        if (matchingCompany != null) {
            console.log(matchingCompany);
            const ranking = matchingCompany.info["GOY animal rating"];
            nameDiv.textContent = "Name: " + matchingCompany.name + ", Ranking: " + ranking;
            descriptionDiv.textContent = matchingCompany.info["environment practices"] + " " +
            matchingCompany.info["labour practices"] + " " + matchingCompany.info["animal practices"];
            circle.style.backgroundColor = colors[ranking];

            if (matchingCompany.name in recommendation_mappings) {
                const recommendation = document.getElementById("recommendation");
                recommendation.textContent = "Try out these similar, more sustainable options instead: " + recommendation_mappings[matchingCompany.name] + "!";
            }
        } else {
            nameDiv.textContent = "No matches";
        }
        
        
    });

    
