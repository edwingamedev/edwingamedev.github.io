$(document).ready(() => {
    render_projects('featured');
})


let render_projects = (slug) => {
    let projects_area = $('.projects-wrapper');

    $('.white-button').removeClass('white-button-hover');
    $(`#${slug}`).addClass('white-button-hover');

    let projects_obj = [
        {
            image: '/assets/images/self.jpg',
            link: 'https://gamejolt.com/games/ChromaticGorilkaTypo/335315',
            title: 'Chromatic Gorilka Typo',
            demo: 'https://gamejolt.com/games/ChromaticGorilkaTypo/335315',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "Chromatic Gorilka Typo is a tower defense typing game where chromatic gorilkas, annoyed by your blue-switches mechanical keyboard sound, attack your house to unplug your USB cable. You must type HARDER and LOUDER to defend your home. But this will probably tease them even more.",
            categories: ['featured', 'games', 'art']
        },
        {
            image: '/assets/images/projects/not_today_satan.png',
            link: 'https://gamejolt.com/games/not-today-satan/383033',
            title: 'Not Today Satan',
            demo: 'https://gamejolt.com/games/not-today-satan/383033',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['featured', 'games', 'art']
        },
        {
            image: '/assets/images/projects/10_seconds_dungeon.png',
            link: 'https://gamejolt.com/games/10-seconds-dungeon/282443',
            title: '10 Seconds Dungeon',
            demo: 'https://gamejolt.com/games/10-seconds-dungeon/282443',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['featured', 'games', 'art']
        }
    ]

    let projects = [];
    if (slug == 'all') {
        projects = projects_obj.map(project_mapper);
    }
    else {
        projects = projects_obj.filter(project => project.categories.includes(slug)).map(project_mapper);
    }
    projects_area.hide().html(projects).fadeIn();
}

let project_mapper = project => {
    let image = project.image ? project.image : '';
    let demo = project.demo ? `<a href="${project.demo}">Check it now!</a>` : '';
    let technologies = project.technologies.map(tech => `<span class="project-technology paragraph-text-normal">${tech}</span>`).join('');

    // Fetching the external HTML content
    fetch('/pages/card.html')

        .then(response => response.text())
        .then(html => {
            // Replace placeholders with actual content
            let cardHtml = html
                .replace('{{image}}', image)
                .replace('{{link}}', project.link)
                .replace('{{link}}', project.link)
                .replace('{{title}}', project.title)
                .replace('{{description}}', project.description)
                .replace('{{demo}}', demo)
                .replace('{{technologies}}', technologies);

            // Injecting the card HTML into the document
            $('.projects-wrapper').append(cardHtml);
        });
}

let selected = (slug) => {
    render_projects(slug);
}