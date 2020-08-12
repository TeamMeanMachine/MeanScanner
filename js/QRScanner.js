// Peer dependency: jsqr.js

class QRScanner {
  constructor(opts = {}) {
    this.video = document.createElement('video');
    this.canvas = document.querySelector(opts.canvas) || '#canvas';
    this.output = document.querySelector(opts.output) || '#output';
    this.ctx = this.canvas.getContext('2d');

    this.draw = {};
    this.draw.lineWidth = opts.draw.lineWidth || 2;
    this.draw.strokeStyle = opts.draw.strokeStyle || '#D62027';
  }

  drawLine(begin, end) {
    this.ctx.beginPath();
    this.ctx.moveTo(begin.x, begin.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.lineWidth = this.draw.lineWidth;
    this.ctx.strokeStyle = this.draw.strokeStyle;
    this.ctx.stroke();
  }

  parseName(data) {
    const parts = data.toUpperCase().split(' ');
    return parts.slice(0, 2).join(' ');
  }

  async init() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });

    this.video.srcObject = stream;
    this.video.setAttribute('playsinline', true);
    this.video.play();
    requestAnimationFrame(this.tick.bind(this));
  }

  tick() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvas.height = this.video.videoHeight;
      this.canvas.width = this.video.videoWidth;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        const {
          topLeftCorner,
          topRightCorner,
          bottomRightCorner,
          bottomLeftCorner,
        } = code.location;

        this.drawLine(topLeftCorner, topRightCorner);
        this.drawLine(topRightCorner, bottomRightCorner);
        this.drawLine(bottomRightCorner, bottomLeftCorner);
        this.drawLine(bottomLeftCorner, topLeftCorner);

        this.output.innerText = this.parseName(code.data);
        this.video.pause();
        return;
      }
    }
    requestAnimationFrame(this.tick.bind(this));
  }
}