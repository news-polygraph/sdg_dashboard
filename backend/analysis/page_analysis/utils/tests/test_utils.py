import unittest
from mock import patch
from analysis.page_analysis.utils.keyword_extraction import read_keywords_single_page, combine_keywords_page_level
from analysis.page_analysis.utils.prompting import perform_api_request, summarize_paragraph, contextualize_paragraph
from analysis.page_analysis.utils.sentence_extraction import sentence_extraction_for_page

class PromptingTest(unittest.TestCase):
    def setUp(self):
        self.paragraph = "In 2016, we kicked off an ambi-tious lighting retrofit in our largest US distribution centre in Spartanburg, USA. The sophisticated lighting control system and high-quality LED lighting optimises light levels and energy savings, and responds dynamically to the demands of the centre’s operation in real time. While the retrofit project will be responsible for an estimated 88% of lighting energy reduction, it is also the biggest green ENERGY Fund project since its launch in 2012."
        self.page_data = {"7":{"keywords":[]}}
        

    def test_perform_request(self):
        prompt = ("You are a friendly cowboy.", "Hello, nice to meet you.")
        responses = []
        for _ in range(10):
            result = perform_api_request(prompt, 20)
            responses.append(result)
        response_set = set(responses)
        print(response_set)
        # self.assertTrue(len(result) > 0)

    def test_summarize_paragraph(self):
        paragraphs = {"7":self.paragraph}
        summarize_paragraph(paragraphs, self.page_data)
        self.assertTrue("summary" in self.page_data["7"].keys())

    def test_contextualize_paragraph(self):
        paragraphs = {"7":self.paragraph}
        contextualize_paragraph(paragraphs, self.page_data)
        self.assertTrue("context" in self.page_data["7"].keys())
        print(self.page_data["7"]["context"])
        self.assertEqual(type(self.page_data["7"]["context"]), dict)
        self.assertTrue(len(self.page_data["7"]["context"]))



class ExtractionTest(unittest.TestCase):
    
    @patch('analysis.page_analysis.utils.keyword_extraction.read_single_page_from_pdf')
    def test_read_keywords_single_page(self, mock_func):
        mock_func.return_value = "This is a poor sample."
        text, data = read_keywords_single_page("filename.pdf", 1)
        print(data)
        self.assertEqual("This is a poor sample.", text)
        self.assertEqual(len(data), 17)
        self.assertEqual(len(data['1']['keywords']), 1)

    def test_sentence_extraction_for_page(self):
        text = "This is the first sentence. This is the second one. This is the third one."
        sdg_paragraphs = sentence_extraction_for_page(text)
        self.assertEqual(len(sdg_paragraphs), 17)
        self.assertEqual(text, sdg_paragraphs["5"])

    def test_combine_keywords_page_level(self):
        sdg_data = {'1': {'keywords': [{'word': 'poor', 'char': (1, 2)}],}, 
                      '2': {'keywords': []}, 
                      '3': {'keywords': []}, 
                      '4': {'keywords': []}, 
                      '5': {'keywords': []}, 
                      '6': {'keywords': []}, 
                      '7': {'keywords': []}, 
                      '8': {'keywords': []}, 
                      '9': {'keywords': []}, 
                      '10': {'keywords': []}, 
                      '11': {'keywords': []}, 
                      '12': {'keywords': []}, 
                      '13': {'keywords': []}, 
                      '14': {'keywords': []}, 
                      '15': {'keywords': []}, 
                      '16': {'keywords': []}, 
                      '17': {'keywords': []}}
        paragraphs = {"1":"Im still in.", "2":"Im out."}
        result = combine_keywords_page_level(paragraphs, sdg_data) 
        self.assertEqual(len(result), 1)
        self.assertEqual(result.pop('1', None), paragraphs["1"])


if __name__ == '__main__': 
    unittest.main()

