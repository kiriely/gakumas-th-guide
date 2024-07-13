// update-script.js

async function fetchCards() {
    try {
        const response = await fetch('/cards');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cards = await response.json();
        // Reverse the array to get newest cards first
        return cards.reverse();
    } catch (error) {
        console.error("Failed to fetch cards:", error);
        return [];
    }
}

async function updateCards(cards) {
    try {
        const response = await fetch('/update-cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cards),
        });
        if (!response.ok) {
            throw new Error('Failed to update cards');
        }
        alert('Cards updated successfully');
    } catch (error) {
        console.error('Error updating cards:', error);
        alert('An error occurred while updating the cards.');
    }
}

function getFilteredCards(cards, filters) {
    return cards.filter(card => {
        return (!filters.rare.length || filters.rare.includes(card.rare)) &&
               (!filters.type.length || filters.type.includes(card.type));
    });
}

function getLessonSupport(type) {
    switch(type) {
        case 'Vocal': return 'Vocal Lesson';
        case 'Dance': return 'Dance Lesson';
        case 'Visual': return 'Visual Lesson';
        case 'Assist': return 'All Lesson';
        default: return '';
    }
}

function getChance(rare, type) {
    if (rare === 'SSR' && type !== 'Assist') return 'สูง';
    if (rare === 'SSR' && type === 'Assist') return 'กลาง';
    if (rare === 'SR' && type !== 'Assist') return 'กลาง';
    if (rare === 'SR' && type === 'Assist') return 'ต่ำ';
    return '';
}

async function addCard(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const cardData = Object.fromEntries(formData.entries());

    // Automatically set lessonSupport and chance based on rare and type
    cardData.lessonSupport = getLessonSupport(cardData.type);
    cardData.chance = getChance(cardData.rare, cardData.type);

    try {
        const cards = await fetchCards();
        cards.push(cardData);
        await updateCards(cards);
        event.target.reset();
        displayCards('cards-container');
    } catch (error) {
        console.error('Error adding card:', error);
        alert('An error occurred while adding the card.');
    }
}

async function removeCard(index) {
    if (!confirm('Are you sure you want to delete this card?')) {
        return;
    }

    try {
        const cards = await fetchCards();
        cards.splice(index, 1);
        await updateCards(cards);
        displayCards('cards-container');
    } catch (error) {
        console.error('Error removing card:', error);
        alert('An error occurred while removing the card.');
    }
}

async function displayCards(containerId, page = 1) {
    const cards = await fetchCards();
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container element not found");
        return;
    }
    
    const rareFilter = Array.from(document.querySelectorAll('input[name="filter-rare"]:checked')).map(el => el.value);
    const typeFilter = Array.from(document.querySelectorAll('input[name="filter-type"]:checked')).map(el => el.value);
    const filters = { rare: rareFilter, type: typeFilter };

    const filteredCards = getFilteredCards(cards, filters);
    const cardsPerPage = 6;
    const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
    const startIndex = (page - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const cardsToDisplay = filteredCards.slice(startIndex, endIndex);

    container.innerHTML = '';
    cardsToDisplay.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <img src="${card.image}" alt="Card Image" class="card-image">
            <div class="card-content">
                <div class="card-row">
                    <span class="card-label">Rare:</span>
                    <select id="rare-${index}" name="rare" required>
                        <option value="SSR" ${card.rare === 'SSR' ? 'selected' : ''}>SSR</option>
                        <option value="SR" ${card.rare === 'SR' ? 'selected' : ''}>SR</option>
                    </select>
                </div>
                <div class="card-row">
                    <span class="card-label">Type:</span>
                    <select id="type-${index}" name="type" required>
                        <option value="Vocal" ${card.type === 'Vocal' ? 'selected' : ''}>Vocal</option>
                        <option value="Dance" ${card.type === 'Dance' ? 'selected' : ''}>Dance</option>
                        <option value="Visual" ${card.type === 'Visual' ? 'selected' : ''}>Visual</option>
                        <option value="Assist" ${card.type === 'Assist' ? 'selected' : ''}>Assist</option>
                    </select>
                </div>
                <div class="card-row">
                    <span class="card-label">Lesson Support:</span>
                    <select id="lessonSupport-${index}" name="lessonSupport" required>
                        <option value="Vocal Lesson" ${card.lessonSupport === 'Vocal Lesson' ? 'selected' : ''}>Vocal Lesson</option>
                        <option value="Dance Lesson" ${card.lessonSupport === 'Dance Lesson' ? 'selected' : ''}>Dance Lesson</option>
                        <option value="Visual Lesson" ${card.lessonSupport === 'Visual Lesson' ? 'selected' : ''}>Visual Lesson</option>
                        <option value="All Lesson" ${card.lessonSupport === 'All Lesson' ? 'selected' : ''}>All Lesson</option>
                    </select>
                </div>
                <div class="card-row">
                    <span class="card-label">Chance:</span>
                    <select id="chance-${index}" name="chance" required>
                        <option value="สูง" ${card.chance === 'สูง' ? 'selected' : ''}>สูง</option>
                        <option value="กลาง" ${card.chance === 'กลาง' ? 'selected' : ''}>กลาง</option>
                        <option value="ต่ำ" ${card.chance === 'ต่ำ' ? 'selected' : ''}>ต่ำ</option>
                    </select>
                </div>
                <div class="card-row">
                    <span class="card-label">Image URL:</span>
                    <input type="url" id="image-${index}" name="image" value="${card.image}" required>
                </div>
                <div class="card-row">
                    <span class="card-label">Item Icon:</span>
                    <img src="${card.itemIcon}" alt="Item Icon" class="item-icon">
                </div>
                <div class="card-row">
                    <span class="card-label">Item Icon URL:</span>
                    <input type="url" id="itemIcon-${index}" name="itemIcon" value="${card.itemIcon}" required>
                </div>
                <div class="card-row">
                    <span class="card-label">Description:</span>
                    <textarea id="description-${index}" name="description" required>${card.description}</textarea>
                </div>
                <div class="card-row">
                    <span class="card-label">Event:</span>
                    <div class="event-details">
                        <input type="text" id="eventDetail1-${index}" name="eventDetail1" value="${card.eventDetail1}" required>
                        <input type="text" id="eventDetail2-${index}" name="eventDetail2" value="${card.eventDetail2}" required>
                    </div>
                </div>
                <div class="card-row">
                    <span class="card-label">Ability:</span>
                    <div class="ability-details">
                        <input type="text" id="abilityDetail1-${index}" name="abilityDetail1" value="${card.abilityDetail1}" required>
                        <input type="text" id="abilityDetail2-${index}" name="abilityDetail2" value="${card.abilityDetail2}" required>
                        <input type="text" id="abilityDetail3-${index}" name="abilityDetail3" value="${card.abilityDetail3}" required>
                        <input type="text" id="abilityDetail4-${index}" name="abilityDetail4" value="${card.abilityDetail4}" required>
                        <input type="text" id="abilityDetail5-${index}" name="abilityDetail5" value="${card.abilityDetail5}" required>
                        <input type="text" id="abilityDetail6-${index}" name="abilityDetail6" value="${card.abilityDetail6}" required>
                    </div>
                </div>
                <div class="action-buttons">
                    <button type="button" onclick="updateCard(${index}, getCardData(${index}))">Update</button>
                    <button type="button" onclick="removeCard(${index})">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(cardDiv);
    });

    const paginationElement = createPagination(totalPages, page);
    container.appendChild(paginationElement);
}

function createPagination(totalPages, currentPage) {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.addEventListener('click', () => displayCards('cards-container', i));
        paginationElement.appendChild(pageButton);
    }
}

function getCardData(index) {
    const card = {};
    ['rare', 'type', 'lessonSupport', 'chance', 'image', 'itemIcon', 'description', 'eventDetail1', 'eventDetail2',
     'abilityDetail1', 'abilityDetail2', 'abilityDetail3', 'abilityDetail4', 'abilityDetail5', 'abilityDetail6'].forEach(field => {
        card[field] = document.getElementById(`${field}-${index}`).value;
    });
    return card;
}

async function updateCard(index, cardData) {
    // Update lessonSupport and chance based on rare and type
    cardData.lessonSupport = getLessonSupport(cardData.type);
    cardData.chance = getChance(cardData.rare, cardData.type);

    try {
        const cards = await fetchCards();
        cards[index] = cardData;
        await updateCards(cards);
        displayCards('cards-container');
    } catch (error) {
        console.error('Error updating card:', error);
        alert('An error occurred while updating the card.');
    }
}

function clearFilters() {
    document.querySelectorAll('input[name="filter-rare"], input[name="filter-type"]').forEach(el => el.checked = false);
    displayCards('cards-container');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('add-form')) {
        document.getElementById('add-form').addEventListener('submit', addCard);
    }
    displayCards('cards-container');

    // Add event listeners for filter checkboxes
    document.querySelectorAll('input[name="filter-rare"], input[name="filter-type"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => displayCards('cards-container'));
    });

    // Add event listeners for rare and type selects to update lessonSupport and chance
    document.querySelectorAll('select[name="rare"], select[name="type"]').forEach(select => {
        select.addEventListener('change', (event) => {
            const index = event.target.id.split('-')[1];
            const rare = document.getElementById(`rare-${index}`).value;
            const type = document.getElementById(`type-${index}`).value;
            document.getElementById(`lessonSupport-${index}`).value = getLessonSupport(type);
            document.getElementById(`chance-${index}`).value = getChance(rare, type);
        });
    });
});