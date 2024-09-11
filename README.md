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
        var verticalSlider = new SliderVertical('sliderDiv');

        // Create a basic horizontal slider
        var horizontalSlider = new SliderHorizontal('sliderDiv2');
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
        var verticalSlider = new SliderVertical('sliderDiv', {
        title: 'Temperature Control',
        sliderLineColor: 'blue',
        sliderHandleColor: 'red',
        showCurrentValue: true,
        enableInputField: true,
        step: 5,
        sliderBackgroundColour: 'white',
        sliderValueInfo: 'Temperature:',
        sliderCanvasBorderWeight: 2,
        sliderCanvasBorderColour: 'white',
        sliderTitleColour: 'yellow',
        sliderInfoColour: 'green',
        sliderSubmitButtonColour: 'blue',
        sliderSubmitButtonTextColour: 'white',
        sliderShowSubmitButton: true,
        sliderStyle: 2 
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

1. **`sliderStyle: {int}`**
   - **Default:** `0`
   - **Usage:** Determines the layout style of the slider, value display, input field, and submit button. 
     - `0` - Default vertical layout.
     - `1` - Two boxes side by side (slider in one box, controls in the other).
     - `2` - Two boxes side by side with different content.
     - `3` - All elements in a single row.

2. **`title: {string}`**
   - **Default:** `''` (empty string)
   - **Usage:** Sets the title displayed above the slider. If not set, no title is displayed.

3. **`width: {int}`**
   - **Default:** `50` for `SliderVertical`, `300` for `SliderHorizontal`
   - **Usage:** Specifies the width of the slider canvas.

4. **`height: {int}`**
   - **Default:** `400` for `SliderVertical`, `50` for `SliderHorizontal`
   - **Usage:** Specifies the height of the slider canvas.

5. **`sliderLineColor: {string}`**
   - **Default:** `'blue'`
   - **Usage:** Sets the color of the slider line.

6. **`sliderLineWidth: {int}`**
   - **Default:** `2`
   - **Usage:** Specifies the width of the slider line.

7. **`sliderHandleColor: {string}`**
   - **Default:** `'red'`
   - **Usage:** Sets the color of the slider handle.

8. **`sliderHandleWidth: {int}`**
   - **Default:** `20`
   - **Usage:** Specifies the width of the slider handle.

9. **`sliderHandleHeight: {int}`**
   - **Default:** `20`
   - **Usage:** Specifies the height of the slider handle.

10. **`autoReturnToPos: {boolean}`**
    - **Default:** `false`
    - **Usage:** Determines whether the slider handle should automatically return to a set position when released.

11. **`returnToPosValue: {int}`**
    - **Default:** `0`
    - **Usage:** Specifies the value to which the slider handle should return if `autoReturnToPos` is set to `true`.

12. **`minValue: {int}`**
    - **Default:** `0`
    - **Usage:** Specifies the minimum value for the slider.

13. **`maxValue: {int}`**
    - **Default:** `100`
    - **Usage:** Specifies the maximum value for the slider.

14. **`step: {int}`**
    - **Default:** `1`
    - **Usage:** Defines the step increment for the slider value.

15. **`intervalCheck: {boolean}`**
    - **Default:** `false`
    - **Usage:** Enables or disables checking of the slider value at regular intervals.

16. **`showCurrentValue: {boolean}`**
    - **Default:** `false`
    - **Usage:** Determines whether the current slider value is displayed next to the slider.

17. **`enableInputField: {boolean}`**
    - **Default:** `false`
    - **Usage:** Enables or disables the input field for directly entering the slider value.

18. **`sliderShowSubmitButton: {boolean}`**
    - **Default:** `true`
    - **Usage:** Controls whether the submit button is displayed.

19. **`sliderBackgroundColour: {string}`**
    - **Default:** `'white'`
    - **Usage:** Sets the background color of the slider container.

20. **`sliderValueInfo: {string}`**
    - **Default:** `"Current: ${this.currentValue}"`
    - **Usage:** Specifies the text format displayed next to the current slider value. Can be customized to display different information.

21. **`sliderCanvasBorderWeight: {int}`**
    - **Default:** `0`
    - **Usage:** Sets the border width of the slider canvas. A value of `0` means no border.

22. **`sliderCanvasBorderColour: {string}`**
    - **Default:** `'none'`
    - **Usage:** Specifies the border color of the slider canvas.

23. **`sliderTitleColour: {string}`**
    - **Default:** `'black'`
    - **Usage:** Sets the color of the slider title text.

24. **`sliderInfoColour: {string}`**
    - **Default:** `'black'`
    - **Usage:** Sets the color of the current value text displayed next to the slider.

25. **`sliderSubmitButtonColour: {string}`**
    - **Default:** `'blue'`
    - **Usage:** Sets the background color of the submit button.

26. **`sliderSubmitButtonTextColour: {string}`**
    - **Default:** `'white'`
    - **Usage:** Sets the text color of the submit button.

27. **`sliderSwapPosition: {boolean}`**
    - **Default:** `false`
    - **Usage:** When set to `true`, swaps the minimum and maximum positions of the slider. For horizontal sliders, this swaps left and right. For vertical sliders, this swaps top and bottom.

28. **`sliderSubmitButtonText: {string}`**
    - **Default:** `'OK'`
    - **Usage:** Sets the text displayed on the submit button.


## Acknowledgements

Special thanks to the contributors and the open-source community for their continuous support. Thanks to Nakamoto Albert for supporting with ProjectEDNA.
