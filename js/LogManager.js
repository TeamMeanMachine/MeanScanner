/*
 * MeanScanner LogManager Module (Requires googleapis)
 */

class LogManager {
  constructor(opts = {}) {
    this.BASE_FORM_URL =
      'https://docs.google.com/forms/d/e/1FAIpQLSem6RS-lKZQlT2Ph9lpPOdEll1I7E6ky4dG0mq4o1DZ65WPWQ/formResponse?entry.394065435=';
    this.SPREADSHEET_ID = '1GEkN-CR8aFFLnDy-ZKuhokI3azK-ygSEJp4Q6y2E2pg';
    this.CLIENT_ID = '938209231565-tlsrper5vjdaboo8qghjfu3tpgqqbajk.apps.googleusercontent.com';
    this.API_KEY = 'AIzaSyDKscGpqmGmB8DlAPJuA0jGGOfB9tA4FKg';
    this.SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
    this.DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

    this.tableBody = document.querySelector(opts.tableBody || '#content');
    this.authorizeButton = document.querySelector(opts.authorizeButton || '#authorize-button');
    this.deauthorizeButton = document.querySelector(
      opts.deauthorizeButton || '#deauthorize-button'
    );
  }

  async addEntry(name) {
    return fetch(`${this.BASE_FORM_URL}${name}`);
  }

  handleClientLoad() {
    gapi.load('client:auth2', this.initClient.bind(this));
  }

  handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
  }

  handleDeauthClick() {
    gapi.auth2.getAuthInstance().signOut();
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
    this.authorizeButton.onclick = this.handleAuthClick.bind(this);
    this.deauthorizeButton.onclick = () => {
      if (
        confirm(
          'Are you sure you want to deauthorize the current Google account? Do not do this unless you know exactly what you are doing.'
        )
      )
        this.handleDeauthClick();
    };
  }

  updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      this.authorizeButton.hidden = true;
      this.deauthorizeButton.hidden = false;
      // document.querySelector('#pills-sheet-tab').classList.remove('disabled');
      // document.querySelector('#pills-sheet-tab').click();
      document.querySelector('#oauth-desc').innerText = ``;
      document.querySelector('#login-card').hidden = false;
    } else {
      this.authorizeButton.hidden = false;
      this.deauthorizeButton.hidden = true;
      document.querySelector('#login-card').hidden = true;
      document.querySelector('#oauth-desc').innerText =
        'Make sure to authorize a Google account that has access to the shared drive to be able to log your hours to the Google Tracking Sheet';
    }
  }

  datesEqual(date1, date2) {
    return (
      date1.getDate() == date2.getDate() &&
      date1.getMonth() == date2.getMonth() &&
      date1.getFullYear() == date2.getFullYear()
    );
  }

  async renderTable(name) {
    this.tableBody.innerHTML = '';
    const peopleToday = await this.getHoursToday();
    console.log(peopleToday);

    if (peopleToday.length > 0) {
      for (const person of peopleToday) {
        const userHighlight = person.name == name ? ' style="background-color: yellow"' : '';
        this.tableBody.innerHTML += `<tr${userHighlight}>
          <th scope="person">${person.name}</th>
          <td>${person.lastAction}</td>
          <td>${person.calculatedHours}</td>
        </tr>`;
      }
    }
  }

  async getHoursToday() {
    const result = await this.sheetToObject('HoursToday!A1:E');
    const out = [];
    for (const person of result) {
      if (person.name != '') {
        out.push(person);
      }
    }
    return out;
  }

  camelize(str) {
    if (str === '') {
      return '';
    } else {
      let splitString = str
        .replace(/[^A-Z0-9]/gi, '_')
        .split('_')
        .join('');

      return splitString.charAt(0).toLowerCase() + splitString.slice(1);
    }
  }

  noop([...args]) {}

  async sheetToObject(range) {
    const { result } = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this.SPREADSHEET_ID,
      range,
    });
    const headers = result.values.shift();
    const out = [];

    // Fix header formatting and make it serializable
    for (let i = 0; i < headers.length; i++) {
      headers[i] = this.camelize(headers[i]);
    }

    for (const row of result.values) {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        try {
          obj[headers[i]] = row[i];
        } catch(err) {
          // Handler just in case accessing values that don't exist
          this.noop(err);
        }
      }
      out.push(obj);
    }

    return out;
  }
}

window.LogManager = LogManager;
