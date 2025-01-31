from flask import Flask, send_file, abort, request, jsonify, send_from_directory
from flask_cors import CORS
import base64
import os
import json
import logging
from datetime import datetime, timedelta

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
logging.info(f"Process User ID: {os.getuid()}")
logging.info(f"Process Group ID: {os.getgid()}")

# Get the absolute path of the project directory
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=PROJECT_ROOT)
CORS(app)  # Enable CORS for all routes

# Directory to store vCard files
try:
    # Get absolute path with expanded user home directory
    VCARD_STORAGE_DIR = os.path.abspath(os.path.join(PROJECT_ROOT, 'vcards'))
    
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
        data = request.get_json()
        vcard_data = data.get('vCardData')
        unique_hash = data.get('hash')

        # Validate vCard data
        if not vcard_data or not unique_hash:
            logging.warning("Attempted to generate vCard with missing data")
            return jsonify({"error": "Missing vCard data or hash"}), 400

        # Basic validation of vCard structure
        if not vcard_data.startswith('BEGIN:VCARD') or not vcard_data.endswith('END:VCARD'):
            logging.warning("Invalid vCard data format")
            return jsonify({"error": "Invalid vCard data format"}), 400

        # Ensure the hash is URL-safe base64 encoded
        try:
            # Verify the hash can be decoded
            base64.urlsafe_b64decode(unique_hash.encode())
        except Exception as e:
            logging.error(f"Invalid hash format: {e}")
            return jsonify({"error": "Invalid hash format"}), 400

        # Save vCard to file with explicit permission handling
        vcard_filename = os.path.join(VCARD_STORAGE_DIR, f"{unique_hash}.vcf")
        
        # Log the file path for debugging
        logging.info(f"Attempting to save vCard to: {vcard_filename}")
        
        # Use low-level file operations for more control
        try:
            # Open file with explicit permissions, overwrite if exists
            with open(vcard_filename, 'w', encoding='utf-8') as f:
                f.write(vcard_data)
            
            logging.info(f"Successfully saved vCard: {vcard_filename}")
            
            return jsonify({
                "status": "success", 
                "message": "VCard generated successfully",
                "filename": f"{unique_hash}.vcf"
            }), 200
        
        except IOError as e:
            logging.error(f"Error saving vCard: {e}")
            return jsonify({"error": "Could not save vCard file"}), 500

    except Exception as e:
        logging.error(f"Unexpected error generating vCard: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/vcards/<filename>')
def serve_vcard_file(filename):
    try:
        logging.info(f"Attempting to serve vCard file: {filename}")
        return send_from_directory(VCARD_STORAGE_DIR, filename, mimetype='text/vcard', as_attachment=True)
    except Exception as e:
        logging.error(f"Error serving vCard file {filename}: {e}")
        abort(404)

@app.route('/')
def serve_index():
    return send_file(os.path.join(PROJECT_ROOT, 'index.html'))

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory(PROJECT_ROOT, path)
    except Exception as e:
        logging.error(f"Error serving static file {path}: {e}")
        abort(404)

if __name__ == '__main__':
    # Perform initial cleanup on startup
    cleanup_old_vcards()
    app.run(debug=True, host='0.0.0.0', port=8000)