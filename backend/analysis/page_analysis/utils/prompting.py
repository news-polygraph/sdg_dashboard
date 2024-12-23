
import os
from openai import OpenAI
import json


def run_prompting_for_page(filename, page_texts):

    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    with open('analysis/page_analysis/utils/prompting.py', 'r') as file:
        page_prompt = file.read()

    with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
        reports = json.load(feedsjson)
        
        # add results for page of a certain report to the dict
        for report in reports:
            if report["filename"] == filename:
                    data_page_level = report["sdg_data"]
                    pass

    to_be_prompted = [1]
    for page_idx, page_text in enumerate(page_texts):
        
        if page_idx in to_be_prompted:
            prompt = page_prompt.replace("to_be_filled", page_text)

            try: 
                # response = client.chat.completions.create(
                #     model="gpt-3.5-turbo",
                #     messages=[{"role": "user", "content": prompt}],
                # )
                page_sdg_data = json.loads(response.choices[0].message.content)
                report["sdg_data"][str(page_idx + 1)] = fill_nones(page_sdg_data)

            except:
                print("--no api calling--")
                report["sdg_data"][str(page_idx + 1)] = create_default_page_sdg_data()    

        else:
            report["sdg_data"][str(page_idx + 1)] = create_default_page_sdg_data()

    with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
        json.dump(reports, feedsjson)



def run_prompting_for_file(filename, relevant_paragraphs):

    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    relevant_text = " ".join(relevant_paragraphs.values())

    prompt = "Analyze the given text from a company report and provide key facts categorized under emissions, resources, energy, waste, employees, and audits. Format the response as a JSON object with each category as a key and the key facts as the value. For example: { 'emissions': '<fact>', 'resources': '<fact>', 'energy': '<fact>', 'waste': '<fact>', 'employees': '<fact>', 'audits': '<fact>' }. The text: '"+relevant_text+"'"

    
    try: 
        # response = client.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=[{"role": "user", "content": prompt}],
        #     max_tokens= 200,
        # )
        category_claims = json.loads(response.choices[0].message.content)
        
    except:
       print("--no api calling--")
       category_claims = {
        "emissions": "extcept emissions",
        "resources": "extcept resources",
        "energy": "extcept energy",
        "waste": "extcept waste",
        "employees": "extcept employees",
        "audit": "extcept audit"
        }     


    with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
      reports = json.load(feedsjson)
    
       # add results for page of a certain report to the dict
    for report in reports:
        if report["filename"] == filename:
                data_page_level = report["sdg_data"]
                pass


    # add amount of keywords to report data and save in json
    if "analysis_data" in report:
        report["analysis_data"]["category_claims"] = category_claims
    else:
        report["analysis_data"] = {"category_claims": category_claims}

    with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
        json.dump(reports, feedsjson)



def create_default_page_sdg_data():

    page_sdg_data = {}
    for sdg in range(1,18):
    
        page_sdg_data[sdg] = {
            "score": 0.1,
            "factuality" : 0.6,
            "tense" : 0.2,
            "category" : "action",
            "nl_explanation" :
            "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
            "keywords" : [
            { "word": "Report", "char" : (5, 9) },
            { "word" : "Company", "char" : (11, 20) },
            ],
            "sequences" : [
            { "sequence": "systematically assessed", "char" : (5, 9) },
            { "sequence" : "Coloplast has reached its 2020 targets", "char" : (5, 9) },
            ],
        }
    
    return page_sdg_data



def fill_nones(page_sdg_data):

    for sdg in range(1,18):
    
        if page_sdg_data[str(sdg)] == None:

            page_sdg_data[str(sdg)] = {
                "score": 0.0,
                "factuality" : 0.0,
                "tense" : 0.0,
                "category" : None,
                "nl_explanation" :
                "No information present",
                "keywords" : [
                ],
                "sequences" : [
                ],
            }
    
    return page_sdg_data

