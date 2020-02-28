# Product-Customizer
Customizer for products using modifyable SVG elements

This project is a proof of concept for my employer 
for a more efficient and user friendly product customizer.
It adds features that were required, like adding text elements and is written in js for easy integration.

Features:
- add and delete elements
- feedback for whether or not the elements are still within the given borders of the product
- preview the product by hiding all helping UI lines
- snap the elements to lines for easier arangement
- Text:
  - resize
  - drag
  - change font
  - align

Functionality:
The html file consists of 2 parts 
-> the svg which is the preview of the product 
-> and another div with the input fields and buttons to modify the product

There is an initial text element with its according rectangle to show the functionality.
Each Text element is a child of the group "textgroup".
The text elements has as many tspan elements as the input text has new lines. In other words, each tspan element represents one line of the input.
The Ids of the text elements are coherent to the ids of the rectangle elements.

Each rectangle belongs to one text element.
The rectangles are draggable and selectable so that the text within them can be moved and modified.
Additionally, the rectangles act as a border of the text to determine wheter the text is still within the borders of the product.

There is also 2 snapping lines in the snapping line group appended to the svg.
These lines allow easier arangement by making elements stick to their borders.
The lines are always in the middle of the product. They can be hidden by clicking the "preview product" button.
