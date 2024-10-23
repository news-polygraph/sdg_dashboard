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



def get_keywords_page_level(filename, page_number):

   # initialize list of strings to save the page text for GenAIpage_texts
    page_texts = []

   # get first page
    with fitz.open(filename) as doc:

      # number_pages = doc.page_count
      # for page_number in range(number_pages):

        text = doc.load_page(page_number-1).get_text()

        page_texts.append(text)

         # calculate single SDG scores
        page_data = {}
        for sdg, sdg_keywords in keywords.items():

            sdg_keywords_splitted = sdg_keywords.split(", ")
            words = text.split()

            # TODO: compare words in upper letters
            keywords_included = [ {"word": word, "char":(1,2)} for word in words if word in sdg_keywords_splitted]

            # calculate score: amount of keywords * 0.1 and maximal 1
            score = round(np.clip(len(keywords_included)*0.1,0.,1.), 2)
            if score > 0 and score < 1:
                score = score + round(random.uniform(0, 1)/10,2)

            if score > 0:
                factuality = random.uniform(0, 1)
                tense = random.uniform(0, 1)
                category = random.choice(["action", "target", "belief", "status"])
            else:
                factuality = 0
                tense = 0
                category = None


            sdg_data = { "score": score,
            "factuality": factuality,
            "tense": tense,
            "category": category,
            "keywords": keywords_included,
            "sequences" : []
            }

            page_data[sdg] = sdg_data


        with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
            reports = json.load(feedsjson)

         # add results for page of a certain report to the dict
        for report in reports:
            if report["filename"] == filename:
                report["sdg_data"][int(page_number)+1] = page_data
                pass


        with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
            json.dump(reports, feedsjson)

   # give page text to main function to use it for GenAI in the next step
   # return page_texts

def read_keywords_single_page(filename, page_number):

   with fitz.open(filename) as doc:
      text = doc.load_page(page_number-1).get_text()

      # calculate single SDG scores
      page_data = {}
      for sdg, sdg_keywords in keywords.items():

         sdg_keywords_splitted = sdg_keywords.split(", ")
         words = text.split()

         # TODO: compare words in upper letters
         keywords_included = [{"word": word, "char": (1, 2)} for word in words if word in sdg_keywords_splitted]

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

         page_data[sdg] = sdg_data

         with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
            reports = json.load(feedsjson)

         # add results for page of a certain report to the dict
         sdg_data = {}
         for report in reports:
            if report["filename"] == filename:
               sdg_data = report["sdg_data"][f"{page_number}"]
               break

   # give page text to main function to use it for GenAI in the next step
   return text, sdg_data

def combine_keywords_file_level(filename):

   with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
      reports = json.load(feedsjson)

   # add results for page of a certain report to the dict
   for report in reports:
      if report["filename"] == filename:
            data_page_level = report["sdg_data"]
            pass
   
   # create initial dict to be appended with sdg keywords per page
   # file_data = defaultdict(list)
   file_data = {str(sdg): [] for sdg in range(1,18)}

   # loop through sdg per page and add keywords to defaultdict
   for _, page_data in data_page_level.items():
      for sdg in range(1,18):
         file_data[str(sdg)].extend(page_data[str(sdg)]["keywords"])
   
   # count amount of keywords per sdg
   for sdg in range(1,18):
      file_data[str(sdg)] = len(file_data[str(sdg)])

   # add amount of keywords to report data and save in json
   if "analysis_data" in report:
      report["analysis_data"]["keyword_counts"] = file_data
   else:
      report["analysis_data"] = {"keyword_counts": file_data}

   with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
      json.dump(reports, feedsjson)

def combine_keywords_page_level(relevant_paragraphs, sdg_data):
   paragraphs_with_keywords = relevant_paragraphs.copy()
   for sdg in range(1,18):
      if len(sdg_data[str(sdg)]["keywords"]) == 0:
         paragraphs_with_keywords.pop(sdg, None)
   return paragraphs_with_keywords





