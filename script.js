<script>
const selections = {
    topics: new Set(),
    form: null,
    process: null
};

// Handle token clicks
document.querySelectorAll('.token').forEach(token => {
    token.addEventListener('click', () => {
        const category = token.dataset.category;
        const value = token.dataset.value;

        if (category === 'topics') {
            if (token.classList.contains('selected')) {
                token.classList.remove('selected');
                selections.topics.delete(value);
            } else if (selections.topics.size < 3) {
                token.classList.add('selected');
                selections.topics.add(value);
            }
        } else if (category === 'process') {
            document.querySelectorAll('[data-category="process"]').forEach(t => {
                t.classList.remove('selected');
            });
            token.classList.add('selected');
            selections.process = value;
        }

        checkReady();
    });
});

// Handle form card clicks
document.querySelectorAll('.form-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.form-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');
        selections.form = card.dataset.value;
        checkReady();
    });
});

// Check if ready to create
function checkReady() {
    const btn = document.getElementById('createBtn');
    const vision = document.getElementById('visionText').value.trim();
    
    if (selections.topics.size === 3 && selections.form && selections.process && vision) {
        btn.disabled = false;
    } else {
        btn.disabled = true;
    }
}

document.getElementById('visionText').addEventListener('input', checkReady);

// Create button
document.getElementById('createBtn').addEventListener('click', async () => {
    const vision = document.getElementById('visionText').value;
    const topics = Array.from(selections.topics).join(', ');
    
    const prompt = `Based on these topics: ${topics}, using ${selections.form} format and ${selections.process} approach, create a detailed ${selections.form === 'storytelling' ? 'story' : 'visual description'} for this future vision: ${vision}`;

    // Show output screen
    document.getElementById('outputScreen').classList.add('visible');
    document.getElementById('outputDate').textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const outputContent = document.getElementById('outputContent');
    outputContent.innerHTML = '<div class="loading">Generating<span class="loading-dots"></span></div>';

    // Call AI API
    await generateContent(prompt, selections.form);
});

async function generateContent(prompt, form) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: prompt + (form === 'storytelling' ? '\n\nWrite a compelling narrative story.' : '\n\nProvide a detailed visual description.')
                }]
            })
        });

        const data = await response.json();
        const content = data.content[0].text;
        
        typeWriter(content);
    } catch (error) {
        // Fallback demo content
        const topics = Array.from(selections.topics).join(', ');
        const demoContent = `In the year 2045, a transformative solution emerged...

Through the integration of ${topics}, communities discovered unprecedented ways to shape their future.

${form === 'storytelling' ? 
'The story begins in a modest neighborhood where residents gathered to reimagine their shared tomorrow. Through collaborative innovation and sustained commitment, they built systems that honored both tradition and progress. Their success rippled outward, inspiring similar movements across continents.' :
'The visual landscape transformed: sleek infrastructure merged seamlessly with natural ecosystems. Public spaces became dynamic hubs where technology enhanced human connection rather than replacing it. Every element reflected careful consideration of long-term sustainability and social equity.'}

This approach demonstrated that meaningful change requires both bold imagination and pragmatic implementation. The future they built wasn't perfect, but it was profoundly more hopeful than the path they left behind.`;
        
        typeWriter(demoContent);
    }
}

function typeWriter(text) {
    const outputContent = document.getElementById('outputContent');
    outputContent.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            outputContent.textContent += text.charAt(i);
            i++;
            setTimeout(type, 30);
        }
    }
    
    type();
}

function closeOutput() {
    document.getElementById('outputScreen').classList.remove('visible');
}
    </script>
