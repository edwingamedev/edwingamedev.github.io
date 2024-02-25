$(document).ready(() => {
    render_projects('featured');
})


let render_projects = (slug) => {
    let projects_area = $('.projects-wrapper');

    $('.white-button').removeClass('white-button-hover');
    $(`#${slug}`).addClass('white-button-hover');

    let projects_obj = [
        {
            image: '/assets/images/projects/cgt.png',
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
        },
        {
            image: '/assets/images/projects/day3.png',
            link: 'https://gamejolt.com/games/day-3/361194',
            title: 'Day 3',
            demo: 'https://gamejolt.com/games/day-3/361194',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['featured', 'games']
        },
        {
            image: '/assets/images/projects/flying_alone.png',
            link: 'https://www.youtube.com/watch?v=KMdc9wNq53U',
            title: 'Flying Alone',
            demo: 'https://www.youtube.com/watch?v=KMdc9wNq53U',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['featured', 'games', 'art']
        },
        {
            image: '/assets/images/projects/end_of_your_life.png',
            link: 'https://gamejolt.com/games/endofyourlife/314984',
            title: 'End of your Life',
            demo: 'https://gamejolt.com/games/endofyourlife/314984',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['featured', 'games', 'art']
        },
        {
            image: '/assets/images/projects/space_power_defender.png',
            link: 'https://gamejolt.com/games/space-power-defender/283201',
            title: 'Space Power Defender',
            demo: 'https://gamejolt.com/games/space-power-defender/283201',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['featured', 'games', 'art']
        },
        {
            image: '/assets/images/projects/war_mech_defense.jpg',
            link: 'https://play.google.com/store/apps/details?id=br.com.ideas.farm.warmechdefense',
            title: 'War Mech Defense',
            demo: 'https://play.google.com/store/apps/details?id=br.com.ideas.farm.warmechdefense',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['games', 'AR']
        },
        {
            image: '/assets/images/projects/dig_dig_joy.png',
            link: 'https://gamejolt.com/games/digdigjoy/705969',
            title: 'Dig Dig Joy',
            demo: 'https://gamejolt.com/games/digdigjoy/705969',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['featured', 'games', 'art']
        },
        {
            image: '/assets/images/projects/aes_city_builder.png',
            link: '',
            title: 'AES City Builder',
            demo: '',
            technologies: ['Unity', 'Pixel Art', 'C#'],
            description: "",
            categories: ['games',]
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