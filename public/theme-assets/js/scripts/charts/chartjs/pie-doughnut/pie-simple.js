/*=========================================================================================
    File Name: pie.js
    Description: Chartjs pie chart
    ----------------------------------------------------------------------------------------
    Item Name: Chameleon Admin - Modern Bootstrap 4 WebApp & Dashboard HTML Template + UI Kit
    Version: 1.0
    Author: ThemeSelection
    Author URL: https://themeselection.com/
==========================================================================================*/

// Pie chart
// ------------------------------
$(window).on("load",async function(){

    //Get the context of the Chart canvas element we want to select
    var ctx = $("#simple3-pie-chart");

    
    async function fetchData() {
        const response = await fetch('/stats/data');
        const data = await response.json();
        return data;
    }

    const dataFromDB = await fetchData();
            console.log(dataFromDB)
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const colors = ['#666EE8', '#28D094', '#FF4961','#1E9FF2', '#FF9149','#FF9800', '#4CAF50']

    // Chart Options
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        responsiveAnimationDuration:500,
    };

    // Chart Data
    var chartData = {
        labels: labels,
        datasets: [
            {label: "Daily Data",
                data: dataFromDB.chatsPerDay,backgroundColor:colors}
        ],
        
    };

    

    var config = {
        type: 'pie',

        // Chart Options
        options : chartOptions,

        data : chartData
    };

    // Create the chart
    var pieSimpleChart = new Chart(ctx, config);
});
$(window).on("load",async function(){

    //Get the context of the Chart canvas element we want to select
    var ctx = $("#simple2-pie-chart");

    
    async function fetchData() {
        const response = await fetch('/stats/data');
        const data = await response.json();
        return data;
    }

    const dataFromDB = await fetchData();
            console.log(dataFromDB)
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const colors = ['#666EE8', '#28D094', '#FF4961','#1E9FF2', '#FF9149','#FF9800', '#4CAF50']

    // Chart Options
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        responsiveAnimationDuration:500,
    };

    // Chart Data
    var chartData = {
        labels: labels,
        datasets: [
            {label: "Daily Data",
                data: dataFromDB.postsPerDay,backgroundColor:colors}
        ],
        
    };

    

    var config = {
        type: 'pie',

        // Chart Options
        options : chartOptions,

        data : chartData
    };

    // Create the chart
    var pieSimpleChart = new Chart(ctx, config);
});
$(window).on("load",async function(){

    //Get the context of the Chart canvas element we want to select
    var ctx = $("#simple-pie-chart");

    
    async function fetchData() {
        const response = await fetch('/stats/data');
        const data = await response.json();
        return data;
    }

    const dataFromDB = await fetchData();
            console.log(dataFromDB)
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const colors = ['#666EE8', '#28D094', '#FF4961','#1E9FF2', '#FF9149','#FF9800', '#4CAF50']

    // Chart Options
    var chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        responsiveAnimationDuration:500,
    };

    // Chart Data
    var chartData = {
        labels: labels,
        datasets: [
            {label: "Daily Data",
                data: dataFromDB.accountsPerDay,backgroundColor:colors}
        ],
        
    };

    

    var config = {
        type: 'pie',

        // Chart Options
        options : chartOptions,

        data : chartData
    };

    // Create the chart
    var pieSimpleChart = new Chart(ctx, config);
});



