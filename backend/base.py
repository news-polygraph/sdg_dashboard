import os
from flask import Flask, flash, request, redirect, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
from dotenv import load_dotenv

from analysis.page_analysis.analyse_page import analyse_page

load_dotenv()

# start with a fresh database
with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
    json.dump([], feedsjson)


def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # allow all origins
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.config.from_mapping(
        SECRET_KEY='super secret key',
        DATABASE=os.path.join(app.instance_path, 'yourapplication.sqlite'),
        UPLOAD_FOLDER="",  # Set this to your desired upload folder path
        SESSION_TYPE='filesystem'
    )

    # Load the default configuration if test_config is None
    # otherwise load the test configuration
    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Load default json files
    with open('data_defaults/sdg_data_default.json', 'r') as file:
        sdg_data_default = json.load(file)
    with open('data_defaults/analysis_data_default.json', 'r') as file:
        analysis_data_default = json.load(file)



    print("!! Code is runnning !!")
    # A simple test route to confirm the app is running
    @app.route('/test')
    def test():
        return "App is working!"
    
    @app.route('/descriptions', methods=['GET'])
    def get_sdg_descriptions():
        with open("data_defaults/sdg_descriptions.json", mode='r', encoding='utf-8') as feedsjson:
            descriptions = json.load(feedsjson)

            # transform targets to array of strings
            for sdg in descriptions:
                targets_array = [
                    f"{key} {value}" for key, value in sdg["targets"].items()
                ]
                sdg["targets"] = targets_array 
            
        return descriptions
    
    @app.route('/modules/all', methods=['GET'])
    def get_modules():
        # if full = true, return the entire data of all modules, else make it more lean and only return title + modulnummer
        full = request.args.get('full', default=False, type=bool)
        with open("all_modules.json", mode='r', encoding='utf-8') as feedsjson:
            modules = json.load(feedsjson)

        if full == True:
            return modules
        
        l = []
        for m in modules:
            k = {}
            k["modulnummer"] = m["modulinfos"]["modulnummer"]
            k["titelde"] = m["modulinfos"]["titelde"]
            k["titelen"] = m["modulinfos"]["titelen"]
            l.append(k)
        return l
    
    @app.route('/modules/<id>', methods=['GET'])
    def get_module(id):
        with open("all_modules.json", mode='r', encoding='utf-8') as feedsjson:
            modules = json.load(feedsjson)

        for m in modules:
            if m["modulinfos"]["modulnummer"] == int(id):
                return m
        return []
    
    @app.route('/model', methods=['POST'])
    def t():
        """ client = OpenAI(
            api_key = api-key,
            base_url = "https://api.llama-api.com"
        )

        # # Set chat template
        # DEFAULT_CHAT_TEMPLATE = "{% for message in messages %}\n{% if message['role'] == 'user' %}\n{{ '<|user|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'system' %}\n{{ '<|system|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'assistant' %}\n{{ '<|assistant|>\n'  + message['content'] + eos_token }}\n{% endif %}\n{% if loop.last and add_generation_prompt %}\n{{ '<|assistant|>' }}\n{% endif %}\n{% endfor %}"
        # tokenizer.chat_template = DEFAULT_CHAT_TEMPLATE

        m2 = [
            {
                "role":"system",
                "content":"You are an expert in sustainable development education with a focus on the United Nations Sustainable Development Goals (SDGs). Your task is to identify only the SDGs that are directly and explicitly addressed by a university course module, based on the provided module title, learning outcomes, and course content descriptions. When assigning the SDGs follow the following steps in the given order: 1. Direct Relevance: SDGs must be clearly and explicitly relevant based on the exact terms, topics, or concepts mentioned in (a) Module Title, (b) Learning Outcomes, (c) Course Content. 1.a Module Title: Look for explicit SDG themes in the module title ('titelde', 'titelen'). 1.b Learning Outcomes: Examine specific learning objectives or skills listed for the module to identify SDG priorities ('lernergebnissede', 'lernergebnisseen'). 1.c Course Content: Analyze the listed topics and themes to match them to SDGs ('lerninhaletde', 'lerninhalteen'). 2. Indirect Relevance: In cases where direct relevance cannot be established, consider indirect relevance by evaluating broader impacts. However, prioritize SDGs that align most closely with the module's explicit focus and avoid speculative connections. 2.a Module Title: Reflect on the broader themes and implications of the module title that might relate to SDGs, even if not explicitly mentioned. 2.b Learning Outcomes: Analyze the learning outcomes for potential impacts on sustainable development goals, even if the connection is not directly stated. 2.c Course Content: Evaluate the course content for topics that might have indirect relevance to SDGs, considering the broader context and potential applications of the material. 3. Prioritization: If a module could be assigned to multiple SDGs, focus on the most directly relevant ones. Do not include SDGs that are only indirectly addressed or require significant interpretation beyond the explicit information provided. 4. Source Identification: For each assigned SDG, clearly indicate the step (a. Module Title, b. Learning Outcomes, c. Course Content) where the connection was identified first. 5. Explanation: After assigning the SDGs, provide a concise explanation for all the selected SDGs, clearly describing how the provided descriptions align explicitly with each SDG. Based on the provided information, including the module title, learning outcomes, and course content, assign only the Sustainable Development Goals (SDGs) that are directly and explicitly relevant to the module. For each SDG, clearly indicate where the decision to assign it was made by referencing one of the following steps: (a) Module Title, (b) Learning Outcomes, or (c) Course Content. Additionally, provide a concise explanation for all selected SDGs, describing how the provided descriptions explicitly align with the SDG framework. Ensure your response is structured to include the SDGs with step identification, followed by a brief explanation that justifies your choices based on the information provided. When explaining SDG choices, use the following structure: SDG Number (Step): Brief reason for inclusion."
            },
            {
                "role": "user",
                "content": "For the module with the Module Title: Medical technology in hospitals, the Learning Outcomes: Graduates of this module learn the necessary basics of the engineer working in the medical technology department of a hospital in the application of medical devices used there. By learning about the associated tasks and activities and their relevant aspects, participants will be able to understand the requirements for medical devices from the perspective of a hospital. On completion of the module, graduates will have basic knowledge of medical technology planning, procurement and the operation of medical devices in a healthcare facility. Graduates will be able to make decisions on the targeted application of medical technology in the hospital environment. and the Course Content: Functionality and organisation of hospitals - Medical technology planning - Procurement of Medical devices - Operation of Medical devices - Medical IT: networking and information security. Return an array of the assigned sdgs as objects that consist of the number of the assigned sdg called sdg_number, where the sdg was found (a for Module Title, b for Learning Outcomes and c for Course Content) called found_in and a short explaination, why, called explanation."
            }
        ]

        response = client.chat.completions.create(
            model="mixtral-8x22b-instruct",
            messages=m2,
            response_format = {
                "type": "json_object",
            },
            max_tokens=4096
        )

        return response.choices[0].message.content """
    
        return json.loads('[{ "sdg_number": "3", "found_in": "b", "explanation": "The learning outcome focuses specifically on understanding medical device requirements within hospitals which contributes directly towards ensuring healthy lives at all ages." }, { "sdg_number": "9", "found_in": "c", "explanation": "The inclusionof \'Medical IT\' within operations implies building resilient infrastructure within healthcare institutions which relates back towards strengthening Industry Innovation & Infrastructure." }]')

    @app.route('/upload', methods=['GET', 'POST'])
    def upload_file():
        
        if request.method == 'POST':
            print("File is in Backend")
            # check if the post request has the file part
            if 'file' not in request.files:
                flash('No file part')
                return redirect(request.url)
            file = request.files['file']
            # If the user does not select a file, the browser submits an
            # empty file without a filename.
            if file.filename == '':
                flash('No selected file')
                return redirect(request.url)
            if file:

                # save pdf-file
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                print("----- File saved! ------")

                # save json
                file_data = {
                    "filename": filename,
                    "title": request.form["title"],
                    "sdg_data": sdg_data_default,
                    "analysis_data": analysis_data_default,
                }

                # get current data from file
                with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                    reports = json.load(feedsjson)

                reports.append(file_data)

                # save dict as json
                with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
                    json.dump(reports, feedsjson)

                return {"status": "ok" }

        return '''
        <!doctype html>
        <title>Upload new File</title>
        <h1>Upload new File</h1>
        <form method=post enctype=multipart/form-data>
        <input type=file name=file>
        <input type=submit value=Upload>
        </form>
        '''


    # is triggered after pdf is first shown
    @app.route('/data_initial/<title>')
    def get_initial_file_data(title):
        try:

            with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                feeds = json.load(feedsjson)
                for report in feeds:
                    if report["title"] == title:
                        filename = report["filename"]

            analyse_page(filename, 1)
            analyse_page(filename, 2)

            with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                feeds = json.load(feedsjson)
                for report in feeds:
                    if report["title"] == title:
                        file_data = report


            if filename:
                return file_data
            else:
                return {"status": "no such file"}
    
        except Exception as e:
            return str(e)


    # is triggered when klicking on next page
    @app.route('/data/<title>/<page_number>')
    def get_file_data(title, page_number):
        # try:

            with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                feeds = json.load(feedsjson)
                for report in feeds:
                    if report["title"] == title:
                        filename = report["filename"]
            
            if filename:

                analyse_page(filename, int(page_number)+1)

                with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                    feeds = json.load(feedsjson)
                    for report in feeds:
                        if report["title"] == title:
                            file_data = report

                
                return file_data
            else:
                return {"status": "no such file"}
    
        # except Exception as e:
        #     return str(e)


    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=3001, host='0.0.0.0')
