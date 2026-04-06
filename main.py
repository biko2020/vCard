# Copied from app.py
from flask import Flask, send_file, abort, request, jsonify, send_from_directory
from flask_cors import CORS
import base64
import os
import json
import logging
from datetime import datetime, timedelta

# Werkzeug import compatibility
try:
	from werkzeug.urls import url_quote
except ImportError:
	from urllib.parse import quote as url_quote

# Attempt to set process-wide umask
try:
	os.umask(0o022)
except Exception as e:
	logging.warning(f"Could not set umask: {e}")

# Configure logging with more detailed information
logging.basicConfig(
	level=logging.DEBUG,  # Changed to DEBUG for more detailed logs
	format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
	filename='vcard_server.log',
	filemode='a'  # Append mode
)

# Add system information logging
logging.info(f"Current User: {os.getlogin()}")
logging.info(f"Current Working Directory: {os.getcwd()}")
logging.info(f"Process ID: {os.getpid()}")
logging.info(f"Process Group ID: {os.getpid()}")

# Get the absolute path of the project directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Do not set static_folder to PROJECT_ROOT; let Flask use the default
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Directory to store vCard files
try:
	# Get absolute path with expanded user home directory
	VCARD_STORAGE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, 'vcards'))
    
	# Log directory path details
	logging.info(f"Attempting to create vCard storage directory: {VCARD_STORAGE_DIR}")
    
	# Create directory with full permissions
	os.makedirs(VCARD_STORAGE_DIR, exist_ok=True)
    
	# Try to change directory permissions
	try:
		os.chmod(VCARD_STORAGE_DIR, 0o777)  # Full permissions for debugging
		logging.info(f"Successfully set permissions on {VCARD_STORAGE_DIR}")
	except Exception as perm_error:
		logging.error(f"Could not change vcards directory permissions: {perm_error}")
		logging.error(f"Current directory permissions: {oct(os.stat(VCARD_STORAGE_DIR).st_mode & 0o777)}")

except Exception as e:
	logging.critical(f"FATAL: Could not create vcards directory: {e}")
	# Optionally raise the exception to stop application startup
	raise

def cleanup_old_vcards(max_age_days=7):
	"""
	Remove vCard files older than max_age_days
	"""
	try:
		current_time = datetime.now()
		for filename in os.listdir(VCARD_STORAGE_DIR):
			filepath = os.path.join(VCARD_STORAGE_DIR, filename)
			file_modified = datetime.fromtimestamp(os.path.getmtime(filepath))
            
			if current_time - file_modified > timedelta(days=max_age_days):
				os.remove(filepath)
				logging.info(f"Removed old vCard: {filename}")
	except Exception as e:
		logging.error(f"Error during vCard cleanup: {e}")


@app.route('/generate_vcard', methods=['POST'])
def generate_vcard():
	try:
		# Check if the request is multipart/form-data
		if request.content_type and 'multipart/form-data' in request.content_type:
			# Extract data from form
			vcard_data = request.form.get('vCardData')
			unique_hash = request.form.get('hash')
            
			# Add detailed logging for file uploads
			if 'profile' in request.files:
				file = request.files['profile']
				logging.info(f"Uploaded file name: {file.filename}")
				logging.info(f"Uploaded file size: {len(file.read())} bytes")
				file.seek(0)  # Reset file pointer after reading
            
			# Handle profile photo if uploaded
			profile_file = request.files.get('profile')
			if profile_file:
				pass  # ...existing code...
		# ...existing code for other content types and error handling...
	except Exception as e:
		logging.error(f"Error in generate_vcard: {e}")
		return jsonify({'error': 'Failed to generate vCard'}), 500

# ...rest of your Flask routes and logic...

if __name__ == "__main__":
	app.run(debug=True)
# ...existing code from app.py will be moved here...