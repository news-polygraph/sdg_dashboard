import os
from flask import Flask, flash, request, redirect, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
from dotenv import load_dotenv

from analysis.page_analysis.analyse_page import analyse_page, analyse_document

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

                # TODO why do we append instead of overwriting? The file is saved in any case
                # get current data from file
                # with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                #     reports = json.load(feedsjson)
                #
                # reports.append(file_data)

                # save dict as json
                with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
                    json.dump([file_data], feedsjson)

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

            filename = ""
            with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                feeds = json.load(feedsjson)
                for report in feeds:
                    if report["title"] == title:
                        filename = report["filename"]

            ## launch analysis
            if filename:
                analyse_document(filename)

            file_data = {}
            with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                feeds = json.load(feedsjson)
                for report in feeds:
                    if report["title"] == title:
                        file_data = report

            if file_data:
                return file_data
            else:
                return {"status": "no such file"}
    
        except Exception as e:
            print(f"Error in get_initial_file_data: {e}")
            exit()


    # is triggered when klicking on next page
    @app.route('/data/<title>/<page_number>')
    def get_file_data(title, page_number):
        # try:
            filename=""
            with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                feeds = json.load(feedsjson)
                for report in feeds:
                    if report["title"] == title:
                        filename = report["filename"]
            
            if filename:

                # thread = threading.Thread(analyse_page(filename, int(page_number)+1))
                # thread.start()
                analyse_page(filename, int(page_number) + 1)
                file_data={}
                with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                    feeds = json.load(feedsjson)
                    for report in feeds:
                        if report["title"] == title:
                            file_data = report

                return file_data if file_data else {"status": "could not read file data"}
            else:
                return {"status": "no such file"}
    
        # except Exception as e:
        #     return str(e)


    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=3001, host='0.0.0.0')
