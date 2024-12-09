import unittest
import logging
import json
from ..analyse_page import analyse_document, analyse_page
from pathlib import Path


logging.basicConfig(level=logging.INFO)

class AnalysisTest(unittest.TestCase):

        
    def test_analyse_page(self):
        filename = "2016_adidas_sustainability_progress_report_qg3dto-1.pdf"
        logging.info("Running test_analyse_page")
        analyse_page(filename, 19)

    def test_analyse_doc(self):
        filename = "2016_adidas_sustainability_progress_report_qg3dto-1.pdf"
        logging.info("Running test_analyse_page")
        analyse_document(filename)


if __name__ == '__main__':
    unittest.main()

