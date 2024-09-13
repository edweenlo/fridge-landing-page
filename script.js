// Load products dynamically from JSON and generate filters
fetch('products.json')
    .then(response => response.json())
    .then(products => {
        generateFilters(products); // Create filters based on available product data
        displayProducts(products); // Display products in the grid
        initializeCarousels(); // Initialize carousel functionality
        initializeThumbnails(); // Initialize thumbnail functionality
        toggleFilterUI(); // Initialize the filter UI based on screen size
    });

// Placeholder for missing image files
const placeholderImage = 'https://via.placeholder.com/150';

// Function to handle screen size for filters (dropdowns for mobile, checkboxes for desktop)
function toggleFilterUI() {
    const isMobile = window.innerWidth <= 768;
    
    document.querySelectorAll('.mobile-dropdown').forEach(dropdown => {
        dropdown.style.display = isMobile ? 'block' : 'none';
    });
    
    document.querySelectorAll('.desktop-checkbox').forEach(checkbox => {
        checkbox.style.display = isMobile ? 'none' : 'block';
    });
}

// Update filter UI on window resize
window.addEventListener('resize', toggleFilterUI);

// Function to create dynamic filters based on product data
function generateFilters(products) {
    const brands = new Set();
    const configurations = new Set();
    const applianceTypes = new Set();
    const colors = new Set();
    const iceMakerOptions = new Set();
    const priceRanges = new Set();

    // Extract unique filter values from product data
    products.forEach(product => {
        if (product.brand) brands.add(product.brand);
        if (product.configuration) configurations.add(product.configuration);
        if (product.applianceType) applianceTypes.add(product.applianceType);
        if (product.color) colors.add(product.color);
        iceMakerOptions.add(product.iceMaker ? 'Yes' : 'No');
        
        // Define price ranges
        if (product.price <= 500) {
            priceRanges.add('0-500');
        } else if (product.price <= 1000) {
            priceRanges.add('501-1000');
        } else if (product.price <= 2000) {
            priceRanges.add('1001-2000');
        } else {
            priceRanges.add('2001+');
        }
    });

    const filterContainer = document.querySelector('.filter-sidebar');
    filterContainer.innerHTML = `
        <div class="filter-section">
            <h4>Appliance Type</h4>
            <select class="mobile-dropdown" name="applianceType">
                <option value="">Select Appliance Type</option>
                ${Array.from(applianceTypes).map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
            ${createCheckboxFilter('applianceType', Array.from(applianceTypes))}
        </div>
        <div class="filter-section">
            <h4>Configuration</h4>
            <select class="mobile-dropdown" name="configuration">
                <option value="">Select Configuration</option>
                ${Array.from(configurations).map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
            ${createCheckboxFilter('configuration', Array.from(configurations))}
        </div>
        <div class="filter-section">
            <h4>Brand</h4>
            <select class="mobile-dropdown" name="brand">
                <option value="">Select Brand</option>
                ${Array.from(brands).map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
            ${createCheckboxFilter('brand', Array.from(brands))}
        </div>
        <div class="filter-section">
            <h4>Color</h4>
            <select class="mobile-dropdown" name="color">
                <option value="">Select Color</option>
                ${Array.from(colors).map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
            ${createCheckboxFilter('color', Array.from(colors))}
        </div>
        <div class="filter-section">
            <h4>Ice Maker</h4>
            <select class="mobile-dropdown" name="iceMaker">
                <option value="">Select Ice Maker</option>
                ${Array.from(iceMakerOptions).map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
            ${createCheckboxFilter('iceMaker', Array.from(iceMakerOptions))}
        </div>
        <div class="filter-section">
            <h4>Price Range</h4>
            <select class="mobile-dropdown" name="price">
                <option value="">Select Price Range</option>
                ${Array.from(priceRanges).map(option => `<option value="${option}">${option}</option>`).join('')}
            </select>
            ${createCheckboxFilter('price', Array.from(priceRanges))}
        </div>
    `;

    document.querySelectorAll('.filter-sidebar input, .filter-sidebar select').forEach(filterElement => {
        filterElement.addEventListener('change', () => filterProducts(products));
    });
}

// Function to create filter checkboxes
function createCheckboxFilter(filterName, filterOptions) {
    return filterOptions.map(option => `
        <label class="desktop-checkbox">
            <input type="checkbox" name="${filterName}" value="${option}">
            ${option}
        </label><br>
    `).join('');
}

// Function to display products
function displayProducts(products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = ''; // Clear the product grid
    
    products
        .filter(product => product.Status !== 'Sold') // Exclude sold products
        .forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('product');
        
            const applianceType = product.applianceType || 'N/A';
            const configuration = product.configuration || 'N/A';
            const model = product.model || 'N/A';
            const color = product.color || 'N/A';
            const counterDepth = product.depth_type === 'counter' ? 'Counter Depth' : 'Standard Depth';
            const iceMaker = product.iceMaker === 'TRUE' ? 'Yes' : 'No';
            const size = product.cuFt ? `${product.cuFt} cu ft` : 'N/A';
            const dimensions = product.height && product.width && product.depth
                ? `${product.height}H x ${product.width}W x ${product.depth}D inches`
                : 'N/A';
            const retailPrice = product.retailValue || 'N/A';
            const youSave = product.youSave || 'N/A';
            const ourPrice = product.price || 'N/A';

            const images = Array.isArray(product.images) ? product.images : (product.images ? product.images.split(', ') : [placeholderImage]);

            productElement.setAttribute('data-appliance-type', applianceType.toLowerCase());
            productElement.setAttribute('data-configuration', configuration.toLowerCase());
            productElement.setAttribute('data-brand', product.brand ? product.brand.toLowerCase() : '');
            productElement.setAttribute('data-color', color.toLowerCase());
            productElement.setAttribute('data-price', product.price || 0);
            productElement.setAttribute('data-ice-maker', iceMaker.toLowerCase());

            productElement.innerHTML = `
                <div class="product-left">
                    <div class="carousel">
                        <img src="${images[0]}" class="carousel-main-image" alt="${product.productName}">
                    </div>
                    <div class="thumbnail-container">
                        ${images.map(image => `<img src="${image}" class="thumbnail" alt="Thumbnail for ${product.productName}">`).join('')}
                    </div>
                </div>
                <div class="product-right">
                    <div class="product-info">
                        <h3>${product.productName}</h3>
                        <p><strong>Style:</strong> ${configuration}</p>
                        <p><strong>Model:</strong> ${model}</p>
                        <p><strong>Color:</strong> ${color}</p>
                        <p><strong>Depth:</strong> ${counterDepth}</p>
                        <p><strong>Ice Maker:</strong> ${iceMaker}</p>
                        <p><strong>Size:</strong> ${size}</p>
                        <p><strong>Dimensions:</strong> ${dimensions}</p>
                        <p><strong>Retail Price:</strong> ${retailPrice}</p>
                        <p><strong>You Save:</strong> ${youSave}</p>
                        <p class="price"><strong>Our Price:</strong> ${ourPrice}</p>
                    </div>
                </div>
            `;

            productGrid.appendChild(productElement);
        });

    initializeCarousels();
}

function filterProducts(products) {
    const selectedApplianceTypes = Array.from(document.querySelectorAll('input[name="applianceType"]:checked, select[name="applianceType"]'))
        .map(el => el.value.trim().toLowerCase())
        .filter(Boolean);
    const selectedConfigurations = Array.from(document.querySelectorAll('input[name="configuration"]:checked, select[name="configuration"]'))
        .map(el => el.value.trim().toLowerCase())
        .filter(Boolean);
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked, select[name="brand"]'))
        .map(el => el.value.trim().toLowerCase())
        .filter(Boolean);
    const selectedColors = Array.from(document.querySelectorAll('input[name="color"]:checked, select[name="color"]'))
        .map(el => el.value.trim().toLowerCase())
        .filter(Boolean);
    const selectedPrice = document.querySelector('input[name="price"]:checked, select[name="price"]') 
        ? document.querySelector('input[name="price"]:checked, select[name="price"]').value.trim()
        : null;
    const selectedIceMaker = document.querySelector('input[name="iceMaker"]:checked, select[name="iceMaker"]') 
        ? document.querySelector('input[name="iceMaker"]:checked, select[name="iceMaker"]').value.trim().toLowerCase()
        : null;

    // Filter the products based on the selected filters
    const filteredProducts = products.filter(product => {
        const productType = product.applianceType ? product.applianceType.trim().toLowerCase() : '';
        const productConfiguration = product.configuration ? product.configuration.trim().toLowerCase() : '';
        const productBrand = product.brand ? product.brand.trim().toLowerCase() : '';
        const productColor = product.color ? product.color.trim().toLowerCase() : '';
        const productPrice = parseInt(product.price) || 0;
        const productIceMaker = product.iceMaker ? (product.iceMaker === 'TRUE' ? 'yes' : 'no') : '';

        // Check if the product matches the selected filters
        const matchType = selectedApplianceTypes.length === 0 || selectedApplianceTypes.includes(productType);
        const matchConfiguration = selectedConfigurations.length === 0 || selectedConfigurations.includes(productConfiguration);
        const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);
        const matchColor = selectedColors.length === 0 || selectedColors.includes(productColor);
        const matchPrice = !selectedPrice || inPriceRange(productPrice, selectedPrice);
        const matchIceMaker = selectedIceMaker === null || productIceMaker === selectedIceMaker;

        return matchType && matchConfiguration && matchBrand && matchColor && matchPrice && matchIceMaker;
    });

    // Display the filtered products
    displayProducts(filteredProducts);
}


// Main image carousel initialization
function initializeCarousels() {
    const carousels = document.querySelectorAll('.carousel-main-image');
    carousels.forEach((carousel) => {
        const thumbnails = Array.from(carousel.closest('.product-left').querySelectorAll('.thumbnail'));
        const images = thumbnails.map(thumb => thumb.src);
        let currentIndex = 0;

        // Update image function
        const updateImage = () => {
            carousel.src = images[currentIndex];
        };

        // Main image click to toggle
        carousel.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateImage();
        });
    });
}

// Thumbnail click event for image changes
function initializeThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', (e) => {
            const mainImage = e.target.closest('.product-left').querySelector('.carousel-main-image');
            mainImage.src = e.target.src; // Change the main image to the clicked thumbnail
        });
    });
}

function inPriceRange(price, selectedRange) {
    if (selectedRange === '2001+') {
        return price > 2000;
    }
    const [min, max] = selectedRange.split('-').map(Number);
    return price >= min && price <= max;
}
