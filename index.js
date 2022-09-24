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
}

class NumberInput extends Input {
    constructor(element) {
       super(element);

       if (element.getAttribute("inputmode") === "numeric") {
            this.type = "numeric";
       } else if (element.getAttribute("inputmode") === "decimal") {
            this.type = "decimal";
       } else {
            throw new Error("NumberInput: Invalid type");
       }

       this.value = 0;
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
}

class RadioGroupNumber {
    constructor(elements) {
        if (!elements) throw new Error("RadioGroupNumber: No elements provided");

        for (let element of elements) {
            const isInput = element.tagName.toLowerCase() === "input";
            const isRadio = element.getAttribute("type") === "radio";

            if (!isInput) throw new Error("RadioGroupNumber: Element provided isn't input");
            if (!isRadio) throw new Error("RadioGroupNumber: Input provided isn't radio");

            element.addEventListener("input", this.notify.bind(this));
        }

        this.elements = elements;
        this.texts = new Map();
        this.value = 0;
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

const billInput = new NumberInput(document.querySelector(".js--billInput"));
const peopleInput = new NumberInput(document.querySelector(".js--peopleInput"));
const tipInput = new NumberInput(document.querySelector(".js--tipInput"));
const radioGroupTipInput = new RadioGroupNumber(document.querySelectorAll(".js--radioInput"));

const tipAmountText = new Text(document.querySelector(".js--tip"), (newValue, context) => {
    const billValue = context.inputs.get("bill").value || 0;
    const numberOfPeople = context.inputs.get("people").value || 0;
    const customTipValue = context.inputs.get("customTip").value || 0;
    const radioTipValue = context.inputs.get("radioTip").value || 0;

    if (numberOfPeople <= 0) return Number.parseInt(context.element.textContent, 10);

    const tipPercentage = !customTipValue ? radioTipValue : customTipValue;
    const percentageOfBill = billValue * tipPercentage / 100;
    const percentageOfBillPerPeople = percentageOfBill / numberOfPeople; 
    
    return percentageOfBillPerPeople;
});

const totalText = new Text(document.querySelector(".js--total"), (newValue, context) => {
    const billValue = context.inputs.get("bill").value || 0;
    const numberOfPeople = context.inputs.get("people").value || 0;
    const customTipValue = context.inputs.get("customTip").value || 0;
    const radioTipValue = context.inputs.get("radioTip").value || 0;

    if (numberOfPeople <= 0) return Number.parseInt(context.element.textContent, 10);

    const tipPercentage = !customTipValue ? radioTipValue : customTipValue;
    const billWithPercentage = billValue * (1 + tipPercentage / 100);
    const percentageOfBillWithPercentage = billWithPercentage / numberOfPeople; 
    
    return percentageOfBillWithPercentage;
});

billInput.addText("tipAmount", tipAmountText);
peopleInput.addText("tipAmount", tipAmountText);
radioGroupTipInput.addText("tipAmount", tipAmountText);
tipInput.addText("tipAmount", tipAmountText);

billInput.addText("total", totalText);
peopleInput.addText("total", totalText);
radioGroupTipInput.addText("total", totalText);
tipInput.addText("total", tipAmountText);

tipAmountText.addInput("bill", billInput);
tipAmountText.addInput("radioTip", radioGroupTipInput);
tipAmountText.addInput("people", peopleInput);
tipAmountText.addInput("customTip", tipInput);

totalText.addInput("bill", billInput);
totalText.addInput("radioTip", radioGroupTipInput);
totalText.addInput("people", peopleInput);
totalText.addInput("customTip", tipInput);





