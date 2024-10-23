import os
from openai import OpenAI
import json
import concurrent.futures

def perform_api_request(prompts: tuple) -> str:
    system_prompt, user_prompt = prompts
    api_key = os.environ.get("LEMONFOX_API")
    api_url = "https://api.lemonfox.ai/v1"
    client = OpenAI(
        api_key=api_key,
        base_url=api_url,
    )
    completion = client.chat.completions.create(
        messages=[
            {"role":"system", "content":system_prompt}, 
            {"role":"user", "content":user_prompt}, 

        ],
        model="mixtral-chat"
    )
    return completion.choices[0].message.content if completion.choices[0].message.content else ""


def summarize_paragraph(filename, paragraphs, page_number):
    sdg_descriptions = [
        "End poverty in all its forms everywhere",
        "End hunger, achieve food security and improved nutrition and promote sustainable agriculture",
        "Ensure healthy lives and promote well-being for all at all ages",
        "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all",
        "Achieve gender equality and empower all women and girls",
        "Ensure availability and sustainable management of water and sanitation for all",
        "Ensure access to affordable, reliable, sustainable and modern energy for all",
        "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all",
        "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation",
        "Reduce inequality within and among countries",
        "Make cities and human settlements inclusive, safe, resilient and sustainable",
        "Ensure sustainable consumption and production patterns",
        "Take urgent action to combat climate change and its impacts",
        "Conserve and sustainably use the oceans, seas and marine resources for sustainable development",
        "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss",
        "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels",
        "Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development"
    ]
    with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
      reports = json.load(feedsjson)

    for sdg_idx, paragraph in paragraphs.items():
        sdg = sdg_descriptions[int(sdg_idx)-1]
        summary_system_prompt = f"""
        You are a analyst that has to write a single sentence summary about a report for his boss. 
        """
        summary_prompt = f"""
        The summary has to be as short as possible and focus on points concerning the SDG {sdg_idx} 
        '{sdg}'. 
        Report: {paragraph} 
        Summary: 
        """
        classify_system_prompt = f"""
        You are a robot that labels statements with categories.
        """
        classify_prompt = f"""
        Classify the actions described in the following text in on of 3 categories. 
        Act to avoid harm, Benefit stakeholders, Contribute to solutions.
        
        Text: We donate parts of our income to charities in the third world. 
        Class: Contribute to solutions
        
        Text: We reduce our carbon emissions by 20 %.
        Class: Act to avoid harm
        
        Text: I want our business to profit from sustainability.
        Class: Benefit stakeholders 
        
        Text: {paragraph}  
        Class: 
        """
        analyze_prompts = [(summary_system_prompt, summary_prompt), (classify_system_prompt, classify_prompt)]
        try:
            with concurrent.futures.ThreadPoolExecutor() as executor:
                results = executor.map(perform_api_request, analyze_prompts)
            for idx, response in enumerate(results):
                for report in reports:
                    if report["filename"] == filename:
                        if idx == 0:
                            report["sdg_data"][f"{page_number}"][f"{sdg_idx}"]["summary"] = response
                            break
                        if idx == 1:
                            report["sdg_data"][f"{page_number}"][f"{sdg_idx}"]["classify"] = response
                            break
        except Exception as e:
            print(f"An error occurred: {e}")
    with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
        json.dump(reports, feedsjson)


def contextualize_paragraph(filename, paragraphs, page_number):
    with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
        reports = json.load(feedsjson)
    for sdg_idx,_ in paragraphs.items():
        summary = ""
        for report in reports:
            if report["filename"] == filename:
                summary = report["sdg_data"][f"{page_number}"][f"{sdg_idx}"]["summary"]
        context_system_prompt = f"""
        You are an analyst that has to evaluate an action taken by a company to contribute to solutions for to ensure 
        access to affordable, reliable, sustainable and modern energy for all. Determine if the action is valuable and 
        """        
        context_prompt = f"""
        explain thought process. Just provide an evaluation dont offer a new action. 

        Action:We compensate 10% of our fossil energy use by buying forest in canada.
        Evaluation:10% is not much compared to other companies. 
        Additionally buying a forest does not bring a new value to the environment. 
        Therfore the action is not optimal.

        Action:We invest 5% of our income into renewable energy sources, because we believe that green energy is 
        the key to a green future.
        Evaluation:Investing 5% of the total income is a significant step and renewable energy effectively stops 
        emissions. Therefore the action is usefull.

        Action:{summary}
        Evaluation: 
        """
        prompt = (context_system_prompt, context_prompt)
        response = perform_api_request(prompt)
        for report in reports:
            if report["filename"] == filename:
                report["sdg_data"][f"{page_number}"][f"{sdg_idx}"]["context"] = response
    with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
        json.dump(reports, feedsjson)
