document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('category-select');
    const subcategorySelect = document.getElementById('subcategory-select');

    const subcategories = {
        'education': [
            'Enseignement (primaire, secondaire, universitaire)',
            'Formation professionnelle',
            'Recherche scientifique',
            'Édition et rédaction pédagogique'
        ],
        'artisanat': [
            'Maçonnerie',
            'Charpenterie',
            'Plomberie',
            'Électricité du bâtiment',
            'Menuiserie',
            'Peinture et décoration',
            'Métallerie'
        ],
        'hospitality': [
            'Hôtellerie et gestion de complexes',
            'Restauration et gastronomie',
            'Tourisme et guidage',
            'Événementiel'
        ],
        'arts': [
            'Audiovisuel (cinéma, télévision)',
            'Journalisme',
            'Musique et spectacle',
            'Édition et écriture',
            'Graphisme et illustration',
            'Photographie',
            'Patrimoine et muséologie'
        ],
        'law': [
            'Droit des affaires',
            'Droit pénal',
            'Droit du travail',
            'Notariat',
            'Magistrature',
            'Criminologie'
        ]
    };

    categorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;
        subcategorySelect.disabled = false;
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';

        if (selectedCategory && subcategories[selectedCategory]) {
            subcategories[selectedCategory].forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory;
                option.textContent = subcategory;
                subcategorySelect.appendChild(option);
            });
        } else {
            subcategorySelect.disabled = true;
        }
    });
});