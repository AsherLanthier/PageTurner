import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs';

var fileChooser = document.getElementById('fileChooser');
fileChooser.addEventListener('change', (event) => {
    var file = event.target.files[0];
    var fileName = file.name;

    var url = URL.createObjectURL(file);
    displayPDF(url);
})

var portSelector = document.getElementById('portSelector');
var pdfUploaded = false;

function displayPDF(url) {
    var previousPageButton = document.getElementById('previousPageButton');
    var nextPageButton = document.getElementById('nextPageButton');

    var loadingTask = pdfjsLib.getDocument({
        url: url,
        wasmUrl: './wasm/'
    });
    loadingTask.promise.then(function (pdf) {
        console.log('PDF Loaded');
        pdfUploaded = true;

        var pageNumber = 1
        var minPages = 1;
        var maxPages = pdf.numPages;

        function renderPage(pageNumber) {
            pdf.getPage(pageNumber).then(function (page) {
                var scale = 1.5;
                var viewport = page.getViewport({ scale: scale, });

                var outputScale = window.devicePixelRatio || 1;

                var canvas = document.getElementById("pdfCanvas");
                var context = canvas.getContext("2d");

                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = Math.floor(viewport.width) + "px";
                canvas.style.height = Math.floor(viewport.height) + "px";

                var transform = outputScale !== 1
                    ? [outputScale, 0, 0, outputScale, 0, 0]
                    : null;

                var renderContext = {
                    canvasContext: context,
                    transform: transform,
                    viewport: viewport
                };
                page.render(renderContext);
            })
        }

        previousPageButton.addEventListener('click', () => {
            if (pageNumber != minPages) {
                pageNumber--;
                renderPage(pageNumber);
            }
        })

        nextPageButton.addEventListener('click', () => {
            
            if (pageNumber != maxPages) {
                pageNumber++;
                renderPage(pageNumber);
            }
        })

        portSelector.addEventListener('click', async () => {
            var port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            console.log('Connected');
            const reader = port.readable.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    break;
                }
                if (value) {
                    var message = decoder.decode(value);
                    console.log(message);

                    if (message[0] == 'N') {
                        if (pageNumber != maxPages) {
                            pageNumber++;
                            renderPage(pageNumber);
                        }
                    }
                }
            }
        });

        renderPage(pageNumber);
    });
}

portSelector.addEventListener("click", () => {
    if (!pdfUploaded) {
        alert("Please open a PDF before trying to connect to the pedal.");
    }
})