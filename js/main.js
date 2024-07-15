let rowtapole = document.querySelector('.roww');
let currentSort = { column: 'name', order: 'desc' };
let showdata; 
let names = customerData.map(customer => customer.name);
let amounts = customerData.map(customer => customer.totalAmount);

let ctx = document.getElementById('myChart').getContext('2d');

async function getdata() {
    try {
        let response = await fetch('../data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        showdata = await response.json();
        displayData(showdata);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

getdata();

function displayData(data) {
    let box = '';
    data.customers.forEach(customer => {
        box += `
        <tr>
            <td>${customer.name}</td>
            <td>${getTotalAmount(data.transactions, customer.id)}</td>
        </tr>
        `;
    });
    rowtapole.innerHTML = box;
}

function getTotalAmount(transactions, customerId) {
    let totalAmount = 0;
    transactions.forEach(transaction => {
        if (transaction.customer_id === customerId) {
            totalAmount += transaction.amount;
        }
    });
    return totalAmount;
}

$(document).ready(function() {
    $('#sort-name-btn').on('click', function() {
        console.log('hi');
        sortTable('name');
    });

    $('#sort-amount-btn').on('click', function() {
        sortTable('amount');
    });
});

function sortTable(column) {
    let order = currentSort.column === column && currentSort.order === 'desc' ? 'asc' : 'desc';
    currentSort = { column, order };

    let rows = Array.from(rowtapole.getElementsByTagName('tr'));

    let dataRows = rows.slice(0);

    dataRows.sort((rowA, rowB) => {
        let cellA = rowA.getElementsByTagName('td')[column === 'name' ? 0 : 1].innerText.trim();
        let cellB = rowB.getElementsByTagName('td')[column === 'name' ? 0 : 1].innerText.trim();

        if (column === 'amount') {
            cellA = parseFloat(cellA.replace(/[^0-9.-]+/g, ""));
            cellB = parseFloat(cellB.replace(/[^0-9.-]+/g, ""));
        }

        if (order === 'asc') {
            if (column === 'name') {
                return cellA.localeCompare(cellB);
            } else {
                return cellA - cellB;
            }
        } else {
            if (column === 'name') {
                return cellB.localeCompare(cellA);
            } else {
                return cellB - cellA;
            }
        }
    });

    while (rowtapole.firstChild) {
        rowtapole.removeChild(rowtapole.firstChild);
    }
    rowtapole.appendChild(rows[0]);
    dataRows.forEach(row => {
        rowtapole.appendChild(row);
    });
}


let myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: names,
        datasets: [{
            label: 'Total Amount',
            data: amounts,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, 
        scales: {
            x: {
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Customers'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Amount'
                },
                ticks: {
                    callback: function(value) {
                        return '$' + value.toFixed(2);
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

$('#Graph-amount-btn').on('click', function() {
    let customerData = [];
    showdata.customers.forEach(customer => {
        let totalAmount = getTotalAmount(showdata.transactions, customer.id);
        customerData.push({
            name: customer.name,
            totalAmount: totalAmount
        });
    });

    let names = customerData.map(customer => customer.name);
    let amounts = customerData.map(customer => customer.totalAmount);
    myChart.data.labels = names;
    myChart.data.datasets[0].data = amounts;
    myChart.update();

    $('.Graph').show();
});
