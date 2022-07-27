document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');


  // Send Mail
  document.querySelector('#compose-form').onsubmit = () => {

    // get inputs from user
    const recipients = document.querySelector('#compose-recipients').value
    const subject = document.querySelector('#compose-subject').value
    const body = document.querySelector('#compose-body').value

    // send post request to api to send email
    fetch('/emails', {  
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
      .then(response => response.json())
      .then(result => {
        if (result.error !== undefined) {
          load_mailbox('sent', result.error);
        } else {
          load_mailbox('sent', result.message);
        }
      });
    return false;
  };
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox, message) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // when mailbox sent hide archive button
  if (mailbox === 'sent') {
    document.querySelector('#button').style.display = 'none';
  }

  // else show it
  else {
    document.querySelector('#button').style.display = 'block';
  }

  // Show Mailbox content
  // get emails from api
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        
        // for each email create div 
        const element = document.createElement('div');
        element.className = "border border-dark p-3 w";
        element.innerHTML = `<strong>${email.sender}</strong>
                        <span class="ml-2">${email.subject}</span>
                        <span class="ml-5">${email.timestamp}</span>`;
        
        // if read is true make color gray
        if (email.read === true) {
          element.style.backgroundColor = "#cccccc";
        }
        
        // add event listner to each email
        element.onclick = () => {
          
          // if email is not read
          if (email.read === false) {

            // when the email clicked update read to true
            // update the value by calling api
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: true
              })
            })
          }
          
          // if the email clicked show email page
          // get email informotion from api
          fetch(`/emails/${email.id}`)
            .then(response => response.json())
            .then(emaill => {
              
              // update innerhtml to requested email
              document.querySelector('#from').innerHTML = emaill.sender;
              document.querySelector('#to').innerHTML = emaill.recipients[0];
              document.querySelector('#subject').innerHTML = emaill.subject;
              document.querySelector('#time').innerHTML = emaill.timestamp;
              document.querySelector('#body').innerHTML = emaill.body;

              // show email page and hide the others
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'none';
              document.querySelector('#email-view').style.display = 'block';


              // Archive and Unarchive
              // get button 
              const button = document.querySelector('#button');
              var i; var j; var a;
              
              // if the email is not archived make the button archive one
              if (emaill.archived === false) {
                var i = 'Archive';
                var j = 'btn btn-info';
                var a = true;
              }
              
              // if the email is archived make the button archive one
              else {
                var i = 'Unarchive';
                var j = 'btn btn-danger';
                var a = false;
              }

              // make button Archive one
              button.innerHTML = i;
              button.className = j;
              
              // when the button clicked archive the email
              button.onclick = () => {
                fetch(`/emails/${emaill.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    archived: a
                  })
                  
                })
                  .then(() => { load_mailbox('inbox') } );
              }
              
              
              // Replay
              document.querySelector('#replay').onclick = () => {

                // update email recipient
                document.querySelector('#compose-recipients').value = emaill.sender;

                // update email subject
                // if email subject begin with (Re:) update it to be subject alone
                if (emaill.subject[0] === "R" && emaill.subject[1] === "e" && emaill.subject[2] === ":") {
                  document.querySelector('#compose-subject').value = emaill.subject;
                }

                // if email subject don't being with (Re:) update it to be subject with (Re:)
                else {
                  document.querySelector('#compose-subject').value = `Re: ${emaill.subject}`;
                }

                // update email body
                document.querySelector('#compose-body').value = `On ${emaill.timestamp} ${emaill.sender} wrote: ${emaill.body}`;
                
                // show compose page and hide the others
                document.querySelector('#emails-view').style.display = 'none';
                document.querySelector('#compose-view').style.display = 'block';
                document.querySelector('#email-view').style.display = 'none';
              }
            }); 
        }
        // append elements to html div
        document.querySelector('#emails-view').append(element);
      });
    });

  
  // if there is no message
  if (message === undefined) {

    // show page
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  }

  // if email sent successfully 
  else if (message === "Email sent successfully.") {

    // show message says success
    document.querySelector('#emails-view').innerHTML = `<strong class="text-success h2">${message}</strong><h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  }
    
  // if there is error
  else {

    // show error
    document.querySelector('#emails-view').innerHTML = `<strong class="text-danger h2">${message}</strong><h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  }
}