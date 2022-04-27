from brand_class import Brand
import json
import time

db_file = "sustainify_database.json"

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

companies_list = \
[
    "UNIQLO",
    "Stradivarius",
    "Topshop",
    "Rip Curl",
    "Victoria's Secret",
    "Urban Outfitters",
    "GUESS",
    "GAP",
    "Zara",
    "Zaful",
    "H&M",
    "Forever 21",
    "Shein",
    "Fashion Nova",
    "Patagonia",
    "Everlane",
    "Girlfriend Collective",
    "Pact",
    "Kotn",
    "Quince",
    "Whimsy + Row",
    "Reformation",
    "Hass",
    "Vetta",
    "tentree",
    "Organic Basics",
    "Thought Clothing",
    "Back Beat Co."
]


def get_names_of_all_recommended_brands(recommendation_mappings):
    rec_set = set()
    for unsustainable_brands in recommendation_mappings:
        recs = recommendation_mappings[unsustainable_brands]
        rec_set.update(recs)
    return list(rec_set)


def populate_db_documents(companies_list, recommendation_mappings):
    documents = []
    for id, company_name in enumerate(companies_list):
        brand_obj = Brand(company_name)
        brand_obj.load_sustainability_info_for_brand()
        brand_info = brand_obj.get_brand_info()
        if recommendation_mappings.get(company_name):
            brand_info["recommendation"] = recommendation_mappings[company_name]
        documents.append({"id": id,
                            "name": company_name,
                            "info": brand_info})
        brand_obj.close_driver()
        time.sleep(1)
    return documents


def write_db_to_json_file(companies_list,
                          recommendation_mappings,
                          db_file):
    docs = populate_db_documents(companies_list, recommendation_mappings)
    database = {"data": docs}
    with open(db_file, 'w') as outfile:
        json.dump(database, outfile, indent=4)


rec_brands = get_names_of_all_recommended_brands(recommendation_mappings)
companies_list.extend(rec_brands)
write_db_to_json_file(companies_list, recommendation_mappings, db_file)