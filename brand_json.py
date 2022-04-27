from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import json
import time

BRAND = "H&M"

class Brand:
    # citation: https://www.scrapingbee.com/blog/selenium-python/
    # initialize private variables
    def __init__(self, brand):
        self.__brand = brand
        # set up Selenium to run in the background
        # citation:
        # https://software-testing.com/topic/134/how-can-i-run-a-selenium-webdriver-as-a-background-process-in-python/2
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        self.__driver = webdriver.Chrome(ChromeDriverManager().install(),
                                         options=options)
        self.__directory_link = "https://tinyurl.com/mvznk9mt"
        self.__category_rating_indicator = "out of 5"
        self.__price_txt_style_indicator = "color: rgb(34, 34, 34);"
        self.__categories = ["environment", "labour", "animal"]
        self.__good_on_you_rating_map = {
            "great": 5,
            "good": 4,
            "it's a start": 3,
            "not good enough": 2,
            "we avoid": 1
        }
        self.__brand_info = {}
        # self.overall_rating = 0

    def get_brand_info(self):
        return self.__brand_info


    def get_brand_info_in_json(self):
        return json.dumps(self.__brand_info, indent=4)


    def close_driver(self):
        self.__driver.close()


    def load_sustainability_info_for_brand(self):
        self.enter_directory()
        if self.enter_first_result_from_directory() == "Continue":
            self.load_price()
            self.load_rating_for_each_category()
            meta_text = self.get_meta_text_description()
            sentences_list = self.get_individual_sentences_from_meta_text(meta_text)
            para_ranges = self.get_inclusive_ranges_to_split_paragraphs(sentences_list)
            self.load_rationale_for_each_category(sentences_list, para_ranges)
        else:
            self.__brand_info["error"] = "No Results Found"


    def enter_directory(self):
        # enter the Good On You directory
        self.__driver.get(self.__directory_link)
        # enter the brand you wish to search on the directory search bar
        enter_search_bar = self.__driver.find_element_by_id("search").send_keys(self.__brand)
        time.sleep(5.5)


    def enter_first_result_from_directory(self):
        anchors = self.__driver.find_elements_by_tag_name('a')
        for anchor in anchors:
            # if the tag text has the brand name, then click on the link
            try:
                if anchor.text.lower() == self.__brand.lower():
                    self.__driver.find_element_by_link_text(anchor.text).click()
                    time.sleep(3)
                    return "Continue"
            except Exception as e:
                print(e)

        return "No Results Found"

    # deciding whether to keep or not
    # def get_overall_rating(self):
    #     text_rating = self.driver.find_element_by_id("brand-rating").text
    #     text_rating = text_rating.split(": ")[1].lower()
    #     return self.good_on_you_rating_map[text_rating]


    def load_rating_for_each_category(self):
        span_list = self.__driver.find_elements_by_tag_name('span')
        count = 0
        for s in span_list:
            try:
                if self.__category_rating_indicator in s.text:
                    self.__brand_info[f"GOY {self.__categories[count]} rating"] = int(s.text[0])
                    count += 1
            except Exception as e:
                print(e)


    def load_price(self):
        span_list = self.__driver.find_elements_by_tag_name('span')
        dollar_signs = ""
        for s in span_list:
            try:
                if s.text == "$" and \
                    self.__price_txt_style_indicator in s.get_attribute("style"):
                    dollar_signs += s.text
            except Exception as e:
                print(e)
        self.__brand_info["price"] = dollar_signs


    def get_meta_text_description(self):
        meta_text = self.__driver.find_element_by_xpath('//meta[@name= "description"]')\
                          .get_attribute("content")
        return meta_text


    def get_individual_sentences_from_meta_text(self, meta_text):
        # skip the first and last sentences as they just talk about the brand overall
        sentences_list = meta_text.split(".")[:-2]
        # some paragraphs just get to the point and don't talk about the brand
        if f"{self.__categories[0]} rating is" not in sentences_list[0]:
            sentences_list = sentences_list[1:]
        return [x.strip() for x in sentences_list]


    def get_inclusive_ranges_to_split_paragraphs(self, sentences_list):
        para_inclusive_ranges = list()
        start_range = 0
        para_idx = 0
        para_start_ind = f"{self.__categories[para_idx]} rating is"

        for idx, sentence in enumerate(sentences_list):
            if para_start_ind in sentence or \
                (para_idx == 2 and "it is not applicable to rate its impact on animals" in sentence):
                if para_idx > 0:
                    para_inclusive_ranges.append((start_range, idx-1))

                # this is a special case for companies who don't use any animal materials
                # so we include the sentence about the animal rating not applicable to the brand here
                if "it is not applicable to rate its impact on animals" in sentence:
                    start_range = idx-1
                else:
                    start_range = idx

                para_idx += 1
                if para_idx < len(self.__categories):
                    para_start_ind = f"{self.__categories[para_idx]} rating is"

        para_inclusive_ranges.append((start_range, len(sentences_list)-1))
        return para_inclusive_ranges


    def load_rationale_for_each_category(self, sentences_list, para_ranges):
        for idx, range in enumerate(para_ranges):
            start, end = range
            # we plus one to start so we ignore the sentence about Good On You's rating
            # at the start of each paragraph
            paragraph = '. '.join(sentences_list[start+1: end+1])
            self.__brand_info[f"{self.__categories[idx]} practices"] = paragraph


# h_and_m = Brand(BRAND)
# h_and_m.load_sustainability_info_for_brand()
# print(h_and_m.get_brand_info_in_json())
# h_and_m.close_driver()