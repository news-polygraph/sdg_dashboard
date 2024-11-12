# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt 
RUN python -m spacy download en_core_web_sm

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "-u", "base.py"]
# CMD ["python", "base.py"]
# CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "base.py"]