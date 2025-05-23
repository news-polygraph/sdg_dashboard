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

    ## Checking the page for SDG-keywords and extract one paragraph per SDG, if keywords are present. 
    paragraphs_with_keywords, page_data = read_keywords_single_page(filename, page_number)
    ## Sending request to external API to prompt LLM with the summarization of each paragraph.
    summarize_paragraph(paragraphs_with_keywords, page_data)
    ## Using CoT prompt to task the same LLM with classification of each paragraph. 
    contextualize_paragraph(paragraphs_with_keywords, page_data)

    return page_data, page_number


## Parallelizing the prompting for each page, using threads.
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

        ## Writing the results to a file.
        with open("file_data.json", mode="w", encoding="utf-8") as feedsjson:
            json.dump(reports, feedsjson)
        executor.shutdown(wait=True) 

        
