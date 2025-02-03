document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('profile-input');
    const uploadIcon = document.querySelector('.upload-icon');
    const profilePreview = document.getElementById('profile-preview');
    const postInput = document.getElementById('post-input');
    const vCardForm = document.getElementById('vcard-form');

    // Function to reset form and image state
    function resetImageUpload() {
        fileInput.value = '';
        uploadIcon.innerHTML = `
            <p class="upload-text">Download an image (jpeg, png, jpg, svg)</p>
            <span class="upload-size">Maximum size: 5 MB</span>
        `;
        profilePreview.src = '/assets/images/default-pic.png';
    }

    // Enhanced file validation
    function validateFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5 MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];

        if (!file) {
            alert('No file selected.');
            return false;
        }

        if (file.size > maxSize) {
            alert('File is too large. Maximum size is 5 MB.');
            resetImageUpload();
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Please upload JPEG, PNG, JPG, or SVG images.');
            resetImageUpload();
            return false;
        }

        return true;
    }

    // Image preview and preparation
    function prepareImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Create an img element to display in upload-icon div
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'cover';

            // Clear previous content and add new image
            uploadIcon.innerHTML = '';
            uploadIcon.appendChild(img);

            // Update the profile preview
            profilePreview.src = e.target.result;

            // Enable post input if it's currently disabled
            postInput.disabled = false;
            postInput.focus();
        };
        reader.readAsDataURL(file);
    }

    // File input change event
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (validateFile(file)) {
            prepareImagePreview(file);
        }
    });

    // Optional: Prevent form submission without complete details
    vCardForm.addEventListener('submit', function(event) {
        const requiredFields = [fileInput, postInput];
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            event.preventDefault();
            alert('Please fill in all required fields.');
        }
    });

    // Initially disable post input until an image is selected
    postInput.disabled = true;
});