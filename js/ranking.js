let jsondata; 
let url;
const weighting_factor = 0.05;

// changed the keys from type string to type int
let colors = { 
    1: '#ff0b0d', // red
    2: '#ff7039', // orange
    3: '#ffd666', // yellow
    4: '#a3b545', // light green
    5: '#479526' // dark green
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

/**
 * Gets the URL from the current tab in Chrome
 */
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
    // get the elements for the name and circle
    const nameDiv=document.getElementById("jsonData");
    const circle = document.getElementById("circle");
    // get the elements to place text for each sustainability practice
    const environment_desc = document.getElementById("environment");
    const labour_desc = document.getElementById("labour");
    const animal_desc = document.getElementById("animal");

    if (matchingCompany != null) {
        console.log(matchingCompany);
        
        // get our (Sustainify's) rating for the sustainability practices based on the user preferences
        const sustainify_ratings_map = getSustainifyRatingsForEachPractice(matchingCompany);
        console.log("weighted map", sustainify_ratings_map);

        // get the overall company ranking (averaged from the sum of the three ratings)
        const overall_company_rating = getOverallCompanyRating(sustainify_ratings_map);

        // fill in the text for company name
        nameDiv.textContent = matchingCompany.name;
        
        // add p tag to display descriptions for the sustainability factors
        environment_desc.textContent = matchingCompany.info["environment practices"] + ".";
        labour_desc.textContent = matchingCompany.info["labour practices"] + ".";
        animal_desc.textContent = matchingCompany.info["animal practices"] + ".";

        // set the background color and text content of the circle
        circle.style.backgroundColor = getColorBasedOnRating(overall_company_rating);
        circle.textContent = overall_company_rating;

        if (matchingCompany.name in recommendation_mappings) {
            // get the elements to store the recommendations
            const recommendation = document.getElementById("recommendation");
            const recommendation1 = document.getElementById("recommendation1");
            const recommendation2 = document.getElementById("recommendation2");
            const recommendation3 = document.getElementById("recommendation3");
            // get the json data for each recommended company
            const rec1Json = matchNameToJson(recommendation_mappings[matchingCompany.name][0], jsondata);
            const rec2Json = matchNameToJson(recommendation_mappings[matchingCompany.name][1], jsondata);
            const rec3Json = matchNameToJson(recommendation_mappings[matchingCompany.name][2], jsondata);
            // get the overall rating for each recommended company (while taking into account the user's preferences)
            recommendation1.textContent = rec1Json.name + ", Rating: " + getOverallCompanyRating(getSustainifyRatingsForEachPractice(rec1Json));
            recommendation2.textContent = rec2Json.name + ", Rating: " + getOverallCompanyRating(getSustainifyRatingsForEachPractice(rec2Json));
            recommendation3.textContent = rec3Json.name + ", Rating: " + getOverallCompanyRating(getSustainifyRatingsForEachPractice(rec3Json));
            // attach the url link so the user can go the recommended companies' websites
            recommendation1.href = rec1Json.url;
            recommendation2.href = rec2Json.url;
            recommendation3.href = rec3Json.url;
            recommendation1.target = "_blank";
            recommendation2.target = "_blank";
            recommendation3.target = "_blank";
            recommendation.textContent = "Try out these similar, more sustainable options instead!";
        }
    } else {
        nameDiv.textContent = "No matches";
    }
    applyAccordionAnimation();
});

/* HELPER FUNCTIONS */

function applyAccordionAnimation() {
    // citation: https://www.freecodecamp.org/news/build-an-accordion-menu-using-html-css-and-javascript/
    // logic for the accordion animation
    const accordion = document.getElementsByClassName('container');
    for (let i=0; i<accordion.length; i++) {
        console.log(accordion[i]);
        accordion[i].addEventListener('click', function () {
            this.classList.toggle('active');
        });
    }
}

function matchSiteToJson(url, jsondata) {
    console.log(url);
    for (let i = 0; i < jsondata.data.length; i++) {
        jsonUrl = jsondata.data[i].url;
        console.log("JSON URL", jsonUrl);
        if (url.includes(jsonUrl)) {
            return jsondata.data[i];
        }
    }
    return null;
}

function matchNameToJson(name, jsondata) {
    for (let i = 0; i < jsondata.data.length; i++) {
        jsonName = jsondata.data[i].name;
        if (jsonName == name) {
            return jsondata.data[i];
        }
    }
    return null;
}    

function getColorBasedOnRating(rating) {
    // round up the rating to match the threshold of the 'colors' map and get the corresponding color
    rating = Math.ceil(rating);
    return colors[rating];
}

function getSustainifyRatingsForEachPractice(company_json_data) {
    // get the ordered list of user preferences; 
    // e.g. [Environment, Labour, Animal] with Environment as most important factor
    var prefereneces_list = getListOfPracticesInOrderOfPreference();
    // get the environment, labour, and animal ratings from the company json
    // based on Good On You's original rating for each sustainability practice
    var GOY_environment_rating = company_json_data.info["GOY environment rating"];
    var GOY_labour_rating = company_json_data.info["GOY labour rating"];
    var GOY_animal_rating = company_json_data.info["GOY animal rating"];
    if (typeof GOY_animal_rating === 'undefined') { GOY_animal_rating = -1; }  
    // -1 is a flag for undefined score (as a company may sell products free of any animal materials)

    // create the default map for ratings
    let default_ratings_map = new Map([
        ["Environment", GOY_environment_rating],
        ["Labour", GOY_labour_rating],
        ["Animal", GOY_animal_rating]
    ]);
    // console.log(default_ratings_map); // why is it that the result for this map actually the weighted map

    if (prefereneces_list.length == 0) {
        return default_ratings_map; // make no changes
    } else {
        var score_weightings_map = getWeightingFactorsForEachPractice(prefereneces_list);
        return getWeightedRatings(default_ratings_map, score_weightings_map); // update the ratings based on each practice's weighting
    }
}

function getOverallCompanyRating(weighted_ratings_map) {
    var overall_rating = 0;
    var count = 0;
    // sum up the ratings of all sustainability practice
    weighted_ratings_map.forEach(function(rating, sustnb_practice) { 
        if (rating !== -1) {  // special case; a rating of -1 means the rating is not applicable
            overall_rating += rating;
            count++;
        } 
    });
    overall_rating /= count;  // get the average rating 
    return Math.min(5.00, overall_rating.toFixed(2));  // round rating to 2 decimal places; a score of 5 is the maximum
}

function getWeightedRatings(weighted_ratings_map, score_weightings_map) {
    var original_rating;
    var new_rating;

    // loop the map for the weighted factors for each practice and calculate the new ratings accordingly 
    for (let [sustnb_practice, weighting_factor] of score_weightings_map.entries()) {
        original_rating = weighted_ratings_map.get(sustnb_practice);
        if (original_rating === -1) {  // special case; this means the rating is not applicable, so should not be changed
            new_rating = -1; 
        } else {
            // i.e. we get a positive / favorable score, then we boost the score by the weighting factor
            if (original_rating >= 3) {
                new_rating = original_rating * (1 + weighting_factor);
            } else {  // otherwise, we penalize the score by the weighting factor
                new_rating = original_rating * (1 - weighting_factor);
            }
        }
        // update the new ratings
        weighted_ratings_map.set(sustnb_practice, new_rating);
    }
    return weighted_ratings_map;
}

function getWeightingFactorsForEachPractice(preference_list) {
    var weighting_factors_for_each_practice = new Map();
    var len = preference_list.length;

    var elem_weighting_factor;
    var sustnb_practice;

    for (let idx = 0; idx < len; idx++) {
        sustnb_practice = preference_list[idx];
        elem_weighting_factor = (len-1 - idx) * weighting_factor;
        // update the weighting factor for each sustainability factor
        weighting_factors_for_each_practice.set(sustnb_practice, elem_weighting_factor);
    }

    console.log(weighting_factors_for_each_practice);
    return weighting_factors_for_each_practice;
}

function getListOfPracticesInOrderOfPreference() {
    // check if we have used sessionStorage to store our user preferences before
    var preference_list = sessionStorage.getItem('user_preferences');
    console.log(preference_list);
    if (preference_list !== null) {
        // if the list exists, then we parse it from its JSON form to an array form
        return JSON.parse(preference_list);
    } else {
        return [];
    }
}
    
