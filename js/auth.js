const SPREADSHEET_ID = '1GEkN-CR8aFFLnDy-ZKuhokI3azK-ygSEJp4Q6y2E2pg';
const CLIENT_ID = '938209231565-tlsrper5vjdaboo8qghjfu3tpgqqbajk.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDKscGpqmGmB8DlAPJuA0jGGOfB9tA4FKg';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
var DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
var authorizeButton;
var signoutButton;
var pre;

function readSheet() {
  pre.innerHTML = nameInput.value;
  console.log('I hit a button. Hi.');
  list();
}

function handleClientLoad() {
  //initialize the Google API
  authorizeButton = document.getElementById('authorize_button');
  signoutButton = document.getElementById('signout_button');
  pre = document.getElementById('content');
  gapi.load('client:auth2', this.initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(
      function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function(error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    document.querySelector('#pills-qr-tab').click();
    // nameInput.value = 'Ayla C'; //just for testing
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function appendPre(date, member, today) {
  pre.innerHTML += `<tr>
    <th scope="row">${date}</th>
    <td>${member}</td>
    <td>${today}</td>
  </tr>`;
}

function list() {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'FormResponses!A2:B',
    })
    .then(
      function(response) {
        var range = response.result;
        if (range.values.length > 0) {
          var thisDay = new Date();
          thisDay.setHours(0, 0, 0, 0);

          for (i = 0; i < range.values.length; i++) {
            var row = range.values[i];

            // Print columns A and B, which correspond to indices 0 and 1.
            if (row[1] == nameInput.value) {
              var activeDate = new Date(Date.parse(row[0]));
              activeDate.setHours(0, 0, 0, 0);
              if (equalDates(thisDay, activeDate)) {
                appendPre(row[0], row[1], " TODAY");
              } else {
                appendPre(row[0], row[1]);
              }
            }
          }
        } else {
          appendPre('No data found.');
        }
      },
      function(response) {
        appendPre('Error: ' + response.result.error.message);
      }
    );
}

function equalDates(date1, date2) {
  return (
    date1.getDate() == date2.getDate() &&
    date1.getMonth() == date2.getMonth() &&
    date1.getFullYear() == date2.getFullYear()
  );
}
