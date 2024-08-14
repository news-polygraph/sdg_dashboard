import os
from flask import Flask, flash, request, redirect, send_file, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
from base64 import b64encode
from dotenv import load_dotenv

from analysis.page_analysis.analyse_page import analyse_page

load_dotenv()

app = Flask(__name__)
CORS(app)


app.config['UPLOAD_FOLDER'] = ""

# load default json files
with open('data_defaults/sdg_data_default.json', 'r') as file:
    sdg_data_default = json.load(file)
with open('data_defaults/analysis_data_default.json', 'r') as file:
    analysis_data_default = json.load(file)


@app.route('/data')
def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    
    print("File is in Backend")

    if request.method == 'POST':
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
    try:

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
 
    except Exception as e:
	    return str(e)


app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'
app.run(port=3001, host='0.0.0.0')
