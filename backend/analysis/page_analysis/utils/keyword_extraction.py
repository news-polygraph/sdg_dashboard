import pandas as pd
import fitz
import json
import numpy as np
from collections import defaultdict
import random

from .keywords import keywords


def get_keywords_per_sentence(sentences):

   sdg_matrix = np.zeros((len(sentences),17))
   keywords_page = {sdg: [] for sdg in range(1,18)}

   for i, sentence in enumerate(sentences):

      # calculate single SDG scores
      page_data = {}
      for sdg, sdg_keywords in keywords.items():
         
         sdg_keywords_splitted = sdg_keywords.split(", ")
         words = sentence.split()
         keywords_sentence = [{"word": word, "char":(1,2)} for word in words if word in sdg_keywords_splitted]

         keywords_page[sdg].append(keywords_sentence)
         if len(keywords_sentence) > 0:
            sdg_matrix[i, sdg-1] = 1
            
      
   return keywords_page, sdg_matrix

def read_keywords_single_page(filename, page_number):

    with fitz.open(filename) as doc:
        text = doc.load_page(page_number-1).get_text()

        # calculate single SDG scores
        page_data = {}
        for sdg, sdg_keywords in keywords.items():

            sdg_keywords_splitted = sdg_keywords.split(", ")
            words = text.split()
               
            # TODO: compare words in upper letters
            keywords_included = [{"word":word, "char":(1, 2)} for word in words if word in sdg_keywords_splitted]

            # calculate score: amount of keywords * 0.1 and maximal 1
            score = round(np.clip(len(keywords_included) * 0.1, 0., 1.), 2)
            if score > 0 and score < 1:
               score = score + round(random.uniform(0, 1) / 10, 2)

            if score > 0:
               factuality = random.uniform(0, 1)
               tense = random.uniform(0, 1)
               category = random.choice(["action", "target", "belief", "status"])
            else:
               factuality = 0
               tense = 0
               category = None

            sdg_data = {"score": score,
                        "factuality": factuality,
                        "tense": tense,
                        "category": category,
                        "keywords": keywords_included,
                        "sequences": []
                        }

            page_data[str(sdg)] = sdg_data

        # give page text to main function to use it for GenAI in the next step
        return text, page_data

def combine_keywords_page_level(relevant_paragraphs, sdg_data):
   paragraphs_with_keywords = relevant_paragraphs.copy()
   for sdg in range(1,18):
      if len(sdg_data[str(sdg)]["keywords"]) == 0:
         paragraphs_with_keywords.pop(sdg, None)
   return paragraphs_with_keywords





