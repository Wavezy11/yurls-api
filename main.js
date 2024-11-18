// Initialize the Microsoft Graph client
let graphClient;

async function initializeGraphClient() {
    // In a real application, you'd implement proper authentication here
    // For demo purposes, we're using a dummy access token
    const accessToken = 'dummy_access_token';
    
    graphClient = MicrosoftGraph.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
}

// Function to fetch data from SharePoint
async function fetchSharePointData() {
    try {
        const response = await graphClient.api('/sites/{site-id}/lists/{list-id}/items')
            .select('fields')
            .expand('fields')
            .get();
        return response.value.map(item => item.fields);
    } catch (error) {
        console.error('Error fetching SharePoint data:', error);
        return null;
    }
}

// Function to process data (works for both SharePoint and local JSON)
function processData(data) {
    const categoryContainer = document.getElementById('categoryContainer');
    const subjects = {};

    // Groepeer onderwerpen per categorie en vak
    data.forEach(item => {
        if (!subjects[item.categorie]) {
            subjects[item.categorie] = {};
        }
        if (!subjects[item.categorie][item.vak]) {
            subjects[item.categorie][item.vak] = [];
        }

        // Voeg onderwerp en URL toe aan het vak
        subjects[item.categorie][item.vak].push({
            onderwerp: item.onderwerp,
            url: item.url,
            prijs: item.prijs || 'Niet beschikbaar',
            taal: item.Taal || 'Niet gespecificeerd',
            platform: item.Platform || 'Onbekend'
        });
    });

    // Clear existing content
    categoryContainer.innerHTML = '';

    // Dynamisch HTML-elementen maken voor elke categorie en vak
    for (const category in subjects) {
        const section = document.createElement('section');
        section.classList.add('category');
        const categoryTitle = document.createElement('h2');
        categoryTitle.innerText = category;
        section.appendChild(categoryTitle);

        for (const vak in subjects[category]) {
            const subjectContainer = document.createElement('div');
            subjectContainer.classList.add('subject-container');
            subjectContainer.setAttribute('data-subject', vak);

            const vakText = document.createElement('p');
            vakText.innerText = vak;
            subjectContainer.appendChild(vakText);

            subjectContainer.addEventListener('click', () => {
                openModal(vak, subjects[category][vak]);
            });

            section.appendChild(subjectContainer);
        }
        categoryContainer.appendChild(section);
    }
}

// Main function to load data
async function loadData() {
    try {
        await initializeGraphClient();
        const sharePointData = await fetchSharePointData();
        if (sharePointData) {
            processData(sharePointData);
        } else {
            throw new Error('SharePoint data fetch failed');
        }
    } catch (error) {
        console.error('Error loading SharePoint data:', error);
        // Fallback to local JSON if SharePoint fetch fails
        fetch('csvjson.json')
            .then(response => response.json())
            .then(data => {
                processData(data);
            })
            .catch(error => console.error('Error loading JSON:', error));
    }
}

// Function to open the modal
function openModal(vak, onderwerpen) {
    const modal = document.getElementById('popupModal');
    const selectedSubject = document.getElementById('selectedSubject');
    const linksList = document.getElementById('linksList');
    const prijsElement = document.getElementById('prijs');
    const taalElement = document.getElementById('taal');

    selectedSubject.innerText = vak;
    linksList.innerHTML = '';
    prijsElement.innerHTML = '';
    taalElement.innerHTML = '';

    onderwerpen.forEach(item => {
        // Maak een lijstitem voor het onderwerp
        const listItem = document.createElement('li');
        
        // Maak de link en voeg deze toe
        const linkElement = document.createElement('a');
        linkElement.href = item.url;
        linkElement.target = "_blank";
        linkElement.innerText = item.onderwerp;

        // Maak de platform, taal en prijs elementen
        const platformSpan = document.createElement('span');
        platformSpan.classList.add('platform');
        platformSpan.innerText = item.platform ? `Platform: ${item.platform}` : 'Platform niet gespecificeerd';

        const taalSpan = document.createElement('span');
        taalSpan.classList.add('taal');
        taalSpan.innerText = item.taal ? `Taal: ${item.taal}` : 'Taal niet gespecificeerd';

        const prijsSpan = document.createElement('span');
        prijsSpan.classList.add('prijs');
        prijsSpan.innerText = item.prijs ? `Prijs: ${item.prijs}` : 'Prijs niet beschikbaar';

        // Voeg de link, platform, taal en prijs toe aan het lijstitem
        listItem.appendChild(linkElement);
        listItem.appendChild(platformSpan);
        listItem.appendChild(taalSpan);
        listItem.appendChild(prijsSpan);

        // Voeg het lijstitem toe aan de lijst in de modal
        linksList.appendChild(listItem);
    });

    modal.style.display = 'flex';

    // Scroll naar boven om de modal optimaal te kunnen zien
    modal.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('popupModal');
    modal.style.display = 'none';
}

// Function to filter images
function filterImages() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const categories = document.querySelectorAll('.category');

    categories.forEach(category => {
        let categoryVisible = false;
        const subjects = category.querySelectorAll('.subject-container');
        subjects.forEach(subject => {
            const vakText = subject.querySelector('p').innerText.toLowerCase();
            if (vakText.includes(searchInput)) {
                subject.style.display = 'block';  // Show subject
                categoryVisible = true;  // Mark category as visible
            } else {
                subject.style.display = 'none';  // Hide subject
            }
        });

        // Show or hide the entire category based on if any subject was found
        category.style.display = categoryVisible ? 'block' : 'none';
    });
}

// Initialize the page when it loads
window.onload = function() {
    loadData();
    
    const closeModalButton = document.querySelector('.close');
    const doorgaanButton = document.getElementById('gaDoorButton');

    // Sluitknop
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    } else {
        console.error('Close button not found!');
    }

    // Doorgaan knop
    if (doorgaanButton) {
        doorgaanButton.addEventListener('click', () => {
            closeModal();
        });
    } else {
        console.error('Doorgaan button not found!');
    }

    // Add event listener for search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterImages);
    } else {
        console.error('Search input not found!');
    }
};