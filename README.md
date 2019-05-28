# Dynamic radio buttons
Widget used to show a list of radio buttons, where the user can choose which values of the enumeration to display and change the captions of the enumeration values (including using values of other attributes).

## Typical usage scenario
- When you do not want the user to be able to select any value of an enumeration
- When the captions of the enumeraion do not suffice
- When the value of another attribute is needed for (one of) the caption(s)

## Configuration
### General
- Enumeration: the enumeration to base the radiobuttons on
- Values: Here the values can be added that the user can select
  - Key: This should ne exactly the same key as the key of the enumeration value to add
  - Caption: The caption consists out of three parts: Caption before, Attribute and Caption after. All can be left empty if needed. Example: when Caption before is set to 'Gained: ', a decimal attribute with a value of 10.3 is chosen and Caption after is set to ' %', the  value that will be shown is 'Gained: 10.3 %'.
- Read only: Whether the user is allowed to edit the enumeration.
- Direction: Horizontal vs Vertical
- Show label: Whether a label should be added next to the radio buttons
- Label caption: The label to show
- Label width: The width of the label (just as within mendix)

### Events
- Whether a microflow or nanoflow should be triggered onchange.
