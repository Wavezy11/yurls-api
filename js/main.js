// Initialize the Microsoft Graph client
let graphClient;

async function initializeGraphClient() {
    const accessToken = 'dummy_access_token';
    
    graphClient = MicrosoftGraph.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
}

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

function processData(data) {
    const categoryContainer = document.getElementById('categoryContainer');
    const subjects = {};

    data.forEach(item => {
        if (!subjects[item.categorie]) {
            subjects[item.categorie] = {};
        }
        if (!subjects[item.categorie][item.vak]) {
            subjects[item.categorie][item.vak] = [];
        }

        subjects[item.categorie][item.vak].push({
            onderwerp: item.onderwerp,
            url: item.url,
            prijs: item.prijs || 'Niet beschikbaar',
            taal: item.Taal || 'Niet gespecificeerd',
            platform: item.Platform || 'Onbekend'
        });
    });

    renderContent(subjects);
}

function renderContent(subjects) {
    const categoryContainer = document.getElementById('categoryContainer');
    categoryContainer.innerHTML = '';

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

            const subjectInfo = {
                items: subjects[category][vak]
            };
            subjectContainer.setAttribute('data-subject-info', JSON.stringify(subjectInfo));

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
        fetch('csvjson.json')
            .then(response => response.json())
            .then(data => {
                processData(data);
            })
            .catch(error => console.error('Error loading JSON:', error));
    }
}

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
        const listItem = document.createElement('li');
        
        const linkElement = document.createElement('a');
        linkElement.href = item.url;
        linkElement.target = "_blank";
        linkElement.innerText = item.onderwerp;

        const platformSpan = document.createElement('span');
        platformSpan.classList.add('platform');
        platformSpan.innerText = `Platform: ${item.platform}`;

        const taalSpan = document.createElement('span');
        taalSpan.classList.add('taal');
        taalSpan.innerText = `Taal: ${item.taal}`;

        const prijsSpan = document.createElement('span');
        prijsSpan.classList.add('prijs');
        prijsSpan.innerText = `Prijs: ${item.prijs}`;

        listItem.appendChild(linkElement);
        listItem.appendChild(platformSpan);
        listItem.appendChild(taalSpan);
        listItem.appendChild(prijsSpan);

        linksList.appendChild(listItem);
    });

    modal.style.display = 'flex';
    modal.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeModal() {
    const modal = document.getElementById('popupModal');
    modal.style.display = 'none';
}

function filterContent() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const vrFilter = document.getElementById('vrFilter').checked;
    const freeFilter = document.getElementById('freeFilter').checked;
    const paidFilter = document.getElementById('paidFilter').checked;
    const nlFilter = document.getElementById('nlFilter').checked;
    const engFilter = document.getElementById('engFilter').checked;

    const categories = document.querySelectorAll('.category');

    categories.forEach(category => {
        let categoryVisible = false;
        const subjects = category.querySelectorAll('.subject-container');
        subjects.forEach(subject => {
            const vakText = subject.querySelector('p').innerText.toLowerCase();
            const subjectInfo = JSON.parse(subject.getAttribute('data-subject-info'));

            let subjectVisible = subjectInfo.items.some(item => {
                const matchesSearch = item.onderwerp.toLowerCase().includes(searchInput);
                const matchesVR = !vrFilter || item.platform.toLowerCase().includes('vr');
                const matchesFree = !freeFilter || item.prijs.toLowerCase().includes('gratis');
                const matchesPaid = !paidFilter || (item.prijs.toLowerCase() !== 'gratis' && item.prijs.toLowerCase() !== 'niet beschikbaar');
                const matchesNL = !nlFilter || item.taal.toLowerCase().includes('nl');
                const matchesENG = !engFilter || item.taal.toLowerCase().includes('eng');

                return matchesSearch && matchesVR && (matchesFree || matchesPaid) && (matchesNL || matchesENG);
            });

            if (subjectVisible) {
                subject.style.display = 'block';
                categoryVisible = true;
            } else {
                subject.style.display = 'none';
            }
        });

        category.style.display = categoryVisible ? 'block' : 'none';
    });
}

window.onload = function() {
    loadData();
    
    const closeModalButton = document.querySelector('.close');
    const doorgaanButton = document.getElementById('gaDoorButton');

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    } else {
        console.error('Close button not found!');
    }

    if (doorgaanButton) {
        doorgaanButton.addEventListener('click', () => {
            closeModal();
        });
    } else {
        console.error('Doorgaan button not found!');
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterContent);
    } else {
        console.error('Search input not found!');
    }

    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterContent);
    });
};