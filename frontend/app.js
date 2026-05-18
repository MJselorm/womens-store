// Frontend Logic for ChicCloset Boutique
const API_URL = 'https://womens-store.onrender.com/api'; // FastAPI backend URL
let cart = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    initCart();
    fetchProducts();
});

async function fetchProducts() {
    const productFeed = document.getElementById('product-feed');
    
    try {
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        allProducts = products;
        
        // Clear loading state if any
        productFeed.innerHTML = '';
        
        // Render products
        products.forEach(product => {
            const productHTML = `
                <div class="product-card reveal" style="opacity: 1; transform: translateY(0);">
                    <div class="product-card-image img-zoom">
                        <img src="${product.image_url}" alt="${product.name}">
                        <div class="product-card-overlay">
                            <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}')">Add to Bag</button>
                        </div>
                    </div>
                    <div class="product-card-info">
                        <div class="product-card-category">${product.category}</div>
                        <div class="product-card-name">${product.name}</div>
                        <div class="product-card-price">$${product.price.toFixed(2)}</div>
                    </div>
                </div>
            `;
            productFeed.innerHTML += productHTML;
        });
        
    } catch (error) {
        console.error("Could not fetch products:", error);
        productFeed.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <p>Could not load products. Please make sure the FastAPI server is running.</p>
                <p style="font-size: 0.8rem; margin-top: 10px;">(Run: uvicorn main:app --reload)</p>
            </div>
        `;
    }
}

// Cart UI Logic
function initCart() {
    document.getElementById('open-cart').addEventListener('click', () => {
        document.getElementById('cart-overlay').style.opacity = '1';
        document.getElementById('cart-overlay').style.visibility = 'visible';
        document.getElementById('cart-sidebar').style.right = '0';
    });
    
    document.getElementById('close-cart').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);
}

function closeCart() {
    document.getElementById('cart-overlay').style.opacity = '0';
    document.getElementById('cart-overlay').style.visibility = 'hidden';
    document.getElementById('cart-sidebar').style.right = '-400px';
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    cart.push(product);
    updateCartUI();
    
    // Open cart automatically when adding
    document.getElementById('cart-overlay').style.opacity = '1';
    document.getElementById('cart-overlay').style.visibility = 'visible';
    document.getElementById('cart-sidebar').style.right = '0';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    // Update badge
    cartBadge.textContent = cart.length;
    cartBadge.style.display = cart.length > 0 ? 'flex' : 'none';
    
    // Render items
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align:center; padding: 40px 0;">
                <p class="body-md text-grey">Your bag is empty.</p>
                <button class="btn btn-primary btn-sm" style="margin-top:20px;" onclick="closeCart()">Continue Shopping</button>
            </div>
        `;
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            cartItemsContainer.innerHTML += `
                <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                    <img src="${item.image_url}" alt="${item.name}" style="width: 80px; height: 100px; object-fit: cover; border-radius: var(--radius-sm);">
                    <div style="flex: 1;">
                        <div style="font-family: var(--font-serif); font-size: 1.1rem; margin-bottom: 4px;">${item.name}</div>
                        <div style="color: var(--text-grey); font-size: 0.9rem; margin-bottom: 12px;">$${item.price.toFixed(2)}</div>
                        <button style="background:none; border:none; text-decoration:underline; font-size:0.8rem; color:var(--text-grey); cursor:pointer;" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                </div>
            `;
        });
    }
    
    // Update total
    cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}
