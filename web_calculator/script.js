const state = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
    expression: '',
    justCalculated: false,
};

const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const operatorBtns = document.querySelectorAll('[data-action="operator"]');

function updateDisplay() {
    resultEl.textContent = state.displayValue;
    expressionEl.textContent = state.expression;

    // Shrink font for long numbers
    const len = state.displayValue.length;
    resultEl.classList.toggle('small', len > 9);
    resultEl.classList.toggle('error', state.displayValue === 'Error');
}

function inputDigit(digit) {
    if (state.waitingForSecondOperand) {
        state.displayValue = digit;
        state.waitingForSecondOperand = false;
    } else {
        if (state.displayValue === '0') {
            state.displayValue = digit;
        } else if (state.displayValue.replace('-', '').length < 12) {
            state.displayValue += digit;
        }
    }
    state.justCalculated = false;
}

function inputDecimal() {
    if (state.waitingForSecondOperand) {
        state.displayValue = '0.';
        state.waitingForSecondOperand = false;
        return;
    }
    if (!state.displayValue.includes('.')) {
        state.displayValue += '.';
    }
}

function handleOperator(nextOperator) {
    if (state.displayValue === 'Error') return;

    const inputValue = parseFloat(state.displayValue);
    const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

    if (state.operator && state.waitingForSecondOperand) {
        state.operator = nextOperator;
        state.expression = `${state.firstOperand} ${opSymbols[nextOperator]}`;
        highlightOperator(nextOperator);
        return;
    }

    if (state.firstOperand === null) {
        state.firstOperand = inputValue;
        state.expression = `${inputValue} ${opSymbols[nextOperator]}`;
    } else if (state.operator) {
        const result = calculate(state.firstOperand, inputValue, state.operator);
        if (!isFinite(result)) {
            state.displayValue = 'Error';
            resetState();
            updateDisplay();
            return;
        }
        const rounded = parseFloat(result.toFixed(10));
        state.displayValue = String(rounded);
        state.firstOperand = rounded;
        state.expression = `${rounded} ${opSymbols[nextOperator]}`;
    }

    state.waitingForSecondOperand = true;
    state.operator = nextOperator;
    state.justCalculated = false;
    highlightOperator(nextOperator);
    updateDisplay();
}

function calculate(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default:  return b;
    }
}

function handleEquals() {
    if (state.displayValue === 'Error') return;
    if (state.operator === null) return;

    const inputValue = parseFloat(state.displayValue);
    const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    const fullExpr = `${state.firstOperand} ${opSymbols[state.operator]} ${inputValue} =`;

    const result = calculate(state.firstOperand, inputValue, state.operator);

    if (!isFinite(result)) {
        state.expression = fullExpr;
        state.displayValue = 'Error';
        resetState();
        updateDisplay();
        return;
    }

    const rounded = parseFloat(result.toFixed(10));
    state.expression = fullExpr;
    state.displayValue = String(rounded);
    state.firstOperand = null;
    state.waitingForSecondOperand = false;
    state.operator = null;
    state.justCalculated = true;
    clearOperatorHighlight();
    updateDisplay();
}

function toggleSign() {
    if (state.displayValue === 'Error' || state.displayValue === '0') return;
    state.displayValue = state.displayValue.startsWith('-')
        ? state.displayValue.slice(1)
        : '-' + state.displayValue;
    updateDisplay();
}

function inputPercent() {
    if (state.displayValue === 'Error') return;
    const value = parseFloat(state.displayValue);
    state.displayValue = String(parseFloat((value / 100).toFixed(10)));
    updateDisplay();
}

function resetState() {
    state.firstOperand = null;
    state.waitingForSecondOperand = false;
    state.operator = null;
}

function clearAll() {
    state.displayValue = '0';
    state.expression = '';
    state.justCalculated = false;
    resetState();
    clearOperatorHighlight();
    updateDisplay();
}

function highlightOperator(op) {
    clearOperatorHighlight();
    operatorBtns.forEach(btn => {
        if (btn.dataset.value === op) btn.classList.add('active');
    });
}

function clearOperatorHighlight() {
    operatorBtns.forEach(btn => btn.classList.remove('active'));
}

// Button click handler
document.querySelector('.calculator-keys').addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const action = btn.dataset.action;
    const value = btn.dataset.value;

    switch (action) {
        case 'digit':
            if (state.justCalculated) {
                state.expression = '';
                state.justCalculated = false;
            }
            inputDigit(value);
            clearOperatorHighlight();
            updateDisplay();
            break;
        case 'decimal':
            if (state.justCalculated) {
                state.expression = '';
                state.justCalculated = false;
            }
            inputDecimal();
            clearOperatorHighlight();
            updateDisplay();
            break;
        case 'operator':
            handleOperator(value);
            break;
        case 'equals':
            handleEquals();
            break;
        case 'clear':
            clearAll();
            break;
        case 'sign':
            toggleSign();
            break;
        case 'percent':
            inputPercent();
            break;
    }
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') {
        if (state.justCalculated) { state.expression = ''; state.justCalculated = false; }
        inputDigit(e.key);
        clearOperatorHighlight();
        updateDisplay();
    } else if (e.key === '.') {
        if (state.justCalculated) { state.expression = ''; state.justCalculated = false; }
        inputDecimal();
        updateDisplay();
    } else if (['+', '-', '*', '/'].includes(e.key)) {
        handleOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        clearAll();
    } else if (e.key === 'Backspace') {
        if (state.displayValue.length > 1 && state.displayValue !== 'Error') {
            state.displayValue = state.displayValue.slice(0, -1) || '0';
        } else {
            state.displayValue = '0';
        }
        updateDisplay();
    }
});

updateDisplay();
