$(window).on("load", async function() {

    var ctx = $("#line-chart");

    async function fetchData() {
        const response = await fetch('/stats/data');
        const data = await response.json();
        return data;
    }

    const dataFromDB = await fetchData();

    

    // Sử dụng labels là các ngày trong tuần
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Mảng các màu sắc cho mỗi dataset
    const colors = [
        "#9C27B0",  // Màu tím cho "Accounts per day"
        "#00A5A8",  // Màu xanh cho "Chats per day"
        "#FF7D4D",  // Màu cam cho "Posts per day"
        "#4CAF50",  // Màu xanh lá cho một dataset khác (nếu có thêm)
        "#FF9800"   // Màu cam sáng cho một dataset khác (nếu có thêm)
    ];

    // Chart Options
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: 'bottom',
        },
        hover: {
            mode: 'label'
        },
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    color: "#f3f3f3",
                    drawTicks: false,
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Day'
                }
            }],
            yAxes: [{
                display: true,
                gridLines: {
                    color: "#f3f3f3",
                    drawTicks: false,
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Value'
                },
                ticks: {
                    min: 0,   // Đặt giá trị tối thiểu cho trục Y
                    max: 20,  // Đặt giá trị tối đa cho trục Y
                    stepSize: 1 // Đặt độ chia nhỏ trục Y (1 đơn vị)
                }
            }]
        },
        title: {
            display: true,
            text: 'Whole Progress'
        }
    };

    // Tạo dữ liệu cho các datasets
    var chartData = {
        labels: labels, // Các ngày trong tuần
        datasets: []
    };

    // Duyệt qua các key trong dataFromDB và tạo dataset cho mỗi key
    let colorIndex = 0; // Biến để theo dõi màu sắc đã dùng
    for (let key in dataFromDB) {
        chartData.datasets.push({
            label: key, // Sử dụng key làm label cho dataset
            data: dataFromDB[key], // Dữ liệu từ key đó
            fill: false,
            borderDash: [5, 5],
            borderColor: colors[colorIndex], // Sử dụng màu sắc từ mảng colors
            pointBorderColor: colors[colorIndex], // Màu của điểm
            pointBackgroundColor: "#FFF",
            pointBorderWidth: 2,
            pointHoverBorderWidth: 2,
            pointRadius: 4,
        });
        colorIndex++; // Tăng chỉ mục màu sắc
    }

    // Cấu hình cho chart
    var config = {
        type: 'line',
        options: chartOptions,
        data: chartData
    };

    // Tạo chart
    var lineChart = new Chart(ctx, config);
});
