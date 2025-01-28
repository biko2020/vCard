document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('vcard-form');
    const previewCard = document.getElementById('preview-card');
    const profilePreview = document.getElementById('profile-preview');
    const namePreview = document.getElementById('name-preview');
    const phonePreview = document.getElementById('phone-preview');
    const emailPreview = document.getElementById('email-preview');
    const postPreview = document.getElementById('post-preview');
    const qrCodeContainer = document.getElementById('qr-code-container');

    const nameInput = document.getElementById('name-input');
    const phoneInput = document.getElementById('phone-input');
    const emailInput = document.getElementById('email-input');
    const profileInput = document.getElementById('profile-input');
    const postInput = document.getElementById('post-input');

    const previewTogglePreview = document.getElementById('preview-toggle-preview');
    const previewToggleQR = document.getElementById('preview-toggle-qr');

    // Real-time text input updates
    nameInput.addEventListener('input', () => {
        namePreview.textContent = nameInput.value || 'Name';
        updateQRCode();
    });

    phoneInput.addEventListener('input', () => {
        phonePreview.textContent = phoneInput.value || 'Phone';
        updateQRCode();
    });

    emailInput.addEventListener('input', () => {
        emailPreview.textContent = emailInput.value || 'Email';
        updateQRCode();
    });

    postInput.addEventListener('input', () => {
        postPreview.textContent = postInput.value || 'Description';
        updateQRCode();
    });

    // Profile picture preview
    profileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePreview.src = event.target.result;
                updateQRCode();
            };
            reader.readAsDataURL(file);
        }
    });

    // Unique reference link generation function
    function generateUniqueReferenceLink() {
        // Use current timestamp and a hash of user data to create a unique link
        const timestamp = new Date().toISOString();
        const uniqueData = `${nameInput.value}${phoneInput.value}${emailInput.value}${timestamp}`;
        const uniqueHash = btoa(uniqueData).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

        // Construct a unique reference link
        const baseUrl = window.location.origin;
        const referenceLink = `${baseUrl}/vcard/${uniqueHash}`;

        return {
            link: referenceLink,
            hash: uniqueHash
        };
    }

    // QR Code generation function
    function updateQRCode() {
        const qr = qrcode(0, 'M');
        const { link: referenceLink, hash: uniqueHash } = generateUniqueReferenceLink();
        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${nameInput.value || ''}
TEL:${phoneInput.value || ''}
EMAIL:${emailInput.value || ''}
NOTE:${postInput.value || ''}
URL:${referenceLink}
UID:${uniqueHash}
END:VCARD`;

        qr.addData(vCardData);
        qr.make();
        qrCodeContainer.innerHTML = qr.createImgTag(5);

        // Optional: Display the reference link
        const referenceLinkElement = document.getElementById('reference-link') ||
            document.createElement('div');
        referenceLinkElement.id = 'reference-link';
        referenceLinkElement.innerHTML = `
            <strong>Unique Reference Link:</strong> 
            <a href="${referenceLink}" target="_blank">${referenceLink}</a>
        `;
        qrCodeContainer.appendChild(referenceLinkElement);
    }

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

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');
        const profileFile = formData.get('profile');
        const post = formData.get('post');

        // Profile Picture Preview
        const reader = new FileReader();
        reader.onload = (event) => {
            profilePreview.src = event.target.result;

            // Update Preview Details
            namePreview.textContent = name;
            phonePreview.textContent = phone;
            emailPreview.textContent = email;
            postPreview.textContent = post;

            // Generate QR Code
            const qr = qrcode(0, 'M');
            const { link: referenceLink, hash: uniqueHash } = generateUniqueReferenceLink();
            const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL:${phone}
EMAIL:${email}
NOTE:${post}
URL:${referenceLink}
UID:${uniqueHash}
END:VCARD`;

            qr.addData(vCardData);
            qr.make();
            qrCodeContainer.innerHTML = qr.createImgTag(5);

            // Optional: Display the reference link
            const referenceLinkElement = document.getElementById('reference-link') ||
                document.createElement('div');
            referenceLinkElement.id = 'reference-link';
            referenceLinkElement.innerHTML = `
                <strong>Unique Reference Link:</strong> 
                <a href="${referenceLink}" target="_blank">${referenceLink}</a>
            `;
            qrCodeContainer.appendChild(referenceLinkElement);
        };
        reader.readAsDataURL(profileFile);
    });

    

});