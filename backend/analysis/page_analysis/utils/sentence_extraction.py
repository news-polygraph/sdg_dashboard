import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
import json
nltk.download('punkt')
import re


def clean_text(text):
    # Remove special characters
    text = re.sub("[^0-9a-zA-Z.,?!]", " ", text)

    # Replace multiple spaces and line breaks with a single space
    text = re.sub("\\s+", " ", text).strip()

    return text

def sentence_extraction(filename, page_texts):
    
    # Predefined descriptions for each of the 17 SDGs
    sdg_descriptions = [
        "No Poverty",
        "Zero Hunger",
        "Good Health and Well-being",
        "Quality Education",
        "Gender Equality",
        "Clean Water and Sanitation",
        "Affordable and Clean Energy",
        "Decent Work and Economic Growth",
        "Industry, Innovation, and Infrastructure",
        "Reduced Inequality",
        "Sustainable Cities and Communities",
        "Responsible Consumption and Production",
        "Climate Action",
        "Life Below Water",
        "Life on Land",
        "Peace and Justice Strong Institutions",
        "Partnerships to achieve the Goal"
    ]
    
    # create single string
    page_text = (" ").join(page_texts)

    # Basic text cleaning
    page_text = clean_text(page_text)

    # Tokenize the text into paragraphs
    paragraphs = sent_tokenize(page_text)

    # Combine SDG descriptions and paragraphs for vectorization
    combined_texts = sdg_descriptions + paragraphs

    # Vectorize the text using TF-IDF
    vectorizer = TfidfVectorizer()
    vectorized_texts = vectorizer.fit_transform(combined_texts)

    # Dictionary to store the most relevant paragraph for each SDG
    relevant_paragraphs = {}

    # Calculate cosine similarity and find the most relevant paragraph for each SDG
    for i, sdg in enumerate(sdg_descriptions, start=1):
        sdg_vector = vectorized_texts[i - 1]
        cos_similarities = cosine_similarity(sdg_vector, vectorized_texts[len(sdg_descriptions):])[0]
        most_relevant_paragraph_idx = np.argmax(cos_similarities)
        relevant_paragraphs[i] = paragraphs[most_relevant_paragraph_idx]


    ## Save in Json
    with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
      reports = json.load(feedsjson)
    
       # add results for page of a certain report to the dict
    for report in reports:
        if report["filename"] == filename:
                data_page_level = report["sdg_data"]
                pass


    # add amount of keywords to report data and save in json
    if "analysis_data" in report:
        report["analysis_data"]["relevant_paragraphs"] = relevant_paragraphs
    else:
        report["analysis_data"] = {"relevant_paragraphs": relevant_paragraphs}

    with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
        json.dump(reports, feedsjson)


    return relevant_paragraphs


def sentence_extraction_for_page(page_texts):
    # Predefined descriptions for each of the 17 SDGs
    sdg_descriptions = [
        "No Poverty",
        "Zero Hunger",
        "Good Health and Well-being",
        "Quality Education",
        "Gender Equality",
        "Clean Water and Sanitation",
        "Affordable and Clean Energy",
        "Decent Work and Economic Growth",
        "Industry, Innovation, and Infrastructure",
        "Reduced Inequality",
        "Sustainable Cities and Communities",
        "Responsible Consumption and Production",
        "Climate Action",
        "Life Below Water",
        "Life on Land",
        "Peace and Justice Strong Institutions",
        "Partnerships to achieve the Goal"
    ]

    # Basic text cleaning
    page_text = clean_text(page_texts)

    # Tokenize the text into paragraphs
    paragraphs = sent_tokenize(page_text)
    

    # Combine SDG descriptions and paragraphs for vectorization
    combined_texts = sdg_descriptions + paragraphs

    # Vectorize the text using TF-IDF
    vectorizer = TfidfVectorizer()
    vectorized_texts = vectorizer.fit_transform(combined_texts)

    # Dictionary to store the most relevant paragraph for each SDG
    relevant_paragraphs = {}

    # Calculate cosine similarity and find the most relevant paragraph for each SDG
    for i, _ in enumerate(sdg_descriptions, start=1):
        sdg_vector = vectorized_texts[i - 1]
        cos_similarities = cosine_similarity(sdg_vector, vectorized_texts[len(sdg_descriptions):])[0]
        match_idx = np.argmax(cos_similarities)
        if len(paragraphs) <= 3:
            relevant_paragraphs[str(i)] = " ".join(paragraphs)
        elif len(paragraphs) == (match_idx + 1):
            relevant_paragraphs[str(i)] = " ".join(paragraphs[-3:])
        else:
            relevant_paragraphs[str(i)] = " ".join(paragraphs[match_idx-1:match_idx+2])

    return relevant_paragraphs

def is_sentence(line):
    return line[-1] in ".?!:" 
