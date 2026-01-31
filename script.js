const nhkTotal = 3050;
const services = [
    { id: 'ab-p', name: 'ABEMAプレミアム', price: 1080 },
    { id: 'ab', name: 'ABEMA広告つきプレミアム', price: 580 },
    { id: 'am', name: 'Amazon Prime Video', price: 600 },
    { id: 'at', name: 'Apple TV+', price: 900 },
    { id: 'dp-p', name: 'Disney+ (Premium)', price: 1520 },
    { id: 'dp', name: 'Disney+ (Standard)', price: 1140 },
    { id: 'hu', name: 'hulu', price: 1026 },
    { id: 'nf-p', name: 'Netflix (Premium)', price: 2290 },
    { id: 'nf-s', name: 'Netflix (Standard)', price: 1590 },
    { id: 'nf', name: 'Netflix (広告つきStandard)', price: 890 },
    { id: 'yt', name: 'YouTube Premium', price: 1280 }
];

const subListContainer = document.getElementById('sub-list');
const subTotalEl = document.getElementById('sub-total');
const comparisonTextEl = document.getElementById('comparison-text');
const resultBar = document.getElementById('result-bar');

// Render services
services.forEach(service => {
    const div = document.createElement('div');
    div.className = 'relative';
    div.innerHTML = `
        <input type="checkbox" id="${service.id}" value="${service.price}" class="hidden custom-checkbox sub-item">
        <label for="${service.id}" class="flex justify-between items-center p-3 border border-gray-100 rounded-xl cursor-pointer hover:border-blue-300 transition-all duration-200 select-none">
            <div class="flex items-center">
                <div class="w-5 h-5 border-2 border-gray-300 rounded mr-3 flex items-center justify-center checkbox-indicator transition-colors">
                    <div class="w-2.5 h-2.5 bg-blue-500 rounded-sm hidden"></div>
                </div>
                <span class="text-sm font-bold text-gray-700">${service.name}</span>
            </div>
            <span class="text-sm font-mono font-bold text-gray-500">¥${service.price.toLocaleString()}</span>
        </label>
    `;
    subListContainer.appendChild(div);
});

// Calculation logic
function updateTotals() {
    const checkboxes = document.querySelectorAll('.sub-item');
    let total = 0;
    checkboxes.forEach(cb => {
        const label = cb.nextElementSibling;
        const indicator = label.querySelector('.checkbox-indicator div');
        const box = label.querySelector('.checkbox-indicator');

        if (cb.checked) {
            total += parseInt(cb.value);
            indicator.classList.remove('hidden');
            box.classList.add('border-blue-500');
            label.classList.add('bg-blue-50', 'border-blue-200');
        } else {
            indicator.classList.add('hidden');
            box.classList.remove('border-blue-500');
            label.classList.remove('bg-blue-50', 'border-blue-200');
        }
    });

    subTotalEl.innerText = `¥${total.toLocaleString()}`;

    const diff = nhkTotal - total;

    if (diff > 0) {
        resultBar.className = 'p-6 md:p-8 gradient-green text-white transition-all duration-500';
        comparisonTextEl.innerText = `NHK解約後、あと ¥${diff.toLocaleString()} 自由に使えます！`;
    } else if (diff === 0) {
        resultBar.className = 'p-6 md:p-8 bg-blue-600 text-white transition-all duration-500';
        comparisonTextEl.innerText = `NHK受信料とピッタリ同じ金額です。`;
    } else {
        resultBar.className = 'p-6 md:p-8 bg-amber-500 text-white transition-all duration-500';
        comparisonTextEl.innerText = `NHKより ¥${Math.abs(diff).toLocaleString()} 高くなりますが、満足度は？`;
    }

    updateURL();
}

function updateURL() {
    const selectedIds = Array.from(document.querySelectorAll('.sub-item:checked'))
        .map(cb => cb.id);
    const url = new URL(window.location);
    if (selectedIds.length > 0) {
        url.searchParams.set('s', selectedIds.join(','));
    } else {
        url.searchParams.delete('s');
    }
    window.history.replaceState({}, '', url);
}

function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const s = urlParams.get('s');
    if (s) {
        const ids = s.split(',');
        ids.forEach(id => {
            const cb = document.getElementById(id);
            if (cb) cb.checked = true;
        });
    }
}

function share(platform) {
    const total = subTotalEl.innerText;
    const diff = nhkTotal - parseInt(total.replace(/[^0-9]/g, ''));
    const selectedServices = Array.from(document.querySelectorAll('.sub-item:checked'))
        .map(cb => services.find(s => s.id === cb.id).name);

    let text = `NHK受信料（¥3,050/月）をサブスクに充てたら…💻\n\n`;
    if (selectedServices.length > 0) {
        text += `【契約内容】\n${selectedServices.join('\n')}\n\n`;
    }
    text += `合計: ${total}/月\n`;

    if (diff > 0) {
        text += `NHKより ¥${diff.toLocaleString()} お得！✨`;
    } else if (diff === 0) {
        text += `NHKとピッタリ同額！🎯`;
    } else {
        text += `NHKより ¥${Math.abs(diff).toLocaleString()} 高いですが、満足度爆上がり！🔥`;
    }

    text += `\n#NHK受信料 #サブスク比較 #節約\n`;

    const shareUrl = window.location.href;

    if (platform === 'x') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`);
    } else if (platform === 'threads') {
        window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text + '\n' + shareUrl)}`);
    }
}

async function copyLink() {
    try {
        await navigator.clipboard.writeText(window.location.href);
        const btn = document.getElementById('copy-btn');
        const originalContent = btn.innerHTML;
        btn.innerHTML = 'コピーしました！';
        btn.classList.replace('bg-gray-100', 'bg-green-100');
        btn.classList.replace('text-gray-600', 'text-green-700');
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.replace('bg-green-100', 'bg-gray-100');
            btn.classList.replace('text-green-700', 'text-gray-600');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

// Add event listeners
document.querySelectorAll('.sub-item').forEach(cb => {
    cb.addEventListener('change', updateTotals);
});

// Initial call
loadFromURL();
updateTotals();
