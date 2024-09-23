
import os
from openai import OpenAI
import json
import requests


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

    api_url = os.environ.get("MISTRAL_API_URL")

    relevant_text = " ".join(relevant_paragraphs.values())

    prompt = "Analyze the given text from a company report and provide key facts categorized under emissions, resources, energy, waste, employees, and audits. Format the response as a JSON object with each category as a key and the key facts as the value. For example: { 'emissions': '<fact>', 'resources': '<fact>', 'energy': '<fact>', 'waste': '<fact>', 'employees': '<fact>', 'audits': '<fact>' }. The text: '"+relevant_text+"'"

    
        # response = client.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=[{"role": "user", "content": prompt}],
        #     max_tokens= 200,
        # )
    data = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 200}
    }
    headers = {
        'Authorization': 'Bearer your_api_token',
        'Content-Type': 'application/json'
    }
    try:
        response = requests.post(api_url, json=data, headers=headers)
        if response.status_code == 200:
            print("Prompt", relevant_text)
            print("Success", response.json()['generated_text'])
        else:
            print(f"Failed with status code: {response.status_code}")
    except Exception as e:
        print(f"An error occurred: {e}")


    # with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
    #   reports = json.load(feedsjson)
    #
    #    # add results for page of a certain report to the dict
    # for report in reports:
    #     if report["filename"] == filename:
    #             data_page_level = report["sdg_data"]
    #             pass
    #
    #
    # # add amount of keywords to report data and save in json
    # if "analysis_data" in report:
    #     report["analysis_data"]["category_claims"] = category_claims
    # else:
    #     report["analysis_data"] = {"category_claims": category_claims}
    #
    # with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
    #     json.dump(reports, feedsjson)


def run_prompting_for_paragraphs(filename, paragraphs, page_number):
    api_url = os.environ.get("MISTRAL_API_URL")

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
    llm_responses = {}
    with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
      reports = json.load(feedsjson)

    for sdg_idx, paragraph in paragraphs.items():
        sdg = sdg_descriptions[int(sdg_idx)-1]
        prompt = f"""
        Task: Analyze and contextualize the following paragraph from a sustainability report according to Sustainable Development Goal {sdg}.

        Paragraph:
        {paragraph}

        In your analysis, please:

        Explain how the paragraph aligns with SDG X: Identify the connections between the actions or themes in the paragraph and the key targets or indicators of the SDG.
        Evaluate the impact: Assess the potential positive or negative impacts of the described actions or policies on achieving the targets of SDG X.
        Provide contextual insights: Discuss the broader context of these actions, considering industry best practices, global trends, or challenges related to SDG X.
        Suggest improvements: Offer recommendations or strategies that could further enhance alignment with the SDG or improve outcomes. 
        """
        data = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 200}
        }
        headers = {
            'Content-Type': 'application/json'
        }
        try:
            response = requests.post(api_url, json=data, headers=headers)
            if response.status_code == 200:
                print("+++ Success +++")
                print("Paragraph:", paragraph)
                print("Response:", response.json()['generated_text'])
                for report in reports:
                    if report["filename"] == filename:
                        report["sdg_data"][f"{page_number}"][f"{sdg_idx}"]["nl_explanation"] = response.json()['generated_text']
                        break
            else:
                print(f"Failed with status code: {response.status_code}")
        except Exception as e:
            print(f"An error occurred: {e}")
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

