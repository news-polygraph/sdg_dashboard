import unittest
from ..prompting import perform_api_request

class PromptingTest(unittest.TestCase):

    def test_perform_request(self):
        prompt = ("You are a computer science teacher.", "What is a cross side scripting?")
        result = perform_api_request(prompt)
        print(result)
        self.assertTrue(len(result) > 0)

if __name__ == '__main__': 
    unittest.main()
