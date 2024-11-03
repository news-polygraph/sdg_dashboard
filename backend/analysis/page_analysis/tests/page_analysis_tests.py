import unittest
import logging
import json
from ..analyse_page import analyse_document, analyse_page
from pathlib import Path


logging.basicConfig(level=logging.INFO)

class AnalysisTest(unittest.TestCase):

    def setUp(self):
        root_dir = Path(__file__).resolve().parent
        filename = "test_report.pdf"
        self.file_path = root_dir / filename 
        sdg_data_path = root_dir / '../../../data_defaults/sdg_data_default.json' 
        analysis_data_path = root_dir / '../../../data_defaults/analysis_data_default.json' 
        try: 
            with open(sdg_data_path, 'r') as file:
                sdg_data_default = json.load(file)
            with open(analysis_data_path, 'r') as file:
                analysis_data_default = json.load(file)
            file_data = {
                "filename": filename,
                "title": "TestfileAdidas",
                "sdg_data": sdg_data_default,
                "analysis_data": analysis_data_default,
            }
            with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
                json.dump([file_data], feedsjson)
        except Exception as e:
            print(e)
            exit()
        
        

    def test_analyse_page(self):
        logging.info("Running test_analyse_page")
        analyse_page(self.file_path, 7)

    def test_analyse_file(self):
        logging.info("Running test_analyse_file")
        analyse_document(self.file_path)
        logging.info("Completed test_analyse_file")

if __name__ == '__main__':
    unittest.main()

