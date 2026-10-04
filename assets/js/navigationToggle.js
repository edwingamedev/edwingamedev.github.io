document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    if (!toggle || !navLinks) {
        return;
    }

    toggle.addEventListener("click", () => {
        const isActive = navLinks.classList.toggle("active");

        toggle.setAttribute(
            "aria-expanded",
            isActive ? "true" : "false"
        );
    });

    const links = navLinks.querySelectorAll("a.nav-button");

    links.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove("active");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    });
});