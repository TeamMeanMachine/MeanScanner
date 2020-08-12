// Peer dependency: jsqr.js

// Make sure this is loaded AFTER the jsqr import but BEFORE your intialization code to make sure this works

class QRScanner {
  constructor(opts = {}) {
    // Initialize instance vars
    this.video = document.createElement('video');
    this.canvas = document.querySelector(opts.canvas) || '#canvas';
    this.ctx = this.canvas.getContext('2d');

    this.draw = {};
    this.draw.lineWidth = opts.draw.lineWidth || 2;
    this.draw.strokeStyle = opts.draw.strokeStyle || 'red';
  }

  async scan() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }, // Make sure that the phone is facing away
    });

    this.video.srcObject = stream;
    this.video.setAttribute('playsinline', true);
    this.video.play();
    requestAnimationFrame(this.step.bind(this)); // Need to bind this due to requestAnimationFrame

    return new Promise((res) => {
      this.canvas.addEventListener('qrscan', ({ detail }) => {
        res({
          name: detail.name,
          first: detail.first,
          last: detail.last,
        });
      });
    });
  }

  step() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvas.height = this.video.videoHeight;
      this.canvas.width = this.video.videoWidth;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const qr = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (qr) {
        const {
          topLeftCorner,
          topRightCorner,
          bottomRightCorner,
          bottomLeftCorner,
        } = qr.location;

        this.drawLine(topLeftCorner, topRightCorner);
        this.drawLine(topRightCorner, bottomRightCorner);
        this.drawLine(bottomRightCorner, bottomLeftCorner);
        this.drawLine(bottomLeftCorner, topLeftCorner);

        const nameParts = this.parseName(qr.data);
        const event = new CustomEvent('qrscan', {
          bubbles: true,
          detail: {
            name: nameParts.join(' '),
            first: nameParts[0],
            last: nameParts[1],
          },
        });
        this.canvas.dispatchEvent(event);

        // Stop when detected
        this.video.pause();
        return;
      }
    }

    // Keep calling step
    requestAnimationFrame(this.step.bind(this));
  }

  drawLine(begin, end) {
    // Plug and play canvas draw sequence
    this.ctx.beginPath();
    this.ctx.moveTo(begin.x, begin.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.lineWidth = this.draw.lineWidth;
    this.ctx.strokeStyle = this.draw.strokeStyle;
    this.ctx.stroke();
  }

  parseName(data) {
    // Grabs the first 2 elems after split to get FIRST LAST_INITIAL (ex. Aiden B)
    const parts = data.toUpperCase().split(' ');
    return parts.slice(0, 2);
  }
}

window.qrscan = QRScanner; // Bind to window