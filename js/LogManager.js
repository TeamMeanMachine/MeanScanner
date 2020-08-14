/*
 * MeanScanner LogManager Module (Requires googleapis)
 */

class LogManager {
  constructor(opts = {}) {
    this.SPREADSHEET_ID = '1GEkN-CR8aFFLnDy-ZKuhokI3azK-ygSEJp4Q6y2E2pg';
    this.CLIENT_ID = '938209231565-tlsrper5vjdaboo8qghjfu3tpgqqbajk.apps.googleusercontent.com';
    this.API_KEY = 'AIzaSyDKscGpqmGmB8DlAPJuA0jGGOfB9tA4FKg';
    this.SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
    this.DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

    this.authorizeButton = document.querySelector(opts.authorizeButton || '#authorize-button');
    this.deauthorizeButton = document.querySelector(
      opts.deauthorizeButton || '#deauthorize-button'
    );
  }

  addEntry(name, type) {
    type = type === 'out' ? 'out' : 'in';
    fetch(
      `https://docs.google.com/forms/d/e/1FAIpQLSem6RS-lKZQlT2Ph9lpPOdEll1I7E6ky4dG0mq4o1DZ65WPWQ/formResponse?usp=pp_url&entry.394065435=${name}-${type}`
    );
  }

  handleClientLoad() {
    gapi.load('client:auth2', this.initClient.bind(this));
  }

  async initClient() {
    const opts = {
      apiKey: this.API_KEY,
      clientId: this.CLIENT_ID,
      discoveryDocs: this.DISCOVERY_DOCS,
      scope: this.SCOPES,
    };

    await gapi.client.init(opts);

    gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus.bind(this));
    this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    this.authorizeButton.onclick = handleAuthClick;
    this.signoutButton.onclick = handleDeauthClick;
  }

  updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      this.authorizeButton.style.display = 'none';
      this. deauthorizeButton.style.display = 'block';
      document.querySelector('#pills-qr-tab').classList.remove('disabled');
      document.querySelector('#pills-qr-tab').click();
    } else {
      this.authorizeButton.style.display = 'block';
      this.deauthorizeButton.style.display = 'none';
    }
  }

  handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
  }

  handleDeauthClick() {
    gapi.auth2.getAuthInstance().signOut();
  }

  datesEqual(date1, date2) {
    return (
      date1.getDate() == date2.getDate() &&
      date1.getMonth() == date2.getMonth() &&
      date1.getFullYear() == date2.getFullYear()
    );
  }
}

window.LogManager = LogManager;
