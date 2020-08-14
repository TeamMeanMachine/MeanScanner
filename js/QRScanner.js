/*
 * MeanScanner QRScanner Module (Requires jsQR)
 */

class QRScanner {
  constructor(opts = {}) {
    this.prefix = opts.prefix || 'TMM';
    this.video = document.createElement('video');
    this.canvas = document.querySelector(opts.canvas) || '#canvas';
    this.ctx = this.canvas.getContext('2d');

    this.draw = {};
    opts.draw = opts.draw || {};
    this.draw.lineWidth = opts.draw.lineWidth || 4;
    this.draw.successStrokeStyle = opts.draw.successStrokeStyle || '#DC3545';
    this.draw.failStrokeStyle = opts.draw.failStrokeStyle || '#DC3545';

    this.currentlyScanning = false;
  }

  async scan() {
    this.canvas.hidden = false;
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

  show() {
    this.canvas.hidden = false;
  }

  hide() {
    this.canvas.hidden = true;
  }

  stop() {
    this.currentlyScanning = false;
    this.video.pause();
    this.video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }

  destroy() {
    this.stop();
    this.hide();
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
          const nameParts = this._parseName(atob(qr.data));
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

          this.stop();
          return;
        } catch (err) {
          this._drawLine(topLeftCorner, bottomRightCorner, this.draw.failStrokeStyle);
          this._drawLine(topRightCorner, bottomLeftCorner, this.draw.failStrokeStyle);
          console.error(err);
        }
      }
    }

    requestAnimationFrame(this._step.bind(this));
  }

  _drawLine(begin, end, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(begin.x, begin.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.lineWidth = this.draw.lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  _parseName(data) {
    const parts = data.split(' ').slice(0, 2);
    return this._validateName(parts);
  }

  _validateName(parts) {
    if (parts.length !== 2) {
      throw new Error('Parts length is not 2');
    }
    if (!parts[0].startsWith(this.prefix)) {
      throw new Error('Validation prefix not found');
    }
    parts[0] = parts[0].replace(this.prefix, '');
    if (typeof parts[0] !== 'string' || typeof parts[1] !== 'string') {
      throw new Error('Parts type is not string');
    }
    if (!/^[a-zA-Z]+$/.test(parts[0]) || !/^[a-zA-Z]+$/.test(parts[1])) {
      throw new Error('Parts contain characters that are not letters');
    }
    return parts;
  }
}

window.QRScanner = QRScanner;
