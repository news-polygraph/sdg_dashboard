import pytest
from flask_testing import TestCase
from ..base import create_app  # Adjust this import based on your app structure

import json
# Load default json files
with open('data_defaults/sdg_data_default.json', 'r') as file:
    sdg_data_default = json.load(file)
with open('data_defaults/analysis_data_default.json', 'r') as file:
    analysis_data_default = json.load(file)

reports_data_default = [{
                    "filename": "1604404731.pdf",
                    "title": "test_title",
                    "sdg_data": sdg_data_default,
                    "analysis_data": analysis_data_default,
                }]

with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
    json.dump(reports_data_default, feedsjson)


class TestAnalysePage(TestCase):

    def create_app(self):
        # Return your Flask app with test configuration
        app = create_app()
        app.config['TESTING'] = True
        return app

    def test_analyse_page(self):
        # Assuming analyse_page is an endpoint or a function you can call directly
        # You might need to adjust this part to fit your application structure

        title = "test_title"  # Ensure this test file exists and is appropriate for testing
        page_number = 3

        # If analyse_page is an endpoint:
        response = self.client.get(f'/data/{title}/{page_number}')  # Adjust URL as necessary
        self.assertEqual(response.status_code, 200)

        
        # If directly calling the function, you might need to mock dependencies:
        # result = analyse_page(filename, page_number)
        # Assert based on the expected outcome of your function

# Add more tests as needed for different scenarios and edge cases
