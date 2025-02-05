// Conditional logging function
const log = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development' 
  ? console.log 
  : () => {};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('vcard-form');
    const previewCard = document.getElementById('preview-card');
    const profilePreview = document.getElementById('profile-preview');
    const namePreview = document.getElementById('name-preview');
    const phonePreview = document.getElementById('phone-preview');
    const emailPreview = document.getElementById('email-preview');
    const postPreview = document.getElementById('post-preview');
    const subcategoryPreview = document.getElementById('subcategory-preview');
    const qrCodeContainer = document.getElementById('qr-code-container');

    const nameInput = document.getElementById('name-input');
    const phoneInput = document.getElementById('phone-input');
    const emailInput = document.getElementById('email-input');
    const profileInput = document.getElementById('profile-input');
    const postInput = document.getElementById('post-input');
    const categorySelect = document.getElementById('category-select');
    const subcategorySelect = document.getElementById('subcategory-select');

    const previewTogglePreview = document.getElementById('preview-toggle-preview');
    const previewToggleQR = document.getElementById('preview-toggle-qr');

    let profileFile = null;  // Declare profileFile at a higher scope

    // Real-time text input updates
    let debounceTimer;
    function debounce(func, delay) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(func, delay);
    }

    function updatePreview() {
        const namePreview = document.getElementById('name-preview');
        const phonePreview = document.getElementById('phone-preview');
        const emailPreview = document.getElementById('email-preview');
        const postPreview = document.getElementById('post-preview');

        namePreview.textContent = nameInput.value || 'Name';
        phonePreview.textContent = phoneInput.value || 'Phone';
        emailPreview.textContent = emailInput.value || 'Email';
        postPreview.textContent = postInput.value || 'Description';
        
        const subcategorySelect = document.getElementById('subcategory-select');
        
        const selectedSubcategory = subcategorySelect.value || 'Subcategory';
               
        subcategoryPreview.textContent = `${selectedSubcategory}`;
    }

    nameInput.addEventListener('input', () => {
        updatePreview();
        debounce(updateQRCode, 1000);  // Calls updateQRCode after 1 second
    });

    phoneInput.addEventListener('input', () => {
        updatePreview();
        debounce(updateQRCode, 1000);
    });

    emailInput.addEventListener('input', () => {
        updatePreview();
        debounce(updateQRCode, 1000);
    });

    subcategorySelect.addEventListener('change', () => {
        updatePreview();
        debounce(updateQRCode, 1000);
    });

    postInput.addEventListener('input', () => {
        updatePreview();
        debounce(updateQRCode, 1000);
    });

    // Profile picture preview
    profileInput.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            profileFile = event.target.files[0];
            updatePreview();
            debounce(updateQRCode, 1000);
            log("Selected file:", profileFile.name, profileFile.size, profileFile.type);
        } else {
            log("No file selected!");
        }
    });
    // Unique reference link generation function
    function generateUniqueReferenceLink() {
        // Validate that all required fields are filled
        const requiredInputs = [nameInput, phoneInput, emailInput];
        const isAllFieldsFilled = requiredInputs.every(input => input.value.trim() !== '');
        
        if (!isAllFieldsFilled) {
            // console.warn('Please fill in all required fields before generating a vCard');
            return null;
        }

        // Use current timestamp and a hash of user data to create a unique link
        const timestamp = new Date().toISOString();
        const uniqueData = `${nameInput.value}${phoneInput.value}${emailInput.value}${timestamp}`;

        // Create URL-safe Base64 encoding
        const uniqueHash = btoa(uniqueData)
            .replace(/\+/g, '-')   // Replace + with -
            .replace(/\//g, '_')   // Replace / with _
            .replace(/=+$/, '')    // Remove trailing =
            .substring(0, 16);     // Limit length

        // Construct a unique reference link
        const baseUrl = window.location.origin;
        const referenceLink = `${baseUrl}/vcards/${uniqueHash}.vcf`;

        return {
            link: referenceLink,
            hash: uniqueHash
        };
    }

    // QR Code generation function

    let uniqueHash = '';  // Store the hash once per session

    function updateQRCode() {
        // Only generate unique hash if all fields are filled
        if (!uniqueHash) {
            const uniqueHashResult = generateUniqueReferenceLink();
            if (!uniqueHashResult) return; // Stop if fields are not filled
            uniqueHash = uniqueHashResult.hash;
        }

        const name = nameInput.value;
        const phone = phoneInput.value;
        const email = emailInput.value;
        const post = postInput.value;
        const category = categorySelect.value;
        const subcategory = subcategorySelect.value;

        const referenceLink = `${window.location.protocol}//${window.location.host}/vcards/${uniqueHash}.vcf`;

        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL:${phone}
EMAIL:${email}
CATEGORIES:${category}
TITLE:${subcategory}
NOTE:${post}
PHOTO:${profileFile ? profileFile : ''}
URL:${referenceLink}
UID:${uniqueHash}
END:VCARD`;

        const qr = qrcode(0, 'M');
        qr.addData(vCardData);
        qr.make();
        qrCodeContainer.innerHTML = qr.createImgTag(5);

        saveVCardToServer(vCardData, uniqueHash); // Save only once per session

        // Update reference link
        let referenceLinkElement = document.getElementById('reference-link');
        if (!referenceLinkElement) {
            referenceLinkElement = document.createElement('div');
            referenceLinkElement.id = 'reference-link';
            qrCodeContainer.appendChild(referenceLinkElement);
        }
        referenceLinkElement.innerHTML = `
        <strong>Unique Reference Link:</strong> 
        <a href="${referenceLink}" target="_blank">${referenceLink}</a>
    `;
    }

    // Call only when the form is submitted
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        updateQRCode();  // Only generate one vCard per session
    });


    // Toggle between Preview and QR Code
    function updatePhoneDisplay() {
        if (previewTogglePreview.checked) {
            previewCard.style.display = 'block';
            qrCodeContainer.style.display = 'none';
        } else {
            previewCard.style.display = 'none';
            qrCodeContainer.style.display = 'block';
        }
    }

    // Add event listeners to toggle buttons
    previewTogglePreview.addEventListener('change', updatePhoneDisplay);
    previewToggleQR.addEventListener('change', updatePhoneDisplay);

    // Initial display setup
    updatePhoneDisplay();
    updateQRCode();

    // Add form submission event listener
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');
        profileFile = formData.get('profile');  // Update profileFile here
        const subcategory = formData.get('subcategory');
        const post = formData.get('post');

        // Default profile picture if no file is selected
        const reader = new FileReader();
        reader.onload = (event) => {
            profilePreview.src = event.target.result || 'assets/images/default-pic.png';

            // Update Preview Details
            namePreview.textContent = name;
            phonePreview.textContent = phone;
            emailPreview.textContent = email;
            postPreview.textContent = post;
            subcategoryPreview.textContent = subcategory;


            // Generate QR Code
            const qr = qrcode(0, 'M');
            const { link: referenceLink, hash: uniqueHash } = generateUniqueReferenceLink();
            const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${name || ''}
TEL:${phone || ''}
EMAIL:${email || ''}
X-SUBCATEGORY:${subcategory || ''}
NOTE:${post || ''}
PHOTO:${profileFile ? profileFile : ''}
URL:${referenceLink || ''}
UID:${uniqueHash || ''}
END:VCARD`;
            

            qr.addData(vCardData);
            qr.make();
            qrCodeContainer.innerHTML = qr.createImgTag(5);

            // Save vCard to server
            saveVCardToServer(vCardData, uniqueHash);

            // Optional: Display the reference link
            const referenceLinkElement = document.getElementById('reference-link');
            if (referenceLinkElement) {
                referenceLinkElement.remove();
            }
            const newReferenceLinkElement = document.createElement('div');
            newReferenceLinkElement.id = 'reference-link';

            // Construct a fully qualified URL
            const fullReferenceLink = `${window.location.protocol}//${window.location.host}/vcards/${uniqueHash}.vcf`;

            newReferenceLinkElement.innerHTML = `
                <strong>Unique Reference Link:</strong> 
                <a href="${fullReferenceLink}" target="_blank">${fullReferenceLink}</a>
            `;
            qrCodeContainer.appendChild(newReferenceLinkElement);
        };

        // If no file is selected, use default image
        if (profileFile && profileFile.size > 0) {
            reader.readAsDataURL(profileFile);
        } else {
            reader.onload({ target: { result: 'assets/images/default-pic.png' } });
        }
    });

    function saveVCardToServer(vCardData, uniqueHash) {
        // Create a FormData object to send both vCard data and photo
        const formData = new FormData();
        formData.append('vCardData', vCardData);
        formData.append('hash', uniqueHash);
        
        // Append the profile file if it exists
        if (profileFile && profileFile.size > 0) {
            formData.append('profile', profileFile);
        }

        fetch('/generate_vcard', {
            method: 'POST',
            body: formData  // Use FormData instead of JSON
        })
        .then(response => response.json())
        .then(data => {
            log('VCard saved successfully:', data);
        })
        .catch(error => {
            log('Error saving VCard:', error);
        });
    }

    function generateAccessQR() {
        // Get the current host and port
        const host = window.location.hostname;
        const port = window.location.port || '8000';
        const protocol = window.location.protocol;

        // Construct the full URL
        const accessURL = `${protocol}//${host}:${port}`;

        // Clear any existing QR code
        const qrContainer = document.getElementById('qr-container');
        qrContainer.innerHTML = '';

        // Generate QR code
        new QRCode(qrContainer, {
            text: accessURL,
            width: 200,
            height: 200
        });

        // Optional: Display the URL text
        const urlDisplay = document.createElement('p');
        urlDisplay.textContent = `Scan to access: ${accessURL}`;
        qrContainer.appendChild(urlDisplay);
    }
});