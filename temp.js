// ==UserScript==
// @name         CCMT Fetch All Results Into One Page
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically fetch all CCMT cutoff results and display them in one single table
// @author       You
// @match        *://*ccmt*.nic.in/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // CONFIGURATION
    const DELAY = 1000; // delay between requests (ms)

    // Wait for page to load
    window.addEventListener('load', async () => {

        // Change selectors according to actual site
        const roundSelect = document.querySelector('select[name*=Round]');
        const instituteSelect = document.querySelector('select[name*=Institute]');
        const programSelect = document.querySelector('select[name*=Program]');
        const categorySelect = document.querySelector('select[name*=Category]');
        const searchBtn = document.querySelector('button, input[type=submit]');

        if (!roundSelect || !instituteSelect || !programSelect || !categorySelect) {
            console.error("Could not find dropdowns.");
            return;
        }

        // Create result container
        const resultContainer = document.createElement('div');
        resultContainer.style.margin = '20px';
        resultContainer.innerHTML = `
            <h2>Combined CCMT Results</h2>
            <table border="1" cellspacing="0" cellpadding="5" id="combinedTable">
                <thead>
                    <tr>
                        <th>Round</th>
                        <th>Institute</th>
                        <th>Program</th>
                        <th>Category</th>
                        <th>Opening Score</th>
                        <th>Closing Score</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
        document.body.prepend(resultContainer);

        const tbody = document.querySelector('#combinedTable tbody');

        // Helper function
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Get dropdown values
        const rounds = [...roundSelect.options].filter(o => o.value);
        const institutes = [...instituteSelect.options].filter(o => o.value);
        const categories = [...categorySelect.options].filter(o => o.value);

        // LOOP THROUGH EVERYTHING
        for (const round of rounds) {

            roundSelect.value = round.value;
            roundSelect.dispatchEvent(new Event('change'));

            await sleep(DELAY);

            for (const institute of institutes) {

                instituteSelect.value = institute.value;
                instituteSelect.dispatchEvent(new Event('change'));

                await sleep(DELAY);

                // Reload programs after institute change
                const programs = [...programSelect.options].filter(o => o.value);

                for (const program of programs) {

                    programSelect.value = program.value;
                    programSelect.dispatchEvent(new Event('change'));

                    await sleep(DELAY);

                    for (const category of categories) {

                        categorySelect.value = category.value;
                        categorySelect.dispatchEvent(new Event('change'));

                        await sleep(DELAY);

                        console.log(
                            `Fetching: ${round.text} | ${institute.text} | ${program.text} | ${category.text}`
                        );

                        // CLICK SEARCH BUTTON
                        searchBtn.click();

                        // WAIT FOR TABLE TO LOAD
                        await sleep(3000);

                        // GET RESULT TABLE
                        const resultRows = document.querySelectorAll('table tbody tr');

                        resultRows.forEach(row => {

                            const cols = row.querySelectorAll('td');

                            if (cols.length >= 2) {

                                const opening = cols[0]?.innerText?.trim() || '';
                                const closing = cols[1]?.innerText?.trim() || '';

                                const tr = document.createElement('tr');

                                tr.innerHTML = `
                                    <td>${round.text}</td>
                                    <td>${institute.text}</td>
                                    <td>${program.text}</td>
                                    <td>${category.text}</td>
                                    <td>${opening}</td>
                                    <td>${closing}</td>
                                `;

                                tbody.appendChild(tr);
                            }
                        });
                    }
                }
            }
        }

        console.log("DONE FETCHING ALL DATA");
        alert("All CCMT results collected!");
    });
})();
