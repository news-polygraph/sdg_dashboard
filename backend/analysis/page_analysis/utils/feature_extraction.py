import re
import spacy

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

def extract_tense(sentence):
    doc = nlp(sentence)
    
    tense = None
    for token in doc:
        # Check if the token is a verb
        if token.pos_ == "VERB":
            # Auxiliary verb for future tense ("will")
            if "will" in [child.lower_ for child in token.children]:
                tense = "future"
                break
            # Past tense
            elif token.tag_ == "VBD" or token.tag_ == "VBN":
                tense = "past"
                break
            # Present tense
            elif token.tag_ in ["VBZ", "VBP", "VBG"]:
                tense = "present"
                break
    
    if tense is None:
        tense = "Not determined"
    
    return tense


def extract_factuality(sentence):
    # Patterns to search for
    number_pattern = r'\b\d+(\.\d+)?\b'  # Matches integers and decimals
    unit_pattern = r'\b(km|mi|kg|g|lbs|oz|cm|mm|m)\b'  # Example units
    time_pattern = r'\b(\d{1,2}:\d{2}|\d{1,2}(am|pm)|\b(hour|minute|second)s?\b)'  # Time patterns
    location_pattern = r'\b(city|town|country|mountain|river|lake)\b'  # Simplistic location pattern
    
    # Compile patterns into regex objects
    patterns = [number_pattern, unit_pattern, time_pattern, location_pattern]
    
    # Initialize score
    score = 0
    
    # Check each pattern in the sentence
    for pattern in patterns:
        if re.search(pattern, sentence, re.IGNORECASE):
            score += 0.25  # Increment score for each type of information found
    
    return score
