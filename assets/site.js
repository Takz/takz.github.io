// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const currentScroll = window.pageYOffset;
    navbar.classList.toggle('scrolled', currentScroll > 50);
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
// Scoped, and bails out on pages that have no modal markup, so the blocks
// below still run wherever the modal is absent.
(function () {
    const modal = document.getElementById("projectModal");
    if (!modal) return;

    const projectData = {
        formaxr: {
            title: "FormaXR",
            video: "/formaxr.mp4",
            poster: "/forma-thumb.jpg",
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
            video: "/holopatient.mp4",
            poster: "/holopatient-thumb.jpg",
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
            video: "/holohuman.mp4",
            poster: "/holohuman-thumb.jpg",
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
            title: "Airport XR",
            video: "",
            poster: "/media/airport-after-1600.jpg",
            tags: ["Infrastructure", "Enterprise", "Vision Pro"],
            text:
                "A terminal for a major European hub, built from the source BIM model and walkable at full scale on Apple Vision Pro.",
            bullets: [
                "37 million polygons reduced to 4 million - an 89% cut - with silhouettes preserved.",
                "220 x 50 x 14 metres of concourse, explored on foot rather than orbited on a screen.",
                "Delivered anonymised, for planning and stakeholder engagement."
            ]
        },

        yachtxr: {
            title: "YachtXR",
            video: "/yachtxr.mp4",
            poster: "/media/yachtxr-1200.jpg",
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


    const modalBackdrop = document.getElementById("projectModalBackdrop");
    const modalClose = document.getElementById("projectModalClose");
    const modalVideo = document.getElementById("projectModalVideo");
    const modalTags = document.getElementById("projectModalTags");
    const modalTitle = document.getElementById("projectModalTitle");
    const modalText = document.getElementById("projectModalText");
    const modalList = document.getElementById("projectModalList");
    // The card that opened the modal, so focus can go back to it on close.
    let lastTrigger = null;

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
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        if (modalClose) modalClose.focus();
    }

    function closeProjectModal() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        modalVideo.pause();
        modalVideo.src = "";
        modalVideo.poster = "";
        if (lastTrigger) {
            lastTrigger.focus();
            lastTrigger = null;
        }
    }

    // Cards are made focusable here rather than in markup, so every page that
    // uses .project-trigger gets keyboard access without repeating attributes.
    document.querySelectorAll(".project-trigger").forEach(card => {
        if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "0");
        if (!card.hasAttribute("role")) card.setAttribute("role", "button");

        const open = () => {
            lastTrigger = card;
            openProjectModal(card.getAttribute("data-project"));
        };

        card.addEventListener("click", open);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
            }
        });
    });

    modalBackdrop.addEventListener("click", closeProjectModal);
    modalClose.addEventListener("click", closeProjectModal);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("open")) {
            closeProjectModal();
        }
    });
})();


// ---- Pipeline stage highlight ----
// Lights each stage as it scrolls into view. Purely decorative: the stages are
// a plain <ol> and read fine with JS off or motion reduced.
(function () {
    const stages = document.querySelectorAll('.pipeline .stage');
    if (!stages.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        stages.forEach(s => s.classList.add('is-active'));
        return;
    }

    if (!('IntersectionObserver' in window)) {
        stages.forEach(s => s.classList.add('is-active'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
                io.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.35 });

    stages.forEach((s, i) => {
        s.style.transitionDelay = `${Math.min(i * 90, 360)}ms`;
        io.observe(s);
    });
})();


// ---- Hero video: keep it playing ----
// Mobile browsers (Firefox especially) pause backgrounded video and don't
// resume on return, leaving a frozen frame. Nudge it back whenever the page
// becomes visible again. play() can reject - that's fine, the poster shows.
(function () {
    const video = document.querySelector('.hero-video');
    if (!video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resume = () => {
        if (reduced.matches) return;
        if (document.visibilityState !== 'visible') return;
        if (!video.paused && !video.ended) return;
        const played = video.play();
        if (played && played.catch) played.catch(() => { });
    };

    const halt = () => {
        video.pause();
        video.removeAttribute('autoplay');
    };

    if (reduced.matches) halt();
    reduced.addEventListener('change', e => (e.matches ? halt() : resume()));

    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pageshow', resume);
    window.addEventListener('focus', resume);
})();


// ---- Before/after wipe ----
// The range input stays for keyboard and screen readers, but pointer input is
// handled on the container: a native range thumb is invisible here, and on
// mobile a drag only tracked if it happened to start on the thumb. Handling
// pointerdown/move ourselves makes press-and-drag work anywhere on the image.
// With JS off the CSS default leaves it at 50% - still a legible split view.
(function () {
    const box = document.getElementById('compare');
    const range = document.getElementById('compareRange');
    if (!box || !range) return;

    let touched = false;

    const apply = (v) => box.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => apply(range.value));
    range.addEventListener('keydown', () => { touched = true; });
    apply(range.value);

    const setFromX = (clientX) => {
        const r = box.getBoundingClientRect();
        const v = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
        range.value = v;
        apply(v);
    };

    // Firefox starts a native image drag on mousedown, which swallows the pointer
    // stream and leaves the handle stuck. -webkit-user-drag does nothing there, so
    // cancel the drag outright; the images also carry draggable="false".
    box.addEventListener('dragstart', (e) => e.preventDefault());

    let dragging = false;
    box.addEventListener('pointerdown', (e) => {
        touched = true;
        dragging = true;
        // Mouse only: stops Firefox's drag/selection default without touching
        // touch scrolling, which `touch-action: pan-y` already handles.
        if (e.pointerType === 'mouse') e.preventDefault();
        if (box.setPointerCapture) {
            try { box.setPointerCapture(e.pointerId); } catch (err) { /* detached pointer */ }
        }
        setFromX(e.clientX);
    });
    box.addEventListener('pointermove', (e) => { if (dragging) setFromX(e.clientX); });
    ['pointerup', 'pointercancel'].forEach(t =>
        box.addEventListener(t, () => { dragging = false; }));

    // One slow sweep on first view: opens near the source model, then wipes
    // left to reveal the delivered render. Cancelled the moment it's touched.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    let done = false;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || done) return;
            done = true;
            io.disconnect();
            if (touched) return;

            const from = 88, to = 34, ms = 1500, start = performance.now();
            const step = (now) => {
                if (touched) return;
                const t = Math.min((now - start) / ms, 1);
                // ease-in-out, so it settles rather than stopping dead
                const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const v = from + (to - from) * e;
                range.value = v;
                apply(v);
                if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }, { threshold: 0.45 });
    io.observe(box);
})();


// ---- State toggles ----
// Any .stateful block: stacked <img> layers cross-faded by sibling buttons.
// Class-based rather than id-based so a page can carry several without
// colliding. Each block also cycles on its own while in view, so the switch
// is discovered even by people who never touch it - and stops for good the
// first time they do.
document.querySelectorAll('.stateful').forEach((block, blockIndex) => {
    const images = block.querySelectorAll('.statepair img');
    const buttons = block.querySelectorAll('.state-btn');
    if (!images.length || !buttons.length) return;

    let index = 0;
    let touched = false;
    let timer = null;

    const select = (i) => {
        index = i;
        images.forEach((img, n) => img.classList.toggle('is-shown', n === i));
        buttons.forEach((b, n) => b.setAttribute('aria-pressed', String(n === i)));
    };

    const stopAuto = () => {
        if (timer) { clearInterval(timer); timer = null; }
    };

    buttons.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            touched = true;
            stopAuto();
            select(Number(btn.dataset.index ?? i));
        });
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    // Staggered so side-by-side blocks don't flip in unison.
    const period = 3800 + blockIndex * 700;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (touched) { io.disconnect(); return; }
            if (entry.isIntersecting && !timer) {
                timer = setInterval(() => select((index + 1) % images.length), period);
            } else if (!entry.isIntersecting) {
                stopAuto();
            }
        });
    }, { threshold: 0.4 });
    io.observe(block);
});
