import unittest
from ..prompting import perform_api_request

class PromptingTest(unittest.TestCase):

    def setUp(self):
        self.paragraph = "see page 34 for details 50 water savings at our apparel material suppliers 2 2020 At the end of 2016, we achieved 11 savings in water usage, exceeding our annual target. Progress was driven by our initiative Manufacturing Excellence that successfully promoted several improvement measures in water processing and usage in textile production, all of them resulting in increased water efficiency. see page 16 for details Being committed to transparency we measure and disclose the progress made towards our 2020 targets as defined in our Sustainability Strategy at the end of each year."
        self.sdg_text = "Ensure availability and sustainable management of water and sanitation for all"
        self.sdg = 6
        self.sample_summary = "In 2020, the company achieved 50% water savings at apparel material suppliers, surpassing the 2016 target of 11%, with increased efficiency due to the Manufacturing Excellence initiative, as detailed on page 34, contributing to Sustainable Development Goal 6."
        summary_system_prompt_1 = f"""
        You are a analyst that has to write a single sentence summary about a report for his boss. 
        """
        summary_system_prompt_2 = f"""
        Take the role of a sustainability expert.
        """
        summary_system_prompt_3 = f"""
        I want you to act like a scientist.
        """
        self.summary_system_prompts = [summary_system_prompt_1, 
                                       summary_system_prompt_2, 
                                       summary_system_prompt_3]

        context_system_prompt_1 = f"""
        You are a scientist evaluating advantages and disadvantages of a measure implemented by a company.
        """        
        context_system_prompt_2 = f"""
        You are an analyst that has to evaluate an action taken by a company to contribute to solutions for to ensure 
        access to affordable, reliable, sustainable and modern energy for all.  
        """        
        context_system_prompt_3 = f"""
        You are an expert in sustainability.
        """        
        self.context_system_prompts = [context_system_prompt_1, 
                                       context_system_prompt_2,
                                       context_system_prompt_3]

        summary_prompt_1 = f"""
        Summarize the given paragraph and communicate the key points.
        The summary has to be as short as possible and focus on points concerning the SDG  {self.sdg} 
        '{self.sdg_text}'. 
        Paragraph: {self.paragraph} 
        Summary: 
        """
        summary_prompt_2 = f"""
        Sum up the following text:
        '{self.paragraph}'. 
        Extract the most important facts concerning the sustainable developement goal {self.sdg}:
         {self.sdg_text}. Keep your summary very short!
        """
        summary_prompt_3 = f"""
        You have to summarize a text and extract all the important fact concerning a 
            sustainable developement goal.
        Keep your summary as short as possible.
        Text:{self.paragraph} 
        SDG: {self.sdg_text}        
        """
        self.summary_prompts = [summary_prompt_1, summary_prompt_2, summary_prompt_3]

        context_prompt_1_sum = f"""
        Determine if the action is valuable and explain thought process. Just provide an 
        evaluation dont offer a new action. Keep your answer as short as possible.

        Action:We compensate 10% of our fossil energy use by buying forest in canada.
        Evaluation:10% is not much compared to other companies. 
        Additionally buying a forest does not bring a new value to the environment. 
        Therfore the action is not optimal.

        Action:We invest 5% of our income into renewable energy sources, because we believe that green energy is 
        the key to a green future.
        Evaluation:Investing 5% of the total income is a significant step and renewable energy effectively stops 
        emissions. Therefore the action is usefull.

        Action:{self.sample_summary}
        Evaluation: 
        """
        
        context_prompt_2_sum = f"""
        Explain if a described action is usefull with pro and con arguments.

        Action:We compensate 10% of our fossil energy use by buying forest in canada.
        Evaluation: Pro - forests are usefull by storing and converting greenhouse gasses. 
                    Con - 10% is not a big amount and buying a forest does not create new forest.

        Action:We invest 5% of our income into renewable energy sources, because we believe that green energy is 
        the key to a green future.
        Evaluation: Pro - 5% of the whole income is a significant amount and renewable energy is a key factor in CO2 neutrality.
                    Con - It is unclear if new power plants are built, or of which nature their investment is.

        Action:{self.sample_summary}
        Evaluation: 
        """

        context_prompt_3_sum = f"""
        Please evaluate the advantages and disadvantages of a action for sustainability, taken by a company.
        Explain your reasoning.

        Action:50% of our electricity is provided by renewable sources and we want to reach 100% by 2030.
        Evaluation: On one hand 50% of the electricity represents a significant part of their electricity usage and they have clear goals
                    for the future. On the other hand there is no information on the general energy usage like heat or mobility for example.   

        Action:{self.sample_summary}
        Evaluation: 
        """
        self.context_prompt_sum = [context_prompt_1_sum, context_prompt_2_sum, context_prompt_3_sum]

        context_prompt_1_par = f"""
        Determine if the action is valuable and explain thought process. Just provide an 
        evaluation dont offer a new action. Keep your answer as short as possible.

        Action:We compensate 10% of our fossil energy use by buying forest in canada.
        Evaluation:10% is not much compared to other companies. 
        Additionally buying a forest does not bring a new value to the environment. 
        Therfore the action is not optimal.

        Action:We invest 5% of our income into renewable energy sources, because we believe that green energy is 
        the key to a green future.
        Evaluation:Investing 5% of the total income is a significant step and renewable energy effectively stops 
        emissions. Therefore the action is usefull.

        Action:{self.paragraph}
        Evaluation: 
        """
        
        context_prompt_2_par = f"""
        Explain if a described action is usefull with pro and con arguments.

        Action:We compensate 10% of our fossil energy use by buying forest in canada.
        Evaluation: Pro - forests are usefull by storing and converting greenhouse gasses. 
                    Con - 10% is not a big amount and buying a forest does not create new forest.

        Action:We invest 5% of our income into renewable energy sources, because we believe that green energy is 
        the key to a green future.
        Evaluation: Pro - 5% of the whole income is a significant amount and renewable energy is a key factor in CO2 neutrality.
                    Con - It is unclear if new power plants are built, or of which nature their investment is.

        Action:{self.paragraph}
        Evaluation: 
        """

        context_prompt_3_par = f"""
        Please evaluate the advantages and disadvantages of a action for sustainability, taken by a company.
        Explain your reasoning.

        Action:50% of our electricity is provided by renewable sources and we want to reach 100% by 2030.
        Evaluation: On one hand 50% of the electricity represents a significant part of their electricity usage and they have clear goals
                    for the future. On the other hand there is no information on the general energy usage like heat or mobility for example.   

        Action:{self.paragraph}
        Evaluation: 
        """
        self.context_prompt_par = [context_prompt_1_par, context_prompt_2_par, context_prompt_3_par]

    def test_perform_request(self):
        prompt = ("You are a friendly cowboy.", "Hello, nice to meet you.")
        result = perform_api_request(prompt, 20)
        print(result)
        self.assertTrue(len(result) > 0)

    def _print_prompts(self, system_prompt, prompt, response):
        print("======================")
        print("System prompt:")
        print(" ".join(system_prompt.split()))
        print("")
        print("Main Prompt:")
        print(" ".join(prompt.split()))
        print("Reponse:")
        print(" ".join(response.split()))
        print("")

    def evaluate_summary_prompt(self):
        print("==== Summary ====")
        for system_prompt in self.summary_system_prompts:
            for summary_prompt in self.summary_prompts:
                response = perform_api_request((system_prompt, summary_prompt), 200)
                self._print_prompts(system_prompt, summary_prompt, response)

    def evaluate_context_prompt_with_summary(self):
        print("==== Context(Summary) ====")
        for system_prompt in self.summary_system_prompts:
            for context_prompt in self.context_prompt_sum:
                response = perform_api_request((system_prompt, context_prompt), 200)
                self._print_prompts(system_prompt, context_prompt, response)

    def evaluate_context_prompt_with_paragraph(self):
        print("==== Context(Paragraph) ====")
        for system_prompt in self.context_system_prompts:
            for context_prompt in self.context_prompt_par:
                response = perform_api_request((system_prompt, context_prompt), 200)
                self._print_prompts(system_prompt, context_prompt, response)



if __name__ == '__main__': 
    unittest.main()
