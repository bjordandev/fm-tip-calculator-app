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
            for (let text of texts) {
                if (text.update) {
                    text.update(this.value);
                }
            }
        }
    }
}

const billInput = new NumberInput(document.querySelector(".js--billInput"));
const peopleInput = new NumberInput(document.querySelector(".js--peopleInput"));
const tipInput = new NumberInput(document.querySelector(".js--tipInput"));




