$(document).ready(() => {
    render_projects('featured');
})


let render_projects = (slug) => {
    let projects_area = $('.projects-wrapper');

    $('.white-button').removeClass('white-button-hover');
    $(`#${slug}`).addClass('white-button-hover');

    let projects_obj = [
        {
            image: '/assets/images/projects/cgt.gif',
            link: 'https://gamejolt.com/games/ChromaticGorilkaTypo/335315',
            title: 'Chromatic Gorilka Typo',
            technologies: ['Unity', 'Pixel Art'],
            description: "Tower defense typing game where chromatic gorilkas, annoyed by your blue-switches mechanical keyboard sound, attack your house to unplug your USB cable. You must type HARDER and LOUDER to defend your home. But this will probably tease them even more.",
            categories: ['featured', 'games', 'Jam']
        },
        {
            image: '/assets/images/projects/ddj.gif',
            link: 'https://gamejolt.com/games/digdigjoy/705969',
            title: 'Dig Dig Joy',
            technologies: ['Unity', 'Pixel Art'],
            description: "Fast-paced game where you have to mine downwards to reach the bottom. Choose between several power ups when you level up, reach the bottom of the map faster to score higher.",
            categories: ['featured', 'games', 'game jam']
        },
        {
            image: '/assets/images/projects/nts.gif',
            link: 'https://gamejolt.com/games/not-today-satan/383033',
            title: 'Not Today Satan',
            technologies: ['Unity', 'Pixel Art'],
            description: "Platformer where you have to reach the end of the map, you can hunt people casting fireballs, that cost your life, to recover it you should eat your victims.",
            categories: ['games', 'game jam']
        },
        {
            image: '/assets/images/projects/tsd.gif',
            link: 'https://gamejolt.com/games/10-seconds-dungeon/282443',
            title: '10 Seconds Dungeon',
            technologies: ['Unity', 'Pixel Art'],
            description: "You are a cat in a dungeon where you should survive the waves, new enemies come every 10 seconds, find bullets and power ups to live longer.",
            categories: ['games', 'game jam']
        },
        {
            image: '/assets/images/projects/dt.gif',
            link: 'https://gamejolt.com/games/day-3/361194',
            title: 'Day 3',
            technologies: ['Unity', 'Pixel Art'],
            description: "- Day 1 Plant seeds and collect water in the river to water your plants.<br>- Day 2 meet the Dog Dealer at the gate and trade the leaves you harvested for new seeds. Don't forget to keep watering your plants!<br>- Day 3 hide yourself from the Crop Pooper inside your house and hope your plants protect you from the invader!",
            categories: ['games', 'game jam']
        },
        {
            image: '/assets/images/projects/flying_alone.png',
            link: 'https://www.youtube.com/watch?v=KMdc9wNq53U',
            title: 'Flying Alone',
            technologies: ['Unity'],
            description: "Flying endless runner where you should manage your fuel level and avoid hitting the ground or getting hit by the missiles. Go through the rings to recharge your fuel.",
            categories: ['featured', 'games']
        },
        {
            image: '/assets/images/projects/eoyl.gif',
            link: 'https://gamejolt.com/games/endofyourlife/314984',
            title: 'End of your Life',
            technologies: ['Unity', 'Pixel Art'],
            description: "- You are cursed to the death!</br>- Find another body to possess.</br>- There's no time to rest.</br>- Throw your sould really fast.</br>- To survive death!",
            categories: ['featured', 'games', 'game jam']
        },
        {
            image: '/assets/images/projects/spd.gif',
            link: 'https://gamejolt.com/games/space-power-defender/283201',
            title: 'Space Power Defender',
            technologies: ['Unity', 'Pixel Art'],
            description: "Space shooter where you should use your spaceship to defend your power orbs from enemy waves. Each orb is responsible for one power (speed, shield, side bullets, regeneration) on your spaceship.",
            categories: ['featured', 'games', 'game jam']
        },
        {
            image: '/assets/images/projects/war_mech_defense.jpg',
            link: 'https://play.google.com/store/apps/details?id=br.com.ideas.farm.warmechdefense',
            title: 'War Mech Defense',
            technologies: ['Unity'],
            description: "Defense game in augmented reality where you have to survive the waves. Every target destroyed gives you experience, upon level up you can choose what to improve on your turret.",
            categories: ['games', 'AR']
        },
        {
            image: '/assets/images/projects/aes_city_builder.png',
            link: 'https://www.instagram.com/edwingamedev/reel/BSzQ0f6Db6V',
            title: 'AES City Builder',
            technologies: ['Unity'],
            description: "City builder where you have to ride a real bike to power up you city, with more energy you attract more citizens, making your city to grow bigger and unlocking new buildings. There are several achievements on the game. The login was done through face recognition.",
            categories: ['games']
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
    let technologies = project.technologies.map(tech => `<span class="card-technology paragraph-text-normal">${tech}</span>`).join('');

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
                .replace('{{technologies}}', technologies);

            // Injecting the card HTML into the document
            $('.projects-wrapper').append(cardHtml);
        });
}

let selected = (slug) => {
    render_projects(slug);
}