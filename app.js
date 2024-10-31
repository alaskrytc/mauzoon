const video = document.getElementById('video');
const resultDiv = document.getElementById('result');
const startButton = document.getElementById('startButton');

startButton.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const scan = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                resultDiv.innerText = `البيانات المستخرجة: ${code.data}`;
                saveData(code.data);
                stream.getTracks().forEach(track => track.stop());
            }
        }
        requestAnimationFrame(scan);
    };
    scan();
});

function saveData(data) {
    const dbRequest = indexedDB.open('InvoicesDB', 1);

    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('invoices', { keyPath: 'id', autoIncrement: true });
    };

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('invoices', 'readwrite');
        const store = transaction.objectStore('invoices');
        const invoiceData = parseInvoiceData(data); // دالة لتحليل البيانات
        store.add(invoiceData);
    };
}

function parseInvoiceData(data) {
    // هنا يمكنك تحليل البيانات واستخراج الرقم الضريبي والسعر والضريبة والتاريخ والوقت
    const parsedData = {
        taxNumber: 'رقم ضريبي مستخرج',
        price: 'سعر مستخرج',
        tax: 'ضريبة مستخرجة',
        date: 'تاريخ مستخرج',
        time: 'وقت مستخرج'
    };
    return parsedData;
}