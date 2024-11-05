// ==UserScript==
// @name         Easy-to-understand risk display
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a display next to the price tag to show exactly what the risk is in percentage form along with colors.
// @author       jaxx
// @match        https://www.hypedrop.com/*
// @exclude      https://www.hypedrop.com/en/inbox
// @exclude      https://www.hypedrop.com/en/race
// @exclude      https://www.hypedrop.com/en/deals
// @exclude      https://www.hypedrop.com/en/affiliates
// @exclude      https://www.hypedrop.com/en/player/*/deliveries
// @exclude      https://www.hypedrop.com/en/player/*/summary
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hypedrop.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/its-Jaxx/HypeDrop-Risk-Display/main/HypeDrop-Risk-Display.user.js
// @updateURL    https://raw.githubusercontent.com/its-Jaxx/HypeDrop-Risk-Display/main/HypeDrop-Risk-Display.user.js
// ==/UserScript==

(function() {
    'use strict';

    function create_risk_display() {
        const boxes = document.querySelectorAll('cw-box-grid-item-ecommerce .box-wrapper:not(.processed)');

        boxes.forEach(box => {
            box.classList.add('processed');

            const riskElement = box.querySelector('.cw-icon.indicator');
            if (riskElement && riskElement.style.left) {
                const calcMatch = riskElement.style.left.match(/calc\(([\d.]+)% - \d+px\)/);
                let riskPercentage = 0;

                if (calcMatch && calcMatch[1]) {
                    riskPercentage = parseFloat(calcMatch[1]);
                }

                let riskColor = '#3d9d43';
                let riskType = 'Low';
                if (riskPercentage > 41 && riskPercentage <= 63) {
                    riskColor = '#3d789d';
                    riskType = 'Medium';
                } else if (riskPercentage > 63 && riskPercentage <= 79) {
                    riskColor = '#e79800';
                    riskType = 'High';
                } else if (riskPercentage > 79 && riskPercentage <= 91) {
                    riskColor = '#84579d';
                    riskType = 'Very High';
                } else if (riskPercentage > 91 && riskPercentage <= 100) {
                    riskColor = '#db3232';
                    riskType = 'Extreme';
                }

                const riskText = `${riskPercentage.toFixed(1)}% Risk (${riskType})`;

                const costContainer = box.querySelector('.cost-container');
                if (costContainer) {
                    const riskDisplay = document.createElement('span');
                    riskDisplay.textContent = riskText;
                    riskDisplay.classList.add('risk-display');

                    riskDisplay.style.cssText = `
                        font-size: 0.85em;
                        font-weight: bold;
                        margin-left: 8px;
                        color: ${riskColor};
                        display: inline-flex;
                        align-items: center;
                    `;

                    costContainer.appendChild(riskDisplay);
                }
            }
        });
    }

    const observer = new MutationObserver(create_risk_display);

    const mainContainer = document.querySelector('body');
    if (mainContainer) {
        observer.observe(mainContainer, {
            childList: true,
            subtree: true
        });
    }

    create_risk_display();
})();
