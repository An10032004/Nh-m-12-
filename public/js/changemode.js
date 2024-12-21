document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const currentMode = localStorage.getItem("mode") || "light-mode"; // Mặc định là light-mode

    // Áp dụng chế độ theme hiện tại cho body
    body.classList.add(currentMode);

    // Gán sự kiện cho nút Change Mode
    const changeModeButton = document.getElementById("change-mode");
    changeModeButton.addEventListener("click", () => {
        // Toggle giữa light-mode và dark-mode
        const newMode = body.classList.contains("light-mode") ? "dark-mode" : "light-mode";

        // Áp dụng chế độ mới cho body
        body.classList.remove("light-mode", "dark-mode");
        body.classList.add(newMode);

        // Lưu chế độ mới vào localStorage
        localStorage.setItem("mode", newMode);
    });
});
