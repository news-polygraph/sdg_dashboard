import fitz
import logging
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
    page_text, page_data = read_keywords_single_page(filename, page_number)

    relevant_paragraphs = sentence_extraction_for_page(filename, page_text)
    paragraphs_with_keywords = combine_keywords_page_level(relevant_paragraphs, page_data)
    summarize_paragraph(paragraphs_with_keywords, page_data)
    contextualize_paragraph(paragraphs_with_keywords, page_data)

    logger.info(page_data)
    return page_data

def analyse_document(filename): 
    num_pages = 0 
    with fitz.open(filename) as doc:
        num_pages = doc.page_count

    print(f"Num Pages: {num_pages}")
    
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
                for idx, future in enumerate(as_completed(futures)):
                    logger.info(f"Terminated Page {idx+1}")
                    try:
                        result = future.result()
                        report["sdg_data"][f"{idx+1}"] = result       
                    except Exception as e:
                        logger.info(f"Failed with error: {e}")
        with open("file_data.json", mode="w", encoding="utf-8") as feedsjson:
            json.dump(reports, feedsjson)


        executor.shutdown(wait=True) 
    print("Everything done")
        
