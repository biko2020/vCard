# vCard Generator

## Overview

vCard Generator is a simple, interactive web application that allows users to create personalized digital business cards with a unique QR code. The application provides a user-friendly interface to input personal details and generate a shareable vCard with a dynamically created QR code.

## Features

- 🖼️ Profile Picture Upload
- 📇 Real-time Preview of vCard Details
- 🔳 QR Code Generation
- 📱 Responsive Mobile-like Interface
- 🔗 Unique Reference Link Generation


## Project structure
vCard/
├── accessible-from-machines/
├── app.py
├── index.html
├── .gitignore
├── README.md
├── requirements.txt
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── images/
│   └── js/
│       ├── category-select.js
│       ├── image-upload.js
│       └── QRcode.js
└── vcards/
   └── QnJhaGltIEFpdG91.vcf
## Technologies Used

### Backend
- **Python 3.8+**: Primary programming language
- **Flask**: Lightweight web framework
- **Flask-CORS**: Cross-Origin Resource Sharing support

### Frontend
- **HTML5**: Semantic markup for structure
- **CSS3**: Responsive design with Flexbox and Grid
- **Vanilla JavaScript (ES6+)**: Dynamic interactions and form handling

### Libraries and Tools
- **QR Code Generator**: `qrcode.js` for dynamic QR code generation
- **Font Awesome**: Icon library for enhanced UI elements
- **Logging**: Integrated Python logging for server-side tracking

### Development Tools
- **Git**: Version control
- **VS Code**: Primary development environment
- **Browser DevTools**: Debugging and performance optimization
- **Virtual Environment**: Python venv for dependency management

## Getting Started

## Step-by-Step Setup & Usage Guide

Follow these steps to set up and use the vCard Generator app:

### 1. Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone https://github.com/biko2020/vCard.git
cd vCard
```

### 2. (Optional) Set Up Python Virtual Environment

It's recommended to use a virtual environment for Python dependencies:

```bash
python -m venv venv
venv\Scripts\activate   # On Windows
# Or
source venv/bin/activate # On macOS/Linux
```

### 3. Install Python Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 4. Run the Flask Backend (Optional)

If you want to use backend features (like saving vCards server-side), start the Flask server:

```bash
python main.py
```

The server will start, usually at `http://127.0.0.1:5000/`.

### 5. Open the App in Your Browser

You can use the app in two ways:

- **Frontend Only:** Open `index.html` directly in your web browser for basic vCard generation and QR code features.
- **With Backend:** If the Flask server is running, access the app via the provided local server URL for full features.

### 6. Use the App

1. Fill in your personal details (name, phone, email, etc.).
2. Upload a profile picture (optional).
3. Switch between Preview and QR Code views as needed.
4. Download or share your generated vCard and QR code.

---

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for external QR code library

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/biko2020/vCard.git
   ```

2. Open `index.html` in your web browser or run the Flask server with `python main.py` for backend features (if required).

## How to Use

1. Fill in your personal details:
   - Name
   - Phone Number
   - Email
   - Description/Post
   - Profile Picture

2. Toggle between Preview and QR Code views using the switch

3. A unique reference link and QR code will be automatically generated

## Key Components

- `index.html`: Main application structure
- `assets/js/QRcode.js`: JavaScript logic for dynamic updates and QR code generation
- `assets/css/styles.css`: Responsive styling

## Unique Features

- Dynamic QR Code Generation
- Real-time Preview
- Unique Reference Link Creation
- Responsive Design

## Browser Compatibility

- Chrome ✓
- Firefox ✓
- Safari ✓
- Edge ✓

## Project Status

🟢 Active Development
- Current Version: 1.0.0
- Last Updated: 2025-01-28
- Actively maintained and open to community contributions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source. Please check the LICENSE file for details.

## 👤 Author

**Brahim Ait Oufkir**
*Data Engineer · Big Data Developer · Full Stack Developer*

[![Email](https://img.shields.io/badge/Email-aitoufkirbrahimab%40gmail.com-red?logo=gmail)](mailto:aitoufkirbrahimab@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-brahim--ait--oufkir-blue?logo=linkedin)](https://linkedin.com/in/brahim-ait-oufkir)
[![GitHub](https://img.shields.io/badge/GitHub-biko2020-black?logo=github)](https://github.com/biko2020)

---

*Generated on: 2026-04-06*