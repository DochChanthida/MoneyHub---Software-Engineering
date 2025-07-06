const exchangeTable = document.querySelector("#exchange-rates");
const currencyList = ["USD", "KHR", "AUD", "CNY", "EUR", "GBP", "JPY", "KRW", "SGD", "THB", "VND"];

// Fetch Exchange Rates from Backend
function fetchExchangeRates() {
    fetch('http://127.0.0.1:3000/api/rates') // Call the backend endpoint
    .then(response => response.json())
.then(data => {
    console.log('Exchange Rates Data:', data);
    if (data.data) {
        exchangeTable.innerHTML = "";
        currencyList.forEach(currency => {
            if (data.data[currency]) {
                const row = `
                    <tr>
                        <td>${currency}</td>
                        <td>${(1 / data.data[currency].value).toFixed(4)}</td>
                        <td>${data.data[currency].value.toFixed(4)}</td>
                    </tr>
                `;
                exchangeTable.innerHTML += row;
            }
        });
    } else {
        console.error("Error: Data not found in the response.");
    }
})
.catch(error => console.error('Error fetching exchange rates:', error));
}

// Populate Currency Dropdowns
function populateCurrencyDropdowns() {
    const fromDropdown = document.getElementById('from-currency');
    const toDropdown = document.getElementById('to-currency');

    // Clear existing options
    fromDropdown.innerHTML = "";
    toDropdown.innerHTML = "";

    currencyList.forEach(currency => {
        const option1 = document.createElement("option");
        const option2 = document.createElement("option");

        option1.value = currency;
        option1.textContent = currency;

        option2.value = currency;
        option2.textContent = currency;

        fromDropdown.appendChild(option1);
        toDropdown.appendChild(option2);
    });
}

// Convert Currency using Backend
function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;

    console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);

    if (!amount || amount <= 0) {
        alert("Enter a valid amount.");
        return;
    }

    fetch('http://127.0.0.1:3000/api/rates') // Call the backend endpoint
        .then(response => response.json())
        .then(data => {
            console.log('Currency Conversion Data from Backend:', data);
            if (data.data && data.data[fromCurrency] && data.data[toCurrency]) {
                const rate = data.data[toCurrency].value / data.data[fromCurrency].value;
                const result = amount * rate;
                const roundedResult = Math.round(result);
                document.getElementById('conversion-result').innerText = `${amount} ${fromCurrency} = ${roundedResult} ${toCurrency}`;
            } else {
                console.error("Error: Missing conversion data.");
            }
        })
        .catch(error => console.error('Error converting currency using backend:', error));
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    fetchExchangeRates();
    populateCurrencyDropdowns();
});
