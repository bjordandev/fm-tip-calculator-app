class Input {
    constructor(element) {
        const elementExist = element !== false;
        const isInput = element?.tagName?.toLowerCase() === "input";

        if (!elementExist) throw new Error("Input: null input provided");
        if (!isInput) throw new Error("Input: no input element provided");

        this.element = element; 
        this.texts = new Map();
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

    update() {
        console.log("To implement");        
    }
}





