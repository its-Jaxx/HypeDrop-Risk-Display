// ==UserScript==
// @name         Easy-to-understand risk display
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a proper risk percentage display along with a few settings. Also shows color to further indicate what the risk type is.
// @author       jaxx
// @match        https://www.hypedrop.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hypedrop.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/its-Jaxx/HypeDrop-Risk-Display/main/HypeDrop-Risk-Display.user.js
// @updateURL    https://raw.githubusercontent.com/its-Jaxx/HypeDrop-Risk-Display/main/HypeDrop-Risk-Display.user.js
// ==/UserScript==

(function() {
    'use strict';

    let userSettings = {
        decimalPlaces: 1,
        showRiskType: true
    };

    const savedSettings = localStorage.getItem('riskSettings');
    if (savedSettings) {
        userSettings = JSON.parse(savedSettings);
    }

    function saveSettings() {
        localStorage.setItem('riskSettings', JSON.stringify(userSettings));
    }

    function settingsUI() {
        if (document.getElementById('risk-settings-button')) {
            return;
        }

        // Create settings button
        const settingsButton = document.createElement('button');
        settingsButton.id = 'risk-settings-button';
        settingsButton.textContent = 'Risk Indicator Settings';
        settingsButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 10000;
            padding: 10px;
            background-color: #17224d;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;

        document.body.appendChild(settingsButton);

        const settingsMenu = document.createElement('div');
        settingsMenu.id = 'risk-display-settings-modal';
        settingsMenu.style.cssText = `
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
        `;

        const settingsContent = document.createElement('div');
        settingsContent.style.cssText = `
            background-color: #2b2d31;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 300px;
            border-radius: 8px;
            color: white;
        `;

        const closeSettingsButton = document.createElement('span');
        closeSettingsButton.innerHTML = '&times;';
        closeSettingsButton.style.cssText = `
            color: white;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        `;

        closeSettingsButton.onclick = function() {
            settingsMenu.style.display = 'none';
        };

        settingsContent.appendChild(closeSettingsButton);

        const settingsTitle = document.createElement('h2');
        settingsTitle.textContent = 'Risk Indicator Settings';
        settingsTitle.style.cssText = `
            margin-top: 0;
            color: white;
        `;
        settingsContent.appendChild(settingsTitle);

        const decimalPlacesLabel = document.createElement('label');
        decimalPlacesLabel.textContent = 'Decimal Places (0-4): ';
        decimalPlacesLabel.style.cssText = `
            display: block;
            margin-bottom: 8px;
            color: white;
        `;

        const decimalPlacesSelect = document.createElement('select');
        decimalPlacesSelect.style.cssText = `
            margin-left: 10px;
        `;

        for (let i = 0; i <= 4; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === userSettings.decimalPlaces) {
                option.selected = true;
            }
            decimalPlacesSelect.appendChild(option);
        }

        decimalPlacesLabel.appendChild(decimalPlacesSelect);
        settingsContent.appendChild(decimalPlacesLabel);

        const showRiskTypeLabel = document.createElement('label');
        showRiskTypeLabel.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            color: white;
        `;

        showRiskTypeLabel.appendChild(document.createTextNode('Show Risk Type (e.g., Low, Medium) '));

        const showRiskTypeInput = document.createElement('input');
        showRiskTypeInput.type = 'checkbox';
        showRiskTypeInput.checked = userSettings.showRiskType;
        showRiskTypeInput.style.cssText = `
            margin-left: 10px;
        `;

        showRiskTypeLabel.appendChild(showRiskTypeInput);
        settingsContent.appendChild(showRiskTypeLabel);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.style.cssText = `
            margin-top: 10px;
            padding: 8px 12px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;

        saveButton.onclick = function() {
            let decimalPlaces = parseInt(decimalPlacesSelect.value);

            userSettings.decimalPlaces = decimalPlaces;
            userSettings.showRiskType = showRiskTypeInput.checked;
            saveSettings();

            document.querySelectorAll('.risk-display').forEach(el => el.remove());
            document.querySelectorAll('cw-box-grid-item-ecommerce .box-wrapper.processed').forEach(box => box.classList.remove('processed'));
            create_risk_display();

            settingsMenu.style.display = 'none';
        };

        settingsContent.appendChild(saveButton);

        settingsMenu.appendChild(settingsContent);
        document.body.appendChild(settingsMenu);

        settingsButton.onclick = function() {
            settingsMenu.style.display = 'block';
        };

        window.onclick = function(event) {
            if (event.target == settingsMenu) {
                settingsMenu.style.display = 'none';
            }
        };
    }

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

                let formattedRiskPercentage;
                if (userSettings.decimalPlaces === 0) {
                    formattedRiskPercentage = Math.round(riskPercentage).toString();
                } else if (userSettings.decimalPlaces === 1) {
                    formattedRiskPercentage = riskPercentage.toFixed(1);
                    if (formattedRiskPercentage.indexOf('.') >= 0) {
                        formattedRiskPercentage = formattedRiskPercentage.replace(/\.?0+$/, '');
                    }
                } else {
                    const factor = Math.pow(10, userSettings.decimalPlaces);
                    let truncatedValue = Math.floor(riskPercentage * factor) / factor;
                    formattedRiskPercentage = truncatedValue.toString();
                    if (formattedRiskPercentage.indexOf('.') >= 0) {
                        formattedRiskPercentage = formattedRiskPercentage.replace(/\.?0+$/, '');
                    }
                }

                const riskText = `${formattedRiskPercentage}% Risk${userSettings.showRiskType ? ' (' + riskType + ')' : ''}`;

                const costContainer = box.querySelector('.cost-container');
                if (costContainer) {
                    let riskDisplay = costContainer.querySelector('.risk-display');
                    if (riskDisplay) {
                        riskDisplay.textContent = riskText;
                        riskDisplay.style.color = riskColor;
                    } else {
                        riskDisplay = document.createElement('span');
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

    settingsUI();
    create_risk_display();

})();
