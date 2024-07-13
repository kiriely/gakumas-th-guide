async function fetchCards() {
    try {
        // Determine the correct path based on the current environment
        const cardsPath = window.location.hostname === 'localhost' ? '/cards' : '/cards.json';
        
        const response = await fetch(cardsPath);
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

function getFilteredCards(cards, filters) {
    return cards.filter(card => {
        const rareMatch = filters.rare.length === 0 || filters.rare.includes(card.rare);
        const typeMatch = filters.type.length === 0 || filters.type.includes(card.type);
        return rareMatch && typeMatch;
    });
}

function createPagination(totalPages, currentPage) {
    const paginationWrapper = document.createElement('div');
    paginationWrapper.className = 'pagination-wrapper';
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    // Add "First" button
    const firstButton = document.createElement('button');
    firstButton.innerHTML = '&lt;&lt;';
    firstButton.addEventListener('click', () => displayCards('cards-container', 1));
    paginationContainer.appendChild(firstButton);

    // Add number buttons with ellipsis
    const pageNumbers = getPageNumbers(currentPage, totalPages);
    pageNumbers.forEach(num => {
        if (num === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'ellipsis';
            paginationContainer.appendChild(ellipsis);
        } else {
            const pageButton = document.createElement('button');
            pageButton.textContent = num;
            pageButton.className = num === currentPage ? 'active' : '';
            pageButton.addEventListener('click', () => displayCards('cards-container', num));
            paginationContainer.appendChild(pageButton);
        }
    });

    // Add "Last" button
    const lastButton = document.createElement('button');
    lastButton.innerHTML = '&gt;&gt;';
    lastButton.addEventListener('click', () => displayCards('cards-container', totalPages));
    paginationContainer.appendChild(lastButton);
    
    paginationWrapper.appendChild(paginationContainer);
    return paginationWrapper;
}

function getPageNumbers(currentPage, totalPages) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
        if (i < totalPages && i > 1) {
            range.push(i);
        }
    }

    range.push(totalPages);

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
}

async function displayCards(containerId, page = 1) {
    const cards = await fetchCards();
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container element not found");
        return;
    }
    if (cards.length === 0) {
        container.innerHTML = '<p>No cards available or failed to load cards.</p>';
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
    cardsToDisplay.forEach((card) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <table>
                <tr>
                    <td colspan="4">
                        <img src="${card.image}" alt="Card Image" class="main-image">
                    </td>
                </tr>
                <tr>
                    <th>Rare</th>
                    <td><img src="public/icon/${card.rare}.png" alt="${card.rare}"></td>
                    <th>Type</th>
                    <td><img src="public/icon/${card.type.toLowerCase()}.png" alt="${card.type}" class="type-icon"></td>
                </tr>
                <tr>
                    <th>Lesson <br>Support</th>
                    <td style="text-align:center;"><span class="lessonSupport" data-support="${card.lessonSupport}">${card.lessonSupport}</span></td>
                    <th>Chance</th>
                    <td style="text-align:center;"><span class="chance" data-chance="${card.chance}">${card.chance}</span></td>
                </tr>
                <tr>
                    <th>ไอเทม / การ์ด</th>
                    <td colspan="3" rowspan="2">${card.description}</td>
                </tr>
                <tr>
                    <td>
                        <img src="${card.itemIcon}" alt="Item Icon" class="main-image">
                    </td>
                </tr>
                <tr>
                    <th colspan="3">Event</th>
                    <th style="text-align:center;">ปลดเมื่อเลเวล</th>
                </tr>
                <tr>
                    <td colspan="3">${card.eventDetail1}</td>
                    <td style="text-align:center;" >20</td>
                </tr>
                <tr>
                    <td colspan="3">${card.eventDetail2}</td>
                    <td style="text-align:center;" >40</td>
                </tr>
                <tr>
                    <th colspan="3">Ability</th>
                    <th style="text-align:center;">ปลดเมื่อเลเวล</th>
                </tr>
                <tr>
                    <td colspan="3">${card.abilityDetail1}</td>
                    <td style="text-align:center;" >1</td>
                </tr>
                <tr>
                    <td colspan="3">${card.abilityDetail2}</td>
                    <td style="text-align:center;" >1</td>
                </tr>
                <tr>
                    <td colspan="3">${card.abilityDetail3}</td>
                    <td style="text-align:center;" >2</td>
                </tr>
                <tr>
                    <td colspan="3">${card.abilityDetail4}</td>
                    <td style="text-align:center;" >5</td>
                </tr>
                <tr>
                    <td colspan="3">${card.abilityDetail5}</td>
                    <td style="text-align:center;" >10</td>
                </tr>
                <tr>
                    <td colspan="3">${card.abilityDetail6}</td>
                    <td style="text-align:center;" >25</td>
                </tr>
            </table>
        `;
        container.appendChild(cardDiv);
    });

    const paginationElement = createPagination(totalPages, page);
    container.appendChild(paginationElement);
}

function clearFilters() {
    document.querySelectorAll('input[name="filter-rare"], input[name="filter-type"]').forEach(el => el.checked = false);
    displayCards('cards-container');
}

document.addEventListener('DOMContentLoaded', () => {
    displayCards('cards-container');
    
    // Add event listeners to checkboxes
    document.querySelectorAll('input[name="filter-rare"], input[name="filter-type"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => displayCards('cards-container'));
    });
});