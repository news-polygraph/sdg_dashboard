import fitz 
import json
from tqdm import tqdm

def generate_sample_data(filename):
    num_pages = 0
    with fitz.open(filename) as doc:
        num_pages = doc.page_count

    
    try:
        with open('data_defaults/analysis_data_default.json', 'r') as file:
            analysis_data_default = json.load(file)
    except Exception as e:
        print(f"Error in generate_sample_data: {e}")
        exit()

    file_data = [{
        "filename": filename,
        "title": "Testtitle",
        "sdg_data": {},
        "analysis_data": analysis_data_default,
    }]
    sdg_data = {}
    for page in range(1, num_pages+1):
        sdg_data[f"{page}"] = {}
        for sdg_idx in range(1,18):
            if sdg_idx == 5:
                sdg_data[f"{page}"][f"{sdg_idx}"]= {
                    "score": 0.5,
                    "factuality": 0,
                    "tense": 0,
                    "category": None,
                    "keywords": ["testword"],
                    "sequences": [],
                    "classify":"Act to avoid harm",
                    "summary":"Here is the summary of the paragraph.",
                    "context":{"impact":"medium",
                               "pro":"This is the pro argument",
                               "con":"This is the con argument"}                       
                }
            else:
                sdg_data[f"{page}"][f"{sdg_idx}"]= {
                    "score": 0.5,
                    "factuality": 0,
                    "tense": 0,
                    "category": None,
                    "keywords": ["testword"],
                    "sequences": [],
                }

    file_data[0]["sdg_data"] = sdg_data
    return file_data




