import fitz
from nltk.tokenize import sent_tokenize
import numpy as np
import random
import pandas as pd
import json

from .utils.keyword_extraction import get_keywords_per_sentence
from .utils.feature_extraction import extract_factuality, extract_tense
from .utils.prompting import run_prompting_for_file, run_prompting_for_page


def analyse_page(filename, page_number):
        page_data = {}

        # get text from page
        with fitz.open(filename) as doc:
                text = doc.load_page(page_number).get_text()


        # split text in sentences
        sentences = sent_tokenize(text)

        # search keywords (save them in list and create table with 0s & 1s for every sentence)
        keywords, sdg_matrix = get_keywords_per_sentence(sentences)


        # for all sentence with min one 1 calculate measurability & Tense (save sentence to be relevant for total file analysis)
        # create Dataframe with sentneces and sdg_matrix
        sdg_df = pd.DataFrame(data=sdg_matrix, columns=range(1, 18))
        sdg_df["sentences"] = sentences
        sdg_df["sdg_included"] = sdg_matrix.sum(axis=1)

        sdg_included_sentences = sdg_df[sdg_df["sdg_included"] > 0].copy()

        # calcualte factuality and tense
        sdg_included_sentences["factuality"] = sdg_included_sentences["sentences"].apply(extract_factuality)
        sdg_included_sentences["tense"] = sdg_included_sentences["sentences"].apply(extract_tense)

        # combine factuality and tense for every sdg
        for sdg in range(1,18):
                single_sdg_sentences = sdg_included_sentences[sdg_included_sentences[sdg] > 0]
                
                if len(single_sdg_sentences) > 0:
                        
                        factuality = single_sdg_sentences["factuality"].mean()
                        tense_category = single_sdg_sentences["tense"].value_counts().index[0] # sehr vereinfacht 
                        if tense_category == "past":
                               tense = 0.1
                        elif tense_category == "present":
                               tense = 0.5
                        else:
                               tense = 0.9
                        
                        sdg_keywords_per_page = keywords[sdg]
                        sdg_keywords = [item for sublist in sdg_keywords_per_page for item in sublist]    
                        
                        score = round(np.clip(len(sdg_keywords)*0.1,0.,1.), 2)
                        category = random.choice(["action", "target", "belief", "status"])
                        

                        page_data[sdg] = { "score": score,
                                "factuality": factuality,
                                "tense": tense,
                                "category": category,
                                "nl_explanation": "",
                                "keywords": sdg_keywords,
                                "sequences": [],
                                
                                }
                
                # if sdg not in page save 
                else:
                        page_data[sdg] = { "score": 0,
                                "factuality": 0,
                                "tense": 0,
                                "category": None,
                                "nl_explanation": "",
                                "keywords": [],
                                "sequences": [],
                                }


        with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
            reports = json.load(feedsjson)

         # add results for page of a certain report to the dict
        for report in reports:
            if report["filename"] == filename:
                  report["sdg_data"][int(page_number)+1] = page_data
                  pass
         
         
        with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
                json.dump(reports, feedsjson)



        # combine keywords on file level

        # prompting



        # # extract keywords on page level and combine keywords on file level
        # page_texts = get_keywords_page_level(filename)
        # combine_keywords_file_level(filename)

        # # extract relevent sentences on file level
        # relevant_paragraphs = sentence_extraction(filename, page_texts)
        
        # run_prompting_for_file(filename, relevant_paragraphs)
        # run_prompting_for_page(filename, page_texts)
