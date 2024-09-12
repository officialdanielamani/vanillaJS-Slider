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
                width: config.width,  // Width to be determined by child classes
                height: config.height, // Height to be determined by child classes
                sliderLineWidth: config.sliderLineWidth || 2,
                sliderLineColor: config.sliderLineColor || '#000', // Default line color to black
                sliderHandleWidth: config.sliderHandleWidth || 20,
                sliderHandleHeight: config.sliderHandleHeight || 20,
                sliderHandleColor: config.sliderHandleColor || '#444', // Default handle color to dark grey
                sliderHandleShape: config.sliderHandleShape || 'circle', // New parameter for handle shape
                autoReturnToPos: config.autoReturnToPos || false,
                returnToPosValue: config.returnToPosValue || 0,
                minValue: config.minValue || 0,
                maxValue: config.maxValue || 100,
                step: config.step || 1,
                showCurrentValue: config.showCurrentValue || false,
                enableInputField: config.enableInputField || false,
                sliderShowSubmitButton: config.sliderShowSubmitButton !== undefined ? config.sliderShowSubmitButton : true,
                sliderValueInfo: config.sliderValueInfo || `Current Value:`,
                sliderSwapPosition: config.sliderSwapPosition || false,
                sliderSubmitButtonText: config.sliderSubmitButtonText || 'OK',
                sliderStyle: config.sliderStyle || 0, // New option for layout style
                onChange: config.onChange || null // Callback for value changes
            };

            this.currentValue = this.config.minValue;
            this.isDragging = false;

            this.addDefaultStyles(); // Add default styles
            this.createSlider();
        }

        addDefaultStyles() {
            // Check if styles are already defined
            if (!document.getElementById('slider-styles')) {
                const style = document.createElement('style');
                style.type = 'text/css';
                style.id = 'slider-styles';

                // Default CSS styles with lower specificity
                const css = `
                    .sliderWrapper {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin: 20px 0;
                        padding: 10px;
                        width: fit-content;
                    }
                    
                    .sliderCanvasWrapper {
                        position: relative;
                        margin-bottom: 10px;
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
                        background-color: blue;
                        color: white;
                    }
                `;

                // Inject CSS into the <style> element
                style.appendChild(document.createTextNode(css));

                // Append the <style> element to the document head, before any user-defined styles
                document.head.insertBefore(style, document.head.firstChild);
            }
        }

        createSlider() {
            this.container.innerHTML = '';

            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'sliderWrapper';

            const sliderCanvasWrapper = document.createElement('div');
            sliderCanvasWrapper.className = 'sliderCanvasWrapper';
            sliderCanvasWrapper.style.width = `${this.config.width}px`;
            sliderCanvasWrapper.style.height = `${this.config.height}px`;

            const sliderCanvas = document.createElement('canvas');
            sliderCanvas.id = `slider_${Math.random().toString(36).substr(2, 9)}`; // Unique ID
            sliderCanvas.width = this.config.width;
            sliderCanvas.height = this.config.height;

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

            ctx.strokeStyle = this.config.sliderLineColor; // Set the line color
            ctx.lineWidth = this.config.sliderLineWidth; // Set the line width

            if (this instanceof SliderVertical) {
                ctx.beginPath();
                ctx.moveTo(this.config.width / 2, 0);
                ctx.lineTo(this.config.width / 2, this.config.height);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(0, this.config.height / 2);
                ctx.lineTo(this.config.width, this.config.height / 2);
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

            ctx.fillStyle = this.config.sliderHandleColor; // Set the handle color

            // Draw the handle based on the shape
            ctx.beginPath();
            if (this.config.sliderHandleShape === 'circle') {
                ctx.arc(handleX, handleY, this.config.sliderHandleWidth / 2, 0, Math.PI * 2);
            } else if (this.config.sliderHandleShape === 'square') {
                ctx.rect(
                    handleX - this.config.sliderHandleWidth / 2,
                    handleY - this.config.sliderHandleHeight / 2,
                    this.config.sliderHandleWidth,
                    this.config.sliderHandleHeight
                );
            } else if (this.config.sliderHandleShape === 'rounded-rectangle') {
                const radius = 5; // Example corner radius
                ctx.moveTo(handleX - this.config.sliderHandleWidth / 2 + radius, handleY - this.config.sliderHandleHeight / 2);
                ctx.lineTo(handleX + this.config.sliderHandleWidth / 2 - radius, handleY - this.config.sliderHandleHeight / 2);
                ctx.quadraticCurveTo(handleX + this.config.sliderHandleWidth / 2, handleY - this.config.sliderHandleHeight / 2, handleX + this.config.sliderHandleWidth / 2, handleY - this.config.sliderHandleHeight / 2 + radius);
                ctx.lineTo(handleX + this.config.sliderHandleWidth / 2, handleY + this.config.sliderHandleHeight / 2 - radius);
                ctx.quadraticCurveTo(handleX + this.config.sliderHandleWidth / 2, handleY + this.config.sliderHandleHeight / 2, handleX + this.config.sliderHandleWidth / 2 - radius, handleY + this.config.sliderHandleHeight / 2);
                ctx.lineTo(handleX - this.config.sliderHandleWidth / 2 + radius, handleY + this.config.sliderHandleHeight / 2);
                ctx.quadraticCurveTo(handleX - this.config.sliderHandleWidth / 2, handleY + this.config.sliderHandleHeight / 2, handleX - this.config.sliderHandleWidth / 2, handleY + this.config.sliderHandleHeight / 2 - radius);
                ctx.lineTo(handleX - this.config.sliderHandleWidth / 2, handleY - this.config.sliderHandleHeight / 2 + radius);
                ctx.quadraticCurveTo(handleX - this.config.sliderHandleWidth / 2, handleY - this.config.sliderHandleHeight / 2, handleX - this.config.sliderHandleWidth / 2 + radius, handleY - this.config.sliderHandleHeight / 2);
            }
            ctx.fill();
            ctx.strokeStyle = 'grey';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        createControlElements(wrapper) {
            const controlsContainer = document.createElement('div');
            controlsContainer.className = `controlsContainer ${this.getControlsStyleClass()}`;

            if (this.config.sliderStyle === 1) {
                this.createStyle1Controls(controlsContainer, wrapper);
            } else if (this.config.sliderStyle === 2) {
                this.createStyle2Controls(controlsContainer, wrapper);
            } else if (this.config.sliderStyle === 3) {
                this.createStyle3Controls(controlsContainer, wrapper);
            } else {
                this.createDefaultControls(controlsContainer);
            }

            wrapper.appendChild(controlsContainer);
        }

        createDefaultControls(controlsContainer) {
            if (this.config.showCurrentValue) {
                const valueDisplay = document.createElement('div');
                valueDisplay.id = `${this.container.id}_valueDisplay`; // Ensure unique ID for the display
                valueDisplay.textContent = `${this.config.sliderValueInfo} ${this.currentValue}`;
                controlsContainer.appendChild(valueDisplay);
            }

            if (this.config.enableInputField) {
                const inputField = document.createElement('input');
                inputField.type = 'number';
                inputField.min = this.config.minValue;
                inputField.max = this.config.maxValue;
                inputField.step = this.config.step;
                inputField.value = this.currentValue;
                inputField.id = `${this.container.id}_inputField`; // Ensure unique ID for the input
                inputField.addEventListener('input', (e) => this.updateSliderValue(e.target.value));
                controlsContainer.appendChild(inputField);
            }

            if (this.config.sliderShowSubmitButton) {
                const submitButton = document.createElement('button');
                submitButton.textContent = this.config.sliderSubmitButtonText;
                submitButton.className = 'submitButton';
                submitButton.type = 'submit';
                //submitButton.addEventListener('click', () => alert(`Slider value: ${this.currentValue}`));
                controlsContainer.appendChild(submitButton);
            }
        }

        createStyle1Controls(controlsContainer, wrapper) {
            // Implement style 1 controls
            const box1 = document.createElement('div');
            box1.className = 'controlsBox';
            box1.appendChild(wrapper.querySelector('.sliderCanvasWrapper'));

            const box2 = document.createElement('div');
            box2.className = 'controlsBox';

            this.appendControls(box2);
            controlsContainer.appendChild(box1);
            controlsContainer.appendChild(box2);
        }

        createStyle2Controls(controlsContainer, wrapper) {
            // Implement style 2 controls
            const box1 = document.createElement('div');
            box1.className = 'controlsBox';
            box1.appendChild(wrapper.querySelector('.sliderCanvasWrapper'));

            const box2 = document.createElement('div');
            box2.className = 'controlsBox';

            this.appendControls(box2);
            controlsContainer.appendChild(box1);
            controlsContainer.appendChild(box2);
        }

        createStyle3Controls(controlsContainer, wrapper) {
            // Implement style 3 controls
            controlsContainer.classList.add('style-3');
            controlsContainer.appendChild(wrapper.querySelector('.sliderCanvasWrapper'));
            this.appendControls(controlsContainer);
        }

        appendControls(container) {
            if (this.config.showCurrentValue) {
                const valueDisplay = document.createElement('div');
                valueDisplay.id = `${this.container.id}_valueDisplay`; // Ensure unique ID for the display
                valueDisplay.textContent = `${this.config.sliderValueInfo} ${this.currentValue}`;
                container.appendChild(valueDisplay);
            }

            if (this.config.enableInputField) {
                const inputField = document.createElement('input');
                inputField.type = 'number';
                inputField.min = this.config.minValue;
                inputField.max = this.config.maxValue;
                inputField.step = this.config.step;
                inputField.value = this.currentValue;
                inputField.id = `${this.container.id}_inputField`; // Ensure unique ID for the input
                inputField.addEventListener('input', (e) => this.updateSliderValue(e.target.value));
                container.appendChild(inputField);
            }

            if (this.config.sliderShowSubmitButton) {
                const submitButton = document.createElement('button');
                submitButton.textContent = this.config.sliderSubmitButtonText;
                submitButton.className = 'submitButton';
                submitButton.type = 'submit';
                //submitButton.addEventListener('click', () => alert(`Slider value: ${this.currentValue}`));
                container.appendChild(submitButton);
            }
        }

        getControlsStyleClass() {
            if (this.config.sliderStyle === 1) return 'style-1';
            if (this.config.sliderStyle === 2) return 'style-2';
            if (this.config.sliderStyle === 3) return 'style-3';
            return '';
        }

        bindEvents(canvas, ctx) {
            canvas.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.updateSliderPosition(e, ctx);
            });

            document.addEventListener('mouseup', () => {
                this.isDragging = false;
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
            
            // Update the value display if it exists
            const valueDisplay = document.getElementById(`${this.container.id}_valueDisplay`);
            if (valueDisplay) {
                valueDisplay.textContent = `${this.config.sliderValueInfo} ${this.currentValue}`;
            }

            // Update the input field if it exists
            const inputField = document.getElementById(`${this.container.id}_inputField`);
            if (inputField) {
                inputField.value = this.currentValue;
            }

            // Trigger the onChange callback if it is defined
            if (typeof this.config.onChange === 'function') {
                this.config.onChange(this.currentValue);
            }

            const ctx = this.sliderCanvas.getContext('2d');
            this.drawSlider(ctx);
        }
    }

    class SliderVertical extends Slider {
        constructor(containerId, config = {}) {
            super(containerId, {
                ...config,
                width: config.width || 50,
                height: config.height || 300
            });
        }
    }

    class SliderHorizontal extends Slider {
        constructor(containerId, config = {}) {
            super(containerId, {
                ...config,
                width: config.width || 300,
                height: config.height || 50
            });
        }
    }

    window.SliderVertical = SliderVertical;
    window.SliderHorizontal = SliderHorizontal;
})();
