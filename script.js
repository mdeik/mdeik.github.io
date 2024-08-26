// Used to create page-like scolling on About Me
document.addEventListener('wheel', (event) => {
    event.preventDefault();

    const delta = Math.sign(event.deltaY);
    const sections = document.querySelectorAll('.section');
    const currentSection = document.querySelector('.current');

    let nextSection;

    if (delta > 0) { // Scrolling down
        nextSection = currentSection.nextElementSibling;
    } else { // Scrolling up
        nextSection = currentSection.previousElementSibling;
    }

    // If there's no adjacent sections, stop
    if (!nextSection || !nextSection.classList.contains('section')) {
        return;
    }

    // Remove 'previous', 'current', and 'next' classes from all sections
    sections.forEach(section => {
        section.classList.remove('previous', 'current', 'next');
    });

    // Assign 'current' class to the next section
    nextSection.classList.add('current');

    // Assign 'previous' class to the previous section, if it exists
    if (nextSection.previousElementSibling && nextSection.previousElementSibling.classList.contains('section')) {
        nextSection.previousElementSibling.classList.add('previous');
    }

    // Assign 'next' class to the next section's sibling, if it exists
    if (nextSection.nextElementSibling && nextSection.nextElementSibling.classList.contains('section')) {
        nextSection.nextElementSibling.classList.add('next');
    }

    // Update the active page button
    updateActiveButton(nextSection.id);
});


function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    tablinks = document.getElementsByClassName("tablinks");

    for (i = 0; i < tablinks.length; i++) {
        tabcontent[i].style.display = "none";   // Used to hide content from other tabs
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block"; // Used to unhide content from current tab
    evt.currentTarget.className += " active";

    // Changes overflow styling based on the active tab
    // Needed for page-like effect under About Me
    if (tabName === 'about-me') {
        document.documentElement.style.overflow = 'hidden';
    } else {
        document.documentElement.style.overflow = 'auto';
    }
}

// Used for selecting the section with the page buttons
function openPage(evt, sectionId) {
    const sections = document.querySelectorAll('.section');
    const targetSection = document.getElementById(sectionId);

    // resets current positioning of sections
    sections.forEach(section => {
        section.classList.remove('current', 'previous', 'next');
    });

    // sets selected section as current
    targetSection.classList.add('current');

    // if it exists, sets section behind current selected section as previous
    if (targetSection.previousElementSibling && targetSection.previousElementSibling.classList.contains('section')) {
        targetSection.previousElementSibling.classList.add('previous');
    }
    // if it exists, sets section after current selected section as next
    if (targetSection.nextElementSibling && targetSection.nextElementSibling.classList.contains('section')) {
        targetSection.nextElementSibling.classList.add('next');
    }

    // Update the active page button
    updateActiveButton(sectionId);
}

// Sets selected page button as active
function updateActiveButton(activeSectionId) {
    const buttons = document.querySelectorAll('.button-section');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    document.querySelector(`input[onclick*="${activeSectionId}"]`).classList.add('active');
}

// Handles filter buttons
function toggleFilter(button) {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    if (button.value === 'All') {
        // If "All" is clicked, deactivate all other buttons and itself
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    } else {
        // If any other button is clicked, deactivate "All" and toggle the clicked button
        document.querySelector('input[value="All"]').classList.remove('active');
        button.classList.toggle('active');
    }
    filterProjects();
}

// Filters out projects by class
function filterProjects() {
    const activeFilters = Array.from(document.querySelectorAll('.filter-button.active')).map(btn => btn.value.toLowerCase());
    const projects = document.querySelectorAll('.project');
    
    // If "All" is active or no specific filter is active, show all projects
    if (activeFilters.includes('all') || activeFilters.length === 0) {
        projects.forEach(project => project.style.display = 'block');
    } else {
        projects.forEach(project => {
            const projectClasses = Array.from(project.classList);
            const show = activeFilters.some(filter => projectClasses.includes(filter));
            project.style.display = show ? 'block' : 'none';
        });
    }
}
