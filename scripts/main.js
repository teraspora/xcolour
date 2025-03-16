document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const image_upload = document.getElementById('image-upload');
    const upload_section = document.getElementById('upload-section');
    const app_container = document.getElementById('app-container');
    const canvas = document.getElementById('image-canvas');
    const colors_list = document.getElementById('colors-list');
    const done_button = document.getElementById('done-button');
    const success_message = document.getElementById('success-message');
    const new_image_button = document.getElementById('new-image-button');
    const clear_button = document.getElementById('clear-button');
    const color_counter = document.getElementById('color-counter');
    
    const ctx = canvas.getContext('2d');
    let img = null;
    let colours = [];
    
    // Event listeners
    image_upload.addEventListener('change', handle_image_upload);
    canvas.addEventListener('click', handle_canvas_click);
    done_button.addEventListener('click', handle_done);
    new_image_button.addEventListener('click', handle_new_image);
    clear_button.addEventListener('click', clear_colors);
    
    function handle_image_upload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            img = new Image();
            img.onload = function() {
                // Set canvas dimensions to match image
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0);
                
                // Show the app container
                upload_section.classList.add('hidden');
                app_container.classList.remove('hidden');
                success_message.classList.add('hidden');
                
                // Update color counter
                update_color_counter();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function handle_canvas_click(e) {
        if (!img) return;
        
        // Get click coordinates relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / (rect.width / canvas.width));
        const y = Math.round((e.clientY - rect.top) / (rect.height / canvas.height));
        
        // Get pixel color data
        const pixel_data = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel_data[0];
        const g = pixel_data[1];
        const b = pixel_data[2];
        
        // Convert to hex
        const hex = rgb_to_hex(r, g, b);
        
        // Generate unique ID for this color
        const color_id = `color-${Date.now()}`;
        
        // Add to colors array
        colours.push({
            id: color_id,
            hex: hex,
            rgb: `rgb(${r}, ${g}, ${b})`,
            r: r,
            g: g,
            b: b
        });
        
        // Display the color
        display_color(color_id, hex, `rgb(${r}, ${g}, ${b})`);
        
        // Update color counter
        update_color_counter();
    }
    
    function rgb_to_hex(r, g, b) {
        return '#' + component_to_hex(r) + component_to_hex(g) + component_to_hex(b);
    }
    
    function component_to_hex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    
    function display_color(id, hex, rgb) {
        const color_item = document.createElement('div');
        color_item.className = 'color-item';
        color_item.dataset.id = id;
        
        const color_preview = document.createElement('div');
        color_preview.className = 'color-preview';
        color_preview.style.backgroundColor = hex;
        
        const color_info = document.createElement('div');
        color_info.className = 'color-info';
        color_info.textContent = `${hex} | ${rgb}`;
        
        const delete_button = document.createElement('button');
        delete_button.className = 'delete-button';
        delete_button.textContent = 'Delete';
        delete_button.addEventListener('click', function() {
            delete_color(id);
        });
        
        color_item.appendChild(color_preview);
        color_item.appendChild(color_info);
        color_item.appendChild(delete_button);
        colors_list.appendChild(color_item);
    }
    
    function delete_color(id) {
        // Remove from array
        colours = colours.filter(color => color.id !== id);
        
        // Remove from DOM
        const color_item = document.querySelector(`.color-item[data-id="${id}"]`);
        if (color_item) {
            color_item.remove();
        }
        
        // Update color counter
        update_color_counter();
    }
    
    function clear_colors() {
        // Clear the array
        colours = [];
        
        // Clear the DOM
        colors_list.innerHTML = '';
        
        // Update color counter
        update_color_counter();
    }
    
    function update_color_counter() {
        color_counter.innerHTML = '';
        
        const count = colours.length;
        const circle_radius = 50;
        const dot_radius = 8;
        
        // Create container for the clock-like display
        const clock_container = document.createElement('div');
        clock_container.className = 'clock-container';
        clock_container.style.position = 'relative';
        clock_container.style.width = `${circle_radius * 2 + dot_radius * 2}px`;
        clock_container.style.height = `${circle_radius * 2 + dot_radius * 2}px`;
        
        // Add the count number in the center
        const count_display = document.createElement('div');
        count_display.className = 'count-display';
        count_display.textContent = count;
        count_display.style.position = 'absolute';
        count_display.style.top = '50%';
        count_display.style.left = '50%';
        count_display.style.transform = 'translate(-50%, -50%)';
        count_display.style.fontSize = '20px';
        count_display.style.fontWeight = 'bold';
        
        clock_container.appendChild(count_display);
        
        // Add color dots in a circle like a clock
        colours.forEach((color, index) => {
            const angle = (index / colours.length) * 2 * Math.PI - Math.PI / 2; // Start from 12 o'clock
            const dot_x = circle_radius + circle_radius * Math.cos(angle);
            const dot_y = circle_radius + circle_radius * Math.sin(angle);
            
            const dot = document.createElement('div');
            dot.className = 'color-dot';
            dot.style.position = 'absolute';
            dot.style.width = `${dot_radius * 2}px`;
            dot.style.height = `${dot_radius * 2}px`;
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = color.hex;
            dot.style.border = '1px solid rgba(0, 0, 0, 0.1)';
            dot.style.left = `${dot_x}px`;
            dot.style.top = `${dot_y}px`;
            
            clock_container.appendChild(dot);
        });
        
        color_counter.appendChild(clock_container);
    }
    
    function handle_done() {
        // Format the colors array for clipboard
        const formatted_colors = JSON.stringify(colours, null, 2);
        
        // Copy to clipboard
        navigator.clipboard.writeText(formatted_colors)
            .then(() => {
                app_container.classList.add('hidden');
                success_message.classList.remove('hidden');
            })
            .catch(err => {
                console.error('Failed to copy to clipboard:', err);
                alert('Failed to copy to clipboard. Please try again.');
            });
    }
    
    function handle_new_image() {
        // Reset the file input
        image_upload.value = '';
        
        // Show the upload section
        upload_section.classList.remove('hidden');
        success_message.classList.add('hidden');
    }
    
    // Initialize the color counter
    update_color_counter();
});
