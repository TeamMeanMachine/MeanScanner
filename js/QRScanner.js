// Peer dependency: jsqr.js

// Make sure this is loaded AFTER the jsqr import but BEFORE your intialization code to make sure this works

class QRScanner {
  constructor(opts = {}) {
    // Initialize instance vars
    this.video = document.createElement('video');
    this.canvas = document.querySelector(opts.canvas) || '#canvas';
    this.ctx = this.canvas.getContext('2d');

    this.draw = {};
    opts.draw = opts.draw || {};
    this.draw.lineWidth = opts.draw.lineWidth || 4;
    this.draw.successStrokeStyle = opts.draw.successStrokeStyle || '#52C41A';
    this.draw.failStrokeStyle = opts.draw.failStrokeStyle || '#F5222D';

    this.currentlyScanning = false;
  }

  async scan() {
    this.currentlyScanning = true;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }, // Make sure that the phone is facing away
    });

    this.video.srcObject = stream;
    this.video.setAttribute('playsinline', true);
    this.video.play();
    requestAnimationFrame(this._step.bind(this)); // Need to bind this due to requestAnimationFrame

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

  clear() {
    this.currentlyScanning = false;
    this.video.pause();
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }

  destroy() {
    this.clear();
    this.video.remove();
    this.canvas.remove();
    this.ctx = undefined;
  }

  _step() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      if (!this.currentlyScanning) return;
      this.canvas.height = this.video.videoHeight;
      this.canvas.width = this.video.videoWidth;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const qr = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (qr) {
        const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = qr.location;

        try {
          const nameParts = this._parseName(qr.data);
          const event = new CustomEvent('qrscan', {
            bubbles: true,
            detail: {
              name: nameParts.join(' '),
              first: nameParts[0],
              last: nameParts[1],
            },
          });
          this.canvas.dispatchEvent(event);

          this._drawLine(topLeftCorner, topRightCorner, this.draw.successStrokeStyle);
          this._drawLine(topRightCorner, bottomRightCorner, this.draw.successStrokeStyle);
          this._drawLine(bottomRightCorner, bottomLeftCorner, this.draw.successStrokeStyle);
          this._drawLine(bottomLeftCorner, topLeftCorner, this.draw.successStrokeStyle);

          // Stop when detected
          this.video.pause();
          return;
        } catch (err) {
          this._drawLine(topLeftCorner, bottomRightCorner, this.draw.failStrokeStyle);
          this._drawLine(topRightCorner, bottomLeftCorner, this.draw.failStrokeStyle);
          console.error(err);
        }
      }
    }

    // Keep calling step
    requestAnimationFrame(this._step.bind(this));
  }

  _drawLine(begin, end, color) {
    // Plug and play canvas draw sequence
    this.ctx.beginPath();
    this.ctx.moveTo(begin.x, begin.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.lineWidth = this.draw.lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  _parseName(data) {
    // Grabs the first 2 elems after split to get FIRST LAST_INITIAL (ex. Aiden B)
    const parts = data.split(' ').slice(0, 2);
    return this._validateName(parts);
  }

  _validateName(parts) {
    if (parts.length !== 2) {
      throw new Error('Parts length is not 2');
    }
    if (!parts[0].startsWith('TMM')) {
      throw new Error('Validation prefix not found');
    }
    parts[0] = parts[0].replace('TMM', '');
    if (typeof parts[0] !== 'string' || typeof parts[1] !== 'string') {
      throw new Error('Parts type is not string');
    }
    if (!/^[a-zA-Z]+$/.test(parts[0]) || !/^[a-zA-Z]+$/.test(parts[1])) {
      throw new Error('Parts contain characters that are not letters');
    }
    return parts;
  }

  _wait(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
}

window.qrscan = QRScanner; // Bind to window
