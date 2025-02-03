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
        # Check if the request is multipart/form-data
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Extract data from form
            vcard_data = request.form.get('vCardData')
            unique_hash = request.form.get('hash')
            
            # Handle profile photo if uploaded
            profile_file = request.files.get('profile')
            if profile_file:
                # Read file contents and convert to base64
                photo_data = base64.b64encode(profile_file.read()).decode('utf-8')
                photo_type = profile_file.content_type.split('/')[-1]
                
                # Modify vCard data to include photo
                vcard_lines = vcard_data.split('\n')
                
                # Remove any existing PHOTO line
                vcard_lines = [line for line in vcard_lines if not line.startswith('PHOTO')]
                
                # Insert new PHOTO line just before END:VCARD
                photo_line = f'PHOTO;ENCODING=BASE64;TYPE={photo_type}:{photo_data}'
                vcard_lines.insert(-1, photo_line)
                
                vcard_data = '\n'.join(vcard_lines)
            else:
                # If no photo uploaded, use default image
                default_photo_path = os.path.join(PROJECT_ROOT, 'assets', 'images', 'default-pic.png')
                try:
                    with open(default_photo_path, 'rb') as f:
                        default_photo_data = base64.b64encode(f.read()).decode('utf-8')
                    
                    # Modify vCard data to include default photo
                    vcard_lines = vcard_data.split('\n')
                    vcard_lines = [line for line in vcard_lines if not line.startswith('PHOTO')]
                    photo_line = f'PHOTO;ENCODING=BASE64;TYPE=png:{default_photo_data}'
                    vcard_lines.insert(-1, photo_line)
                    
                    vcard_data = '\n'.join(vcard_lines)
                except Exception as e:
                    logging.warning(f"Could not read default photo: {e}")
        
        # If JSON data is sent
        elif request.is_json:
            data = request.get_json()
            vcard_data = data.get('vCardData')
            unique_hash = data.get('hash')
        
        else:
            logging.warning("Unsupported request content type")
            return jsonify({"error": "Unsupported request content type"}), 400

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
def serve_vcard_webpage(filename):
    """
    Serve a vCard file as an HTML webpage
    
    Args:
        filename (str): Name of the vCard file to display
    
    Returns:
        str: HTML representation of the vCard
    """
    try:
        logging.info(f"Attempting to serve vCard webpage for: {filename}")
        return parse_vcard_to_html(filename)
    except Exception as e:
        logging.error(f"Error serving vCard webpage for {filename}: {e}")
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

def parse_vcard_to_html(filename):
    """
    Parse a vCard file and convert its contents to an HTML representation.
    
    Args:
        filename (str): Name of the vCard file to parse
    
    Returns:
        str: HTML representation of the vCard
    """
    import vobject
    import os
    import base64
    
    try:
        with open(os.path.join(VCARD_STORAGE_DIR, filename), 'r') as f:
            vcard = vobject.readOne(f)
        
        # Extract vCard details
        name = vcard.fn.value if hasattr(vcard, 'fn') else 'N/A'
        phone = vcard.tel.value if hasattr(vcard, 'tel') else 'N/A'
        email = vcard.email.value if hasattr(vcard, 'email') else 'N/A'
        note = vcard.note.value if hasattr(vcard, 'note') else ''
        url = vcard.url.value if hasattr(vcard, 'url') else ''
        
        # Handle photo
        photo_data = None
        if hasattr(vcard, 'photo'):
            try:
                # Try to get photo data
                photo = vcard.photo
                
                # Check different possible encodings
                if hasattr(photo, 'encoding'):
                    if photo.encoding.lower() in ['base64', 'b']:
                        # If already base64 encoded
                        photo_data = f"data:{getattr(photo, 'type', 'image/png')};base64,{photo.value}"
                    else:
                        # Try to convert to base64
                        photo_data = f"data:{getattr(photo, 'type', 'image/png')};base64,{base64.b64encode(photo.value).decode('utf-8')}"
                else:
                    # Try to convert raw data to base64
                    photo_data = f"data:image/png;base64,{base64.b64encode(photo.value).decode('utf-8')}"
            except Exception as e:
                logging.warning(f"Error processing photo: {e}")
                photo_data = None
        
        # Default photo if none found
        if not photo_data:
            # Use absolute path to default image
            default_photo_path = os.path.join(PROJECT_ROOT, 'assets', 'images', 'default-pic.png')
            
            # Read and convert default photo to base64
            try:
                with open(default_photo_path, 'rb') as f:
                    default_photo_data = base64.b64encode(f.read()).decode('utf-8')
                    photo_data = f"data:image/png;base64,{default_photo_data}"
            except Exception as e:
                logging.error(f"Could not read default photo: {e}")
                photo_data = ''  # Fallback to empty string
        
        # HTML template for vCard display
        html_template = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>vCard Details</title>
            <style>
                body {{ font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .vcard-container {{ background-color: #f4f4f4; padding: 20px; border-radius: 8px; }}
                .vcard-header {{ display: flex; align-items: center; margin-bottom: 20px; }}
                .vcard-photo {{ max-width: 150px; max-height: 150px; margin-right: 20px; border-radius: 50%; object-fit: cover; }}
                .vcard-details {{ flex-grow: 1; }}
                .vcard-info {{ margin-bottom: 10px; font-size: 16px; }}
                .vcard-info strong {{ display: inline-block; width: 100px; }}
            </style>
        </head>
        <body>
            <div class="vcard-container">
                <div class="vcard-header">
                    <img src="{photo_data}" alt="Profile Photo" class="vcard-photo">
                    <div class="vcard-details">
                        <h2>{name}</h2>
                        <div class="vcard-info"><strong>Phone:</strong> {phone}</div>
                        <div class="vcard-info"><strong>Email:</strong> {email}</div>
                        <div class="vcard-info"><strong>Note:</strong> {note}</div>
                        <div class="vcard-info"><strong>URL:</strong> <a href="{url}">{url}</a></div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_template
    
    except Exception as e:
        logging.error(f"Error parsing vCard {filename}: {e}")
        return f"Error parsing vCard: {str(e)}"

if __name__ == '__main__':
    # Perform initial cleanup on startup
    cleanup_old_vcards()
    app.run(debug=True, host='0.0.0.0', port=8000)