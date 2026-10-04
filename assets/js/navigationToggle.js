document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    // Toggle menu visibility on hamburger click
    toggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // Close menu when a nav link is clicked (on mobile)
    const links = navLinks.querySelectorAll("a.nav-button");

    links.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove("active");
            }
        });
    });
});