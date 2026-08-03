// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile nav toggle
const menuToggle = document.getElementById('menuToggle');
const navbarEl = document.getElementById('navbar');
const navLinksEls = document.querySelectorAll('#navbar a[href^="#"]');
if (menuToggle) {
    const setMenuToggleState = (isOpen) => {
        menuToggle.classList.toggle('is-open', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    };

    setMenuToggleState(false);

    menuToggle.addEventListener('click', () => {
        const isOpen = navbarEl.classList.toggle('mobile-open');
        setMenuToggleState(isOpen);
    });

    // Close menu when a link is tapped
    navLinksEls.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarEl.classList.contains('mobile-open')) {
                navbarEl.classList.remove('mobile-open');
                setMenuToggleState(false);
            }
        });
    });
}


// ---- Project modal logic ----
const projectData = {
    formaxr: {
        title: "FormaXR",
        video: "formaxr.mp4",
        poster: "forma-thumb.jpg",
        tags: ["Real Estate", "Apple Vision Pro", "Interactive Sales Tool"],
        text:
            "Immersive apartment and interior walkthroughs that let buyers step into unbuilt properties on Apple Vision Pro.",
        bullets: [
            "Lets sales teams present multiple layouts and finishes as if the space already exists.",
            "True-scale spatial viewing for design reviews, stakeholder walkthroughs and customer demos.",
            "Fast to update with new units, schemes and marketing narratives as projects evolve."
        ]
    },

    holopatient: {
        title: "HoloPatient",
        video: "holopatient.mp4",
        poster: "holopatient-thumb.jpg",
        tags: ["Healthcare", "HoloLens", "Medical Training"],
        text:
            "Life-sized virtual patients used by universities and hospitals worldwide for clinical training.",
        bullets: [
            "Developed with Pearson Education and GIGXR for Microsoft HoloLens mixed reality.",
            "Simulates realistic patient presentations in real teaching spaces, without physical manikins.",
            "Supports repeatable, scenario-based training with consistent visuals and interactions."
        ]
    },

    holohuman: {
        title: "HoloHuman",
        video: "holohuman.mp4",
        poster: "holohuman-thumb.jpg",
        tags: ["Education", "Anatomy", "3D Visualisation"],
        text:
            "Room-scale 3D anatomy that lets learners explore the human body as an interactive spatial model.",
        bullets: [
            "Created with Pearson Education and GIGXR as part of a mixed-reality medical education suite.",
            "Layered anatomical systems with the ability to isolate, hide and reveal structures in context.",
            "Optimised meshes and textures to balance fidelity with comfortable long-session performance."
        ]
    },

    airport: {
        title: "Airport XR (NDA)",
        video: "",
        poster: "airport-thumb.jpg",
        tags: ["Infrastructure", "Enterprise", "Vision Pro"],
        text:
            "A large-scale airport visualisation for a major European hub, used for planning and stakeholder engagement.",
        bullets: [
            "Built from a detailed Revit model, translated into a performant, navigable XR environment.",
            "Enables decision-makers to view terminal layouts, flows and interventions at true scale.",
            "Delivered under NDA with anonymised visuals and flexible deployment for internal teams."
        ]
    },

    yachtxr: {
        title: "YachtXR",
        video: "yachtxr.mp4",
        poster: "yachtxr-thumb.jpg",
        tags: ["Concept", "Real-time 3D", "Vision Pro"],
        text:
            "A cinematic XR concept for exploring a luxury yacht as a fully navigable, real-time environment.",
        bullets: [
            "High-end materials, lighting and water effects tuned for immersive viewing on Vision Pro.",
            "Blends product, interior and environment visualisation for a premium lifestyle experience.",
            "Demonstrates a pipeline suited to yacht design, hospitality and high-end marketing narratives."
        ]
    }
};


const modal = document.getElementById("projectModal");
const modalBackdrop = document.getElementById("projectModalBackdrop");
const modalClose = document.getElementById("projectModalClose");
const modalVideo = document.getElementById("projectModalVideo");
const modalTags = document.getElementById("projectModalTags");
const modalTitle = document.getElementById("projectModalTitle");
const modalText = document.getElementById("projectModalText");
const modalList = document.getElementById("projectModalList");

function openProjectModal(key) {
    const data = projectData[key];
    if (!data) return;

    const showPosterOnly = () => {
        modalVideo.pause();
        modalVideo.removeAttribute("src");
        modalVideo.load();
        modalVideo.poster = data.poster || "";
    };

    // Set poster first so it shows while video buffers, and fallback if the video is missing
    modalVideo.onerror = showPosterOnly;
    modalVideo.onstalled = showPosterOnly;
    modalVideo.poster = data.poster || "";

    if (data.video) {
        modalVideo.src = data.video;
        modalVideo.load();
        modalVideo.play().catch(() => {
            showPosterOnly();
        });
    } else {
        showPosterOnly();
    }

    modalTitle.textContent = data.title;
    modalText.textContent = data.text;

    modalTags.innerHTML = "";
    data.tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        modalTags.appendChild(span);
    });

    modalList.innerHTML = "";
    data.bullets.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        modalList.appendChild(li);
    });

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeProjectModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    modalVideo.pause();
    modalVideo.src = "";
    modalVideo.poster = "";
}

document.querySelectorAll(".project-trigger").forEach(card => {
    card.addEventListener("click", () => {
        const key = card.getAttribute("data-project");
        openProjectModal(key);
    });
});

modalBackdrop.addEventListener("click", closeProjectModal);
modalClose.addEventListener("click", closeProjectModal);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
        closeProjectModal();
    }
});
