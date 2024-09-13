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
    const priceRanges = [];

    // Extract unique filter values from product data where Status is "Available"
    products
        .filter(product => product.Status !== 'Sold') // Only consider available products
        .forEach(product => {
            if (product.brand) brands.add(product.brand);
            if (product.style) configurations.add(product.style); // Assuming 'style' is 'configuration'
            if (product.applianceType) applianceTypes.add(product.applianceType);
            if (product.color) colors.add(product.color);
            iceMakerOptions.add(product.iceMaker === 'TRUE' ? 'Yes' : 'No');

            // Define price ranges as objects with min and max for correct sorting
            const productPrice = parseInt(product.price, 10);
            if (productPrice <= 500) {
                priceRanges.push({ min: 0, max: 500, label: '$0 - $500' });
            } else if (productPrice <= 1000) {
                priceRanges.push({ min: 501, max: 1000, label: '$501 - $1,000' });
            } else if (productPrice <= 2000) {
                priceRanges.push({ min: 1001, max: 2000, label: '$1,001 - $2,000' });
            } else {
                priceRanges.push({ min: 2001, max: Infinity, label: '$2,001+' });
            }
        });

    // Remove duplicates by converting to a Set, then back to array
    const uniquePriceRanges = Array.from(new Set(priceRanges.map(JSON.stringify))).map(JSON.parse);

    // Sort by the min value of each price range
    uniquePriceRanges.sort((a, b) => a.min - b.min);

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
                ${uniquePriceRanges.map(option => `<option value="${option.label}">${option.label}</option>`).join('')}
            </select>
            ${createCheckboxFilter('price', uniquePriceRanges.map(option => option.label))}
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
            const style = product.style || 'N/A'; // Changed from configuration to style
            const model = product.model || 'N/A';
            const color = product.color || 'N/A';
            const counterDepth = product.depth_type === 'counter depth' ? 'Counter Depth' : 'Standard Depth';
            const iceMaker = product.iceMaker === 'TRUE' ? 'Yes' : 'No';
            const size = product.cuFt ? `${product.cuFt} cu ft` : 'N/A';
            const dimensions = product.height && product.width && product.depth
                ? `${product.height}H x ${product.width}W x ${product.depth}D inches`
                : 'N/A';
            const retailPrice = product.retailValue || 'N/A';
            const youSave = product.youSave || 'N/A';
            const ourPrice = product.price || 'N/A';

            // Construct the image path based on the product's ID
            const imageFolderPath = `images/fridge-pictures/${product.ID.replaceAll("/", "-")}`;
            const imageFileBase = product.ID.replaceAll("/", "_"); // Use underscores for the date part
            const images = Array.from({ length: 5 }, (_, index) => `${imageFolderPath}/${imageFileBase}-${index + 1}.jpg`);

            productElement.setAttribute('data-appliance-type', applianceType.toLowerCase());
            productElement.setAttribute('data-style', style.toLowerCase());
            productElement.setAttribute('data-brand', product.brand ? product.brand.toLowerCase() : '');
            productElement.setAttribute('data-color', color.toLowerCase());
            productElement.setAttribute('data-price', product.price || 0);
            productElement.setAttribute('data-ice-maker', iceMaker.toLowerCase());

            productElement.innerHTML = `
                <div class="product-left">
                    <div class="carousel">
                        <img src="${images[0]}" class="carousel-main-image" alt="${product.productName}" onerror="this.onerror=null;this.src='${placeholderImage}';">
                    </div>
                    <div class="thumbnail-container">
                        ${images.map(image => `<img src="${image}" class="thumbnail" alt="Thumbnail for ${product.productName}" onerror="this.onerror=null;this.src='${placeholderImage}';">`).join('')}
                    </div>
                </div>
                <div class="product-right">
                    <div class="product-info">
                        <h3>${product.productName}</h3>
                        <p><strong>Style:</strong> ${style}</p>
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
    const selectedApplianceTypes = getFilterValues('applianceType');
    const selectedConfigurations = getFilterValues('configuration');
    const selectedBrands = getFilterValues('brand');
    const selectedColors = getFilterValues('color');
    const selectedPrice = getFilterValues('price')[0]; // Single selection for price
    const selectedIceMaker = getFilterValues('iceMaker')[0]; // Single selection for ice maker

    // Filter the products based on the selected filters
    const filteredProducts = products.filter(product => {
        const productType = product.applianceType ? product.applianceType.trim().toLowerCase() : '';
        const productConfiguration = product.style ? product.style.trim().toLowerCase() : '';
        const productBrand = product.brand ? product.brand.trim().toLowerCase() : '';
        const productColor = product.color ? product.color.trim().toLowerCase() : '';
        const productPrice = parseFloat(product.price) || 0;
        const productIceMaker = product.iceMaker ? (product.iceMaker === 'TRUE' ? 'yes' : 'no') : '';

        // Check if the product matches the selected filters
        const matchType = selectedApplianceTypes.length === 0 || selectedApplianceTypes.includes(productType);
        const matchConfiguration = selectedConfigurations.length === 0 || selectedConfigurations.includes(productConfiguration);
        const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);
        const matchColor = selectedColors.length === 0 || selectedColors.includes(productColor);
        const matchPrice = !selectedPrice || inPriceRange(productPrice, selectedPrice);
        const matchIceMaker = !selectedIceMaker || productIceMaker === selectedIceMaker;

        return matchType && matchConfiguration && matchBrand && matchColor && matchPrice && matchIceMaker;
    });

    // Display the filtered products
    displayProducts(filteredProducts);
}

// Helper function to get selected values from checkboxes and dropdowns
function getFilterValues(filterName) {
    const checkboxes = Array.from(document.querySelectorAll(`input[name="${filterName}"]:checked`));
    const dropdown = document.querySelector(`select[name="${filterName}"]`);
    const selectedDropdown = dropdown && dropdown.value ? [dropdown.value.trim().toLowerCase()] : [];
    
    const selectedCheckboxes = checkboxes.map(checkbox => checkbox.value.trim().toLowerCase());
    
    return [...selectedDropdown, ...selectedCheckboxes];
}

// Price range comparison
function inPriceRange(price, selectedRange) {
    if (selectedRange === '2001+') {
        return price > 2000;
    }
    const [min, max] = selectedRange.split('-').map(Number);
    return price >= min && price <= max;
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
