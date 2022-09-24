class Input {
    constructor(element) {
        const elementExist = element !== false;

        const isInput = element?.tagName?.toLowerCase() === "input";

        if (!elementExist) throw new Error("Input: null input provided");
        if (!isInput) throw new Error("Input: no input element provided");

        this.element = element; 
        this.texts = new Map();

        element.addEventListener("input", this.notify.bind(this));
    }

    addText(name, text) {
        const texts = this.texts;
        const hasText = this.texts.has(name);

        if (hasText) throw new Error(`Input: ${name} text already defined`);

        texts.set(name, text);
    }

    removeText(name) {
        const texts = this.texts; 
        const hasText = this.texts.has(name);

        if (!hasText) throw new Error(`Input: ${name} text doesn't exist`);

        texts.delete(name);
    }

    notify(event) {
        console.log("To implement");        
    }

    getValue() {
        return undefined;
    }

    setValue() {
        console.log("To define");
    }
}

class NumberInput extends Input {
    constructor(element, defaultValue=0) {
       super(element);

       if (element.getAttribute("inputmode") === "numeric") {
            this.type = "numeric";
       } else if (element.getAttribute("inputmode") === "decimal") {
            this.type = "decimal";
       } else {
            throw new Error("NumberInput: Invalid type");
       }

       this.value = defaultValue;
       this.min = element.getAttribute("min") ? Number.parseInt(element.getAttribute("min"), 10) : 0;
       this.max = element.getAttribute("max") ? Number.parseInt(element.getAttribute("max"), 10) : Number.MAX_SAFE_INTEGER;
    }

    notify(event) {
        const value = event?.target.value;
        const texts = this.texts;
        let number = 0;

        if (value === "") {
            this.value = undefined;
    
            return;
        }

        if (this.type === "numeric") {
            number = Number.parseInt(value, 10);
        } else if (this.type === "decimal") {
            number = Number.parseFloat(value);
        } else {
            throw new Error("NumberInput: Invalid type");
        }

        const isRangeValid = number >= this.min && number <= this.max;
    
        if (isRangeValid) {
            this.value = number;
            for (let text of texts.values()) {
                if (text.update) {
                    text.update(this.value);
                }
            }
        }
    }

    getValue() {
        return this.value;
    }

    setValue(newValue) {
        this.element.value = newValue;
        this.value = newValue;
    }
}

class RadioGroupNumber {
    constructor(elements, setCallback=undefined) {
        if (!elements) throw new Error("RadioGroupNumber: No elements provided");

        this.value = 0;

        for (let element of elements) {
            const isInput = element.tagName.toLowerCase() === "input";
            const isRadio = element.getAttribute("type") === "radio";

            if (!isInput) throw new Error("RadioGroupNumber: Element provided isn't input");
            if (!isRadio) throw new Error("RadioGroupNumber: Input provided isn't radio");

            const isChecked = element.checked;
            
            if (isChecked) {
                this.value = isChecked && Number.parseInt(element.getAttribute("value"), 10);
            } 
            
            element.addEventListener("input", this.notify.bind(this));
        }

        this.elements = elements;
        this.texts = new Map();
        this.setCallback = setCallback;
    }

    addText(name, text) {
        const texts = this.texts;
        const hasText = this.texts.has(name);

        if (hasText) throw new Error(`Input: ${name} text already defined`);

        texts.set(name, text);
    }

    removeText(name) {
        const texts = this.texts; 
        const hasText = this.texts.has(name);

        if (!hasText) throw new Error(`Input: ${name} text doesn't exist`);

        texts.delete(name);
    }

    notify(event) {
        const setCallback = this.setCallback;
        const value = event?.target?.value;
        const texts = this.texts;
        let number = 0;

        if (value === "") {
            this.value = undefined;
            return;
        }

        number = Number.parseInt(value, 10);

        this.value = number;

        for (let text of texts.values()) {
            if (text.update) {
                text.update(this.value);
            }
        }

        setCallback && setCallback(this);
    }

    getValue() {
        return this.value;
    }

    setValue(newValue) {
        const elements = [...this.elements];

        elements.map(element => element.setAttribute("checked", false));

        const findedElement = elements.find(element => element.getAttribute("id") === newValue);
        
        findedElement.checked = true; 
        
        this.value = findedElement.value;
    }
}

class Text {
    constructor(element, updateCallback) {
        if (!element) throw new Error("Text: Element provided doesn't exist");

        this.element = element;
        this.inputs = new Map();
        this.updateCallback = updateCallback;
    }

    addInput(name, input) {
        const inputs = this.inputs;
        const hasInput = this.inputs.has(name);

        if (hasInput) throw new Error(`Text: ${name} input already defined`);

        inputs.set(name, input);
    }

    removeInput(name) {
        const inputs = this.inputs; 
        const hasInput = this.inputs.has(name);

        if (!hasInput) throw new Error(`Input: ${name} input doesn't exist`);

        inputs.delete(name);
    }

    update(newValue) {
        const updateCallback = this.updateCallback;
        const element = this.element;
        let value = undefined;

        if (updateCallback) {
            value = this.updateCallback(newValue, this);
        } else {
            value = newValue;
        }

        element.textContent = value?.toLocaleString();
    }
}

class Button {
    constructor(element, clickCallback=undefined) {
        const elementExist = element !== false;

        const isButton = element?.tagName?.toLowerCase() === "button";

        if (!elementExist) throw new Error("Input: null button provided");
        if (!isButton) throw new Error("Input: no button element provided");

        this.element = element; 
        this.clickCallback = clickCallback;

        element.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick(event) {
        const clickCallback = this.clickCallback;

        if (clickCallback) {
            clickCallback(this, event);
        }
    }
}

const billInput = new NumberInput(document.querySelector(".js--billInput"));
const peopleInput = new NumberInput(document.querySelector(".js--peopleInput"));
const tipInput = new NumberInput(document.querySelector(".js--tipInput"));
const radioGroupTipInput = new RadioGroupNumber(document.querySelectorAll(".js--radioInput"), (context) => {
    tipInput.setValue(0);
});

const tipAmountText = new Text(document.querySelector(".js--tip"), (newValue, context) => {
    const billValue = context.inputs.get("bill").value || 0;
    const numberOfPeople = context.inputs.get("people").value || 0;
    const customTipValue = context.inputs.get("customTip").value || 0;
    const radioTipValue = context.inputs.get("radioTip").value || 0;

    if (numberOfPeople <= 0) return Number.parseInt(context.element.textContent, 10);

    const tipPercentage = !customTipValue ? radioTipValue : customTipValue;
    const tipAmount = billValue * tipPercentage / 100;
    const tipAmountPerPerson = tipAmount / numberOfPeople; 
    
    return tipAmountPerPerson;
});

const totalText = new Text(document.querySelector(".js--total"), (newValue, context) => {
    const billValue = context.inputs.get("bill").value || 0;
    const numberOfPeople = context.inputs.get("people").value || 0;
    const customTipValue = context.inputs.get("customTip").value || 0;
    const radioTipValue = context.inputs.get("radioTip").value || 0;

    if (numberOfPeople <= 0) return Number.parseInt(context.element.textContent, 10);

    const tipPercentage = !customTipValue ? radioTipValue : customTipValue;
    const total = billValue * (1 + tipPercentage / 100);
    const totalPerPerson = total / numberOfPeople; 
    
    return totalPerPerson;
});

billInput.addText("tipAmount", tipAmountText);
peopleInput.addText("tipAmount", tipAmountText);
radioGroupTipInput.addText("tipAmount", tipAmountText);
tipInput.addText("tipAmount", tipAmountText);

billInput.addText("total", totalText);
peopleInput.addText("total", totalText);
radioGroupTipInput.addText("total", totalText);
tipInput.addText("total", totalText);

tipAmountText.addInput("bill", billInput);
tipAmountText.addInput("radioTip", radioGroupTipInput);
tipAmountText.addInput("people", peopleInput);
tipAmountText.addInput("customTip", tipInput);

totalText.addInput("bill", billInput);
totalText.addInput("radioTip", radioGroupTipInput);
totalText.addInput("people", peopleInput);
totalText.addInput("customTip", tipInput);

const resetButton = new Button(document.querySelector(".js--reset"), (context, event) => {
    event.preventDefault();

    billInput.setValue(0);
    peopleInput.setValue(1);
    tipInput.setValue(1);
    radioGroupTipInput.setValue("5%");
})





