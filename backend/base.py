import os
from flask import Flask, flash, request, redirect, send_file, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
from base64 import b64encode
from dotenv import load_dotenv

from classification.keyword_extraction import get_keywords_page_level, combine_keywords_file_level
from classification.sentence_extraction import sentence_extraction
from classification.prompting import run_prompting_for_file, run_prompting_for_page
from classification.sdg_data_default import sdg_data_default

load_dotenv()

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3002"}})


app.config['UPLOAD_FOLDER'] = ""

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


            # save json
            file_data = {
                "filename": filename,
                "title": request.form["title"],
                "sdg_data": sdg_data_default,
            }

            # get current data from file
            with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
                reports = json.load(feedsjson)

            reports.append(file_data)

            # save dict as json
            with open("file_data.json", mode='w', encoding='utf-8') as feedsjson:
                
                json.dump(reports, feedsjson)

            # will be asyncronus function

            # extract keywords on page level and combine keywords on file level
            page_texts = get_keywords_page_level(filename)
            combine_keywords_file_level(filename)

            # extract relevent sentences on file level
            relevant_paragraphs = sentence_extraction(filename, page_texts)
            
            run_prompting_for_file(filename, relevant_paragraphs)
            run_prompting_for_page(filename, page_texts)
            
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


@app.route('/report/<title>')
def return_file(title):
    try:
        with open("file_data.json", mode='r', encoding='utf-8') as feedsjson:
            feeds = json.load(feedsjson)
            for report in feeds:
                if report["title"] == title:
                    filename = report["filename"]
                    file_data = report

        if filename:
            return file_data
        else:
            return {"status": "no such file"}
 
    except Exception as e:
	    return str(e)
    
app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'
app.run(port=8000, host='0.0.0.0')

# after upload 
    # first analyse first page
    # start asnycronosly analysing the pages
    # send data of first page to frontend
# 