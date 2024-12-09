import os
import json
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def perform_api_request(prompts: tuple, max_tokens: int) -> str:
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
        model="mixtral-chat",
        max_tokens=max_tokens
    )
    return completion.choices[0].message.content if completion.choices[0].message.content else ""


def summarize_paragraph(paragraphs, page_data):
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
    for sdg_idx, paragraph in paragraphs.items():
        sdg = sdg_descriptions[int(sdg_idx)-1]
        summary_system_prompt = f"""
        You are a analyst that has to write a single sentence summary about a report for his boss. 
        """
        summary_prompt = f"""
        Sum up the following text: '{paragraph}'
        Extract the most important facts concerning the sustainable developement goal {sdg_idx}:'{sdg}' 
        Keep your summary very short!
        Response: 
        """
        classify_system_prompt = f"""
        You are a robot that labels statements with categories.
        """
        classify_prompt = f"""
        Classify the actions performed by companies described in the following text, in one of 3 categories. 
        Act to avoid harm(when an action reduces harm a company causes), Benefit stakeholders(an action benefits stakeholders in the company while having a positive effect on the world), Contribute to solutions(a company wants to tackle an external problem).

        
        Text: We donate parts of our income to charities in the third world. 
        Class: Contribute to solutions
        
        Text: We reduce our carbon emissions by 20 %.
        Class: Act to avoid harm
        
        Text: I want our business to profit from sustainability.
        Class: Benefit stakeholders 
        
        Text: {paragraph}  
        Class: 
        """
        analyse_prompts = [(summary_system_prompt, summary_prompt), (classify_system_prompt, classify_prompt)]
        page_data[f"{sdg_idx}"]["paragraph"] = paragraph 
        try:
            for idx, prompt in enumerate(analyse_prompts):
                max_tokens = 200 if idx==0 else 20
                response = perform_api_request(prompt, max_tokens)
                # response = "Act to avoid harm"
                if idx == 0:
                    page_data[f"{sdg_idx}"]["summary"] = response
                    continue
                if idx == 1:
                    if "act to avoid harm" in response.lower():
                        page_data[f"{sdg_idx}"]["classify"] = "Act to avoid harm" 
                    elif "benefit stakeholders" in response.lower():
                        page_data[f"{sdg_idx}"]["classify"] = "Benefit stakeholders" 
                    elif "contribute to solutions" in response.lower():
                        page_data[f"{sdg_idx}"]["classify"] = "Contribute to solutions" 
                    else:
                        page_data[f"{sdg_idx}"]["classify"] = "empty" 


                    continue 
        except Exception as e:
            print(f"An error occurred: {e}")


def contextualize_paragraph(paragraphs, page_data):
    for sdg_idx,_ in paragraphs.items():
        summary = page_data[f"{sdg_idx}"]["summary"]
        context_system_prompt = f"""
        You are an analysis api that allows a user to evaluate an action taken by a company to contribute to solutions for to ensure 
        access to affordable, reliable, sustainable and modern energy for all. Answer in a json format.  
        """        
        context_prompt = f"""
        Classify the described actions impact in the categories small, medium or big and underline your decision with pro and con arguments. Compare the company with competitors in the same field if necessary Generate an answer in json format an make impact, pro and con the keys of the json object.

        Action:We compensate 10% of our fossil energy use by buying forest in canada. 
        Evaluation:  {{"impact": "small", "pro:" "forests are usefull by storing and converting greenhouse gasses.", "con": "10% is not a big amount and buying a forest does not create new forest."}} 
        Action:We invest 5% of our income into renewable energy sources, because we believe that green energy is the key to a green future. 
        Evaluation: {{"impact": "big", "pro": "5% of the whole income is a significant amount and renewable energy is a key factor in CO2 neutrality.", "con": "it is unclear if new power plants are built, or of which nature their investment is."}} 

        Action:{summary}
        Evaluation: 
        """
        prompt = (context_system_prompt, context_prompt)
        response = perform_api_request(prompt, 200)
        try:
            page_data[f"{sdg_idx}"]["context"] = json.loads(response)
        except Exception as e:
            print("Exception when parsing json:", e)


