document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Shopping Cart Functionality
    let cart = [];

    // DOM Elements
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');

    // Open cart
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close cart
    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Update cart display
    function updateCartDisplay() {
        // Update count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;

        // Update checkout button
        btnCheckout.disabled = cart.length === 0;

        // Render cart items
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    // Add to cart
    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price: parseFloat(price), quantity: 1 });
        }

        updateCartDisplay();
        openCart();
    }

    // Update quantity (exposed globally for inline onclick)
    window.updateQuantity = function(index, change) {
        cart[index].quantity += change;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        updateCartDisplay();
    };

    // Remove from cart (exposed globally for inline onclick)
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    };

    // Event Listeners
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }

    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    // Add to cart button listeners
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.dataset.name;
            const price = this.dataset.price;

            // Visual feedback
            this.classList.add('added');
            const originalText = this.textContent;
            this.textContent = '¡Añadido!';

            setTimeout(() => {
                this.classList.remove('added');
                this.textContent = originalText;
            }, 1000);

            addToCart(name, price);
        });
    });

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutClose = document.getElementById('checkoutClose');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutOrderSummary = document.getElementById('checkoutOrderSummary');
    const productosInput = document.getElementById('productosInput');
    const totalInput = document.getElementById('totalInput');

    // Open checkout modal
    function openCheckoutModal() {
        // Populate order summary
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let orderSummaryHTML = '<h4>Resumen del Pedido</h4><ul class="order-items">';
        cart.forEach(item => {
            orderSummaryHTML += `<li>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`;
        });
        orderSummaryHTML += `</ul><div class="order-total"><strong>Total: $${total.toFixed(2)}</strong></div>`;
        checkoutOrderSummary.innerHTML = orderSummaryHTML;

        // Populate hidden fields
        const productosText = cart.map(item => `${item.quantity}x ${item.name} ($${item.price.toFixed(2)} c/u)`).join(', ');
        productosInput.value = productosText;
        totalInput.value = `$${total.toFixed(2)}`;

        // Show modal
        checkoutModal.classList.add('active');
        checkoutOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close checkout modal
    function closeCheckoutModal() {
        checkoutModal.classList.remove('active');
        checkoutOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Checkout button - opens checkout modal
    if (btnCheckout) {
        btnCheckout.addEventListener('click', function() {
            if (cart.length > 0) {
                closeCart();
                openCheckoutModal();
            }
        });
    }

    // Close checkout modal events
    if (checkoutClose) {
        checkoutClose.addEventListener('click', closeCheckoutModal);
    }
    if (checkoutOverlay) {
        checkoutOverlay.addEventListener('click', closeCheckoutModal);
    }

    // Handle form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(checkoutForm);

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                // Success
                closeCheckoutModal();
                cart = [];
                updateCartDisplay();

                // Show success message
                showSuccessMessage();
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Hubo un error al enviar tu pedido. Por favor intenta de nuevo.');
            });
        });
    }

    // Success message function
    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>¡Pedido Enviado!</h3>
                <p>Hemos recibido tu pedido. Te contactaremos pronto para confirmar los detalles.</p>
                <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Aceptar</button>
            </div>
        `;
        document.body.appendChild(successDiv);
    }

    // Initialize cart display
    updateCartDisplay();
});
