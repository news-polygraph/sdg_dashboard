import fitz
import numpy as np
import nltk
from functools import reduce
from nltk.tokenize import sent_tokenize, word_tokenize, WordPunctTokenizer
from collections import Counter
nltk.download('punkt')
import re

from .keywords import keywords

def FindIndex(itr,ind,list1):
    if itr == len(list1): #base Condition
        return ind
    if list1[itr] > list1[ind]: #max condition
        ind = itr
    return FindIndex(itr+1,ind,list1) #Recursive Function call

def clean_text(text):
    # Remove special characters
    text = re.sub("[^0-9a-zA-Z.,?!]", " ", text)

    # Replace multiple spaces and line breaks with a single space
    text = re.sub("\\s+", " ", text).strip()

    return text

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

def read_single_page_from_pdf(filename, page_number):
    with fitz.open(filename) as doc:
        text = doc.load_page(page_number-1).get_text()
        return text

def read_keywords_single_page(filename, page_number):
    wpt = WordPunctTokenizer()

    text = read_single_page_from_pdf(filename, page_number)

    page_data = {}
    page_text = clean_text(text)
    words = word_tokenize(text)
    paragraphs = sent_tokenize(page_text)
    tokenized = wpt.tokenize_sents(paragraphs)    
    counters = list(map(lambda x: Counter(x), tokenized))
    relevant_paragraphs = {}
    for sdg, sdg_keywords in keywords.items():

        list_keywords = sdg_keywords.split(", ")
        count = list(map(lambda x:reduce(lambda a,b: a + x[b], list_keywords, 0), counters))
        max_idx = FindIndex(0,0,count)
        # if sdg == 6:
        #     print(list_keywords)
        #     print("sample_ct", sample_ct)
        #     print("counters", counters)
        #     print("Count", count)
        #     print("Max_idx: ", max_idx)
        #     print("Count[max]: ", count[max_idx])
        if count[max_idx] > 0:
            if len(paragraphs) <= 3:
                relevant_paragraphs[str(sdg)] = " ".join(paragraphs)
            elif len(paragraphs) == (max_idx + 1):
                relevant_paragraphs[str(sdg)] = " ".join(paragraphs[-3:])
            else:
                relevant_paragraphs[str(sdg)] = " ".join(paragraphs[max_idx-1:max_idx+2])



        
           
        # TODO: compare words in upper letters
        keywords_included = [{"word":word, "char":(1, 2)} for word in words if word in list_keywords]

        # calculate score: amount of keywords * 0.1 and maximal 1
        score = min(len(keywords_included)*0.1, 1)
        factuality = 0
        tense = 0
        category = None

        sdg_data = {"score": score,
                    "factuality": factuality,
                    "tense": tense,
                    "category": category,
                    "keywords": keywords_included,
                    "sequences": [],
                    }

        page_data[str(sdg)] = sdg_data

        # give page text to main function to use it for GenAI in the next step
    return relevant_paragraphs, page_data

def combine_keywords_page_level(relevant_paragraphs, sdg_data):
    paragraphs_with_keywords = relevant_paragraphs.copy()
    for sdg in range(1,18):
       if len(sdg_data[str(sdg)]["keywords"]) == 0:
          paragraphs_with_keywords.pop(str(sdg), None)
    return paragraphs_with_keywords





