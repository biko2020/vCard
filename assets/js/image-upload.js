document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('profile-input');
    const uploadIcon = document.querySelector('.upload-icon');
    const profilePreview = document.getElementById('profile-preview');

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        // File size validation (5 MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. Maximum size is 5 MB.');
            fileInput.value = ''; // Clear the file input
            return;
        }

        // File type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Please upload JPEG, PNG, JPG, or SVG images.');
            fileInput.value = ''; // Clear the file input
            return;
        }

        // Create file reader to display preview
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

            // Also update the profile preview
            profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
});