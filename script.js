// Load products dynamically from JSON
fetch('products.json')
    .then(response => response.json())
    .then(products => {
        const productGrid = document.getElementById('productGrid');
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.setAttribute('data-brand', product.brand);
            productElement.setAttribute('data-price', product.price);
            productElement.setAttribute('data-depth', product.depth);
            productElement.setAttribute('data-type', product.type);

            // Add product carousel, storing images as a data attribute
            productElement.innerHTML = `
                <div class="carousel" data-images='${JSON.stringify(product.images)}'>
                    <img src="${product.images[0]}" class="carousel-main-image" alt="${product.productName}">
                </div>
                <h3>${product.productName}</h3>
                <p><strong>Model:</strong> ${product.model}</p>
                <p><strong>Color:</strong> ${product.color}</p>
                <p><strong>Cubic Feet:</strong> ${product.cuFt} cu ft</p>
                <p><strong>Dimensions:</strong> ${product.dimensions.height}H x ${product.dimensions.width}W x ${product.dimensions.depth}D inches</p>
                <p><strong>Ice Maker:</strong> ${product.iceMaker ? 'Yes' : 'No'}</p>
                <p class="price">$${product.price}</p>

                <!-- Lightbox for full screen images -->
                <div class="lightbox">
                    <div class="lightbox-content">
                        <img src="${product.images[0]}" class="lightbox-main-image" alt="${product.productName}">
                        <div class="lightbox-controls">
                            <button class="lightbox-prev">&lt;</button>
                            <button class="lightbox-next">&gt;</button>
                            <button class="close-btn">&times;</button>
                        </div>
                    </div>
                </div>
            `;

            productGrid.appendChild(productElement);
        });

        // Initialize carousels and lightbox
        initializeCarousels();
        initializeLightbox();
        filterProducts();
    });

// Carousel initialization with button-only navigation (no keyboard controls)
function initializeCarousels() {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach((carousel, carouselIndex) => {
        const productImages = JSON.parse(carousel.getAttribute('data-images'));  // Get the images for the product
        let currentIndex = 0;

        const carouselImage = carousel.querySelector('.carousel-main-image');

        // Function to update the carousel image
        const updateImage = () => {
            carouselImage.src = productImages[currentIndex];
        };
    });
}

// Lightbox (Zoom) initialization triggered by clicking on the image
function initializeLightbox() {
    const productImages = document.querySelectorAll('.carousel-main-image');
    const lightboxes = document.querySelectorAll('.lightbox');

    productImages.forEach((image, index) => {
        const lightbox = lightboxes[index];
        const productImages = JSON.parse(document.querySelectorAll('.carousel')[index].getAttribute('data-images')); // Get the images
        let currentIndex = 0;

        const lightboxImage = lightbox.querySelector('.lightbox-main-image');
        const lightboxContent = lightbox.querySelector('.lightbox-content');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('lightbox-dots');
        lightbox.appendChild(dotsContainer);

        // Create dot elements for each image
        const dots = productImages.map((_, imgIndex) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (imgIndex === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
            return dot;
        });

        const updateDots = () => {
            dots.forEach((dot, dotIndex) => {
                if (dotIndex === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };

        const updateLightboxImage = () => {
            lightboxImage.src = productImages[currentIndex];
            updateDots(); // Update dots when the image changes
        };

        // Open lightbox when the image is clicked
        image.addEventListener('click', () => {
            lightbox.style.display = 'flex';

            // Add event listener for Escape key and keyboard navigation
            const handleKeydown = (event) => {
                if (event.key === 'Escape') {
                    lightbox.style.display = 'none';
                    document.removeEventListener('keydown', handleKeydown); // Remove listener after closing
                } else if (event.key === 'ArrowLeft') {
                    currentIndex = (currentIndex === 0) ? productImages.length - 1 : currentIndex - 1;
                    updateLightboxImage();
                } else if (event.key === 'ArrowRight') {
                    currentIndex = (currentIndex === productImages.length - 1) ? 0 : currentIndex + 1;
                    updateLightboxImage();
                }
            };
            document.addEventListener('keydown', handleKeydown);

            // Prevent clicks on lightbox-content from closing the lightbox
            lightboxContent.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop the click event from bubbling up to the background
            });

            // Add click-to-close behavior for clicking outside the image
            lightbox.addEventListener('click', (e) => {
                console.log('Clicked on background!'); // Log the click event
                if (e.target === lightbox) {
                    lightbox.style.display = 'none';
                    document.removeEventListener('keydown', handleKeydown);
                }
            });
        });

        // Add event listeners to lightbox prev/next buttons
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === 0) ? productImages.length - 1 : currentIndex - 1;
            updateLightboxImage();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex === productImages.length - 1) ? 0 : currentIndex + 1;
            updateLightboxImage();
        });
    });
}

// Filtering Logic
document.querySelectorAll('.filter-sidebar input').forEach(input => {
    input.addEventListener('change', filterProducts);
});

function filterProducts() {
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(el => el.value);
    const selectedPrice = document.querySelector('input[name="price"]:checked') ? document.querySelector('input[name="price"]:checked').value : null;
    const selectedDepth = document.querySelector('input[name="depth"]:checked') ? document.querySelector('input[name="depth"]:checked').value : null;
    const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(el => el.value);

    document.querySelectorAll('.product').forEach(product => {
        const productBrand = product.getAttribute('data-brand');
        const productPrice = parseInt(product.getAttribute('data-price'));
        const productDepth = product.getAttribute('data-depth');
        const productType = product.getAttribute('data-type');

        // Check if the product matches the selected filters
        const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);
        const matchPrice = !selectedPrice || inPriceRange(productPrice, selectedPrice);
        const matchDepth = !selectedDepth || selectedDepth === productDepth;
        const matchType = selectedTypes.length === 0 || selectedTypes.includes(productType);

        if (matchBrand && matchPrice && matchDepth && matchType) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function inPriceRange(price, selectedRange) {
    const [min, max] = selectedRange.split('-').map(Number);
    return price >= min && price <= max;
}
