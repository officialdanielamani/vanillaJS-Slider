# vanillaJS-Slider
A simple implementation for slider that using vanilla JS for better slider support like vertical slider. No need external library, easy to use.

## To-Do
- [ ] Versioning
- [ ] Make mini-slider (this more reduce option for space constrain appliction)
- [ ] Make advc-slider (more functionality and options)
- [ ] Testing edge cases
- [ ] Adding more info, picture and tryme webpage

## How to use it

### Basic guide
```HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic Slider Example</title>
    <!-- Include the slider.js or slider.min.js file -->
    <script src="slider.js"></script>
</head>
<body style="background-color: #2f2d5a; color: white;">
    <h2>Basic Vertical Slider</h2>
    <div id="sliderDiv"></div>

    <h2>Basic Horizontal Slider</h2>
    <div id="sliderDiv2"></div>

    <script>
        // Create a basic vertical slider
        const verticalSlider = new SliderVertical('sliderDiv');

        // Create a basic horizontal slider
        const horizontalSlider = new SliderHorizontal('sliderDiv2');
    </script>
</body>
</html>
```
First include the JS files that we need
`<script src="slider.js"></script>`

Next create a Div with custom ID (each slider need it's unique ID)
`<div id="sliderDiv"></div>` you need to initialize or create the slider

On the `script` part;
`var verticalSlider = new SliderVertical('sliderDiv');` this create a Vertical Slider for `sliderDiv` and the value that get from slider will be update in `var verticalSlider`

You can implement simple sending value in interval like;

```JS
function sendSliderValue() {
            const sliderValue = verticalSlider.currentValue; // Get current value of the slider

            fetch('/slider-3-value', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value: sliderValue }) // Send slider value as JSON
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }

        // Send the slider value every 5 seconds
        setInterval(sendSliderValue, 5000);
```

Here is more advance configuration (see Parameter List for more options)

```JS
    <script>
        // Create a Vertical Slider
        const advancedVerticalSlider = new SliderVertical('advancedVerticalSlider', {
            width: 50,
            height: 500,
            minValue: 0,
            maxValue: 100,
            step: 1,
            sliderLineColor: '#FF0000', 
            sliderHandleColor: '#00FF00',
            showCurrentValue: true,
            enableInputField: true,
            sliderHandleWidth: 30,
            sliderShowSubmitButton: true,
            sliderValueInfo: 'Current Value:',
            sliderSwapPosition: false,
            sliderSubmitButtonText: 'OK',
            sliderStyle: 2, 
            sliderHandleShape: 'square', // Square handle
            sliderHandleWidth: 30,
            sliderHandleHeight: 15,
            autoReturnToPos: true,
            returnToPosValue: 50, // Return to 50 when released
            onChange: (value) => {
                console.log(`advancedVerticalSlider: ${value}`); // Show value in console
            }
        });
```
No need for configure all parameter, see the default value if it match your requirements.

## Type

1. **`SliderHorizontal`**
  - For Horizontal style slider

2. **`SliderVertical`**
  - For Vertical style slider

## Parameter List
All paramter are optional, no need to declare if not use or need to change. See Default for each parameter for more informations. The paramters no need in spesific order.

1. **`width: {int}`**  
   - **Default**: Width is determined by child classes (e.g., `SliderVertical:50`, `SliderHorizontal:300`).  
   - **Usage**: Specifies the width of the slider in pixels.

2. **`height: {int}`**  
   - **Default**: Height is determined by child classes (e.g., `SliderVertical:300`, `SliderHorizontal:50`).  
   - **Usage**: Specifies the height of the slider in pixels.

3. **`sliderLineWidth: {int}`**  
   - **Default**: 2  
   - **Usage**: Determines the width of the slider line in pixels.

4. **`sliderLineColor: {string}`**  
   - **Default**: `'#000'` (black)  
   - **Usage**: Sets the color of the slider line. Accepts any valid CSS color value.

5. **`sliderHandleWidth: {int}`**  
   - **Default**: 20  
   - **Usage**: Sets the width of the slider handle in pixels.

6. **`sliderHandleHeight: {int}`**  
   - **Default**: 20  
   - **Usage**: Sets the height of the slider handle in pixels.

7. **`sliderHandleColor: {string}`**  
   - **Default**: `'#444'` (dark grey)  
   - **Usage**: Defines the color of the slider handle. Accepts any valid CSS color value.

8. **`sliderHandleShape: {string}`**  
   - **Default**: `'circle'`  
   - **Usage**: Specifies the shape of the slider handle.  
     - `'circle'` - Circular handle.  
     - `'square'` - Square handle.  
     - `'rounded-rectangle'` - Rounded rectangle handle.

9. **`autoReturnToPos: {boolean}`**  
   - **Default**: `false`  
   - **Usage**: If `true`, the slider handle will automatically return to a specified position when released.

10. **`returnToPosValue: {int}`**  
    - **Default**: 0  
    - **Usage**: Defines the position to which the slider handle will return if `autoReturnToPos` is enabled.

11. **`minValue: {int}`**  
    - **Default**: 0  
    - **Usage**: Specifies the minimum value of the slider.

12. **`maxValue: {int}`**  
    - **Default**: 100  
    - **Usage**: Specifies the maximum value of the slider.

13. **`step: {int}`**  
    - **Default**: 1  
    - **Usage**: Sets the increment or decrement step size for the slider values.

14. **`showCurrentValue: {boolean}`**  
    - **Default**: `false`  
    - **Usage**: If `true`, the current slider value will be displayed on the UI.

15. **`enableInputField: {boolean}`**  
    - **Default**: `false`  
    - **Usage**: If `true`, an input field will be provided for the user to enter the slider value manually.

16. **`sliderShowSubmitButton: {boolean}`**  
    - **Default**: `true`  
    - **Usage**: If `true`, a submit button will be displayed to submit the slider value.

17. **`sliderValueInfo: {string}`**  
    - **Default**: `'Current Value:'`  
    - **Usage**: Specifies the label text for the current value display.

18. **`sliderSwapPosition: {boolean}`**  
    - **Default**: `false`  
    - **Usage**: If `true`, swaps the default position of the slider handle.

19. **`sliderSubmitButtonText: {string}`**  
    - **Default**: `'OK'`  
    - **Usage**: Text for the submit button.

20. **`sliderStyle: {int}`**  
    - **Default**: 0  
    - **Usage**: Determines the layout style of the slider, value display, input field, and submit button.  
      - `0` - Default vertical layout.  
      - `1` - Two boxes side by side (slider in one box, controls in the other).  
      - `2` - Two boxes side by side with different content.  
      - `3` - All elements in a single row.

21. **`onChange: {function}`**  
    - **Default**: `null`  
    - **Usage**: Callback function that triggers whenever the slider value changes. Receives the current value as a parameter.

## Acknowledgements

Special thanks to the contributors and the open-source community for their continuous support. Thanks to Nakamoto Albert for supporting with ProjectEDNA.
