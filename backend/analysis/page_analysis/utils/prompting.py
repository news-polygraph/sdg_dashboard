import os
import json
import logging
import re
import httpx
from openai import OpenAI

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def perform_api_request(prompts: tuple, max_tokens: int) -> str:
    system_prompt, user_prompt = prompts
    api_key = os.environ.get("LEMONFOX_API")
    client = OpenAI(
      api_key=api_key,
      base_url="https://api.lemonfox.ai/v1",
    )

    completion = client.chat.completions.create(
      messages=[
        { "role": "system", "content": system_prompt },
        { "role": "user", "content": user_prompt }
      ],
      model="mixtral-chat",
    )

    return completion.choices[0].message.content or ""

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
        system_prompt = f"""
        You are a analyst that has to write a single sentence summary about a report for his boss. 
        """
        task_prompt = f"""
        Sum up the text in the curly braces and extract the information concerning sdg {sdg_idx}:'{sdg}': '{{{paragraph}}}'
        Keep your summary very short!
        Response: 
        """
        prompt = (system_prompt, task_prompt)
        try:
            max_tokens = 200 
            response = perform_api_request(prompt, max_tokens)
            page_data[f"{sdg_idx}"]["summary"] = response


        except Exception as e:
            print(f"An error occurred: {e}")


def contextualize_paragraph(paragraphs, page_data):
    for sdg_idx,paragraph in paragraphs.items():
        context_system_prompt = f"""
        You are an analysis api that allows a user to evaluate an action taken by a company to contribute to solutions for sustainability. Answer in a json format.  
        """        
        context_prompt = f"""
        Your task is to classify the following actions into one of the categories in the ABC model of impact frontiers and provide a detailed reasoning process with pro and con arguments. 
        Return the result in JSON format with the keys:
            impact_type: The classification (A, B, or C).
            pro: A single string containing arguments that support your claim of the classification.
            con: A single string containing arguments that challenging the chosen classification.

        The ABC model categories are:
            A: Act to avoid harm – The action minimizes negative social or environmental impacts.
            B: Benefit stakeholders – The action creates positive outcomes for stakeholders but is not transformative.
            C: Contribute to solutions – The action aims to create transformational change or solve critical challenges.
        It is imperative that you use the json format!
        Example Action:
            "The company reduces its greenhouse gas emissions to comply with local regulations."
        Output:
         {{"impact_type": "A", "pro": "The action reduces negative environmental impacts, which aligns with minimizing harm.","con": "The action is reactive rather than proactive."}}
        Input Action:
        "{paragraph}"
        Output:
        """
        prompt = (context_system_prompt, context_prompt)
        response_1 = perform_api_request(prompt, 250)
        response_2 = response_1.strip()
        response_3 = response_2.replace("\\", "")
        response_4 = re.sub(r"/('(?= ?\n?,| ?\n?:| ?\n?}))|((?<={|,|:)')|((?<={ |{\n|, |,\n|: |:\n)')/gm", '"', response_3)
        start = response_4.find("{")
        end = response_4.find("}")
        response_5 = response_4[start:end+1]

        try:
            response_json = json.loads(response_5)
            if "impact_type" in response_json.keys() and "pro" in response_json.keys() and "con" in response_json.keys():
                page_data[f"{sdg_idx}"]["context"] = response_json    
        except Exception as e:
            print(f"Exception when parsing json:", e)
            print("Response 1: ", response_1)
            print("Response 5: ", response_5)


