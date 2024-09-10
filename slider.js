/*
                vanillaJS-Slider
Copyright (C) 2024 danielamani@projectEDNA 

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. */

(function () {
    // Inject CSS dynamically
    const sliderStyles = `
        .sliderWrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
            border: 1px solid #444;
            padding: 10px;
            border-radius: 5px;
            width: fit-content;
        }
        
        .sliderCanvasWrapper {
            position: relative;
            margin-bottom: 10px;
        }
        
        .sliderTitle {
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .controlsContainer {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-direction: column; /* Default to column for Style 0 */
        }

        .controlsContainer.style-1 {
            flex-direction: row; /* Side by side for Style 1 */
            justify-content: space-between;
        }

        .controlsContainer.style-2 {
            flex-direction: row; /* Side by side for Style 2 */
            justify-content: space-between;
        }

        .controlsContainer.style-3 {
            flex-direction: row; /* All elements in a single row for Style 3 */
            align-items: center;
        }
        
        .controlsBox {
            display: flex;
            flex-direction: column;
            gap: 5px;
            align-items: center;
        }

        .submitButton {
            padding: 5px 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    `;
    
    // Append styles to the document head
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = sliderStyles;
    document.head.appendChild(styleSheet);

    // Slider class definition
    class Slider {
        constructor(containerId, config = {}) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`Container with id "${containerId}" not found`);
                return;
            }

            // Default width and height will be set by derived classes
            this.config = {
                title: config.title !== undefined ? config.title : '',  // Title remains empty if not set
                width: config.width,  // Width to be determined by child classes
                height: config.height, // Height to be determined by child classes
                sliderLineColor: config.sliderLineColor || 'blue',
                sliderLineWidth: config.sliderLineWidth || 2,
                sliderHandleColor: config.sliderHandleColor || 'red',
                sliderHandleWidth: config.sliderHandleWidth || 20,
                sliderHandleHeight: config.sliderHandleHeight || 20,
                autoReturnToPos: config.autoReturnToPos || false,
                returnToPosValue: config.returnToPosValue || 0,
                minValue: config.minValue || 0,
                maxValue: config.maxValue || 100,
                step: config.step || 1,
                intervalCheck: config.intervalCheck || false,
                showCurrentValue: config.showCurrentValue || false,
                enableInputField: config.enableInputField || false,
                sliderShowSubmitButton: config.sliderShowSubmitButton !== undefined ? config.sliderShowSubmitButton : true,
                sliderBackgroundColour: config.sliderBackgroundColour || 'white',
                sliderValueInfo: config.sliderValueInfo || `Current: ${this.currentValue}`,
                sliderCanvasBorderWeight: config.sliderCanvasBorderWeight || 0,
                sliderCanvasBorderColour: config.sliderCanvasBorderColour || 'none',
                sliderTitleColour: config.sliderTitleColour || 'black',
                sliderInfoColour: config.sliderInfoColour || 'black',
                sliderSubmitButtonColour: config.sliderSubmitButtonColour || 'blue',
                sliderSubmitButtonTextColour: config.sliderSubmitButtonTextColour || 'white',
                sliderSwapPosition: config.sliderSwapPosition || false,
                sliderSubmitButtonText: config.sliderSubmitButtonText || 'OK',
                sliderStyle: config.sliderStyle || 0 // New option for layout style
            };

            this.currentValue = this.config.minValue;
            this.isDragging = false;

            this.createSlider();
        }

        createSlider() {
            this.container.innerHTML = '';

            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'sliderWrapper';
            sliderWrapper.style.backgroundColor = this.config.sliderBackgroundColour;

            // Only create the title element if a title is set
            if (this.config.title) {
                const sliderTitle = document.createElement('div');
                sliderTitle.className = 'sliderTitle';
                sliderTitle.textContent = this.config.title;
                sliderTitle.style.color = this.config.sliderTitleColour; // Set title color
                sliderWrapper.appendChild(sliderTitle);
            }

            const sliderCanvasWrapper = document.createElement('div');
            sliderCanvasWrapper.className = 'sliderCanvasWrapper';
            sliderCanvasWrapper.style.width = `${this.config.width}px`;
            sliderCanvasWrapper.style.height = `${this.config.height}px`;

            const sliderCanvas = document.createElement('canvas');
            sliderCanvas.id = this.config.title ? this.config.title.replace(/\s+/g, '_') : `slider_${Math.random().toString(36).substr(2, 9)}`; // Unique ID if title is not set
            sliderCanvas.width = this.config.width;
            sliderCanvas.height = this.config.height;

            // Apply border settings if border weight is greater than 0
            if (this.config.sliderCanvasBorderWeight > 0) {
                sliderCanvas.style.border = `${this.config.sliderCanvasBorderWeight}px solid ${this.config.sliderCanvasBorderColour}`;
            } else {
                sliderCanvas.style.border = 'none'; // No border if weight is 0
            }

            sliderCanvasWrapper.appendChild(sliderCanvas);

            const ctx = sliderCanvas.getContext('2d');
            this.sliderCanvas = sliderCanvas; // Save reference to the canvas for later use
            this.drawSlider(ctx);

            sliderWrapper.appendChild(sliderCanvasWrapper);
            this.createControlElements(sliderWrapper);

            this.container.appendChild(sliderWrapper);

            this.bindEvents(sliderCanvas, ctx);
        }

        drawSlider(ctx) {
            ctx.clearRect(0, 0, this.config.width, this.config.height);

            if (this instanceof SliderVertical) {
                ctx.beginPath();
                ctx.moveTo(this.config.width / 2, 0);
                ctx.lineTo(this.config.width / 2, this.config.height);
                ctx.strokeStyle = this.config.sliderLineColor;
                ctx.lineWidth = this.config.sliderLineWidth;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(0, this.config.height / 2);
                ctx.lineTo(this.config.width, this.config.height / 2);
                ctx.strokeStyle = this.config.sliderLineColor;
                ctx.lineWidth = this.config.sliderLineWidth;
                ctx.stroke();
            }

            this.drawHandle(ctx);
        }

        drawHandle(ctx) {
            const handleX = this instanceof SliderVertical
                ? this.config.width / 2
                : this.config.sliderSwapPosition
                    ? this.config.width - ((this.currentValue - this.config.minValue) / (this.config.maxValue - this.config.minValue) * (this.config.width - this.config.sliderHandleWidth) + this.config.sliderHandleWidth / 2)
                    : (this.currentValue - this.config.minValue) / (this.config.maxValue - this.config.minValue) * (this.config.width - this.config.sliderHandleWidth) + this.config.sliderHandleWidth / 2;

            const handleY = this instanceof SliderVertical
                ? this.config.sliderSwapPosition
                    ? (this.currentValue - this.config.minValue) / (this.config.maxValue - this.config.minValue) * (this.config.height - this.config.sliderHandleHeight) + this.config.sliderHandleHeight / 2
                    : this.config.height - ((this.currentValue - this.config.minValue) / (this.config.maxValue - this.config.minValue) * (this.config.height - this.config.sliderHandleHeight) + this.config.sliderHandleHeight / 2)
                : this.config.height / 2;

            ctx.beginPath();
            ctx.arc(handleX, handleY, this.config.sliderHandleWidth / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.config.sliderHandleColor;
            ctx.fill();
            ctx.strokeStyle = 'grey';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        createControlElements(wrapper) {
            const controlsContainer = document.createElement('div');
            controlsContainer.className = `controlsContainer ${this.getControlsStyleClass()}`;

            if (this.config.sliderStyle === 1) {
                // Style 1: Two boxes side by side
                this.createStyle1Controls(controlsContainer, wrapper);
            } else if (this.config.sliderStyle === 2) {
                // Style 2: Two boxes side by side with different content
                this.createStyle2Controls(controlsContainer, wrapper);
            } else if (this.config.sliderStyle === 3) {
                // Style 3: All elements in a single row
                this.createStyle3Controls(controlsContainer, wrapper);
            } else {
                // Default Style 0: Vertical layout
                this.createDefaultControls(controlsContainer);
            }

            wrapper.appendChild(controlsContainer);
        }

        createStyle1Controls(controlsContainer, wrapper) {
            // Style 1: Two boxes side by side
            const box1 = document.createElement('div');
            box1.className = 'controlsBox';

            const box2 = document.createElement('div');
            box2.className = 'controlsBox';

            const sliderBox = document.createElement('div');
            sliderBox.style.display = 'flex';
            sliderBox.style.flexDirection = 'column';
            sliderBox.style.alignItems = 'center';

            sliderBox.appendChild(wrapper.querySelector('.sliderCanvasWrapper'));

            box1.appendChild(sliderBox);

            if (this.config.showCurrentValue) {
                const valueDisplay = document.createElement('div');
                valueDisplay.id = `${this.config.title}_valueDisplay`;
                valueDisplay.textContent = `${this.config.sliderValueInfo} ${this.currentValue}`;
                valueDisplay.style.color = this.config.sliderInfoColour;
                sliderBox.appendChild(valueDisplay);
            }

            const inputField = document.createElement('input');
            inputField.type = 'number';
            inputField.min = this.config.minValue;
            inputField.max = this.config.maxValue;
            inputField.step = this.config.step;
            inputField.value = this.currentValue;
            inputField.id = `${this.config.title}_inputField`;
            inputField.addEventListener('input', (e) => this.updateSliderValue(e.target.value));
            box2.appendChild(inputField);

            if (this.config.sliderShowSubmitButton) {
                const submitButton = document.createElement('button');
                submitButton.textContent = this.config.sliderSubmitButtonText;
                submitButton.className = 'submitButton';
                submitButton.type = 'submit';
                submitButton.style.backgroundColor = this.config.sliderSubmitButtonColour;
                submitButton.style.color = this.config.sliderSubmitButtonTextColour;
                //submitButton.addEventListener('click', () => alert(`Slider value: ${this.currentValue}`));
                box2.appendChild(submitButton);
            }

            controlsContainer.appendChild(box1);
            controlsContainer.appendChild(box2);
        }

        createStyle2Controls(controlsContainer, wrapper) {
            // Style 2: Two boxes side by side with different content
            const box1 = document.createElement('div');
            box1.className = 'controlsBox';
            box1.appendChild(wrapper.querySelector('.sliderCanvasWrapper'));

            const box2 = document.createElement('div');
            box2.className = 'controlsBox';

            if (this.config.showCurrentValue) {
                const valueDisplay = document.createElement('div');
                valueDisplay.id = `${this.config.title}_valueDisplay`;
                valueDisplay.textContent = `${this.config.sliderValueInfo} ${this.currentValue}`;
                valueDisplay.style.color = this.config.sliderInfoColour;
                box2.appendChild(valueDisplay);
            }

            if (this.config.enableInputField) {
                const inputField = document.createElement('input');
                inputField.type = 'number';
                inputField.min = this.config.minValue;
                inputField.max = this.config.maxValue;
                inputField.step = this.config.step;
                inputField.value = this.currentValue;
                inputField.id = `${this.config.title}_inputField`;
                inputField.addEventListener('input', (e) => this.updateSliderValue(e.target.value));
                box2.appendChild(inputField);
            }

            if (this.config.sliderShowSubmitButton) {
                const submitButton = document.createElement('button');
                submitButton.textContent = this.config.sliderSubmitButtonText;
                submitButton.className = 'submitButton';
                submitButton.type = 'submit';
                submitButton.style.backgroundColor = this.config.sliderSubmitButtonColour;
                submitButton.style.color = this.config.sliderSubmitButtonTextColour;
                //submitButton.addEventListener('click', () => alert(`Slider value: ${this.currentValue}`));
                box2.appendChild(submitButton);
            }

            controlsContainer.appendChild(box1);
            controlsContainer.appendChild(box2);
        }

        createStyle3Controls(controlsContainer, wrapper) {
            // Style 3: All elements in a single row
            controlsContainer.classList.add('style-3');

            // Append the slider
            controlsContainer.appendChild(wrapper.querySelector('.sliderCanvasWrapper'));

            // Create and append the value display
            if (this.config.showCurrentValue) {
                const valueDisplay = document.createElement('div');
                valueDisplay.id = `${this.config.title}_valueDisplay`;
                valueDisplay.textContent = `${this.config.sliderValueInfo} ${this.currentValue}`;
                valueDisplay.style.color = this.config.sliderInfoColour;
                controlsContainer.appendChild(valueDisplay);
            }

            // Create and append the input field
            if (this.config.enableInputField) {
                const inputField = document.createElement('input');
                inputField.type = 'number';
                inputField.min = this.config.minValue;
                inputField.max = this.config.maxValue;
                inputField.step = this.config.step;
                inputField.value = this.currentValue;
                inputField.id = `${this.config.title}_inputField`;
                inputField.addEventListener('input', (e) => this.updateSliderValue(e.target.value));
                controlsContainer.appendChild(inputField);
            }

            // Create and append the submit button
            if (this.config.sliderShowSubmitButton) {
                const submitButton = document.createElement('button');
                submitButton.textContent = this.config.sliderSubmitButtonText;
                submitButton.className = 'submitButton';
                submitButton.type = 'submit';
                submitButton.style.backgroundColor = this.config.sliderSubmitButtonColour;
                submitButton.style.color = this.config.sliderSubmitButtonTextColour;
                submitButton.addEventListener('click', () => alert(`Slider value: ${this.currentValue}`));
                controlsContainer.appendChild(submitButton);
            }
        }

        createDefaultControls(controlsContainer) {
            // Default Style 0: Vertical layout
            if (this.config.showCurrentValue) {
                const valueDisplay = document.createElement('div');
                valueDisplay.id = `${this.config.title}_valueDisplay`;
                valueDisplay.textContent = `${this.config.sliderValueInfo} ${this.currentValue}`;
                valueDisplay.style.color = this.config.sliderInfoColour;
                controlsContainer.appendChild(valueDisplay);
            }

            if (this.config.enableInputField) {
                const inputField = document.createElement('input');
                inputField.type = 'number';
                inputField.min = this.config.minValue;
                inputField.max = this.config.maxValue;
                inputField.step = this.config.step;
                inputField.value = this.currentValue;
                inputField.id = `${this.config.title}_inputField`;
                inputField.addEventListener('input', (e) => this.updateSliderValue(e.target.value));
                controlsContainer.appendChild(inputField);
            }

            if (this.config.sliderShowSubmitButton) {
                const submitButton = document.createElement('button');
                submitButton.textContent = this.config.sliderSubmitButtonText;
                submitButton.className = 'submitButton';
                submitButton.type = 'submit';
                submitButton.style.backgroundColor = this.config.sliderSubmitButtonColour;
                submitButton.style.color = this.config.sliderSubmitButtonTextColour;
                submitButton.addEventListener('click', () => alert(`Slider value: ${this.currentValue}`));
                controlsContainer.appendChild(submitButton);
            }
        }

        getControlsStyleClass() {
            // Determine the style class based on sliderStyle
            if (this.config.sliderStyle === 1) return 'style-1';
            if (this.config.sliderStyle === 2) return 'style-2';
            if (this.config.sliderStyle === 3) return 'style-3';
            return ''; // Default style
        }

        bindEvents(canvas, ctx) {
            canvas.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.updateSliderPosition(e, ctx);
            });
        
            document.addEventListener('mouseup', () => {
                this.isDragging = false;
                // Handle auto-return functionality on mouse up
                if (this.config.autoReturnToPos) {
                    this.currentValue = this.config.returnToPosValue;
                    this.updateSliderValue(this.currentValue);
                }
            });
        
            canvas.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    this.updateSliderPosition(e, ctx);
                }
            });
        
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isDragging = true;
                this.updateSliderPosition(e.touches[0], ctx);
            });
        
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (this.isDragging) {
                    this.updateSliderPosition(e.touches[0], ctx);
                }
            });
        
            canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.isDragging = false;
                // Handle auto-return functionality on touch end
                if (this.config.autoReturnToPos) {
                    this.currentValue = this.config.returnToPosValue;
                    this.updateSliderValue(this.currentValue);
                }
            });
        }
        

        updateSliderPosition(e, ctx) {
            const rect = e.target.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            let newValue;

            if (this instanceof SliderVertical) {
                const posY = Math.max(0, Math.min(offsetY, this.config.height));
                newValue = this.config.sliderSwapPosition
                    ? (posY / this.config.height) * (this.config.maxValue - this.config.minValue) + this.config.minValue
                    : this.config.maxValue - (posY / this.config.height) * (this.config.maxValue - this.config.minValue);
            } else {
                const posX = Math.max(0, Math.min(offsetX, this.config.width));
                newValue = this.config.sliderSwapPosition
                    ? this.config.maxValue - (posX / this.config.width) * (this.config.maxValue - this.config.minValue)
                    : (posX / this.config.width) * (this.config.maxValue - this.config.minValue) + this.config.minValue;
            }

            this.currentValue = Math.round(newValue / this.config.step) * this.config.step;
            this.updateSliderValue(this.currentValue);
            this.drawSlider(ctx);
        }

        updateSliderValue(value) {
            this.currentValue = Math.max(this.config.minValue, Math.min(this.config.maxValue, value));
            if (this.config.showCurrentValue) {
                document.getElementById(`${this.config.title}_valueDisplay`).textContent = `${this.config.sliderValueInfo} ${this.currentValue}`;
            }
            if (this.config.enableInputField) {
                document.getElementById(`${this.config.title}_inputField`).value = this.currentValue;
            }
        
            const ctx = this.sliderCanvas.getContext('2d');
            this.drawSlider(ctx);
        }
        
    }

    class SliderVertical extends Slider {
        constructor(containerId, config = {}) {
            // Set default width and height for vertical sliders
            super(containerId, {
                ...config,
                width: config.width || 50,
                height: config.height || 400
            });
        }
    }

    class SliderHorizontal extends Slider {
        constructor(containerId, config = {}) {
            // Set default width and height for horizontal sliders
            super(containerId, {
                ...config,
                width: config.width || 300,
                height: config.height || 50
            });
        }
    }

    // Expose the slider classes to the global scope
    window.SliderVertical = SliderVertical;
    window.SliderHorizontal = SliderHorizontal;
})();
