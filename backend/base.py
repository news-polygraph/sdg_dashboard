from flask import Flask, flash, request, redirect, jsonify
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import json
from dotenv import load_dotenv
import os
import requests

from analysis.page_analysis.analyse_page import analyse_page
from openai import OpenAI
from llamaapi import LlamaAPI  # Neue Import


load_dotenv()
uri = "mongodb+srv://<db_user>:<db_password>@sdg.uzifr.mongodb.net/?retryWrites=true&w=majority&appName=SDG"
uri = uri.replace("<db_password>", os.getenv("DB_PW")).replace("<db_user>", os.getenv("DB_USER"))

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['SDGs']

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

load_dotenv()

# start with a fresh database
with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
    json.dump([], feedsjson)


def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # allow all origins
    CORS(app, resources={r"*": {"origins": "*"}}, supports_credentials=True)

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
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error("Unhandled Exception", exc_info=True)
        return jsonify({"error": "Something went wrong, please answer to our email, explainig what you were trying to do and for which module the error happened. Thanks and sorry for the inconvenience!"}), 500
    
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

        if full == True:
            return list(db["modules"].find({}, {"_id": 0}))
        
        # return list(db["modules"].find({},{"_id": 0, "modulinfos.modulnummer": 1, "modulinfos.titelde": 1, "modulinfos.titelen": 1})) 

        pipeline = [
            {"$project": {"_id": 0, "modulinfos.modulnummer": 1, "modulinfos.titelde": 1, "modulinfos.titelen": 1}},
            {"$replaceRoot": {"newRoot": "$modulinfos"}}
        ]

        return list(db["modules"].aggregate(pipeline))

    @app.route('/modules/<id>', methods=['GET'])
    def get_module(id):
        return list(db["modules"].find({"modulinfos.modulnummer": int(id)}, {"_id": 0}))[0]
    
    def format_req(message, m):
        # titel
        if m["titelen"] != "":
            message = message.replace("{%moduletitel%}", m["titelen"])
        else:
            message = message.replace("{%moduletitel%}", m["titelde"])
        
        # lernergebnisse
        if m["lernergebnisseen"] != "":
            message = message.replace("{%learningoutcomes%}", m["lernergebnisseen"])
        else:
            message = message.replace("{%learningoutcomes%}", m["lernergebnissede"])

        # lehrinhalte
        if m["lehrinhalteen"] != "":
            message = message.replace("{%coursecontent%}", m["lehrinhalteen"])
        else:
            message = message.replace("{%coursecontent%}", m["lehrinhaltede"])

        return message

    
    @app.route('/model', methods=['POST'])
    def t():
        module = request.get_json()

        sdgs = db["modules"].find_one({ "modulinfos.modulnummer": int(module["modulnummer"]) },{ "sdgs": 1, "_id": 0 })["sdgs"]
        if sdgs:
            return sdgs

        with open("model_requests.json", mode='r', encoding='utf-8') as feedsjson:
            mr = json.load(feedsjson)

            try:
                # Initialize the Llama SDK
                llama = LlamaAPI(os.getenv("API_KEY"))

                # Build the API request
                api_request_json = {
                    "model": "llama3.3-70b",
                    "messages": mr["prompt_final"] + [{
                        "role": "user",
                        "content": format_req(mr["model_req_final"], module)
                    }],
                    "response_format": {"type": "json_array"},
                    "stream": False
                }

                # Execute the request
                response = llama.run(api_request_json)

                # Get the result
                try:
                    result = json.loads(response.json()["choices"][0]["message"]["content"])
                except:
                    j = response.json()["choices"][0]["message"]["content"].replace("```\n","").replace("\n```","").replace("```json\n","")
                    result = json.loads(j)

                # write result into db
                update = {"$set": {"sdgs": result}}
                db["modules"].update_one(
                    {"modulinfos.modulnummer": int(module["modulnummer"])}, 
                    update
                )

                return result

            except Exception as e:
                print(f"Error calling Llama API: {str(e)}")
                return jsonify({"error": "Error processing request"}), 500
    
    @app.route('/feedback/<id>', methods=['POST'])
    def process_feedback(id):
        r = request.get_json()

        update_result = db["modules"].update_one(
            { 
                "editorinfos.sdg": int(r["sdg"]),
                "modulinfos.modulnummer": int(id)
            },
            {
                "$set": {
                    "editorinfos.$[elem].chosen": r["chosen"],
                    "editorinfos.$[elem].explanation": r["explanation"]
                }
            },
            array_filters=[{ "elem.sdg": int(r["sdg"]) }]
        )

        # if no update => insert:
        if update_result.modified_count == 0:
            db["modules"].update_one({"modulinfos.modulnummer": int(id)}, {"$push": {"editorinfos": r}})

        # return editorinfos
        return db["modules"].find_one({ "modulinfos.modulnummer": int(id) },{ "editorinfos": 1, "_id": 0 })["editorinfos"]
    
    """@app.route('/insertcustom', methods=['GET'])
    def insertcustom():
        with open("custom_sdgs.json", mode='r', encoding='utf-8') as feedsjson:
            sdgs = json.load(feedsjson)

            for sdg in sdgs:
                update = {"$set": {"sdgs": sdg["sdgs"]}}
                result = db["modules"].update_one({"modulinfos.modulnummer": int(sdg["modulnummer"])}, update)

        return []
    """

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
