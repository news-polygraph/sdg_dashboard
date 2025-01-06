import fitz
import logging
import time
import json
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed


from .utils.keyword_extraction import read_keywords_single_page, combine_keywords_page_level
from .utils.sentence_extraction import sentence_extraction_for_page
from .utils.prompting import summarize_paragraph, contextualize_paragraph

MAX_THREADS = 32

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def analyse_page(filename, page_number):
    page_data = {}
    # read keywords
    print(f"analyse_page nr {page_number} step 1")
    page_text, page_data = read_keywords_single_page(filename, page_number)
    print(f"analyse_page nr {page_number} step 2")
    relevant_paragraphs = sentence_extraction_for_page(page_text)
    print(f"analyse_page nr {page_number} step 3")
    paragraphs_with_keywords = combine_keywords_page_level(relevant_paragraphs, page_data)
    print(f"analyse_page nr {page_number} step 4")
    summarize_paragraph(paragraphs_with_keywords, page_data)
    print(f"analyse_page nr {page_number} step 5")
    contextualize_paragraph(paragraphs_with_keywords, page_data)
    print(f"analyse_page nr {page_number} step 6")

    return page_data, page_number

def analyse_document(filename): 
    num_pages = 0 
    with fitz.open(filename) as doc:
        num_pages = doc.page_count

    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        futures = []
        for page_number in tqdm(range(1, num_pages+1)):
            future = executor.submit(analyse_page, filename, page_number)
            futures.append(future)
        reports = None
        with open("file_data.json", mode="r", encoding="utf-8") as feedsjson:
            reports = json.load(feedsjson)
        for report in reports:
            if report["filename"] == filename:
                for _, future in enumerate(as_completed(futures)):
                    try:
                        page_data, page_number = future.result()
                        report["sdg_data"][f"{page_number}"] = page_data
                    except Exception as e:
                        print(f"Failed: {e}")
                if len(report["sdg_data"]) != num_pages:
                    len_sdg = len(report["sdg_data"])
                    print(f"ERROR | len(sdg_data)({len_sdg}) != to num_pages({num_pages})")
                    # print(report["sdg_data"])

        with open("file_data.json", mode="w", encoding="utf-8") as feedsjson:
            json.dump(reports, feedsjson)
        executor.shutdown(wait=True) 

    print("Everything done")
        
